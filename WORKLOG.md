# WORKLOG — 럭키백 뽑기 앱

## 2026-11-09
- 럭키드로우 앱 폴더를 복사해 시작, 새 비공개 저장소 연결, 예전 원격은 푸시 차단.
- PRD 작성(`docs/PRD-lucky-bag.md`), 타이틀·화면 시안, 힉스필드 카드 틀(GPT Image 2.6, 뒷면 확정).
- 기능 빌드 `swc-lb-v1`(브랜치 `lucky-bag-build`):
  - 뽑기 규칙 `bag-engine.js` + 테스트 10개
  - 저장·기록 `bag-store.js` + 테스트 13개
  - 화면·관리자 `index.html`, 연출 자리 `reveal.js`, 오프라인 캐시 `sw.js`
  - 브라우저 흐름 테스트 9개(새로 고침 복구, 연타, 재고 부족, 관리자, 오프라인)
- 다음: 카드 연출 레퍼런스 수준으로, iPad QA 주소.
