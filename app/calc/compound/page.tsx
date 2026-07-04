import type { Metadata } from "next";
import Link from "next/link";
import CompoundCalculator from "../CompoundCalculator";

export const metadata: Metadata = {
  title: "복리 계산기",
  description:
    "원금이 매년 복리로 불어나면 얼마가 되는지 계산합니다. 원금·이율·기간만 넣으면 끝.",
  alternates: { canonical: "/calc/compound" },
};

export default function CompoundCalcPage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>
      <CompoundCalculator />
    </div>
  );
}
