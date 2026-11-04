// 월드 결선: APAC 당첨 화면 v5 템플릿 사본에 월드 결선 소재를 입혀 wf_ 이름으로 저장하고 확인용 정지 화면을 뽑는다.
// 위치·크기·시간·키프레임·레이어 구조는 바꾸지 않는다. 상품 사진·상품명은 상품이 정해지면 render-prizes.jsx로 넣는다.
// JOB = { project, saveAs, out, wfBg, wfLogo, footer }
(function () {
    var MASTER = '15_WIN_PRIZE_IPAD_MASTER_V5';
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
    function setColor(prop, want, where) {
        if (prop.numKeys) throw new Error('색 키프레임: ' + where);
        var h = hex(prop.value);
        prop.setValue(rgb(want));
        log.push(where + ' ' + h + ' -> ' + want);
    }
    function effect(L, matchName) {
        var fx = L.property('ADBE Effect Parade');
        for (var i = 1; i <= fx.numProperties; i++) if (fx.property(i).matchName === matchName) return fx.property(i);
        throw new Error('효과 없음: ' + L.name + ' ' + matchName);
    }
    function fillColor(L) { return effect(L, 'ADBE Fill').property('ADBE Fill-0002'); }
    function sameLayerColor(L, expectHex, want, where) {
        var p = fillColor(L);
        if (hex(p.value) !== expectHex) throw new Error(where + ' 예상 색 ' + expectHex + '가 아님: ' + hex(p.value));
        setColor(p, want, where);
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
        var m = find(MASTER);

        // 1) 로고 3곳: ASIA LOGO 안의 심볼 영상 교체(오픈 화면과 같은 방식)
        var sym = null;
        for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof FootageItem && it.name === 'SWC2026_Symbol_ASIA.mov') { sym = it; break; } }
        if (!sym) throw new Error('APAC 심볼 영상 없음');
        var sw = sym.width, sh = sym.height;
        sym.replace(new File(JOB.wfLogo));
        if (sym.width !== sw || sym.height !== sh) throw new Error('심볼 크기 다름');
        log.push('로고: SWC2026_Symbol_ASIA.mov → ' + sym.name + ' (' + sw + 'x' + sh + ' 같음)');

        // 2) 배경: ASIA_BG_(EX) 안의 APAC 배경 영상을 같은 크기의 월드 결선 영상으로, 주황용 색 보정층은 끈다
        var ex = find('ASIA_BG_(EX)');
        var bgFoot = ex.layer('swc2026_BG_China_type_A_HF_ups2.mp4').source;
        var bw = bgFoot.width, bh = bgFoot.height;
        bgFoot.replace(new File(JOB.wfBg));
        if (bgFoot.width !== bw || bgFoot.height !== bh) throw new Error('배경 크기 다름 ' + bgFoot.width + 'x' + bgFoot.height);
        ex.layer('APAC').enabled = false;
        log.push('배경: China_type_A → ' + bgFoot.name + ' (' + bw + 'x' + bh + ' 같음), 색 보정층 APAC 끔');

        // 3) 색: 월드 결선 15_Win의 같은 레이어 값
        var tri = effect(m.layer('Royal Blue Solid 3'), 'ADBE Tritone');
        setColor(tri.property('ADBE Tritone-0001'), '#af64ff', 'WIN 삼중톤 밝은 영역');
        setColor(tri.property('ADBE Tritone-0002'), '#7922f4', 'WIN 삼중톤 중간 영역');
        setColor(tri.property('ADBE Tritone-0003'), '#3a0085', 'WIN 삼중톤 어두운 영역');
        sameLayerColor(m.layer('EDIT_02_PRIZE_NAME'), '#e25a00', '#3a0085', '상품명 칠');
        if (m.layer(6).name !== 'ASIA LOGO') throw new Error('6번 레이어가 하단 ASIA LOGO가 아님: ' + m.layer(6).name);
        sameLayerColor(m.layer(6), '#fe8c00', '#a138ff', '하단 로고 칠');
        sameLayerColor(m.layer('SWC2026 ASIA-PACIFIC CUP'), '#fe8c00', '#a138ff', '하단 대회명 칠');
        sameLayerColor(m.layer('Royal Blue Solid 2'), '#ffcb00', '#3a0085', '배경 단색 2 칠');
        sameLayerColor(m.layer('Royal Blue Solid 1'), '#fe8c00', '#7922f4', '배경 단색 1 칠');

        // 4) 하단 대회명 글자
        var tp = m.layer('SWC2026 ASIA-PACIFIC CUP').property('ADBE Text Properties').property('ADBE Text Document');
        if (tp.numKeys) throw new Error('하단 글자 키프레임');
        var td = tp.value;
        log.push('하단 문구: "' + td.text.replace(/[\r\n]+/g, ' / ') + '" -> "' + JOB.footer.replace(/[\r\n]+/g, ' / ') + '"');
        td.text = JOB.footer;
        tp.setValue(td);

        app.project.save(new File(JOB.saveAs));
        log.push('저장: ' + JOB.saveAs);

        var times = [0.3, 0.8, 1.3, 2, 4];
        for (var k = 0; k < times.length; k++) savePng(m, times[k], JOB.out + '/verify/wf-t' + times[k] + '.png');
        log.push('정지 화면 ' + times.length + '장');
        app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
        flush('ok');
    } catch (err) {
        log.push('오류: ' + err.toString() + ' (줄 ' + err.line + ')');
        flush('error');
        try { if (app.project) app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES); } catch (e3) {}
    }
    app.endSuppressDialogs(false);
})();
