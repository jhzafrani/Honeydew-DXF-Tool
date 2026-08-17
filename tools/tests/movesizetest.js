const fs=require("fs"); const {JSDOM}=require("jsdom");
const html=fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/Brick Builders App/apparel-dxf-viewer.html","utf8");
let ARCS=0;
function makeCtx(){
  const h={ measureText:t=>({width:(""+t).length*6}), arc:()=>{ARCS++;} };
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
  const SV=win.__sizeview, MV=win.__move, D=win.__dims;
  const model=win.__parseDXF(new Uint8Array(fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/uploads/11160.dxf")));
  win.__setModel(model);
  const sizes=[...new Set(model.pieces.map(p=>p.meta.size).filter(Boolean))];
  const S=sizes[1];
  const expect=model.pieces.map((p,i)=>((p.meta.size||"")===S)?i:-1).filter(i=>i>=0);

  // BUG FIX: pan + size selected -> size pieces; switching to Move must KEEP the size selection
  SV.curPiece=null; SV.sizeFilter=S; SV.applySizeView();
  const vpPan=SV.visiblePieces.slice();
  MV.setTool("move");
  const vpMove=SV.visiblePieces;
  if(!vpMove || vpMove.length!==expect.length || vpMove.some((x,i)=>x!==expect[i]))
    fail("entering Move changed the size view: "+JSON.stringify(vpMove)+" (expected "+JSON.stringify(expect)+")");
  console.log("  ok: Move mode preserves the selected size ("+vpMove.length+" pieces, all size "+S+")");
  MV.setTool("pan");

  // BUG FIX: single piece isolated -> Move should widen (not stay at 1)
  SV.sizeFilter=null; SV.curPiece=3;
  MV.setTool("move");
  if(SV.visiblePieces!==null) fail("with no size + single piece, Move should show all pieces (visiblePieces=null), got "+JSON.stringify(SV.visiblePieces));
  console.log("  ok: Move widens a single isolated piece to all pieces when no size is active");
  MV.setTool("pan");

  // FEATURE: endpoint dots drawn in Measures view (arc calls > 0)
  SV.curPiece=0; SV.sizeFilter=null; D.showDims=true;
  ARCS=0; D.drawDims();
  if(ARCS<2) fail("expected endpoint reference dots (arc calls) in Measures view, got "+ARCS);
  console.log("  ok: Measures view draws start/end reference dots ("+ARCS+" arcs)");

  console.log("\nMOVE-SIZE + ENDPOINT TESTS PASSED");
  process.exit(0);
}catch(e){console.error("ERROR",e.stack||e);process.exit(1);}},500);
