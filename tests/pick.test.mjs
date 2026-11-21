import test from 'node:test'
import assert from 'node:assert/strict'
import { storeInstagramMention, storeHashtag, buildCreditLine } from '../src/content/pick.mjs'

test('valid handles are accepted, invalid ones rejected', () => {
  assert.equal(storeInstagramMention({ socialLinks: { instagram: '@moons.and.mittens' } }), '@moons.and.mittens')
  assert.equal(storeInstagramMention({ socialLinks: { instagram: 'https://instagram.com/sparklab123/' } }), '@sparklab123')
  assert.equal(storeInstagramMention({ socialLinks: { instagram: 'V&Crave' } }), '')
  assert.equal(storeInstagramMention({}), '')
})
test('hashtag and credit line', () => {
  assert.equal(storeHashtag('Rose Boutique'), '#RoseBoutique')
  const c = buildCreditLine({ name: 'Rose', socialLinks: { instagram: 'rose.shop' } }, 'https://x/y')
  assert.match(c, /@rose\.shop/); assert.match(c, /https:\/\/x\/y/)
})
