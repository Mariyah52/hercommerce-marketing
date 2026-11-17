// Builds a complete, voiced-over Instagram/TikTok Reel (1080x1920, 9:16) with zero manual
// work: text-to-speech voiceover (edge-tts — free, no API key), text-over-gradient visual
// "scenes" rendered the same way as the carousel slides (Playwright), background music
// (optional, from assets/music/), and ffmpeg assembling it all into one MP4.
//
// Voice fixes (see voice.mjs for the reasoning):
//  - Urdu text is spoken by the Urdu voice, Latin text (store/owner names) by an English
//    voice, instead of the Urdu voice garbling Latin letters.
//  - Every line is retried if edge-tts hiccups, normalised to one audio format (the old
//    `-c copy` mp3 concat could click/skip), separated by a short natural pause, and the
//    final track is loudness-normalised so the voice is clear on phones.
//  - On-screen scenes are timed from each line's real duration, so text and speech match.
//  - The music bed no longer halves the voiceover volume (amix used to attenuate it).
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { renderSlides } from '../carousel/render.mjs'
import { URDU_VOICE, ENGLISH_VOICE, splitByScript, allocateSceneDurations } from './voice.mjs'

const execFileAsync = promisify(execFile)

const SCENE_SECONDS = 3.2 // fallback hold time when a reel has no voiceover
const LINE_GAP_SECONDS = 0.35 // natural pause after every spoken line
const TAIL_SECONDS = 0.8 // lets the last word finish before the reel ends
const TTS_RETRIES = 3
const SPEECH_RATE = '-6%' // a touch slower than default — clearer for Urdu on phone speakers

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** One edge-tts call (free Microsoft neural TTS, no API key), retried on transient failures. */
export async function synthesizeWithEdgeTts(text, voice, outPath) {
  let lastErr
  for (let attempt = 1; attempt <= TTS_RETRIES; attempt++) {
    try {
      await execFileAsync('edge-tts', ['--voice', voice, `--rate=${SPEECH_RATE}`, '--text', text, '--write-media', outPath])
      return
    } catch (err) {
      lastErr = err
      await sleep(1500 * attempt)
    }
  }
  throw new Error(`edge-tts failed after ${TTS_RETRIES} attempts for voice ${voice}: ${lastErr?.message ?? lastErr}`)
}

async function ffprobeDuration(file) {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file,
  ])
  return parseFloat(stdout.trim())
}

/** Writes an ffmpeg concat list file and joins same-format wavs losslessly. */
async function concatWavs(wavPaths, outPath) {
  const listFile = outPath + '.txt'
  await writeFile(listFile, wavPaths.map((p) => `file '${p}'`).join('\n'))
  await execFileAsync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', outPath])
}

/** Converts any audio file to the one canonical format (44.1kHz mono 16-bit wav). */
async function toCanonicalWav(input, outPath, { padSeconds = 0 } = {}) {
  const filters = padSeconds > 0 ? ['-af', `apad=pad_dur=${padSeconds}`] : []
  await execFileAsync('ffmpeg', ['-y', '-i', input, ...filters, '-ar', '44100', '-ac', '1', '-c:a', 'pcm_s16le', outPath])
}

/**
 * Voices one line: Urdu runs with the Urdu voice, Latin runs with the English voice,
 * joined into a single wav followed by a short pause.
 * @returns {Promise<{path: string, duration: number}>}
 */
export async function voiceLine(text, index, workDir, synthesize) {
  const segments = splitByScript(text)
  if (segments.length === 0) throw new Error(`Voiceover line ${index + 1} has nothing speakable: "${text}"`)
  const segWavs = []
  for (let s = 0; s < segments.length; s++) {
    const seg = segments[s]
    const mp3 = path.join(workDir, `vo-${index + 1}-${s + 1}.mp3`)
    await synthesize(seg.text, seg.lang === 'en' ? ENGLISH_VOICE : URDU_VOICE, mp3)
    const wav = path.join(workDir, `vo-${index + 1}-${s + 1}.wav`)
    await toCanonicalWav(mp3, wav)
    segWavs.push(wav)
  }
  const joined = path.join(workDir, `vo-${index + 1}-joined.wav`)
  if (segWavs.length === 1) await toCanonicalWav(segWavs[0], joined, { padSeconds: LINE_GAP_SECONDS })
  else {
    const raw = path.join(workDir, `vo-${index + 1}-raw.wav`)
    await concatWavs(segWavs, raw)
    await toCanonicalWav(raw, joined, { padSeconds: LINE_GAP_SECONDS })
  }
  return { path: joined, duration: await ffprobeDuration(joined) }
}

/** Renders each on-screen-text line as a 1080x1920 scene PNG. */
async function renderScenes(onScreenText, images, outDir) {
  return renderSlides(onScreenText, { outDir, prefix: 'scene', images, centered: true, reelAspect: true })
}

/**
 * Builds one finished reel MP4 from a content object (as returned by pickTodaysContent
 * with format: 'reel').
 * @param {Object} content — { onScreenText, voiceover, images, date, theme }
 * @param {Object} [opts]
 * @param {string} [opts.outDir] — defaults to ./output/reels
 * @param {string} [opts.musicPath] — optional background music file to duck under the voiceover
 * @param {Function} [opts.synthesize] — (text, voice, outPath) => Promise; defaults to edge-tts
 *   (injectable so tests can run without network access)
 * @param {Function} [opts.renderScenes] — injectable scene renderer for tests
 * @returns {Promise<string>} path to the finished MP4
 */
export async function buildReel(content, opts = {}) {
  const outDir = opts.outDir ?? path.join(process.cwd(), 'output', 'reels')
  const workDir = path.join(outDir, `_work-${content.date ?? Date.now()}`)
  await mkdir(workDir, { recursive: true })
  const synthesize = opts.synthesize ?? synthesizeWithEdgeTts

  // 1. Voiceover — one wav per line (with its own pause), joined and loudness-normalised.
  const voiceoverLines = (content.voiceover ?? []).filter((l) => l && l.trim())
  const lines = []
  for (let i = 0; i < voiceoverLines.length; i++) lines.push(await voiceLine(voiceoverLines[i], i, workDir, synthesize))
  const lineDurations = lines.map((l) => l.duration)

  let voiceoverPath = null
  let voiceoverDuration = 0
  if (lines.length) {
    const joined = path.join(workDir, 'voiceover-raw.wav')
    await concatWavs(lines.map((l) => l.path), joined)
    voiceoverPath = path.join(workDir, 'voiceover.wav')
    // Consistent, phone-friendly loudness (-16 LUFS is the usual social-video target).
    await execFileAsync('ffmpeg', ['-y', '-i', joined, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', '-ac', '1', voiceoverPath])
    voiceoverDuration = await ffprobeDuration(voiceoverPath)
  }

  // 2. Scenes — on-screen text, each held exactly as long as its spoken line(s).
  const scenes = content.onScreenText ?? []
  const scenePaths = await (opts.renderScenes ?? renderScenes)(scenes, content.images ?? [], workDir)
  const sceneDurations = voiceoverPath
    ? allocateSceneDurations(lineDurations, scenes.length)
    : scenes.map(() => SCENE_SECONDS)
  // Loudnorm can shift length by a few ms; keep video >= audio and add a tail for the last word.
  sceneDurations[sceneDurations.length - 1] += TAIL_SECONDS

  // 3. Assemble: scene PNGs held for their own durations → silent video → mux audio.
  const concatListPath = path.join(workDir, 'scenes.txt')
  await writeFile(
    concatListPath,
    scenePaths.map((p, i) => `file '${p}'\nduration ${sceneDurations[i].toFixed(3)}`).join('\n') + `\nfile '${scenePaths.at(-1)}'\n`,
  )

  const silentVideoPath = path.join(workDir, 'silent.mp4')
  await execFileAsync('ffmpeg', [
    '-y', '-f', 'concat', '-safe', '0', '-i', concatListPath,
    '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', silentVideoPath,
  ])

  await mkdir(outDir, { recursive: true })
  const outPath = path.join(outDir, `reel-${content.date ?? 'draft'}.mp4`)
  const aac = ['-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-movflags', '+faststart']

  if (!voiceoverPath) {
    await execFileAsync('ffmpeg', ['-y', '-i', silentVideoPath, '-c', 'copy', '-movflags', '+faststart', outPath])
  } else if (!opts.musicPath) {
    await execFileAsync('ffmpeg', ['-y', '-i', silentVideoPath, '-i', voiceoverPath, '-c:v', 'copy', ...aac, '-shortest', outPath])
  } else {
    // Voice at full level, music bed at ~12%. amix halves every input, so the mix is
    // doubled back up (previously the voiceover came out at half volume whenever music was on).
    await execFileAsync('ffmpeg', [
      '-y', '-i', silentVideoPath, '-i', voiceoverPath, '-stream_loop', '-1', '-i', opts.musicPath,
      '-filter_complex',
      '[2:a]volume=0.12[music];[1:a][music]amix=inputs=2:duration=first:dropout_transition=0,volume=2,alimiter=limit=0.95[aout]',
      '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', ...aac, '-shortest', outPath,
    ])
  }

  await rm(workDir, { recursive: true, force: true })
  return outPath
}

// Local smoke test — only exercises the Playwright scene-rendering half (no TTS/ffmpeg
// network calls needed). Full pipeline tests with a fake TTS: `npm test`.
if (import.meta.url === `file://${process.argv[1]}`) {
  const scenes = ['Online business hai...', 'but sales nahi aa rahi? 😩', 'Her-Commerce try karo 💗']
  const paths = await renderScenes(scenes, [], path.join(process.cwd(), 'output', 'reel-scene-test'))
  console.log('Rendered reel scenes:', paths)
}
