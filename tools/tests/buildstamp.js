// Regression: the page shows its build at the bottom of the sidebar, so anyone can tell which
// release they are running. The build is the service-worker cache name (adxf-vNN): the page's
// APP_BUILD, both deploy folders' sw.js and both deploy copies of the app must all agree.
const fs=require("fs"), path=require("path"); const {JSDOM}=require("jsdom");
const ROOT=path.join(__dirname,"..",".."), APP=path.join(ROOT,"apparel-dxf-viewer.html");
function fail(m){console.error("FAIL:",m);process.exit(1);}
const swBuild=f=>{ const m=fs.readFileSync(path.join(ROOT,f,"sw.js"),"utf8").match(/const CACHE\s*=\s*"([^"]+)"/); return m?m[1]:null; };

const html=fs.readFileSync(APP,"utf8");
const sw1=swBuild("netlify-site"), sw2=swBuild("apparel-dxf-viewer-site");
if(!sw1||sw1!==sw2) fail("sw.js cache names differ: netlify-site="+sw1+" apparel-dxf-viewer-site="+sw2);
const m=html.match(/const APP_BUILD\s*=\s*"([^"]+)"/), mDate=html.match(/const APP_BUILD_DATE\s*=\s*"(\d{4}-\d{2}-\d{2})"/);
if(!m) fail("apparel-dxf-viewer.html has no APP_BUILD constant");
if(!mDate) fail("apparel-dxf-viewer.html has no APP_BUILD_DATE (YYYY-MM-DD)");
if(m[1]!==sw1) fail("APP_BUILD "+m[1]+" != sw.js cache "+sw1+" (bump both on every release)");
console.log("  ok: APP_BUILD "+m[1]+" matches both sw.js caches");
["netlify-site","apparel-dxf-viewer-site"].forEach(d=>{
  if(fs.readFileSync(path.join(ROOT,d,"index.html"),"utf8")!==html) fail(d+"/index.html is not a copy of apparel-dxf-viewer.html");
});
console.log("  ok: both deploy folders carry the current app");

function makeCtx(){const h={measureText:t=>({width:6})};return new Proxy(h,{get:(t,k)=>(k in t)?t[k]:(()=>{}),set:()=>true});}
const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
  w.HTMLCanvasElement.prototype.getContext=()=>makeCtx();
  w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:900,height:640,right:900,bottom:640});
  w.requestAnimationFrame=cb=>0; w.alert=()=>{}; w.TextDecoder=TextDecoder;
}});
setTimeout(()=>{try{
  const d=dom.window.document, el=d.getElementById("buildStamp");
  if(!el) fail("no #buildStamp element");
  if(el.parentElement!==d.getElementById("side") || d.getElementById("side").lastElementChild!==el) fail("#buildStamp must be the last item in the sidebar");
  const [y,mo,da]=mDate[1].split("-").map(Number);
  const want="Build "+m[1]+" · "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][mo-1]+" "+da+", "+y;
  if(el.textContent.trim()!==want) fail("stamp reads "+JSON.stringify(el.textContent.trim())+", expected "+JSON.stringify(want));
  if(!/reload/i.test(el.title||"")) fail("stamp needs a tooltip explaining what to do when the build is old");
  console.log("  ok: sidebar footer reads \""+want+"\" with a tooltip");
  console.log("PASS buildstamp");
  process.exit(0);
}catch(e){ fail(e.stack||e); }},300);
