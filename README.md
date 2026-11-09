# SWC Lucky Bag — SWC2026 월드 결선 럭키백 뽑기 앱

컴투스 스토어 팝업에서 럭키백을 산 고객이 산 수량만큼 A·B·C를 뽑는 iPad 오프라인 웹앱(PWA).

- 앱: `app/` (빌드 없음, 정적 파일)
- 요구사항: `docs/PRD-lucky-bag.md`
- 인수인계: `handoff.md`, 작업 기록: `WORKLOG.md`

## 파일
| 파일 | 하는 일 |
| --- | --- |
| `app/bag-engine.js` | 뽑기 규칙(재고 비율, 중복 줄이기, 3장씩 묶기) — 순수 함수 |
| `app/bag-store.js` | 저장·기록(구매 확정, 새로 고침 복구, 취소, 재고 수정, CSV, 백업) |
| `app/reveal.js` | 카드 연출 자리 — 이 파일만 바꿔 연출을 교체 |
| `app/index.html` | 화면과 흐름, 관리자 |
| `app/sw.js` | 오프라인 캐시 |

## 로컬 실행
```bash
py -m http.server 8740
```
브라우저에서 `http://localhost:8740/app/` 을 연다.

## 테스트
```bash
node --test "tests/*.test.cjs"
```
```bash
node tests/flow-browser.cjs
```
브라우저 테스트는 설치된 Chrome과 `test-tools`의 playwright-core를 쓴다(처음 한 번 `test-tools`에서 `npm install`). 스크린샷은 `tests/out/`에 저장된다.

## 관리자
대기 화면 오른쪽 위(Com2uS Store 로고 자리)를 3초 안에 5번 누르고 PIN(기본 `0000`)을 넣는다.
