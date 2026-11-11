# CLAUDE.md — 매 세션 자동으로 읽는 안내판

SWC2026 월드 결선(2026-11-14) 컴투스 스토어 팝업 **럭키백 A/B/C 뽑기 앱**. 기존 럭키드로우 앱 저장소를 복사해 시작했지만 화면·규칙은 새로 썼다. 세부 내용은 `handoff.md`, 제품 요구는 `docs/PRD-lucky-bag.md`.

## 시작할 때
- `handoff.md` 현재 상태와 `WORKLOG.md` 최근 항목을 먼저 읽는다.

## 꼭 지킬 규칙
- **사용자에게 보이는 모든 글은 한글:** 안내, 주석, 로그, 테스트 메시지, 커밋, 문서, 보고. 고객 화면 문구만 영어(PRD 2절). 코드 식별자와 경로는 예외.
- **앱을 고치면 끝까지 마무리한다:**
  1. `app/index.html`의 `APP_VER`(`swc-lb-vN`)와 `app/sw.js`의 `CACHE`(`swc2026-world-finals-lucky-bag-vN`)를 함께 올린다.
  2. 앱 폴더의 파일(코드·영상·그림)을 하나라도 바꿨으면 `node tools/update-sw-manifest.cjs`로 `sw.js` 목록의 지문을 다시 채운다. 기기는 지문이 같은 파일을 "안 바뀐 파일"로 보고 다시 받지 않으므로, 빠뜨리면 옛 파일이 계속 쓰인다(테스트가 잡아 준다). 새 파일을 추가했으면 `sw.js`의 `ASSETS`에 줄을 먼저 넣는다.
  3. 전체 테스트를 돌린다: `node --test "tests/*.test.cjs"`, `node tests/flow-browser.cjs`, `node tests/sw-update.cjs`.
  4. Jason과 로컬 서버(Chrome, 필요하면 iPad)로 확인하고 승인받기 전에는 커밋·푸시하지 않는다.
  5. 승인 뒤 `origin`(SSuperWasabi/swc2026-world-finals-lucky-bag)에 푸시한다. `luckydraw`·`apac` 원격으로는 절대 푸시하지 않는다(푸시 주소를 막아 둠).
  6. handoff 현재 상태와 WORKLOG를 기록하고 한글로 보고한다.
- **이름 분리:** 같은 `ssuperwasabi.github.io`를 쓰는 럭키드로우 앱과 섞이지 않게 저장 키 `swc2026-world-finals-lucky-bag.*`, 캐시 접두사 `swc2026-world-finals-lucky-bag-`, PWA id `./swc2026-world-finals-lucky-bag`를 유지한다.
- **수정 금지:** 원본 럭키드로우 저장소와 폴더, AE 원본(`Resource/ae-original/`, 작업은 사본에서).
- **현장 조건:** iPad Pro 12.9형 세로(2048×2732), 오프라인, 부하가 낮은 방식. 영상은 H.264 레벨 4.2 이하.
- **운영 데이터:** 재고·기록은 iPad 안(localStorage)에만 있다. 위험한 변경 전에는 관리자 → 백업 내보내기를 권한다.
