// Regression: a fabric + interfacing copy of one symmetric piece is not a left/right mirror pair.
// Mirror pairs are cut from the same material; a real left/right pair must still be found.
// 64944.dxf has no real mirror pairs (only fabric/interfacing hem vents) — checked when DXF_SAMPLES is set.
const fs=require("fs"), path=require("path"); const {JSDOM}=require("jsdom");
const APP=path.join(__dirname,"..","..","apparel-dxf-viewer.html");
function makeCtx(){const h={measureText:t=>({width:6})};return new Proxy(h,{get:(t,k)=>(k in t)?t[k]:(()=>{}),set:()=>true});}
const dom=new JSDOM(fs.readFileSync(APP,"utf8"),{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>makeCtx();
  w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:900,height:640,right:900,bottom:640});
  w.requestAnimationFrame=cb=>0; w.alert=()=>{}; w.TextDecoder=TextDecoder;
}});
function fail(m){console.error("FAIL:",m);process.exit(1);}

const NL="\r\n", g=(c,v)=>c+NL+v+NL;
const text=s=>g("  0","TEXT")+g("  8","1")+g(" 10","0.0")+g(" 20","0.0")+g("  1",s);
const poly=vs=>g("  0","POLYLINE")+g("  8","1")+g(" 66","1")+g(" 70","1")
  +vs.map(([a,b])=>g("  0","VERTEX")+g("  8","1")+g(" 10",a.toFixed(3))+g(" 20",b.toFixed(3))).join("")+g("  0","SEQEND");
const ASYM=[[0,0],[100,0],[130,200],[0,180]];                       // a side panel: not symmetric
const PIECES=[ // name, material, outline
  ["STYLE.LEFT.M","FabricA",ASYM],
  ["STYLE.RIGHT.M","FabricA",ASYM.map(([x,y])=>[1000-x,y])],          // its mirror image, same fabric
  ["STYLE.VENT.M","FabricB",[[2000,0],[2040,0],[2040,80],[2000,80]]],
  ["STYLE.VENTI.M","Interfacing",[[3000,0],[3040,0],[3040,80],[3000,80]]]]; // same vent in interfacing
let blocksTxt="";
PIECES.forEach(([n,mat,vs])=>{ blocksTxt+=g("  0","BLOCK")+g("  8","1")+g("  2",n)+g(" 70","0")+g(" 10","0.0")+g(" 20","0.0")
  +poly(vs)+text("Piece Name: "+n)+text("Size: M")+text("Material: "+mat)+g("  0","ENDBLK"); });
const SYN=g("999","ANSI/AAMA")+g("  0","SECTION")+g("  2","BLOCKS")+blocksTxt+g("  0","ENDSEC")+g("  0","EOF");

setTimeout(()=>{try{
  const w=dom.window;
  const r=w.__parseDXF(new TextEncoder().encode(SYN)); w.__setModel(r);
  const pairs=w.mirrorPairs().map(([a,b])=>r.pieces[a].meta.name+" <-> "+r.pieces[b].meta.name);
  if(!pairs.includes("STYLE.LEFT.M <-> STYLE.RIGHT.M")) fail("real left/right pair not found: "+JSON.stringify(pairs));
  console.log("  ok: a mirrored left/right pair in the same fabric is still a mirror pair");
  if(pairs.length!==1) fail("fabric + interfacing copies must not pair: "+JSON.stringify(pairs));
  console.log("  ok: a fabric + interfacing copy of a symmetric piece is not a mirror pair");

  const dir=process.env.DXF_SAMPLES;
  if(dir){ const fp=path.join(dir,"64944.dxf");
    if(!fs.existsSync(fp)) console.log("  skip: "+fp+" not found");
    else { const rr=w.__parseDXF(new Uint8Array(fs.readFileSync(fp))); w.__setModel(rr);
      const n=w.mirrorPairs().length; if(n!==0) fail("64944.dxf: expected 0 mirror pairs, got "+n);
      console.log("  ok: 64944.dxf → 0 mirror pairs (its hem vents are fabric + interfacing)"); } }
  console.log("PASS mirrorpairs");
  process.exit(0);
}catch(e){ fail(e.stack||e); }},300);
