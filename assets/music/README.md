# Background music (optional)

Reels already have a spoken voiceover (generated automatically — see `src/reel/build.mjs`), which is what you asked for, so this folder is **optional**. If you leave it empty, reels post with voiceover only — no silence, nothing missing.

If you'd like a soft music bed under the voiceover too:

1. Download 2–4 royalty-free tracks (no copyright strikes, free to use):
   - [YouTube Audio Library](https://www.youtube.com/audiolibrary) — filter by "no attribution required"
   - [Pixabay Music](https://pixabay.com/music/) — free, no login needed
   - Instagram's own built-in Reels audio library also works if you'd rather add music manually after a reel posts.
2. Save each file as an `.mp3` directly in this folder (`assets/music/track1.mp3`, etc).
3. Commit and push. The bot automatically picks one at random each time it builds a reel and ducks it to 18% volume under the voiceover, so the voiceover always stays clear.

Keep clips roughly 30–60 seconds or longer — the bot trims/loops to match the reel's length automatically.
