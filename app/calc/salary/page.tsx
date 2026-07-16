import type { Metadata } from "next";
import Link from "next/link";
import SalaryCalculator from "../SalaryCalculator";
import Faq from "../../components/Faq";

export const metadata: Metadata = {
  title: "이직 연봉 계산기 — 월 실수령·누적 소득 차이",
  description:
    "현재 연봉과 이직 후 연봉으로 월 실수령액을 비교하고, 이직으로 벌어지는 누적 소득 차이를 계산합니다.",
  keywords: ["이직 연봉 계산기", "연봉 협상", "연봉 인상 실수령", "이직 소득 차이"],
  alternates: { canonical: "/calc/salary" },
};

const FAQ = [
  {
    q: "연봉을 올려도 실수령은 왜 덜 오르나요?",
    a: "연봉이 오르면 소득세 구간이 높아지고 4대보험도 함께 늘어, 세전 인상액만큼 실수령이 늘지는 않습니다. 이 계산기는 세후(월 실수령) 기준으로 비교해 줍니다.",
  },
  {
    q: "이직으로 벌어지는 소득 차이가 왜 커지나요?",
    a: "연봉은 매년 인상률만큼 복리로 오르기 때문에, 한 번 벌린 연봉 차이는 시간이 갈수록 격차가 더 커집니다. 그래서 초기 연봉 협상이 장기적으로 중요합니다.",
  },
  {
    q: "연봉 협상 전에 무엇을 확인하면 좋나요?",
    a: "제안받은 연봉의 실수령액과, 현재 대비 누적 소득 차이를 함께 보는 게 좋습니다. 실수령이 궁금하면 연봉 실수령액 계산기도 함께 사용해 보세요.",
  },
];

export default function SalaryCalcPage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>
      <SalaryCalculator />
      <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
        <p>
          이직으로 연봉을 올리면 그 차이는 <b>매년 복리처럼 벌어집니다</b>. 인상률이
          같아도 시작 연봉이 높으면 시간이 갈수록 누적 소득 격차가 커지기
          때문이에요. 이 계산기는 현재·이직 후 연봉의 <b>월 실수령액</b>을
          비교하고, 기간에 따른 누적 소득 차이까지 보여줍니다. 세후 실수령이
          궁금하면{" "}
          <Link href="/calc/take-home" className="text-indigo-600 hover:underline">
            연봉 실수령액 계산기
          </Link>
          도 함께 써보세요.
        </p>
      </div>
      <Faq items={FAQ} />
    </div>
  );
}
