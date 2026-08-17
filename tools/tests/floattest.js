const fs=require("fs"); const {JSDOM}=require("jsdom");
const html=fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/Brick Builders App/apparel-dxf-viewer.html","utf8");
function makeCtx(){const h={measureText:t=>({width:6})};return new Proxy(h,{get:(t,k)=>(k in t)?t[k]:(()=>{}),set:()=>true});}
const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>makeCtx();
  w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:900,height:640,right:900,bottom:640});
  w.requestAnimationFrame=cb=>setTimeout(cb,0); w.alert=()=>{};
}});
const win=dom.window, doc=win.document;
function fail(m){console.error("FAIL:",m);process.exit(1);}
setTimeout(()=>{try{
  const MV=win.__move;
  const model=win.__parseDXF(new Uint8Array(fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/uploads/lace-bralette-34B.dxf")));
  win.__setModel(model);
  const ops=doc.getElementById("moveOps");
  if(!ops) fail("moveOps element missing");
  if(doc.getElementById("moveOps").closest("#stage")==null) fail("moveOps must live inside #stage (canvas overlay)");
  if(!doc.querySelector("#toolbar #rotLBtn")===false){} // n/a
  if(doc.querySelector("#toolbar #rotLBtn")) fail("rotate buttons should NOT be in the top toolbar anymore");

  // not in move mode -> hidden
  MV.setTool("pan");
  if(ops.style.display!=="none") fail("panel should be hidden outside Move mode");

  // move mode + select a piece -> panel shown near its bbox
  MV.setTool("move");
  win.__grid.view.scale=1;
  MV.beginPieceMove(0, (model.pieces[0].bbox[0]+model.pieces[0].bbox[2])/2, (model.pieces[0].bbox[1]+model.pieces[0].bbox[3])/2);
  MV.endMove && MV.endMove();     // simulate click-release (not a drag)
  // call the app draw to reposition
  win.__grid.drawGrid; // noop ref
  MV.setTool("move");             // ensure move mode
  // manually trigger a redraw+reposition through a transform-less path: re-select
  MV.beginPieceMove(0, 10,10); MV.endMove&&MV.endMove();
  // force reposition
  win.dispatchEvent(new win.Event("resize"));
  // directly check via a draw
  win.__move.drawOnionSkin; // ref
  // Access refreshMoveOps indirectly: rotate (which calls draw)
  MV.rotatePiece(model.pieces[0], 0); // 0° no-op but keeps geometry
  // trigger draw by toggling tool
  MV.setTool("move");
  if(ops.style.display==="none") { console.log("note: panel display still none; forcing via select"); }
  // Since draw() runs refreshMoveOps, and moveSel=0 set by beginPieceMove, check position now
  const left=parseFloat(ops.style.left||"NaN"), top=parseFloat(ops.style.top||"NaN");
  if(ops.style.display!=="flex") fail("panel should be shown (flex) with a piece selected in Move mode; got "+ops.style.display);
  if(!(left>=0 && left<=900) || !(top>=0 && top<=640)) fail("panel not positioned within stage: left="+left+" top="+top);
  console.log("  ok: panel is a #stage overlay, hidden off-mode, shown & positioned ("+Math.round(left)+","+Math.round(top)+") at the selected piece");
  console.log("FLOAT PANEL TEST PASSED");
  process.exit(0);
}catch(e){console.error("ERROR",e.stack||e);process.exit(1);}},500);
