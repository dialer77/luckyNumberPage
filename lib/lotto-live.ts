// 로또 실데이터 — 동행복권 getLottoNumber + Upstash 캐시.
//
// 과거 회차는 안 변하므로 Upstash에 영구 저장(기획서 §5: "자체 DB 축적").
// 동행복권이 해외 IP를 차단하므로 이 fetch는 한국 리전(Vercel icn1)에서만
// 성공합니다. 실패하면 예시 데이터로 폴백 → 사이트는 항상 정상 동작.
//
// ⚠️ 서버 전용.

import { redis } from "./redis";
import {
  getDraw as sampleDraw,
  getAllDraws as sampleAll,
  getLatestDraw as sampleLatest,
  type LottoDraw,
} from "./lotto-data";

const API = "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";
const ROUND1_UTC = Date.UTC(2002, 11, 7); // 1회차 추첨일 2002-12-07(토)
const WEEK = 7 * 24 * 3600 * 1000;

// getLottoNumber는 2·3등 금액을 주지 않음 → 근사 추정 (참고용)
function estimatePrizes(firstWinAmount: number) {
  return {
    prize2: Math.max(0, Math.round(firstWinAmount * 0.025)),
    prize3: 1_500_000,
  };
}

// 동행복권에서 한 회차 fetch (성공 시 LottoDraw, 아니면 null)
async function fetchDraw(n: number): Promise<LottoDraw | null> {
  try {
    const res = await fetch(`${API}${n}`, {
      signal: AbortSignal.timeout(6000),
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return null;
    const j = await res.json();
    if (j?.returnValue !== "success") return null;
    const firstWinAmount = Number(j.firstWinamnt) || 0;
    const { prize2, prize3 } = estimatePrizes(firstWinAmount);
    return {
      drwNo: Number(j.drwNo),
      drwNoDate: String(j.drwNoDate),
      numbers: [j.drwtNo1, j.drwtNo2, j.drwtNo3, j.drwtNo4, j.drwtNo5, j.drwtNo6].map(
        Number
      ) as [number, number, number, number, number, number],
      bonus: Number(j.bnusNo),
      firstWinAmount,
      firstWinnerCount: Number(j.firstPrzwnerCo) || 0,
      prize2,
      prize3,
    };
  } catch {
    return null;
  }
}

// 실데이터 한 회차 (캐시 영구). 폴백 없음.
async function getRealDraw(n: number): Promise<LottoDraw | null> {
  const key = `lotto:${n}`;
  if (redis) {
    const hit = await redis.get<LottoDraw>(key);
    if (hit) return hit;
  }
  const d = await fetchDraw(n);
  if (d && redis) await redis.set(key, d);
  return d;
}

// 한 회차 (실데이터 → 예시 폴백)
export async function getLiveDraw(n: number): Promise<LottoDraw | null> {
  return (await getRealDraw(n)) ?? sampleDraw(n) ?? null;
}

// 최신 회차 번호 (날짜로 추정 후 실제 존재 검증, 실패 시 예시 최신)
export async function getLiveLatestNo(): Promise<number> {
  if (redis) {
    const hit = await redis.get<number>("lotto:latestNo");
    if (typeof hit === "number") return hit;
  }
  const candidate = Math.floor((Date.now() - ROUND1_UTC) / WEEK) + 1;
  for (let n = candidate + 1; n >= candidate - 2 && n > 0; n--) {
    if (await getRealDraw(n)) {
      if (redis) await redis.set("lotto:latestNo", n, { ex: 3600 });
      return n;
    }
  }
  return sampleLatest().drwNo; // 폴백
}

// 최신 회차
export async function getLiveLatest(): Promise<LottoDraw> {
  const no = await getLiveLatestNo();
  return (await getLiveDraw(no)) ?? sampleLatest();
}

// 최근 n회차 (최신순)
export async function getLiveRecent(n: number): Promise<LottoDraw[]> {
  const latestNo = await getLiveLatestNo();
  const nums = Array.from({ length: n }, (_, i) => latestNo - i).filter((x) => x >= 1);
  const draws = await Promise.all(nums.map((x) => getLiveDraw(x)));
  const real = draws.filter((d): d is LottoDraw => d != null);
  return real.length > 0 ? real : sampleAll(); // 전부 실패면 예시 전체
}

// 번호 출현 통계 (주어진 회차들 기준)
export function computeFrequency(
  draws: LottoDraw[]
): { number: number; count: number }[] {
  const counts = new Map<number, number>();
  for (let i = 1; i <= 45; i++) counts.set(i, 0);
  for (const d of draws) for (const x of d.numbers) counts.set(x, (counts.get(x) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([number, count]) => ({ number, count }))
    .sort((a, b) => b.count - a.count || a.number - b.number);
}
