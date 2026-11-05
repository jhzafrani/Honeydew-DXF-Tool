// Regression: some pattern CADs reuse one BLOCK name for several pieces in a size
// (two different backs both "STYLE.BACK.XS"; a fabric + interfacing copy of one piece).
// Every block must become its own piece, placed by its own INSERT, with a unique name.
// Real files (64944.dxf: 60 blocks, 64955.dxf: 85) are checked too when DXF_SAMPLES points at them.
const fs=require("fs"), path=require("path"); const {JSDOM}=require("jsdom");
const APP=path.join(__dirname,"..","..","apparel-dxf-viewer.html");
function makeCtx(){const h={measureText:t=>({width:6})};return new Proxy(h,{get:(t,k)=>(k in t)?t[k]:(()=>{}),set:()=>true});}
const dom=new JSDOM(fs.readFileSync(APP,"utf8"),{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>makeCtx();
  w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:900,height:640,right:900,bottom:640});
  w.requestAnimationFrame=cb=>0; w.alert=()=>{}; w.TextDecoder=TextDecoder;
}});
function fail(m){console.error("FAIL:",m);process.exit(1);}

// --- synthetic AAMA-style file: per size BACK(cat 0), FRONT(cat 1), BACK(cat 2),
//     VENT fabric(cat 3), VENT interfacing(cat 3, no INSERT of its own), VENT net(cat 4)
const NL="\r\n", g=(c,v)=>c+NL+v+NL;
const text=s=>g("  0","TEXT")+g("  8","1")+g(" 10","0.0")+g(" 20","0.0")+g("  1",s);
const rect=(x,y,w,h)=>g("  0","POLYLINE")+g("  8","1")+g(" 66","1")+g(" 70","1")
  +[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([a,b])=>g("  0","VERTEX")+g("  8","1")+g(" 10",a.toFixed(3))+g(" 20",b.toFixed(3))).join("")+g("  0","SEQEND");
const PIECES=[ // term, category, material, x of the outline (each piece sits in its own column)
  ["BACK",0,"FabricA",0], ["FRONT",1,"FabricA",1000], ["BACK",2,"FabricA",2000],
  ["VENT",3,"FabricB",3000], ["VENT",3,"Interfacing",3000], ["VENT",4,"Net",4000]];
const SIZES=["XS","S"];
let blocksTxt="", entsTxt="";
SIZES.forEach(sz=>PIECES.forEach(([t,cat,mat,x],k)=>{
  const name="STYLE."+t+"."+sz;
  blocksTxt+=g("  0","BLOCK")+g("  8","1")+g("  2",name)+g(" 70","0")+g(" 10","0.0")+g(" 20","0.0")
    +rect(x,0,100,200)+text("Piece Name: "+name)+text("Size: "+sz)+text("Quantity: 1")+text("Material: "+mat)+text("Category: "+cat)
    +g("  0","ENDBLK");
  if(k!==4) entsTxt+=g("  0","INSERT")+g("  8","1")+g("  2",name)+g(" 10",String(x+7))+g(" 20","0.0");   // offset = own column + 7
}));
const SYN=g("999","ANSI/AAMA")+g("  0","SECTION")+g("  2","BLOCKS")+blocksTxt+g("  0","ENDSEC")
  +g("  0","SECTION")+g("  2","ENTITIES")+entsTxt+g("  0","ENDSEC")+g("  0","EOF");

setTimeout(()=>{try{
  const w=dom.window, parse=w.__parseDXF;
  const r=parse(new TextEncoder().encode(SYN));
  const want=SIZES.length*PIECES.length;
  if(r.pieces.length!==want) fail("expected "+want+" pieces (one per BLOCK), got "+r.pieces.length);
  console.log("  ok: every BLOCK becomes a piece even when names repeat ("+want+")");

  const names=r.pieces.map(p=>p.meta.name);
  if(new Set(names).size!==names.length) fail("piece names must be unique: "+names.join(", "));
  const xs=r.pieces.filter(p=>p.meta.size==="XS").map(p=>p.meta.name);
  const expXS=["STYLE.BACK.XS","STYLE.FRONT.XS","STYLE.BACK (2).XS","STYLE.VENT.XS","STYLE.VENT (2).XS","STYLE.VENT (3).XS"];
  if(JSON.stringify(xs)!==JSON.stringify(expXS)) fail("XS names "+JSON.stringify(xs)+" != "+JSON.stringify(expXS));
  if(w.displayTerm("STYLE.BACK (2).XS")!=="BACK (2)") fail("display term of a repeat should keep its (2)");
  console.log("  ok: first keeps its name, repeats get (2), (3) on the piece term");

  // grade grouping keys on the base name: each base must hold exactly one piece per size
  const byBase={}; r.pieces.forEach(p=>{ const b=w._baseName(p); (byBase[b]=byBase[b]||[]).push(p.meta.size); });
  Object.entries(byBase).forEach(([b,s])=>{ if(s.slice().sort().join()!==SIZES.slice().sort().join()) fail("base "+b+" groups sizes "+s.join()); });
  console.log("  ok: repeats group across sizes by their own base ("+Object.keys(byBase).length+" bases)");

  // placement: each piece moves by its OWN insert (+x+7); the interfacing copy shares the fabric VENT's
  r.pieces.forEach((p,i)=>{
    const [,, ,x]=PIECES[i%PIECES.length], minx=p.bbox[0];
    if(Math.abs(minx-(x+x+7))>1e-6) fail(p.meta.name+" ("+p.meta.material+") placed at x="+minx+", expected "+(x+x+7));
  });
  console.log("  ok: each piece is placed by its own INSERT; the same-category interfacing copy shares its fabric piece's");

  // control: a file without repeats is untouched
  const one=g("  0","SECTION")+g("  2","BLOCKS")+g("  0","BLOCK")+g("  8","1")+g("  2","STYLE.SOLO.M")+rect(0,0,10,10)
    +text("Piece Name: STYLE.SOLO.M")+text("Size: M")+g("  0","ENDBLK")+g("  0","ENDSEC")
    +g("  0","SECTION")+g("  2","ENTITIES")+g("  0","INSERT")+g("  8","1")+g("  2","STYLE.SOLO.M")+g(" 10","5")+g(" 20","0")+g("  0","ENDSEC")+g("  0","EOF");
  const r1=parse(new TextEncoder().encode(one));
  if(r1.pieces.length!==1 || r1.pieces[0].meta.name!=="STYLE.SOLO.M" || r1.pieces[0].bbox[0]!==5) fail("unique-name file changed: "+JSON.stringify(r1.pieces.map(p=>[p.meta.name,p.bbox])));
  console.log("  ok: a file without repeated names parses exactly as before");

  // --- ET2000-style file: "Piece Name:" carries no size (the size is only in "Size:"), and two
  //     styles in one file both have a BACK (pant back cat 0, jacket back cat 2). Repeats must be
  //     numbered within a size, so every size's pant back stays "BACK" and every jacket back is
  //     "BACK (2)" — otherwise each size gets its own number and Nest/Grade see one size per piece.
  const PL=[["BACK",0,0],["FRONT",1,1000],["BACK",2,2000]], SZ3=["XS","S","M"];
  let bT="", eT="";
  SZ3.forEach(sz=>PL.forEach(([t,cat,x])=>{
    bT+=g("  0","BLOCK")+g("  8","1")+g("  2",t+"-"+sz)+g(" 70","0")+g(" 10","0.0")+g(" 20","0.0")
      +rect(x,0,100,200)+text("Piece Name: "+t)+text("Size: "+sz)+text("Quantity: 1")+text("Category: "+cat)+g("  0","ENDBLK");
    eT+=g("  0","INSERT")+g("  8","1")+g("  2",t+"-"+sz)+g(" 10","0.0")+g(" 20","0.0");
  }));
  const ET=g("999","ANSI/AAMA")+g("  0","SECTION")+g("  2","BLOCKS")+bT+g("  0","ENDSEC")
    +g("  0","SECTION")+g("  2","ENTITIES")+eT+g("  0","ENDSEC")+g("  0","EOF");
  const re=parse(new TextEncoder().encode(ET));
  if(re.pieces.length!==9) fail("size-less names: expected 9 pieces, got "+re.pieces.length);
  SZ3.forEach(sz=>{
    const got=re.pieces.filter(p=>p.meta.size===sz).map(p=>p.meta.name);
    if(JSON.stringify(got)!==JSON.stringify(["BACK","FRONT","BACK (2)"])) fail("size-less names, size "+sz+": "+JSON.stringify(got)+" != [\"BACK\",\"FRONT\",\"BACK (2)\"]");
  });
  console.log("  ok: size-less piece names are numbered within each size (BACK, FRONT, BACK (2))");
  const byB={}; re.pieces.forEach(p=>{ const b=w._baseName(p); (byB[b]=byB[b]||[]).push(p.meta.size+"/"+p.meta.category); });
  const wantB={"BACK":["XS/0","S/0","M/0"],"FRONT":["XS/1","S/1","M/1"],"BACK (2)":["XS/2","S/2","M/2"]};
  if(JSON.stringify(byB)!==JSON.stringify(wantB)) fail("size-less names group as "+JSON.stringify(byB)+", expected "+JSON.stringify(wantB));
  console.log("  ok: each repeat groups across all sizes with its own category (3 bases × 3 sizes)");

  // optional: the real files that exposed this (not committed — vendor patterns)
  const dir=process.env.DXF_SAMPLES;
  if(dir){ [["64944.dxf",60],["64955.dxf",85]].forEach(([f,n])=>{
    const fp=path.join(dir,f); if(!fs.existsSync(fp)){ console.log("  skip: "+fp+" not found"); return; }
    const rr=parse(new Uint8Array(fs.readFileSync(fp)));
    if(rr.pieces.length!==n) fail(f+": expected "+n+" pieces, got "+rr.pieces.length);
    if(new Set(rr.pieces.map(p=>p.meta.name)).size!==n) fail(f+": piece names not unique");
    console.log("  ok: "+f+" → "+n+" pieces, all names unique");
  });
  // 37984, 37960.dxf: pant + jacket in one ET2000 export, both with a 后片 (Back) in all 6 sizes
  { const f="37984, 37960.dxf", fp=path.join(dir,f);
    if(!fs.existsSync(fp)) console.log("  skip: "+fp+" not found");
    else {
      const rr=parse(new Uint8Array(fs.readFileSync(fp)));
      if(rr.pieces.length!==84) fail(f+": expected 84 pieces, got "+rr.pieces.length);
      const gb={}; rr.pieces.forEach(p=>{ const b=w._baseName(p); (gb[b]=gb[b]||[]).push(p); });
      const bases=Object.keys(gb);
      if(bases.length!==14) fail(f+": expected 14 grade groups, got "+bases.length+": "+bases.join(", "));
      bases.forEach(b=>{ const s=gb[b].map(p=>p.meta.size).join(" "), c=new Set(gb[b].map(p=>p.meta.category));
        if(s!=="XXS XS S M L XL") fail(f+": group "+b+" has sizes "+s);
        if(c.size!==1) fail(f+": group "+b+" mixes categories "+[...c].join(",")); });
      if(gb["后片"][0].meta.category!=="0" || gb["后片 (2)"][0].meta.category!=="8") fail(f+": 后片 / 后片 (2) are not the pant (cat 0) / jacket (cat 8) backs");
      console.log("  ok: "+f+" → 84 pieces in 14 groups × 6 sizes; 后片 = pant back, 后片 (2) = jacket back");
    } }
  }
  console.log("PASS dupnames");
  process.exit(0);
}catch(e){ fail(e.stack||e); }},300);
