const fs=require("fs"); const {JSDOM}=require("jsdom");
const html=fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/Brick Builders App/apparel-dxf-viewer.html","utf8");
let TEXTS=[];
function makeCtx(){
  const h={ measureText:t=>({width:(""+t).length*6}), fillText:(t)=>TEXTS.push(String(t)) };
  return new Proxy(h,{get:(t,k)=>(k in t)?t[k]:(()=>{}),set:()=>true});
}
const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>makeCtx();
  w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:900,height:640,right:900,bottom:640});
  w.requestAnimationFrame=cb=>setTimeout(cb,0); w.alert=()=>{};
}});
const win=dom.window;
function fail(m){console.error("FAIL:",m);process.exit(1);}
setTimeout(()=>{try{
  const D=win.__dims, SV=win.__sizeview;
  const model=win.__parseDXF(new Uint8Array(fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/uploads/11160.dxf")));
  win.__setModel(model);
  const sizes=[...new Set(model.pieces.map(p=>p.meta.size).filter(Boolean))];
  const S=sizes[1];
  const nInSize=model.pieces.filter(p=>(p.meta.size||"")===S).length;
  D.showDims=true;

  // Case A: size selected, no piece -> dims on ALL pieces of that size
  SV.curPiece=null; SV.sizeFilter=S; SV.applySizeView();
  TEXTS=[]; D.drawDims();
  const wA=TEXTS.filter(t=>t.startsWith("W ")).length;
  if(wA!==nInSize) fail("expected "+nInSize+" width bars (one per size-"+S+" piece), got "+wA);
  console.log("  ok: size "+S+" selected -> "+wA+" pieces dimensioned (all "+nInSize+" pieces of that size)");

  // Case B: single piece isolated -> dims on just that one
  SV.sizeFilter=null; SV.curPiece=0;
  TEXTS=[]; D.drawDims();
  const wB=TEXTS.filter(t=>t.startsWith("W ")).length;
  if(wB!==1) fail("expected 1 width bar for a single selected piece, got "+wB);
  console.log("  ok: single piece selected -> exactly 1 piece dimensioned");

  // Case C: nothing selected (all pieces, no size) -> no dims (avoid clutter)
  SV.sizeFilter=null; SV.curPiece=null;
  TEXTS=[]; D.drawDims();
  const wC=TEXTS.filter(t=>t.startsWith("W ")).length;
  if(wC!==0) fail("expected 0 dims when nothing selected, got "+wC);
  console.log("  ok: no size & no piece -> no dimensions drawn");

  console.log("\nMULTI-PIECE DIMS TEST PASSED");
  process.exit(0);
}catch(e){console.error("ERROR",e.stack||e);process.exit(1);}},500);
