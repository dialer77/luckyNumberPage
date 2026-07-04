// 미국 주식·금 실데이터 — Twelve Data(무료 키) + Upstash 캐시.
//
// 무료 등급은 분당 8콜 제한 → 종목당 "월별 시계열 1콜"로 과거+현재를 한 번에
// 받아 연도별 값을 뽑음(종목당 7콜 → 1콜). TWELVEDATA_API_KEY 없으면 예시 폴백.
// 시뮬은 비율만 쓰므로 USD 그대로 사용(환율 변환 불필요).

import { redis } from "./redis";
import { PAST_YEARS, CURRENT_YEAR, type Asset } from "./invest-data";

const SYMBOLS: Record<string, string> = {
  apple: "AAPL",
  tesla: "TSLA",
  nvidia: "NVDA",
  tsmc: "TSM",
  micron: "MU",
  asml: "ASML",
  amd: "AMD",
  googl: "GOOGL",
  amazon: "AMZN",
  microsoft: "MSFT",
  meta: "META",
  gold: "XAU/USD",
};

const BASE = "https://api.twelvedata.com";

function apiKey(): string | undefined {
  return process.env.TWELVEDATA_API_KEY;
}

type Row = { datetime: string; close: number };

// 월별 시계열 한 번에 (2014~현재)
async function fetchSeries(symbol: string): Promise<Row[] | null> {
  const key = apiKey();
  if (!key) return null;
  try {
    const url = `${BASE}/time_series?symbol=${encodeURIComponent(
      symbol
    )}&interval=1month&start_date=2014-12-01&outputsize=5000&order=ASC&apikey=${key}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const j = await res.json();
    if (!Array.isArray(j?.values)) return null;
    return j.values
      .map((v: { datetime: string; close: string }) => ({
        datetime: String(v.datetime),
        close: Number(v.close),
      }))
      .filter((v: Row) => Number.isFinite(v.close) && v.close > 0);
  } catch {
    return null;
  }
}

// 시계열 → 연도별 가격맵 (한 연도라도 없으면 null → 통째 폴백)
function buildMap(series: Row[]): Record<number, number> | null {
  const out: Record<number, number> = {};
  for (const y of PAST_YEARS) {
    const row = series.find((v) => Number(v.datetime.slice(0, 4)) === y);
    if (!row) return null;
    out[y] = row.close;
  }
  const last = series[series.length - 1];
  if (!last) return null;
  out[CURRENT_YEAR] = last.close;
  return out;
}

// 자산의 실데이터 가격맵. 주식 심볼+키가 있으면 {prices, live}, 아니면 null.
export async function getStockPrices(
  asset: Asset
): Promise<{ prices: Record<number, number>; live: boolean } | null> {
  const symbol = SYMBOLS[asset.key];
  if (!symbol || !apiKey()) return null;

  const cacheKey = `stockmap:${symbol}`;
  if (redis) {
    const hit = await redis.get<Record<number, number>>(cacheKey);
    if (hit && typeof hit === "object") return { prices: hit, live: true };
  }

  const series = await fetchSeries(symbol);
  const map = series ? buildMap(series) : null;
  if (map) {
    if (redis) await redis.set(cacheKey, map, { ex: 3600 });
    return { prices: map, live: true };
  }
  return { prices: asset.prices, live: false }; // 폴백
}

export function isStockSymbol(assetKey: string): boolean {
  return assetKey in SYMBOLS;
}
