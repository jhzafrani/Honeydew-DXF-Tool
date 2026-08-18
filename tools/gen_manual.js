const fs=require("fs");
const OUT="/sessions/intelligent-inspiring-mayer/mnt/Brick Builders App/Honeydew DXF Tool/honeydew-dxf-tool-user-manual.html";
const LOGO=fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/outputs/honeydew-inline.svg","utf8").trim();
const M=require("./mockups.js");   // realistic in-context tool mockups (SVG)
const figure=(svg,cap)=>`<div class="fig">${svg}</div><div class="figcap">${cap}</div>`;

/* ---------- toolbar annotated diagram ---------- */
// groups of buttons in real order; each: [emoji,label]
const groups=[
  [["📂","Open"]],
  [["✥","Pan"],["✋","Move"]],
  [["📏","Measure"],["〰","Seam"]],
  [["📌","Point"],["↗","Arrow"],["▭","Box"]],
  [["🧵","Sew"]],
  [["↶",""],["↷",""]],
  [["⤢","Fit"],["▦","All"],["▤","Nest"],["↗","Grade"],["⌷","SA"],["✔","QC"],["📐","POM"],["🔢","Measures"]],
  [["⊞","Grid"],["📏","Rulers"],["⇥","Ruler"]],
  [["🖼","PNG"],["📄","PDF"],["📊","Spec"],["🧮","Yield"],["📋","Tech Pack"],["🖨","1:1"],["💾","Save DXF"],["💾","Save As"],["⤓","Install"]],
];
const FS=14, PAD=11, EMO=17, GAP=6, GROUPGAP=16, ROWH=40, MAXW=760;
function pillW(b){ const label=b[1]; const lw=label? label.length*7.6+6 : 0; return PAD*2+EMO+lw; }
// lay out with wrapping between groups
let x=0,y=0,n=0; const items=[]; const seps=[];
groups.forEach((g,gi)=>{
  const gw=g.reduce((s,b)=>s+pillW(b)+GAP,-GAP);
  if(x>0 && x+gw>MAXW){ x=0; y+=ROWH+22; }
  g.forEach(b=>{
    n++; const w=pillW(b);
    items.push({x,y,w,b,n});
    x+=w+GAP;
  });
  // separator after group (if not last and staying on row)
  x-=GAP;
  if(gi<groups.length-1){ if(x+GROUPGAP>MAXW){ x=0; y+=ROWH+22; } else { seps.push({x:x+GROUPGAP/2,y}); x+=GROUPGAP; } }
});
const TBW=MAXW+20, TBH=y+ROWH+30;
let tb=`<svg viewBox="0 0 ${TBW} ${TBH}" width="100%" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system,Segoe UI,Roboto,sans-serif">`;
tb+=`<rect x="0" y="0" width="${TBW}" height="${TBH}" rx="10" fill="#171b22"/>`;
seps.forEach(s=>{ tb+=`<rect x="${s.x+10}" y="${s.y+12}" width="1.4" height="26" fill="#2a323d"/>`; });
items.forEach(it=>{
  const bx=it.x+10, by=it.y+16;
  tb+=`<rect x="${bx}" y="${by}" width="${it.w}" height="30" rx="7" fill="#1e242d" stroke="#2a323d"/>`;
  tb+=`<text x="${bx+PAD}" y="${by+20}" font-size="${FS}" fill="#e6eaf0">${it.b[0]}${it.b[1]?" "+it.b[1]:""}</text>`;
  // callout badge
  tb+=`<circle cx="${bx-2}" cy="${by-2}" r="9" fill="#4c9aff"/><text x="${bx-2}" y="${by+2}" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">${it.n}</text>`;
});
// units chip at end
tb+=`<text x="${10}" y="${TBH-8}" font-size="12" fill="#8a94a3">Units selector (mm · cm · inch) sits at the far right of the real toolbar → callout ${n+1}</text>`;
tb+=`</svg>`;

/* ---------- sidebar annotated diagram ---------- */
const secs=[
  ["A","File","File name + a materials summary (e.g. Fabric A ×20) · “Your name” field stamps annotations"],
  ["B","Pieces (n)  🌐 EN","List of pattern pieces (auto-translated to English). Click one to isolate it. Size chips above the list filter it to a single size — pick a size (without picking a piece) and every piece in that size is laid out on the artboard; click again or “All” to clear. The 🌐 EN switch toggles translation. In Nest mode this lists base pieces."],
  ["C","Selected piece","Name · Size · Qty · Material · Category · W×H · Notch/drill counts · Symmetry. Seam-allowance stats when ⌷ SA is on."],
  ["D","Layers","Show/hide Cut, Sew, Grain, Fold, marks, notches, Drill holes · Point/notch labels."],
  ["E","Annotations","All notes with color, type, text & piece. Filter by category/piece, export ⬇ CSV. Click to jump & edit; ✕ deletes."],
];
const SW=320; let sy=14; const rows=[];
secs.forEach(s=>{ const h = s[0]==="B"||s[0]==="C"||s[0]==="E"?70:56; rows.push({...{}, s, y:sy, h}); sy+=h+10; });
const SH=sy+4;
function wrap(t,max){ const words=t.split(" "); const lines=[]; let l=""; words.forEach(w=>{ if((l+" "+w).length>max){lines.push(l);l=w;} else l=l?l+" "+w:w; }); if(l)lines.push(l); return lines; }
let sb=`<svg viewBox="0 0 ${SW} ${SH}" width="320" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system,Segoe UI,Roboto,sans-serif">`;
sb+=`<rect x="0" y="0" width="${SW}" height="${SH}" rx="10" fill="#171b22"/>`;
rows.forEach(r=>{
  sb+=`<rect x="30" y="${r.y}" width="${SW-40}" height="${r.h}" rx="8" fill="#1e242d" stroke="#2a323d"/>`;
  sb+=`<text x="42" y="${r.y+18}" font-size="11" fill="#8a94a3" font-weight="700" letter-spacing="0.5">${r.s[1].toUpperCase()}</text>`;
  const lines=wrap(r.s[2],46); let ly=r.y+34;
  lines.forEach(ln=>{ sb+=`<text x="42" y="${ly}" font-size="11.5" fill="#cfd6e0">${ln}</text>`; ly+=15; });
  sb+=`<circle cx="14" cy="${r.y+14}" r="10" fill="#37c98b"/><text x="14" y="${r.y+18}" font-size="12" font-weight="700" fill="#0f1216" text-anchor="middle">${r.s[0]}</text>`;
});
sb+=`</svg>`;

/* ---------- toolbar reference rows ---------- */
// [label, description] — callout numbers are assigned automatically so the list
// stays in lock‑step with the toolbar diagram above.
const refs=[
["📂 Open","Open one or more .dxf files (plus an optional .rul grade table). On Chrome/Edge this uses a picker that also enables true in‑place Save."],
["✥ Pan","Move around the pattern; click an annotation or ruler to select it. Shortcut V."],
["✋ Move","Rearrange pieces on the artboard — drag any piece and green alignment guides snap its edges, centres and notches to the neighbouring pieces (e.g. line up a front and back at the armhole). Click a piece to select it and a small control floats next to its bounding box — <b>⟲ ⟳</b> rotate the piece 90°, and <b>⇄ ⇅</b> flip it left↔right / top↕bottom (handy for measuring or aligning a mirrored piece). For <b>free transform</b>, turn off the <b>🧲</b> snap toggle (or hold <b>Alt</b>) to drag with no snapping, and drag the round handle above the piece to rotate to any angle (hold <b>Shift</b> for 15° steps). Pieces show in a translucent onion‑skin tint so an overlapping piece stays see‑through and you can compare the one underneath (the piece you’re working on is tinted a little stronger). Double‑click a piece to reset its position, rotation and flip. The layout is remembered inside the DXF (original geometry is never altered). Shortcut X."],
["📏 Measure","Click two points to read the straight‑line distance (ΔX/ΔY). Press “📌 Pin” in the readout to keep it as a saved measurement. Shortcut M."],
["〰 Seam","Click two points on the SAME pattern line to measure the length ALONG the curve. Measure a second seam to compare lengths (walk‑the‑seam): shows Seam A/B and their difference with a match/off flag. “⇄ Flip last” picks the other arc. Shortcut S."],
["📌 Point","Drop a point note where you click. Shortcut P."],
["↗ Arrow","Leader arrow: click the anchor, then the target. Shortcut L."],
["▭ Box","Region box: click two opposite corners. Shortcut B."],
["🧵 Sew","Manual seam pairing — click an edge on one piece, then its matching edge on another, to pair them into a seam. Each piece's outline is split into clickable edges at its corners and notches, so seams can be matched notch‑to‑notch. Paired edges get a matching numbered tag and colour, a dashed connector, sew‑direction arrows, and a length readout that flags mismatches. The Seams panel lists them (flip direction with ⇄, delete with ✕). Seam maps are saved in the DXF."],
["↶ Undo","Undo the last annotation change (multi‑level, per tab). Ctrl/Cmd+Z."],
["↷ Redo","Redo. Ctrl/Cmd+Shift+Z (or Ctrl+Y)."],
["⤢ Fit","Fit the current piece/selection to the window. Shortcut F."],
["▦ All","Show every piece in the file."],
["▤ Nest","Grade nest — overlay all sizes of a piece, colored by size. Click a base piece to isolate it. Shortcut G."],
["↗ Grade","Grade vectors — draw how each grade point grows across sizes (arrow points to the largest size)."],
["⌷ SA","Seam‑allowance check — select a piece first; dots the sew line green (in tolerance) / red (off) and reports typical/min/max."],
["✔ QC","Pattern check — runs automatic checks (open contours, self‑intersections, duplicate points, missing grain, missing sizes in a graded set, notch/drill mismatches) and lists them by severity. Click a finding to zoom to it."],
["📐 POM","Points of measure — define measurements (point‑to‑point, along‑seam, or multi‑segment girth) that grade across every size with a tolerance flag. Save/reload the set for the next style."],
["🔢 Measures","Show all measurements — a toggle. Select a single piece and it auto‑labels every boundary edge length and the overall width/height at the current size, plus any Points of measure defined on that piece. Select a size chip (with no individual piece) instead and it dimensions every piece of that size on the artboard."],
["⊞ Grid","Toggle a faint positioning grid across the artboard. The grid lines fall exactly on the ruler ticks and rescale with zoom and the unit selector, so you can eyeball spacing and line pieces up. The origin (x=0, y=0) axes are drawn slightly brighter."],
["📏 Rulers","Toggle the top & left rulers with unit ticks. Shortcut R."],
["⇥ Ruler","Drop a measuring ruler (or drag one down from the top ruler). Snaps to pattern lines; drag ends to rotate/resize; select it to convert to an annotation."],
["🖼 PNG","Export the current view as a PNG image."],
["📄 PDF","Open a printable report (view snapshot + QC results + graded POM chart + annotation table, with translated piece names) — use the browser’s Save as PDF."],
["📊 Spec","Export a size spec sheet as Excel (.xlsx) with mm / cm / inch tabs and a translated‑name column, plus Grade rules, Points of measure, QC report and Marker (yield) tabs."],
["🧮 Yield","Fabric marker &amp; yield estimate — nests the pieces into a fabric width and reports marker length, fabric used (m / yd) and utilisation, with a visual marker layout."],
["📋 Tech Pack","One consolidated spec document — pieces, materials, graded POM chart, QC results, fabric yield and annotations — ready to Save as PDF and hand off."],
["🖨 1:1","Print at actual size, tiled across Letter pages, with a calibration bar and R#·C# tile labels for taping together."],
["💾 Save DXF","Write your annotations, renamed pieces and artboard layout back into the DXF. Saves in place when the file was opened with the picker/handler; otherwise downloads a copy."],
["💾 Save As","Save a separate copy of the DXF under a new name (always a download), leaving the original untouched — handy for versioning a marked‑up or rearranged file."],
["⤓ Install","Appears when the app can be installed to your computer (Chrome/Edge). Click to install as a desktop app."],
["Units","Switch measurement units: mm · cm · inch. Affects all readouts, rulers and exports."],
];

const refRows = refs.map((r,i)=>`<tr><td class="num">${i+1}</td><td class="btn"><b>${r[0]}</b></td><td>${r[1]}</td></tr>`).join("");
const sideRows = secs.map(s=>`<tr><td class="num sg">${s[0]}</td><td class="btn"><b>${s[1]}</b></td><td>${s[2]}</td></tr>`).join("");

let html=`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Honeydew · DXF Tool — User Manual</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{
  --ink:#1c1a17; --muted:#8a8175; --line:#e8e2d8; --bg:#f6f3ee; --paper:#fffdf9;
  --green:#3a6b52; --gold:#b3894e; --accent:#3a6b52;
  --serif:"Cormorant Garamond","Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
  --sans:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);line-height:1.62;font-size:15px;
  background-image:radial-gradient(circle at 50% -8%, #fdfbf6 0%, var(--bg) 46%)}
.wrap{max-width:880px;margin:0 auto;padding:0 26px 90px}
/* masthead */
.mast{text-align:center;padding:56px 0 30px;margin-bottom:20px}
.mast .wm{color:var(--ink);line-height:0}
.mast .wm svg{height:46px;width:auto;max-width:min(420px,80%);display:inline-block}
.mast .rule{width:70px;height:1px;background:var(--gold);margin:20px auto 16px}
.mast .eyebrow{font-size:11px;letter-spacing:.34em;text-transform:uppercase;color:var(--gold);font-weight:600}
.mast h1{font-family:var(--serif);font-weight:500;font-size:40px;letter-spacing:.01em;margin:8px 0 6px;font-style:italic}
.mast .sub{color:var(--muted);font-size:14.5px;letter-spacing:.02em}
/* headings */
h2{font-family:var(--serif);font-weight:600;font-size:30px;letter-spacing:.01em;margin:52px 0 6px;
  padding-top:22px;border-top:1px solid var(--line);display:flex;align-items:baseline;gap:12px}
h2 .n{font-size:14px;font-family:var(--sans);font-weight:600;color:var(--gold);letter-spacing:.12em;
  border:1px solid var(--gold);border-radius:50%;width:30px;height:30px;min-width:30px;display:inline-flex;
  align-items:center;justify-content:center;line-height:1}
h3{font-family:var(--serif);font-weight:600;font-size:20px;margin:24px 0 4px;color:#2a2721}
p{margin:9px 0}
a{color:var(--green);text-underline-offset:2px}
b{font-weight:600}
code,kbd{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:#efeae1;border:1px solid var(--line);border-radius:5px;padding:1px 6px;font-size:12.5px}
kbd{background:#2a2721;color:#f6f3ee;border-color:#2a2721}
.card{background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:20px 22px;margin:16px 0;box-shadow:0 1px 2px rgba(28,26,23,.04)}
.access{background:linear-gradient(180deg,#f2f7f3,#fffdf9);border-color:#cfe2d4}
.access b{font-family:var(--serif);font-size:19px;font-weight:600}
.fig{background:#0f1216;border-radius:14px;padding:18px;margin:18px 0;border:1px solid #23282f}
.figcap{color:var(--muted);font-size:12.5px;margin:8px 2px 0;font-style:italic}
table{border-collapse:collapse;width:100%;margin:12px 0;font-size:13.5px;background:var(--paper);
  border:1px solid var(--line);border-radius:12px;overflow:hidden}
th,td{border-bottom:1px solid var(--line);padding:9px 12px;text-align:left;vertical-align:top}
tr:last-child td{border-bottom:none}
th{background:#efeae1;font-family:var(--sans);font-weight:600;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#6a6154}
td.num{width:34px;text-align:center;font-weight:600;color:#fff;background:var(--green)}
td.num.sg{background:var(--gold)}
td.btn{white-space:nowrap;width:120px}
ol,ul{margin:8px 0 8px 22px}
li{margin:5px 0}
.tip{background:#f3f7f4;border:1px solid #cfe2d4;border-left:3px solid var(--green);border-radius:8px;padding:12px 16px;margin:14px 0;font-size:14px}
.tip::before{content:"Tip · ";font-family:var(--serif);font-style:italic;color:var(--green);font-weight:600}
.warn{background:#faf3ea;border:1px solid #ecd9bd;border-left:3px solid var(--gold);border-radius:8px;padding:12px 16px;margin:14px 0;font-size:14px}
.warn::before{content:"Note · ";font-family:var(--serif);font-style:italic;color:var(--gold);font-weight:600}
.kbds td{font-size:14px}
.toc{columns:2;column-gap:26px}
.toc b{font-family:var(--serif);font-size:17px;display:block;margin-bottom:6px;column-span:all}
.toc a{display:block;padding:4px 0;text-decoration:none;color:var(--ink);font-size:14px;border-bottom:1px dotted var(--line)}
.toc a:hover{color:var(--green)}
@media print{body{background:#fff;background-image:none}.wrap{max-width:100%}.card{box-shadow:none}}
</style></head>
<body><div class="wrap">
<div class="mast">
  <div class="wm">${LOGO}</div>
  <div class="rule"></div>
  <div class="eyebrow">Technical Tools</div>
  <h1>The DXF Tool</h1>
  <div class="sub">User manual · apparel pattern (AAMA/ASTM) viewer, measuring &amp; annotation</div>
</div>

<div class="card access">
  <b>Where to find it</b><br>
  Web app: <a href="https://honeydew-dxf-tool.netlify.app/">https://honeydew-dxf-tool.netlify.app/</a><br>
  Site password: <code>HoneydewTools2026</code><br>
  <span style="color:var(--muted);font-size:13px">Works in any modern browser. Install &amp; “open a .dxf directly” features need Chrome or Edge (see §8).</span>
</div>

<div class="card toc">
  <b>Contents</b>
  <a href="#start">1 · Getting started</a>
  <a href="#toolbar">2 · The toolbar (button‑by‑button)</a>
  <a href="#sidebar">3 · The sidebar</a>
  <a href="#measure">4 · Measuring &amp; the ruler tool</a>
  <a href="#annotate">5 · Annotations</a>
  <a href="#grade">6 · Grade nest &amp; grade vectors</a>
  <a href="#qc">7 · Quality checks &amp; exports</a>
  <a href="#install">8 · Install as an app &amp; open .dxf directly</a>
  <a href="#saving">9 · Saving, tabs &amp; comparing revisions</a>
  <a href="#keys">10 · Keyboard shortcuts</a>
  <a href="#tips">11 · Tips &amp; tricks</a>
  <a href="#notes">12 · Notes &amp; limits</a>
</div>

<h2 id="start">1 · Getting started</h2>
<p>The DXF Tool opens apparel pattern files exported in the <b>AAMA/ASTM</b> (ANSI/AAMA‑DXF) format and lets you view, measure, quality‑check and annotate them right in the browser — nothing to install (though you can, see §8). This section gets you from a blank window to a pattern on screen.</p>

<h3>Open the tool</h3>
<ol>
  <li>Go to <a href="https://honeydew-dxf-tool.netlify.app/">https://honeydew-dxf-tool.netlify.app/</a> in Chrome, Edge, Safari or Firefox.</li>
  <li>When prompted, enter the site password <code>HoneydewTools2026</code>. You’ll land on an empty canvas with a “Drop an apparel DXF here” message.</li>
</ol>

<h3>Load a pattern file</h3>
<ol>
  <li>Click <b>📂 Open</b> in the toolbar (or drag files straight onto the window, or click <b>Choose file…</b> in the drop zone).</li>
  <li>Select one or more <code>.dxf</code> pattern files. To get full size information, also select the matching <code>.rul</code> grade‑rule file in the same dialog — the tool pairs it with the DXF automatically.</li>
  <li>The pattern draws in the canvas and the left sidebar fills in: the file name and a materials summary at the top, then the list of pieces below.</li>
</ol>
<div class="tip">You can add the <code>.rul</code> later, too: just drag it onto the window while the pattern is open. The sidebar hint updates to “.rul grade table loaded” and size‑aware features (grade nest, size order, grade‑rules export) switch on.</div>
<div class="tip">The tool reads AAMA/ASTM apparel DXFs and also plain CAD DXFs (geometry in the ENTITIES section, named layers like CUT / NET / GRAIN). If a file declares its units in the header (<code>$INSUNITS</code> — e.g. inches), the tool <b>scales it correctly and switches the unit selector to match</b>, so measurements read true. Files with no unit header are assumed to be in millimetres.</div>
<div class="tip"><b>Generic CAD drawings.</b> Some files aren’t pattern exports at all — just a drawing where the outlines are loose curves (<code>SPLINE</code>, arcs, lines), everything sits on layer <code>0</code>, and there are no pieces, layers or names. The tool now falls back to reading these: it converts the curves to outlines, joins the loose ends into <b>closed shapes</b>, and treats each shape as a piece. You get the outlines and can measure, arrange and sew them — but because the file carries no pattern data, pieces are named <i>Piece 1, 2, 3…</i> and there are no sizes, grading, notches or grain lines. For the full feature set, ask for a proper <b>AAMA/ASTM</b> export.</div>

<h3>Move around the pattern</h3>
<ol>
  <li><b>Zoom</b> — scroll the mouse wheel (or pinch on a trackpad). Zoom centers on the cursor, so point at what you want to inspect before scrolling. The zoom step is intentionally gentle for fine control.</li>
  <li><b>Pan</b> — with the <b>✥ Pan</b> tool active (the default), press and drag anywhere on the canvas.</li>
  <li><b>Fit</b> — click <b>⤢ Fit</b> (or press <kbd>F</kbd>) at any time to frame the current piece or selection; click <b>▦ All</b> to frame every piece in the file.</li>
  <li>The bottom‑left readout always shows the cursor’s <b>x / y</b> position and the current <b>zoom %</b>.</li>
</ol>

<h3>Work with several files at once</h3>
<p>Each DXF opens in its own <b>tab</b> across the top of the canvas. Click a tab to switch; click the <b>✕</b> on a tab to close it (you’ll be asked to save if it has unsaved changes). The <b>+</b> button opens another file. Having two revisions open side‑by‑side powers the <b>Compare</b> overlay (see §9).</p>

<div class="tip">The pattern colors tell you what each line is: <b>white</b> = cut line, <b>blue dashed</b> = sew/seam line, <b>green</b> = grain line, <b>purple</b> = fold/internal, plus smaller marks for seam/internal points, <b>yellow</b> notches and <b>red</b> drill holes. Turn any layer on or off in the <b>Layers</b> panel of the sidebar.</div>

<h2 id="toolbar">2 · The toolbar (button‑by‑button)</h2>
<p>The toolbar runs across the top of the window. Numbers below match the reference table.</p>
<div class="fig">${tb}</div>
<table>
<thead><tr><th>#</th><th>Button</th><th>What it does</th></tr></thead>
<tbody>${refRows}</tbody>
</table>

<h2 id="sidebar">3 · The sidebar</h2>
<p>The left panel is your table of contents for the file, stacked top to bottom: <b>File</b> info, the <b>Pieces</b> list, the <b>Selected piece</b> details, the <b>Layers</b> toggles, and your <b>Annotations</b>. The Pieces, Selected‑piece and Annotations panes each scroll on their own, and you can drag the thin handle between panes up or down to give a busy list more room.</p>
<div class="fig" style="display:flex;justify-content:center">${sb}</div>
<table>
<thead><tr><th></th><th>Section</th><th>What it shows</th></tr></thead>
<tbody>${sideRows}</tbody>
</table>
<div class="tip">Type your name into the <b>File → “Your name”</b> box once; every annotation you create is then stamped with your name and the date.</div>

<h2 id="measure">4 · Measuring &amp; the ruler tool</h2>
<p>There are three ways to measure: a quick <b>straight‑line</b> distance, a <b>seam length that follows a curve</b>, and a draggable <b>guide ruler</b> you can place, rotate and snap. All three read out in whatever unit is selected in the toolbar (mm · cm · inch) and update instantly if you switch units.</p>

<h3>Quick measure — straight line</h3>
<ol>
  <li>Click <b>📏 Measure</b> in the toolbar, or press <kbd>M</kbd>. The cursor becomes a crosshair.</li>
  <li>Click once where you want to start. As you move the mouse a live dashed line follows the cursor.</li>
  <li>Click again at the end point. The readout in the <b>bottom‑right</b> shows the straight‑line <b>Distance</b> plus the horizontal <b>ΔX</b> and vertical <b>ΔY</b> components.</li>
  <li>To keep the measurement on the pattern, click <b>📌 Pin</b> in that readout — it becomes a saved measurement annotation (and the note editor opens so you can label it). Otherwise, click two new points to measure again.</li>
</ol>
<div class="tip">Straight measure doesn’t snap to lines, so for exact point‑to‑point work zoom in first, or use the guide ruler (below), which snaps to corners and edges.</div>
${figure(M.measure,"Measuring the chest width. The green dashed line runs between your two clicks; the readout shows the distance plus the horizontal/vertical deltas, with <b>Pin</b> to keep it as a saved measurement.")}

<h3>Seam length &amp; walk‑the‑seam</h3>
<p>Use this whenever you need the length <b>along</b> a curved edge — an armhole, a neckline, a princess seam — rather than the straight distance across it. It’s also how you check that two edges which must sew together are the same length.</p>
<ol>
  <li>Click <b>〰 Seam</b> in the toolbar, or press <kbd>S</kbd>.</li>
  <li>Click a point on a pattern line — a highlight ring shows it locked onto that line. Then click a <b>second</b> point <b>on the same line</b>. The tool traces the edge between the two clicks and reports the <b>length along the curve</b>.</li>
  <li>To compare two edges, measure a <b>second</b> seam the same way. The readout now lists <b>Seam A</b> and <b>Seam B</b> with their lengths and the difference (<b>Δ</b>), flagged <b>✓ match</b> or <b>✗ off</b> against the tolerance — this is the “walk‑the‑seam” check.</li>
  <li>On a closed outline there are two ways around between your points; if it traced the long way, click <b>⇄ Flip last</b> to take the other arc. <b>Clear</b> removes the seam measurements and starts over.</li>
</ol>
<div class="warn">Both clicks must land on the <b>same</b> line entity. If the second click doesn’t register, you likely clicked a different line (e.g. the sew line instead of the cut line) — zoom in and click directly on the intended edge.</div>
${figure(M.seam,"Walk‑the‑seam: the front <b style='color:#ff9f43'>armhole (Seam A)</b> measured against the <b style='color:#22d3ee'>sleeve cap (Seam B)</b>. The readout compares the two curved lengths and flags <b>✓ match</b> when they’re within tolerance.")}

<h3>The guide ruler</h3>
<p>The guide ruler is a movable, rotatable ruler with tick marks — think of laying a physical ruler on the pattern. It’s a measuring aid; it isn’t saved unless you convert it to an annotation.</p>
<ol>
  <li>Click <b>⇥ Ruler</b> to drop one in the middle of the view. (Alternatively turn on <b>📏 Rulers</b> to show the top/left ruler bars, then drag down from the top bar to pull out a guide.)</li>
  <li>It appears spanning the piece edge‑to‑edge with a <b>0</b> at the left end and tick marks along its length.</li>
  <li><b>Move it</b> — drag the middle of the ruler to slide it around.</li>
  <li><b>Rotate / resize it</b> — drag either square end. Hold <kbd>Shift</kbd> while dragging an end to snap the angle to 15° increments (handy for grain lines, 45° bias, right angles).</li>
  <li><b>Snap to the pattern</b> — as you drag an end near a line, it locks onto the nearest corner or edge and shows a magenta marker, so you can measure exactly corner‑to‑corner.</li>
  <li><b>Keep or remove it</b> — click the ruler to select it and get a small menu: <b>📌 Annotate</b> turns it into a saved measurement that travels with the file; <b>✕</b> removes it. Double‑clicking a ruler also removes it.</li>
</ol>
${figure(M.ruler,"The guide ruler laid across a piece. Ticks read from the <b>0</b> end; dragging an end near a corner snaps to it (magenta marker). Select the ruler to <b>Annotate</b> (save it) or remove it.")}

<h3>Show all measurements (🔢 Measures)</h3>
<p>When you just want to <b>see</b> every measurement on a piece rather than measure by hand, use the <b>🔢 Measures</b> toggle.</p>
<ol>
  <li>Select a <b>single piece</b> in the sidebar (a specific piece at a specific size).</li>
  <li>Click <b>🔢 Measures</b> in the toolbar. The tool automatically labels <b>every boundary edge length</b> (segmented at the corners, measured along curves), plus the overall <b>width and height</b> as dimension bars. Each measurement shows small <b>start/end reference dots</b> so you can see exactly which two points it spans.</li>
  <li>Any <b>Points of measure</b> you’ve defined on that piece are drawn too, resolved to the selected size with their values.</li>
  <li>Switch sizes or pieces and the labels update to that piece and size. Click <b>🔢 Measures</b> again to turn the overlay off.</li>
</ol>
<div class="tip">Want measurements on <b>every</b> piece at once? Pick a <b>size</b> chip (without selecting an individual piece) and turn on <b>🔢 Measures</b> — the whole size is laid out on the artboard and each piece is dimensioned. With nothing selected the overlay stays off to avoid clutter.</div>
<div class="tip">Everything reads in the current unit — flip the Units selector to see the same piece in mm, cm or inches.</div>

<h3>Positioning grid (⊞ Grid)</h3>
<p>Click <b>⊞ Grid</b> to lay a faint grid over the artboard. It’s handy for eyeballing spacing and lining pieces up while you rearrange them. The grid is <b>in sync with the rulers</b> — its lines sit on the same ticks, and it rescales as you zoom and when you switch units (mm · cm · inch). The <b>origin</b> (x=0, y=0) axes are drawn a touch brighter so you can see the datum. Grid works with or without the rulers showing.</p>

<h3>Rearrange pieces on the artboard (✋ Move)</h3>
<p>Use <b>✋ Move</b> (<kbd>X</kbd>) to slide pieces around so you can compare them side by side — for example, butting a front and a back together to check that the armholes or side seams line up.</p>
<ol>
  <li>Click <b>✋ Move</b>. The view switches to show <b>all</b> pieces so you have something to align against.</li>
  <li>Drag any piece. As an edge, centre‑line or notch of the piece you’re dragging comes close to the same feature on a neighbour, a <b>green dashed alignment guide</b> appears and the piece <b>snaps</b> into line.</li>
  <li>Drop it where you want. To undo a placement, <b>double‑click</b> the piece and it jumps back to its original position (this also clears any rotation or flip).</li>
</ol>
<h4>Rotate &amp; flip</h4>
<p>Click a piece to <b>select</b> it (it gets a blue outline) and a small control floats just above its bounding box:</p>
<ul>
  <li><b>⟲ / ⟳</b> — rotate the piece 90° counter‑clockwise / clockwise about its centre.</li>
  <li><b>⇄ / ⇅</b> — flip the piece horizontally (mirror left↔right) or vertically (mirror top↕bottom).</li>
</ul>
<p>Rotating and flipping are useful for measuring or aligning a mirrored or off‑orientation piece against another. Like moves, they’re stored as a note in the DXF and reload with the file; double‑click the piece to reset everything.</p>
<h4>Free transform</h4>
<p>By default, dragging a piece <b>snaps</b> to the alignment guides. To position and rotate with no snapping at all:</p>
<ul>
  <li><b>Free move</b> — click the <b>🧲</b> magnet in the floating control to turn snapping off (or just hold <b>Alt</b> while dragging). The piece follows the cursor exactly, with no guides.</li>
  <li><b>Free rotate</b> — drag the round <b>handle</b> that floats just above the selected piece to rotate it to any angle about its centre. Hold <b>Shift</b> to snap the angle to 15° steps.</li>
</ul>
<div class="tip">While you’re in Move mode the pieces are drawn in a faint <b>onion‑skin</b> tint, so when one piece sits on top of another it stays see‑through and you can read the piece underneath. The piece you’re dragging is tinted a touch stronger so you can tell which one is on top. Overlapping tints blend, which makes it easy to see exactly where two edges or armholes line up.</div>
<div class="tip">Moving a piece never changes the pattern itself — the original coordinates are preserved. Your arrangement is stored as a note inside the DXF, so when you <b>💾 Save</b> and reopen the file the layout comes back exactly as you left it.</div>

<h3>Rename a piece (✎)</h3>
<p>If the auto‑translated name isn’t what you call the piece, rename it: select the piece, then click the <b>✎</b> pencil next to its <b>Name</b> in the sidebar and type a new label. The name updates on the piece badge, the piece list, the nest view and every export. Renames are saved inside the DXF alongside your annotations.</p>

<h3>Save a copy (💾 Save As…)</h3>
<p><b>💾 Save DXF</b> writes your annotations, renamed pieces and artboard layout back into the current file. <b>💾 Save As…</b> instead downloads a <b>separate copy</b> under a new name, leaving the original untouched — useful for keeping a marked‑up or rearranged version next to the clean original.</p>

<h3>Pair seams (🧵 Sew)</h3>
<p>The <b>🧵 Sew</b> tool lets you build a <b>seam map</b> — a record of which edge sews to which — by hand. It’s useful for checking that seams that join actually match in length, and it’s the foundation for the upcoming 3D sew‑up.</p>
<ol>
  <li>Click <b>🧵 Sew</b>. Each piece’s outline lights up, split into clickable <b>edges</b> at its corners and <b>notches</b> — so a long seam that meets two shorter edges can be joined notch‑to‑notch.</li>
  <li>Click an edge on one piece — a “thread” follows your cursor — then click the <b>matching edge</b> on another piece to pair them. Press <kbd>Esc</kbd> (or click empty space) to cancel a pick.</li>
  <li>Each seam gets a matching <b>numbered tag</b> and colour on both edges, a dashed connector between them, small <b>direction arrows</b>, and a <b>length readout</b> (e.g. <i>24.0 / 24.1 cm ✓</i>, or a red ⚠ if the two edges differ by more than tolerance).</li>
  <li>The <b>Seams panel</b> lists every pair. Click one to highlight it, <b>⇄</b> flips the sew direction, and <b>✕</b> deletes it.</li>
</ol>
<div class="tip">Seam maps are saved inside the DXF with <b>💾 Save DXF</b>, so they travel with the file and reload where you left them. Pieces are matched by name, so pair seams on the size you’re working with.</div>

<h2 id="annotate">5 · Annotations</h2>
<p>Annotations are notes you place on the pattern to flag issues, ask questions or approve details. There are four kinds — <b>📌 Point</b> (a single pin), <b>↗ Arrow</b> (a leader from an anchor to a target), <b>▭ Box</b> (a region), and pinned <b>measurements</b> — and they’re saved inside the DXF, so they travel with the file to the factory and reload exactly where you left them.</p>

<h3>Set your name first (once)</h3>
<p>In the sidebar’s <b>File</b> section, type your name into the <b>“Your name”</b> box. Every annotation you create from then on is stamped with your name and the date. You only need to do this once per browser.</p>

<h3>Create an annotation</h3>
<ol>
  <li>Pick a tool: <b>📌 Point</b> (<kbd>P</kbd>), <b>↗ Arrow</b> (<kbd>L</kbd>) or <b>▭ Box</b> (<kbd>B</kbd>).</li>
  <li>Click on the pattern:
    <ul>
      <li><b>Point</b> — one click drops the pin.</li>
      <li><b>Arrow</b> — click the anchor point, then click the target the arrow should point to.</li>
      <li><b>Box</b> — click one corner, then the opposite corner.</li>
    </ul>
  </li>
  <li>The note editor opens automatically. Type your <b>note</b>, choose a <b>category</b> (Note, Issue, To‑do, Question, Approved) and a <b>color</b> from the palette, then click <b>Save</b>. (Press <kbd>Esc</kbd> to cancel a note you just started.)</li>
  <li>The annotation is auto‑tagged with the nearest <b>piece</b>, plus your <b>name</b> and today’s <b>date</b>.</li>
</ol>
${figure(M.anno,"The three note types on a piece — a numbered <b>point</b> (1), an <b>arrow</b> leader (2) and a dashed <b>box</b> region (3) — with the editor open: note text, category (Issue) and colour, stamped with piece, author and date.")}

<h3>Turn a measurement into a note</h3>
<p>Any measurement can become a saved annotation: with the <b>📏 Measure</b> tool, click two points and press <b>📌 Pin</b> in the readout; or select a guide ruler and choose <b>📌 Annotate</b>. Pinned measurements show their distance and behave like any other annotation.</p>

<h3>Read, edit &amp; delete</h3>
<ol>
  <li><b>Read</b> — hover any pin to see its note in a tooltip.</li>
  <li><b>Edit</b> — switch to <b>✥ Pan</b> mode and click the pin; the editor reopens. Change the text, category or color and Save.</li>
  <li><b>Jump to one</b> — in the <b>Annotations</b> panel (sidebar), click a row to center the view on that note and open it.</li>
  <li><b>Delete</b> — click the <b>✕</b> on its row in the Annotations panel, or open it and press <b>Delete</b>. Made a mistake? <kbd>Ctrl/Cmd+Z</kbd> undoes it.</li>
</ol>

<h3>Filter &amp; export the list</h3>
<ol>
  <li>In the Annotations panel, use the <b>category</b> and <b>piece</b> dropdowns to narrow the list — e.g. show only <i>Issues</i>, or only notes on the <i>Front</i>.</li>
  <li>Click <b>⬇ CSV</b> to export exactly what’s shown. The spreadsheet includes the note, category, original and translated piece name, any measurement, author and date — handy for sending a factory just its open issues.</li>
</ol>
<div class="tip">Notes support any language (including Chinese). Because they’re written into the DXF on <b>💾 Save DXF</b>, a colleague who opens the same file sees your notes in place — no side files to pass around.</div>

<h2 id="grade">6 · Grade nest &amp; grade vectors</h2>
<p>“Grading” is how a pattern scales from size to size. The nest view stacks every size of a piece on top of each other so you can see the progression, and grade vectors show the direction each landmark point grows. For the most accurate results, load the <code>.rul</code> grade‑rule file alongside the DXF (it sets the size order and which size is the sample).</p>

<h3>View the size nest</h3>
<ol>
  <li>Click <b>▤ Nest</b> in the toolbar, or press <kbd>G</kbd>. The canvas redraws with every size <b>overlaid and colored by size</b>, and the sidebar switches to a list of <b>base pieces</b> (one row per piece, e.g. “Front — 5 sizes”) with a color legend.</li>
  <li>Click a base piece in the list to <b>isolate</b> just that piece’s nested sizes — much easier to read than the whole pattern at once.</li>
  <li>The <b>Selected piece</b> panel shows a grade table: each size’s <b>width × height</b> and the <b>ΔW</b> (width change) versus the sample size, with the sample marked by an asterisk.</li>
  <li>Click <b>▤ Nest</b> again to leave nest view and return to the normal per‑piece list.</li>
</ol>
${figure(M.nest,"Grade nest — every size of a piece overlaid and coloured by size, with the sample (M) drawn heavier. The sidebar shows the matching size legend.")}

<h3>Show grade vectors</h3>
<ol>
  <li>With a piece in view, click <b>↗ Grade</b>.</li>
  <li>At each grade point the tool draws a small <b>fan</b> connecting that point across the sizes, with an arrow pointing toward the <b>largest</b> size — so you can see at a glance which way, and how much, each landmark moves as the pattern grows.</li>
  <li>Pieces that don’t grade (a pocket, a small trim) correctly show <b>no</b> vectors — a quick sanity check that fixed parts aren’t accidentally scaling.</li>
  <li>Click <b>↗ Grade</b> again to hide the vectors.</li>
</ol>
<div class="tip">Without a <code>.rul</code> the tool still groups sizes it can infer from the piece names, but the size order and sample size may not match your intent. Loading the <code>.rul</code> makes the nest, grade table, grade‑rules export and POM grading exact.</div>

<h2 id="qc">7 · Quality checks &amp; exports</h2>
<p>This section covers the tools that verify a pattern is correct — seam allowance, symmetry, the automatic pattern check and points of measure — and the ways to get the results out (image, PDF report, Excel spec, 1:1 print).</p>

<h3>Seam allowance (⌷ SA)</h3>
<p>Seam allowance is the gap between the cut line and the sew line. This check highlights where that gap is inconsistent — often a sign of a digitizing slip.</p>
<ol>
  <li>Click a single piece in the sidebar to select it (the check works one piece at a time and needs a piece that has both a cut line and a sew line).</li>
  <li>Click <b>⌷ SA</b> in the toolbar.</li>
  <li>The sew line is dotted along its length: <b>green</b> dots where the allowance matches the typical value, <b>red</b> dots where it drifts more than 1&nbsp;mm.</li>
  <li>The <b>Selected piece</b> panel reports the <b>typical</b> allowance, the <b>min / max</b>, and how many points are off — so you can tell an intentional stepped allowance (e.g. a wide hem) from an error.</li>
  <li>Click <b>⌷ SA</b> again to turn the overlay off.</li>
</ol>
<h3>Symmetry &amp; mirror pairs</h3>
<ul>
  <li><b>Symmetry.</b> The <b>Selected piece</b> panel shows how far a piece deviates from its own vertical mirror — “symmetric ±x” (e.g. a waistband) or “asymmetric (x)”. A quick check for pieces that should be cut on the fold.</li>
  <li><b>Mirror pairs.</b> The <b>File</b> panel notes when it detects left/right mirror‑pair pieces (matched by size, dimensions and mirrored overlay).</li>
</ul>
<h3>Pattern check (✔ QC)</h3>
<p>Click <b>✔ QC</b> to run an automatic audit of the whole file. Findings appear in a panel, sorted with <b>errors</b> first and <b>warnings</b> after; click any finding to zoom straight to the piece (and the exact spot for geometry issues). Re‑run with <b>↻</b> or export the list with <b>⬇</b>.</p>
<ul>
  <li><b>Errors</b> — no cut line, cut line not closed, cut line self‑intersects, a graded set missing one or more sizes, or notch/drill counts that differ between sizes of the same piece.</li>
  <li><b>Warnings</b> — duplicate / zero‑length points on the cut line, a missing grain line, or a mirror pair whose notch counts don’t match.</li>
</ul>
${figure(M.qc,"The QC panel lists findings by severity — <b style='color:#ff6b6b'>errors</b> first, then <b style='color:#ffb454'>warnings</b>. Clicking a finding zooms to the piece and the exact spot (shown here by the red locator ring).")}
<div class="tip">A clean file reads “✓ All checks passed.” QC results are also included in the PDF report and as a tab in the Spec workbook, so a factory gets the same audit you see.</div>
<h3>Points of measure (📐 POM)</h3>
<p>A point of measure is a measurement you define once — a chest width, an armhole length, a total waist — that the tool then <b>calculates automatically for every size</b> and flags if a size grades unevenly. This is the heart of a graded spec.</p>
<p>Click <b>📐 POM</b> to open the points‑of‑measure panel (top‑left). Define a measure by choosing one of three types:</p>
<ol>
  <li><b>＋ P–P (point‑to‑point)</b> — for widths and lengths. Click the button, then click two points on the pattern. Each click snaps to the nearest vertex or edge (a magenta marker confirms the lock‑on). After the second point the name/tolerance box opens.</li>
  <li><b>＋ Seam</b> — for a length that follows a curve (armhole, neckline). Click the button, then click two points on the <b>same</b> line; the tool measures along the edge between them.</li>
  <li><b>＋ Girth</b> — for a value made of several parts (e.g. total waist = front + back). Click the button, then add segments one at a time: switch each segment between <b>P–P</b> and <b>Seam</b>, click its points, and repeat. The running segment count shows in the panel. Click <b>✓ Finish</b> when all segments are added.</li>
</ol>
<p>Then:</p>
<ol>
  <li><b>Name it and set a tolerance.</b> Give the measure a name (e.g. “Chest width”) and a <b>grade tolerance (±)</b>. The tolerance is entered in your current display units — the field label follows the unit selector. Click <b>Save</b>.</li>
  <li><b>Read it across sizes.</b> Click the measure in the list to expand it. You’ll see its value for every size; a size is <b>flagged</b> when its grade step differs from the others by more than the tolerance — catching a mis‑graded size before it ships.</li>
  <li><b>Jump to a size.</b> Click any size box in the expanded view to isolate and zoom to that size’s piece, with the measurement drawn on it.</li>
  <li><b>Edit or remove.</b> Re‑select to change the name/tolerance; click the <b>✕</b> on a measure to delete it.</li>
</ol>
${figure(M.pom,"A point‑to‑point <b>Chest width</b> defined once (left, snapped to two vertices) is calculated for every size in the panel (right). The <b style='color:#ffb454'>XL</b> box is flagged amber because its grade step exceeds the ±0.3 tolerance.")}
<p><b>Where they’re saved.</b> Points of measure are written into the DXF when you press <b>💾 Save DXF</b>, so they reload automatically the next time you open the file (the tab shows a <b>•</b> until you save). Use <b>⬇ Export .pomset</b> / <b>⬆ Import .pomset</b> only when you want to copy the same set of measures onto a <i>different</i> style.</p>
<h3>Exports</h3>
<p>Several ways to get work out of the tool, each a single click in the toolbar:</p>
<ul>
  <li><b>🖼 PNG</b> — saves a snapshot of exactly what’s on screen as an image file. Frame the view how you want it first (zoom, pan, layers), then click.</li>
  <li><b>📄 PDF report</b> — opens a printable report in a new tab containing the view snapshot, the <b>QC results</b>, the <b>graded points‑of‑measure</b> chart, and a table of every annotation (type, note, category, piece with English translation, measurement, author, date). In the print dialog choose <b>“Save as PDF”</b> as the destination. <span style="color:var(--muted)">If nothing opens, allow pop‑ups for the site.</span></li>
  <li><b>📊 Spec (.xlsx)</b> — downloads an Excel workbook with separate <b>mm / cm / inch</b> tabs; each lists every piece × size with width, height, perimeter, area and the deltas vs the sample size, plus a translated‑name column. It also adds a <b>Grade rules</b> tab (when a <code>.rul</code> is loaded), a <b>Points of measure</b> tab, a <b>QC report</b> tab, and a <b>Marker (yield)</b> tab.</li>
  <li><b>🧮 Yield</b> — a fabric marker &amp; yield estimate: choose a fabric width and scope (one size, or one of each size), and it nests the pieces and reports the <b>marker length</b>, <b>fabric used</b> (m / yd) and <b>utilisation %</b>, with a visual marker layout you can Save as PDF. Great for costing. <span style="color:var(--muted)">It’s a bounding‑box estimate; a professional marker interlocks pieces and will use a bit less fabric.</span></li>
  <li><b>📋 Tech Pack</b> — one consolidated document assembling the pattern snapshot, piece list (with materials, notches, drills), materials summary, graded POM chart, QC results, fabric yield, and annotations — ready to <b>Save as PDF</b> and hand to a factory.</li>
  <li><b>💾 Save DXF</b> — writes your annotations and points of measure back into the DXF file (see §9).</li>
</ul>
<h3>Printing at actual size (🖨 1:1)</h3>
<p>Use this to print a piece full‑size on paper — for a physical check or to cut a test.</p>
<ol>
  <li>Frame the piece(s) you want (isolate a piece, or show all). Click <b>🖨 1:1</b>. A new tab opens with a cover page followed by the pattern split into tiles across US Letter pages.</li>
  <li>Print that tab. <b>Crucially, set scale to 100% / “Actual size” and turn OFF “Fit to page” or any scaling</b> — otherwise the print won’t be true size.</li>
  <li>On the printed cover page, measure the <b>50&nbsp;mm calibration bar</b> with a ruler to confirm it’s exactly 50&nbsp;mm. If it’s off, your print scaling is still on.</li>
  <li>Trim each tile to its border and tape them together using the <b>R#·C#</b> (row·column) labels to line them up.</li>
</ol>

<h2 id="install">8 · Install as an app &amp; open .dxf directly</h2>
<p>You can run the DXF Tool like a normal desktop application and even make it the default program for <code>.dxf</code> files, so a double‑click opens the pattern instantly. This uses your browser’s built‑in app install and works in <b>Chrome or Edge</b>.</p>
<h3>Install it</h3>
<ol>
  <li>Visit the site once in Chrome or Edge and sign in.</li>
  <li>Click <b>⤓ Install</b> in the toolbar when it appears, or click the small install icon on the right of the browser’s address bar.</li>
  <li>Confirm the prompt. The tool now has its own window and icon, and opens without browser tabs and toolbars.</li>
</ol>
<h3>Open .dxf files by double‑click</h3>
<ol>
  <li>After installing, right‑click any <code>.dxf</code> file on your computer and choose <b>Open with → Choose another app</b> (Windows) or <b>Get Info → Open with</b> (Mac).</li>
  <li>Pick the installed DXF Tool and set it as the default.</li>
  <li>From then on, double‑clicking a <code>.dxf</code> opens it straight in the tool — each file in its own tab.</li>
</ol>
<div class="warn">Install and “open directly” require the <b>hosted https site</b> (they don’t work when the page is opened from a local file). Safari and Firefox can use every feature of the tool, but don’t support installing it or registering it as the <code>.dxf</code> file handler.</div>

<h2 id="saving">9 · Saving, tabs &amp; comparing revisions</h2>
<h3>Saving your work</h3>
<ol>
  <li>Whenever a file has changes that aren’t saved yet — new annotations, edited notes, added points of measure — its tab shows a <b>•</b> dot.</li>
  <li>Click <b>💾 Save DXF</b>. Your annotations and points of measure are written into the DXF itself.</li>
  <li>If you opened the file with <b>📂 Open</b> (in Chrome/Edge) or via the file handler, the tool saves <b>in place</b> — the first time it asks for one‑time permission to edit that file; click Allow. Otherwise it downloads an annotated copy alongside your original.</li>
</ol>
<div class="tip">Everything that gets baked into the DXF — notes in any language, categories, authors, dates and points of measure — reloads automatically the next time anyone opens that file, so the pattern is self‑contained.</div>
<h3>Auto‑save</h3>
<p>Turn on the <b>💾 Auto‑save</b> switch in the sidebar’s File section to have the tool write your changes to the DXF automatically, a moment after you stop editing — no need to press Save DXF.</p>
<ol>
  <li>Open the file with <b>📂 Open</b> (or by double‑click if you’ve set the tool as the <code>.dxf</code> handler) in <b>Chrome or Edge</b>. This is what gives the tool permission to write back to the actual file.</li>
  <li>Tick <b>💾 Auto‑save</b>. The first save may ask for one‑time permission to edit the file — click Allow.</li>
  <li>Edit as normal. The status next to the switch shows <b>“Unsaved changes…”</b> then <b>“Saved 3:42 PM”</b> after each automatic save. Your preference is remembered for next time.</li>
</ol>
<div class="warn">Auto‑save writes <b>in place</b>, so it only works for files opened via <b>📂 Open</b> in Chrome/Edge. If a file was dragged in, or you’re in Safari/Firefox, the switch shows “Open via 📂 Open (Chrome/Edge) to auto‑save” and you should use <b>💾 Save DXF</b> (which downloads a copy) instead.</div>
<h3>Tabs &amp; unsaved changes</h3>
<ul>
  <li>Switch between open files by clicking their tabs; add another with <b>+</b>.</li>
  <li>Closing a tab that has unsaved changes prompts you to <b>Save</b>, <b>Save As…</b> (download a separate copy), <b>Discard</b>, or <b>Cancel</b> — so you never lose work by accident.</li>
  <li><b>Undo / redo</b> (<kbd>Ctrl/Cmd+Z</kbd> and <kbd>Ctrl/Cmd+Shift+Z</kbd>) is multi‑level and independent per tab.</li>
</ul>
<h3>Compare two revisions</h3>
<ol>
  <li>Open both versions of the pattern (each in its own tab).</li>
  <li>With one version active, open the <b>Compare</b> dropdown in the sidebar’s File panel and pick the other version.</li>
  <li>The other revision’s matching pieces overlay the current view in <b>dashed magenta</b>, aligned by centroid, with a per‑piece <b>Δ</b> deviation label (“= match” when within tolerance) — a fast way to see exactly what moved between versions.</li>
  <li>Click <b>⇄ Diff</b> (next to the Compare dropdown) for a written <b>“what changed” report</b>: pieces added, pieces removed, and a table of changed pieces with each one’s max deviation and width/height change. Save it as PDF for a revision record.</li>
  <li>Set the dropdown back to <b>Compare: none</b> to clear the overlay.</li>
</ol>

<h2 id="keys">10 · Keyboard shortcuts</h2>
<table class="kbds"><tbody>
<tr><td><kbd>V</kbd></td><td>Pan / select</td><td><kbd>M</kbd></td><td>Measure (straight)</td></tr>
<tr><td><kbd>S</kbd></td><td>Seam / curved length</td><td><kbd>P</kbd></td><td>Point note</td></tr>
<tr><td><kbd>L</kbd></td><td>Arrow / leader</td><td><kbd>B</kbd></td><td>Box / region</td></tr>
<tr><td><kbd>X</kbd></td><td>Move pieces</td><td><kbd>F</kbd></td><td>Fit to view</td></tr>
<tr><td><kbd>R</kbd></td><td>Toggle rulers</td><td><kbd>G</kbd></td><td>Grade nest</td></tr>
<tr><td><kbd>Esc</kbd></td><td>Cancel / close editor</td><td></td><td></td></tr>
<tr><td><kbd>Ctrl/Cmd+Z</kbd></td><td>Undo</td><td><kbd>Ctrl/Cmd+Shift+Z</kbd></td><td>Redo</td></tr>
<tr><td><kbd>Shift</kbd> (drag ruler end)</td><td>Snap angle to 15°</td><td></td><td></td></tr>
</tbody></table>
<p style="color:var(--muted);font-size:13px">On Mac use <kbd>Cmd</kbd>; on Windows use <kbd>Ctrl</kbd>. Shortcuts are ignored while you’re typing in a note field.</p>

<h2 id="tips">11 · Tips &amp; tricks</h2>
<h3>Measuring like a patternmaker</h3>
<ul>
  <li><b>Walk the seam.</b> Use <b>〰 Seam</b> to measure a curved edge length, then measure the edge it sews to — the readout flags whether they match. Catch mismatches before they hit the sample room or the 3D drape.</li>
  <li><b>Snap corner‑to‑corner.</b> With the guide ruler (<b>⇥ Ruler</b>), drag an end near a pattern line — it locks onto the exact corner/edge (magenta marker).</li>
  <li><b>Lock an angle.</b> Hold <kbd>Shift</kbd> while dragging a ruler end to snap to 15° steps (great for straight grain, 45° bias, right angles).</li>
  <li><b>Keep a measurement.</b> Select a ruler → <b>📌 Annotate</b> to turn it into a saved dimension that travels with the file.</li>
</ul>
<h3>Working across sizes</h3>
<ul>
  <li><b>Load the <code>.rul</code> with the <code>.dxf</code></b> so size order, sample size and the grade table are exact.</li>
  <li><b>Isolate before you nest.</b> Turn on <b>▤ Nest</b> and click a single base piece for a clean, uncluttered size overlay; add <b>↗ Grade</b> to see growth direction at each grade point.</li>
  <li><b>Check the pockets.</b> Pieces that don’t grade show no grade vectors — a quick sanity check.</li>
</ul>
<h3>Reviewing &amp; sharing</h3>
<ul>
  <li><b>Tag every note.</b> Set your name once (sidebar → “Your name”); annotations are stamped with author, date and the nearest piece.</li>
  <li><b>Colour‑code by intent.</b> Use categories (Issue = red, To‑do = blue, Approved = green…) so a factory can scan the pattern at a glance.</li>
  <li><b>Compare styles in tabs.</b> Open several files; a <b>•</b> on a tab means unsaved changes. Use the <b>Compare</b> dropdown to overlay two revisions and read the Δ per piece.</li>
  <li><b>Filter your notes.</b> On a busy pattern, filter the Annotations list by category (e.g. only Issues) or piece, then export just those with <b>⬇ CSV</b>.</li>
  <li><b>Export the right thing:</b> <b>PNG</b> for a quick image, <b>PDF</b> for a report with the full annotation list, <b>Spec (.xlsx)</b> for measurements across every size (mm/cm/inch tabs + grade rules), <b>🖨 1:1</b> to print a piece at actual size for a physical check.</li>
</ul>
<h3>Getting around</h3>
<ul>
  <li><b>All tools always fit.</b> On smaller screens the toolbar wraps onto a second row — nothing is hidden. The <b>Units</b> selector (mm · cm · inch) lives at the right of the toolbar.</li>
  <li><b>Undo freely.</b> <kbd>Ctrl/Cmd+Z</kbd> is multi‑level and per‑tab, so experiment without worry.</li>
  <li><b>Turn on 🌐 EN</b> for English piece names; hover any name to see the original.</li>
  <li><b>Install it</b> (Chrome/Edge) for a dedicated window and to open <code>.dxf</code> files by double‑click.</li>
</ul>

<h2 id="notes">12 · Notes &amp; limits</h2>
<ul>
  <li>Guide rulers are measuring aids only — they aren’t saved into the DXF (convert one to an annotation to keep it).</li>
  <li>The English translation covers common garment terms; unusual terms stay in their original characters (hover to see the original).</li>
  <li>Seam‑allowance check needs a piece that has both a cut line and a sew line.</li>
  <li>The tool reads AAMA/ASTM DXF; it’s tuned to these exports and may need adjustment for other CAD systems.</li>
</ul>

<p style="color:var(--muted);font-size:12.5px;margin-top:30px">Honeydew DXF Tool — user manual. Diagrams are faithful reproductions of the live interface.</p>
</div></body></html>`;

// style the section numbers as badges
html = html.replace(/<h2 id="([^"]+)">(\d+)\s*·\s*([\s\S]*?)<\/h2>/g,
  '<h2 id="$1"><span class="n">$2</span> $3</h2>');
fs.writeFileSync(OUT, html);
console.log("wrote manual:", OUT, "("+html.length+" bytes)");
console.log("toolbar buttons laid out:", n, "| rows tall:", TBH);
