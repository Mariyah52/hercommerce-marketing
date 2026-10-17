// Queues a reel to TikTok as a PRIVATE DRAFT using the free TikTok Content Posting API,
// in "unaudited" (sandbox) mode. This is intentional, not a limitation to work around:
// Maria specifically asked for TikTok to need her approval before anything goes live
// ("tiktok k liye approve lele"), and an unaudited TikTok app is only *allowed* to post
// private drafts the account owner finalizes with one tap in the TikTok app — the API's
// own restriction does exactly the job she asked for, for free, with no review process.
// See README.md "Setting up TikTok posting" for how to get TIKTOK_ACCESS_TOKEN.
const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2'

function requireEnv(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var ${name} — see README "Setting up secrets".`)
  return v
}

/**
 * Uploads a finished reel MP4 (by public URL) to TikTok as a private draft awaiting
 * Maria's one-tap approval in the TikTok app's inbox.
 * @param {string} videoUrl — public URL to the MP4 (same hosting approach as meta.mjs).
 * @param {Object} content — { caption, hashtags }
 */
export async function queueTikTokDraft(videoUrl, content) {
  const accessToken = requireEnv('TIKTOK_ACCESS_TOKEN')
  const caption = `${content.caption}\n\n${content.hashtags ?? ''}`.trim().slice(0, 2200)

  const res = await fetch(`${TIKTOK_API_BASE}/post/publish/content/init/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      post_info: {
        title: caption,
        privacy_level: 'SELF_ONLY', // draft/private — Maria approves + changes visibility in-app
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
      },
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: videoUrl,
      },
    }),
  })
  const json = await res.json()
  if (!res.ok || json.error?.code !== 'ok') {
    throw new Error(`TikTok draft upload failed: ${JSON.stringify(json.error ?? json)}`)
  }
  return json.data // { publish_id }
}
