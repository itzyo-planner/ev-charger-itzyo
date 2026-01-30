// Cloudflare Pages Function — 공공데이터 API CORS 프록시
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const targetPath = url.pathname.replace(/^\/api\/EvCharger/, '/EvCharger');
  const targetUrl = `https://apis.data.go.kr/B552584${targetPath}${url.search}`;

  const response = await fetch(targetUrl, {
    method: context.request.method,
    headers: { 'Accept': '*/*' },
  });

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/xml',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=60',
    },
  });
}
