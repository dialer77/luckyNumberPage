// 코인 실데이터 — CoinGecko 무료 API + Upstash 캐시.
//
// · 과거 시세(01-01-YYYY)는 안 변하므로 Upstash에 "영구 캐시".
// · 현재가는 1시간 TTL로 캐시.
// · 네트워크 실패/데이터 없음이면 예시값으로 폴백 → 항상 화면은 뜸.
//
// ⚠️ 서버 전용. (CoinGecko 무료 공개 API는 rate limit이 있어, 트래픽이
//   커지면 무료 demo API 키(COINGECKO_API_KEY)를 넣으면 안정적입니다.)

import { redis } from "./redis";
import { PAST_YEARS, CURRENT_YEAR, type Asset } from "./invest-data";

const BASE = "https://api.coingecko.com/api/v3";

// 우리 자산 key → CoinGecko coin id
const COIN_IDS: Record<string, string> = {
  bitcoin: "bitcoin",
  ethereum: "ethereum",
};

export function isRealCoin(assetKey: string): boolean {
  return assetKey in COIN_IDS;
}

function headers(): HeadersInit {
  const key = process.env.COINGECKO_API_KEY;
  return key ? { "x-cg-demo-api-key": key } : {};
}

// 과거 특정일(dd-mm-yyyy) KRW 가격
async function fetchHistory(id: string, ddmmyyyy: string): Promise<number | null> {
  try {
    const res = await fetch(
      `${BASE}/coins/${id}/history?date=${ddmmyyyy}&localization=false`,
      { headers: headers() }
    );
    if (!res.ok) return null;
    const j = await res.json();
    const p = j?.market_data?.current_price?.krw;
    return typeof p === "number" ? p : null;
  } catch {
    return null;
  }
}

// 현재가 KRW
async function fetchCurrent(id: string): Promise<number | null> {
  try {
    const res = await fetch(
      `${BASE}/simple/price?ids=${id}&vs_currencies=krw`,
      { headers: headers() }
    );
    if (!res.ok) return null;
    const j = await res.json();
    const p = j?.[id]?.krw;
    return typeof p === "number" ? p : null;
  } catch {
    return null;
  }
}

// 과거 연도 가격 (캐시 영구)
async function cachedHistoryPrice(id: string, year: number): Promise<number | null> {
  const key = `coin:${id}:${year}`;
  if (redis) {
    const hit = await redis.get<number>(key);
    if (typeof hit === "number") return hit;
  }
  const price = await fetchHistory(id, `01-01-${year}`);
  if (price != null && redis) await redis.set(key, price); // 안 변하므로 영구
  return price;
}

// 현재가 (캐시 1시간)
async function cachedCurrentPrice(id: string): Promise<number | null> {
  const key = `coin:${id}:now`;
  if (redis) {
    const hit = await redis.get<number>(key);
    if (typeof hit === "number") return hit;
  }
  const price = await fetchCurrent(id);
  if (price != null && redis) await redis.set(key, price, { ex: 3600 });
  return price;
}

/**
 * 코인의 연도별 실데이터 가격맵을 반환.
 * 실패한 연도는 예시값(sample.prices)으로 폴백.
 * live = 현재가를 실제로 가져왔는지(캐시 포함) → true일 때만 "실시간" 배지.
 */
export async function getRealCoinPrices(
  assetKey: string,
  sample: Asset
): Promise<{ prices: Record<number, number>; live: boolean }> {
  const id = COIN_IDS[assetKey];
  if (!id) return { prices: sample.prices, live: false };

  const out: Record<number, number> = {};
  for (const y of PAST_YEARS) {
    out[y] = (await cachedHistoryPrice(id, y)) ?? sample.prices[y];
  }
  const current = await cachedCurrentPrice(id);
  out[CURRENT_YEAR] = current ?? sample.prices[CURRENT_YEAR];
  return { prices: out, live: current != null };
}
