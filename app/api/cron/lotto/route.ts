// 주간 로또 데이터 자동 갱신 (Vercel Cron).
//
// 동행복권은 브라우저만 통과시키는 봇 차단이 걸려 스크립트로는 못 긁는다.
// 대신 매주 자동 업데이트되는 공개 데이터셋(smok95/lotto, GitHub)에서
// 새 회차만 받아 Upstash에 upsert한다. GitHub는 어디서든 접근 가능.
//
// vercel.json 의 crons 설정으로 매일 실행되며, 새 회차가 없으면 아무것도 안 한다.
// 수동 확인: https://manyage.com/api/cron/lotto (CRON_SECRET 미설정 시)

import { redis } from "@/lib/redis";
import type { LottoDraw } from "@/lib/lotto-data";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const RAW = "https://raw.githubusercontent.com/smok95/lotto/main/results";

type Smok = {
  draw_no: number;
  numbers: number[];
  bonus_no: number;
  date: string;
  divisions?: { prize?: number; winners?: number }[];
};

const num = (x?: number) => (typeof x === "number" ? x : 0);

// smok95 형식 → 사이트 LottoDraw 형식
function toDraw(r: Smok): LottoDraw {
  const d = r.divisions ?? [];
  return {
    drwNo: r.draw_no,
    drwNoDate: String(r.date).slice(0, 10), // YYYY-MM-DD
    numbers: r.numbers as LottoDraw["numbers"],
    bonus: r.bonus_no,
    firstWinAmount: num(d[0]?.prize),
    firstWinnerCount: num(d[0]?.winners),
    prize2: num(d[1]?.prize),
    prize3: num(d[2]?.prize),
  };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  // 선택적 보안: CRON_SECRET 이 설정돼 있으면 Bearer 토큰 검증.
  // (Vercel Cron은 CRON_SECRET이 있으면 자동으로 이 헤더를 붙여준다.)
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!redis) {
    return Response.json({ ok: false, error: "no redis" }, { status: 500 });
  }

  // 최신 회차 확인
  const latest = await fetchJson<Smok>(`${RAW}/latest.json`);
  if (!latest?.draw_no) {
    return Response.json({ ok: false, error: "latest fetch failed" }, { status: 502 });
  }
  const newest = latest.draw_no;

  const storedRaw = await redis.get<number>("lotto:latestNo");
  const stored =
    typeof storedRaw === "number" ? storedRaw : Number(storedRaw) || 0;

  // 새 회차만 upsert (과거 회차는 안 변하므로 건너뜀).
  // 추적을 잃었으면(stored=0) 최신 회차 하나만 확실히 채운다.
  const start = stored > 0 ? stored + 1 : newest;
  const added: number[] = [];
  for (let n = start; n <= newest; n++) {
    const r = n === newest ? latest : await fetchJson<Smok>(`${RAW}/${n}.json`);
    if (!r?.draw_no) continue;
    await redis.set(`lotto:${n}`, toDraw(r)); // 영구 저장
    added.push(n);
  }

  // latestNo 는 만료 없이 영구 저장 (cron 이 매주 갱신).
  await redis.set("lotto:latestNo", newest);

  return Response.json({ ok: true, newest, previous: stored, added });
}
