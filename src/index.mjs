// Entry point run once a day by .github/workflows/daily-post.yml (`npm run run`).
// Picks today's content, builds the media, hosts it publicly, then posts it to
// Instagram + Facebook automatically and queues it as a private draft on TikTok for
// Maria's one-tap approval — exactly the split she asked for.
//
// DRY_RUN=1 skips hosting/posting and just writes the generated media + a content.json
// summary to ./output — used for local smoke tests (no tokens, no network needed beyond
// Firestore) and for manually inspecting what a given day would have posted.
import { pickTodaysContent } from './content/pick.mjs'
import { renderSlides } from './carousel/render.mjs'
import { buildReel } from './reel/build.mjs'
import { hostMediaPublicly } from './post/hostMedia.mjs'
import { postInstagramImage, postInstagramCarousel, postInstagramReel, postFacebookPagePhoto, postFacebookPageVideo } from './post/meta.mjs'
import { queueTikTokDraft } from './post/tiktok.mjs'
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const DRY_RUN = process.env.DRY_RUN === '1'

async function findMusicTrack() {
  // Optional — see assets/music/README.md. If Maria never adds a track, reels just post
  // with voiceover only, which is already what she asked for ("reels voiceover k sath ho").
  try {
    const { readdir } = await import('node:fs/promises')
    const files = (await readdir(path.join(process.cwd(), 'assets', 'music'))).filter((f) => f.endsWith('.mp3'))
    if (files.length === 0) return null
    const track = files[Math.floor(Math.random() * files.length)]
    return path.join(process.cwd(), 'assets', 'music', track)
  } catch {
    return null
  }
}

async function main() {
  const manualOverride = process.env.MANUAL_OVERRIDE_BUSINESS_ID
    ? { businessId: process.env.MANUAL_OVERRIDE_BUSINESS_ID }
    : undefined

  const content = await pickTodaysContent({ manualOverride })
  if (!content) {
    console.log('Off day (Sunday) — nothing to post.')
    return
  }
  console.log(`Today: ${content.dayName} — format=${content.format} theme=${content.theme}`)

  const outDir = path.join(process.cwd(), 'output', content.date)
  await mkdir(outDir, { recursive: true })

  let localFiles = []
  if (content.format === 'carousel') {
    localFiles = await renderSlides(content.slides, { outDir, images: content.images, prefix: 'slide' })
  } else if (content.format === 'post') {
    // Single post: one on-brand image card using the caption's opening line as the hook.
    const hook = content.caption.split('\n')[0]
    localFiles = await renderSlides([hook], { outDir, images: content.images, prefix: 'post', centered: true })
  } else if (content.format === 'reel') {
    const musicPath = await findMusicTrack()
    const reelPath = await buildReel(content, { outDir, musicPath })
    localFiles = [reelPath]
  }

  await writeFile(path.join(outDir, 'content.json'), JSON.stringify({ ...content, business: content.business ? { id: content.business.id, name: content.business.name } : null }, null, 2))

  if (DRY_RUN) {
    console.log('DRY_RUN=1 — skipping hosting + posting. Generated:', localFiles)
    return
  }

  const publicUrls = await hostMediaPublicly(localFiles, { dateFolder: content.date })
  console.log('Hosted publicly:', publicUrls)

  if (content.format === 'carousel') {
    await postInstagramCarousel(publicUrls, content)
    await postFacebookPagePhoto(publicUrls[0], content) // FB post uses the cover slide
  } else if (content.format === 'post') {
    await postInstagramImage(publicUrls[0], content)
    await postFacebookPagePhoto(publicUrls[0], content)
  } else if (content.format === 'reel') {
    await postInstagramReel(publicUrls[0], content)
    await postFacebookPageVideo(publicUrls[0], content)
    await queueTikTokDraft(publicUrls[0], content)
  }

  console.log('Done — posted to Instagram + Facebook; TikTok queued for approval.')
}

main().catch((err) => {
  console.error('Daily post run failed:', err)
  process.exit(1)
})
