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
function makeDoc(model,bytes,seams){return {name:"t.dxf",annotations:[],poms:[],seams,model,rawBytes:new Uint8Array(bytes)};}
setTimeout(()=>{try{
  const SEW=win.__sew, parse=win.__parseDXF, build=win.__build;
  const bytes=fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/uploads/lace-bralette-34B.dxf");
  const model=parse(new Uint8Array(bytes)); win.__setModel(model);
  if(model.pieces.length<2) fail("need >=2 pieces");
  const p0=model.pieces[0], p1=model.pieces[1];

  // edges exist
  const e0=SEW.pieceEdges(p0), e1=SEW.pieceEdges(p1);
  if(e0.length<2||e1.length<2) fail("expected multiple clickable edges per piece; got "+e0.length+"/"+e1.length);
  console.log("  ok: edges split — "+p0.meta.name+": "+e0.length+" edges, "+p1.meta.name+": "+e1.length);

  // pair edge 0 of p0 with edge 0 of p1 via sewApply (two picks)
  SEW.setTool("sew");
  SEW.sewApply({name:p0.meta.name, ei:0});
  if(!SEW.sewPick) fail("first pick not held");
  SEW.sewApply({name:p1.meta.name, ei:0});
  if(SEW.seams.length!==1) fail("seam not created; got "+SEW.seams.length);
  if(SEW.sewPick) fail("pick should clear after pairing");
  const sm=SEW.seams[0];
  const la=SEW.seamLen(sm.a), lb=SEW.seamLen(sm.b);
  if(la==null||lb==null||la<=0||lb<=0) fail("seam lengths not resolved: "+la+"/"+lb);
  console.log("  ok: paired edge↔edge into a seam ("+la.toFixed(1)+"mm / "+lb.toFixed(1)+"mm)");

  // same-edge pick cancels
  SEW.sewApply({name:p0.meta.name, ei:1}); SEW.sewApply({name:p0.meta.name, ei:1});
  if(SEW.seams.length!==1) fail("same-edge pick should not create a seam");
  console.log("  ok: picking the same edge twice cancels (no self-seam)");

  // flip flag
  SEW.seams[0].flip=true;

  // SAVE -> reparse -> seam persists
  const saved=build(makeDoc(model,bytes,SEW.seams));
  const txt=Buffer.from(saved).toString("latin1");
  if(txt.indexOf("SEAMS1:")<0) fail("SEAMS1 payload not written");
  const re=parse(new Uint8Array(saved));
  if(!re.seams||re.seams.length!==1) fail("seam not restored on reload; got "+(re.seams&&re.seams.length));
  const rs=re.seams[0];
  if(rs.a.name!==sm.a.name||rs.a.ei!==sm.a.ei||rs.b.name!==sm.b.name||rs.b.ei!==sm.b.ei) fail("seam endpoints not preserved: "+JSON.stringify(rs));
  if(rs.flip!==true) fail("flip flag not preserved");
  console.log("  ok: seam + flip round-trips through SEAMS1");

  // reload lengths match originals (geometry-derived)
  win.__setModel(re); win.__sew.seams=re.seams;
  const la2=win.__sew.seamLen(re.seams[0].a), lb2=win.__sew.seamLen(re.seams[0].b);
  if(Math.abs(la2-la)>0.01||Math.abs(lb2-lb)>0.01) fail("reloaded seam lengths differ: "+la2+"/"+lb2);
  console.log("  ok: reloaded seam resolves to same edge lengths");

  console.log("\nSEW (MANUAL SEAM PAIRING) TESTS PASSED");
  process.exit(0);
}catch(e){console.error("ERROR",e.stack||e);process.exit(1);}},500);
