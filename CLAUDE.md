@AGENTS.md

# Atlas rules — ALWAYS follow

## Code changes

- **After EVERY code change, immediately `git add`, `git commit`, and `git push`.** Never leave changes unstaged or uncommitted. atlas.boston must always reflect the latest work.

## Deploy target

- **The ONLY production URL is `atlas.boston`.**
- Never deploy anywhere else, never link/tell the user about any other `*.vercel.app` URL as a result.
- After every `vercel --prod`, immediately run:
  ```
  vercel alias set <deployment-url> atlas.boston
  ```
  (The `atlas.boston` custom domain currently lives under the `atlas-mvp` project in Vercel, but the repo is linked to the `atlas` project — so prod deploys do NOT auto-alias. Always alias manually.)
- When summarising a deploy to the user, report `atlas.boston` and nothing else.

## Atlas You (the reels feed)

- Feature name is **Atlas You**, not Atlas Reels. Never show the word "reels" in any UI label, pill, placeholder, or thumbnail caption.
- Internal scope key stays `"reels"` (R2 folder + manifest field) — that's invisible to users. Don't rename it unless also migrating existing manifest entries.

## Atlas Radar

- "Atlas Radar" = the HQ widget in the top-left slot with news / geopolitics / live alerts. This is the default HQ. It's what appears before any interaction.
