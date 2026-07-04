import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AssetSimulator from "../AssetSimulator";
import { ASSETS, getAsset } from "@/lib/invest-data";

// 자산별 정적 페이지: /invest/bitcoin, /invest/samsung ...
// generateStaticParams로 자산마다 개별 SEO 페이지 생성.
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
    description: `그때 ${asset.name}에 투자했다면 지금 얼마가 됐을까? 시점과 금액을 넣어 수익을 시뮬레이션해 보세요.`,
    alternates: { canonical: `/invest/${asset.key}` },
  };
}

export default async function AssetPage({
  params,
}: PageProps<"/invest/[asset]">) {
  const { asset: key } = await params;
  const asset = getAsset(key);
  if (!asset) notFound();

  return (
    <div className="space-y-6">
      <Link href="/invest" className="text-sm text-indigo-600 hover:underline">
        ← 그때샀으면
      </Link>
      <div>
        <h1 className="text-2xl font-bold">
          {asset.emoji} 그때 {asset.name} 샀으면?
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          시점과 금액을 골라 지금 얼마가 됐을지 확인해 보세요.
        </p>
      </div>
      <AssetSimulator assetKey={asset.key} />
    </div>
  );
}
