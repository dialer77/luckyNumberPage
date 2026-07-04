import type { Metadata } from "next";
import Link from "next/link";
import { ASSETS } from "@/lib/invest-data";

export const metadata: Metadata = {
  title: "그때샀으면 — 그때 샀으면 지금 얼마?",
  description:
    "그때 삼성전자·애플·비트코인 등을 샀다면 지금 얼마가 됐을까? 자산을 골라 수익을 시뮬레이션해 보세요.",
  alternates: { canonical: "/invest" },
};

// 그때샀으면 "대문" — 자산을 카드로 고르면 해당 자산 페이지로 진입.
export default function InvestHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📈 그때샀으면</h1>
        <p className="mt-1 text-sm text-slate-500">
          궁금한 자산을 골라보세요. 그때 샀다면 지금 얼마가 됐을지 계산해
          드려요.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ASSETS.map((a) => (
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
    </div>
  );
}
