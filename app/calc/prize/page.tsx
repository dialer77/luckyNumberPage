import type { Metadata } from "next";
import Link from "next/link";
import PrizeCalculator from "../PrizeCalculator";
import Faq from "../../components/Faq";

export const metadata: Metadata = {
  title: "당첨금 실수령액 계산기 — 복권 세금 계산",
  description:
    "로또·복권 당첨금의 세금과 세후 실수령액을 계산합니다. 3억원 이하 22%, 초과분 33% 기준.",
  keywords: ["당첨금 실수령액", "로또 세금 계산기", "복권 세금", "로또 실수령"],
  alternates: { canonical: "/calc/prize" },
};

// 아래 예시·FAQ의 금액은 lib/lotto-data.ts의 calcTax/afterTax로 계산한 값입니다.
// 세율이나 calcTax가 바뀌면 이 숫자들도 다시 계산해 고치세요.
const FAQ = [
  {
    q: "복권 당첨금 세율은 어떻게 되나요?",
    a: "3억원 이하 부분은 22%(소득세 20% + 지방소득세 2%), 3억원 초과 부분은 33%(소득세 30% + 지방소득세 3%)가 과세됩니다.",
  },
  {
    q: "1등에 당첨되면 실제로 얼마를 받나요?",
    a: "당첨금이 20억원이면 3억원까지 22%(6,600만원), 나머지 17억원에 33%(5억 6,100만원)가 붙어 세금이 6억 2,700만원이고, 세후 13억 7,300만원을 받습니다. 금액이 클수록 33%가 붙는 부분이 커져 세금 비중이 30%를 넘습니다.",
  },
  {
    q: "당첨금은 어디서 받나요?",
    a: "소액은 판매점이나 은행, 고액(1등 등)은 농협은행 본점 등 지정 지급처에서 신분증·당첨 복권을 지참해 수령합니다. 세금은 지급 시 원천징수됩니다.",
  },
  {
    q: "3억원을 조금 넘으면 당첨금 전체에 33%가 붙나요?",
    a: "아닙니다. 33%는 3억원을 넘는 부분에만 붙습니다. 3억원이면 세금이 6,600만원이고, 3억 1,000만원이면 여기에 1,000만원 × 33% = 330만원이 더해져 6,930만원입니다. 3억원 경계를 넘었다고 실수령액이 줄어드는 일은 없습니다.",
  },
  {
    q: "200만원을 조금 넘는 당첨금은 오히려 손해인가요?",
    a: "200만원까지는 세금이 없지만, 200만원을 넘으면 넘는 부분이 아니라 당첨금 전체에 22%가 붙습니다. 그래서 210만원에 당첨되면 세금 46만 2,000원을 떼고 163만 8,000원을 받아, 200만원 당첨(세후 200만원)보다 적게 받습니다. 이 계산 기준으로 세후 금액이 다시 200만원을 넘는 건 세전 256만 4,103원부터입니다.",
  },
  {
    q: "당첨금을 받은 뒤 종합소득세를 또 내야 하나요?",
    a: "복권 당첨금은 다른 소득과 합치지 않는 분리과세라, 지급할 때 원천징수되면 세금 문제는 끝납니다. 연말정산이나 5월 종합소득세 신고에 다시 넣지 않아도 됩니다. 다만 받은 돈을 예금하거나 투자해서 생긴 이자·배당에는 따로 세금이 붙습니다.",
  },
];

// 예시: 제1249회(2026-11-07) 1·2·3등 1게임당 당첨금(공개 데이터셋 smok95/lotto).
const EXAMPLES = [
  { rank: "1등 (14명)", gross: "20억 2,504만 5,509원", tax: "6억 3,526만 5,017원", net: "13억 8,978만 492원" },
  { rank: "2등 (93명)", gross: "5,080만 7,594원", tax: "1,117만 7,670원", net: "3,962만 9,924원" },
  { rank: "3등 (3,550명)", gross: "133만 1,016원", tax: "0원", net: "133만 1,016원" },
];

export default function PrizeCalcPage() {
  const card =
    "rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100";
  const h2 = "text-base font-bold text-slate-800";
  const link = "text-indigo-600 hover:underline";
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>
      <PrizeCalculator />
      <div className={card}>
        <p>
          로또·복권 당첨금은 &lsquo;기타소득&rsquo;으로 분류되어 세금이
          부과됩니다. 3억원을 기준으로 이하 22%, 초과분 33%가 적용되어, 세전
          당첨금과 실제 손에 쥐는 금액(세후 실수령액)은 꽤 차이가 나요. 세전
          금액을 넣으면 세금과 실수령액을 바로 확인할 수 있습니다.
        </p>
      </div>

      {/* 계산 방식 — lib/lotto-data.ts calcTax/afterTax 그대로 */}
      <section className={card}>
        <h2 className={h2}>당첨금 세금, 이렇게 계산합니다</h2>
        <p className="mt-2">
          이 계산기는 입력한 금액을 <b>1게임(1장)당 세전 당첨금</b>으로 보고,
          금액 구간에 따라 세금을 매깁니다. 회차별 당첨번호 페이지에 나오는 세후
          금액도 같은 식으로 계산합니다.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <b>200만원 이하</b>: 세금이 없습니다. 4등(5만원)·5등(5천원)과
            대부분의 3등이 여기에 해당합니다.
          </li>
          <li>
            <b>200만원 초과 ~ 3억원 이하</b>: 당첨금 <b>전체</b>에 22%(소득세 20%
            + 지방소득세 2%)를 곱합니다.
          </li>
          <li>
            <b>3억원 초과</b>: 3억원까지는 22%로 6,600만원, 3억원을 넘는 부분에는
            33%(소득세 30% + 지방소득세 3%)를 곱해 더합니다.
          </li>
        </ul>
        <p className="mt-2">
          계산한 세금의 1원 미만은 버리고, 세전 금액에서 세금을 뺀 값이
          실수령액입니다. 3억원 경계는 넘는 부분에만 높은 세율이 붙어 금액이
          매끄럽게 이어지지만, 200만원 경계는 넘는 순간 전체가 과세되기 때문에
          그 바로 위에서는 실수령액이 오히려 200만원보다 적어집니다.
        </p>
      </section>

      {/* 예시 3개 — 실제 회차 */}
      <section className={card}>
        <h2 className={h2}>실제 회차로 계산해 보기 — 제1249회(2026년 11월 7일)</h2>
        <p className="mt-2">
          1249회 추첨의 1·2·3등 1게임당 당첨금을 그대로 넣으면 세 구간이 한 번에
          보입니다.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left font-medium">등수</th>
                <th className="px-3 py-2 text-right font-medium">세전</th>
                <th className="px-3 py-2 text-right font-medium">세금</th>
                <th className="px-3 py-2 text-right font-medium">실수령액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {EXAMPLES.map((r) => (
                <tr key={r.rank}>
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-700">{r.rank}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{r.gross}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-rose-500">{r.tax}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-indigo-600">{r.net}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>
            <b>1등</b>: 3억원 × 22% = 6,600만원에 (20억 2,504만 5,509원 − 3억원) ×
            33% = 5억 6,926만 5,017원을 더해 세금이 6억 3,526만 5,017원입니다.
            당첨금의 31.4%가 세금으로 빠집니다.
          </li>
          <li>
            <b>2등</b>: 3억원 이하라 전체에 22%를 곱해 세금이 1,117만 7,670원입니다.
          </li>
          <li>
            <b>3등</b>: 200만원 이하라 세금 없이 그대로 받습니다.
          </li>
        </ul>
        <p className="mt-2">
          2024년 11월부터 최근 2년(104회) 동안 1등 1게임당 당첨금의 중앙값은 약
          20억 2,618만원이고, 같은 식으로 계산한 세후 금액은 약 13억 9,054만원입니다.
          요즘 1등은 &lsquo;세전 20억 안팎, 실수령 14억 안쪽&rsquo;이 보통이라고
          보면 됩니다.
        </p>
      </section>

      {/* 한계 */}
      <section className={card}>
        <h2 className={h2}>계산 결과를 볼 때 알아둘 점</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            참고용 근사값입니다. 실제 지급 때는 복권 구입비 처리나 원 단위 절사 같은
            세부 규칙이 더해져 실수령액이 소액 다를 수 있습니다.
          </li>
          <li>
            세율(22%·33%)과 비과세 기준(200만원)은 2026년 11월 현재 기준이며,
            세법이 바뀌면 결과도 달라집니다.
          </li>
          <li>
            같은 1등이라도 1게임당 당첨금은 그 회차 판매액과 당첨자 수에 따라 크게
            달라지니, 회차별 금액을 넣어 확인하세요.
          </li>
          <li>
            당첨 여부와 실제 지급액은 동행복권 공식 결과와 지급처 안내로 최종
            확인하세요.
          </li>
        </ul>
        <p className="mt-2 text-slate-500">
          세율 기준과 데이터 출처는{" "}
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
            <Link href="/guide/lotto-tax" className={link}>
              로또 당첨금 세금과 실수령액 완벽 정리
            </Link>{" "}
            — 분리과세, 소액 비과세, 수령 기한까지
          </li>
          <li>
            <Link href="/guide/lotto-biggest-smallest-jackpots" className={link}>
              역대 로또 1등 당첨금 최고·최저 TOP 10
            </Link>{" "}
            — 407억과 4억, 세후로는 얼마였을까
          </li>
          <li>
            <Link href="/guide/lotto-jackpot-real-value" className={link}>
              20년 전 로또 1등 vs 지금 1등
            </Link>{" "}
            — 물가를 반영한 1등 당첨금의 실제 가치
          </li>
        </ul>
      </section>

      <Faq items={FAQ} />
    </div>
  );
}
