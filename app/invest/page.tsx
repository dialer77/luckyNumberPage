import type { Metadata } from "next";
import Simulator from "./Simulator";

export const metadata: Metadata = {
  title: "그때샀으면 — 그때 샀으면 지금 얼마?",
  description:
    "그때 삼성전자·애플·비트코인을 샀다면 지금 얼마가 됐을까? 금액과 시점을 넣어 수익을 시뮬레이션해 보세요.",
  alternates: { canonical: "/invest" },
};

export default function InvestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📈 그때샀으면</h1>
        <p className="mt-1 text-sm text-slate-500">
          그때 그 종목을 샀다면 지금 얼마가 됐을까요? 금액과 시점을 골라
          확인해 보세요.
        </p>
      </div>
      <Simulator />
    </div>
  );
}
