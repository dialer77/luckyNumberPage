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

// 아래 예시·FAQ의 금액은 lib/salary.ts의 calcTakeHome으로 계산한 값입니다
// (본인 1인, 월 비과세 식대 20만원). 계산식이 바뀌면 이 숫자들도 다시 계산해 고치세요.
const FAQ = [
  {
    q: "연봉 실수령액은 어떻게 계산하나요?",
    a: "세전 연봉에서 4대보험(국민연금·건강보험·장기요양·고용보험, 약 9.4%)과 소득세·지방소득세를 뺀 금액이 실수령액입니다. 이 계산기는 근로소득공제·누진세율·세액공제를 대략 반영합니다.",
  },
  {
    q: "실수령률은 보통 얼마인가요?",
    a: "연봉이 높을수록 세율 구간이 올라가 실수령률(실수령/세전)은 낮아집니다. 이 계산기 기준(본인 1인, 식대 월 20만원)으로 연봉 3,000만원은 약 89%, 5,000만원은 약 84%, 1억원은 약 76%입니다.",
  },
  {
    q: "비과세 식대는 무엇인가요?",
    a: "식대 등 일정 비과세 항목은 세금과 4대보험 계산에서 제외되어 실수령액을 늘립니다. 흔히 월 20만원까지 비과세로 처리합니다. 연봉 5,000만원 기준으로 식대 20만원을 넣으면 월 실수령이 350만 2,713원, 0원으로 넣으면 345만 2,563원으로 한 달에 5만원가량 차이 납니다.",
  },
  {
    q: "실제 급여명세서와 차이가 나는 이유는?",
    a: "부양가족 수, 추가 공제(연금저축·의료비 등), 회사별 수당·비과세 항목에 따라 달라지기 때문입니다. 본 계산기는 본인 1인 기준의 대략적인 추정치입니다.",
  },
  {
    q: "연봉이 1,000만원 오르면 실수령은 얼마나 늘어나나요?",
    a: "이 계산기 기준으로 5,000만원에서 6,000만원이 되면 연 실수령이 749만 2,500원(월 약 62만원) 늘어 인상액의 약 75%가 남습니다. 3,000만원 → 4,000만원은 약 77%, 9,000만원 → 1억원은 약 66%가 남아, 연봉이 높을수록 인상분에서 세금으로 나가는 몫이 커집니다.",
  },
  {
    q: "세율 구간이 바뀌면 실수령이 오히려 줄어드나요?",
    a: "아닙니다. 누진세율은 과세표준 가운데 구간을 넘는 부분에만 높은 세율을 매기므로, 경계를 넘었다고 전체 세금이 한꺼번에 뛰지 않습니다. 이 계산기에서는 식대 월 20만원 기준으로 연봉 약 2,682만원부터 15%, 약 6,688만원부터 24%, 약 1억 674만원부터 35% 구간으로 표시가 바뀝니다.",
  },
  {
    q: "이 금액이 매달 월급에서 실제로 떼는 세금인가요?",
    a: "정확히는 아닙니다. 이 계산기는 1년 치 세금을 연 단위 산식으로 구해 12로 나눈 값이라 연말정산을 마친 뒤의 세금에 가까운 개념입니다. 회사가 매달 떼는 소득세는 국세청 간이세액표를 따르므로 이 값과 다를 수 있고, 그 차이는 다음 해 연말정산에서 환급받거나 추가로 냅니다.",
  },
];

// 연봉 5,000만원 단계별 계산 (calcTakeHome 중간값과 동일)
const STEPS: { k: string; v: string }[] = [
  { k: "과세 급여 = 연봉 − 비과세 식대 1년 치(20만원 × 12)", v: "4,760만원" },
  { k: "4대보험 = 과세 급여 × 9.4%", v: "447만 4,400원" },
  { k: "근로소득공제 = 1,200만원 + 4,500만원 초과분 × 5%", v: "1,213만원" },
  { k: "과세표준 = 과세 급여 − 근로소득공제 − 본인 기본공제 150만원", v: "3,397만원" },
  { k: "산출세액 = 과세표준 × 15% − 누진공제 126만원", v: "383만 5,500원" },
  { k: "근로소득세액공제 (계산상 147만 5,650원, 한도 66만원)", v: "−66만원" },
  { k: "소득세", v: "317만 5,500원" },
  { k: "지방소득세 = 소득세 × 10%", v: "31만 7,550원" },
  { k: "연 실수령 = 연봉 − 4대보험 − 소득세 − 지방소득세", v: "4,203만 2,550원" },
  { k: "월 실수령 = 연 실수령 ÷ 12", v: "350만 2,713원" },
];

// 예시 3개 (월 기준)
const EXAMPLES = [
  { salary: "3,000만원", gross: "250만원", ins: "21만 6,200원", tax: "4만 6,744원 + 4,674원", net: "223만 2,382원", rate: "89.3%" },
  { salary: "5,000만원", gross: "416만 6,667원", ins: "37만 2,867원", tax: "26만 4,625원 + 2만 6,463원", net: "350만 2,713원", rate: "84.1%" },
  { salary: "1억원", gross: "833만 3,333원", ins: "76만 4,533원", tax: "110만 7,733원 + 11만 773원", net: "635만 293원", rate: "76.2%" },
];

export default function TakeHomePage() {
  const card =
    "rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100";
  const h2 = "text-base font-bold text-slate-800";
  const link = "text-indigo-600 hover:underline";
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>

      <TakeHomeCalculator />

      <div className={card}>
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

      {/* 계산 방식 — lib/salary.ts calcTakeHome 그대로, 연봉 5,000만원 예시 */}
      <section className={card}>
        <h2 className={h2}>월 실수령액은 이 순서로 계산합니다 (연봉 5,000만원 예시)</h2>
        <p className="mt-2">
          비과세 식대는 세금과 4대보험을 매기는 금액에서만 빠지고, 실수령에는 그대로
          들어갑니다. 근로소득공제와 근로소득세액공제는 총급여 구간마다 공제율과
          한도가 달라, 연봉이 오를수록 공제 효과가 줄어듭니다.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100">
              {STEPS.map((s, i) => (
                <tr key={s.k} className={i === STEPS.length - 1 ? "bg-indigo-50/50 font-semibold" : undefined}>
                  <td className="px-3 py-2">{s.k}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-700">{s.v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 예시 3개 */}
      <section className={card}>
        <h2 className={h2}>연봉별로 비교하면</h2>
        <div className="mt-3 overflow-x-auto rounded-lg ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left font-medium">연봉</th>
                <th className="px-3 py-2 text-right font-medium">월 세전</th>
                <th className="px-3 py-2 text-right font-medium">4대보험</th>
                <th className="px-3 py-2 text-right font-medium">소득세 + 지방세</th>
                <th className="px-3 py-2 text-right font-medium">월 실수령</th>
                <th className="px-3 py-2 text-right font-medium">실수령률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {EXAMPLES.map((r) => (
                <tr key={r.salary}>
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-700">{r.salary}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{r.gross}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{r.ins}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{r.tax}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-indigo-600">{r.net}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{r.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          연봉이 3,000만원에서 1억원으로 3배 넘게 오르는 동안 실수령률은 89.3%에서
          76.2%로 내려갑니다. 1억원은 과세표준이 24% 구간에 들어가고, 근로소득세액공제
          한도도 66만원에서 50만원으로 줄기 때문입니다. 4대보험은 과세 급여에 같은
          비율(9.4%)로 붙으므로, 실수령률 차이는 대부분 소득세에서 생깁니다.
        </p>
      </section>

      {/* 한계 */}
      <section className={card}>
        <h2 className={h2}>계산 결과를 볼 때 알아둘 점</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            부양가족이 없는 본인 1인 기준입니다. 부양가족 기본공제, 자녀세액공제,
            연금저축·보험료·의료비·신용카드 공제가 빠져 있어 실제 연말정산 세금은
            대개 이보다 적습니다.
          </li>
          <li>
            4대보험은 항목별로 따로 계산하지 않고 합계 약 9.4%를 한 번에 곱했으며,
            국민연금 소득 상한 같은 상·하한을 생략했습니다. 연봉이 높을수록 실제
            공제액이 계산보다 적을 수 있고, 보험 요율은 해마다 바뀝니다.
          </li>
          <li>
            소득세 산식과 공제 한도는 세법이 바뀌면 달라집니다. 결과는 2026년 기준
            근사값으로 참고용입니다.
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
            — 4대보험과 소득세 구조, 연봉 협상 팁
          </li>
          <li>
            <Link href="/guide/year-end-tax" className={link}>
              연말정산, &lsquo;13월의 월급&rsquo; 만드는 기초
            </Link>{" "}
            — 공제를 챙겨 세금을 돌려받는 법
          </li>
          <li>
            <Link href="/guide/national-pension" className={link}>
              국민연금, 얼마 내고 얼마 받나 기초 정리
            </Link>{" "}
            — 월급에서 빠지는 연금 보험료의 의미
          </li>
        </ul>
      </section>

      <Faq items={FAQ} />
    </div>
  );
}
