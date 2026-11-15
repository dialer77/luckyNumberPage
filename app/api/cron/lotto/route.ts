// 로또 데이터 비상용 일일 동기화 (Vercel Cron, vercel.json — 매일 21:00 UTC = 06:00 KST).
//
// 토요일 추첨 직후의 실시간 반영은 /api/lotto/latest 가 맡는다(방문 시 확인).
// 이 cron은 그날 방문이 없었을 때를 대비한 안전장치다. Hobby 요금제라 하루 1회가 한계.
// 동기화 로직은 lib/lotto-sync.ts 하나로 공유한다.
//
// 수동 확인: https://manyage.com/api/cron/lotto (CRON_SECRET 미설정 시)

import { syncLotto, revalidateLottoPages } from "@/lib/lotto-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request) {
  // 선택적 보안: CRON_SECRET 이 설정돼 있으면 Bearer 토큰 검증.
  // (Vercel Cron은 CRON_SECRET이 있으면 자동으로 이 헤더를 붙여준다.)
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const result = await syncLotto();
  revalidateLottoPages(result.added);

  if (!result.ok) {
    const status = result.error === "no redis" ? 500 : 502;
    return Response.json(result, { status });
  }
  return Response.json(result);
}
