/* Realistic in-context tool mockups for the DXF Tool user manual.
   Each export is an SVG string that mirrors the live dark UI.
   Used inline in the HTML manual and rendered to PNG (cairosvg) for the PDF. */

const C = {                       // palette matching the app
  bg:"#0f1216", panel:"#171b22", panel2:"#1e242d", line:"#2a323d",
  cut:"#e6eaf0", sew:"#4c9aff", grain:"#37c98b", notch:"#ffd93d", drill:"#ff6b6b",
  measure:"#37c98b", seamA:"#ff9f43", seamB:"#22d3ee", ruler:"#22d3ee", snap:"#ff4dd2",
  pom:"#22d3ee", muted:"#8a94a3", txt:"#e6eaf0", amber:"#ffb454", red:"#ff6b6b", green:"#37c98b",
};
const FONT = 'font-family="Inter,-apple-system,Segoe UI,Roboto,sans-serif"';

// A believable front-bodice outline (SVG y-down). CF is the straight left edge.
const PIECE_D = "M70,80 C70,60 130,52 160,56 L215,90 C255,120 220,165 196,196 L246,344 L70,352 Z";
const CX=150, CY=210;             // approx centroid for scaling in the nest figure

function frame(w,h,inner){
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" xmlns="http://www.w3.org/2000/svg" ${FONT}>`
    + `<rect x="0" y="0" width="${w}" height="${h}" rx="12" fill="${C.bg}"/>`
    + inner + `</svg>`;
}
function title(t,x=18,y=26){ return `<text x="${x}" y="${y}" font-size="13" fill="${C.muted}">${t}</text>`; }
function dot(x,y,r,fill){ return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`; }
function arrowUp(x,y){ return `<polygon points="${x-6},${y+10} ${x},${y-2} ${x+6},${y+10}" fill="${C.grain}"/>`; }
function arrowDn(x,y){ return `<polygon points="${x-6},${y-10} ${x},${y+2} ${x+6},${y-10}" fill="${C.grain}"/>`; }

// the shared pattern piece (outline + grain + notches + name badge)
function piece(){
  return `
  <path d="${PIECE_D}" fill="#151a21" stroke="${C.cut}" stroke-width="2" stroke-linejoin="round"/>
  <line x1="135" y1="122" x2="135" y2="298" stroke="${C.grain}" stroke-width="2"/>
  ${arrowUp(135,122)}${arrowDn(135,298)}
  <circle cx="206" cy="140" r="3.2" fill="${C.notch}"/>
  <circle cx="223" cy="270" r="3.2" fill="${C.notch}"/>
  <g><circle cx="150" cy="250" r="4" fill="none" stroke="${C.drill}" stroke-width="1.4"/>
     <line x1="142" y1="250" x2="158" y2="250" stroke="${C.drill}" stroke-width="1.4"/>
     <line x1="150" y1="242" x2="150" y2="258" stroke="${C.drill}" stroke-width="1.4"/></g>
  <rect x="122" y="200" width="56" height="20" rx="5" fill="rgba(13,16,21,0.78)"/>
  <text x="150" y="214" font-size="12" font-weight="600" fill="${C.txt}" text-anchor="middle">Front</text>`;
}

// readout card helper (rounded panel with a colored border)
function card(x,y,w,h,border){
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="rgba(13,16,21,0.95)" stroke="${border||C.line}" stroke-width="1.2"/>`;
}
function pill(x,y,w,h,fill,stroke){
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="${fill}" ${stroke?`stroke="${stroke}" stroke-width="1"`:""}/>`;
}

/* ---------- 1. Straight measure ---------- */
const measure = (()=>{
  const ax=70, ay=182, bx=196, by=190;   // chest measure endpoints
  let s = title("Measure — straight line (chest width)");
  s += piece();
  // delta right-triangle (faint)
  s += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${ay}" stroke="${C.muted}" stroke-width="1" stroke-dasharray="3,3" opacity="0.6"/>`;
  s += `<line x1="${bx}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${C.muted}" stroke-width="1" stroke-dasharray="3,3" opacity="0.6"/>`;
  s += `<text x="${(ax+bx)/2}" y="${ay-6}" font-size="10" fill="${C.muted}" text-anchor="middle">ΔX</text>`;
  // main measure line
  s += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${C.measure}" stroke-width="2.2" stroke-dasharray="5,4"/>`;
  s += dot(ax,ay,4,C.measure)+dot(bx,by,4,C.measure);
  // readout card
  const rx=430, ry=296, rw=222, rh=80;
  s += card(rx,ry,rw,rh);
  s += `<text x="${rx+14}" y="${ry+22}" font-size="11.5" fill="${C.muted}">Distance</text>`;
  s += `<text x="${rx+rw-14}" y="${ry+24}" font-size="17" font-weight="700" fill="${C.measure}" text-anchor="end">24.6 cm</text>`;
  s += `<text x="${rx+14}" y="${ry+44}" font-size="12" fill="${C.txt}">ΔX 24.5 cm&#160;&#160;&#160;ΔY 1.2 cm</text>`;
  s += pill(rx+14, ry+54, 66, 20, C.panel2, C.line) + `<text x="${rx+47}" y="${ry+68}" font-size="11.5" fill="${C.txt}" text-anchor="middle">Pin</text>`;
  s += `<text x="${rx+92}" y="${ry+68}" font-size="10.5" fill="${C.muted}">keep as annotation</text>`;
  return frame(680,400,s);
})();

/* ---------- 2. Seam length / walk-the-seam ---------- */
const seam = (()=>{
  let s = title("Seam — walk-the-seam (armhole vs sleeve cap)");
  s += piece();
  // Seam A = front armhole (orange), traced over the outline
  s += `<path d="M215,90 C255,120 220,165 196,196" fill="none" stroke="${C.seamA}" stroke-width="4" stroke-linecap="round"/>`;
  s += dot(215,90,4.5,C.seamA)+dot(196,196,4.5,C.seamA);
  s += `<text x="243" y="150" font-size="11" font-weight="700" fill="${C.seamA}">A</text>`;
  // a sleeve-cap piece on the right, Seam B = its cap curve (cyan)
  s += `<path d="M360,250 C360,150 420,120 470,120 C520,120 580,150 580,250 Z" fill="#151a21" stroke="${C.cut}" stroke-width="2" stroke-linejoin="round"/>`;
  s += `<rect x="440" y="235" width="60" height="20" rx="5" fill="rgba(13,16,21,0.78)"/><text x="470" y="249" font-size="12" font-weight="600" fill="${C.txt}" text-anchor="middle">Sleeve</text>`;
  s += `<path d="M360,250 C360,150 420,120 470,120 C520,120 580,150 580,250" fill="none" stroke="${C.seamB}" stroke-width="4" stroke-linecap="round"/>`;
  s += dot(360,250,4.5,C.seamB)+dot(580,250,4.5,C.seamB);
  s += `<text x="466" y="112" font-size="11" font-weight="700" fill="${C.seamB}">B</text>`;
  // readout
  const rx=250, ry=300, rw=232, rh=80; s += card(rx,ry,rw,rh,C.seamA);
  s += `<text x="${rx+14}" y="${ry+24}" font-size="13" fill="${C.seamA}"><tspan font-weight="700">Seam A</tspan>  21.4 cm</text>`;
  s += `<text x="${rx+14}" y="${ry+44}" font-size="13" fill="${C.seamB}"><tspan font-weight="700">Seam B</tspan>  21.6 cm</text>`;
  s += `<text x="${rx+14}" y="${ry+65}" font-size="13" fill="${C.txt}">Δ <tspan font-weight="700" fill="${C.green}">0.2 cm</tspan>  <tspan fill="${C.green}">✓ match</tspan></text>`;
  return frame(680,400,s);
})();

/* ---------- 3. Guide ruler ---------- */
const ruler = (()=>{
  let s = title("Guide ruler — snaps to corners, rotate &amp; resize");
  s += piece();
  const x0=80,y0=305, x1=300,y1=118;                 // diagonal ruler
  const dx=x1-x0, dy=y1-y0, len=Math.hypot(dx,dy), ux=dx/len, uy=dy/len, nx=-uy, ny=ux;
  s += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${C.ruler}" stroke-width="2"/>`;
  // ticks every ~18px, taller every 5th
  let ticks="";
  for(let d=0,k=0; d<=len+0.1; d+=len/12, k++){
    const cx=x0+ux*d, cy=y0+uy*d, tl=(k%5===0)?9:5;
    ticks += `<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx-nx*tl).toFixed(1)}" y2="${(cy-ny*tl).toFixed(1)}" stroke="${C.ruler}" stroke-width="1.3"/>`;
  }
  s += ticks;
  // end handles
  s += `<rect x="${x0-3.5}" y="${y0-3.5}" width="7" height="7" fill="${C.bg}" stroke="${C.ruler}" stroke-width="1.5"/>`;
  s += `<rect x="${x1-3.5}" y="${y1-3.5}" width="7" height="7" fill="${C.bg}" stroke="${C.ruler}" stroke-width="1.5"/>`;
  // 0 anchor
  s += dot(x0,y0,5,C.ruler) + `<text x="${x0}" y="${y0+3}" font-size="8" font-weight="700" fill="${C.bg}" text-anchor="middle">0</text>`;
  // snap marker at the top end (locked on a corner)
  s += `<rect x="${x1-6}" y="${y1-6}" width="12" height="12" fill="none" stroke="${C.snap}" stroke-width="1.6"/>`;
  s += `<line x1="${x1-10}" y1="${y1}" x2="${x1+10}" y2="${y1}" stroke="${C.snap}" stroke-width="1.4"/><line x1="${x1}" y1="${y1-10}" x2="${x1}" y2="${y1+10}" stroke="${C.snap}" stroke-width="1.4"/>`;
  s += `<text x="${x1+14}" y="${y1-6}" font-size="10.5" fill="${C.snap}">snapped</text>`;
  // length label near far end
  s += `<text x="${x1+14}" y="${y1+14}" font-size="12" font-weight="700" fill="${C.ruler}">31.8 cm</text>`;
  // guide menu
  const mx=350,my=250; s += card(mx,my,210,42,C.ruler);
  s += `<text x="${mx+14}" y="${my+26}" font-size="13" font-weight="700" fill="${C.ruler}">31.8 cm</text>`;
  s += pill(mx+82,my+11,84,20,C.panel2,C.line)+`<text x="${mx+124}" y="${my+25}" font-size="11" fill="${C.txt}" text-anchor="middle">Annotate</text>`;
  s += pill(mx+172,my+11,24,20,C.panel2,C.line)+`<text x="${mx+184}" y="${my+25}" font-size="12" fill="${C.muted}" text-anchor="middle">✕</text>`;
  return frame(680,400,s);
})();

/* ---------- 4. Points of measure (graded across sizes) ---------- */
const pom = (()=>{
  let s = title("Points of measure — one measure, graded across every size");
  s += piece();
  // chest P-P line (cyan) with vertex-snap squares
  const ax=70,ay=182,bx=196,by=190;
  s += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${C.pom}" stroke-width="2.4"/>`;
  s += `<rect x="${ax-5}" y="${ay-5}" width="10" height="10" fill="none" stroke="${C.snap}" stroke-width="1.6"/>`;
  s += `<rect x="${bx-5}" y="${by-5}" width="10" height="10" fill="none" stroke="${C.snap}" stroke-width="1.6"/>`;
  s += `<text x="${(ax+bx)/2}" y="${ay-8}" font-size="10.5" fill="${C.pom}" text-anchor="middle">Chest width</text>`;
  // POM panel on the right
  const px=360, py=54, pw=300, ph=300;
  s += card(px,py,pw,ph,C.pom);
  s += `<text x="${px+16}" y="${py+26}" font-size="13" font-weight="700" fill="${C.txt}">Points of measure</text>`;
  // selected measure row
  s += `<rect x="${px+12}" y="${py+40}" width="${pw-24}" height="34" rx="7" fill="${C.panel2}" stroke="${C.pom}" stroke-width="1.2"/>`;
  s += `<text x="${px+22}" y="${py+61}" font-size="12.5" fill="${C.txt}">Chest width</text>`;
  s += `<text x="${px+pw-22}" y="${py+61}" font-size="12.5" font-weight="700" fill="${C.pom}" text-anchor="end">30.5 cm  ±0.3</text>`;
  // graded size boxes
  const sizes=[["XS","29.2",false],["S","29.9",false],["M","30.5",false],["L","31.2",false],["XL","32.1",true]];
  let bx0=px+16, by0=py+88;
  sizes.forEach((z,i)=>{
    const w=52, gap=2, x=bx0+i*(w+gap), flagged=z[2];
    s += `<rect x="${x}" y="${by0}" width="${w}" height="30" rx="5" fill="#0d1116" ${flagged?`stroke="${C.amber}" stroke-width="1.2"`:""}/>`;
    s += `<text x="${x+w/2}" y="${by0+12}" font-size="10" fill="${flagged?C.amber:C.muted}" text-anchor="middle">${z[0]}</text>`;
    s += `<text x="${x+w/2}" y="${by0+24}" font-size="10.5" font-weight="600" fill="${flagged?C.amber:C.txt}" text-anchor="middle">${z[1]}</text>`;
  });
  s += `<text x="${px+16}" y="${by0+52}" font-size="11" fill="${C.amber}">⚠ XL grade step off &gt; tolerance</text>`;
  s += `<text x="${px+16}" y="${by0+72}" font-size="11" fill="${C.muted}">Click a size to jump to that piece.</text>`;
  // P-P / Seam / Girth add buttons
  const ry=py+ph-40;
  [["+ P–P",0],["+ Seam",78],["+ Girth",162]].forEach(b=>{
    s += pill(px+16+b[1], ry, b[0].length*7+18, 22, C.panel2, C.line);
    s += `<text x="${px+16+b[1]+(b[0].length*7+18)/2}" y="${ry+15}" font-size="11" fill="${C.txt}" text-anchor="middle">${b[0]}</text>`;
  });
  return frame(680,400,s);
})();

/* ---------- 5. Annotations ---------- */
const anno = (()=>{
  let s = title("Annotations — point, arrow &amp; box notes");
  s += piece();
  // point pin (1)
  s += dot(150,250,9,C.notch)+`<text x="150" y="254" font-size="11" font-weight="700" fill="#000" text-anchor="middle">1</text>`;
  // arrow (2) leader
  s += `<line x1="300" y1="120" x2="212" y2="150" stroke="${C.sew}" stroke-width="2"/>`;
  s += `<polygon points="212,150 224,144 222,156" fill="${C.sew}"/>`;
  s += dot(300,120,9,C.sew)+`<text x="300" y="124" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">2</text>`;
  // box (3) region
  s += `<rect x="176" y="300" width="70" height="46" fill="none" stroke="${C.drill}" stroke-width="2" stroke-dasharray="5,3"/>`;
  s += dot(176,300,9,C.drill)+`<text x="176" y="304" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">3</text>`;
  // editor popup
  const ex=330, ey=150, ew=250, eh=150; s += card(ex,ey,ew,eh,C.sew);
  s += `<text x="${ex+14}" y="${ey+24}" font-size="12" fill="${C.txt}"><tspan font-weight="700">↗ Arrow</tspan>  <tspan fill="${C.muted}" font-size="10.5">Front · You · 2026-07-10</tspan></text>`;
  s += `<rect x="${ex+14}" y="${ey+34}" width="${ew-28}" height="44" rx="6" fill="${C.panel2}" stroke="${C.line}"/>`;
  s += `<text x="${ex+22}" y="${ey+52}" font-size="11.5" fill="${C.txt}">Ease neckline 3&#160;mm</text>`;
  // category + palette
  s += pill(ex+14,ey+86,58,20,C.panel2,C.line)+`<text x="${ex+43}" y="${ey+100}" font-size="11" fill="${C.txt}" text-anchor="middle">Issue</text>`;
  [C.notch,C.red,C.sew,"#c78bff",C.green].forEach((col,i)=> s+= `<circle cx="${ex+86+i*16}" cy="${ey+96}" r="6.5" fill="${col}" ${i===1?`stroke="#fff" stroke-width="1.5"`:""}/>`);
  // buttons
  s += pill(ex+ew-118,ey+eh-30,52,22,C.panel2,C.line)+`<text x="${ex+ew-92}" y="${ey+eh-15}" font-size="11" fill="${C.txt}" text-anchor="middle">Cancel</text>`;
  s += pill(ex+ew-60,ey+eh-30,46,22,C.green)+`<text x="${ex+ew-37}" y="${ey+eh-15}" font-size="11" fill="#06231a" text-anchor="middle" font-weight="700">Save</text>`;
  return frame(680,400,s);
})();

/* ---------- 6. Grade nest ---------- */
const nest = (()=>{
  let s = title("Grade nest — every size overlaid, coloured by size");
  const cols=["#ff6b6b","#ffb454","#ffd93d","#37c98b","#4c9aff"];
  const scales=[0.9,0.95,1.0,1.05,1.1];
  scales.forEach((sc,i)=>{
    const tx=(CX*(1-sc)).toFixed(2), ty=(CY*(1-sc)).toFixed(2);
    s += `<path d="${PIECE_D}" transform="translate(${tx},${ty}) scale(${sc})" fill="none" stroke="${cols[i]}" stroke-width="${i===2?2.4:1.4}"/>`;
  });
  // legend
  const lx=420, ly=120; ["XS","S","M","L","XL"].forEach((z,i)=>{
    s += `<rect x="${lx}" y="${ly+i*30}" width="16" height="4" rx="2" fill="${cols[i]}"/>`;
    s += `<text x="${lx+26}" y="${ly+i*30+6}" font-size="12.5" fill="${C.txt}">${z}${i===2?"  (sample)":""}</text>`;
  });
  return frame(680,400,s);
})();

/* ---------- 7. QC panel ---------- */
const qc = (()=>{
  let s = title("Pattern check (QC) — automatic audit by severity");
  s += piece();
  // a red locator ring on the piece (open contour example)
  s += `<circle cx="70" cy="352" r="12" fill="rgba(255,45,85,0.22)" stroke="#ff2d55" stroke-width="2"/>`;
  s += `<line x1="54" y1="352" x2="86" y2="352" stroke="#ff2d55" stroke-width="1.6"/><line x1="70" y1="336" x2="70" y2="368" stroke="#ff2d55" stroke-width="1.6"/>`;
  // QC panel
  const px=330, py=54, pw=330, ph=250; s += card(px,py,pw,ph,C.seamA);
  s += `<text x="${px+16}" y="${py+26}" font-size="13" font-weight="700" fill="${C.txt}">Pattern check  <tspan fill="${C.red}">1 error</tspan> <tspan fill="${C.muted}">·</tspan> <tspan fill="${C.amber}">2 warnings</tspan></text>`;
  const rows=[
    [C.red,"Cut line not closed — Back [S]"],
    [C.amber,"Duplicate points on cut line — Waistband [M]"],
    [C.amber,"No grain line — Pocket [M]"],
  ];
  rows.forEach((r,i)=>{
    const y=py+48+i*40;
    s += `<rect x="${px+12}" y="${y}" width="${pw-24}" height="32" rx="6" fill="${C.panel2}"/>`;
    s += dot(px+26,y+16,5,r[0]);
    s += `<text x="${px+40}" y="${y+20}" font-size="11.5" fill="${C.txt}">${r[1]}</text>`;
  });
  s += `<text x="${px+16}" y="${py+ph-16}" font-size="11" fill="${C.muted}">Click a finding to zoom to the exact spot.</text>`;
  return frame(680,400,s);
})();

const ALL = { measure, seam, ruler, pom, anno, nest, qc };
module.exports = ALL;

// when run directly, write each figure to outputs/mock_<name>.svg
if(require.main===module){
  const fs=require("fs"), path=require("path");
  const dir=__dirname;
  Object.entries(ALL).forEach(([k,v])=>{
    fs.writeFileSync(path.join(dir,"mock_"+k+".svg"), v);
  });
  console.log("wrote", Object.keys(ALL).map(k=>"mock_"+k+".svg").join(", "));
}
