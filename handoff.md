# handoff — 럭키백 뽑기 앱 인수인계

## 1. 현재 상태 (2026-11-10)
- 버전 `swc-lb-v27`. 화면 1(메인)·3(수량 선택)·4(선택 오픈·결과)까지 연출 완료, 11-10 오후부터 화면별 최종 다듬기 중(1번·4번 1차 반영).
- 전환 영상은 1→3, 3→4에서만 재생(취소·지급 완료 뒤에는 바로 메인).
- 화면 흐름: 1 메인 루프 → 2 전환 → 3 수량 선택 → 4 선택 오픈(TAP TO OPEN) → 결과([지급 완료]/[다음 묶음], 관리자 "결과 확인" 끄면 탭·7초 자동) → 1.
- 테스트: 규칙·저장 32개, 브라우저 흐름 22개 통과.
- main에 커밋·푸시함(11-10). 원격 `origin` = SSuperWasabi/swc2026-world-finals-lucky-bag(비공개).
- Pages: 비공개 저장소라 아직 없음 → iPad 주소는 Cloudflare 터널 또는 공개 전환 중 결정 필요.
- 미리보기(녹화 영상): https://claude.ai/artifact/K6qMa6DudD61GNDyfJvX76

## 2. 일정
| 날짜 | 할 일 |
| --- | --- |
| 11/9 | 기능 빌드 |
| 11/10 | iPad QA, 카드 연출(레퍼런스 효과) 1차 |
| 11/11 | 최종 스탠바이 |
| 11/13 | 현장 리허설 |
| 11/14 | 행사 |

## 3. 구조와 결정
- 결과는 **구매 시작 순간 수량 전체를 한 번에** 정해 재고를 줄이고 기록한다(Jason 승인 11-09). 화면은 그 결과를 묶음별로 열어 보여 줄 뿐이라 새로 고침해도 같은 결과·같은 위치로 이어진다.
- 설정 3개(관리자 → 설정): 추첨 단위(한 개씩/한꺼번에 최대 3장), 공개 방식(한 장씩/동시에), 중복 줄이기(켜기/끄기). 기본값 한꺼번에·한 장씩·켜기. 진행 중 구매는 시작할 때 설정 그대로 끝난다.
- 저장: localStorage 키 `swc2026-world-finals-lucky-bag.state.v1` 하나에 전체 상태.
- 관리자 기록에서 구매 [취소] → 재고 복원, 기록은 "취소"로 남김. 재고 수정은 전·후를 기록.
- 백업은 JSON 파일(iPad는 공유 시트).
- `reveal.js`의 `enter / flip / show` 약속만 지키면 연출을 통째로 바꿀 수 있다. 애니메이션이 멈춰도 앱이 잠기지 않게 시간 제한이 들어 있다.

## 4. 남은 일
1. iPad 실기기 확인: 소리(럼블·휙·쾅), 영상 여러 개 동시 재생, 유리 버튼 흐림 효과, 전체 속도.
2. iPad 배포 주소: 비공개 저장소 Pages가 안 되면 Cloudflare 터널, 최종은 공개 Pages 검토.
3. 3번 수량 선택 화면 배경 루프는 움직임이 약함(OAP 원본도 배경만 루프). 금가루·빛 훑기를 얹어 둠. 필요하면 AE에서 다시 렌더.
4. 영상 규격: 1536×2048 영상은 H.264 레벨 5.1로 인코딩됨(CLAUDE.md의 "4.2 이하"와 다름). iPad Pro에서 재생 확인 필요.

## 5. 소재
- 시안: `Resource/mockups/screens-1109/`(원본), `screens-1109-m/`(폰용 경량판).
- 카드 원본: `Resource/card-design/gen/`(힉스필드 GPT Image 2.6).
- 앱 소재: `app/assets/lb/`(카드 800px, SD 700px 높이).
- 4번 화면 영상: `app/assets/main/draw-bg-loop.mp4`(OAP WF_BG 루프), `emblem-loop.mp4`(OAP WF LOGO, 흰 바탕 → 곱하기 합성). AE 컴포지션 `LB_04_BG`, `LB_04_Emblem`(`Resource/ae-work/lucky-bag-work.aep`).
- 카드 앞면: `scripts/compose-card-fronts.py`가 카드 그림 + 캐릭터 루프 영상을 합쳐 `card-front-{a,b,c}-loop.mp4`를 만든다. 캐릭터 배율·회전·위치(PLACE)는 Jason 가시안 실측값, 방패 안쪽 창은 카드 그림에서 자동으로 딴다.
- 받침대 소환진 `pedestal.webp`: Summonhenge 원화의 원판을 이미지 모델(GPT Image 2.6)로 분리·보라 보정. 원본은 `Resource/footage-src/`.
- 등급 엠블럼 `grade-A~C.png`: 월드 결선 럭키드로우 앱의 OAP 방패+알파벳 에셋.
- 뒤집기 레퍼런스: `Resource/reference/card flipping animation reference.mp4`. 회전 0.19초 · 옆면 빛기둥 0.30초 · 휙 0.07초(`reveal.js`의 T).
- 1번 메인 이펙트·우상단 블록·하단 바: `scripts/ae/lb-main-fx.jsx`(LB_01_Main에 "LBFX " 레이어를 다시 만든다). 이펙트 소재는 키비주얼 PNG에서 이미지 모델로 추출해 `Resource/ae-work/footage/fx/kv-fx-*-a.png`.
- AE 렌더는 명령줄 `aerender.exe`로(`-comp LB_01_Main_render -s 0 -e 539 -RStemplate "최고 설정" -OMtemplate "손실 없음"`). AE 화면의 렌더 대기열은 시작 직후 "사용자 중지"로 끊기는 일이 있었음. AE를 열 때 "UnMult 효과 없음" 알림 창을 닫아야 MCP 패널이 열린다.
- 카드 뒷면 `card-back.png`: 금테 + SWC 2026 엠블럼(원본 `app/assets/lb/magnific_image-generator-*.png`, 예전 은색 뒷면은 `Resource/footage-src/card-back-v1-silver.png`).
- 효과음 `reveal-sfx.mp3`: Jason이 준 "Magical Lucky Bag Reveal"(쾅 = 2.94초 지점). `reveal.js`가 빛 터지는 순간에 맞춰 재생하고 저음을 한 겹 더 얹는다. 실제 기기에서 소리 확인 필요.
- 뒤집는 중에 화면을 다시 누르면 그 카드가 바로 완료(`Reveal.finish`). 동시에 공개 모드에서는 카드를 눌러도 TAP TO OPEN과 같다.
- 카드 목록 `#slots` 안에는 `.slot`만 둔다. 광선 같은 효과 요소는 바로 앞의 `.rays-layer`에 넣는다(안에 섞이면 카드 순번이 밀려 엉뚱한 카드가 뒤집힘 — 11-10 버그). 코드에서는 `slotEls()`로만 센다.
- 카드마다 `slot._bursted`로 빛이 터졌는지 기억한다. 터진 뒤 다시 누르면 조용히 마무리만 한다.
- Service Worker: localhost에서는 최신 파일 우선(서버에 못 닿을 때만 캐시), 배포 주소는 캐시 우선. 새 버전이 구매 도중에 오면 대기 화면으로 돌아왔을 때 새로 고침한다.
- 카드 가로 배치: 3장은 사이 60px, 2장은 가운데로 모아 사이 140px(`.s-2l`, `.s-2r`).
