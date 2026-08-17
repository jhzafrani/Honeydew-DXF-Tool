const fs=require("fs"); const {JSDOM}=require("jsdom");
const html=fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/Brick Builders App/apparel-dxf-viewer.html","utf8");
const noop=()=>new Proxy(function(){},{get:(t,p)=>p==="measureText"?(()=>({width:10})):noop(),apply:()=>noop()});
const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>noop(); w.HTMLCanvasElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:800,height:600});
  w.requestAnimationFrame=cb=>setTimeout(cb,0); w.alert=()=>{};}});
const win=dom.window;
function fail(m){console.error("FAIL:",m);process.exit(1);}
setTimeout(()=>{try{
  const parse=win.__parseDXF, SV=win.__sizeview;
  const bytes=fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/uploads/11160.dxf");
  const model=parse(new Uint8Array(bytes)); win.__setModel(model);
  const sizes=[...new Set(model.pieces.map(p=>p.meta.size).filter(Boolean))];
  console.log("sizes:",sizes.join(", "));
  if(sizes.length<2) fail("need multiple sizes to test");
  const S=sizes[1];
  const expect=model.pieces.map((p,i)=>((p.meta.size||"")===S)?i:-1).filter(i=>i>=0);
  // case A: size selected, no piece selected -> artboard shows all pieces of that size
  SV.curPiece=null; SV.sizeFilter=S; SV.applySizeView();
  const vp=SV.visiblePieces;
  if(!vp||vp.length!==expect.length||vp.some((x,i)=>x!==expect[i])) fail("visiblePieces != all pieces of size "+S+": got "+JSON.stringify(vp));
  if(vp.some(i=>(model.pieces[i].meta.size||"")!==S)) fail("a non-matching-size piece leaked in");
  console.log("  ok: size "+S+" with no piece selected -> "+vp.length+" pieces on artboard (all size "+S+")");
  // case B: clear size -> show all pieces
  SV.sizeFilter=null; SV.applySizeView();
  if(SV.visiblePieces!==null) fail("clearing size did not show all pieces (visiblePieces should be null)");
  console.log("  ok: clearing the size shows all pieces");
  // case C: a piece is selected -> applySizeView leaves artboard alone
  SV.curPiece=3; SV.sizeFilter=S;
  // simulate an existing isolation
  const before=SV.visiblePieces; SV.applySizeView();
  if(SV.visiblePieces!==before) fail("applySizeView changed artboard while a piece was selected");
  console.log("  ok: a selected piece is left isolated (size pick only filters the list)");
  console.log("\nSIZE-VIEW TEST PASSED");
  process.exit(0);
}catch(e){console.error("ERROR",e.stack||e);process.exit(1);}},500);
