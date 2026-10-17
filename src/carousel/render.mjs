// Turns an array of slide texts into real PNG images (1080x1350 — Instagram's portrait
// 4:5, the best-performing aspect ratio for feed posts/carousels) using Playwright +
// the pre-installed Chromium. Pure local rendering — no network needed except when a
// real product photo URL is used as a slide background (fine on GitHub Actions; falls
// back to a plain gradient if the image can't load, e.g. when testing offline).
import { chromium } from 'playwright'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATE_PATH = path.join(__dirname, 'template.html')

// Two alternating brand gradients — warm pink → deep purple, HerCommerce's established
// women-empowerment palette (same family used across the storefront UI).
const GRADIENTS = [
  'linear-gradient(135deg, #ff6fa5 0%, #8b3a9e 100%)',
  'linear-gradient(135deg, #a63bb0 0%, #4a1e7c 100%)',
]

function buildSlideHtml(template, { text, index, total, imageUrl, centered, width, height }) {
  const dots = Array.from({ length: total }, (_, i) => `<div class="pdot${i === index ? ' active' : ''}"></div>`).join('')
  const fontSize = text.length > 60 ? 54 : text.length > 30 ? 62 : 76
  return template
    .replaceAll('{{WIDTH}}', String(width))
    .replaceAll('{{HEIGHT}}', String(height))
    .replaceAll('{{BACKGROUND}}', GRADIENTS[index % GRADIENTS.length])
    .replaceAll('{{BG_IMAGE_CSS}}', imageUrl ? `url('${imageUrl}')` : 'none')
    .replaceAll('{{BG_IMAGE_OPACITY}}', imageUrl ? '0.55' : '0')
    .replaceAll('{{FONT_SIZE}}', String(fontSize))
    .replaceAll('{{ALIGN_CLASS}}', centered ? 'center' : '')
    .replaceAll('{{CTA_DISPLAY}}', index === total - 1 ? 'block' : 'none')
    .replaceAll('{{DOTS_HTML}}', dots)
    .replaceAll('{{SLIDE_TEXT}}', escapeHtml(text))
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Renders each string in `texts` as its own 1080x1350 slide PNG.
 * @param {string[]} texts
 * @param {Object} [opts]
 * @param {string[]} [opts.images] — optional product-photo URLs, one per slide (cycled
 *   if fewer than texts.length), shown as a dimmed background behind the text.
 * @param {string}  [opts.outDir] — defaults to ./output/carousel
 * @param {string}  [opts.prefix] — filename prefix, e.g. 'post' for single-image days.
 * @param {boolean} [opts.centered] — center-align text (used for single-post/quote slides).
 * @param {boolean} [opts.reelAspect] — render at 1080x1920 (9:16, Reels/Stories) instead
 *   of the default 1080x1350 (4:5, feed posts/carousels).
 * @returns {Promise<string[]>} absolute paths of the written PNGs, in order.
 */
export async function renderSlides(texts, opts = {}) {
  const outDir = opts.outDir ?? path.join(process.cwd(), 'output', 'carousel')
  await mkdir(outDir, { recursive: true })
  const template = await readFile(TEMPLATE_PATH, 'utf8')
  const prefix = opts.prefix ?? 'slide'
  const viewport = opts.reelAspect ? { width: 1080, height: 1920 } : { width: 1080, height: 1350 }

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport })
    const paths = []
    for (let i = 0; i < texts.length; i++) {
      const imageUrl = opts.images?.length ? opts.images[i % opts.images.length] : null
      const html = buildSlideHtml(template, {
        text: texts[i],
        index: i,
        total: texts.length,
        imageUrl,
        centered: opts.centered ?? texts.length === 1,
        width: viewport.width,
        height: viewport.height,
      })
      await page.setContent(html, { waitUntil: imageUrl ? 'networkidle' : 'load' })
      const outPath = path.join(outDir, `${prefix}-${i + 1}.png`)
      await page.screenshot({ path: outPath })
      paths.push(outPath)
    }
    return paths
  } finally {
    await browser.close()
  }
}

// Local smoke test: `node src/carousel/render.mjs` renders sample slides with no network
// dependency, so it works inside the Cowork sandbox and confirms the template is sound
// before relying on it from GitHub Actions.
if (import.meta.url === `file://${process.argv[1]}`) {
  const sample = [
    'Apna online business 5 steps mein shuru karo 💗',
    '1️⃣ HerCommerce pe free account banao',
    '2️⃣ Apni category choose karo',
  ]
  const paths = await renderSlides(sample, { outDir: path.join(process.cwd(), 'output', 'carousel-test') })
  await writeFile(
    path.join(process.cwd(), 'output', 'carousel-test', 'README.txt'),
    'Smoke test render — open these PNGs to confirm the carousel template looks right.\n',
  )
  console.log('Rendered:', paths)
}
