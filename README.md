# HerCommerce Automation Bot

Posts for HerCommerce automatically, 6 days a week, with zero manual content work:

| Day | Format | Theme |
|---|---|---|
| Monday | Carousel | Tips / how-to |
| Tuesday | Reel (voiceover) | Problem → solution |
| Wednesday | Single post | Quick tip |
| Thursday | Carousel | Vision / women empowerment |
| Friday | Reel (voiceover) | Store feature highlight |
| Saturday | Single post | Community engagement |
| Sunday | — | Off |

Everything — captions, carousel slides, reel scripts, voiceover, visuals — is generated automatically by this bot from a hand-written content bank (`src/content/captionBank.mjs`) combined with real store data pulled live from HerCommerce's Firestore database (store names, categories, product photos, storefront links). Nothing needs to be written by hand each day.

- **Instagram + Facebook**: posted fully automatically, every scheduled day.
- **TikTok**: uploaded as a **private draft** that lands in your TikTok inbox for a one-tap approval before it goes public — exactly the "approve before posting" flow you asked for.
- **Manual spotlight**: you can force-feature a specific store any day (see "Featuring a specific store" below) — e.g. "this seller built an amazing store, let's shout them out."
- **Automatic store spotlight**: once HerCommerce has 40+ active stores, Friday's reel automatically starts rotating through your top 5 most-active stores (~once every couple of weeks each) instead of generic content — no setup needed, it switches on by itself.
- **100% free**: GitHub Actions (free scheduled runs), Firestore (already free, read-only), Playwright + ffmpeg (free, open-source), edge-tts (free Microsoft text-to-speech, no API key), Meta Graph API (free for posting to your own Page/IG account), TikTok Content Posting API (free, sandbox/unaudited mode). No paid service anywhere in this system.

## How it works, day to day

Every day at the scheduled time, GitHub runs this bot in the cloud (you don't need your computer on):

1. **Picks today's content** (`src/content/pick.mjs`) — looks at the day of the week, picks the matching theme, cycles to a fresh template so nothing repeats for weeks, and pulls a real store's name/category/photos/link from Firestore.
2. **Builds the visuals** — carousel slides or a single post image (`src/carousel/`), or a full voiced-over reel video (`src/reel/`) with on-brand gradient scenes and Urdu voiceover.
3. **Hosts the media publicly** (`src/post/hostMedia.mjs`) — pushes the generated image/video to this repo so Instagram/Facebook/TikTok's servers can fetch it (see "Make the repo public" below — required for this step).
4. **Posts it** (`src/post/meta.mjs`, `src/post/tiktok.mjs`) — publishes to Instagram and Facebook immediately, and uploads the TikTok version as a private draft for you to approve.

You can also trigger a run manually any time from GitHub: go to the **Actions** tab → **Daily HerCommerce post** → **Run workflow**.

## One-time setup (do this once, then it's fully hands-off)

### 1. Make the repo public

Generated images/reels need to be fetchable by Instagram/Facebook/TikTok's servers without any login, which only works from a **public** GitHub repo (GitHub Pages and release assets both have the same limitation on a free account). This is safe — no password, token, or secret ever lives in the repo's files; real secrets are stored separately as encrypted GitHub Secrets (step 3) which are never visible even to people who can see the code.

Go to **Settings → General → Danger Zone → Change visibility → Make public**.

### 2. Add yourself as a collaborator

You already have the repo since you created it — if you'd like to add anyone else (a developer, a friend helping out), go to **Settings → Collaborators → Add people**.

### 3. Get your Instagram + Facebook posting credentials

1. Go to [developers.facebook.com](https://developers.facebook.com) → **My Apps** → **Create App** → choose "Business" type. Name it e.g. "HerCommerce Bot."
2. In the app, add the **Instagram Graph API** product.
3. Under **App roles → Roles**, add yourself (the HerCommerce Facebook/Instagram account owner) as an **Administrator** — this lets you post to your own account without Meta's app-review process.
4. Make sure your HerCommerce Instagram account is a **Business or Creator account** and is linked to your HerCommerce **Facebook Page** (Instagram app → Settings → Account type, and Settings → Linked accounts).
5. Use the [Graph API Explorer](https://developers.facebook.com/tools/explorer/) with your app selected to generate a **long-lived Page access token** with these permissions: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `instagram_basic`, `instagram_content_publish`.
6. Find your **IG Business Account ID** and **Facebook Page ID**: in Graph API Explorer, query `me/accounts` to get your Page ID, then query `{page-id}?fields=instagram_business_account` to get the linked IG account ID.

You'll end up with 4 values — add them as GitHub Secrets (step 5): `META_ACCESS_TOKEN`, `IG_BUSINESS_ACCOUNT_ID`, `FB_PAGE_ID`, `FB_PAGE_ACCESS_TOKEN` (the Page token works for both Meta values if you only generate one).

### 4. Get your TikTok posting credentials

1. Go to [developers.tiktok.com](https://developers.tiktok.com) → register as a developer (free) → **Manage apps** → **Create an app**.
2. Add the **Content Posting API** product. Leave the app in its default **unaudited/sandbox** status — this is what makes it post as a private draft instead of going live automatically, which is exactly what you want.
3. Add your TikTok account as a tester under the app's test users.
4. Follow TikTok's OAuth flow (their docs walk through it) to get an **access token** for your account with the `video.publish` scope.

Add it as a GitHub Secret: `TIKTOK_ACCESS_TOKEN`.

### 5. Add your secrets to GitHub

Go to **Settings → Secrets and variables → Actions → New repository secret**, and add each of these one at a time:

- `META_ACCESS_TOKEN`
- `IG_BUSINESS_ACCOUNT_ID`
- `FB_PAGE_ID`
- `FB_PAGE_ACCESS_TOKEN`
- `TIKTOK_ACCESS_TOKEN`

(`GITHUB_TOKEN` is provided automatically by GitHub Actions — you don't need to add it.)

### 6. Turn it on

That's it — the workflow in `.github/workflows/daily-post.yml` is already scheduled to run daily. Once the secrets above are in place, the very next scheduled run will post for real. You can also run it manually any time from the **Actions** tab to test it immediately rather than waiting for the schedule.

### 7. (Optional) Background music for reels

See `assets/music/README.md` — entirely optional, reels already have voiceover without it.

## Featuring a specific store

To manually spotlight a store you want to shout out (e.g. "this seller's store looks amazing"):

1. Find that store's Firestore document ID (its `businesses/{id}` document — ask a developer, or check the Firebase Console → Firestore → `businesses` collection).
2. Go to **Actions → Daily HerCommerce post → Run workflow**, and paste that ID into the "Firestore business ID to force-feature today" field.
3. Run it — today's post will feature that store instead of the automatic pick.

## Testing changes safely

Run `DRY_RUN=1 npm run run` (needs Node 20+, ffmpeg, and `pip install edge-tts` installed locally) to generate a day's content into the `output/` folder **without** posting anywhere — useful for previewing changes to captions or visuals before they go live.

`node src/carousel/render.mjs` and `node src/reel/build.mjs` run small offline smoke tests of just the visual templates, with no network needed.

## Changing the caption bank / content

All the actual wording lives in `src/content/captionBank.mjs` — edit it directly (it's plain text, no code knowledge needed beyond keeping the quotes and commas intact) and push. The next scheduled run picks it up automatically.

## Changing the posting schedule

Edit the `ROTATION` object in `src/config.mjs` to change which day gets which format/theme, or edit the `cron` line in `.github/workflows/daily-post.yml` to change what time of day it posts (cron times are in UTC).
