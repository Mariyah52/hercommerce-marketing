// Builds a complete, voiced-over Instagram/TikTok Reel (1080x1920, 9:16) with zero manual
// work: text-to-speech voiceover (edge-tts — free, no API key), text-over-gradient visual
// "scenes" rendered the same way as the carousel slides (Playwright), background music
// (optional, from assets/music/), and ffmpeg assembling it all into one MP4.
//
// NOTE: edge-tts's backend (speech.platform.bing.com) and this needs ffmpeg — both work
// fine on a GitHub Actions runner's unrestricted network; the Cowork sandbox this repo
// was built in blocks the TTS backend, so full end-to-end reel generation can only be
// smoke-tested on Actions, not here. The Playwright scene-rendering half of this file
// reuses carousel/render.mjs and IS fully testable locally (see src/reel/build.mjs test
// block at the bottom).
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir, readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { renderSlides } from '../carousel/render.mjs'

const execFileAsync = promisify(execFile)

const SCENE_SECONDS = 3.2 // how long each on-screen-text scene holds, before voiceover-driven trimming

/** Runs edge-tts to synthesize one line of voiceover to an mp3. Free, no API key —
 *  Microsoft's public neural TTS. 'ur-PK-UzmaNeural' is the Urdu (Pakistan) female voice —
 *  Maria wants the reel voiceover to actually be spoken Urdu, not a Roman-Urdu-text-read-
 *  by-an-English-voice workaround.
 *
 *  IMPORTANT: this voice needs real Urdu/Nastaliq SCRIPT text (اردو), not Roman Urdu
 *  (Urdu spelled out in Latin letters, e.g. "Online business hai..."). Feeding it Roman
 *  Urdu is what made early reels sound garbled/like an unclear language — the voice tried
 *  to pronounce Latin letters using Urdu letter-by-letter rules. So captionBank.mjs's
 *  `voiceover` arrays are written in actual Urdu script; only the on-screen text
 *  (`onScreenText`, shown visually, not spoken) stays in Roman Urdu/English, since that's
 *  how HerCommerce's captions are normally written and read on screen. */
async function synthesizeVoiceoverLine(text, outPath, voice = 'ur-PK-UzmaNeural') {
  await execFileAsync('edge-tts', ['--voice', voice, '--text', text, '--write-media', outPath])
}

/** Concatenates several mp3 voiceover lines into one track with ffmpeg, returning its
 *  duration in seconds (used to size the video to match). */
async function concatAudio(mp3Paths, outPath) {
  const listFile = outPath + '.txt'
  const { writeFile } = await import('node:fs/promises')
  await writeFile(listFile, mp3Paths.map((p) => `file '${p}'`).join('\n'))
  await execFileAsync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', outPath])
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', outPath,
  ])
  return parseFloat(stdout.trim())
}

/** Renders each on-screen-text line as a 1080x1920 scene PNG (reusing the carousel
 *  template's visual language at Reels' aspect ratio instead of the feed's 4:5). */
async function renderScenes(onScreenText, images, outDir) {
  // renderSlides is written for 1080x1350; Reels need 1080x1920. We render through the
  // same template logic but at Reels' size by passing a taller viewport via opts.
  return renderSlides(onScreenText, { outDir, prefix: 'scene', images, centered: true, reelAspect: true })
}

/**
 * Builds one finished reel MP4 from a content object (as returned by pickTodaysContent
 * with format: 'reel').
 * @param {Object} content — { onScreenText, voiceover, images, date, theme }
 * @param {Object} [opts]
 * @param {string} [opts.outDir] — defaults to ./output/reels
 * @param {string} [opts.musicPath] — optional background music file to duck under the voiceover
 * @returns {Promise<string>} path to the finished MP4
 */
export async function buildReel(content, opts = {}) {
  const outDir = opts.outDir ?? path.join(process.cwd(), 'output', 'reels')
  const workDir = path.join(outDir, `_work-${content.date ?? Date.now()}`)
  await mkdir(workDir, { recursive: true })

  // 1. Voiceover — one mp3 per line, concatenated.
  const voiceoverLines = content.voiceover ?? []
  const mp3Paths = []
  for (let i = 0; i < voiceoverLines.length; i++) {
    const p = path.join(workDir, `vo-${i + 1}.mp3`)
    await synthesizeVoiceoverLine(voiceoverLines[i], p)
    mp3Paths.push(p)
  }
  const voiceoverPath = path.join(workDir, 'voiceover.mp3')
  const voiceoverDuration = mp3Paths.length ? await concatAudio(mp3Paths, voiceoverPath) : 0

  // 2. Scenes — on-screen text cards, timed to split the voiceover's total duration
  //    evenly (falls back to SCENE_SECONDS each if there's no voiceover timing yet).
  const scenes = content.onScreenText ?? []
  const scenePaths = await renderScenes(scenes, content.images ?? [], workDir)
  const perSceneSeconds = voiceoverDuration > 0 ? voiceoverDuration / scenes.length : SCENE_SECONDS

  // 3. Assemble: each scene PNG held for perSceneSeconds, concatenated into a silent
  //    video track, then the voiceover (and optional ducked music) muxed in.
  const concatListPath = path.join(workDir, 'scenes.txt')
  const { writeFile } = await import('node:fs/promises')
  await writeFile(concatListPath, scenePaths.map((p) => `file '${p}'\nduration ${perSceneSeconds}`).join('\n') + `\nfile '${scenePaths.at(-1)}'\n`)

  const silentVideoPath = path.join(workDir, 'silent.mp4')
  await execFileAsync('ffmpeg', [
    '-y', '-f', 'concat', '-safe', '0', '-i', concatListPath,
    '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', silentVideoPath,
  ])

  await mkdir(outDir, { recursive: true })
  const outPath = path.join(outDir, `reel-${content.date ?? 'draft'}.mp4`)
  const audioInputs = []
  if (voiceoverDuration > 0) audioInputs.push('-i', voiceoverPath)
  if (opts.musicPath) audioInputs.push('-i', opts.musicPath)

  if (audioInputs.length === 0) {
    await execFileAsync('ffmpeg', ['-y', '-i', silentVideoPath, '-c', 'copy', outPath])
  } else if (!opts.musicPath) {
    await execFileAsync('ffmpeg', ['-y', '-i', silentVideoPath, '-i', voiceoverPath, '-c:v', 'copy', '-c:a', 'aac', '-shortest', outPath])
  } else {
    // Voiceover at full volume, music ducked under it (-15dB) and looped/trimmed to length.
    await execFileAsync('ffmpeg', [
      '-y', '-i', silentVideoPath, '-i', voiceoverPath, '-stream_loop', '-1', '-i', opts.musicPath,
      '-filter_complex', '[2:a]volume=0.18[music];[1:a][music]amix=inputs=2:duration=first[aout]',
      '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-shortest', outPath,
    ])
  }

  await rm(workDir, { recursive: true, force: true })
  return outPath
}

// Local smoke test — only exercises the Playwright scene-rendering half (no TTS/ffmpeg
// network calls needed), so it runs inside the Cowork sandbox to catch template bugs
// before relying on GitHub Actions for the full audio+video pipeline.
if (import.meta.url === `file://${process.argv[1]}`) {
  const scenes = ['Online business hai...', 'but sales nahi aa rahi? 😩', 'Her-Commerce try karo 💗']
  const paths = await renderScenes(scenes, [], path.join(process.cwd(), 'output', 'reel-scene-test'))
  console.log('Rendered reel scenes:', paths)
}
