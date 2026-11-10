// 럭키백 1번 메인 대기 화면 — OAP "06_Match Up"을 세로(2048×2732)로 다시 구성
// 실행: 작업 사본(Resource/ae-work/lucky-bag-work.aep)이 열린 상태에서 AE에서 실행. 여러 번 실행해도 같은 결과(기존 LB_ 컴프를 지우고 다시 만듦).
// 구도: Jason 가시안(2026-11-09) — 좌상단 드래곤나이트(랙돌), 우하단 연홍, 가운데 대각 띠에 엠블럼·LUCKY BAG DRAW·TOUCH TO START,
//       우상단 com2us + SWC 2026 WORLD FINALS, 하단 띠에 com2us STORE.
var STAGE = "시작";
try { (function () {
  var W = 2048, H = 2732, FPS = 30, DUR = 20;
  var C1 = 1535;   // 위 대각선 x+y=C1 (좌상단 밝은 면 경계)
  var C2 = 2949;   // 아래 대각선 x+y=C2 (우하단 밝은 면 경계)
  var BAR_Y = 2450; // 하단 띠 시작
  var FOOT = "F:/Download/SWC2026 Lucky Bag Draw App/Resource/ae-work/footage/";

  function comp(n) { for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name == n) return it; } return null; }
  function footage(file) {
    for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof FootageItem && it.file && it.file.fsName.replace(/\\/g, "/").toLowerCase() == new File(file).fsName.replace(/\\/g, "/").toLowerCase()) { it.replace(new File(file)); return it; } }
    return app.project.importFile(new ImportOptions(new File(file)));
  }
  function folder(name) { for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof FolderItem && it.name == name) return it; } return app.project.items.addFolder(name); }
  // 레이어 안에서 켜져 있는 패스 중 가장 큰 것을 찾아 새 꼭짓점으로 바꾼다(OAP 모양 레이어의 그라데이션·애니메이션은 그대로)
  function setPath(layer, unused, verts) {
    var best = null, bestArea = -1;
    function walk(g) {
      for (var i = 1; i <= g.numProperties; i++) {
        var p = g.property(i);
        if (p.enabled === false) continue;
        if (p.matchName == "ADBE Vector Shape - Group") {
          var v = p.property("ADBE Vector Shape").value.vertices, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
          for (var j = 0; j < v.length; j++) { x0 = Math.min(x0, v[j][0]); x1 = Math.max(x1, v[j][0]); y0 = Math.min(y0, v[j][1]); y1 = Math.max(y1, v[j][1]); }
          var ar = (x1 - x0) * (y1 - y0); if (ar > bestArea) { bestArea = ar; best = p; }
        } else if (p.numProperties !== undefined && p.propertyType != PropertyType.PROPERTY) walk(p);
      }
    }
    walk(layer.property("ADBE Root Vectors Group"));
    var s = new Shape(); s.vertices = verts; s.closed = true; best.property("ADBE Vector Shape").setValue(s);
    return best.parentProperty; // 패스가 들어 있는 콘텐트 그룹
  }
  function setGrad(contents, p0, p1) {
    for (var i = 1; i <= contents.numProperties; i++) { var p = contents.property(i); if (p.matchName == "ADBE Vector Graphic - G-Fill") { p.property("ADBE Vector Grad Start Pt").setValue(p0); p.property("ADBE Vector Grad End Pt").setValue(p1); } }
  }
  function setKeys(prop, times, values, easeIn, easeOut) {
    while (prop.numKeys > 0) prop.removeKey(1);
    for (var i = 0; i < times.length; i++) prop.setValueAtTime(times[i], values[i]);
    if (easeIn) for (var k = 1; k <= prop.numKeys; k++) {
      var vt = prop.propertyValueType, dims = (vt == PropertyValueType.ThreeD) ? 3 : (vt == PropertyValueType.TwoD) ? 2 : 1;
      var ein = [], eout = [];
      for (var d = 0; d < dims; d++) { ein.push(new KeyframeEase(0, easeIn[k - 1])); eout.push(new KeyframeEase(0, easeOut[k - 1])); }
      try { prop.setTemporalEaseAtKey(k, ein, eout); } catch (e) { }
    }
  }
  function setText(layer, text, opts) {
    var p = layer.property("ADBE Text Properties").property("ADBE Text Document");
    var td = p.value; td.text = text;
    if (opts.size) td.fontSize = opts.size;
    if (opts.font) td.font = opts.font;
    if (opts.just) td.justification = opts.just;
    if (opts.leading) { td.autoLeading = false; td.leading = opts.leading; }
    if (opts.fill) td.fillColor = opts.fill;
    p.setValue(td);
  }

  app.beginUndoGroup("럭키백 메인 대기 화면 만들기");
  var src = comp("06_Match Up");
  var fld = folder("LB_LuckyBag");
  var old = ["LB_01_Main_render", "LB_01_Main", "LB_Char_Ragdoll", "LB_Char_Yeonhong", "LB_Char_YeonhongFan", "LB_Store_Lockup"];
  for (var o = 0; o < old.length; o++) { var oc = comp(old[o]); if (oc) oc.remove(); }

  var main = app.project.items.addComp("LB_01_Main", W, H, 1, DUR, FPS); main.parentFolder = fld; main.bgColor = [0.2, 0.05, 0.5];

  // ── 캐릭터 프리컴프 (슬라이드 인 + 루핑 숨쉬기·흔들림 + 빛 훑기) ──
  STAGE = "── 캐릭터 프리컴프 (슬라이드 인 + 루핑 숨쉬기·흔들림 + 빛 ";
  function charComp(name, file, pos, scale, slide, phase, sway, rot) {
    rot = rot || 0;
    var cc = app.project.items.addComp(name, W, H, 1, DUR, FPS); cc.parentFolder = fld;
    var it = footage(file); it.parentFolder = fld;
    var L = cc.layers.add(it);
    L.transform.scale.setValue([scale, scale]);
    var P = L.transform.position;
    setKeys(P, [1.8, 2.667], [[pos[0] + slide[0], pos[1] + slide[1]], pos], [17, 74], [25, 17]);
    // 5초 주기(10초 루프에 정확히 2번) 둥실·숨쉬기·살짝 기울기
    P.expression = "var T=5, a=2*Math.PI*(time/T+" + phase + ");\nvalue + [Math.cos(a)*6, Math.sin(a)*14];";
    L.transform.scale.expression = "var T=5, a=2*Math.PI*(time/T+" + phase + "+0.25);\nvalue*(1+0.008*Math.sin(a));";
    L.transform.rotation.expression = "var T=10, a=2*Math.PI*(time/T+" + phase + ");\n" + rot + "+" + sway + "*Math.sin(a);";
    var op = L.transform.opacity; setKeys(op, [1.8, 2.6], [0, 100], [17, 17], [17, 17]);
    // 빛 훑기: 5초마다 한 번 대각선으로 지나감
    try {
      var sw = L.effect.addProperty("CC Light Sweep");
      sw.property("Direction").setValue(-35);
      sw.property("Width").setValue(220);
      sw.property("Sweep Intensity").setValue(45);
      sw.property("Edge Intensity").setValue(0);
      sw.property("Center").expression = "var T=5, u=((time+" + phase + "*T)%T)/T;\nvar w=thisLayer.width, h=thisLayer.height;\n[ -0.4*w + u*1.8*w*1.4, h*0.45 ];";
    } catch (e) { }
    return cc;
  }
  // 키비주얼(SWC2026_H2_WF_KeyVisual.psb) 원화, 화면 크기로 미리 줄인 파일(드래곤나이트 72%, 연홍 38%)
  var rag = charComp("LB_Char_Ragdoll", FOOT + "char-kv-dragon.png", [142, 847], 100, [478 * 1.6, -464 * 1.6], 0.0, 0.6);
  var yhFile = new File(FOOT + "char-kv-muhee.png");
  var YH_POS = [1766, 2289]; // 모자 리본이 DRAW에 닿지 않게 가시안보다 살짝 아래
  // 왼쪽 부채 윤곽(원화 파일 좌표, 손가락 포함). 몸 프리컴프에서는 빼고, 부채 프리컴프에서는 이것만 남김
  var FAN = [[-60, 820], [-60, 300], [80, 40], [380, -40], [700, 20], [960, 140], [970, 330], [880, 385], [800, 463], [750, 525], [690, 592], [560, 700], [350, 860], [100, 900]];
  function fanMask(cc, subtract) {
    var L = cc.layer(1), m = L.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
    var sh = new Shape(); sh.vertices = FAN; sh.closed = true; m.property("ADBE Mask Shape").setValue(sh);
    m.maskMode = subtract ? MaskMode.SUBTRACT : MaskMode.ADD; m.property("ADBE Mask Feather").setValue([3, 3]);
  }
  var yh = null, yhFan = null;
  if (yhFile.exists) {
    yh = charComp("LB_Char_Yeonhong", FOOT + "char-kv-muhee.png", YH_POS, 100, [-520 * 1.6, 550 * 1.6], 0.5, 0.8, -10); fanMask(yh, true);
    yhFan = charComp("LB_Char_YeonhongFan", FOOT + "char-kv-muhee.png", YH_POS, 100, [-520 * 1.6, 550 * 1.6], 0.5, 0.8, -10); fanMask(yhFan, false);
  }

  // ── 배경 (아래 → 위 순서로 추가하면 위에 쌓이므로, 위쪽 레이어부터 거꾸로 추가하지 않고 add 후 moveToEnd 사용) ──
  STAGE = "── 배경 (아래 → 위 순서로 추가하면 위에 쌓이므로, 위쪽 레이";
  // copyToComp가 새 레이어를 어디에 넣을지 일정하지 않아서, id로 새 레이어를 찾아 맨 위로 올린다
  function copy(idx) {
    var seen = {}; for (var i = 1; i <= main.numLayers; i++) seen[main.layer(i).id] = true;
    src.layer(idx).copyToComp(main);
    var L = null; for (var j = 1; j <= main.numLayers; j++) if (!seen[main.layer(j).id]) { L = main.layer(j); break; }
    L.locked = false; L.shy = false; L.moveToBeginning();
    try { if (L.transform.position.dimensionsSeparated) L.transform.position.dimensionsSeparated = false; } catch (e) { }
    return L;
  }

  // 1) 배경 루프 영상
  STAGE = "1) 배경 루프 영상";
  var bg = copy(28); bg.transform.position.setValue([W / 2, H / 2]); bg.transform.scale.setValue([92, 92]);
  bg.startTime = bg.startTime; // 그대로
  // 2) 가운데 빛(다이아 마스크 솔리드)
  STAGE = "2) 가운데 빛(다이아 마스크 솔리드)";
  var glow = copy(27); glow.transform.position.setValue([W / 2 + 4, 1080]); glow.transform.scale.setValue([215, 215]);
  // 3) 전체 그라데이션 덮개
  STAGE = "3) 전체 그라데이션 덮개";
  var plat = copy(26); plat.transform.position.setValue([W / 2, H / 2]); plat.transform.scale.setValue([107, 253]); plat.transform.opacity.setValue(42); // 세로로 늘어나 배경 결이 덮이지 않게 OAP 70%보다 낮춤
  // 4) 상단 띠(우상단 보라 판) — 왼쪽은 위 대각선 밝은 면이 덮음
  STAGE = "4) 상단 띠(우상단 보라 판) — 왼쪽은 위 대각선 밝은 면이 덮";
  var top = copy(19); top.transform.rotation.setValue(0); top.transform.anchorPoint.setValue([960, 540]);
  top.transform.position.setValue([W / 2, 280]); top.transform.scale.setValue([110, 52]);
  // 5) 반짝 삼각형(빛) — 두 대각선을 따라
  STAGE = "5) 반짝 삼각형(빛) — 두 대각선을 따라";
  var shT = copy(24); shT.transform.anchorPoint.setValue([0, 0]); shT.transform.position.setValue([0, 0]); shT.transform.scale.setValue([100, 100]);
  // 위 대각선을 따라 띠 쪽에 붙는 빛줄기(OAP SHINE 그라데이션: 경계에서 밝고 띠 안쪽으로 사라짐)
  var g1 = setPath(shT, 0, [[C1, 0], [C1 + 300, 0], [0, C1 + 300], [0, C1]]);
  setGrad(g1, [C1 / 2, C1 / 2], [C1 / 2 + 150, C1 / 2 + 150]);
  shT.transform.opacity.expression = "value*0.5;";
  var shB = copy(25); shB.transform.anchorPoint.setValue([0, 0]); shB.transform.position.setValue([0, 0]); shB.transform.scale.setValue([100, 100]);
  var g2 = setPath(shB, 0, [[W, C2 - W - 300], [W, C2 - W], [C2 - BAR_Y, BAR_Y], [C2 - BAR_Y - 300, BAR_Y]]);
  setGrad(g2, [C2 / 2, C2 / 2], [C2 / 2 - 150, C2 / 2 - 150]);
  shB.transform.opacity.expression = "value*0.5;";
  shT.enabled = false; shB.enabled = false; // 띠 가장자리가 선처럼 보여서 끔(Jason 11-09)
  // 6) 밝은 면 2개 (OAP MATTE-L/R): 옆에서 미끄러져 들어옴(1.17→1.67초)
  STAGE = "6) 밝은 면 2개 (OAP MATTE-L/R): 옆에서 미끄러져 ";
  var mL = copy(23); mL.parent = null; mL.transform.anchorPoint.setValue([0, 0]); mL.transform.scale.setValue([100, 100]);
  setPath(mL, [1, 2], [[-40, -40], [C1 + 40, -40], [-40, C1 + 40]]);
  setKeys(mL.transform.position, [1.1667, 1.6667], [[-C1 * 0.75, -C1 * 0.75], [0, 0]], [33, 33], [33, 33]);
  function ramp(L, p0, p1) { var r = L.effect.property("ADBE Ramp"); if (!r) return; r.property(1).setValue(p0); r.property(3).setValue(p1); }
  ramp(mL, [-650, -650], [760, 760]);
  var mR = copy(22); mR.parent = null; mR.transform.anchorPoint.setValue([0, 0]); mR.transform.scale.setValue([100, 100]);
  setPath(mR, [1, 2], [[W + 40, C2 - W - 40], [W + 40, H + 40], [C2 - H - 40, H + 40]]);
  setKeys(mR.transform.position, [1.1667, 1.6667], [[1100, 1100], [0, 0]], [33, 33], [33, 33]);
  ramp(mR, [2450, 2900], [1350, 1650]);
  // copyToComp는 맨 위에 쌓이므로 지금 순서(위→아래)가 mR, mL, shB, shT, top, plat, glow, bg 로 이미 맞다.

  // 7) 캐릭터: 랙돌은 위 대각선 안쪽만 보이게(마스크), 연홍은 하단 띠에만 가려짐
  STAGE = "7) 캐릭터: 랙돌은 위 대각선 안쪽만 보이게(마스크), 연홍은 하";
  var rL = main.layers.add(rag); rL.name = "CHAR Ragdoll";
  var mk = rL.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  var ms = new Shape(); ms.vertices = [[-10, -10], [C1, -10], [-10, C1 + 10]]; ms.closed = true; mk.property("ADBE Mask Shape").setValue(ms);
  var yL = null; if (yh) {
    yL = main.layers.add(yh); yL.name = "CHAR Yeonhong";
    var fL = main.layers.add(yhFan); fL.name = "CHAR Yeonhong FAN";
    // 부채를 쥔 손(원화 688,538)의 화면 위치를 기준으로 85%로 줄임 → 손에서 떨어지지 않음
    var HAND = [1101, 1945]; fL.transform.anchorPoint.setValue(HAND); fL.transform.position.setValue(HAND); fL.transform.scale.setValue([85, 85]);
  }

  // 8) 엠블럼 (WF LOGO 애니메이션 루프)
  STAGE = "8) 엠블럼 (WF LOGO 애니메이션 루프)";
  var logo = copy(14); logo.transform.position.setValue([1027, 938]); logo.transform.scale.setValue([31.9, 31.9]);
  // 엠블럼 영상 반복 주기(5.0667초)를 10초 루프에 2번 딱 맞게(1.3% 빠르게) 맞춤 → 루프 이음매에서 튀지 않음
  logo.timeRemapEnabled = true;
  logo.property("ADBE Time Remapping").expression = "var p=5.0666667, t=Math.max(0,time-inPoint); (t%10)*(2*p/10);";
  // 9) LUCKY BAG / DRAW (MATCH UP 글자 스타일·튀어나오는 비율 애니메이션 그대로, 크기만 키움)
  STAGE = "9) LUCKY BAG / DRAW (MATCH UP 글자 스타일·";
  var title = copy(3);
  setText(title, "LUCKY BAG\rDRAW", { just: ParagraphJustification.CENTER_JUSTIFY, leading: 40 });
  var k = 1.42; setKeys(title.transform.scale, [1.2667, 1.9667], [[860.24 * k, 860.24 * k, 100], [330.24 * k, 330.24 * k, 100]], [17, 100], [48, 17]);
  title.transform.position.setValue([1027, 1170]);
  // 가독성: OAP 타이틀의 연보라→흰 그라데이션(색조 효과)을 거의 흰색으로, 아래에 옅은 보라 그림자
  try { title.effect("ADBE Tint").property(1).setValue([0.97, 0.95, 1]); } catch (e) { }
  function softShadow(L, op) { try { var d = L.effect.addProperty("ADBE Drop Shadow"); d.property(1).setValue([0.2, 0.05, 0.45]); d.property(2).setValue(op); d.property(4).setValue(5); d.property(5).setValue(18); } catch (e) { } }
  softShadow(title, 90);
  // 10) TOUCH TO START (PRELIMINARIES 글자 스타일·페이드 그대로 + 2초 주기 숨쉬기)
  STAGE = "10) TOUCH TO START (PRELIMINARIES 글자 ";
  var tts = copy(15);
  setText(tts, "TOUCH TO START", { size: 80, just: ParagraphJustification.CENTER_JUSTIFY });
  tts.transform.position.setValue([1027, 1600]);
  tts.transform.opacity.expression = "var base=value; time<2.6 ? base : base*(0.9+0.1*(0.5+0.5*Math.cos(2*Math.PI*(time-2.6)/2)));";
  softShadow(tts, 110);
  // 부채와 겹치므로 버튼(유리 알약)으로 만들어 맨 위에 둠
  var btn = main.layers.addShape(); btn.name = "TOUCH BUTTON";
  var bg1 = btn.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
  var br = bg1.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect"); br.property("ADBE Vector Rect Size").setValue([860, 150]); br.property("ADBE Vector Rect Roundness").setValue(75);
  var bfl = bg1.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill"); bfl.property("ADBE Vector Fill Color").setValue([1, 1, 1]); bfl.property("ADBE Vector Fill Opacity").setValue(18);
  var bst = bg1.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke"); bst.property("ADBE Vector Stroke Color").setValue([1, 1, 1]); bst.property("ADBE Vector Stroke Width").setValue(3); bst.property("ADBE Vector Stroke Opacity").setValue(70);
  btn.transform.position.setValue([1027, 1571]); btn.transform.opacity.setValue(100);
  setKeys(btn.transform.opacity, [1.9667, 2.5333], [0, 100], [17, 17], [17, 17]);
  btn.transform.scale.expression = "var s=time<2.6?100:100+1.8*(0.5+0.5*Math.cos(2*Math.PI*(time-2.6)/2)); [s,s];";
  // 유리 느낌: 버튼 아래 배경을 흐리게
  var bblur = main.layers.addSolid([1, 1, 1], "TOUCH BUTTON BLUR", 860, 150, 1, DUR); bblur.adjustmentLayer = true; bblur.transform.position.setValue([1027, 1571]);
  var bm = bblur.property("ADBE Mask Parade").addProperty("ADBE Mask Atom"), bms = new Shape();
  bms.vertices = [[75, 0], [785, 0], [860, 75], [785, 150], [75, 150], [0, 75]]; bms.closed = true; bm.property("ADBE Mask Shape").setValue(bms); bm.property("ADBE Mask Feather").setValue([16, 16]);
  try { var bbx = bblur.effect.addProperty("ADBE Box Blur2"); bbx.property(1).setValue(22); bbx.property(2).setValue(2); } catch (e) { }
  setKeys(bblur.transform.opacity, [1.9667, 2.5333], [0, 100], [17, 17], [17, 17]);

  // 11) 우상단: com2us · SWC 2026 · WORLD FINALS (OAP 배치를 1.95배로)
  STAGE = "11) 우상단: com2us · SWC 2026 · WORLD FI";
  var nul = main.layers.addNull(); nul.name = "TOP RIGHT"; nul.transform.anchorPoint.setValue([50, 50]); nul.transform.position.setValue([1855, 0]);
  var c2 = copy(1); c2.parent = nul;
  var swc = copy(17); swc.parent = nul;
  var wf = copy(18); wf.parent = nul;
  (function () { var tp = wf.property("ADBE Text Properties").property("ADBE Text Document"), td = tp.value; td.fillColor = [0.98, 0.97, 1]; tp.setValue(td); })();
  try { var stn = swc.effect.addProperty("ADBE Tint"); stn.property(1).setValue([0.98, 0.97, 1]); stn.property(2).setValue([1, 1, 1]); stn.property(3).setValue(75); } catch (e) { } // SWC 2026 로고 연보라 → 거의 흰색
  // SWC 로고 프리컴프는 15초짜리라 등장 뒤 모습에서 멈춰 끝까지 유지
  swc.timeRemapEnabled = true; swc.property("ADBE Time Remapping").expression = "Math.min(time - inPoint, 6);"; swc.outPoint = DUR;
  nul.transform.position.setValue([1950, 45]); nul.transform.scale.setValue([195, 195]);

  // 12) 하단 띠 + com2us STORE
  STAGE = "12) 하단 띠 + com2us STORE";
  var bar = main.layers.addSolid([0.46, 0.22, 0.93], "BOTTOM BAR", W, H - BAR_Y, 1, DUR);
  bar.transform.position.setValue([W / 2, BAR_Y + (H - BAR_Y) / 2]);
  setKeys(bar.transform.opacity, [2.0, 2.6], [0, 58], [17, 17], [17, 17]);
  function glassUnder(name, verts, t0, t1) {
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (var i = 0; i < verts.length; i++) { x0 = Math.min(x0, verts[i][0]); y0 = Math.min(y0, verts[i][1]); x1 = Math.max(x1, verts[i][0]); y1 = Math.max(y1, verts[i][1]); }
    var a = main.layers.addSolid([1, 1, 1], name, Math.round(x1 - x0), Math.round(y1 - y0), 1, DUR); a.adjustmentLayer = true;
    a.transform.position.setValue([(x0 + x1) / 2, (y0 + y1) / 2]);
    try { var bx = a.effect.addProperty("ADBE Box Blur2"); bx.property(1).setValue(36); bx.property(2).setValue(2); } catch (e) { }
    setKeys(a.transform.opacity, [t0, t1], [0, 100], [17, 17], [17, 17]);
    return a;
  }
  function edgeLine(name, verts, t0, t1) {
    var e = main.layers.addSolid([1, 1, 1], name, W, H, 1, DUR);
    var m = e.property("ADBE Mask Parade").addProperty("ADBE Mask Atom"), sh = new Shape(); sh.vertices = verts; sh.closed = true; m.property("ADBE Mask Shape").setValue(sh);
    setKeys(e.transform.opacity, [t0, t1], [0, 55], [17, 17], [17, 17]);
    return e;
  }
  function sheen(name, y0, y1, maskVerts, t0, t1) {
    var s2 = main.layers.addSolid([1, 1, 1], name, W, H, 1, DUR); s2.blendingMode = BlendingMode.SCREEN;
    var m = s2.property("ADBE Mask Parade").addProperty("ADBE Mask Atom"), sh = new Shape(); sh.vertices = maskVerts; sh.closed = true; m.property("ADBE Mask Shape").setValue(sh);
    try { var rp = s2.effect.addProperty("ADBE Ramp"); rp.property(1).setValue([W / 2, y0]); rp.property(2).setValue([1, 1, 1]); rp.property(3).setValue([W / 2, y1]); rp.property(4).setValue([0, 0, 0]); } catch (e) { }
    setKeys(s2.transform.opacity, [t0, t1], [0, 22], [17, 17], [17, 17]);
    return s2;
  }
  var barRect = [[0, BAR_Y], [W, BAR_Y], [W, H], [0, H]];
  var barBlur = glassUnder("BOTTOM BAR BLUR", barRect, 2.0, 2.6);
  var barSheen = sheen("BOTTOM BAR SHEEN", BAR_Y, H, barRect, 2.0, 2.6);
  var barLine = edgeLine("BOTTOM BAR EDGE", [[0, BAR_Y], [W, BAR_Y], [W, BAR_Y + 3], [0, BAR_Y + 3]], 2.0, 2.6);
  // 우상단 보라 판: Jason 레퍼런스(06_Match Up 화면)처럼 뚜렷한 보라 판으로 — 조금 진한 보라, 90% 불투명(뒤 결이 은은히 비침),
  // 아래 가장자리에 얇은 빛 선 + 부드러운 그림자로 띠 경계가 보이게
  var TOPB = 561;
  // OAP 원본은 180° 돌아간 채 마스크(빼기)로 왼쪽을 지우는 구조라, 똑바로 세우면서 마스크를 '더하기'로 바꿔야 판이 보인다
  top.mask(1).maskMode = MaskMode.ADD;
  top.transform.opacity.expression = "value*0.88;"; // 레퍼런스처럼 뒤 결이 은은하게 비치게
  var tShadow = main.layers.addSolid([0, 0, 0], "TOP BAND SHADOW", W, 70, 1, DUR); tShadow.transform.position.setValue([W / 2, TOPB + 35]);
  try { var tr = tShadow.effect.addProperty("ADBE Ramp"); tr.property(1).setValue([W / 2, 0]); tr.property(2).setValue([0, 0, 0]); tr.property(3).setValue([W / 2, 70]); tr.property(4).setValue([1, 1, 1]); tShadow.blendingMode = BlendingMode.MULTIPLY; } catch (e) { }
  var tsm = tShadow.property("ADBE Mask Parade").addProperty("ADBE Mask Atom"), tss = new Shape(); tss.vertices = [[C1 - TOPB, 0], [W, 0], [W, 70], [C1 - TOPB - 70, 70]]; tss.closed = true; tsm.property("ADBE Mask Shape").setValue(tss);
  setKeys(tShadow.transform.opacity, [2.0, 2.3], [0, 35], [17, 17], [17, 17]);
  var tLine = edgeLine("TOP BAND EDGE", [[C1 - TOPB, TOPB - 3], [W, TOPB - 3], [W, TOPB], [C1 - TOPB + 3, TOPB]], 2.0, 2.3);
  tLine.transform.opacity.expression = "value*0.7;";
  // com2us STORE: 공식 로고 SVG(app/assets/com2us-store-lockup-white.svg) 글자로 만든 가로형 PNG
  var lkItem = footage(FOOT + "com2us-store-h.png"); lkItem.parentFolder = fld;
  var lk = main.layers.add(lkItem); lk.name = "COM2US STORE";
  lk.transform.scale.setValue([24.1, 24.1]); lk.transform.position.setValue([1655, 2590]);
  setKeys(lk.transform.opacity, [2.2, 2.8], [0, 100], [17, 17], [17, 17]);

  // 최종 쌓임 순서(위→아래): 하단 띠·로고 > 연홍 > 우상단 > 글자 > 엠블럼 > 랙돌 > 밝은 면 …
  lk.moveToBeginning(); bar.moveAfter(lk);
  // 13) OAP 인트로(X자 와이프 + 큰 글자) — 06_Match Up과 같이 0~1.57초
  STAGE = "13) 인트로";
  // 렌더용 1536×2048(75%) 컴프
  var rc = app.project.items.addComp("LB_01_Main_render", 1536, 2048, 1, DUR, FPS); rc.parentFolder = fld;
  var rl = rc.layers.add(main); rl.transform.scale.setValue([75, 75]);
  var ic = comp("LB_Intro"); if (ic) { var il = main.layers.add(ic); il.name = "INTRO"; il.outPoint = 1.5667; il.moveToBeginning(); }
  if (yL) yL.moveBefore(rL); // 글자보다 아래, 밝은 면보다 위
  var fanL = main.layer("CHAR Yeonhong FAN"); if (fanL) fanL.moveBefore(yL);
  // 하단 유리: 흐림 → 띠 → 광택 → 테두리 → 로고 (캐릭터 위)
  barBlur.moveBefore(fanL || yL || rL); bar.moveBefore(barBlur); barSheen.moveBefore(bar); barLine.moveBefore(barSheen); lk.moveBefore(barLine);
  // 버튼: 흐림 → 알약 → 글자, 맨 위(인트로 아래)
  bblur.moveToBeginning(); btn.moveBefore(bblur); tts.moveBefore(btn);
  // 상단 띠: 그림자는 띠 바로 아래, 빛 선은 띠 바로 위(밝은 면보다는 아래)
  tShadow.moveAfter(top); tLine.moveBefore(top);
  top.enabled = false; tShadow.enabled = false; tLine.enabled = false; // 시안 4의 우상단 보라 판은 Jason 요청으로 되돌림(11-10)
  var introL = main.layer("INTRO"); if (introL) introL.moveToBeginning();
  app.endUndoGroup();
  return "완료: " + main.numLayers + "개 레이어";
})(); } catch (e) { "실패 단계: " + STAGE + " / " + e.toString() + " line " + e.line; }
