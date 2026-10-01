# 음식 이상형 월드컵 v12

마지막 확정 OG 디자인을 적용한 개인별 동적 PNG 미리보기 버전입니다.

- 우승 음식명
- BEST MENU TOP 3
- 오늘 추천 메뉴 3개

만 OG 이미지에 크게 표시합니다.

자세한 배포 방법은 `DEPLOY_DYNAMIC_PNG_OG.md`를 확인하세요.


## v14 share fix
- URL-only result sharing for Kakao OG scraping
- Approved root OG image installed
- Homepage OG URLs made absolute by Worker
- Root OG image cache-busted with `?v=14`
- Dynamic OG image fallback added


## v15 Kakao share fix
- Result sharing now copies ONLY the personal result URL
- New root OG filename: `/og-home-v15.jpg`
- New dynamic result OG path: `/og-v15/{token}.png`
- Dynamic OG rendering falls back to a valid PNG template instead of returning an error


## v16
- Removed the Worker homepage interception that caused `/` ↔ `/index.html` redirect loops.
- Homepage now comes directly from Static Assets.
- Root OG URLs are hardcoded to `https://foodolympic.kyoon.app`.
- New root image URL: `/og-home-v16.jpg`.
- Dynamic result OG route bumped to `/og-v16/{token}.png`.


## v17
- 64강 기본 모드
- 32강 빠르게 하기
- 128강 도전 모드
- 128개 DB 유지
- 결과 분석의 선택 횟수 문구를 실제 플레이 모드에 맞게 변경


## v18 copy update
- 기본 모드 · 64강 — 기본 모드로 즐기는 음식 이상형 월드컵
- 빠르게 하기 · 32강 — 빠르게 알아보는 오늘의 추천 메뉴
- 도전 모드 · 128강 — 심도 깊게 알아보는 내 음식 취향
