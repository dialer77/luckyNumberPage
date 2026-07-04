// 코인 실데이터 — CoinGecko + Upstash 캐시. (저수준 fetch만; 조합은 real-prices.ts)

import { redis } from "./redis";

const BASE = "https://api.coingecko.com/api/v3";
const COIN_IDS: Record<string, string> = {
  bitcoin: "bitcoin",
  ethereum: "ethereum",
};

function headers(): HeadersInit {
  const key = process.env.COINGECKO_API_KEY;
  return key ? { "x-cg-demo-api-key": key } : {};
}

async function fetchHistory(id: string, ddmmyyyy: string): Promise<number | null> {
  try {
    const res = await fetch(
      `${BASE}/coins/${id}/history?date=${ddmmyyyy}&localization=false`,
      { headers: headers(), signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const j = await res.json();
    const p = j?.market_data?.current_price?.krw;
    return typeof p === "number" ? p : null;
  } catch {
    return null;
  }
}

async function fetchCurrent(id: string): Promise<number | null> {
  try {
    const res = await fetch(`${BASE}/simple/price?ids=${id}&vs_currencies=krw`, {
      headers: headers(),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const j = await res.json();
    const p = j?.[id]?.krw;
    return typeof p === "number" ? p : null;
  } catch {
    return null;
  }
}

async function cachedHistory(id: string, year: number): Promise<number | null> {
  const key = `coin:${id}:${year}`;
  if (redis) {
    const hit = await redis.get<number>(key);
    if (typeof hit === "number") return hit;
  }
  const price = await fetchHistory(id, `01-01-${year}`);
  if (price != null && redis) await redis.set(key, price);
  return price;
}

async function cachedCurrent(id: string): Promise<number | null> {
  const key = `coin:${id}:now`;
  if (redis) {
    const hit = await redis.get<number>(key);
    if (typeof hit === "number") return hit;
  }
  const price = await fetchCurrent(id);
  if (price != null && redis) await redis.set(key, price, { ex: 3600 });
  return price;
}

// 자산 key → 연도별/현재 시세 fetcher (없으면 null)
export function coinPriceFetchers(assetKey: string) {
  const id = COIN_IDS[assetKey];
  if (!id) return null;
  return {
    history: (year: number) => cachedHistory(id, year),
    current: () => cachedCurrent(id),
  };
}
