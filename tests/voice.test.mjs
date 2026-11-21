import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const log = path.join(await mkdtemp(path.join(tmpdir(), 'ttslog-')), 'calls.jsonl')
process.env.EDGE_TTS_BIN = path.join(here, 'fake-edge-tts.mjs')
process.env.FAKE_TTS_LOG = log
const { splitByScript, buildVoiceover, sceneDurations } = await import('../src/reel/voice.mjs')

test('Urdu brand name "ہر کامرس" is spoken as English "Her Commerce", not "har"', () => {
  const parts = splitByScript('ہر کامرس سے اپنا بزنس آسانی سے منیج کریں۔')
  assert.deepEqual(parts.map((p) => p.lang), ['en', 'ur'])
  assert.equal(parts[0].text, 'Her Commerce')
})

test('English store and owner names inside an Urdu line get their own English part', () => {
  const parts = splitByScript('اس ہفتے کا اسپاٹ لائٹ ہے Rose Boutique۔')
  assert.deepEqual(parts.map((p) => p.lang), ['ur', 'en'])
  assert.equal(parts[1].text, 'Rose Boutique.')
})

test('name in the middle of a sentence keeps the sentence order', () => {
  const parts = splitByScript('ملیے Ayesha Khan سے، جو Rose Boutique کے پیچھے ہیں۔')
  assert.deepEqual(parts.map((p) => p.lang), ['ur', 'en', 'ur', 'en', 'ur'])
  assert.deepEqual(parts.map((p) => p.text), ['ملیے', 'Ayesha Khan', 'سے، جو', 'Rose Boutique', 'کے پیچھے ہیں۔'])
})

test('pure Urdu line stays one Urdu part; dashes/ellipsis do not create empty parts', () => {
  const parts = splitByScript('آن لائن بزنس ہے… لیکن سیلز نہیں آ رہیں؟')
  assert.equal(parts.length, 1)
  assert.equal(parts[0].lang, 'ur')
  assert.equal(splitByScript('— … 🎉').length, 0)
})

test('sceneDurations follows the speech when counts match, else shares evenly', () => {
  assert.deepEqual(sceneDurations(3, [1, 2, 3], 6), [1, 2, 3])
  assert.deepEqual(sceneDurations(4, [1, 2, 3], 8), [2, 2, 2, 2])
})

test('buildVoiceover: right voice per part, pauses, retry on failure, tail silence', async () => {
  const work = await mkdtemp(path.join(tmpdir(), 'vo-'))
  process.env.FAKE_TTS_FAIL_FIRST = '1'
  const lines = ['ہر کامرس پر سب ایک ہی جگہ۔', 'اس ہفتے کا اسپاٹ لائٹ ہے Rose Boutique۔']
  const r = await buildVoiceover(lines, work)
  assert.ok(r.path.endsWith('voiceover.mp3'))
  assert.equal(r.lineDurations.length, 2)
  assert.ok(Math.abs(r.lineDurations.reduce((a, b) => a + b, 0) - r.duration) < 0.4, 'durations add up to the track length')
  assert.ok(r.lineDurations[1] > 0.5, 'last line includes the tail silence')
  const calls = (await readFile(log, 'utf8')).trim().split('\n').map((l) => JSON.parse(l))
  const voices = calls.map((c) => c.voice)
  assert.ok(voices.includes('en-IN-NeerjaNeural') && voices.includes('ur-PK-UzmaNeural'))
  assert.ok(calls.some((c) => c.voice === 'en-IN-NeerjaNeural' && c.text === 'Her Commerce'))
  assert.ok(calls.some((c) => c.voice === 'en-IN-NeerjaNeural' && c.text.startsWith('Rose Boutique')))
  assert.ok(!calls.some((c) => c.voice === 'ur-PK-UzmaNeural' && /[A-Za-z]/.test(c.text)), 'Urdu voice never receives Latin letters')
  await rm(work, { recursive: true, force: true })
})
