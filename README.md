# Honeydew DXF Pattern Tool

An offline, single-file web app for viewing, measuring, quality-checking and annotating apparel
pattern files (AAMA/ASTM **DXF**), with piece arranging, manual seam mapping and an experimental
3D "sew" preview. Built for Honeydew's in-house use.

The whole app is one self-contained file — **`apparel-dxf-viewer.html`** — with no build step and
no network dependencies (it also installs as a PWA and can open `.dxf` files directly on
Chrome/Edge).

## What it does

- **View** AAMA/ASTM DXF and plain AutoCAD DXF; auto-detects units (`$INSUNITS`) and translates
  CJK piece names to English.
- **Generic CAD fallback** — for drawings that aren't pattern exports (outlines as loose
  `SPLINE`/`ARC`/`LINE` on layer `0`, no blocks or cut layer), the parser tessellates the curves
  (NURBS via de Boor, arc/bulge support) and chains the loose segments into closed loops, treating
  each loop as a piece. Outlines/measuring/arranging/sewing work; sizes, grading, notches, grain
  and piece names are absent because the file doesn't carry them.
- **Measure** — straight distance, walk-the-seam curved length, a draggable/rotatable guide ruler,
  and a "🔢 Measures" overlay that auto-dimensions a piece (or every piece in a selected size) with
  start/end reference dots.
- **Grade** — grade nest (all sizes overlaid), grade vectors, seam-allowance check, and a
  QC / pattern-check engine.
- **POM** — points of measure that grade across sizes with tolerance flags.
- **Annotate** — point / arrow / box / pinned-measurement notes, colour-coded, saved into the DXF.
- **Arrange** — ✋ Move pieces with alignment guides + onion-skin overlap, **rotate/flip**, and a
  **free transform** mode (no snapping; free-angle rotation handle). Rename pieces. Save As.
- **⊞ Grid** aligned to the rulers and zoom.
- **🧵 Sew** — manual seam pairing: click an edge, then its matching edge (split at corners **and**
  notches) to build a seam map with numbered tags, direction and length-match flags.
- **🪡 3D** — experimental preview that drapes the pieces together using the seam map (hand-rolled
  position-based-dynamics soft body + software renderer; no CDN).
  **Currently disabled** — the drape still needs work, so the toolbar button is hidden behind the
  `ENABLE_3D` flag in `apparel-dxf-viewer.html`. The code is intact and still covered by
  `tools/tests/sew3dtest.js`; set `ENABLE_3D = true` and redeploy to bring it back.
- **Export** — PNG, PDF report, Excel spec sheet, fabric marker/yield, tech pack, 1:1 tiled print.

All annotations, POMs, renames, artboard layout (move/rotate/flip) and seam maps are stored inside
the DXF as layer-90 payload notes, so they travel with the file and never alter the original
pattern geometry.

## Layout

```
apparel-dxf-viewer.html          # THE app (edit this)
honeydew-dxf-tool-user-manual.*  # generated user manual (HTML + PDF)
honeydew-logo.svg, icon-*.png, manifest.webmanifest, sw.js   # PWA assets
3d-sewup.html                    # original standalone 3D sew-up spike (superseded by in-app 🪡 3D)
apparel-dxf-viewer-site/         # deploy build (index.html == the app + PWA assets)
netlify-site/                    # deploy build (mirror)
tools/
  gen_manual.js                  # builds the HTML manual
  build_pdf.py                   # builds the PDF manual (ReportLab)
  mockups.js                     # in-context SVG mockups used by the manual
  mesh.js, spike_template.html, build_spike.js   # 3D spike sources
  tests/                         # headless jsdom verification scripts
```

## Deploy

The app is deployed as a static site (Netlify). To publish a change:

1. Edit `apparel-dxf-viewer.html`.
2. Copy it into each deploy folder as `index.html`:
   `cp apparel-dxf-viewer.html apparel-dxf-viewer-site/index.html`
   `cp apparel-dxf-viewer.html netlify-site/index.html`
3. Bump the service-worker cache name in each `sw.js` (`const CACHE = "adxf-vNN"`) so clients
   pick up the new version.
4. Redeploy the site folder.

## Regenerate the manual

```
cd tools
node gen_manual.js      # -> ../honeydew-dxf-tool-user-manual.html
python3 build_pdf.py    # -> ../honeydew-dxf-tool-user-manual.pdf  (needs reportlab)
```

## Verify

Changes are checked with headless [jsdom](https://github.com/jsdom/jsdom) scripts in `tools/tests/`
that load the app, exercise a feature via the `window.__*` test hooks, and assert behaviour
(round-trips, geometry, convergence, etc.). Run e.g. `node tools/tests/xftest.js`.

> Note: the `tools/` scripts and tests were authored in a sandbox and contain absolute paths
> (`/sessions/.../mnt/...`) plus references to sample DXFs. Adjust the paths for your machine
> before running.
