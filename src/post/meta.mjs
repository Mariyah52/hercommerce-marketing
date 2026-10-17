// Posts directly to Instagram (Business/Creator account) and Facebook (Page) via the
// free Meta Graph API. No app review is needed for this: a Meta Developer app with
// Maria added as an "Instagram tester" / the Page's admin can publish to her own
// accounts immediately — see README.md "Setting up Instagram + Facebook posting".
//
// Images/reels must be publicly fetchable URLs for the Graph API to ingest (it downloads
// them itself) — so this module first uploads each local file to a scratch public host
// (GitHub itself: the workflow commits generated media to the repo's `output/` dir as a
// build artifact / raw.githubusercontent.com URL) before calling the Graph API. See
// index.mjs for how the publish URL is produced.
const GRAPH_VERSION = 'v21.0'
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`

function requireEnv(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var ${name} — see README "Setting up secrets".`)
  return v
}

async function graphPost(path, params) {
  const url = `${GRAPH_BASE}/${path}`
  const res = await fetch(url, { method: 'POST', body: new URLSearchParams(params) })
  const json = await res.json()
  if (!res.ok || json.error) {
    throw new Error(`Graph API error on ${path}: ${JSON.stringify(json.error ?? json)}`)
  }
  return json
}

function captionWithHashtags(content) {
  return `${content.caption}\n\n${content.hashtags ?? ''}`.trim()
}

/** Publishes a single-image Instagram feed post. `imageUrl` must be a public URL. */
export async function postInstagramImage(imageUrl, content) {
  const igUserId = requireEnv('IG_BUSINESS_ACCOUNT_ID')
  const accessToken = requireEnv('META_ACCESS_TOKEN')
  const container = await graphPost(`${igUserId}/media`, {
    image_url: imageUrl,
    caption: captionWithHashtags(content),
    access_token: accessToken,
  })
  return graphPost(`${igUserId}/media_publish`, { creation_id: container.id, access_token: accessToken })
}

/** Publishes a multi-image Instagram carousel. `imageUrls` must be public URLs, in slide order. */
export async function postInstagramCarousel(imageUrls, content) {
  const igUserId = requireEnv('IG_BUSINESS_ACCOUNT_ID')
  const accessToken = requireEnv('META_ACCESS_TOKEN')
  const children = []
  for (const imageUrl of imageUrls) {
    const item = await graphPost(`${igUserId}/media`, { image_url: imageUrl, is_carousel_item: 'true', access_token: accessToken })
    children.push(item.id)
  }
  const container = await graphPost(`${igUserId}/media`, {
    media_type: 'CAROUSEL',
    children: children.join(','),
    caption: captionWithHashtags(content),
    access_token: accessToken,
  })
  return graphPost(`${igUserId}/media_publish`, { creation_id: container.id, access_token: accessToken })
}

/** Publishes an Instagram Reel. `videoUrl` must be a public URL to the finished MP4. */
export async function postInstagramReel(videoUrl, content) {
  const igUserId = requireEnv('IG_BUSINESS_ACCOUNT_ID')
  const accessToken = requireEnv('META_ACCESS_TOKEN')
  const container = await graphPost(`${igUserId}/media`, {
    media_type: 'REELS',
    video_url: videoUrl,
    caption: captionWithHashtags(content),
    access_token: accessToken,
  })
  // Video containers need a moment to finish processing server-side before publish.
  await waitForContainerReady(container.id, accessToken)
  return graphPost(`${igUserId}/media_publish`, { creation_id: container.id, access_token: accessToken })
}

async function waitForContainerReady(containerId, accessToken, { maxAttempts = 20, intervalMs = 15000 } = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${GRAPH_BASE}/${containerId}?fields=status_code&access_token=${accessToken}`)
    const json = await res.json()
    if (json.status_code === 'FINISHED') return
    if (json.status_code === 'ERROR') throw new Error(`Media container ${containerId} failed processing: ${JSON.stringify(json)}`)
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  throw new Error(`Media container ${containerId} did not finish processing in time.`)
}

/** Posts a text+image (or text-only) update to the HerCommerce Facebook Page. */
export async function postFacebookPagePhoto(imageUrl, content) {
  const pageId = requireEnv('FB_PAGE_ID')
  const accessToken = requireEnv('FB_PAGE_ACCESS_TOKEN')
  return graphPost(`${pageId}/photos`, { url: imageUrl, caption: captionWithHashtags(content), access_token: accessToken })
}

/** Posts a video (reel) to the HerCommerce Facebook Page. */
export async function postFacebookPageVideo(videoUrl, content) {
  const pageId = requireEnv('FB_PAGE_ID')
  const accessToken = requireEnv('FB_PAGE_ACCESS_TOKEN')
  return graphPost(`${pageId}/videos`, {
    file_url: videoUrl,
    description: captionWithHashtags(content),
    access_token: accessToken,
  })
}
