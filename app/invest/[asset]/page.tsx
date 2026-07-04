import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AssetSimulator from "../AssetSimulator";
import { ASSETS, getAsset } from "@/lib/invest-data";
import { getRealPrices } from "@/lib/real-prices";

// 자산별 페이지: /invest/bitcoin, /invest/samsung ...
// 코인은 CoinGecko 실데이터를 서버에서 주입 → 1시간마다 현재가 갱신(ISR).
export const revalidate = 3600;

export function generateStaticParams() {
  return ASSETS.map((a) => ({ asset: a.key }));
}

export async function generateMetadata({
  params,
}: PageProps<"/invest/[asset]">): Promise<Metadata> {
  const { asset: key } = await params;
  const asset = getAsset(key);
  if (!asset) return { title: "자산을 찾을 수 없음" };
  return {
    title: `그때 ${asset.name} 샀으면 — 지금 얼마?`,
    description: `그때 ${asset.name}에 투자했다면 지금 얼마가 됐을까? 일시불·적립식으로 수익을 시뮬레이션해 보세요.`,
    alternates: { canonical: `/invest/${asset.key}` },
  };
}

export default async function AssetPage({
  params,
}: PageProps<"/invest/[asset]">) {
  const { asset: key } = await params;
  const asset = getAsset(key);
  if (!asset) notFound();

  // 실데이터 소스(코인·미국주식·금)가 있으면 교체, 실패 시 예시값 폴백
  const { prices, live } = await getRealPrices(asset);
  const resolved = { ...asset, prices };

  return (
    <div className="space-y-6">
      <Link href="/invest" className="text-sm text-indigo-600 hover:underline">
        ← 그때샀으면
      </Link>
      <div>
        <h1 className="text-2xl font-bold">
          {asset.emoji} 그때 {asset.name} 샀으면?
        </h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
          시점과 금액을 골라 지금 얼마가 됐을지 확인해 보세요.
          {live && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600 ring-1 ring-emerald-100">
              실시간 시세 반영
            </span>
          )}
        </p>
      </div>
      <AssetSimulator asset={resolved} />
    </div>
  );
}
