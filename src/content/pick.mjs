// Decides exactly what gets posted today: which format/theme (from config.ROTATION),
// which caption-bank template (cycling so nothing repeats for weeks), and which real
// store data fills the {{placeholders}}. This is the one place "today's content" gets
// assembled into a single plain object that the carousel/reel/post modules consume.
import { ROTATION, STOREFRONT_BASE_URL, SPOTLIGHT_UNLOCK_STORE_COUNT } from '../config.mjs'
import { CAPTION_BANK } from './captionBank.mjs'
import { getActiveBusinesses, getCategories, getProductCountsByBusiness, getProductImages } from '../data/firestore.mjs'

/** ISO week number — used as a stable, ever-increasing counter so the template/business
 *  picked for a given theme cycles forward every week instead of repeating or picking
 *  randomly (random can accidentally repeat the same store two weeks running). */
function isoWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
}

function fillPlaceholders(text, data) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? '')
}

function storefrontLink(business) {
  return `${STOREFRONT_BASE_URL}/${business.slug ?? business.id}`
}

/** Picks a business to feature today, cycling through all active businesses so the same
 *  one isn't used two days running. Used for feature_highlight / problem_solution visuals
 *  and (once unlocked) store_spotlight. */
function pickBusiness(businesses, offset) {
  if (businesses.length === 0) return null
  return businesses[offset % businesses.length]
}

/** Builds a human-readable category label for a business from its categoryIds array. */
function categoryLabel(business, categoriesById) {
  const ids = business.categoryIds ?? (business.categoryId ? [business.categoryId] : [])
  const names = ids.map((id) => categoriesById.get(id)).filter(Boolean)
  return names.length ? names.join(' · ') : 'handmade & small-business'
}

/**
 * Returns today's ready-to-post content object, or null on an off day (Sunday).
 *
 * Shape:
 *   { date, dayName, format: 'post'|'carousel'|'reel', theme, caption, hashtags,
 *     slides?: string[],              // carousel only
 *     onScreenText?: string[],        // reel only
 *     voiceover?: string[],           // reel only
 *     images: string[],               // real product photos to use, when available
 *     link: string,                   // the featured store's storefront URL
 *     business: {...} | null }        // the real business record behind this post, if any
 *
 * @param {Object} [opts]
 * @param {Date}   [opts.now] — override "today" (used by local tests).
 * @param {Object} [opts.manualOverride] — { businessId } to force-feature a specific
 *   store today instead of the auto-picked one (the "manual content" option Maria asked
 *   for — wired up from the approval dashboard).
 */
export async function pickTodaysContent(opts = {}) {
  const now = opts.now ?? new Date()
  const dayOfWeek = now.getDay()
  const slot = ROTATION[dayOfWeek]
  if (!slot) return null // Sunday — off

  const week = isoWeekNumber(now)
  const [businesses, categoriesById, productCounts] = await Promise.all([
    getActiveBusinesses(),
    getCategories(),
    getProductCountsByBusiness(),
  ])

  // Spotlight override: once there are enough stores, and it's Friday (feature day),
  // swap in the store_spotlight theme roughly once a week instead of the generic
  // feature_highlight content — see README "How the store spotlight works".
  let theme = slot.theme
  let format = slot.format
  const spotlightReady = businesses.length >= SPOTLIGHT_UNLOCK_STORE_COUNT
  const isSpotlightDay = dayOfWeek === 5 // Friday
  if (opts.manualOverride || (spotlightReady && isSpotlightDay)) {
    theme = 'store_spotlight'
    format = 'reel'
  }

  const templates = CAPTION_BANK[theme]
  const template = templates[week % templates.length]

  // Pick the featured business: manual override wins, otherwise cycle deterministically
  // by week number so every active store gets a turn over time, with top-product-count
  // stores weighted toward spotlight once that's unlocked.
  let business = null
  if (opts.manualOverride?.businessId) {
    business = businesses.find((b) => b.id === opts.manualOverride.businessId) ?? null
  } else if (theme === 'store_spotlight') {
    const ranked = [...businesses].sort((a, b) => (productCounts.get(b.id) ?? 0) - (productCounts.get(a.id) ?? 0))
    business = pickBusiness(ranked.slice(0, 5), week)
  } else if (businesses.length > 0) {
    business = pickBusiness(businesses, week + dayOfWeek)
  }

  const images = business ? await getProductImages(business.id, 5) : []
  const link = business ? storefrontLink(business) : STOREFRONT_BASE_URL
  const placeholderData = business
    ? {
        storeName: business.name ?? 'this store',
        ownerName: business.ownerName ?? 'the owner',
        category: categoryLabel(business, categoriesById),
        link,
      }
    : { storeName: 'HerCommerce', ownerName: '', category: '', link }

  const caption = fillPlaceholders(template.caption, placeholderData)
  const result = {
    date: now.toISOString().slice(0, 10),
    dayName: now.toLocaleDateString('en-US', { weekday: 'long' }),
    format,
    theme,
    caption,
    hashtags: template.hashtags,
    images,
    link,
    business,
  }
  if (template.slides) result.slides = template.slides.map((s) => fillPlaceholders(s, placeholderData))
  if (template.onScreenText) result.onScreenText = template.onScreenText.map((s) => fillPlaceholders(s, placeholderData))
  if (template.voiceover) result.voiceover = template.voiceover.map((s) => fillPlaceholders(s, placeholderData))
  return result
}
