// 럭키백 1번 메인 화면 — 시안(11-10) 반영
//  ① 우상단 OAP 블록(대각선 왼쪽 변 + 수평 아랫변의 진한 보라 판, 모서리의 밝은 띠)
//  ② 캐릭터 주변 이펙트: 키비주얼(KeyVisual_iPad_2048x2732.png)에서 두 캐릭터 주변 이펙트만 추출한 소재
//     (footage/fx/kv-fx-*-a.png = 검은 배경을 투명으로 바꾼 것). 캐릭터 뒤에 진하게, 앞에 옅게 한 겹씩 + 나비 날갯짓.
//     움직임은 10초 루프(8~18초 구간)에 이어지도록 주기를 10의 약수로만 쓴다.
// 다시 실행해도 되게 이름이 "LBFX "로 시작하는 레이어는 먼저 지운다.
var STAGE = "시작";
try { (function () {
  var FX = "F:/Download/SWC2026 Lucky Bag Draw App/Resource/ae-work/footage/fx/";
  function comp(n) { for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name == n) return it; } return null; }
  function footage(file) {
    for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof FootageItem && it.file && it.file.fsName.toLowerCase() == new File(file).fsName.toLowerCase()) return it; }
    return app.project.importFile(new ImportOptions(new File(file)));
  }
  var m = comp("LB_01_Main");
  app.beginUndoGroup("럭키백 메인 이펙트");
  STAGE = "정리";
  for (var i = m.numLayers; i >= 1; i--) { var L = m.layer(i); if (L.name.indexOf("LBFX ") == 0) { L.locked = false; L.remove(); } }
  var charTop = m.layer("CHAR Yeonhong FAN");   // 캐릭터 3개 중 맨 위
  var charYeon = m.layer("CHAR Yeonhong"), charRag = m.layer("CHAR Ragdoll");
  var matteR = m.layer("MATTE - R");
  var FADE = "linear(time,1.9,2.7,0,1)";         // 인트로 뒤에 서서히 나타남(루프 구간에서는 항상 1)

  // ── ① 우상단 OAP 블록 ──
  STAGE = "우상단 블록";
  // 보라 띠의 왼쪽 위 경계선: x/1536 + y/1530 = 1 (렌더 실측). 블록 아랫변 y=557
  // 시안 실측: 블록은 한 장의 판이고, 대각선 변에서는 밝은 청보라(156,146,249)였다가 안쪽으로 약 300px에 걸쳐
  // 진한 보라(120,64,245)로 자연스럽게 바뀐다. 따로 붙인 띠 없이 판 자체에 변과 수직인 그라데이션을 준다.
  var blk = m.layers.addSolid([0.47, 0.25, 0.96], "LBFX TOP-RIGHT BLOCK", m.width, m.height, 1, m.duration);
  var bk = blk.Masks.addProperty("ADBE Mask Atom"); var sh = new Shape(); sh.vertices = [[1536, -4], [2052, -4], [2052, 557], [977, 557]]; sh.closed = true; bk.property("ADBE Mask Shape").setValue(sh);
  // 그라데이션 방향 = 대각선 변에 수직(변 위의 점 → 블록 안쪽으로 330px)
  var brp = blk.effect.addProperty("ADBE Ramp"); brp.property(1).setValue([1256, 276]); brp.property(2).setValue([0.66, 0.64, 1]); brp.property(3).setValue([1490, 509]); brp.property(4).setValue([0.46, 0.25, 0.96]);
  blk.transform.opacity.expression = "96*linear(time,1.2,1.9,0,1)";
  blk.moveBefore(matteR); blk.startTime = 0;

  // ── 하단: 시안처럼 우상단 블록과 같은 진한 보라 단색 바 + 흰 띠 바로 왼쪽의 연보라 면 ──
  STAGE = "하단";
  var bar = m.layers.addSolid([0.43, 0.25, 0.95], "LBFX BOTTOM BAR SOLID", m.width, m.height, 1, m.duration);
  var bm = bar.Masks.addProperty("ADBE Mask Atom"); var bs = new Shape(); bs.vertices = [[-4, 2456], [2052, 2456], [2052, 2740], [-4, 2740]]; bs.closed = true; bm.property("ADBE Mask Shape").setValue(bs);
  bar.transform.opacity.expression = "94*linear(time,0.2,0.9,0,1)";
  bar.moveBefore(m.layer("BOTTOM BAR EDGE"));
  // 흰 띠의 왼쪽 아래 경계선(렌더 실측): (2048,942)→(505,2445), 기울기 dx/dy=-1.0266.
  // 그 경계 바로 왼쪽(보라 띠 안)에 폭 약 270의 연보라 면: 아래가 밝고 위로 갈수록 보라 띠 색에 녹아듦
  var facet = m.layers.addSolid([0.70, 0.58, 1], "LBFX BOTTOM-LEFT FACET", m.width, m.height, 1, m.duration);
  var fm = facet.Masks.addProperty("ADBE Mask Atom"); var fs = new Shape(); fs.vertices = [[220, 2460], [490, 2460], [1126, 1840], [856, 1840]]; fs.closed = true; fm.property("ADBE Mask Shape").setValue(fs);
  var fr = facet.effect.addProperty("ADBE Ramp"); fr.property(1).setValue([500, 2460]); fr.property(2).setValue([0.74, 0.64, 1]); fr.property(3).setValue([500, 1840]); fr.property(4).setValue([0.62, 0.36, 0.98]);
  facet.transform.opacity.expression = "ease(time,1.2,1.9,0,62)";
  facet.moveBefore(matteR);

  // ── ② 키비주얼에서 추출한 이펙트 ──
  STAGE = "이펙트";
  function fxLayer(file, name, anchor, pos, scale, rot, op, P, ph, wob) {
    var L2 = m.layers.add(footage(FX + file)); L2.name = "LBFX " + name; L2.startTime = 0;
    L2.transform.anchorPoint.setValue(anchor); L2.transform.position.setValue(pos);
    L2.transform.scale.setValue([scale, scale]); L2.transform.rotation.setValue(rot);
    L2.transform.opacity.expression = op + "*(0.74+0.26*Math.sin(2*Math.PI*time/" + P + "+" + ph + "))*" + FADE;
    L2.transform.position.expression = "value+[" + wob[0] + "*Math.sin(2*Math.PI*time/5+" + ph + ")," + wob[1] + "*Math.cos(2*Math.PI*time/10+" + ph + ")]";
    L2.transform.scale.expression = "value*(1+0.04*Math.sin(2*Math.PI*time/" + P + "+" + (ph + 1) + "))";
    L2.transform.rotation.expression = "value+1.6*Math.sin(2*Math.PI*time/10+" + ph + ")";
    return L2;
  }
  // 랙돌: 보라빛 빛줄기와 섬광(1400×1400, 섬광 중심 약 1162,868). 섬광을 기준점으로 잡아 그 점에서 숨쉬듯 커졌다 줄어듦
  var RAG = "kv-fx-ragdoll-a.png", RA = [1162, 868], RP = [880, 545];
  var rb = fxLayer(RAG, "RAG STREAKS BACK", RA, RP, 95, 0, 96, 2.5, 0.0, [10, 8]); rb.moveAfter(charRag);
  var rf = fxLayer(RAG, "RAG STREAKS FRONT", RA, RP, 95, 0, 26, 5, 1.2, [10, 8]); rf.moveBefore(charTop);
  // 연홍: 청록 바람결과 나비 무리(1752×1308)
  var YEO = "kv-fx-yeonhong-a.png", YA = [876, 654], YP = [1410, 2100];
  var yb = fxLayer(YEO, "YEON WIND BACK", YA, YP, 100, 0, 98, 5, 0.6, [16, 10]); yb.moveAfter(charYeon);
  var yf = fxLayer(YEO, "YEON WIND FRONT", YA, YP, 100, 0, 16, 2.5, 2.0, [16, 10]); yf.moveBefore(charTop);

  // 나비: 날갯짓(가로 폭이 빠르게 접혔다 펴짐) + 떠다님 (512×512)
  STAGE = "나비";
  var bfs = [["YEON BUTTERFLY A", [1040, 2080], 30, -18, 0.0], ["YEON BUTTERFLY B", [1890, 1215], 22, 22, 1.7], ["YEON BUTTERFLY C", [1540, 2440], 16, -8, 3.1]];
  for (var b = 0; b < bfs.length; b++) {
    var bi = bfs[b]; var B = m.layers.add(footage(FX + "kv-fx-butterfly-a.png")); B.name = "LBFX " + bi[0]; B.startTime = 0;
    B.transform.position.setValue(bi[1]); B.transform.rotation.setValue(bi[3]);
    B.transform.scale.expression = "s=" + bi[2] + "; f=0.3+0.7*Math.abs(Math.sin(2*Math.PI*time/0.5+" + bi[4] + ")); [s*f,s]";
    B.transform.position.expression = "value+[34*Math.sin(2*Math.PI*time/5+" + bi[4] + "),26*Math.sin(2*Math.PI*time/2.5+" + bi[4] + ")-18*Math.cos(2*Math.PI*time/10)]";
    B.transform.rotation.expression = "value+10*Math.sin(2*Math.PI*time/5+" + bi[4] + ")";
    B.transform.opacity.expression = "95*" + FADE;
    B.moveBefore(charTop);
  }
  app.endUndoGroup();
  return "완료: 레이어 " + m.numLayers;
})(); } catch (e) { "실패 단계: " + STAGE + " / " + e.toString() + " line " + e.line; }
