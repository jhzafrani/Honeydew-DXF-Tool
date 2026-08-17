const fs=require("fs"); const {JSDOM}=require("jsdom");
const html=fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/Brick Builders App/apparel-dxf-viewer.html","utf8");
function makeCtx(){const h={measureText:t=>({width:(""+t).length*6})};return new Proxy(h,{get:(t,k)=>(k in t)?t[k]:(()=>{}),set:()=>true});}
const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>makeCtx();
  w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:900,height:640,right:900,bottom:640});
  w.requestAnimationFrame=cb=>setTimeout(cb,0); w.alert=()=>{}; w.prompt=()=>"x.dxf";
}});
const win=dom.window;
function fail(m){console.error("FAIL:",m);process.exit(1);}
function approx(a,b,t){return Math.abs(a-b)<=(t||0.01);}
function makeDoc(model,bytes){return {name:"t.dxf",annotations:[],poms:[],model,rawBytes:new Uint8Array(bytes)};}
function bboxKey(b){return b.map(v=>Math.round(v*100)).join(",");}
setTimeout(()=>{try{
  const MV=win.__move, parse=win.__parseDXF, build=win.__build;
  const bytes=fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/uploads/lace-bralette-34B.dxf");
  const model=parse(new Uint8Array(bytes)); win.__setModel(model);
  const p=model.pieces[0];
  const cutV0=JSON.stringify((p.geo.find(g=>g.type==='poly')||{}).verts);

  // apply move + rotate + flip
  MV.translatePiece(p, 120, -40);
  MV.rotatePiece(p, 90);
  MV.flipPiece(p, "x");
  const bboxAfter=bboxKey(p.bbox);
  const xfAfter=p.meta._xf.slice();
  if(MV.isIdent(p.meta._xf)) fail("xf should not be identity after transforms");

  // SAVE -> reparse -> geometry (bbox) must match
  const saved=build(makeDoc(model,bytes));
  const txt=Buffer.from(saved).toString("latin1");
  if(txt.indexOf("LAYOUT1:")<0) fail("LAYOUT1 not written");
  if(txt.indexOf('"xf"')<0) fail("xf not in payload");
  const re=parse(new Uint8Array(saved));
  const rp=re.pieces.find(x=>x.meta.name===p.meta.name);
  if(!rp) fail("piece missing after reparse");
  if(bboxKey(rp.bbox)!==bboxAfter) fail("bbox not reproduced after save/reload: "+bboxKey(rp.bbox)+" vs "+bboxAfter);
  if(rp.meta._xf.some((v,i)=>!approx(v,xfAfter[i],0.001))) fail("xf not restored: "+rp.meta._xf+" vs "+xfAfter);
  console.log("  ok: move+rotate+flip round-trips through LAYOUT1 (bbox + matrix reproduced)");

  // reset returns to identity + original geometry
  win.__setModel(model);
  MV.rotatePiece(p, 90); MV.flipPiece(p,"y"); MV.translatePiece(p,10,10);
  MV.resetPiece(p);
  if(!MV.isIdent(p.meta._xf)) fail("resetPiece did not return to identity: "+p.meta._xf);
  const cutV1=(p.geo.find(g=>g.type==='poly')||{}).verts;
  const fresh=parse(new Uint8Array(bytes)).pieces[0];
  const cutFresh=(fresh.geo.find(g=>g.type==='poly')||{}).verts;
  if(!cutV1||!cutFresh||cutV1.length!==cutFresh.length) fail("reset geometry vertex count mismatch");
  const maxErr=Math.max(...cutV1.map((v,i)=>Math.max(Math.abs(v[0]-cutFresh[i][0]),Math.abs(v[1]-cutFresh[i][1]))));
  if(maxErr>1e-6) fail("resetPiece did not restore original geometry (max err "+maxErr+")");
  console.log("  ok: reset returns piece to identity + original geometry");

  // flip twice = identity (geometry restored)
  win.__setModel(model);
  const before=bboxKey(p.bbox);
  MV.flipPiece(p,"x"); MV.flipPiece(p,"x");
  if(bboxKey(p.bbox)!==before) fail("double flip should restore bbox");
  console.log("  ok: flipping twice restores the piece");

  // rotate 4x90 = identity bbox
  win.__setModel(model);
  const b4=bboxKey(p.bbox);
  for(let k=0;k<4;k++) MV.rotatePiece(p,90);
  if(bboxKey(p.bbox)!==b4) fail("four 90° rotations should restore bbox");
  console.log("  ok: four 90° rotations restore the piece");

  console.log("\nTRANSFORM (MOVE/ROTATE/FLIP) TESTS PASSED");
  process.exit(0);
}catch(e){console.error("ERROR",e.stack||e);process.exit(1);}},500);
