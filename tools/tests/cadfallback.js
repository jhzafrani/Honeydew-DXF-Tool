// Regression: generic CAD DXF (SPLINE/LINE on layer 0, no blocks, no cut layer)
// must be recovered into closed pieces — and pattern-format files must be untouched.
const fs=require("fs"); const {JSDOM}=require("jsdom");
const APP="/sessions/intelligent-inspiring-mayer/mnt/Brick Builders App/Honeydew DXF Tool/apparel-dxf-viewer.html";
const UP="/sessions/intelligent-inspiring-mayer/mnt/uploads/";
function makeCtx(){const h={measureText:t=>({width:6})};return new Proxy(h,{get:(t,k)=>(k in t)?t[k]:(()=>{}),set:()=>true});}
const dom=new JSDOM(fs.readFileSync(APP,"utf8"),{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>makeCtx();
  w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:900,height:640,right:900,bottom:640});
  w.requestAnimationFrame=cb=>0; w.alert=()=>{};
}});
function fail(m){console.error("FAIL:",m);process.exit(1);}
setTimeout(()=>{try{
  const w=dom.window, parse=w.__parseDXF;
  const r=parse(new Uint8Array(fs.readFileSync(UP+"15835.dxf")));
  if(r.pieces.length<2) fail("expected several pieces from 15835.dxf, got "+r.pieces.length);
  if(!r.pieces.every(p=>p.meta._derived)) fail("pieces should be marked _derived");
  r.pieces.forEach((p,i)=>{
    const cut=p.geo.find(g=>g.type==="poly"); if(!cut) fail("piece "+(i+1)+" has no outline");
    if(cut.verts.length<50) fail("piece "+(i+1)+" outline too coarse ("+cut.verts.length+" verts) — spline tessellation missing?");
    const d=Math.hypot(cut.verts[0][0]-cut.verts.at(-1)[0], cut.verts[0][1]-cut.verts.at(-1)[1]);
    if(d>0.01) fail("piece "+(i+1)+" outline not closed (gap "+d.toFixed(3)+")");
    const [a,b,c,dd]=p.bbox; if((c-a)<50||(dd-b)<50) fail("piece "+(i+1)+" implausibly small");
  });
  console.log("  ok: 15835.dxf → "+r.pieces.length+" closed pieces recovered from SPLINE/LINE geometry");
  // the app's own edge segmentation must work on a derived piece
  w.__setModel(r);
  const edges=w.__sew.pieceEdges(r.pieces[0]);
  if(edges.length<3) fail("edge segmentation failed on derived piece ("+edges.length+" edges)");
  console.log("  ok: derived piece segments into "+edges.length+" edges (Measures / Sew usable)");
  // pattern-format files must NOT go through the fallback
  [["11160.dxf",20],["lace-bralette-34B.dxf",2]].forEach(([f,min])=>{
    const q=parse(new Uint8Array(fs.readFileSync(UP+f)));
    if(q.pieces.length<min) fail(f+" regressed: "+q.pieces.length+" pieces");
    if(q.pieces.some(p=>p.meta._derived)) fail(f+" wrongly used the CAD fallback");
    if(!q.pieces.every(p=>p.geo&&p.geo.length)) fail(f+" lost geometry");
  });
  console.log("  ok: AAMA + named-layer pattern files unaffected (no fallback, geometry intact)");
  console.log("\nCAD FALLBACK TESTS PASSED");
  process.exit(0);
}catch(e){console.error("ERROR",e.stack||e);process.exit(1);}},600);
