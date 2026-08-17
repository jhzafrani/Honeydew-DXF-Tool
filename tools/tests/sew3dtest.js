const fs=require("fs"); const {JSDOM}=require("jsdom");
const html=fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/Brick Builders App/apparel-dxf-viewer.html","utf8");
function makeCtx(){const h={measureText:t=>({width:6})};return new Proxy(h,{get:(t,k)=>(k in t)?t[k]:(()=>{}),set:()=>true});}
const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>makeCtx();
  w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:900,height:640,right:900,bottom:640});
  w.requestAnimationFrame=cb=>0; w.cancelAnimationFrame=()=>{}; w.alert=()=>{};
}});
const win=dom.window;
function fail(m){console.error("FAIL:",m);process.exit(1);}
setTimeout(()=>{try{
  const SEW=win.__sew, D3=win.__sew3d, parse=win.__parseDXF;
  const model=parse(new Uint8Array(fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/uploads/lace-bralette-34B.dxf")));
  win.__setModel(model);
  // pair edge 0 of piece0 with edge 0 of piece1
  SEW.setTool("sew");
  SEW.sewApply({name:model.pieces[0].meta.name,ei:0}); SEW.sewApply({name:model.pieces[1].meta.name,ei:0});
  if(SEW.seams.length!==1) fail("seam not created");

  D3.build3D();
  const S=D3.S;
  if(!S.nodes.length) fail("no nodes built");
  if(!S.tris.length) fail("no triangles built");
  if(!S.cons.length) fail("no structural constraints");
  if(!S.seamCons.length) fail("no seam stitch constraints");
  console.log("  ok: build — "+S.nodes.length+" nodes, "+S.tris.length+" tris, "+S.cons.length+" struct cons, "+S.seamCons.length+" stitch cons");

  const gap0=D3.seamGap();
  for(let i=0;i<200;i++) D3.step3D();
  const gap1=D3.seamGap();
  const mx=D3.maxCoord();
  if(!isFinite(mx)) fail("simulation produced NaN/Infinity");
  if(mx > S.bound*6) fail("simulation exploded: maxCoord "+mx.toFixed(1)+" vs bound "+S.bound.toFixed(1));
  console.log("  ok: stable after 200 steps (maxCoord "+mx.toFixed(0)+" mm, bound "+S.bound.toFixed(0)+" mm)");
  if(!(gap1 < gap0*0.6)) fail("seam gap did not converge: "+gap0.toFixed(0)+" -> "+gap1.toFixed(0));
  console.log("  ok: seams pulled together — total gap "+gap0.toFixed(0)+" mm -> "+gap1.toFixed(0)+" mm ("+Math.round(100*(1-gap1/gap0))+"% closed)");

  // structural constraints keep piece size roughly intact (bound shouldn't collapse to ~0 or blow up)
  if(S.bound<1) fail("degenerate bound");
  // draw must not throw
  D3.draw3D();
  console.log("  ok: draw3D ran without throwing");

  console.log("\n3D SEW PREVIEW TESTS PASSED");
  process.exit(0);
}catch(e){console.error("ERROR",e.stack||e);process.exit(1);}},500);
