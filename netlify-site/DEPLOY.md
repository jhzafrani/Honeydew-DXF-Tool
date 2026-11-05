# Deploy the Apparel DXF Viewer to Netlify

The one site to deploy to (Jim, 2026-11-05: "Lets use the original site"):
- Site name: **honeydew-dxf-tool**, password-protected
- Site ID: `ec370dd9-f40f-4d62-9da0-84b8d6df0f8a`
- Live URL: https://honeydew-dxf-tool.netlify.app (the link in the user manual)

Do **not** deploy to `apparel-dxf-viewer` (`9de0ac8f-…`) or `clever-tulumba-2e79d5`.
Both are leftover copies. Until 2026-11-05 releases went to `apparel-dxf-viewer` by
mistake, so the manual's link kept serving the Aug 18 build. After a deploy, check
that the sidebar footer on the live site shows the new `adxf-vNN`.

Deploy from a clean export (`git archive HEAD | tar -x -C <dir>`), not from a git
worktree: the uploader ships a worktree's `.git` pointer file, and Netlify then fails
at "preparing repo".

> **The site root is this `netlify-site/` folder, not the repo root.**
> The repo root has no `index.html` — publishing it directly is what causes
> Netlify's "Page not found" 404. The repo-root `netlify.toml` sets
> `publish = "netlify-site"` so git-connected deploys resolve correctly.

## Before deploying

Make sure the deploy folder has the current app and a bumped cache version:

```bash
# from the repo root
cp apparel-dxf-viewer.html netlify-site/index.html
cp apparel-dxf-viewer.html apparel-dxf-viewer-site/index.html
# then bump  const CACHE = "adxf-vNN"  in BOTH sw.js files
```

The build number is also shown at the bottom of the sidebar. Set
`const APP_BUILD = "adxf-vNN"` (same value as `CACHE`) and `APP_BUILD_DATE` in
`apparel-dxf-viewer.html` **before** copying it into the deploy folders.
`tools/tests/buildstamp.js` fails if any of the three disagree, or if a deploy
copy is stale.

## Option A — deploy this folder directly (what we've always done)

```bash
cd netlify-site
npx netlify-cli deploy --prod --dir . --site ec370dd9-f40f-4d62-9da0-84b8d6df0f8a
```

`--dir .` makes this folder the site root, so `index.html` is served at `/`.

## Option B — deploy from the repo root

```bash
# from the repo root
npx netlify-cli deploy --prod --dir netlify-site --site ec370dd9-f40f-4d62-9da0-84b8d6df0f8a
```

Note the `--dir netlify-site`. Running `--dir .` from the repo root publishes a
folder with no `index.html` → **404**.

## Option C — connect the git repo (continuous deploy)

Netlify reads `netlify.toml` from the **repository root**, which already sets:

```toml
[build]
  publish = "netlify-site"
```

If you connected the repo before that file existed, the site may still have a
stale publish directory saved in the UI. Check
**Site configuration → Build & deploy → Build settings**:

- **Base directory:** *(empty)*
- **Build command:** *(empty)*
- **Publish directory:** `netlify-site`

Then trigger **Deploys → Trigger deploy → Clear cache and deploy site**.

## Troubleshooting "Page not found"

1. Open **Deploys → (latest) → Deploy file browser** and confirm `index.html`
   is at the **top level** of the deploy. If you instead see `netlify-site/…`,
   the publish directory is wrong (see Option C).
2. Confirm the deploy actually contains files — an empty deploy also 404s.
3. Hard-reload (the service worker caches aggressively). The `sw.js` no-cache
   header in `netlify.toml` prevents this going forward.

## Files in this folder
- `index.html` the app (served at site root)
- `manifest.webmanifest` PWA manifest (installable, `.dxf` file handler)
- `sw.js` service worker (offline app shell)
- `icon-192.png` / `icon-512.png`, `honeydew-logo.svg`
- `netlify.toml` no-cache header for `sw.js` (used when this folder is
  deployed directly as the site root, per Option A)
