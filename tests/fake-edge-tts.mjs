#!/usr/bin/env node
// Stand-in for the `edge-tts` command so the voiceover pipeline can be tested without
// internet. Makes a tone whose length depends on the text length, and records the voice used.
import { readFileSync, appendFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const a = process.argv.slice(2)
const get = (k) => a[a.indexOf(k) + 1]
const text = readFileSync(get('--file'), 'utf8')
const out = get('--write-media')
if (process.env.FAKE_TTS_FAIL_FIRST && !process.env.FAKE_TTS_STATE) {
  // fail the very first call once to prove retries work
  const marker = out + '.failed-once'
  try { readFileSync('/tmp/fake-tts-failed') } catch { appendFileSync('/tmp/fake-tts-failed', '1'); process.exit(1) }
}
appendFileSync(process.env.FAKE_TTS_LOG || '/dev/null', JSON.stringify({ voice: get('--voice'), text }) + '\n')
const seconds = Math.max(0.3, text.length * 0.05)
execFileSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', `sine=frequency=440:duration=${seconds}`, '-c:a', 'libmp3lame', out], { stdio: 'ignore' })
