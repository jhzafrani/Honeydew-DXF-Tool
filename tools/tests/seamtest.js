const fs=require("fs");const {JSDOM}=require("jsdom");
const html=fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/Brick Builders App/apparel-dxf-viewer.html","utf8");
const ctxStub=new Proxy({},{get:(t,p)=>p==="measureText"?(()=>({width:0})):(()=>{}),set:()=>true});
const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){w.HTMLCanvasElement.prototype.getContext=()=>ctxStub;w.devicePixelRatio=1;}});
const w=dom.window;

// ---- seam segmentation + pairing (the Phase 1 core) ----
const hypot=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function cutPoly(p){ return p.geo.find(g=>g.layer==="1"&&g.type==="poly"); }
function notches(p){ return p.geo.filter(g=>g.type==="point"&&(g.layer==="4")).map(g=>[g.x,g.y]); }
// split a closed polygon into boundary edges at sharp corners
function segmentEdges(verts, cornerDeg){
  const n=verts.length; const ang=[];
  for(let i=0;i<n;i++){
    const a=verts[(i-1+n)%n], b=verts[i], c=verts[(i+1)%n];
    const v1=[b[0]-a[0],b[1]-a[1]], v2=[c[0]-b[0],c[1]-b[1]];
    const l1=Math.hypot(...v1)||1, l2=Math.hypot(...v2)||1;
    let d=(v1[0]*v2[0]+v1[1]*v2[1])/(l1*l2); d=Math.max(-1,Math.min(1,d));
    ang[i]=Math.acos(d)*180/Math.PI;      // turn angle at vertex i
  }
  // corners = local turn > threshold
  const corners=[]; for(let i=0;i<n;i++) if(ang[i]>cornerDeg) corners.push(i);
  if(corners.length<2) return [{i0:0,i1:n-1,verts:verts.slice()}];
  const edges=[];
  for(let k=0;k<corners.length;k++){
    const a=corners[k], b=corners[(k+1)%corners.length];
    const seq=[]; let i=a; while(true){ seq.push(verts[i]); if(i===b) break; i=(i+1)%n; }
    edges.push({i0:a,i1:b,verts:seq});
  }
  return edges;
}
function edgeLen(vs){ let L=0; for(let i=0;i<vs.length-1;i++) L+=hypot(vs[i],vs[i+1]); return L; }
function nearNotches(vs, ntch, thr){ // count notches whose min dist to this edge < thr
  let c=0; for(const nt of ntch){ let bd=1e9; for(let i=0;i<vs.length-1;i++){ bd=Math.min(bd, ptSeg(nt,vs[i],vs[i+1])); } if(bd<thr) c++; } return c;
}
function ptSeg(p,a,b){ const dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy; let t=L2?((p[0]-a[0])*dx+(p[1]-a[1])*dy)/L2:0; t=Math.max(0,Math.min(1,t)); return Math.hypot(p[0]-(a[0]+t*dx),p[1]-(a[1]+t*dy)); }

const buf=fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/uploads/11160.dxf");
const ab=buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength);
const M=w.__parseDXF(ab);
w.eval("ruleText="+JSON.stringify(fs.readFileSync("/sessions/intelligent-inspiring-mayer/mnt/uploads/11160.rul").toString("latin1"))+";");
w.__setModel(M);
// only work one size (sample) to keep it clean
const sample=w.eval("model.sampleSize")||"M";
const disp=i=>w.eval("displayTerm(model.pieces["+i+"].meta.name)");
const pieces=M.pieces.map((p,i)=>({i,p,size:p.meta.size})).filter(x=>x.size===sample && cutPoly(x.p));
console.log("sample size:",sample," pieces:",pieces.length);
const allEdges=[];
pieces.forEach(x=>{
  const cut=cutPoly(x.p), nt=notches(x.p);
  const edges=segmentEdges(cut.verts, 32).map(e=>({piece:x.i, len:edgeLen(e.verts), notch:nearNotches(e.verts,nt,6), mid:e.verts[Math.floor(e.verts.length/2)], vs:e.verts}));
  console.log("\n["+disp(x.i)+"]  "+edges.length+" edges:");
  edges.forEach((e,k)=>console.log("   e"+k+" len="+e.len.toFixed(0)+"mm notches="+e.notch));
  edges.forEach(e=>allEdges.push(e));
});
// pair edges across different pieces by length + notch
const used=new Set(), pairs=[];
const cand=allEdges.map((e,idx)=>({...e,idx})).filter(e=>e.len>40); // ignore tiny edges
cand.sort((a,b)=>b.len-a.len);
for(const A of cand){ if(used.has(A.idx)) continue;
  let best=null,bd=1e9;
  for(const B of cand){ if(B.idx===A.idx||used.has(B.idx)||B.piece===A.piece) continue;
    if(B.notch!==A.notch) continue;
    const d=Math.abs(A.len-B.len); if(d<bd && d<=Math.max(6,A.len*0.06)){ bd=d; best=B; } }
  if(best){ used.add(A.idx); used.add(best.idx); pairs.push([A,best,bd]); }
}
console.log("\n=== suggested seam pairs ===");
pairs.forEach(([a,b,d])=>console.log(disp(a.piece)+" (len "+a.len.toFixed(0)+", n"+a.notch+")  <->  "+disp(b.piece)+" (len "+b.len.toFixed(0)+", n"+b.notch+")   Δ"+d.toFixed(1)+"mm"));
const unpaired=cand.filter(e=>!used.has(e.idx));
console.log("\nunpaired edges (hems / CF / facings):", unpaired.map(e=>disp(e.piece)+":"+e.len.toFixed(0)).join(", "));
process.exit(0);
