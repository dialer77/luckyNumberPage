import type { Metadata } from "next";
import Calculators from "./Calculators";

export const metadata: Metadata = {
  title: "머니계산기 — 당첨금 실수령·복리 계산",
  description:
    "로또 당첨금 세후 실수령액과 복리 이자를 간단히 계산해 보세요.",
  alternates: { canonical: "/calc" },
};

export default function CalcPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🧮 머니계산기</h1>
        <p className="mt-1 text-sm text-slate-500">
          돈과 관련된 계산을 간단히. 필요한 계산기가 하나씩 늘어납니다.
        </p>
      </div>
      <Calculators />
    </div>
  );
}
