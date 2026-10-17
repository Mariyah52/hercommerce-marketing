// Instagram/Facebook/TikTok's APIs all fetch media *themselves* from a public URL you
// give them — they don't accept a raw file upload from a script. So generated images
// and reels need a free, public home before any post.* call can use them.
//
// Free solution used here: push the generated files to a dedicated `media` branch of
// this same GitHub repo, then reference them via raw.githubusercontent.com. That URL is
// only fetchable with no auth if the repo is PUBLIC — see README.md "Make the repo
// public" for why that's safe here (no secrets ever live in repo files, only in GitHub
// Actions' encrypted secrets) and how to flip it in Settings if it was created private.
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { cp, mkdir } from 'node:fs/promises'

const execFileAsync = promisify(execFile)
const MEDIA_BRANCH = 'media'

async function run(cmd, args, opts = {}) {
  const { stdout } = await execFileAsync(cmd, args, { cwd: process.cwd(), ...opts })
  return stdout.trim()
}

/**
 * Publishes a batch of local files to the repo's `media` branch and returns their
 * public raw.githubusercontent.com URLs, in the same order as `filePaths`.
 * Must run inside a GitHub Actions job with `permissions: contents: write` and the
 * default GITHUB_TOKEN available (both already set in .github/workflows/daily-post.yml).
 */
export async function hostMediaPublicly(filePaths, { dateFolder } = {}) {
  const repo = process.env.GITHUB_REPOSITORY // "owner/name", auto-set by Actions
  const token = process.env.GITHUB_TOKEN
  if (!repo || !token) {
    throw new Error('hostMediaPublicly requires GITHUB_REPOSITORY and GITHUB_TOKEN — only runs inside GitHub Actions.')
  }
  const [owner, name] = repo.split('/')
  const folder = dateFolder ?? new Date().toISOString().slice(0, 10)

  const worktreeDir = path.join(process.cwd(), '.media-worktree')
  const remote = `https://x-access-token:${token}@github.com/${owner}/${name}.git`

  await run('git', ['fetch', remote, MEDIA_BRANCH], {}).catch(() => {}) // branch may not exist yet
  const branchExists = await run('git', ['ls-remote', '--heads', remote, MEDIA_BRANCH]).then((o) => o.length > 0)

  if (branchExists) {
    await run('git', ['worktree', 'add', '--detach', worktreeDir])
    await run('git', ['fetch', remote, `${MEDIA_BRANCH}:${MEDIA_BRANCH}`], { cwd: worktreeDir })
    await run('git', ['checkout', MEDIA_BRANCH], { cwd: worktreeDir })
  } else {
    await run('git', ['worktree', 'add', '--detach', worktreeDir])
    await run('git', ['checkout', '--orphan', MEDIA_BRANCH], { cwd: worktreeDir })
    await run('git', ['rm', '-rf', '--ignore-unmatch', '.'], { cwd: worktreeDir })
  }

  const destDir = path.join(worktreeDir, folder)
  await mkdir(destDir, { recursive: true })
  const urls = []
  for (const filePath of filePaths) {
    const filename = path.basename(filePath)
    await cp(filePath, path.join(destDir, filename))
    urls.push(`https://raw.githubusercontent.com/${owner}/${name}/${MEDIA_BRANCH}/${folder}/${filename}`)
  }

  await run('git', ['-c', 'user.email=automation@hercommerce.app', '-c', 'user.name=HerCommerce Automation Bot', 'add', '-A'], { cwd: worktreeDir })
  await run('git', ['-c', 'user.email=automation@hercommerce.app', '-c', 'user.name=HerCommerce Automation Bot', 'commit', '-m', `Media for ${folder}`], { cwd: worktreeDir }).catch(() => {}) // no-op if nothing changed
  await run('git', ['push', remote, `HEAD:${MEDIA_BRANCH}`], { cwd: worktreeDir })
  await run('git', ['worktree', 'remove', '--force', worktreeDir])

  // GitHub needs a short moment to serve newly-pushed raw content.
  await new Promise((r) => setTimeout(r, 8000))
  return urls
}
