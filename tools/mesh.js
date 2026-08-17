/* Phase 2 — triangulate a pattern piece into a fairly uniform 2D mesh.
   Boundary is preserved exactly (all outline vertices kept, long edges subdivided);
   interior filled with a grid of points; Delaunay (Bowyer-Watson); triangles whose
   centroid falls outside the outline are dropped (handles concave shapes).
   Pure functions so it can be unit-tested headlessly and reused in the browser. */
(function(root){
"use strict";
const EPS=1e-9;

function dedupe(ring){
  const out=[];
  for(const p of ring){ const q=out[out.length-1]; if(!q||Math.hypot(p[0]-q[0],p[1]-q[1])>1e-6) out.push([p[0],p[1]]); }
  if(out.length>1){ const a=out[0],b=out[out.length-1]; if(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6) out.pop(); }
  return out;
}
function polyArea(ring){ let A=0; for(let i=0;i<ring.length;i++){ const a=ring[i],b=ring[(i+1)%ring.length]; A+=a[0]*b[1]-b[0]*a[1]; } return Math.abs(A)/2; }
function pointInPoly(p,ring){
  let inside=false; const x=p[0],y=p[1];
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];
    if(((yi>y)!==(yj>y)) && (x < (xj-xi)*(y-yi)/((yj-yi)||EPS)+xi)) inside=!inside;
  }
  return inside;
}
function distPointSeg(p,a,b){ const dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy;
  let t=L2?((p[0]-a[0])*dx+(p[1]-a[1])*dy)/L2:0; t=Math.max(0,Math.min(1,t));
  return Math.hypot(p[0]-(a[0]+t*dx),p[1]-(a[1]+t*dy)); }
function minDistToRing(p,ring){ let m=1e18; for(let i=0;i<ring.length;i++) m=Math.min(m,distPointSeg(p,ring[i],ring[(i+1)%ring.length])); return m; }

// boundary points: keep outline vertices + subdivide long edges, then collapse
// points that end up closer than minGap so we don't seed sliver triangles at corners
function boundaryPoints(ring,spacing){
  const raw=[];
  for(let i=0;i<ring.length;i++){
    const a=ring[i],b=ring[(i+1)%ring.length]; raw.push([a[0],a[1]]);
    const L=Math.hypot(b[0]-a[0],b[1]-a[1]); const n=Math.floor(L/spacing);
    for(let k=1;k<=n;k++){ const t=k/(n+1); raw.push([a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]); }
  }
  const minGap=spacing*0.4, out=[];
  for(let i=0;i<raw.length;i++){ const q=out[out.length-1];
    if(!q || Math.hypot(raw[i][0]-q[0],raw[i][1]-q[1])>=minGap) out.push(raw[i]); }
  // wrap: drop last if it hugs the first
  if(out.length>3 && Math.hypot(out[0][0]-out[out.length-1][0],out[0][1]-out[out.length-1][1])<minGap) out.pop();
  return out;
}

// --- Bowyer-Watson Delaunay ---
function circumContains(ax,ay,bx,by,cx,cy,px,py){
  // returns true if p is strictly inside circumcircle of (a,b,c); assumes ccw
  const adx=ax-px,ady=ay-py,bdx=bx-px,bdy=by-py,cdx=cx-px,cdy=cy-py;
  const d = (adx*adx+ady*ady)*(bdx*cdy-cdx*bdy)
          - (bdx*bdx+bdy*bdy)*(adx*cdy-cdx*ady)
          + (cdx*cdx+cdy*cdy)*(adx*bdy-bdx*ady);
  return d>EPS;
}
function orient(ax,ay,bx,by,cx,cy){ return (bx-ax)*(cy-ay)-(by-ay)*(cx-ax); }
function delaunay(P){
  let minx=1e18,miny=1e18,maxx=-1e18,maxy=-1e18;
  P.forEach(p=>{minx=Math.min(minx,p[0]);miny=Math.min(miny,p[1]);maxx=Math.max(maxx,p[0]);maxy=Math.max(maxy,p[1]);});
  const dx=(maxx-minx)||1, dy=(maxy-miny)||1, dm=Math.max(dx,dy)*20, mx=(minx+maxx)/2, my=(miny+maxy)/2;
  const pts=P.slice();
  const s0=pts.push([mx-dm,my-dm])-1, s1=pts.push([mx,my+dm])-1, s2=pts.push([mx+dm,my-dm])-1;
  // ensure ccw super
  let tris=[[s0,s1,s2]];
  const ccw=(t)=>{ if(orient(pts[t[0]][0],pts[t[0]][1],pts[t[1]][0],pts[t[1]][1],pts[t[2]][0],pts[t[2]][1])<0){ return [t[0],t[2],t[1]]; } return t; };
  tris=tris.map(ccw);
  for(let ip=0; ip<P.length; ip++){
    const px=pts[ip][0], py=pts[ip][1];
    const bad=[];
    for(const t of tris){ if(circumContains(pts[t[0]][0],pts[t[0]][1],pts[t[1]][0],pts[t[1]][1],pts[t[2]][0],pts[t[2]][1],px,py)) bad.push(t); }
    // boundary edges of the cavity
    const edgeCount=new Map();
    const key=(a,b)=>a<b?a+"_"+b:b+"_"+a;
    bad.forEach(t=>{ [[t[0],t[1]],[t[1],t[2]],[t[2],t[0]]].forEach(e=>{ const k=key(e[0],e[1]); edgeCount.set(k,(edgeCount.get(k)||0)+1); }); });
    const badSet=new Set(bad);
    tris=tris.filter(t=>!badSet.has(t));
    bad.forEach(t=>{ [[t[0],t[1]],[t[1],t[2]],[t[2],t[0]]].forEach(e=>{ if(edgeCount.get(key(e[0],e[1]))===1){ tris.push(ccw([e[0],e[1],ip])); } }); });
  }
  // drop triangles touching super vertices
  return tris.filter(t=>t[0]<P.length && t[1]<P.length && t[2]<P.length);
}

function triangulate(ringIn, spacing){
  const ring=dedupe(ringIn);
  if(ring.length<3) return {verts:[],tris:[],ring, area:0, meshArea:0, coverage:0, minTriArea:0};
  spacing = spacing || 18;
  const bpts=boundaryPoints(ring,spacing);
  // interior grid
  let minx=1e18,miny=1e18,maxx=-1e18,maxy=-1e18;
  ring.forEach(p=>{minx=Math.min(minx,p[0]);miny=Math.min(miny,p[1]);maxx=Math.max(maxx,p[0]);maxy=Math.max(maxy,p[1]);});
  const ipts=[];
  const jitter=spacing*0.0001;
  for(let y=miny+spacing*0.5; y<maxy; y+=spacing){
    let row=0;
    for(let x=minx+spacing*0.5; x<maxx; x+=spacing){
      const p=[x+ (row%2?spacing*0.5:0) + jitter, y]; row++;
      if(pointInPoly(p,ring) && minDistToRing(p,ring)>spacing*0.55) ipts.push(p);
    }
  }
  const P=bpts.concat(ipts);
  let tris=delaunay(P);
  // keep triangles whose centroid is inside the outline, drop slivers
  const area=polyArea(ring);
  const kept=[]; let meshArea=0, minTriArea=1e18;
  for(const t of tris){
    const A=[P[t[0]],P[t[1]],P[t[2]]];
    const c=[(A[0][0]+A[1][0]+A[2][0])/3,(A[0][1]+A[1][1]+A[2][1])/3];
    if(!pointInPoly(c,ring)) continue;
    const ta=Math.abs(orient(A[0][0],A[0][1],A[1][0],A[1][1],A[2][0],A[2][1]))/2;
    if(ta<1e-6) continue;
    kept.push(t); meshArea+=ta; minTriArea=Math.min(minTriArea,ta);
  }
  return { verts:P, tris:kept, ring, boundaryCount:bpts.length,
           area, meshArea, coverage: area? meshArea/area : 0, minTriArea: kept.length?minTriArea:0 };
}

const API={ triangulate, polyArea, pointInPoly, dedupe };
if(typeof module!=="undefined" && module.exports) module.exports=API;
root.MESH=API;
})(typeof window!=="undefined"?window:globalThis);
