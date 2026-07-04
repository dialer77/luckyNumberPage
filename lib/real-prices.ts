// 실데이터 통합 진입점.
//
// 통화 혼용을 막기 위해 "전부 실데이터 or 전부 예시" (all-or-nothing):
// 한 연도라도 못 가져오면 그 자산은 통째로 예시값으로 폴백.
// live = 실데이터로 채워졌는지 → true일 때만 "실시간 시세 반영" 배지.

import { PAST_YEARS, CURRENT_YEAR, type Asset } from "./invest-data";
import { coinPriceFetchers } from "./coin-prices";
import { stockPriceFetchers } from "./stock-prices";

export async function getRealPrices(
  asset: Asset
): Promise<{ prices: Record<number, number>; live: boolean }> {
  const fetchers = coinPriceFetchers(asset.key) ?? stockPriceFetchers(asset.key);
  if (!fetchers) return { prices: asset.prices, live: false };

  const out: Record<number, number> = {};
  for (const y of PAST_YEARS) {
    const p = await fetchers.history(y);
    if (p == null) return { prices: asset.prices, live: false }; // 통화 혼용 방지
    out[y] = p;
  }
  const current = await fetchers.current();
  if (current == null) return { prices: asset.prices, live: false };
  out[CURRENT_YEAR] = current;

  return { prices: out, live: true };
}

// 실데이터 소스가 있는 자산인지 (배지/안내용)
export function hasRealSource(assetKey: string): boolean {
  return coinPriceFetchers(assetKey) != null || stockPriceFetchers(assetKey) != null;
}
