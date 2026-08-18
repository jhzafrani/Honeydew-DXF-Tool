const fs=require("fs"); const {JSDOM}=require("jsdom");
const html=fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/Brick Builders App/Honeydew DXF Tool/apparel-dxf-viewer.html","utf8");
function makeCtx(){const h={measureText:t=>({width:6})};return new Proxy(h,{get:(t,k)=>(k in t)?t[k]:(()=>{}),set:()=>true});}
let alerted=null;
const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>makeCtx();
  w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:900,height:640,right:900,bottom:640});
  w.requestAnimationFrame=cb=>0; w.cancelAnimationFrame=()=>{}; w.alert=m=>{alerted=m;};
}});
function fail(m){console.error("FAIL:",m);process.exit(1);}
setTimeout(()=>{try{
  const w=dom.window, d=w.document;
  const btn=d.getElementById("sew3dBtn");
  if(!btn) fail("3D button element missing");
  if(btn.style.display!=="none") fail("3D button should be hidden, display="+btn.style.display);
  console.log("  ok: 🪡 3D button hidden from toolbar");
  // clicking it (or a stale cached handler) must not open the overlay
  btn.onclick();
  const ov=d.getElementById("sew3d");
  if(ov.style.display==="block") fail("3D overlay opened despite feature flag");
  if(alerted) fail("clicking disabled 3D alerted: "+alerted);
  console.log("  ok: activating 3D is a no-op (overlay stays closed, no alert)");
  // the rest of the app must still work
  const r=w.__parseDXF(new Uint8Array(fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/uploads/lace-bralette-34B.dxf")));
  if(!r.pieces.length) fail("parsing broke");
  w.__setModel(r);
  w.__sew.setTool("sew");
  w.__sew.sewApply({name:r.pieces[0].meta.name,ei:0}); w.__sew.sewApply({name:r.pieces[1].meta.name,ei:0});
  if(w.__sew.seams.length!==1) fail("Sew tool broke");
  console.log("  ok: 🧵 Sew (seam mapping) still works — 3D code retained but dormant");
  console.log("\n3D DISABLED-FLAG TESTS PASSED");
  process.exit(0);
}catch(e){console.error("ERROR",e.stack||e);process.exit(1);}},600);
