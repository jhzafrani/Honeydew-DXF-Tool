const fs=require("fs"); const {JSDOM}=require("jsdom");
const html=fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/Brick Builders App/Honeydew DXF Tool/apparel-dxf-viewer.html","utf8");
let FILLS=0, ALPHAS=[];
function makeCtx(){
  const h={ measureText:t=>({width:(""+t).length*6}), fill:()=>{FILLS++; ALPHAS.push(cur.globalAlpha);} };
  const cur={globalAlpha:1};
  return new Proxy(h,{get:(t,k)=>k==="globalAlpha"?cur.globalAlpha:((k in t)?t[k]:(()=>{})),set:(t,k,v)=>{if(k==="globalAlpha")cur.globalAlpha=v;return true;}});
}
const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>makeCtx();
  w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:900,height:640,right:900,bottom:640});
  w.requestAnimationFrame=cb=>setTimeout(cb,0); w.alert=()=>{};
}});
const win=dom.window;
function fail(m){console.error("FAIL:",m);process.exit(1);}
setTimeout(()=>{try{
  const MV=win.__move, SV=win.__sizeview;
  const model=win.__parseDXF(new Uint8Array(fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/uploads/lace-bralette-34B.dxf")));
  win.__setModel(model);
  const n=model.pieces.length;
  // show all pieces, enter move, run onion skin
  MV.setTool("move");
  FILLS=0; ALPHAS=[]; MV.drawOnionSkin();
  if(FILLS<Math.min(2,n)) fail("expected a translucent fill per piece, got "+FILLS+" for "+n+" pieces");
  if(!ALPHAS.every(a=>a>0 && a<1)) fail("fills not translucent: "+JSON.stringify(ALPHAS));
  console.log("  ok: onion-skin fills "+FILLS+" pieces, all translucent (alphas "+JSON.stringify(ALPHAS)+")");
  // when a piece is being dragged it should be tinted stronger (0.30) than the rest (0.15)
  MV.beginPieceMove(0, (model.pieces[0].bbox[0]+model.pieces[0].bbox[2])/2, (model.pieces[0].bbox[1]+model.pieces[0].bbox[3])/2);
  FILLS=0; ALPHAS=[]; MV.drawOnionSkin();
  if(!ALPHAS.some(a=>Math.abs(a-0.30)<1e-6)) fail("dragged piece not tinted stronger; alphas "+JSON.stringify(ALPHAS));
  console.log("  ok: dragged piece tinted stronger (0.30) than others");
  console.log("\nONION-SKIN TEST PASSED");
  process.exit(0);
}catch(e){console.error("ERROR",e.stack||e);process.exit(1);}},500);
