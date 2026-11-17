// Pure helpers for the reel voiceover — no network, no ffmpeg, so they are unit-testable.
//
// Problems these fix (all were audible in posted reels):
//  1. Store/owner names and categories are filled into Urdu lines in Latin letters
//     ("Glow Boutique"). The Urdu neural voice spells Latin text out letter by letter and
//     garbles it, so Latin runs are now spoken by an English voice and Urdu runs by the
//     Urdu voice, then joined.
//  2. Scenes were timed by splitting the total voiceover evenly, but reels have a different
//     number of scenes than voiceover lines (4 scenes / 3 lines, 3 scenes / 2 lines), so
//     the on-screen text drifted away from what was being said. Scene lengths are now
//     derived from the real duration of each spoken line.
//  3. Symbols that TTS reads literally ("·", "&", "…", "—") are normalised to pauses/words.

export const URDU_VOICE = 'ur-PK-UzmaNeural'
// Indian English reads Pakistani brand/store names far more naturally than US English.
export const ENGLISH_VOICE = 'en-IN-NeerjaNeural'

const LATIN = /[A-Za-z]/
const URDU = /[؀-ۿ]/

/** Cleans text so the TTS engine speaks it naturally. */
export function normalizeForSpeech(text) {
  return String(text ?? '')
    .replace(/\s*[·•|]\s*/g, '، ')
    .replace(/&/g, ' اور ')
    .replace(/[…]+/g, '،')
    .replace(/\s*[—–]\s*/g, '، ')
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}️‍]/gu, '') // emoji
    .replace(/\s+/g, ' ')
    .replace(/(،\s*){2,}/g, '، ')
    .trim()
}

/**
 * Splits a line into consecutive runs of Urdu-script vs Latin text so each run can be
 * voiced by the right language voice. Digits/punctuation/spaces stick to the run they sit in.
 * @returns {{text: string, lang: 'ur'|'en'}[]}
 */
export function splitByScript(text) {
  const clean = normalizeForSpeech(text)
  const segments = []
  let current = null
  // Tokenise on whitespace so a word is never cut in the middle.
  for (const word of clean.split(' ').filter(Boolean)) {
    const lang = LATIN.test(word) ? 'en' : URDU.test(word) ? 'ur' : current?.lang ?? 'ur'
    if (current && current.lang === lang) current.text += ' ' + word
    else {
      current = { text: word, lang }
      segments.push(current)
    }
  }
  // An English name sitting between Urdu words reads better with the sentence's Urdu
  // punctuation attached to the Urdu side — nothing more to do; empty-safe.
  return segments.filter((s) => s.text.replace(/[،۔.,!?\s]/g, '').length > 0)
}

/**
 * Turns the real duration of each voiceover line into per-scene durations so on-screen
 * text changes exactly when the matching sentence is spoken.
 *  - same count:        scene i == line i
 *  - more lines:        neighbouring lines are merged into one scene
 *  - more scenes:       a line's time is shared by the scenes that belong to it
 * The sum of the result always equals the sum of the input.
 */
export function allocateSceneDurations(lineDurations, sceneCount) {
  const L = lineDurations.length
  if (sceneCount <= 0) return []
  if (L === 0) return Array(sceneCount).fill(0)
  if (L === sceneCount) return [...lineDurations]
  const out = Array(sceneCount).fill(0)
  if (L > sceneCount) {
    lineDurations.forEach((d, j) => {
      out[Math.min(sceneCount - 1, Math.floor((j * sceneCount) / L))] += d
    })
    return out
  }
  const owners = Array.from({ length: L }, () => [])
  for (let i = 0; i < sceneCount; i++) owners[Math.min(L - 1, Math.floor((i * L) / sceneCount))].push(i)
  owners.forEach((scenes, j) => {
    for (const i of scenes) out[i] = lineDurations[j] / scenes.length
  })
  return out
}
