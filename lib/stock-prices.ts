// 미국 주식·금 실데이터 — Twelve Data(무료 키) + Upstash 캐시.
//
// stooq는 봇 차단이 걸려 서버 fetch 불가 → Twelve Data로 대체.
// TWELVEDATA_API_KEY 환경변수가 있을 때만 동작(없으면 예시값 폴백, 네트워크 호출 안 함).
// 시뮬은 비율만 쓰므로 USD 그대로 사용(환율 변환 불필요).

import { redis } from "./redis";

// 우리 자산 key → Twelve Data 심볼 (한국 주식은 제외 → 예시값 유지)
const SYMBOLS: Record<string, string> = {
  apple: "AAPL",
  tesla: "TSLA",
  nvidia: "NVDA",
  tsmc: "TSM",
  micron: "MU",
  asml: "ASML",
  amd: "AMD",
  gold: "XAU/USD",
};

const BASE = "https://api.twelvedata.com";

function apiKey(): string | undefined {
  return process.env.TWELVEDATA_API_KEY;
}

// 해당 연도 초 첫 거래일 종가
async function fetchHistory(symbol: string, year: number): Promise<number | null> {
  const key = apiKey();
  if (!key) return null;
  try {
    const url = `${BASE}/time_series?symbol=${encodeURIComponent(
      symbol
    )}&interval=1day&start_date=${year}-01-02&end_date=${year}-01-20&order=ASC&outputsize=1&apikey=${key}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const j = await res.json();
    const close = Number(j?.values?.[0]?.close);
    return Number.isFinite(close) && close > 0 ? close : null;
  } catch {
    return null;
  }
}

// 현재가
async function fetchCurrent(symbol: string): Promise<number | null> {
  const key = apiKey();
  if (!key) return null;
  try {
    const url = `${BASE}/price?symbol=${encodeURIComponent(symbol)}&apikey=${key}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const j = await res.json();
    const price = Number(j?.price);
    return Number.isFinite(price) && price > 0 ? price : null;
  } catch {
    return null;
  }
}

async function cachedHistory(symbol: string, year: number): Promise<number | null> {
  const k = `stock:${symbol}:${year}`;
  if (redis) {
    const hit = await redis.get<number>(k);
    if (typeof hit === "number") return hit;
  }
  const price = await fetchHistory(symbol, year);
  if (price != null && redis) await redis.set(k, price);
  return price;
}

async function cachedCurrent(symbol: string): Promise<number | null> {
  const k = `stock:${symbol}:now`;
  if (redis) {
    const hit = await redis.get<number>(k);
    if (typeof hit === "number") return hit;
  }
  const price = await fetchCurrent(symbol);
  if (price != null && redis) await redis.set(k, price, { ex: 3600 });
  return price;
}

export function stockPriceFetchers(assetKey: string) {
  const symbol = SYMBOLS[assetKey];
  if (!symbol || !apiKey()) return null; // 키 없으면 비활성 → 예시값 폴백
  return {
    history: (year: number) => cachedHistory(symbol, year),
    current: () => cachedCurrent(symbol),
  };
}
