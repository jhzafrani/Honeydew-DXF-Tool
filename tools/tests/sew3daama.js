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
  const model=parse(new Uint8Array(fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/uploads/11160.dxf")));
  win.__setModel(model);
  // restrict to one size so pieces are a coherent set
  const S1=[...new Set(model.pieces.map(p=>p.meta.size).filter(Boolean))][0];
  const inSize=model.pieces.map((p,i)=>((p.meta.size||"")===S1)?i:-1).filter(i=>i>=0).slice(0,4);
  // pair a few edges between the first two pieces
  SEW.setTool("sew");
  const p0=model.pieces[inSize[0]], p1=model.pieces[inSize[1]];
  SEW.sewApply({name:p0.meta.name,ei:0}); SEW.sewApply({name:p1.meta.name,ei:0});
  SEW.sewApply({name:p0.meta.name,ei:1}); SEW.sewApply({name:p1.meta.name,ei:1});
  D3.build3D(); const S=D3.S;
  const badTri=S.tris.some(t=>t.slice(0,3).some(ix=>ix<0||ix>=S.nodes.length));
  if(badTri) fail("triangle references out-of-range node");
  console.log("build: "+S.nodes.length+" nodes, "+S.tris.length+" tris, "+S.seamCons.length+" stitch cons ("+SEW.seams.length+" seams)");
  const g0=D3.seamGap(); for(let i=0;i<250;i++) D3.step3D(); const g1=D3.seamGap(); const mx=D3.maxCoord();
  if(!isFinite(mx)) fail("NaN in AAMA sim");
  if(mx>S.bound*6) fail("AAMA sim exploded "+mx.toFixed(0)+" vs "+S.bound.toFixed(0));
  D3.draw3D();
  console.log("converged gap "+g0.toFixed(0)+" -> "+g1.toFixed(0)+" mm, maxCoord "+mx.toFixed(0)+"/bound "+S.bound.toFixed(0)+", draw ok");
  console.log("AAMA 3D BUILD OK");
  process.exit(0);
}catch(e){console.error("ERROR",e.stack||e);process.exit(1);}},500);
