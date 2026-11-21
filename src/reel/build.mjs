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
import { buildVoiceover, sceneDurations } from './voice.mjs'

const execFileAsync = promisify(execFile)

const SCENE_SECONDS = 3.2 // how long each on-screen-text scene holds, before voiceover-driven trimming

// Voiceover (Urdu + English voices, pauses, volume levelling, retries) lives in ./voice.mjs.

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

  // 1. Voiceover — Urdu parts by the Urdu voice, English parts (brand/store names) by an
  //    English voice, joined with short pauses; see voice.mjs.
  const voiceoverLines = content.voiceover ?? []
  const { path: voiceoverPath, duration: voiceoverDuration, lineDurations } = voiceoverLines.length
    ? await buildVoiceover(voiceoverLines, workDir)
    : { path: null, duration: 0, lineDurations: [] }

  // 2. Scenes — on-screen text cards. When there are as many scenes as voiceover lines each
  //    scene stays exactly as long as its line is spoken; otherwise the time is shared evenly.
  const scenes = content.onScreenText ?? []
  const scenePaths = await renderScenes(scenes, content.images ?? [], workDir)
  const durations = voiceoverDuration > 0
    ? sceneDurations(scenes.length, lineDurations, voiceoverDuration)
    : scenes.map(() => SCENE_SECONDS)

  // 3. Assemble: each scene PNG held for its duration, concatenated into a silent video
  //    track, then the voiceover (and optional ducked music) muxed in.
  const concatListPath = path.join(workDir, 'scenes.txt')
  const { writeFile } = await import('node:fs/promises')
  await writeFile(concatListPath, scenePaths.map((p, i) => `file '${p}'\nduration ${durations[i].toFixed(3)}`).join('\n') + `\nfile '${scenePaths.at(-1)}'\n`)

  const silentVideoPath = path.join(workDir, 'silent.mp4')
  await execFileAsync('ffmpeg', [
    '-y', '-f', 'concat', '-safe', '0', '-i', concatListPath,
    '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', silentVideoPath,
  ])

  await mkdir(outDir, { recursive: true })
  const outPath = path.join(outDir, `reel-${content.date ?? 'draft'}.mp4`)
  if (!voiceoverPath && !opts.musicPath) {
    await execFileAsync('ffmpeg', ['-y', '-i', silentVideoPath, '-c', 'copy', outPath])
  } else if (!opts.musicPath) {
    await execFileAsync('ffmpeg', ['-y', '-i', silentVideoPath, '-i', voiceoverPath, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-shortest', outPath])
  } else if (!voiceoverPath) {
    await execFileAsync('ffmpeg', ['-y', '-i', silentVideoPath, '-stream_loop', '-1', '-i', opts.musicPath, '-filter_complex', '[1:a]volume=0.4[aout]', '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-shortest', outPath])
  } else {
    // Voiceover at full volume, music ducked under it and looped/trimmed to length.
    await execFileAsync('ffmpeg', [
      '-y', '-i', silentVideoPath, '-i', voiceoverPath, '-stream_loop', '-1', '-i', opts.musicPath,
      '-filter_complex', '[2:a]volume=0.18[music];[1:a][music]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[aout]',
      '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-shortest', outPath,
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
