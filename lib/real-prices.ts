// 실데이터 통합 진입점.
//
// 통화 혼용을 막기 위해 "전부 실데이터 or 전부 예시" (all-or-nothing):
// 한 연도라도 못 가져오면 그 자산은 통째로 예시값으로 폴백.
// live = 실데이터로 채워졌는지 → true일 때만 "실시간 시세 반영" 배지.

import { PAST_YEARS, CURRENT_YEAR, type Asset } from "./invest-data";
import { coinPriceFetchers } from "./coin-prices";
import { getStockPrices, isStockSymbol } from "./stock-prices";

export async function getRealPrices(
  asset: Asset
): Promise<{ prices: Record<number, number>; live: boolean }> {
  // 미국주식·금 (Twelve Data) — 종목당 1콜
  if (isStockSymbol(asset.key)) {
    const r = await getStockPrices(asset);
    if (r) return r;
  }

  // 코인 (CoinGecko) — 날짜별 조회, all-or-nothing
  const fetchers = coinPriceFetchers(asset.key);
  if (fetchers) {
    const out: Record<number, number> = {};
    for (const y of PAST_YEARS) {
      const p = await fetchers.history(y);
      if (p == null) return { prices: asset.prices, live: false };
      out[y] = p;
    }
    const current = await fetchers.current();
    if (current == null) return { prices: asset.prices, live: false };
    out[CURRENT_YEAR] = current;
    return { prices: out, live: true };
  }

  return { prices: asset.prices, live: false };
}
