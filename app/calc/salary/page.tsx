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

// 아래 예시·FAQ의 금액은 lib/salary.ts의 calcTakeHome과 app/calc/SalaryCalculator.tsx의
// 누적 계산(첫해 그대로, 이후 매년 인상률 복리, 세전 합계)으로 낸 값입니다.
// 계산식이 바뀌면 이 숫자들도 다시 계산해 고치세요.
const FAQ = [
  {
    q: "연봉을 올려도 실수령은 왜 덜 오르나요?",
    a: "연봉이 오르면 소득세 구간이 높아지고 4대보험도 함께 늘어, 세전 인상액만큼 실수령이 늘지는 않습니다. 예를 들어 4,000만원에서 5,000만원으로 오르면 월 세전은 약 83만원 늘지만 월 실수령은 약 63만원 늘어납니다. 이 계산기의 월 실수령 비교는 세후 기준입니다.",
  },
  {
    q: "이직으로 벌어지는 소득 차이가 왜 커지나요?",
    a: "연봉은 매년 인상률만큼 복리로 오르기 때문에, 한 번 벌린 연봉 차이는 시간이 갈수록 격차가 더 커집니다. 그래서 초기 연봉 협상이 장기적으로 중요합니다.",
  },
  {
    q: "연봉 협상 전에 무엇을 확인하면 좋나요?",
    a: "제안받은 연봉의 실수령액과, 현재 대비 누적 소득 차이를 함께 보는 게 좋습니다. 실수령이 궁금하면 연봉 실수령액 계산기도 함께 사용해 보세요.",
  },
  {
    q: "누적 소득 차이는 세전인가요, 세후인가요?",
    a: "세전 연봉을 더한 값입니다. 세금과 4대보험을 떼면 실제로 손에 남는 차이는 더 작습니다. 4,000만원 → 5,000만원(인상률 4%, 10년) 예시에서 세전 누적 차이는 1억 2,006만원이지만, 해마다 세후 금액을 구해 더하면 약 8,964만원입니다. 연봉이 높을수록 세후로 남는 비율이 낮아집니다.",
  },
  {
    q: "인상률은 몇 %로 넣어야 하나요?",
    a: "지금 회사에서 실제로 받아 온 평균 인상률을 넣는 것이 가장 현실적입니다. 이 계산기는 현재 회사와 이직할 회사에 같은 인상률을 적용하므로, 이직할 곳의 인상률이 다를 것 같다면 결과를 그만큼 가감해서 보세요. 인상률을 0%로 넣으면 누적 차이는 단순히 '연봉 차이 × 기간'이 됩니다.",
  },
  {
    q: "성과급이나 퇴직금도 반영되나요?",
    a: "반영하지 않습니다. 입력한 연봉만으로 계산하므로 성과급·사이닝 보너스·복지 포인트·퇴직금은 따로 따져야 합니다. 특히 연봉에 퇴직금이 포함된 계약인지에 따라 같은 숫자라도 실제 소득이 달라지니 계약서를 확인하세요. 퇴직금은 머니계산기의 퇴직금 계산기로 따로 계산해 볼 수 있습니다.",
  },
];

// 예시 3개 (월 실수령은 비과세 식대 월 20만원 기준)
const EXAMPLES = [
  {
    move: "4,000만원 → 5,000만원",
    cond: "4% · 10년",
    pay: "287만 2,123원 → 350만 2,713원",
    diff: "+63만 590원",
    sum: "1억 2,006만 1,071원",
  },
  {
    move: "3,000만원 → 3,500만원",
    cond: "3% · 5년",
    pay: "223만 2,382원 → 255만 6,433원",
    diff: "+32만 4,051원",
    sum: "2,654만 5,679원",
  },
  {
    move: "8,000만원 → 1억원",
    cond: "3% · 10년",
    pay: "525만 8,293원 → 635만 293원",
    diff: "+109만 2,000원",
    sum: "2억 2,927만 7,586원",
  },
];

export default function SalaryCalcPage() {
  const card =
    "rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100";
  const h2 = "text-base font-bold text-slate-800";
  const link = "text-indigo-600 hover:underline";
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>
      <SalaryCalculator />
      <div className={card}>
        <p>
          이직으로 연봉을 올리면 그 차이는 <b>매년 복리처럼 벌어집니다</b>. 인상률이
          같아도 시작 연봉이 높으면 시간이 갈수록 누적 소득 격차가 커지기
          때문이에요. 이 계산기는 현재·이직 후 연봉의 <b>월 실수령액</b>을
          비교하고, 기간에 따른 누적 소득 차이까지 보여줍니다. 세후 실수령이
          궁금하면{" "}
          <Link href="/calc/take-home" className={link}>
            연봉 실수령액 계산기
          </Link>
          도 함께 써보세요.
        </p>
      </div>

      {/* 계산 방식 — SalaryCalculator.tsx + lib/salary.ts 그대로 */}
      <section className={card}>
        <h2 className={h2}>이직 연봉 계산기는 이렇게 계산합니다</h2>
        <p className="mt-2">
          <b>① 월 실수령 비교</b> — 두 연봉 각각에 연봉 실수령액 계산기와 같은 식을
          씁니다. 월 비과세 식대 20만원을 뺀 과세 급여에 4대보험 근로자
          부담분(약 9.4%)을 매기고, 근로소득공제 → 본인 기본공제 150만원 →
          누진세율(6~45%) → 근로소득세액공제 순서로 소득세를 구한 뒤
          지방소득세(소득세의 10%)를 더합니다. 연봉에서 이 세 가지를 뺀 연
          실수령액을 12로 나눈 값이 월 실수령입니다.
        </p>
        <p className="mt-2">
          <b>② 누적 소득 차이</b> — 첫해는 입력한 연봉 그대로, 다음 해부터 매년 같은
          인상률만큼 오른다고 보고 기간 동안의 연봉을 모두 더합니다. 두 연봉에 같은
          인상률을 쓰므로, 인상률이 4%라면 누적 차이는 &lsquo;처음 연봉 차이 × (1 +
          1.04 + 1.04² + …)&rsquo;꼴이 되어 10년이면 처음 연봉 차이의 약 12배입니다.
          이 누적 금액은 <b>세전 연봉 기준</b>입니다.
        </p>
      </section>

      {/* 예시 3개 */}
      <section className={card}>
        <h2 className={h2}>예시로 보기</h2>
        <div className="mt-3 overflow-x-auto rounded-lg ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left font-medium">연봉 변화</th>
                <th className="px-3 py-2 text-left font-medium">인상률·기간</th>
                <th className="px-3 py-2 text-right font-medium">월 실수령</th>
                <th className="px-3 py-2 text-right font-medium">월 차이</th>
                <th className="px-3 py-2 text-right font-medium">누적 차이(세전)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {EXAMPLES.map((r) => (
                <tr key={r.move}>
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-700">{r.move}</td>
                  <td className="whitespace-nowrap px-3 py-2">{r.cond}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{r.pay}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-indigo-600">{r.diff}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{r.sum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          세 경우 모두 월 세전 급여는 각각 83만 3,334원, 41만 6,667원, 166만
          6,666원 늘지만, 실수령으로 남는 건 75.7%, 77.8%, 65.5%입니다. 8,000만원
          → 1억원은 늘어난 금액이 전부 소득세 24% 구간에 걸리기 때문에 남는 비율이
          가장 낮습니다.
        </p>
        <p className="mt-2">
          누적 차이도 세후로 보면 줄어듭니다. 첫 번째 예시에서 해마다 오른 연봉의
          세후 금액을 같은 식으로 구해 더하면 10년 누적 차이는 약 8,964만원으로,
          세전 차이 1억 2,006만원의 약 75%입니다.
        </p>
      </section>

      {/* 한계 */}
      <section className={card}>
        <h2 className={h2}>계산 결과를 볼 때 알아둘 점</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            월 실수령은 부양가족이 없는 본인 1인 기준의 근사값입니다. 부양가족·연금저축
            같은 추가 공제는 빠져 있어 실제 세금은 대개 이보다 조금 적습니다.
          </li>
          <li>
            두 회사의 인상률이 같고 매년 일정하다고 가정합니다. 실제 인상률은
            회사·연차·성과에 따라 달라 누적 차이도 크게 달라질 수 있습니다.
          </li>
          <li>
            성과급·사이닝 보너스·복지·퇴직금은 계산에 넣지 않습니다.
          </li>
          <li>
            4대보험은 단일 요율로 어림했고 보험료 상·하한은 생략했습니다. 세법이나
            보험 요율이 바뀌면 결과도 달라집니다.
          </li>
        </ul>
        <p className="mt-2 text-slate-500">
          세율과 공제 기준은{" "}
          <Link href="/data-sources" className={link}>
            데이터 출처와 계산 기준
          </Link>
          에 정리해 두었습니다.
        </p>
      </section>

      {/* 관련 가이드 */}
      <section className={card}>
        <h2 className={h2}>함께 보면 좋은 글</h2>
        <ul className="mt-2 space-y-1.5">
          <li>
            <Link href="/guide/salary-net-pay" className={link}>
              연봉 실수령액, 왜 생각보다 적을까?
            </Link>{" "}
            — 4대보험과 소득세 구조, 실수령률
          </li>
          <li>
            <Link href="/guide/year-end-tax" className={link}>
              연말정산, &lsquo;13월의 월급&rsquo; 만드는 기초
            </Link>{" "}
            — 매달 뗀 세금이 어떻게 정산되는지
          </li>
          <li>
            <Link href="/guide/severance-guide" className={link}>
              퇴직금, 얼마나 받을까? 계산법과 세금
            </Link>{" "}
            — 이직 전에 챙겨 볼 퇴직금
          </li>
        </ul>
      </section>

      <Faq items={FAQ} />
    </div>
  );
}
