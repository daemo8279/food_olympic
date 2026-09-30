const FONT_BLACK = "https://cdn.jsdelivr.net/gh/fonts-archive/Pretendard/Pretendard-Black.woff2";
const FONT_BOLD = "https://cdn.jsdelivr.net/gh/fonts-archive/Pretendard/Pretendard-Bold.woff2";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/result/")) {
      const token = url.pathname.slice("/result/".length);
      const data = decodeToken(token);
      if (!data?.champion?.name) return new Response("Invalid result token", { status: 400 });
      return resultPage(url, token, data);
    }

    if (url.pathname.startsWith("/og-v16/") && url.pathname.endsWith(".png")) {
      const token = url.pathname.slice("/og-v16/".length, -4);
      const data = decodeToken(token);
      if (!data?.champion?.name) return new Response("Invalid OG token", { status: 400 });

      const cache = caches.default;
      const cacheKey = new Request(url.toString(), request);
      const cached = await cache.match(cacheKey);
      if (cached) return cached;

      const response = await renderOgPng(request, env, data);
      if (response.ok) ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    }

    return env.ASSETS.fetch(request);
  }
};

function decodeToken(token) {
  try {
    const normalized = token.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
    const bytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function compactNames(items, limit = 3) {
  return (items || []).slice(0, limit).map(x => x?.name || "").filter(Boolean);
}

function fitChampionSize(name) {
  const len = [...String(name)].length;
  if (len <= 4) return 72;
  if (len <= 6) return 62;
  if (len <= 9) return 50;
  return 42;
}

function fitMenuSize(text) {
  const len = [...String(text)].length;
  if (len <= 16) return 27;
  if (len <= 24) return 23;
  return 19;
}

async function renderOgPng(request, env, data) {
  const templateUrl = new URL("/assets/og/og-result-background-template.png", request.url);
  const templateResponse = await env.ASSETS.fetch(new Request(templateUrl, request));
  if (!templateResponse.ok) return new Response("OG template not found", { status: 500 });

  // Even if Images binding is unavailable, never return a broken OG image.
  // Kakao will at least receive the approved result-card background.
  if (!env.IMAGES) {
    return new Response(templateResponse.body, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300"
      }
    });
  }

  const champion = String(data.champion.name || "");
  const bestMenu = compactNames(data.best5, 3).join(" · ");
  const todayMenu = compactNames(data.recs, 3).join(" · ");

  let image = env.IMAGES
    .input(templateResponse.body)
    .transform({ width: 1200, height: 630, fit: "cover" });

  // Dynamic content is intentionally limited to:
  // 1) 우승 음식명
  // 2) 베스트 메뉴 TOP 3
  // 3) 오늘 추천 메뉴 3개
  image = image.draw(
    env.IMAGES.text(champion, {
      font: { url: FONT_BLACK },
      color: "#512414",
      size: fitChampionSize(champion)
    }),
    { left: 580, top: 205 }
  );

  if (bestMenu) {
    image = image.draw(
      env.IMAGES.text(bestMenu, {
        font: { url: FONT_BOLD },
        color: "#63341F",
        size: fitMenuSize(bestMenu)
      }),
      { left: 760, top: 430 }
    );
  }

  if (todayMenu) {
    image = image.draw(
      env.IMAGES.text(todayMenu, {
        font: { url: FONT_BOLD },
        color: "#63341F",
        size: fitMenuSize(todayMenu)
      }),
      { left: 760, top: 507 }
    );
  }

  try {
    return (await image.output({ format: "image/png" })).response({
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    // Do not let Kakao receive a broken og:image if text rendering fails.
    // Return the approved result-card background as a valid PNG fallback.
    const fallbackUrl = new URL("/assets/og/og-result-background-template.png", request.url);
    const fallback = await env.ASSETS.fetch(new Request(fallbackUrl, request));
    return new Response(fallback.body, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300"
      }
    });
  }
}


function resultPage(url, token, data) {
  const champion = String(data.champion?.name || "");
  const bestMenu = compactNames(data.best5, 3);
  const todayMenu = compactNames(data.recs, 3);
  const ogImage = `${url.origin}/og-v16/${token}.png`;
  const appView = `${url.origin}/?share=${encodeURIComponent(token)}`;

  const title = `${champion} 우승! 음식 이상형 월드컵 결과`;
  const desc = [
    bestMenu.length ? `베스트 메뉴 ${bestMenu.join(", ")}` : "",
    todayMenu.length ? `오늘 추천 ${todayMenu.join(", ")}` : ""
  ].filter(Boolean).join(" · ");

  return new Response(`<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="오늘 뭐 먹지? WORLD CUP" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:image" content="${esc(ogImage)}" />
<meta property="og:image:secure_url" content="${esc(ogImage)}" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="${esc(url.href)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<meta name="twitter:image" content="${esc(ogImage)}" />
<style>
body{margin:0;background:#f7f0e8;font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif;color:#351f16}
.wrap{max-width:760px;margin:0 auto;padding:36px 18px}
.card{background:#fff;border:1px solid #eadaca;border-radius:28px;padding:28px}
h1{font-size:38px;letter-spacing:-.04em;margin:0 0 12px}
p{color:#76675c;line-height:1.7}
.list{background:#fff8f1;border-radius:18px;padding:16px 18px;margin-top:14px}
.list b{display:block;margin-bottom:7px;color:#d45b22}
a{display:inline-block;margin-top:20px;padding:13px 18px;background:#d45b22;color:#fff;text-decoration:none;border-radius:999px;font-weight:800}
</style>
</head>
<body>
<div class="wrap"><div class="card">
<h1>${esc(champion)} 우승!</h1>
<p>공유된 음식 이상형 월드컵 결과입니다.</p>
<div class="list"><b>BEST MENU</b>${esc(bestMenu.join(" · "))}</div>
<div class="list"><b>오늘 추천 메뉴</b>${esc(todayMenu.join(" · "))}</div>
<a href="${esc(appView)}">앱에서 결과 보기</a>
</div></div>
<script>setTimeout(function(){location.replace(${JSON.stringify(appView)});},800);</script>
</body></html>`, {
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": "public, max-age=300"
    }
  });
}
