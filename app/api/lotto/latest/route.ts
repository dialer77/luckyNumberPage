// 최신 회차 실시간 조회 — 첫 화면·행운노트의 최신 회차 카드(LatestDrawCard)가 부른다.
//
// 다음 회차 추첨 시각이 지났는데 아직 저장되지 않았으면 그 자리에서 smok95를 확인해
// 저장하고(20초에 한 번만), 새 회차가 들어오면 관련 페이지 캐시도 비운다.
// 그래서 토요일 20:35 추첨 뒤 방문자가 있으면 몇 분 안에 사이트 전체에 반영된다.

import { syncIfDue, revalidateLottoPages } from "@/lib/lotto-sync";
import { getLiveLatest } from "@/lib/lotto-live";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  const sync = await syncIfDue();
  revalidateLottoPages(sync.added);

  const latest = await getLiveLatest();
  const pending =
    sync.pending && sync.pending.drwNo > latest.drwNo ? sync.pending : null;

  return Response.json(
    { latest, pending },
    { headers: { "Cache-Control": "no-store" } }
  );
}
