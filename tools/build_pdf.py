# -*- coding: utf-8 -*-
import os, subprocess, cairosvg
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                HRFlowable, KeepTogether, Flowable, ListFlowable, ListItem, Image)
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.graphics.shapes import Drawing, Rect, String, Circle, Line, Group
from svglib.svglib import svg2rlg

BASE="/sessions/intelligent-inspiring-mayer/mnt/Brick Builders App"
OUT=os.path.join(BASE,"honeydew-dxf-tool-user-manual.pdf")
LOGO=os.path.join(BASE,"honeydew-logo.svg")

INK=colors.HexColor("#1c1a17"); MUT=colors.HexColor("#8a8175")
GREEN=colors.HexColor("#3a6b52"); GOLD=colors.HexColor("#b3894e")
LINE=colors.HexColor("#e2dccf"); PAPER=colors.HexColor("#fffdf9"); PANEL=colors.HexColor("#efeae1")
CW=504.0  # content width (letter - 54*2)

def style(name,**kw):
    base=dict(fontName="Helvetica",fontSize=10.2,leading=15,textColor=INK)
    base.update(kw); return ParagraphStyle(name,**base)
S_body=style("body")
S_lead=style("lead",fontSize=11,leading=16,textColor=colors.HexColor("#39352e"))
S_h2=style("h2",fontName="Times-Bold",fontSize=19,leading=22,textColor=INK,spaceBefore=6,spaceAfter=2)
S_h3=style("h3",fontName="Times-Bold",fontSize=13.5,leading=17,textColor=colors.HexColor("#2a2721"),spaceBefore=8,spaceAfter=1)
S_eyebrow=style("eye",fontName="Helvetica-Bold",fontSize=9,leading=12,textColor=GOLD,alignment=TA_CENTER)
S_title=style("title",fontName="Times-Italic",fontSize=30,leading=34,textColor=INK,alignment=TA_CENTER)
S_sub=style("sub",fontSize=11,leading=15,textColor=MUT,alignment=TA_CENTER)
S_cellnum=style("cn",fontName="Helvetica-Bold",fontSize=10,alignment=TA_CENTER,textColor=colors.white)
S_cellbtn=style("cb",fontName="Helvetica-Bold",fontSize=9.5,textColor=INK)
S_cell=style("cc",fontSize=9.3,leading=13)
S_th=style("th",fontName="Helvetica-Bold",fontSize=8.6,textColor=colors.HexColor("#6a6154"))
S_tip=style("tip",fontSize=9.6,leading=13.6,textColor=colors.HexColor("#2a4a39"))
S_capstyle=style("cap",fontName="Times-Italic",fontSize=9.3,leading=12.5,textColor=MUT)

story=[]

def rule(color=LINE,w=CW,th=0.8,sb=6,sa=6):
    return HRFlowable(width=w,thickness=th,color=color,spaceBefore=sb,spaceAfter=sa,lineCap="round")

def h2(n,title):
    story.append(Spacer(1,10))
    story.append(rule(LINE,CW,0.8,6,7))
    story.append(Paragraph(f'<font color="#b3894e" size="13">{n}</font>&nbsp;&nbsp;{title}',S_h2))
    story.append(Spacer(1,3))
def h3(t): story.append(Paragraph(t,S_h3))
def p(t,s=S_body): story.append(Paragraph(t,s))
def bullets(items,s=S_body):
    story.append(ListFlowable([ListItem(Paragraph(t,s),leftIndent=12,value="•") for t in items],
                 bulletType="bullet",start="•",leftIndent=14,bulletColor=GREEN,bulletFontSize=9))
def steps(items,s=S_body):
    story.append(ListFlowable([ListItem(Paragraph(t,s),leftIndent=14) for t in items],
                 bulletType="1",leftIndent=18,bulletColor=GREEN,bulletFontName="Helvetica-Bold",bulletFontSize=9.5))

# in-context tool mockups: render mock_<name>.svg -> PNG and place with a caption
SDIR=os.path.dirname(os.path.abspath(__file__))
S_cap=S_capstyle
def mock(name,cap,width=CW):
    svg=os.path.join(SDIR,"mock_"+name+".svg")
    png=os.path.join(SDIR,"_mock_"+name+".png")
    cairosvg.svg2png(url=svg, write_to=png, output_width=int(width*2.2), background_color="#0f1216")
    img=Image(png, width=width, height=width*(400.0/680.0))
    flow=[Spacer(1,6), img]
    if cap: flow.append(Paragraph(cap,S_cap))
    flow.append(Spacer(1,4))
    story.append(KeepTogether(flow))

# ---------- masthead ----------
logo=svg2rlg(LOGO)
lw=300.0; sc=lw/logo.width
logo.scale(sc,sc); logo.width*=sc; logo.height*=sc; logo.hAlign="CENTER"
story.append(Spacer(1,26))
story.append(logo)
story.append(Spacer(1,12))
story.append(HRFlowable(width=70,thickness=1,color=GOLD,spaceBefore=2,spaceAfter=10,hAlign="CENTER"))
story.append(Paragraph("TECHNICAL TOOLS",S_eyebrow))
story.append(Paragraph("The DXF Tool",S_title))
story.append(Paragraph("User manual &middot; apparel pattern (AAMA/ASTM) viewer, measuring &amp; annotation",S_sub))
story.append(Spacer(1,16))

# ---------- access ----------
acc=Table([[Paragraph('<b><font face="Times-Bold" size="12">Where to find it</font></b><br/>'
    'Web app: <font color="#3a6b52">https://honeydew-dxf-tool.netlify.app/</font><br/>'
    'Site password: <b>HoneydewTools2026</b><br/>'
    '<font color="#8a8175" size="8.5">Works in any modern browser. Install &amp; open-.dxf-directly need Chrome or Edge (see §8).</font>',S_body)]],
    colWidths=[CW])
acc.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),colors.HexColor("#f2f7f3")),
    ("BOX",(0,0),(-1,-1),0.8,colors.HexColor("#cfe2d4")),("LEFTPADDING",(0,0),(-1,-1),14),
    ("RIGHTPADDING",(0,0),(-1,-1),14),("TOPPADDING",(0,0),(-1,-1),12),("BOTTOMPADDING",(0,0),(-1,-1),12),
    ("ROUNDEDCORNERS",[8,8,8,8])]))
story.append(acc)

# ---------- toolbar diagram (native, no emoji) ----------
_TBLABELS=["Open","Pan","Move","Measure","Seam","Point","Arrow","Box","Sew","3D","Undo","Redo","Fit","All","Nest",
    "Grade","SA","QC","POM","Measures","Grid","Rulers","Ruler","PNG","PDF","Spec","Yield","Tech Pack","1:1",
    "Save DXF","Save As","Install","Units"]
TB=[(str(i+1),lab) for i,lab in enumerate(_TBLABELS)]
def toolbar_drawing():
    padx=9; h=19; gap=6; rowgap=12; fs=9
    from reportlab.pdfbase.pdfmetrics import stringWidth
    rows=[[]]; x=0
    for num,lab in TB:
        w=padx*2+stringWidth(lab,"Helvetica",fs)
        if x+w>CW-6:
            rows.append([]); x=0
        rows[-1].append((num,lab,w)); x+=w+gap
    H=len(rows)*(h+rowgap)+10
    d=Drawing(CW,H)
    d.add(Rect(0,0,CW,H,rx=8,ry=8,fillColor=PANEL,strokeColor=LINE,strokeWidth=0.8))
    y=H-h-8
    for row in rows:
        x=8
        for num,lab,w in row:
            d.add(Rect(x,y,w,h,rx=5,ry=5,fillColor=colors.white,strokeColor=LINE,strokeWidth=0.7))
            s=String(x+padx,y+5.5,lab,fontName="Helvetica",fontSize=fs,fillColor=INK); d.add(s)
            d.add(Circle(x,y+h,7,fillColor=GREEN,strokeColor=None))
            d.add(String(x,y+h-3.2,num,fontName="Helvetica-Bold",fontSize=8,fillColor=colors.white,textAnchor="middle"))
            x+=w+gap
        y-=(h+rowgap)
    return d

# ---------- sidebar diagram ----------
SIDE=[("A","File","File name + materials summary; your name stamps notes"),
      ("B","Pieces  +  EN","Piece list; size chips filter by size (pick a size with no piece selected to lay out all pieces of that size); English toggle; click to isolate"),
      ("C","Selected piece","Name, size, qty, material, W×H, notch/drill counts, SA, symmetry"),
      ("D","Layers","Show/hide cut, sew, grain, notches, drill…"),
      ("E","Annotations","All notes; filter by category/piece, export CSV; click to jump & edit, × to delete")]
def sidebar_drawing():
    W=280; rowh=34; gap=8; H=len(SIDE)*(rowh+gap)+8
    d=Drawing(W,H); d.add(Rect(0,0,W,H,rx=8,ry=8,fillColor=PANEL,strokeColor=LINE,strokeWidth=0.8))
    y=H-rowh-6
    for letter_,title,desc in SIDE:
        d.add(Rect(26,y,W-34,rowh,rx=6,ry=6,fillColor=colors.white,strokeColor=LINE,strokeWidth=0.7))
        d.add(String(36,y+rowh-13,title,fontName="Helvetica-Bold",fontSize=9,fillColor=INK))
        d.add(String(36,y+7,desc,fontName="Helvetica",fontSize=7.6,fillColor=colors.HexColor("#6a6154")))
        d.add(Circle(12,y+rowh/2,9,fillColor=GOLD,strokeColor=None))
        d.add(String(12,y+rowh/2-3.2,letter_,fontName="Helvetica-Bold",fontSize=9,fillColor=colors.white,textAnchor="middle"))
        y-=(rowh+gap)
    d.hAlign="CENTER"; return d

def ref_table(rows,numcolor=GREEN):
    data=[[Paragraph("#",S_th),Paragraph("BUTTON",S_th),Paragraph("WHAT IT DOES",S_th)]]
    for a,b,c in rows:
        data.append([Paragraph(a,S_cellnum),Paragraph(b,S_cellbtn),Paragraph(c,S_cell)])
    t=Table(data,colWidths=[26,88,CW-26-88],repeatRows=1)
    st=[("BACKGROUND",(0,0),(-1,0),PANEL),("LINEBELOW",(0,0),(-1,-1),0.5,LINE),
        ("BOX",(0,0),(-1,-1),0.8,LINE),("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
        ("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7)]
    for r in range(1,len(data)):
        st.append(("BACKGROUND",(0,r),(0,r),numcolor))
    t.setStyle(TableStyle(st)); return t

# ===== SECTIONS =====
h2("1","Getting started")
p("The DXF Tool opens apparel pattern files exported in the <b>AAMA/ASTM</b> (ANSI/AAMA-DXF) format and lets you view, measure, quality-check and annotate them in the browser — nothing to install (though you can; see §8).")
h3("Open the tool")
steps([
 'Go to <font color="#3a6b52">honeydew-dxf-tool.netlify.app</font> in Chrome, Edge, Safari or Firefox.',
 'Enter the site password <b>HoneydewTools2026</b>. You land on an empty canvas with a "Drop an apparel DXF here" message.'])
h3("Load a pattern file")
steps([
 'Click <b>Open</b> in the toolbar (or drag files onto the window, or click <b>Choose file…</b> in the drop zone).',
 'Select one or more <b>.dxf</b> files. For full size info, also select the matching <b>.rul</b> grade file in the same dialog — the tool pairs it with the DXF automatically.',
 'The pattern draws in the canvas; the sidebar fills in with the file name, a materials summary, and the list of pieces.'])
p('<font color="#2a4a39">You can add the .rul later too — just drag it onto the window while the pattern is open, and the size-aware features switch on.</font>',S_tip)
p('<font color="#2a4a39">The tool reads AAMA/ASTM apparel DXFs and also plain CAD DXFs (geometry in the ENTITIES section, named layers like CUT / NET / GRAIN). If a file declares its units ($INSUNITS — e.g. inches) it is scaled correctly and the unit selector switches to match; files with no unit header are assumed millimetres.</font>',S_tip)
h3("Move around the pattern")
steps([
 '<b>Zoom</b> — scroll the wheel or pinch the trackpad. Zoom centers on the cursor, so point at what you want first. The step is gentle for fine control.',
 '<b>Pan</b> — with the <b>Pan</b> tool active (the default), drag anywhere on the canvas.',
 '<b>Fit</b> — click <b>Fit</b> (F) to frame the current piece/selection, or <b>All</b> to frame the whole file.',
 'The bottom-left readout shows the cursor x / y and the current zoom %.'])
h3("Work with several files")
p("Each DXF opens in its own <b>tab</b> across the top. Click a tab to switch, the <b>×</b> to close (you'll be asked to save if there are changes), or <b>+</b> to open another. Two revisions open at once powers the Compare overlay (§9).")
p('<font color="#2a4a39"><b>Pattern colours:</b> white = cut line, blue dashed = sew/seam, green = grain, purple = fold/internal, plus smaller marks, yellow notches and red drill holes — all toggleable in the <b>Layers</b> panel.</font>',S_tip)

h2("2","The toolbar")
p("The toolbar runs across the top and <b>wraps onto a second row</b> on smaller screens, so every control stays visible. Numbers match the reference below.")
story.append(Spacer(1,4)); story.append(toolbar_drawing()); story.append(Spacer(1,8))
h3("Button reference")
story.append(ref_table([(str(i+1),b,c) for i,(b,c) in enumerate([
 ("Open","Open one or more .dxf files (plus optional .rul). In Chrome/Edge this also enables true in-place Save."),
 ("Pan","Move around; click an annotation or ruler to select it. (V)"),
 ("Move","Rearrange pieces on the artboard — drag a piece and green guides snap its edges, centres and notches to neighbours (e.g. align a front and back at the armhole). Click a piece to select it and a small rotate/flip control floats next to its bounding box: rotate 90° left/right and flip horizontally/vertically — handy for measuring or aligning a mirrored piece. For free transform, turn off the magnet snap toggle (or hold Alt) to drag without snapping, and drag the round handle above the piece to rotate to any angle (Shift = 15° steps). Pieces are drawn in a translucent onion-skin tint so an overlapping piece stays see-through. Double-click a piece to reset its position, rotation and flip. The layout is remembered in the DXF; the pattern geometry is never changed. (X)"),
 ("Measure","Click two points for straight-line distance + X/Y deltas; press Pin to keep it. (M)"),
 ("Seam","Click two points on the SAME line to measure length ALONG the curve. Measure a second seam to compare (walk-the-seam): shows A/B and their difference with a match/off flag. Flip picks the other arc. (S)"),
 ("Point","Drop a point note. (P)"),
 ("Arrow","Leader: click anchor then target. (L)"),
 ("Box","Region: click two corners. (B)"),
 ("Sew","Manual seam pairing — click an edge on one piece, then its matching edge on another, to pair them into a seam. Outlines are split into clickable edges at corners and notches, so seams can be matched notch-to-notch. Paired edges get matching numbered tags, a connector, direction arrows and a length readout that flags mismatches. The Seams panel lists them (⇄ flip, ✕ delete). Saved in the DXF; drives the 3D preview."),
 ("3D","3D sew preview (experimental) — drapes the pieces together in 3D using your seam map. Pieces wrap around a body form and the paired seams stitch together. Drag to orbit, scroll to zoom; Pause/Play, Reset, Body toggle, Wire view. Pair some seams first, then open it."),
 ("Undo","Undo the last annotation change (multi-level, per tab). Ctrl/Cmd+Z."),
 ("Redo","Redo. Ctrl/Cmd+Shift+Z."),
 ("Fit","Fit the current piece/selection to the window. (F)"),
 ("All","Show every piece in the file."),
 ("Nest","Grade nest — overlay all sizes, colored by size; click a base piece to isolate. (G)"),
 ("Grade","Grade vectors — show how each grade point grows across sizes."),
 ("SA","Seam-allowance check — select a piece first; flags where allowance drifts."),
 ("QC","Pattern check — auto-audits for open contours, self-intersections, duplicate points, missing grain, missing sizes and notch/drill mismatches. Click a finding to zoom to it."),
 ("POM","Points of measure — define point-to-point, along-seam or multi-segment girth measures that grade across every size with a tolerance flag; save/reload the set."),
 ("Measures","Show all measurements — a toggle. Select a single piece and it auto-labels every boundary edge length and the overall W×H at the current size, plus any Points of measure on that piece. Pick a size chip (with no individual piece) instead and it dimensions every piece of that size on the artboard."),
 ("Grid","Toggle a faint positioning grid across the artboard. Grid lines fall on the same ticks as the rulers and rescale with zoom and the unit selector; the origin (x=0, y=0) axes are drawn slightly brighter."),
 ("Rulers","Toggle top & left rulers. (R)"),
 ("Ruler","Drop a measuring ruler; snaps to lines, drag ends to rotate/resize."),
 ("PNG","Export the current view as a PNG image."),
 ("PDF","Printable report (view + QC results + graded POM chart + annotation table, translated names)."),
 ("Spec","Excel spec sheet (.xlsx) — mm / cm / inch tabs + translated names, plus Grade rules, Points of measure, QC report and Marker (yield) tabs."),
 ("Yield","Fabric marker & yield estimate — nests pieces into a fabric width; reports marker length, fabric used (m / yd) and utilisation with a visual layout."),
 ("Tech Pack","One consolidated spec document — pieces, materials, graded POM, QC, fabric yield and annotations — ready to Save as PDF."),
 ("1:1","Print at actual size, tiled across pages, with a 50 mm calibration bar and R#·C# tile labels."),
 ("Save DXF","Write annotations, renamed pieces and artboard layout into the DXF (in place when possible, else downloads)."),
 ("Save As","Save a separate copy of the DXF under a new name (downloads), leaving the original untouched — handy for versioning a marked-up or rearranged file."),
 ("Install","Install as a desktop app (Chrome/Edge; appears when available)."),
 ("Units","Switch units: mm · cm · inch — affects readouts, rulers and exports."),
])]))

h2("3","The sidebar")
p("The left panel is your table of contents for the file, stacked top to bottom: <b>File</b> info, the <b>Pieces</b> list, the <b>Selected piece</b> details, the <b>Layers</b> toggles, and your <b>Annotations</b>. The Pieces, Selected-piece and Annotations panes scroll independently, and you can drag the thin handle between panes to resize them.")
story.append(Spacer(1,4)); story.append(sidebar_drawing()); story.append(Spacer(1,8))
p('<font color="#2a4a39">Type your name into <b>File -> “Your name”</b> once; every annotation is then stamped with your name and the date.</font>',S_tip)

h2("4","Measuring & the ruler")
p("Three ways to measure: a quick <b>straight-line</b> distance, a <b>seam length that follows a curve</b>, and a draggable <b>guide ruler</b>. All read out in the selected unit and update instantly if you switch units.")
h3("Quick measure — straight line")
steps(['Click <b>Measure</b> (or press M). The cursor becomes a crosshair.',
 'Click the start point — a live dashed line follows the cursor.',
 'Click the end point. The bottom-right readout shows the straight-line <b>Distance</b> plus the horizontal and vertical deltas (X and Y).',
 'Click <b>Pin</b> in the readout to keep it as a saved measurement (the note editor opens to label it).'])
p('<font color="#2a4a39">Straight measure does not snap to lines — zoom in for precise point-to-point work, or use the guide ruler, which snaps to corners and edges.</font>',S_tip)
mock("measure","Measuring the chest width: the green dashed line runs between your two clicks; the readout shows distance plus X/Y deltas, with Pin to keep it as a saved measurement.")
h3("Seam length & walk-the-seam")
p("Use this for the length <b>along</b> a curved edge (armhole, neckline, princess seam), and to check that two edges which must sew together are equal.")
steps(['Click <b>Seam</b> (or press S).',
 'Click a point on a pattern line (a highlight ring shows the lock-on), then a <b>second</b> point <b>on the same line</b>. The tool reports the length along the curve between them.',
 'To compare, measure a <b>second</b> seam. The readout shows <b>Seam A</b> and <b>Seam B</b> with their difference, flagged <b>match</b> or <b>off</b> against tolerance.',
 'On a closed outline, if it traced the long way, click <b>Flip last</b> to take the other arc. <b>Clear</b> starts over.'])
p('<font color="#7a5a1e"><b>Note:</b> both clicks must land on the SAME line entity. If the second click does not register, you likely hit a different line (e.g. sew instead of cut) — zoom in and click directly on the intended edge.</font>',S_tip)
mock("seam","Walk-the-seam: the front armhole (Seam A, orange) measured against the sleeve cap (Seam B, cyan). The readout compares the two curved lengths and flags a match when within tolerance.")
h3("The guide ruler")
p("A movable, rotatable ruler with tick marks — like laying a physical ruler on the pattern. It is a measuring aid and is not saved unless you convert it to an annotation.")
steps(['Click <b>Ruler</b> to drop one (or turn on <b>Rulers</b> and drag down from the top ruler bar).',
 'It appears spanning the piece edge-to-edge with a <b>0</b> at the left end.',
 '<b>Move</b> — drag the middle to slide it.',
 '<b>Rotate / resize</b> — drag either square end. Hold Shift while dragging to snap the angle to 15° steps.',
 '<b>Snap</b> — drag an end near a line and it locks onto the nearest corner/edge (magenta marker).',
 '<b>Keep or remove</b> — click the ruler for a menu: <b>Annotate</b> saves it as a measurement, <b>×</b> removes it (double-click also removes).'])
mock("ruler","The guide ruler laid across a piece: ticks read from the 0 end, dragging an end near a corner snaps to it (magenta marker), and the menu lets you Annotate (save) or remove it.")

h3("Show all measurements (Measures)")
p("When you just want to <b>see</b> every measurement on a piece rather than measure by hand, use the <b>Measures</b> toggle.")
steps(['Select a <b>single piece</b> in the sidebar (a specific piece at a specific size).',
 'Click <b>Measures</b>. The tool auto-labels every boundary edge length (segmented at corners, measured along curves) and the overall width/height as dimension bars. Each measurement shows small start/end reference dots so you can see exactly which two points it spans.',
 'Any <b>Points of measure</b> defined on that piece are drawn too, resolved to the selected size with their values.',
 'Switch pieces or sizes and the labels update; click <b>Measures</b> again to turn it off.'])
p('<font color="#2a4a39">Want measurements on every piece at once? Pick a size chip (without selecting an individual piece) and turn on Measures — the whole size is laid out on the artboard and each piece is dimensioned. With nothing selected the overlay stays off to avoid clutter.</font>',S_tip)
p('<font color="#2a4a39">Everything reads in the current unit — flip the Units selector to see the same piece in mm, cm or inches.</font>',S_tip)

h3("Positioning grid (Grid)")
p("Click <b>Grid</b> to lay a faint grid over the artboard for eyeballing spacing and lining pieces up. The grid is in sync with the rulers — its lines sit on the same ticks and rescale as you zoom and switch units (mm · cm · inch). The origin (x=0, y=0) axes are drawn a touch brighter. Works with or without the rulers showing.")

h3("Rearrange pieces on the artboard (Move)")
p("Use <b>Move</b> (X) to slide pieces around so you can compare them side by side — for example, butting a front and a back together to check that the armholes or side seams line up.")
steps(['Click <b>Move</b>. The view switches to show all pieces so you have something to align against.',
 'Drag any piece. As an edge, centre-line or notch comes close to the same feature on a neighbour, a green dashed alignment guide appears and the piece snaps into line.',
 'Drop it where you want. To undo a placement, double-click the piece and it jumps back to its original position (this also clears any rotation or flip).'])
p("<b>Rotate &amp; flip:</b> click a piece to select it (blue outline) — a small control floats next to its bounding box with <b>rotate 90°</b> counter-clockwise / clockwise and <b>flip</b> left-right / top-bottom. Useful for measuring or aligning a mirrored or off-orientation piece. These are stored in the DXF like moves and reload with the file.")
p("<b>Free transform:</b> by default dragging snaps to the alignment guides. Turn off the magnet toggle in the floating control (or hold <b>Alt</b>) to move with no snapping, and drag the round handle above the selected piece to rotate to any angle about its centre (hold <b>Shift</b> for 15° steps).")
p('<font color="#2a4a39">While you are in Move mode the pieces are drawn in a faint onion-skin tint, so when one piece sits on top of another it stays see-through and you can read the piece underneath. The piece you are dragging is tinted a touch stronger; overlapping tints blend, making it easy to see where two edges or armholes line up.</font>',S_tip)
p('<font color="#2a4a39">Moving a piece never changes the pattern — the original coordinates are preserved. Your arrangement is stored as a note inside the DXF, so on Save + reopen the layout comes back exactly as you left it.</font>',S_tip)

h3("Rename a piece")
p("If the auto-translated name isn't what you call the piece, rename it: select the piece, click the pencil (✎) next to its Name in the sidebar and type a new label. The name updates on the piece badge, the piece list, the nest view and every export, and is saved inside the DXF with your annotations.")

h3("Save a copy (Save As…)")
p("<b>Save DXF</b> writes your annotations, renamed pieces and artboard layout back into the current file. <b>Save As…</b> instead downloads a separate copy under a new name, leaving the original untouched — useful for keeping a marked-up or rearranged version next to the clean original.")

h3("Pair seams (Sew)")
p("The <b>Sew</b> tool builds a <b>seam map</b> by hand — a record of which edge sews to which. It checks that joining seams match in length and is the foundation for the upcoming 3D sew-up.")
steps(['Click <b>Sew</b>. Each piece’s outline lights up, split into clickable edges at its corners and notches — so a long seam that meets two shorter edges can be joined notch-to-notch.',
 'Click an edge on one piece (a thread follows your cursor), then click the matching edge on another piece to pair them. Esc or empty-space click cancels.',
 'Each seam gets a matching numbered tag and colour on both edges, a dashed connector, direction arrows, and a length readout (e.g. 24.0 / 24.1 cm, red ⚠ if the edges differ by more than tolerance).',
 'The Seams panel lists every pair — click to highlight, ⇄ flip sew direction, ✕ delete.'])
p('<font color="#2a4a39">Seam maps are saved in the DXF with Save DXF and reload with the file. Pieces are matched by name, so pair seams on the size you are working with.</font>',S_tip)

h3("3D sew preview (3D) — experimental")
p("Once you have paired some seams, click <b>3D</b> to see the pieces <b>drape together in 3D</b>. The tool wraps the pieces around a body form and stitches the seams you defined — what you see comes straight from your seam map, not a guess.")
steps(['Pair the seams you care about with <b>Sew</b> first, then click <b>3D</b>.',
 'Drag to orbit the view; scroll to zoom.',
 'Pause/Play the drape, Reset restarts it, Body toggles the form, Wire shows the mesh.',
 'Close returns to the flat pattern.'])
p('<font color="#7a5a1e">This is an early preview for checking how pieces come together, not a precise fabric simulation. The more seams you pair, the more complete the drape.</font>',S_tip)

h2("5","Annotations")
p("Annotations are notes you place on the pattern to flag issues, ask questions or approve details. Four kinds — <b>Point</b> (a pin), <b>Arrow</b> (a leader), <b>Box</b> (a region), and pinned <b>measurements</b> — all saved inside the DXF so they travel with the file.")
h3("Set your name first (once)")
p("In the sidebar <b>File</b> section, type your name into the <b>Your name</b> box. Every annotation you create is then stamped with your name and the date. You only do this once per browser.")
h3("Create an annotation")
steps(['Pick a tool: <b>Point</b> (P), <b>Arrow</b> (L) or <b>Box</b> (B).',
 'Click on the pattern — Point is one click; Arrow is anchor then target; Box is one corner then the opposite corner.',
 'The editor opens: type a <b>note</b>, choose a <b>category</b> (Note, Issue, To-do, Question, Approved) and a <b>colour</b>, then <b>Save</b>. (Esc cancels a new note.)',
 'Each note is auto-tagged with the nearest <b>piece</b>, your <b>name</b> and the <b>date</b>.'])
mock("anno","The three note types on a piece — a numbered point (1), an arrow leader (2) and a dashed box region (3) — with the editor open: note text, category and colour, stamped with piece, author and date.")
h3("Read, edit & delete")
steps(['<b>Read</b> — hover a pin to see its note.',
 '<b>Edit</b> — switch to <b>Pan</b> mode and click the pin; the editor reopens.',
 '<b>Jump</b> — click a row in the Annotations panel to center and open that note.',
 '<b>Delete</b> — click the <b>×</b> on its row, or open it and press Delete (Ctrl/Cmd+Z undoes).'])
h3("Filter & export")
steps(['Use the <b>category</b> and <b>piece</b> dropdowns in the Annotations panel to narrow the list.',
 'Click <b>CSV</b> to export exactly what is shown — note, category, original + translated piece name, measurement, author, date.'])
p('<font color="#2a4a39">Notes support any language (including Chinese). They are written into the DXF on Save DXF, so a colleague who opens the file sees them in place.</font>',S_tip)

h2("6","Grade nest & grade vectors")
p("Grading is how a pattern scales from size to size. The nest stacks every size so you can see the progression; grade vectors show the direction each landmark grows. Load the <b>.rul</b> alongside the DXF for exact size order and sample size.")
h3("View the size nest")
steps(['Click <b>Nest</b> (or press G). Every size draws overlaid and <b>colored by size</b>; the sidebar switches to a list of base pieces with a colour legend.',
 'Click a base piece to <b>isolate</b> just its nested sizes — much easier to read.',
 'The Selected piece panel shows a grade table: each size\'s width × height and the width delta vs the sample (marked with *).',
 'Click <b>Nest</b> again to return to the normal per-piece list.'])
mock("nest","Grade nest — every size of a piece overlaid and coloured by size, with the sample (M) drawn heavier and a matching size legend.")
h3("Show grade vectors")
steps(['With a piece in view, click <b>Grade</b>.',
 'At each grade point a fan connects the sizes with an arrow toward the largest — showing which way and how much each landmark moves.',
 'Pieces that do not grade (a pocket, a trim) correctly show no vectors — a quick sanity check.',
 'Click <b>Grade</b> again to hide them.'])
p('<font color="#2a4a39">Without a .rul the tool still groups sizes it can infer, but order and sample may not match your intent. Loading the .rul makes the nest, grade table, grade-rules export and POM grading exact.</font>',S_tip)

h2("7","Quality checks & exports")
p("The tools that verify a pattern is correct — seam allowance, symmetry, the automatic pattern check and points of measure — and the ways to get results out.")
h3("Seam allowance (SA)")
p("Seam allowance is the gap between the cut line and the sew line. This check highlights where that gap is inconsistent.")
steps(['Click a single piece in the sidebar to select it (needs a piece with both a cut and a sew line).',
 'Click <b>SA</b>.',
 'The sew line is dotted <b>green</b> where the allowance matches the typical value and <b>red</b> where it drifts more than 1&nbsp;mm.',
 'The panel reports typical, min / max, and how many points are off — telling an intentional stepped allowance from an error.',
 'Click <b>SA</b> again to turn the overlay off.'])
h3("Symmetry & mirror pairs")
bullets(['With a piece selected, the panel reports a <b>symmetry</b> deviation — how far the piece is from being a mirror image of itself (useful for pieces that should be symmetric, like a back bodice).',
 'The tool also detects <b>mirror pairs</b> — two pieces that are mirror images of each other (e.g. left / right sleeve). The count appears in the materials summary.'])
h3("Pattern check (QC)")
p("Click <b>QC</b> to run an automatic audit of the whole file. Findings are listed by severity (errors first); click any one to zoom to the piece and the exact spot.")
bullets(['<b>Errors</b> — no cut line, cut line not closed, cut line self-intersects, a graded set missing sizes, or notch/drill counts that differ between sizes of the same piece.',
 '<b>Warnings</b> — duplicate / zero-length points, a missing grain line, or a mirror pair with mismatched notch counts.'])
mock("qc","The QC panel lists findings by severity — errors first, then warnings. Clicking a finding zooms to the piece and the exact spot (the red locator ring here).")
p('<font color="#2a4a39">QC results also appear in the PDF report and as a tab in the Spec workbook, so a factory gets the same audit you see.</font>',S_tip)
h3("Points of measure (POM)")
p("A point of measure is a measurement you define once — a chest width, an armhole length, a total waist — that the tool then calculates for <b>every size</b> and flags if a size grades unevenly. This is the heart of a graded spec. Click <b>POM</b> to open the panel, then add a measure by type:")
steps(['<b>P–P (point-to-point)</b> — for widths and lengths. Click the button, then click two points; each snaps to the nearest vertex/edge (magenta marker). The name/tolerance box opens after the second point.',
 '<b>Seam</b> — for a length that follows a curve. Click the button, then two points on the <b>same</b> line.',
 '<b>Girth</b> — for a value made of parts (e.g. total waist = front + back). Add segments one at a time, switching each between P–P and Seam, then click <b>Finish</b>.'])
p("Then:")
steps(['<b>Name it and set a tolerance.</b> Enter a name and a <b>grade tolerance (±)</b> in your current display units (the label follows the unit selector). Click Save.',
 '<b>Read it across sizes.</b> Click the measure to expand it — a value for every size, with any size flagged when its grade step is off by more than the tolerance.',
 '<b>Jump to a size.</b> Click any size box to isolate and zoom to that size\'s piece with the measure drawn on it.',
 '<b>Edit or remove.</b> Re-select to change name/tolerance; click <b>×</b> to delete.'])
mock("pom","A point-to-point Chest width defined once (left, snapped to two vertices) is calculated for every size in the panel (right). The XL box is flagged amber because its grade step exceeds the tolerance.")
p('<font color="#2a4a39">Points of measure are saved into the DXF with Save DXF and reload when you reopen the file (the tab shows a bullet until you save). Export a .pomset file only to copy the same measures onto a different style.</font>',S_tip)
h3("Exports")
p("Several ways to get work out, each one click in the toolbar:")
bullets(['<b>PNG</b> — saves a snapshot of exactly what is on screen. Frame the view first, then click.',
 '<b>PDF report</b> — opens a printable report (view snapshot, QC results, graded POM chart, and a table of every annotation with translated piece names) in a new tab; choose "Save as PDF" in the print dialog. Allow pop-ups if nothing opens.',
 '<b>Spec (.xlsx)</b> — Excel workbook with mm / cm / inch tabs (each piece × size with dimensions and deltas + translated names), plus <b>Grade rules</b> (with a .rul), <b>Points of measure</b>, <b>QC report</b> and <b>Marker (yield)</b> tabs.',
 '<b>Yield</b> — fabric marker &amp; yield estimate: pick a fabric width and scope, and it nests the pieces and reports marker length, fabric used (m / yd) and utilisation with a visual marker (Save as PDF). A bounding-box estimate; a pro marker uses a bit less fabric.',
 '<b>Tech Pack</b> — one consolidated document: pattern snapshot, piece list (materials, notches, drills), materials summary, graded POM chart, QC results, fabric yield and annotations — ready to Save as PDF for the factory.',
 '<b>CSV</b> — exports the (filtered) annotation list as a spreadsheet.',
 '<b>Save DXF</b> — writes your annotations and points of measure back into the file (see §9).'])
h3("Printing at actual size (1:1)")
p("Use this to print a piece full-size on paper for a physical check or a test cut.")
steps(['Frame the piece(s) you want, then click <b>1:1</b>. A new tab opens with a cover page and the pattern split into tiles across Letter pages.',
 'Print that tab. Set scale to <b>100% / Actual size</b> and turn OFF "Fit to page" — otherwise it will not be true size.',
 'Measure the <b>50 mm calibration bar</b> on the cover page with a ruler to confirm the scale is right.',
 'Trim each tile to its border and tape them together using the <b>R#·C#</b> labels.'])

h2("8","Install as an app & open .dxf directly")
p("You can run the tool like a desktop app and even make it the default program for .dxf files. This uses your browser's built-in install and works in <b>Chrome or Edge</b>.")
h3("Install it")
steps(['Visit the site once in Chrome or Edge and sign in.',
 'Click <b>Install</b> in the toolbar when it appears, or the install icon on the right of the address bar.',
 'Confirm the prompt. The tool now has its own window and icon.'])
h3("Open .dxf files by double-click")
steps(['After installing, right-click a .dxf file and choose Open with (Windows) or Get Info -> Open with (Mac).',
 'Pick the installed DXF Tool and set it as the default.',
 'Double-clicking a .dxf now opens it straight in the tool, each file in its own tab.'])
p('<font color="#7a5a1e"><b>Note:</b> install &amp; open-directly require the hosted https site (not a local file). Safari/Firefox can use every feature but do not support install / file-handler registration.</font>',S_tip)

h2("9","Saving, tabs & comparing revisions")
h3("Saving your work")
steps(['When a file has unsaved changes — new annotations, edited notes, added points of measure — its tab shows a <b>•</b> dot.',
 'Click <b>Save DXF</b>. Your annotations and points of measure are written into the DXF itself.',
 'If you opened the file with <b>Open</b> (Chrome/Edge) or the file handler, it saves <b>in place</b> after a one-time permission click; otherwise it downloads an annotated copy.'])
p('<font color="#2a4a39">Everything baked into the DXF — notes in any language, categories, authors, dates and points of measure — reloads automatically next time anyone opens the file.</font>',S_tip)
h3("Auto-save")
p("Turn on the <b>Auto-save</b> switch in the sidebar File section to have the tool write your changes to the DXF automatically, a moment after you stop editing — no need to press Save DXF.")
steps(['Open the file with <b>Open</b> (or by double-click if set as the .dxf handler) in <b>Chrome or Edge</b> — this gives the tool permission to write back to the actual file.',
 'Tick <b>Auto-save</b>. The first save may ask for one-time permission — click Allow.',
 'Edit as normal. The status by the switch shows "Unsaved changes…" then "Saved 3:42 PM" after each save. Your choice is remembered.'])
p('<font color="#7a5a1e"><b>Note:</b> auto-save writes in place, so it only works for files opened via <b>Open</b> in Chrome/Edge. If a file was dragged in, or you are in Safari/Firefox, the switch shows a hint to use <b>Open</b>, and you should save with <b>Save DXF</b> (which downloads a copy) instead.</font>',S_tip)
h3("Tabs & unsaved changes")
bullets(['Switch between open files with their tabs; add another with <b>+</b>.',
 'Closing a tab with unsaved changes prompts Save / Save As… / Discard / Cancel.',
 'Undo / redo (Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z) is multi-level and per tab.'])
h3("Compare two revisions")
steps(['Open both versions of the pattern, each in its own tab.',
 'With one active, open the <b>Compare</b> dropdown in the sidebar File panel and pick the other version.',
 'The other revision overlays in <b>dashed magenta</b>, aligned by centroid, with a per-piece deviation label ("= match" within tolerance) — showing exactly what moved.',
 'Click <b>Diff</b> (next to the Compare dropdown) for a written "what changed" report: pieces added, pieces removed, and a table of changed pieces with each one’s max deviation and width/height change. Save it as PDF for a revision record.',
 'Set the dropdown back to <b>Compare: none</b> to clear it.'])

h2("10","Keyboard shortcuts")
sc=[("V","Pan / select","M","Measure (straight)"),("S","Seam / curved length","P","Point note"),
    ("L","Arrow / leader","B","Box / region"),("X","Move pieces","F","Fit to view"),
    ("R","Toggle rulers","G","Grade nest"),("Esc","Cancel / close editor","",""),
    ("Ctrl/Cmd+Z","Undo","Ctrl/Cmd+Shift+Z","Redo"),
    ("Shift (drag ruler end)","Snap angle 15°","","")]
kd=[[Paragraph(f'<b>{a}</b>',S_cell),Paragraph(b,S_cell),Paragraph(f'<b>{c}</b>',S_cell),Paragraph(dd,S_cell)] for a,b,c,dd in sc]
kt=Table(kd,colWidths=[110,150,120,CW-110-150-120])
kt.setStyle(TableStyle([("BOX",(0,0),(-1,-1),0.8,LINE),("INNERGRID",(0,0),(-1,-1),0.4,LINE),
  ("VALIGN",(0,0),(-1,-1),"MIDDLE"),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
  ("LEFTPADDING",(0,0),(-1,-1),7),("BACKGROUND",(0,0),(0,-1),PANEL),("BACKGROUND",(2,0),(2,-1),PANEL)]))
story.append(kt)
p('<font color="#8a8175" size="9">On Mac use Cmd; on Windows use Ctrl. Shortcuts are ignored while typing in a note.</font>')

h2("11","Tips & tricks")
h3("Measuring like a patternmaker")
bullets(['<b>Walk the seam.</b> Use <b>Seam</b> to measure a curved edge, then the edge it sews to — the readout flags whether they match. Catch mismatches before the sample room or the 3D drape.',
 '<b>Snap corner-to-corner.</b> Drag a ruler end near a line — it locks to the exact corner/edge.',
 '<b>Lock an angle.</b> Hold Shift while dragging a ruler end for 15° steps (grain, 45° bias, right angles).',
 '<b>Keep it.</b> Select a ruler -> Annotate to save the dimension into the file.'])
h3("Working across sizes")
bullets(['<b>Load the .rul with the .dxf</b> for exact size order, sample size and grade table.',
 '<b>Isolate before you nest</b> — click one base piece for a clean overlay; add Grade for growth direction.',
 '<b>Pockets don’t grade</b> — no vectors there is a quick sanity check.'])
h3("Reviewing & sharing")
bullets(['<b>Tag every note</b> — set your name once; notes carry author, date and piece.',
 '<b>Colour-code by intent</b> (Issue red, To-do blue, Approved green) so a factory scans at a glance.',
 '<b>Filter, then export.</b> Narrow the Annotations list by category or piece and hit CSV to send a factory just its open issues.',
 '<b>Compare revisions.</b> Open the old and new file in tabs, pick the other in Compare, and read the deviation to see what moved.',
 '<b>Export the right thing:</b> PNG (image), PDF (report), Spec .xlsx (mm/cm/inch + grade-rules tabs), CSV (notes), 1:1 print for a physical check.'])
h3("Getting around")
bullets(['<b>All tools always fit</b> — the toolbar wraps on small screens; nothing is hidden. Units sits at the toolbar’s right.',
 '<b>Undo freely</b> — multi-level and per-tab.',
 '<b>Turn on EN</b> for English piece names; hover to see the original.',
 '<b>Install it</b> (Chrome/Edge) for a dedicated window and double-click-to-open.'])

h2("12","Notes & limits")
bullets(['Guide rulers are measuring aids only — they aren’t saved into the DXF (convert one to an annotation to keep it).',
 'English translation covers common garment terms; unusual terms stay in their original characters (hover to see them).',
 'Seam-allowance check needs a piece with both a cut line and a sew line.',
 'Reads AAMA/ASTM DXF; tuned to these exports and may need adjustment for other CAD systems.'])
story.append(Spacer(1,16))
story.append(rule(LINE,CW,0.8,4,6))
p('<font color="#8a8175" size="9">Honeydew · The DXF Tool — user manual. honeydew-dxf-tool.netlify.app</font>')

def footer(canvas,doc):
    canvas.saveState()
    canvas.setFont("Helvetica",8); canvas.setFillColor(MUT)
    canvas.drawCentredString(letter[0]/2,26,f"Honeydew · The DXF Tool   —   page {doc.page}")
    canvas.restoreState()

doc=SimpleDocTemplate(OUT,pagesize=letter,leftMargin=54,rightMargin=54,topMargin=48,bottomMargin=44,
    title="Honeydew · The DXF Tool — User Manual",author="Honeydew")
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print("wrote",OUT,os.path.getsize(OUT),"bytes")
