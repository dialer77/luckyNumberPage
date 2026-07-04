import type { Metadata } from "next";
import Link from "next/link";
import DividendCalculator from "./DividendCalculator";
import TargetDividend from "./TargetDividend";

export const metadata: Metadata = {
  title: "고배당 ETF 배당 계산기 — 배당 재투자 복리",
  description:
    "고배당 ETF에 시작 금액과 매월 납입, 배당율·기간을 넣어 배당 재투자(복리)로 얼마가 되는지 계산해 보세요.",
  alternates: { canonical: "/invest/dividend" },
};

export default function DividendPage() {
  return (
    <div className="space-y-6">
      <Link href="/invest" className="text-sm text-indigo-600 hover:underline">
        ← 그때샀으면
      </Link>
      <div>
        <h1 className="text-2xl font-bold">💰 고배당 ETF 배당 계산기</h1>
        <p className="mt-1 text-sm text-slate-500">
          시작 금액과 추가 납입, 배당율·주기·기간을 넣으면 배당을 재투자(복리)해
          얼마가 되는지 계산해 드려요.
        </p>
      </div>
      <DividendCalculator />
      <TargetDividend />
    </div>
  );
}
