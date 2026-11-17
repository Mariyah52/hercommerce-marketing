import { test } from 'node:test'
import assert from 'node:assert/strict'
import { splitByScript, normalizeForSpeech, allocateSceneDurations } from '../src/reel/voice.mjs'

test('Urdu-only line is a single Urdu segment', () => {
  const segs = splitByScript('اپنا اسٹور بالکل فری میں بنائیں۔')
  assert.equal(segs.length, 1)
  assert.equal(segs[0].lang, 'ur')
})

test('Latin store name inside an Urdu line is voiced separately by the English voice', () => {
  const segs = splitByScript('اس ہفتے کا اسپاٹ لائٹ ہے Glow Boutique۔')
  assert.deepEqual(segs.map((s) => s.lang), ['ur', 'en'])
  assert.equal(segs[1].text.startsWith('Glow Boutique'), true)
})

test('English name in the middle splits into ur / en / ur', () => {
  const segs = splitByScript('ملیے Ayesha Khan سے، جو اسٹور کے پیچھے ہیں۔')
  assert.deepEqual(segs.map((s) => s.lang), ['ur', 'en', 'ur'])
})

test('symbols that TTS reads literally are normalised', () => {
  const t = normalizeForSpeech('handmade & small-business · Cakes … Orders — sab 💗')
  assert.ok(!/[&·…—💗]/.test(t), t)
})

test('empty / punctuation-only segments are dropped', () => {
  assert.deepEqual(splitByScript('  ... '), [])
})

test('allocateSceneDurations: equal counts map 1:1', () => {
  assert.deepEqual(allocateSceneDurations([2, 3, 4], 3), [2, 3, 4])
})

test('allocateSceneDurations: more scenes than lines share a line\'s time (4 scenes / 3 lines)', () => {
  const out = allocateSceneDurations([3, 3, 3], 4)
  assert.equal(out.length, 4)
  assert.ok(Math.abs(out.reduce((a, b) => a + b, 0) - 9) < 1e-9)
  assert.ok(out.every((d) => d > 0))
})

test('allocateSceneDurations: more lines than scenes merges lines, total preserved', () => {
  const out = allocateSceneDurations([1, 2, 3, 4], 2)
  assert.deepEqual(out, [3, 7])
})

test('allocateSceneDurations: no voiceover → zeros', () => {
  assert.deepEqual(allocateSceneDurations([], 3), [0, 0, 0])
})
