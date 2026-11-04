// 월드 결선: APAC 오픈 화면 v3 템플릿 사본에 앱 최종 상태(v10 64px 올림, v22 SLIDE 띠 B안)를 재현하고 월드 결선 소재를 입힌다.
// JOB = { project, out, mode: 'apac-check' | 'wf', saveAs, wfBg, wfLogo }
//   apac-check: 재현만 하고 APAC 색 그대로 t=1초 화면을 뽑는다(앱 영상과 비교용). 저장하지 않는다.
//   wf: 재현 + 로고 영상·배경 영상·색 교체 후 wf_로 저장하고, 확인 화면과 152장 알파 TIFF를 렌더한다.
// 위치·크기 변경은 APAC 앱이 이미 쓰는 값(docs/oap-spec/open-v3 v10·v22)만 재현한다. 시간·키프레임은 건드리지 않는다.
(function () {
    var FRAME = '04_Caster_Cam2_OPEN_SCROLL_IPAD_FRAME_V3';
    var BAR_B = { box: '#3b1766', text: '#ffe58d', height: 180, fontSize: 72 }; // v22 B안
    var MAP = { // APAC 색 → 월드 결선 색(월드 결선 OAP 캐스터 화면 값)
        '#fffce8': '#ffffff', // 제목 패널
        '#6e3805': '#3a0085', // OPEN YOUR SCROLL
        '#bf6304': '#a138ff', // GOOD LUCK
        '#fe8c00': '#a138ff', // 로고 칠
        '#ffff36': '#af64ff', // 배경 MILKY → MILKY 2
        '#ffffb0': '#dfd2ff', // 배경 PURPLE·WHITE 01 → PURPLE 2·WHITE 04
        '#ffc300': '#7922f4', // 배경 PLATTEN → PLATTEN 2
        '#3b1766': '#3a0085', // SLIDE 띠(B안) → 월드 결선 이름표 띠
        '#ffe58d': '#f4f4f4', // SLIDE 글자(B안 골드) → 월드 결선 이름표 글자
        '#fffad6': '#ffffff'  // SLIDE 방패(아이보리) → 흰색
    };
    var log = [];
    function write(name, text) { var f = new File(JOB.out + '/' + name); f.encoding = 'UTF-8'; f.open('w'); f.write(text); f.close(); }
    function flush(state) { write('status-' + JOB.mode + '.txt', state + '\n' + log.join('\n')); }
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
    function pos(L) { return L.property('ADBE Transform Group').property('ADBE Position'); }
    function setPos(L, x, y) { var p = pos(L); if (p.numKeys) throw new Error('위치 키프레임: ' + L.name); var v = p.value; v[0] = x; v[1] = y; p.setValue(v); }
    function findRect(group) {
        for (var i = 1; i <= group.numProperties; i++) {
            var p = group.property(i);
            if (p.matchName === 'ADBE Vector Shape - Rect') return p.property('ADBE Vector Rect Size');
            if (p.propertyType !== PropertyType.PROPERTY) { var r = findRect(p); if (r) return r; }
        }
        return null;
    }
    function rectSize(L) {
        var r = findRect(L.property('ADBE Root Vectors Group'));
        if (!r) throw new Error('사각형 없음: ' + L.name);
        if (r.numKeys) throw new Error('사각형 크기 키프레임: ' + L.name);
        return r;
    }
    function colorProps(group, out) {
        for (var i = 1; i <= group.numProperties; i++) {
            var p = group.property(i);
            if (p.matchName === 'ADBE Layer Styles') continue;
            if (p.propertyType === PropertyType.PROPERTY) { if (p.propertyValueType === PropertyValueType.COLOR) out.push(p); }
            else colorProps(p, out);
        }
        return out;
    }
    var changed = 0;
    function recolorComp(comp, map) {
        for (var i = 1; i <= comp.numLayers; i++) {
            var L = comp.layer(i), where = comp.name + ' > ' + L.name, ps = colorProps(L, []), k, h;
            for (k = 0; k < ps.length; k++) {
                h = hex(ps[k].value);
                if (map[h]) { if (ps[k].numKeys) throw new Error('색 키프레임: ' + where); ps[k].setValue(rgb(map[h])); changed++; log.push(where + ' ' + ps[k].parentProperty.name + '/' + ps[k].name + ' ' + h + ' -> ' + map[h]); }
            }
            if (L instanceof TextLayer) {
                var tp = L.property('ADBE Text Properties').property('ADBE Text Document'), d = tp.value;
                if (tp.numKeys) throw new Error('글자 키프레임: ' + where);
                h = hex(d.fillColor);
                if (d.applyFill && map[h]) { d.fillColor = rgb(map[h]); tp.setValue(d); changed++; log.push(where + ' 글자 칠 ' + h + ' -> ' + map[h]); }
            }
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
        var frame = find(FRAME);
        var strip = frame.layer('Caster name strip - instruction');
        var text = frame.layer('INSTRUCTION - SLIDE TO OPEN THE SCROLL');
        var shield = frame.layer('Official shield - instruction');
        var slot = frame.layer('SCROLL VIDEO INSERT - 1768 square');

        // 1) v10: 영상 칸·SLIDE 띠를 64 위로
        var names = [slot, strip, text, shield];
        for (var n = 0; n < names.length; n++) { var v = pos(names[n]).value; setPos(names[n], v[0], v[1] - 64); }
        log.push('v10 재현: 영상 칸·띠·글자·방패 y −64');

        // 2) v22 B안: 띠 윗변 고정, 높이 120→180, 글자 58→72, 방패 같은 비율, 방패+글자 묶음을 띠 가운데로
        var rs = rectSize(strip), h0 = rs.value[1], cy0 = pos(strip).value[1];
        var top = cy0 - h0 / 2, cy = top + BAR_B.height / 2;
        rs.setValue([rs.value[0], BAR_B.height]);
        setPos(strip, pos(strip).value[0], cy);
        var tdp = text.property('ADBE Text Properties').property('ADBE Text Document'), td = tdp.value;
        var k = BAR_B.fontSize / td.fontSize;
        var r0 = text.sourceRectAtTime(0, false), tx0 = pos(text).value[0], ty0 = pos(text).value[1];
        var sc = shield.property('ADBE Transform Group').property('ADBE Scale'), sv = sc.value;
        var shW0 = shield.source.width * sv[0] / 100, shX0 = pos(shield).value[0], shY0 = pos(shield).value[1];
        var gap0 = (tx0 + r0.left) - (shX0 + shW0 / 2);
        var baseOff0 = ty0 - shY0; // 띠 가운데(=방패 가운데) 기준 글자 기준선 거리
        td.fontSize = BAR_B.fontSize; tdp.setValue(td);
        sc.setValue([sv[0] * k, sv[1] * k, sv[2]]);
        // 방패·글자 사이 간격은 B안에서도 원래 값 그대로다(APAC B안 렌더 실측 29px)
        var r1 = text.sourceRectAtTime(0, false), shW = shW0 * k, gap = gap0;
        var groupW = shW + gap + r1.width, left = 1024 - groupW / 2;
        // APAC B안 렌더 실측(방패 x 340~419, 글자 시작 x 448)에 맞춘 미세 보정
        var dxShield = JOB.dxShield || 0, dxText = JOB.dxText || 0;
        setPos(shield, left + shW / 2 + dxShield, cy);
        setPos(text, left + shW + gap - r1.left + dxText, cy + baseOff0 * k);
        log.push('v22 재현: 띠 윗변 ' + top + ' 높이 ' + h0 + '→' + BAR_B.height + ', 글자 ' + Math.round(BAR_B.fontSize / k) + '→' + BAR_B.fontSize + ', 배율 ×' + Math.round(k * 10000) / 10000
            + ', 방패 (' + Math.round((left + shW / 2) * 100) / 100 + ',' + cy + '), 글자 기준선 ' + Math.round((cy + baseOff0 * k) * 100) / 100 + ', 묶음 폭 ' + Math.round(groupW));
        // B안 색: 띠 딥 퍼플, 글자 골드. 방패는 원래 아이보리(#fffad6) 그대로(APAC B안 렌더 실측)
        var bp = colorProps(strip, []);
        for (var b = 0; b < bp.length; b++) if (hex(bp[b].value) === '#5c3018') bp[b].setValue(rgb(BAR_B.box));
        td = tdp.value; td.fillColor = rgb(BAR_B.text); tdp.setValue(td);
        log.push('v22 B안 색: 띠 ' + BAR_B.box + ', 글자 ' + BAR_B.text + ', 방패 #fffad6 유지');

        if (JOB.mode === 'apac-check') {
            savePng(frame, 1, JOB.out + '/verify/apac-repro-t1.png');
            app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
            flush('ok');
            app.endSuppressDialogs(false);
            return;
        }

        // 3) 로고: ASIA LOGO 컴프 안의 심볼 영상을 월드 결선 심볼 영상으로(같은 1920², loopOut 구조 유지)
        var sym = null;
        for (var i = 1; i <= app.project.numItems; i++) { var it = app.project.item(i); if (it instanceof FootageItem && it.name === 'SWC2026_Symbol_ASIA.mov') { sym = it; break; } }
        if (!sym) throw new Error('APAC 심볼 영상 없음');
        var sw = sym.width, sh = sym.height, sd = sym.duration;
        sym.replace(new File(JOB.wfLogo));
        if (sym.width !== sw || sym.height !== sh) throw new Error('심볼 크기 다름 ' + sym.width + 'x' + sym.height);
        log.push('로고: SWC2026_Symbol_ASIA.mov(' + sd + '초) → ' + sym.name + '(' + sym.duration + '초), ' + sw + 'x' + sh + ' 같음');

        // 4) 배경 영상: ASIA_BG_(WAVE) 안 APAC BG B → 같은 크기·길이의 WF BG B
        var wave = find('ASIA_BG_(WAVE)');
        var wfFoot = app.project.importFile(new ImportOptions(new File(JOB.wfBg)));
        var wfComp = app.project.items.addComp('WF BG B', 2880, 2880, 1, 6, 30);
        var fl = wfComp.layers.add(wfFoot);
        fl.startTime = 0;
        var bsc = 2880 / wfFoot.width * 100;
        fl.property('ADBE Transform Group').property('ADBE Scale').setValue([bsc, bsc]);
        fl.property('ADBE Transform Group').property('ADBE Position').setValue([1440, 1440]);
        wave.layer('APAC BG B').replaceSource(wfComp, false);
        log.push('배경: ASIA_BG_(WAVE) > APAC BG B → WF BG B(' + wfFoot.name + ', 배율 ' + bsc + '%)');

        // 5) 색: 프레임, 배경 도형, 엠블럼
        recolorComp(frame, MAP);
        recolorComp(find('04_CASTER_ORIGINAL_GEOMETRIC_BACKGROUND'), MAP);
        recolorComp(find('04_CASTER_EMBLEM_ORIGINAL_UNMODIFIED_V2'), MAP);
        log.push('색 교체 ' + changed + '곳');

        app.project.save(new File(JOB.saveAs));
        log.push('저장: ' + JOB.saveAs);

        savePng(frame, 1, JOB.out + '/verify/wf-t1.png');
        savePng(frame, 4, JOB.out + '/verify/wf-t4.png');

        // 6) 152장 알파 TIFF(앱 프레임 반복 영상용)
        new Folder(JOB.out + '/seq').create();
        var rq = app.project.renderQueue;
        for (var q = 1; q <= rq.numItems; q++) if (rq.item(q).status === RQItemStatus.QUEUED) rq.item(q).render = false;
        var item = rq.items.add(frame);
        item.timeSpanStart = 0;
        item.timeSpanDuration = 152 / 30;
        var om = item.outputModule(1), tpl = null, tn = om.templates;
        for (var t = 0; t < tn.length; t++) if (/TIFF/i.test(tn[t])) { tpl = tn[t]; break; }
        if (!tpl) throw new Error('TIFF 출력 템플릿 없음');
        om.applyTemplate(tpl);
        om.file = new File(JOB.out + '/seq/f_[#####].tif');
        var t0 = new Date().getTime();
        rq.render();
        log.push('렌더 ' + (new Date().getTime() - t0) / 1000 + '초, 상태 ' + item.status);

        app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
        flush('ok');
    } catch (err) {
        log.push('오류: ' + err.toString() + ' (줄 ' + err.line + ')');
        flush('error');
        try { if (app.project) app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES); } catch (e3) {}
    }
    app.endSuppressDialogs(false);
})();
