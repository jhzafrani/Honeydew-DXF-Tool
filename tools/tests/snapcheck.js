const fs=require("fs"); const {JSDOM}=require("jsdom");
const html=fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/Brick Builders App/Honeydew DXF Tool/apparel-dxf-viewer.html","utf8");
function makeCtx(){const h={measureText:t=>({width:6})};return new Proxy(h,{get:(t,k)=>(k in t)?t[k]:(()=>{}),set:()=>true});}
const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>makeCtx();
  w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:900,height:640,right:900,bottom:640});
  w.requestAnimationFrame=cb=>setTimeout(cb,0); w.alert=()=>{};
}});
const win=dom.window;
function fail(m){console.error("FAIL:",m);process.exit(1);}
setTimeout(()=>{try{
  const MV=win.__move, parse=win.__parseDXF;
  const model=parse(new Uint8Array(fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/uploads/lace-bralette-34B.dxf")));
  win.__setModel(model); MV.setTool("move"); MV.view? null:null;
  const a=model.pieces[0], b=model.pieces[1];
  win.__grid.view.scale=1;
  const bc=[(b.bbox[0]+b.bbox[2])/2,(b.bbox[1]+b.bbox[3])/2];
  MV.beginPieceMove(1, bc[0], bc[1]);
  const targetLeft=a.bbox[0], bLeft=b.bbox[0];
  const wantDx=(targetLeft-bLeft)+5;   // 5mm short -> should snap to a.bbox[0]
  MV.dragPieceMove(bc[0]+wantDx, bc[1]);
  if(Math.abs(model.pieces[1].bbox[0]-targetLeft)>0.01) fail("drag no longer snaps: "+model.pieces[1].bbox[0]+" vs "+targetLeft);
  console.log("  ok: move-drag still snaps to neighbour edge after matrix refactor");
  console.log("SNAP OK"); process.exit(0);
}catch(e){console.error("ERROR",e.stack||e);process.exit(1);}},500);
