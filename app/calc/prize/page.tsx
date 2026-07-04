import type { Metadata } from "next";
import Link from "next/link";
import PrizeCalculator from "../PrizeCalculator";

export const metadata: Metadata = {
  title: "당첨금 실수령액 계산기",
  description:
    "로또·복권 당첨금의 세금과 세후 실수령액을 계산합니다. 3억 이하 22%, 초과분 33% 기준.",
  alternates: { canonical: "/calc/prize" },
};

export default function PrizeCalcPage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>
      <PrizeCalculator />
    </div>
  );
}
