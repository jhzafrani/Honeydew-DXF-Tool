// Assemble the 3D sew-up spike, injecting the DXF parser straight from the main app
// so it never drifts. Edit spike_template.html; run `node build_spike.js` to produce
// the deployable 3d-sewup.html.
const fs=require("fs"), path=require("path");
const APP="/sessions/intelligent-inspiring-mayer/mnt/Brick Builders App/apparel-dxf-viewer.html";
const TPL=path.join(__dirname,"spike_template.html");
const OUT="/sessions/intelligent-inspiring-mayer/mnt/Brick Builders App/3d-sewup.html";

const app=fs.readFileSync(APP,"utf8");
const start=app.indexOf("// Layer semantics");
const ret=app.indexOf("return {pieces, headerAAMA", start);
if(start<0||ret<0){ console.error("could not locate parser in app"); process.exit(1); }
const braceEnd=app.indexOf("\n}", ret);
const parser=app.slice(start, braceEnd+2);

let tpl=fs.readFileSync(TPL,"utf8");
if(tpl.indexOf("/*__PARSER__*/")<0){ console.error("template missing /*__PARSER__*/ marker"); process.exit(1); }
tpl=tpl.replace("/*__PARSER__*/", parser);

// inject shared modules (single source of truth), if the template references them
const mods=[["/*__MESH__*/","mesh.js"]];
for(const [marker,file] of mods){
  if(tpl.indexOf(marker)>=0){
    const code=fs.readFileSync(path.join(__dirname,file),"utf8");
    tpl=tpl.replace(marker, code);
  }
}
fs.writeFileSync(OUT, tpl);
console.log("wrote", OUT, "("+tpl.length+" bytes) · parser "+parser.length+" bytes");
