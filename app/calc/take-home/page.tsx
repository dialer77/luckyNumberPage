import type { Metadata } from "next";
import Link from "next/link";
import TakeHomeCalculator from "../TakeHomeCalculator";
import Faq from "../../components/Faq";

export const metadata: Metadata = {
  title: "연봉 실수령액 계산기 — 2026 세후 월급 계산",
  description:
    "연봉을 넣으면 4대보험과 소득세를 뗀 월 실수령액을 바로 계산합니다. 3천·4천·5천만원 등 연봉별 세후 월급을 확인하세요.",
  keywords: ["연봉 실수령액 계산기", "실수령액", "세후 월급", "연봉 계산기", "4대보험 계산"],
  alternates: { canonical: "/calc/take-home" },
};

const FAQ = [
  {
    q: "연봉 실수령액은 어떻게 계산하나요?",
    a: "세전 연봉에서 4대보험(국민연금·건강보험·장기요양·고용보험, 약 9.4%)과 소득세·지방소득세를 뺀 금액이 실수령액입니다. 이 계산기는 근로소득공제·누진세율·세액공제를 대략 반영합니다.",
  },
  {
    q: "실수령률은 보통 얼마인가요?",
    a: "연봉이 높을수록 세율 구간이 올라가 실수령률(실수령/세전)은 낮아집니다. 대략 연봉 3~4천만원대는 약 85~88%, 1억원대는 약 75~78% 수준입니다.",
  },
  {
    q: "비과세 식대는 무엇인가요?",
    a: "식대 등 일정 비과세 항목은 세금과 4대보험 계산에서 제외되어 실수령액을 늘립니다. 흔히 월 20만원까지 비과세로 처리합니다.",
  },
  {
    q: "실제 급여명세서와 차이가 나는 이유는?",
    a: "부양가족 수, 추가 공제(연금저축·의료비 등), 회사별 수당·비과세 항목에 따라 달라지기 때문입니다. 본 계산기는 본인 1인 기준의 대략적인 추정치입니다.",
  },
];

export default function TakeHomePage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>

      <TakeHomeCalculator />

      <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
        <p>
          <b>연봉 실수령액</b>은 세전 연봉에서 4대보험료와 소득세·지방소득세를
          공제한 뒤 실제로 통장에 들어오는 금액입니다. 같은 연봉이라도 비과세
          항목·부양가족·추가 공제에 따라 실수령액이 달라지기 때문에, 이직이나
          연봉 협상 전에 미리 세후 월급을 가늠해 보는 것이 좋습니다.
        </p>
        <p className="mt-2">
          연봉이 오를수록 적용되는 소득세율 구간(6%~45%)이 높아져, 세전 인상액만큼
          실수령이 늘지는 않는다는 점도 알아두면 좋아요.
        </p>
      </div>

      <Faq items={FAQ} />
    </div>
  );
}
