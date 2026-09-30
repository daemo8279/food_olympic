# v16 - ERR_TOO_MANY_REDIRECTS 수정

## 원인
이전 Worker 코드가 홈 `/` 요청에서:

1. `/` 요청을 가로챔
2. `env.ASSETS.fetch("/index.html")` 요청
3. Cloudflare Static Assets가 `/index.html`을 canonical URL `/`로 redirect
4. 다시 Worker가 `/` 가로챔

이 흐름이 반복되어 `ERR_TOO_MANY_REDIRECTS`가 발생했습니다.

## 수정
- Worker에서 `/` 특수 처리를 완전히 제거했습니다.
- 홈은 Cloudflare Static Assets가 직접 `public/index.html`을 서빙합니다.
- OG 주소는 `index.html`에 실제 운영 도메인으로 직접 입력했습니다.

### 홈 OG
`https://foodolympic.kyoon.app/og-home-v16.jpg`

### 홈 URL
`https://foodolympic.kyoon.app/`

## 개인 결과 OG
개인 결과용 Worker 기능은 유지됩니다.

- 결과 페이지: `/result/{token}`
- 결과 OG: `/og-v16/{token}.png`

## 배포 후 확인
1. `https://foodolympic.kyoon.app/` 접속
   - 리디렉션 오류 없이 앱이 나와야 함
2. `https://foodolympic.kyoon.app/og-home-v16.jpg` 접속
   - 치킨이 들어간 새 대표 이미지가 나와야 함
3. 카카오 Developers에서 `https://foodolympic.kyoon.app/` 메타정보 캐시 초기화
4. 앱 주소를 카카오톡에 다시 붙여넣기

이번 버전에서는 DNS나 Custom Domain 설정을 건드릴 필요가 없습니다.
