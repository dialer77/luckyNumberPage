import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { decodeInvestShare, getAsset } from "@/lib/invest-data";
import { formatKRW } from "@/lib/lotto-data";

// 공유된 투자 결과 페이지. 무한한 code라 요청 시 렌더링.
export async function generateMetadata({
  params,
}: PageProps<"/invest/r/[code]">): Promise<Metadata> {
  const { code } = await params;
  const s = decodeInvestShare(code);
  if (!s) return { title: "결과를 찾을 수 없음" };
  const asset = getAsset(s.assetKey)!;
  const profit = s.nowValue - s.amount;
  return {
    title: `그때 ${asset.name} 샀으면 ${formatKRW(s.nowValue)}`,
    description: `${s.year}년 ${formatKRW(s.amount)} → 지금 ${formatKRW(
      s.nowValue
    )} (순손익 ${formatKRW(profit)})`,
  };
}

export default async function InvestResultPage({
  params,
}: PageProps<"/invest/r/[code]">) {
  const { code } = await params;
  const s = decodeInvestShare(code);
  if (!s) notFound();
  const asset = getAsset(s.assetKey)!;
  const profit = s.nowValue - s.amount;
  const gain = profit >= 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {asset.emoji} 그때 {asset.name} 샀으면?
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {s.mode === "dca"
            ? `${s.year}년부터 적립식으로 총 ${formatKRW(s.amount)}`
            : `${s.year}년에 ${formatKRW(s.amount)}`}{" "}
          투자 결과
        </p>
      </div>

      <section className="rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 ring-1 ring-indigo-100">
        <div className="text-sm text-slate-500">지금은</div>
        <div className="mt-1 text-3xl font-extrabold text-indigo-600">
          {formatKRW(s.nowValue)}
        </div>
        <div className="mt-2 text-sm">
          <span className={gain ? "text-indigo-600" : "text-rose-500"}>
            {gain ? "▲" : "▼"} 순손익 {formatKRW(profit)}
          </span>
        </div>
      </section>

      <Link
        href={`/invest/${asset.key}`}
        className="inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        나도 계산해보기 →
      </Link>
    </div>
  );
}
