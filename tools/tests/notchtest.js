const fs=require("fs"); const {JSDOM}=require("jsdom");
const html=fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/Brick Builders App/Honeydew DXF Tool/apparel-dxf-viewer.html","utf8");
function makeCtx(){const h={measureText:t=>({width:6})};return new Proxy(h,{get:(t,k)=>(k in t)?t[k]:(()=>{}),set:()=>true});}
const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>makeCtx();
  w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:900,height:640,right:900,bottom:640});
  w.requestAnimationFrame=cb=>setTimeout(cb,0); w.alert=()=>{};
}});
const win=dom.window;
setTimeout(()=>{try{
  const SEW=win.__sew, D=win.__dims, parse=win.__parseDXF;
  const model=parse(new Uint8Array(fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/uploads/11160.dxf")));
  win.__setModel(model);
  let withNotch=0, extraTotal=0, sample=null;
  model.pieces.slice(0,60).forEach(p=>{
    const notches=p.geo.filter(g=>g.type==="point"&&(g.layer==="4"||g.layer==="13")).length;
    const cut=D.cutOf(p); if(!cut||!cut.verts) return;
    const cornerOnly=D.segmentCut(cut.verts,30,12).length;
    const withNotches=SEW.pieceEdges(p).length;
    if(notches>0){ withNotch++; extraTotal+=(withNotches-cornerOnly); if(!sample&&withNotches>cornerOnly) sample={n:p.meta.name,notches,cornerOnly,withNotches}; }
  });
  console.log("pieces with notches:",withNotch,"| total extra edges from notch splits:",extraTotal);
  if(sample) console.log("example:",sample.n,"— notches",sample.notches,"| corner-only edges",sample.cornerOnly,"-> with notches",sample.withNotches);
  if(extraTotal>0) console.log("NOTCH SPLITTING ACTIVE");
  else console.log("(no extra splits — notches may sit off the cut line on this file)");
  process.exit(0);
}catch(e){console.error("ERR",e.stack||e);process.exit(1);}},500);
