const fs=require("fs"); const {JSDOM}=require("jsdom");
const html=fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/Brick Builders App/Honeydew DXF Tool/apparel-dxf-viewer.html","utf8");
function makeCtx(){const h={measureText:t=>({width:6})};return new Proxy(h,{get:(t,k)=>(k in t)?t[k]:(()=>{}),set:()=>true});}
const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>makeCtx();
  w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:900,height:640,right:900,bottom:640});
  w.requestAnimationFrame=cb=>0; w.alert=()=>{};
}});
const win=dom.window;
function fail(m){console.error("FAIL:",m);process.exit(1);}
setTimeout(()=>{try{
  const MV=win.__move, parse=win.__parseDXF;
  const model=parse(new Uint8Array(fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/uploads/lace-bralette-34B.dxf")));
  win.__setModel(model); win.__grid.view.scale=1; MV.setTool("move");
  const a=model.pieces[0], b=model.pieces[1];
  const bc=[(b.bbox[0]+b.bbox[2])/2,(b.bbox[1]+b.bbox[3])/2];
  const targetLeft=a.bbox[0], bLeft=b.bbox[0];
  const wantDx=(targetLeft-bLeft)+5;   // 5mm short of aligning → would snap if snapping on

  // SNAP ON (default): edge snaps to neighbour
  MV.moveFree=false;
  MV.beginPieceMove(1, bc[0], bc[1]); MV.dragPieceMove(bc[0]+wantDx, bc[1]);
  const snappedLeft=model.pieces[1].bbox[0];
  if(Math.abs(snappedLeft-targetLeft)>0.01) fail("snap-on should align to neighbour");
  console.log("  ok: snapping ON aligns edge to neighbour (baseline)");

  // reset piece
  MV.resetPiece(b);

  // FREE (snap off): no snapping — lands exactly at raw target (5mm off)
  MV.moveFree=true;
  MV.beginPieceMove(1, bc[0], bc[1]); MV.dragPieceMove(bc[0]+wantDx, bc[1]);
  const freeLeft=model.pieces[1].bbox[0];
  if(Math.abs(freeLeft-(bLeft+wantDx))>0.01) fail("free move should NOT snap; expected "+(bLeft+wantDx).toFixed(2)+" got "+freeLeft.toFixed(2));
  if(Math.abs(freeLeft-targetLeft)<0.5) fail("free move unexpectedly landed on the snap line");
  console.log("  ok: FREE move ignores snapping (lands "+(freeLeft-targetLeft).toFixed(1)+"mm off the alignment line, as dragged)");

  // FREE ROTATE by an arbitrary angle about a fixed point
  MV.moveFree=false; MV.resetPiece(b);
  const [cx,cy]=MV.pieceCenter(b);
  // pick a vertex, rotate 37°, check it lands at the analytic rotated position
  const cut=b.geo.find(g=>g.type==="poly"); const v0=cut.verts[0].slice();
  MV.rotatePieceAbout(b, 37, cx, cy);
  const r=37*Math.PI/180, ex=cx+(v0[0]-cx)*Math.cos(r)-(v0[1]-cy)*Math.sin(r), ey=cy+(v0[0]-cx)*Math.sin(r)+(v0[1]-cy)*Math.cos(r);
  const v1=cut.verts[0];
  if(Math.hypot(v1[0]-ex,v1[1]-ey)>0.01) fail("free rotate 37° did not match analytic position");
  if(MV.isIdent(b.meta._xf)) fail("free rotate should record a transform");
  console.log("  ok: FREE rotate applies an arbitrary angle (37°) about a fixed centre and persists in _xf");

  console.log("\nFREE TRANSFORM TESTS PASSED");
  process.exit(0);
}catch(e){console.error("ERROR",e.stack||e);process.exit(1);}},500);
