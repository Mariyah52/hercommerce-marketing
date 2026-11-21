// Voiceover builder for reels — fixes the Urdu voice problems.
//
// What was going wrong before:
//  1. The brand was written "ہر کامرس" in Urdu script. In Urdu "ہر" is read "har" (= "every"),
//     so the voice said "har commerce" instead of "Her Commerce".
//  2. Store / owner / category names (filled in from Firestore for store-spotlight reels) are
//     written in English letters. The Urdu voice cannot read Latin letters properly, so those
//     words came out garbled or skipped.
//  3. Lines were joined with `-c copy` with no pause between them, so sentences ran together
//     and volume/format differences between clips could cause clicks.
//  4. One failed request to the free TTS service stopped the whole reel.
//
// How it works now:
//  - Each line is split into Urdu-script parts and Latin (English) parts.
//  - Urdu parts are spoken by the Urdu voice, English parts (brand, store names) by an
//    Indian-English voice, so both are pronounced correctly.
//  - Every part is converted to the same audio format, short pauses are put between parts
//    and lines, the volume is levelled, and failed requests are retried.
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

const execFileAsync = promisify(execFile)

export const URDU_VOICE = process.env.TTS_URDU_VOICE || 'ur-PK-UzmaNeural'
export const ENGLISH_VOICE = process.env.TTS_ENGLISH_VOICE || 'en-IN-NeerjaNeural'
const EDGE_TTS_BIN = process.env.EDGE_TTS_BIN || 'edge-tts'

const GAP_BETWEEN_PARTS = 0.06 // seconds, inside one line
const GAP_BETWEEN_LINES = 0.4 // seconds, between lines
export const TAIL_SECONDS = 0.5 // silence after the last word so it is never cut off

// "ہر کامرس" must be spoken as the English brand name "Her Commerce", not "har commerce".
const BRAND_URDU = /ہر\s*کامرس/g
const BRAND_SPOKEN = 'Her Commerce'

// Urdu LETTERS only — Urdu punctuation (۔ ، ؟ ؛) and digits are not letters, so a name like
// "Boutique۔" (English word + Urdu full stop) is still recognised as English.
const ARABIC_SCRIPT = /[ؠ-يٮ-ۓەۺ-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/
const LATIN = /[A-Za-z]/
const URDU_PUNCTUATION_TO_LATIN = { '۔': '.', '،': ',', '؟': '?', '؛': ';' }

/** Splits text into [{ text, lang: 'ur' | 'en' }] parts by script. Punctuation, digits and
 *  emoji stick to the part they follow; the brand written in Urdu becomes an English part. */
export function splitByScript(text) {
  const prepared = String(text ?? '').replace(BRAND_URDU, BRAND_SPOKEN)
  const tokens = prepared.split(/(\s+)/).filter((t) => t.length > 0)
  const parts = []
  let pendingNeutral = ''
  for (const token of tokens) {
    if (/^\s+$/.test(token)) {
      if (parts.length) parts[parts.length - 1].text += token
      else pendingNeutral += token
      continue
    }
    const hasLatin = LATIN.test(token)
    const hasUrdu = ARABIC_SCRIPT.test(token)
    if (!hasLatin && !hasUrdu) {
      // dash, ellipsis, digits only, emoji ... — belongs to whatever came before
      if (parts.length) parts[parts.length - 1].text += token
      else pendingNeutral += token
      continue
    }
    const lang = hasLatin && !hasUrdu ? 'en' : hasUrdu && !hasLatin ? 'ur' : 'ur'
    const last = parts[parts.length - 1]
    if (last && last.lang === lang) last.text += token
    else parts.push({ text: pendingNeutral + token, lang })
    pendingNeutral = ''
  }
  return parts
    .map((p) => ({
      ...p,
      text: (p.lang === 'en' ? p.text.replace(/[۔،؟؛]/g, (c) => URDU_PUNCTUATION_TO_LATIN[c]) : p.text).trim(),
    }))
    .filter((p) => p.text.length > 0 && (LATIN.test(p.text) || ARABIC_SCRIPT.test(p.text)))
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms))
}

/** One piece of speech -> mp3, retrying because the free service sometimes drops a request. */
async function synthesizePart(text, voice, outPath, attempts = 4) {
  const textFile = outPath + '.txt'
  await writeFile(textFile, text, 'utf8')
  let lastError
  for (let i = 1; i <= attempts; i++) {
    try {
      await execFileAsync(EDGE_TTS_BIN, ['--voice', voice, '--file', textFile, '--write-media', outPath])
      return
    } catch (err) {
      lastError = err
      await sleep(1000 * i)
    }
  }
  throw new Error(`Text-to-speech failed after ${attempts} tries (voice ${voice}): ${lastError?.message ?? lastError}`)
}

/** Any audio -> 44.1 kHz mono WAV so every piece has an identical format. */
async function toWav(inPath, outPath) {
  await execFileAsync('ffmpeg', ['-y', '-i', inPath, '-ar', '44100', '-ac', '1', '-c:a', 'pcm_s16le', outPath])
}

async function makeSilence(seconds, outPath) {
  await execFileAsync('ffmpeg', [
    '-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', String(seconds), '-c:a', 'pcm_s16le', outPath,
  ])
}

async function durationOf(file) {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file,
  ])
  return parseFloat(stdout.trim())
}

async function concatWavs(files, outPath) {
  const listFile = outPath + '.txt'
  await writeFile(listFile, files.map((f) => `file '${f}'`).join('\n'), 'utf8')
  await execFileAsync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', outPath])
}

/**
 * Builds the whole reel voiceover.
 * @param {string[]} lines — voiceover lines (Urdu script, with English words where needed)
 * @param {string} workDir — scratch folder
 * @returns {Promise<{ path: string, duration: number, lineDurations: number[] }>}
 *   `path` is a levelled mp3 that already ends with TAIL_SECONDS of silence;
 *   `lineDurations[i]` is how long line i lasts including the gap after it (the last one
 *   also includes the tail), so the on-screen scenes can be timed to the speech.
 */
export async function buildVoiceover(lines, workDir) {
  const gapPart = path.join(workDir, 'gap-part.wav')
  const gapLine = path.join(workDir, 'gap-line.wav')
  const tail = path.join(workDir, 'tail.wav')
  await makeSilence(GAP_BETWEEN_PARTS, gapPart)
  await makeSilence(GAP_BETWEEN_LINES, gapLine)
  await makeSilence(TAIL_SECONDS, tail)

  const allFiles = []
  const lineDurations = []
  for (let li = 0; li < lines.length; li++) {
    const parts = splitByScript(lines[li])
    const lineFiles = []
    for (let pi = 0; pi < parts.length; pi++) {
      const base = path.join(workDir, `vo-${li + 1}-${pi + 1}`)
      await synthesizePart(parts[pi].text, parts[pi].lang === 'en' ? ENGLISH_VOICE : URDU_VOICE, base + '.mp3')
      await toWav(base + '.mp3', base + '.wav')
      if (pi > 0) lineFiles.push(gapPart)
      lineFiles.push(base + '.wav')
    }
    const isLast = li === lines.length - 1
    lineFiles.push(isLast ? tail : gapLine)

    let seconds = 0
    for (const f of lineFiles) seconds += await durationOf(f)
    lineDurations.push(seconds)
    allFiles.push(...lineFiles)
  }

  if (allFiles.length === 0) return { path: null, duration: 0, lineDurations: [] }

  const joined = path.join(workDir, 'voiceover-joined.wav')
  await concatWavs(allFiles, joined)

  // Level the volume so the Urdu and English voices sound equally loud.
  const finalPath = path.join(workDir, 'voiceover.mp3')
  await execFileAsync('ffmpeg', [
    '-y', '-i', joined, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '128k', finalPath,
  ])
  return { path: finalPath, duration: await durationOf(finalPath), lineDurations }
}

/**
 * Decides how long each on-screen scene stays, so text changes together with the speech.
 * Same number of scenes and lines -> each scene lasts exactly as long as its line.
 * Different numbers -> the total time is shared out evenly.
 */
export function sceneDurations(sceneCount, lineDurations, total) {
  if (sceneCount <= 0) return []
  if (lineDurations.length === sceneCount) return lineDurations
  return Array.from({ length: sceneCount }, () => total / sceneCount)
}
