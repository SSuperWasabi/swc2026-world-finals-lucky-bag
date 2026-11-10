// 럭키백 메인 화면 인트로 — OAP "[pre] Match Up INTRO"(X자 와이프 + 큰 글자)를 세로로 복제하고 글자만 LUCKY BAG / DRAW로
// 실행 순서: lb-build-intro.jsx → lb-build-main.jsx (메인이 LB_Intro를 맨 위에 얹음)
var STAGE = "시작";
try { (function () {
  var W = 2048, H = 2732;
  function comp(n) { for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name == n) return it; } return null; }
  function folder(name) { for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof FolderItem && it.name == name) return it; } return app.project.items.addFolder(name); }
  app.beginUndoGroup("럭키백 인트로 만들기");
  var old = comp("LB_Intro"); if (old) old.remove();
  var src = comp("[pre] Match Up INTRO");
  STAGE = "복제";
  var ic = src.duplicate(); ic.name = "LB_Intro"; ic.parentFolder = folder("LB_LuckyBag");
  ic.width = W; ic.height = H;
  // 모든 레이어를 원래 1920×1080 중심 기준으로 세로 화면 가운데로 옮김
  STAGE = "가운데 맞춤";
  var all = []; for (var i = 1; i <= ic.numLayers; i++) all.push(ic.layer(i));
  var txtNames = { "UP": 1, "MATCH ": 1, "MATCH UP": 1, "MATCH UP 2": 1, "MATCH UP 3": 1, "MATCH UP 4": 1, "MATCH UP 5": 1 };
  var nAll = ic.layers.addNull(); nAll.name = "CENTER"; nAll.transform.anchorPoint.setValue([50, 50]); nAll.transform.position.setValue([960, 540]);
  var nTxt = ic.layers.addNull(); nTxt.name = "TEXT SCALE"; nTxt.transform.anchorPoint.setValue([50, 50]); nTxt.transform.position.setValue([960, 540]);
  for (var a = 0; a < all.length; a++) {
    var L = all[a]; L.locked = false;
    if (L.parent) continue;
    L.parent = txtNames[L.name] ? nTxt : nAll;
  }
  nTxt.parent = nAll;
  // 세로 화면을 덮도록: 배경·X 와이프는 2.6배, 글자는 그 안에서 0.6배(LUCKY BAG이 MATCH보다 길어서)
  nAll.transform.position.setValue([W / 2, H / 2]); nAll.transform.scale.setValue([253, 253]);
  nTxt.transform.scale.setValue([25, 25]);
  // 글자 바꾸기
  STAGE = "글자";
  for (var b = 1; b <= ic.numLayers; b++) {
    var T = ic.layer(b);
    if (!(T instanceof TextLayer)) continue;
    var p = T.property("ADBE Text Properties").property("ADBE Text Document"), td = p.value, t = td.text;
    var nt = t.replace(/MATCH\s*/g, "LUCKY BAG ").replace(/UP/g, "DRAW").replace(/ +\r/g, "\r").replace(/ +$/, "");
    if (nt != t) { td.text = nt; p.setValue(td); }
  }
  // 글자 크기 맞춤: 세로 폭(2048)에 LUCKY BAG이 들어가게
  STAGE = "글자 크기";
  function mulScale(L, f) { var s = L.transform.scale; if (s.numKeys == 0) { var v = s.value; s.setValue([v[0] * f, v[1] * f, 100]); } else { for (var k = 1; k <= s.numKeys; k++) { var v2 = s.keyValue(k); s.setValueAtKey(k, [v2[0] * f, v2[1] * f, 100]); } } }
  for (var d = 1; d <= ic.numLayers; d++) { var X = ic.layer(d); if (X instanceof TextLayer && X.parent && X.parent.name.indexOf("Deep Royal") == 0) mulScale(X, 0.18); }
  mulScale(ic.layer("UP"), 0.62); mulScale(ic.layer("MATCH "), 0.62);
  var m2 = ic.layer("MATCH UP 2"), mp = m2.property("ADBE Text Properties").property("ADBE Text Document"), md = mp.value;
  md.text = "LUCKY BAG\rDRAW"; md.justification = ParagraphJustification.CENTER_JUSTIFY; md.autoLeading = false; md.leading = 40; mp.setValue(md);
  mulScale(m2, 2.2435);
  app.endUndoGroup();
  return "완료: " + ic.numLayers;
})(); } catch (e) { "실패 단계: " + STAGE + " / " + e.toString() + " line " + e.line; }
