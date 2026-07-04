import type { Metadata } from "next";
import Link from "next/link";
import SavingsCalculator from "../SavingsCalculator";

export const metadata: Metadata = {
  title: "적금·예금 계산기 — 세후 만기 수령액",
  description:
    "정기적금·정기예금의 세전 이자와 세후(15.4% 과세) 만기 수령액을 간단히 계산해 보세요.",
  alternates: { canonical: "/calc/savings" },
};

export default function SavingsCalcPage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>
      <SavingsCalculator />
    </div>
  );
}
