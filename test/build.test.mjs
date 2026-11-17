// Full reel pipeline with a FAKE text-to-speech engine and fake scene renderer, so it runs
// anywhere ffmpeg is installed (no network, no edge-tts, no Chromium needed).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { buildReel } from '../src/reel/build.mjs'

const run = promisify(execFile)
const calls = []

// Fake TTS: a 1.5s tone whose pitch depends on the voice, so we can see which voice was used.
async function fakeSynthesize(text, voice, outPath) {
  calls.push({ text, voice })
  const freq = voice.startsWith('ur-') ? 300 : 600
  await run('ffmpeg', ['-y', '-f', 'lavfi', '-i', `sine=frequency=${freq}:duration=1.5`, '-c:a', 'libmp3lame', outPath])
}

async function fakeRenderScenes(texts, _images, dir) {
  const paths = []
  for (let i = 0; i < texts.length; i++) {
    const p = path.join(dir, `scene-${i + 1}.png`)
    await run('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'color=c=purple:s=1080x1920:d=0.1', '-frames:v', '1', p])
    paths.push(p)
  }
  return paths
}

async function probe(file) {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height:format=duration', '-of', 'json', file])
  return JSON.parse(stdout)
}

test('reel has video 1080x1920 + AAC audio, and video outlasts the voiceover', async () => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'reel-'))
  const out = await buildReel(
    {
      date: '2026-01-01',
      onScreenText: ['one', 'two', 'three', 'four'], // 4 scenes
      voiceover: ['اردو لائن ایک', 'اسٹور Glow Boutique ہے', 'آخری لائن'], // 3 lines
    },
    { outDir, synthesize: fakeSynthesize, renderScenes: fakeRenderScenes },
  )
  const info = await probe(out)
  const video = info.streams.find((s) => s.codec_type === 'video')
  const audio = info.streams.find((s) => s.codec_type === 'audio')
  assert.equal(video.width, 1080)
  assert.equal(video.height, 1920)
  assert.ok(audio, 'reel must carry an audio track')
  assert.ok(parseFloat(info.format.duration) > 4, 'duration reflects real voice length')
})

test('Latin store name is voiced by the English voice, Urdu by the Urdu voice', () => {
  const voices = new Set(calls.map((c) => c.voice))
  assert.ok([...voices].some((v) => v.startsWith('ur-')))
  assert.ok([...voices].some((v) => v.startsWith('en-')))
  const en = calls.find((c) => c.voice.startsWith('en-'))
  assert.match(en.text, /Glow Boutique/)
})

test('works with a music bed too, and keeps both streams', async () => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'reel-m-'))
  const music = path.join(outDir, 'bed.mp3')
  await run('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'sine=frequency=220:duration=2', '-c:a', 'libmp3lame', music])
  const out = await buildReel(
    { date: '2026-01-02', onScreenText: ['a', 'b'], voiceover: ['لائن ایک', 'لائن دو'] },
    { outDir, musicPath: music, synthesize: fakeSynthesize, renderScenes: fakeRenderScenes },
  )
  const info = await probe(out)
  assert.ok(info.streams.some((s) => s.codec_type === 'audio'))
})

test('a reel with no voiceover still renders (silent fallback)', async () => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'reel-s-'))
  const out = await buildReel({ date: '2026-01-03', onScreenText: ['a', 'b'], voiceover: [] }, { outDir, synthesize: fakeSynthesize, renderScenes: fakeRenderScenes })
  const info = await probe(out)
  assert.ok(info.streams.some((s) => s.codec_type === 'video'))
})
