// 월드 결선: APAC 선택 화면 v8 템플릿 사본에 월드 결선 소재를 입혀 wf_ 이름으로 저장하고 확인용 정지 화면을 뽑는다.
// 위치·크기·시간·키프레임·레이어 구조는 바꾸지 않는다. 바꾸는 것은 배경 영상, 카드 바탕 이미지, 색 값, 부제 글자뿐이다.
// JOB = { project, saveAs, wfBg, cardBg, subtitle, out }
(function () {
    var ROOT = '21-1_CHOOSE_YOUR_SCROLL_INTRO_THEN_LOOP_V8';
    // APAC 색 → 월드 결선 색(월드 결선 OAP에 있는 값만 씀)
    var MAP = {
        '#fffff0': '#ffffff', // 제목·카드 글자 아이보리
        '#ffab0a': '#7922f4', // 카드 유리 판
        '#fff09c': '#dfd2ff', // 카드·버튼 테두리
        '#fff0a1': '#dfd2ff', // 카드 아래 밝은 줄
        '#632e00': '#3a0085', // SELECT 글자·방패·화살표
        '#ffffe5': '#ffffff', // 버튼 윗 반짝임
        '#ffcc1a': '#af64ff', // 버튼 면
        '#fffaab': '#dfd2ff', // 버튼 면 그라디언트 시작
        '#ffa606': '#af64ff', // 버튼 면 그라디언트 끝
        '#964d00': '#5d09a0', // 버튼 아래 턱
        '#946e3d': '#af64ff'  // 상단 어둡게 하는 층(곱하기)
    };
    var log = [];
    function write(name, text) { var f = new File(JOB.out + '/' + name); f.encoding = 'UTF-8'; f.open('w'); f.write(text); f.close(); }
    function flush(state) { write('status.txt', state + '\n' + log.join('\n')); }
    function hex(v) { var s = '#'; for (var i = 0; i < 3; i++) { var h = Math.round(v[i] * 255).toString(16); s += (h.length < 2 ? '0' : '') + h; } return s; }
    function rgb(h) { return [parseInt(h.substr(1, 2), 16) / 255, parseInt(h.substr(3, 2), 16) / 255, parseInt(h.substr(5, 2), 16) / 255]; }
    function find(name) {
        for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof CompItem && it.name === name) return it; }
        throw new Error('컴프 없음: ' + name);
    }
    function savePng(comp, t, file) {
        var f = new File(file);
        if (f.exists) f.remove();
        comp.saveFrameToPng(t, f);
        var last = -1, stable = 0;
        for (var i = 0; i < 900; i++) {
            $.sleep(100);
            f = new File(file);
            if (f.exists && f.length > 0) { if (f.length === last) { if (++stable >= 3) return f.length; } else { stable = 0; last = f.length; } }
        }
        throw new Error('PNG가 써지지 않음: ' + file);
    }
    var changed = 0;
    function recolor(group, where) {
        for (var i = 1; i <= group.numProperties; i++) {
            var p = group.property(i);
            if (p.matchName === 'ADBE Layer Styles') continue;
            if (p.propertyType === PropertyType.PROPERTY) {
                if (p.propertyValueType !== PropertyValueType.COLOR) continue;
                if (p.numKeys > 0) throw new Error('키프레임이 있는 색: ' + where + ' ' + p.name);
                var h = hex(p.value);
                if (MAP[h]) { p.setValue(rgb(MAP[h])); changed++; log.push(where + ' ' + p.parentProperty.name + '/' + p.name + ' ' + h + ' -> ' + MAP[h]); }
            } else {
                recolor(p, where);
            }
        }
    }
    function recolorText(layer, where) {
        var prop = layer.property('ADBE Text Properties').property('ADBE Text Document');
        if (prop.numKeys > 0) throw new Error('키프레임이 있는 글자: ' + where);
        var d = prop.value, h;
        if (d.applyFill) { h = hex(d.fillColor); if (MAP[h]) { d.fillColor = rgb(MAP[h]); prop.setValue(d); changed++; log.push(where + ' 글자 칠 ' + h + ' -> ' + MAP[h]); } }
    }
    function recolorComp(comp) {
        for (var i = 1; i <= comp.numLayers; i++) {
            var L = comp.layer(i), where = comp.name + ' > ' + L.name;
            if (L instanceof TextLayer) recolorText(L, where);
            recolor(L, where);
        }
    }

    app.beginSuppressDialogs();
    try {
        new Folder(JOB.out).create();
        new Folder(JOB.out + '/verify').create();
        flush('running');
        if (app.project && (app.project.file || app.project.numItems > 0)) {
            // 사용자가 연 프로젝트(저장 안 된 변환본 포함)는 절대 닫지 않는다. Claude가 연 작업 사본(ae-work 안, 저장된 파일)만 저장 없이 닫는다.
            if (!app.project.file || app.project.file.fsName.indexOf('ae-work') < 0) throw new Error('다른 프로젝트가 열려 있어 중단: ' + (app.project.file ? app.project.file.fsName : '저장 안 된 프로젝트'));
            app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
        }
        app.open(new File(JOB.project));
        var root = find(ROOT);

        // 1) 배경: ASIA_BG_(WAVE) 안의 APAC BG B(2880², 6초)를 같은 크기·길이의 WF BG B로 바꾼다.
        var wave = find('ASIA_BG_(WAVE)');
        var apacBgLayer = wave.layer('APAC BG B');
        var wfFoot = app.project.importFile(new ImportOptions(new File(JOB.wfBg)));
        var wfComp = app.project.items.addComp('WF BG B', 2880, 2880, 1, 6, 30);
        var fl = wfComp.layers.add(wfFoot);
        fl.startTime = 0;
        var sc = 2880 / wfFoot.width * 100;
        fl.property('ADBE Transform Group').property('ADBE Scale').setValue([sc, sc]);
        fl.property('ADBE Transform Group').property('ADBE Position').setValue([1440, 1440]);
        apacBgLayer.replaceSource(wfComp, false);
        log.push('배경: ASIA_BG_(WAVE) > APAC BG B 레이어 원본을 WF BG B(' + wfFoot.name + ' ' + wfFoot.width + '², 배율 ' + sc + '%)로 교체');

        // 2) 카드 바탕: 카드 12장이 함께 쓰는 SWC BG_yellow_1.jpg(선택 화면 폴더 것만)를 같은 크기의 보라 이미지로 교체
        var cardFoot = null;
        for (var i = 1; i <= app.project.numItems; i++) {
            var it = app.project.item(i);
            if (it instanceof FootageItem && it.name === 'SWC BG_yellow_1.jpg' && it.parentFolder.name.indexOf('CHOOSE YOUR SCROLL') === 0) { cardFoot = it; break; }
        }
        if (!cardFoot) throw new Error('카드 바탕 소재를 찾지 못함');
        var w0 = cardFoot.width, h0 = cardFoot.height;
        cardFoot.replace(new File(JOB.cardBg));
        if (cardFoot.width !== w0 || cardFoot.height !== h0) throw new Error('카드 바탕 크기가 다름: ' + cardFoot.width + 'x' + cardFoot.height);
        log.push('카드 바탕: SWC BG_yellow_1.jpg -> ' + cardFoot.name + ' (' + w0 + 'x' + h0 + ' 같음)');

        // 3) 색: 루트, 카드 12장, SELECT 버튼
        recolorComp(root);
        for (var n = 1; n <= 12; n++) recolorComp(find('SCROLL_CARD_' + (n < 10 ? '0' : '') + n));
        recolorComp(find('SELECT_YOUR_SCROLL_BUTTON_V8_CENTER'));
        log.push('색 교체 ' + changed + '곳');

        // 4) 부제 글자
        var sub = root.layer('SUBTITLE - SWC2026 APAC LUCKY DRAW');
        var sp = sub.property('ADBE Text Properties').property('ADBE Text Document');
        var sd = sp.value;
        log.push('부제: "' + sd.text + '" -> "' + JOB.subtitle + '"');
        sd.text = JOB.subtitle;
        sp.setValue(sd);

        app.project.save(new File(JOB.saveAs));
        log.push('저장: ' + JOB.saveAs);

        // 5) 확인용 정지 화면. 앱에는 RANDOM이 없으므로(v21) 이 화면에서만 끄고, 저장은 하지 않는다.
        root.layer('RANDOM - raised yellow button').enabled = false;
        savePng(root, 3, JOB.out + '/verify/full-t3.png');
        savePng(root, 0.6, JOB.out + '/verify/full-t0.6.png');
        savePng(find('SCROLL_CARD_01'), 3, JOB.out + '/verify/card-01.png');
        savePng(find('SELECT_YOUR_SCROLL_BUTTON_V8_CENTER'), 3, JOB.out + '/verify/select.png');
        log.push('정지 화면 저장');

        app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
        flush('ok');
    } catch (err) {
        log.push('오류: ' + err.toString() + ' (줄 ' + err.line + ')');
        flush('error');
    }
    app.endSuppressDialogs(false);
})();
