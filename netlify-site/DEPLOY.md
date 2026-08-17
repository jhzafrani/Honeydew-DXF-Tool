# Deploy the Apparel DXF Viewer to Netlify

The Netlify site is already created:
- Site name: **apparel-dxf-viewer**
- Site ID: `9de0ac8f-4cf2-4e13-931f-500db0a325e2`
- Live URL (after first deploy): https://apparel-dxf-viewer.netlify.app

## One-command deploy (recommended)
From this folder, in a terminal:

```bash
npx netlify-cli deploy --prod --dir . --site 9de0ac8f-4cf2-4e13-931f-500db0a325e2
```

The first run opens a browser to authorize the Netlify CLI with your account
(you're logged in via GitHub as jhzafrani). It then uploads these files and
publishes to https://apparel-dxf-viewer.netlify.app.

## Alternative: drag-and-drop
Go to https://app.netlify.com/drop and drag this whole folder in. That creates a
new random site name; you can rename it in Site settings afterward.

## Files
- index.html            the app (served at site root)
- manifest.webmanifest  PWA manifest (installable, .dxf file handler)
- sw.js                 service worker (offline app shell)
- icon-192.png / icon-512.png
- netlify.toml          no-cache header for sw.js
