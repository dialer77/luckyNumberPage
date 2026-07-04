import type { Metadata } from "next";
import Link from "next/link";
import SalaryCalculator from "../SalaryCalculator";

export const metadata: Metadata = {
  title: "이직 연봉 계산기 — 복리로 벌어지는 소득 차이",
  description:
    "이직으로 올린 연봉은 매년 복리로 벌어집니다. 현재 연봉과 이직 후 연봉, 인상률·기간으로 누적 소득 차이를 계산해 보세요.",
  alternates: { canonical: "/calc/salary" },
};

export default function SalaryCalcPage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>
      <SalaryCalculator />
    </div>
  );
}
