import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES, assetsByCategory } from "@/lib/invest-data";

export const metadata: Metadata = {
  title: "그때샀으면 — 그때 샀으면 지금 얼마?",
  description:
    "주식·코인·금·배당주 중 그때 샀다면 지금 얼마가 됐을까? 자산을 골라 일시불·적립식으로 수익을 시뮬레이션해 보세요.",
  alternates: { canonical: "/invest" },
};

// 그때샀으면 "대문" — 카테고리별로 자산을 묶어 보여줌.
export default function InvestHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">📈 그때샀으면</h1>
        <p className="mt-1 text-sm text-slate-500">
          궁금한 자산을 골라보세요. 일시불로도, 매주 적립식으로도 그때 샀다면
          지금 얼마인지 계산해 드려요.
        </p>
      </div>

      {CATEGORIES.map((cat) => {
        const assets = assetsByCategory(cat.key);
        if (assets.length === 0) return null;
        return (
          <section key={cat.key} className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-500">
              {cat.emoji} {cat.name}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {assets.map((a) => (
                <Link
                  key={a.key}
                  href={`/invest/${a.key}`}
                  className="flex flex-col items-center gap-2 rounded-xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="text-3xl">{a.emoji}</span>
                  <span className="font-semibold">{a.name}</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {/* 배당 ETF는 시세 시뮬 대신 배당 재투자 계산기로 */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-500">💰 배당</h2>
        <Link
          href="/invest/dividend"
          className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="text-2xl">💰</span>
          <div>
            <div className="font-semibold">고배당 ETF 배당 계산기</div>
            <div className="mt-0.5 text-sm text-slate-500">
              시작금액·납입·배당율·기간으로 배당 재투자(복리) 계산
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
