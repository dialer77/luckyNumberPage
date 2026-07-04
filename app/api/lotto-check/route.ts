// 진단용: Vercel 서버가 실제로 어느 리전에서 돌고, 동행복권에 닿는지 확인.
// https://manyage.com/api/lotto-check 로 접속해서 결과를 봅니다.
// (확인 끝나면 삭제해도 됩니다.)

export const dynamic = "force-dynamic";

export async function GET() {
  const url =
    "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=1100";
  const out: Record<string, unknown> = {
    region: process.env.VERCEL_REGION ?? "unknown",
    ok: false,
    status: 0,
    returnValue: null,
    snippet: "",
  };
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    out.status = res.status;
    const text = await res.text();
    out.snippet = text.slice(0, 160);
    try {
      const j = JSON.parse(text);
      out.returnValue = j.returnValue;
      out.ok = j.returnValue === "success";
    } catch {
      /* JSON 아님 = 차단/리다이렉트 */
    }
  } catch (e) {
    out.snippet = "fetch error: " + String(e);
  }
  return Response.json(out);
}
