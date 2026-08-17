const fs=require("fs"); const {JSDOM}=require("jsdom");
const html=fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/Brick Builders App/apparel-dxf-viewer.html","utf8");
// recording 2d context: records moveTo/lineTo; everything else no-op
let REC=[];
function makeCtx(){
  const h={ moveTo:(x,y)=>REC.push(["m",x,y]), lineTo:(x,y)=>REC.push(["l",x,y]),
    beginPath(){}, stroke(){}, fill(){}, save(){}, restore(){}, translate(){}, rotate(){},
    fillRect(){}, strokeRect(){}, clearRect(){}, fillText(){}, arc(){}, closePath(){}, setLineDash(){},
    measureText:()=>({width:10}) };
  return new Proxy(h,{ get:(t,k)=> (k in t)? t[k] : (()=>{}), set:()=>true });
}
const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>makeCtx();
  w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:900,height:640,right:900,bottom:640});
  w.requestAnimationFrame=cb=>setTimeout(cb,0); w.alert=()=>{};}});
const win=dom.window;
function fail(m){console.error("FAIL:",m);process.exit(1);}
setTimeout(()=>{try{
  const parse=win.__parseDXF, G=win.__grid, R=G.RULER;
  win.__setModel(parse(new Uint8Array(fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/uploads/11160.dxf"))));
  // try a few zoom levels
  for(const sc of [0.4, 1.0, 2.7]){
    G.view.scale=sc;
    // grid vertical line x's (moveTo with y===0)
    REC=[]; G.drawGrid();
    const gridXs=[...new Set(REC.filter(e=>e[0]==="m" && e[2]===0).map(e=>e[1]))];  // raw grid vertical x's
    // ruler top-tick x's (moveTo with y===RULER)
    REC=[]; G.drawRulers();
    const rulerXs=[...new Set(REC.filter(e=>e[0]==="m" && e[2]===R).map(e=>e[1]))];
    if(!rulerXs.length) fail("no ruler ticks recorded at scale "+sc);
    // every ruler tick must coincide with a grid line (within the half-pixel crispness offset)
    const missing=rulerXs.filter(x=>!gridXs.some(g=>Math.abs(g-x)<=1.001));
    if(missing.length) fail("ruler ticks not on grid at scale "+sc+": "+missing.slice(0,6)+" (grid had "+gridXs.length+" verticals)");
    console.log("  ok: scale "+sc+" — all "+rulerXs.length+" ruler ticks coincide with grid lines ("+gridXs.length+" grid verticals)");
  }
  console.log("\nGRID/RULER SYNC TEST PASSED");
  process.exit(0);
}catch(e){console.error("ERROR",e.stack||e);process.exit(1);}},500);
