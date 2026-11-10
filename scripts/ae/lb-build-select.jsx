// 럭키백 3번 선택(수량 입력) 화면 배경 — OAP "18_Result Bo5"의 밝은 삼각 면·텍스트 배치를 세로(2048×2732)로
// 패널·버튼은 앱(HTML)이 그리므로 여기서는 배경만 만든다. 10초 루프(2~12초 구간)로 렌더.
var STAGE = "시작";
try { (function () {
  var W = 2048, H = 2732, FPS = 30, DUR = 20;
  var CT = 1060;                       // 좌상단 밝은 면 경계 x+y=CT
  var BR = [[2088, 2341], [2088, 2772], [1288, 2772]]; // 우하단 밝은 면
  var FOOT = "F:/Download/SWC2026 Lucky Bag Draw App/Resource/ae-work/footage/";
  function comp(n) { for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name == n) return it; } return null; }
  function folder(name) { for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof FolderItem && it.name == name) return it; } return app.project.items.addFolder(name); }
  function footage(file) {
    for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof FootageItem && it.file && it.file.fsName.toLowerCase() == new File(file).fsName.toLowerCase()) return it; }
    return app.project.importFile(new ImportOptions(new File(file)));
  }
  function setPath(layer, verts) {
    var best = null, bestArea = -1;
    function walk(g) { for (var i = 1; i <= g.numProperties; i++) { var p = g.property(i); if (p.enabled === false) continue;
      if (p.matchName == "ADBE Vector Shape - Group") { var v = p.property("ADBE Vector Shape").value.vertices, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        for (var j = 0; j < v.length; j++) { x0 = Math.min(x0, v[j][0]); x1 = Math.max(x1, v[j][0]); y0 = Math.min(y0, v[j][1]); y1 = Math.max(y1, v[j][1]); }
        var ar = (x1 - x0) * (y1 - y0); if (ar > bestArea) { bestArea = ar; best = p; } }
      else if (p.numProperties !== undefined && p.propertyType != PropertyType.PROPERTY) walk(p); } }
    walk(layer.property("ADBE Root Vectors Group"));
    var s = new Shape(); s.vertices = verts; s.closed = true; best.property("ADBE Vector Shape").setValue(s);
  }
  function setKeys(prop, times, values) { while (prop.numKeys > 0) prop.removeKey(1); for (var i = 0; i < times.length; i++) prop.setValueAtTime(times[i], values[i]); }
  function setText(layer, text, o) { var p = layer.property("ADBE Text Properties").property("ADBE Text Document"), td = p.value; td.text = text;
    if (o.size) td.fontSize = o.size; if (o.font) td.font = o.font; if (o.just) td.justification = o.just; if (o.leading) { td.autoLeading = false; td.leading = o.leading; } if (o.fill) td.fillColor = o.fill; p.setValue(td); }
  app.beginUndoGroup("럭키백 선택 화면 배경");
  var old = ["LB_03_Select_render", "LB_03_Select"]; for (var o = 0; o < old.length; o++) { var oc = comp(old[o]); if (oc) oc.remove(); }
  var fld = folder("LB_LuckyBag");
  var m = app.project.items.addComp("LB_03_Select", W, H, 1, DUR, FPS); m.parentFolder = fld; m.bgColor = [0.2, 0.05, 0.5];
  var mu = comp("06_Match Up"), rb = comp("18_Result Bo5");
  function copyFrom(src, idx) {
    var seen = {}; for (var i = 1; i <= m.numLayers; i++) seen[m.layer(i).id] = true;
    src.layer(idx).copyToComp(m);
    var L = null; for (var j = 1; j <= m.numLayers; j++) if (!seen[m.layer(j).id]) { L = m.layer(j); break; }
    L.locked = false; L.shy = false; L.moveToBeginning();
    try { if (L.transform.position.dimensionsSeparated) L.transform.position.dimensionsSeparated = false; } catch (e) { }
    return L;
  }
  STAGE = "배경";
  var bg = copyFrom(mu, 28); bg.transform.position.setValue([W / 2, H / 2]); bg.transform.scale.setValue([92, 92]);
  var glow = copyFrom(mu, 27); glow.transform.position.setValue([W / 2, 1500]); glow.transform.scale.setValue([215, 215]);
  var plat = copyFrom(mu, 26); plat.transform.position.setValue([W / 2, H / 2]); plat.transform.scale.setValue([107, 253]); plat.transform.opacity.setValue(42);
  STAGE = "밝은 면";
  function ramp(L, p0, p1) { var r = L.effect.property("ADBE Ramp"); if (r) { r.property(1).setValue(p0); r.property(3).setValue(p1); } }
  var tl = copyFrom(mu, 23); tl.parent = null; tl.transform.anchorPoint.setValue([0, 0]); tl.transform.scale.setValue([100, 100]);
  setPath(tl, [[-40, -40], [CT + 40, -40], [-40, CT + 40]]); setKeys(tl.transform.position, [1.1667, 1.6667], [[-CT * 0.75, -CT * 0.75], [0, 0]]); ramp(tl, [-650, -650], [460, 460]);
  var br = copyFrom(mu, 22); br.parent = null; br.transform.anchorPoint.setValue([0, 0]); br.transform.scale.setValue([100, 100]);
  setPath(br, BR); setKeys(br.transform.position, [1.1667, 1.6667], [[700, 700], [0, 0]]); ramp(br, [2600, 3100], [1800, 2550]);
  STAGE = "엠블럼";
  var logo = copyFrom(mu, 14); logo.transform.position.setValue([150, 150]); logo.transform.scale.setValue([18.4, 18.4]);
  logo.timeRemapEnabled = true; logo.property("ADBE Time Remapping").expression = "var p=5.0666667, t=Math.max(0,time-inPoint); (t%10)*(2*p/10);";
  try { var lf = logo.effect.addProperty("ADBE Fill"); lf.property("ADBE Fill-0002").setValue([0.47451, 0.13333, 0.95686]); } catch (e) { } // 밝은 면 위라 보라색
  STAGE = "SWC 글자";
  var swc = copyFrom(rb, 12); setText(swc, "SWC2026\rWORLD FINALS", { just: ParagraphJustification.LEFT_JUSTIFY, size: 64, leading: 66 }); swc.transform.position.setValue([66, 315]);
  STAGE = "타이틀";
  var tt = copyFrom(rb, 13); setText(tt, "COM2US STORE\rLUCKY BAG DRAW", { font: "Unbounded-Bold", just: ParagraphJustification.RIGHT_JUSTIFY, size: 150, leading: 150 }); tt.transform.position.setValue([1940, 620]);
  STAGE = "스토어 로고";
  var lk = m.layers.add(footage(FOOT + "com2us-store-h-red.png")); lk.name = "COM2US STORE RED"; lk.transform.scale.setValue([22, 22]); lk.transform.position.setValue([1640, 2650]);
  // 렌더용 1536×2048
  var rc = app.project.items.addComp("LB_03_Select_render", 1536, 2048, 1, DUR, FPS); rc.parentFolder = fld;
  var rl = rc.layers.add(m); rl.transform.scale.setValue([75, 75]);
  app.endUndoGroup();
  return "완료: " + m.numLayers;
})(); } catch (e) { "실패 단계: " + STAGE + " / " + e.toString() + " line " + e.line; }
