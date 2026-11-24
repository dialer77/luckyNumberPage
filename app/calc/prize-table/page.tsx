import type { Metadata } from "next";
import Link from "next/link";
import Faq from "../../components/Faq";
import { calcTax, afterTax } from "@/lib/lotto-data";
import { wonFull } from "@/lib/salary";

export const metadata: Metadata = {
  title: "2026 로또 당첨금 실수령액 표 — 1억~100억 세금·실효세율",
  description:
    "로또·복권 당첨금 1억원부터 100억원까지 세금(3억 이하 22%, 초과분 33%)과 세후 실수령액, 실효세율을 표로 정리했습니다. 요즘 1등 수준인 20억원 안팎과 2·3등 금액, 연금복권720+ 1등과의 비교도 함께 담았습니다.",
  keywords: [
    "로또 실수령액 표",
    "당첨금 실수령액 표",
    "2026 로또 실수령액",
    "로또 1등 실수령액",
    "로또 당첨금 세금",
    "복권 당첨금 세금",
  ],
  alternates: { canonical: "/calc/prize-table" },
};

// 표의 모든 숫자는 lib/lotto-data.ts 의 calcTax/afterTax 로 빌드 때 계산한다(당첨금 실수령액 계산기와 같은 식).
// 세율이 바뀌면 lib/lotto-data.ts 만 고치면 이 표도 함께 바뀐다.
const EOK = 100_000_000;
const THRESHOLD = 3 * EOK; // 33%가 붙기 시작하는 경계 (lib/lotto-data.ts 와 같은 값)
const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;

type Row = { gross: number; tax: number; net: number; rate: number; highPart: number };

function row(gross: number): Row {
  const tax = calcTax(gross);
  // 세금 중 3억원 초과분(33%)에서 나온 몫 = 전체 세금 − 3억원까지의 세금
  const highPart = gross > THRESHOLD ? tax - calcTax(THRESHOLD) : 0;
  return { gross, tax, net: afterTax(gross), rate: gross > 0 ? tax / gross : 0, highPart };
}

// 1억 ~ 20억은 1억 단위, 25억 ~ 50억은 5억 단위, 60억 ~ 100억은 10억 단위
const BANDS: { id: string; title: string; rows: Row[] }[] = [
  { id: "1-10", title: "1억원 ~ 10억원", rows: Array.from({ length: 10 }, (_, i) => row((1 + i) * EOK)) },
  { id: "11-20", title: "11억원 ~ 20억원 (요즘 1등 수준)", rows: Array.from({ length: 10 }, (_, i) => row((11 + i) * EOK)) },
  { id: "25-50", title: "25억원 ~ 50억원", rows: [25, 30, 35, 40, 45, 50].map((n) => row(n * EOK)) },
  { id: "60-100", title: "60억원 ~ 100억원", rows: [60, 70, 80, 90, 100].map((n) => row(n * EOK)) },
];
const SUMMARY = [1, 3, 5, 10, 15, 20, 30, 50, 100].map((n) => row(n * EOK));
// 1억원 미만 — 2등(대개 수천만원)·3등(대개 100만원대) 수준과 200만원 비과세 경계
const SMALL = [1_500_000, 2_000_000, 2_100_000, 3_000_000, 5_000_000, 10_000_000, 30_000_000, 50_000_000, 70_000_000].map(row);

const HIGHLIGHT = 20 * EOK; // 요즘 1등 1게임당 당첨금이 대개 이 언저리

// 실제 회차 예시: 제1249회(2026-11-07) 1등 1게임당 당첨금 (공개 데이터셋 smok95/lotto, /calc/prize 예시와 같은 회차)
const DRAW_1249 = { drwNo: 1249, date: "2026년 11월 7일", gross: 2_025_045_509 };
const d1249 = row(DRAW_1249.gross);

// 연금복권720+ 1등: 월 700만원 × 20년(240개월). 매달 지급액마다 22% 원천징수(지급액이 3억원 이하이므로 calcTax 와 같은 결과).
const PENSION_MONTHLY = 7_000_000;
const PENSION_MONTHS = 240;
const pensionGross = PENSION_MONTHLY * PENSION_MONTHS;
const pensionMonthlyNet = afterTax(PENSION_MONTHLY);
const pensionNet = pensionMonthlyNet * PENSION_MONTHS;
const lumpSame = row(pensionGross); // 같은 세전 총액을 로또처럼 한 번에 받는다면

const r1 = row(1 * EOK);
const r3 = row(3 * EOK);
const r10 = row(10 * EOK);
const r20 = row(20 * EOK);
const r100 = row(100 * EOK);
const s5000 = row(50_000_000);
const s210 = row(2_100_000);

const FAQ = [
  {
    q: "로또 1등 20억원이면 실수령액은 얼마인가요?",
    a: `세전 20억원이면 3억원까지 22%(${wonFull(calcTax(THRESHOLD))}), 나머지 17억원에 33%(${wonFull(r20.highPart)})가 붙어 세금이 ${wonFull(r20.tax)}이고, 실수령액은 ${wonFull(r20.net)}입니다. 실효세율은 ${pct(r20.rate)}입니다.`,
  },
  {
    q: "당첨금이 아주 크면 세금이 33%가 되나요?",
    a: `아닙니다. 33%는 3억원을 넘는 부분에만 붙고 3억원까지는 22%라, 실효세율은 33%에 가까워질 뿐 넘지 않습니다. 10억원은 ${pct(r10.rate)}, 100억원도 ${pct(r100.rate)}입니다.`,
  },
  {
    q: "로또 2등 당첨금은 세금을 얼마나 떼나요?",
    a: `2등 1게임당 당첨금은 회차마다 다르지만 대개 수천만원이라 3억원 이하 구간입니다. 당첨금 전체에 22%가 붙어, 예를 들어 5,000만원이면 세금 ${wonFull(s5000.tax)}을 떼고 ${wonFull(s5000.net)}을 받습니다.`,
  },
  {
    q: "200만원을 조금 넘는 당첨금은 왜 세후가 더 적나요?",
    a: `200만원까지는 비과세지만, 200만원을 넘으면 넘는 부분이 아니라 당첨금 전체에 22%가 붙기 때문입니다. 210만원이면 세금 ${wonFull(s210.tax)}을 떼고 ${wonFull(s210.net)}을 받아, 200만원 당첨(세후 200만원)보다 적습니다.`,
  },
  {
    q: "연금복권720+ 1등과 비교하면 어떤가요?",
    a: `연금복권720+ 1등은 월 ${wonFull(PENSION_MONTHLY)} × 20년(세전 ${wonFull(pensionGross)})이고, 매달 받는 금액마다 22%만 떼서 세후 월 ${wonFull(pensionMonthlyNet)}, 20년 합계 ${wonFull(pensionNet)}입니다. 같은 ${wonFull(pensionGross)}을 로또처럼 한 번에 받으면 세후 ${wonFull(lumpSame.net)}이라 세금은 연금복권이 적지만, 20년에 나눠 받는 만큼 지금 돈 가치로는 더 작습니다.`,
  },
  {
    q: "당첨금을 받은 뒤 세금 신고를 또 해야 하나요?",
    a: "복권 당첨금은 다른 소득과 합치지 않는 분리과세라, 지급할 때 원천징수되면 세금 문제는 끝납니다. 종합소득세 신고에 다시 넣지 않아도 됩니다. 다만 받은 돈을 예금하거나 투자해서 생긴 이자·배당에는 따로 세금이 붙습니다.",
  },
];

const card =
  "rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100";
const h2 = "text-base font-bold text-slate-800";
const link = "text-indigo-600 hover:underline";
const th = "px-3 py-2 font-medium whitespace-nowrap";
const td = "px-3 py-1.5 text-right tabular-nums whitespace-nowrap";

function RowsTable({ rows, showHigh = true }: { rows: Row[]; showHigh?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-lg ring-1 ring-slate-100">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            {/* 휴대폰에서도 핵심(실수령액)이 먼저 보이도록 세전 금액 바로 옆에 둔다 */}
            <th className={`${th} text-left`}>세전 당첨금</th>
            <th className={`${th} text-right`}>실수령액</th>
            <th className={`${th} text-right`}>실효세율</th>
            <th className={`${th} text-right`}>세금 합계</th>
            {showHigh && <th className={`${th} text-right`}>그중 33% 부분</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((r) => {
            const hot = r.gross === HIGHLIGHT;
            return (
              <tr key={r.gross} className={hot ? "bg-indigo-50/60" : undefined}>
                <td className="px-3 py-1.5 font-medium whitespace-nowrap text-slate-700">
                  {wonFull(r.gross)}
                  {hot && <span className="ml-1.5 text-xs font-normal text-indigo-500">요즘 1등 수준</span>}
                </td>
                <td className={`${td} font-semibold text-indigo-600`}>{wonFull(r.net)}</td>
                <td className={td}>{pct(r.rate)}</td>
                <td className={`${td} text-rose-500`}>{wonFull(r.tax)}</td>
                {showHigh && <td className={td}>{wonFull(r.highPart)}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function PrizeTablePage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>

      <div>
        <h1 className="text-2xl font-bold leading-snug">🎯 2026 로또 당첨금 실수령액 표</h1>
        <p className="mt-1 text-sm text-slate-500">
          세전 1억원 ~ 100억원 · 1게임(1장)당 당첨금 기준 · 3억원 이하 22%, 초과분 33%
        </p>
      </div>

      <section className={card}>
        <p>
          로또·복권 당첨금에서 세금을 떼고 실제로 손에 쥐는 금액을 정리했습니다. 세전 1억원은{" "}
          {wonFull(r1.net)}, 10억원은 {wonFull(r10.net)}, 요즘 1등 수준인 20억원은{" "}
          <b className="text-slate-800">{wonFull(r20.net)}</b>을 받습니다. 3억원을 넘는 부분에
          33%가 붙기 때문에 실효세율은 3억원까지 {pct(r3.rate)}이다가 20억원이면 {pct(r20.rate)},
          100억원이면 {pct(r100.rate)}까지 올라갑니다.
        </p>
        <p className="mt-2">
          세금은 200만원 이하 비과세, 200만원 초과 ~ 3억원 이하는 당첨금 전체에 22%(소득세 20% +
          지방소득세 2%), 3억원 초과분에는 33%(소득세 30% + 지방소득세 3%)로 계산하고 1원 미만은
          버렸습니다. 금액은 <b>1게임(1장)당</b> 당첨금 기준이라, 같은 회차 1등을 여러 장 맞혔다면
          장마다 따로 계산합니다.
        </p>
        <p className="mt-2 text-slate-500">
          표에 없는 금액은{" "}
          <Link href="/calc/prize" className={link}>
            당첨금 실수령액 계산기
          </Link>
          에 넣어 바로 계산할 수 있습니다.
        </p>
      </section>

      <section className={card}>
        <h2 className={h2}>한눈에 보기 (주요 금액)</h2>
        <div className="mt-3">
          <RowsTable rows={SUMMARY} />
        </div>
        <p className="mt-3 text-xs text-slate-400">
          실효세율 = 세금 합계 ÷ 세전 당첨금. &lsquo;그중 33% 부분&rsquo;은 세금 가운데 3억원을 넘는
          금액에서 나온 몫입니다.
        </p>
      </section>

      <section className={card}>
        <h2 className={h2}>
          실제 회차로 보면 — 제{DRAW_1249.drwNo}회({DRAW_1249.date}) 1등
        </h2>
        <p className="mt-2">
          이 회차 1등 1게임당 당첨금은 세전 {wonFull(d1249.gross)}입니다. 세금{" "}
          {wonFull(d1249.tax)}(실효세율 {pct(d1249.rate)})을 떼면 실수령액은{" "}
          <b className="text-slate-800">{wonFull(d1249.net)}</b>입니다. 1등 금액은 그 회차 판매액과
          당첨자 수에 따라 달라지지만, 요즘은 대개 세전 20억원 안팎이라 위 표의 20억원 줄 언저리를
          보면 됩니다. 역대 회차 금액은{" "}
          <Link href="/guide/lotto-biggest-smallest-jackpots" className={link}>
            역대 1등 당첨금 최고·최저 TOP 10
          </Link>
          에 정리해 두었습니다.
        </p>
      </section>

      <nav className="flex flex-wrap gap-2 text-sm" aria-label="당첨금 구간 바로가기">
        {BANDS.map((b) => (
          <a
            key={b.id}
            href={`#band-${b.id}`}
            className="rounded-full bg-white px-3 py-1 text-slate-600 ring-1 ring-slate-200 hover:ring-indigo-300"
          >
            {b.title.replace(" (요즘 1등 수준)", "")}
          </a>
        ))}
        <a
          href="#band-small"
          className="rounded-full bg-white px-3 py-1 text-slate-600 ring-1 ring-slate-200 hover:ring-indigo-300"
        >
          1억원 미만
        </a>
      </nav>

      {BANDS.map((b) => (
        <section key={b.id} id={`band-${b.id}`} className={card}>
          <h2 className={h2}>세전 {b.title}</h2>
          <div className="mt-3">
            <RowsTable rows={b.rows} />
          </div>
        </section>
      ))}

      <section id="band-small" className={card}>
        <h2 className={h2}>1억원 미만 (2·3등 수준)</h2>
        <p className="mt-2">
          2등 1게임당 당첨금은 대개 수천만원, 3등은 100만원대라 이 구간에 들어갑니다. 4등(5만원)과
          5등(5천원)은 세금이 없습니다. 200만원을 넘는 순간 당첨금 전체에 22%가 붙어, 210만원은
          200만원보다 세후 금액이 적습니다.
        </p>
        <div className="mt-3">
          <RowsTable rows={SMALL} showHigh={false} />
        </div>
      </section>

      <section className={card}>
        <h2 className={h2}>연금복권720+ 1등과 비교</h2>
        <p className="mt-2">
          연금복권720+ 1등은 월 {wonFull(PENSION_MONTHLY)}씩 20년(세전 합계 {wonFull(pensionGross)})을
          받고, 매달 지급액마다 22%만 떼서 세후 월 {wonFull(pensionMonthlyNet)}, 20년 합계{" "}
          {wonFull(pensionNet)}입니다. 같은 {wonFull(pensionGross)}을 로또처럼 한 번에 받으면 세후{" "}
          {wonFull(lumpSame.net)}(실효세율 {pct(lumpSame.rate)})이라 세금은 연금복권이 적지만, 20년에
          걸쳐 나눠 받으니 지금 돈 가치로는 그보다 작습니다. 자세한 비교는{" "}
          <Link href="/guide/pension-lottery" className={link}>
            연금복권, 로또와 뭐가 다를까
          </Link>
          에 있습니다.
        </p>
      </section>

      <section className={card}>
        <h2 className={h2}>표를 볼 때 알아둘 점</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            세율(22%·33%)과 비과세 기준(200만원)은 2026년 11월 현재 기준이며, 세법이 바뀌면 금액도
            달라집니다.
          </li>
          <li>
            참고용 계산입니다. 실제 지급 때는 원 단위 절사 같은 세부 규칙으로 실수령액이 소액 다를 수
            있고, 최종 금액은 동행복권 공식 결과와 지급처 안내로 확인하세요.
          </li>
          <li>
            연금복권720+ 1등 금액(월 700만원 × 20년)은 2026년 11월 현재 판매 중인 상품 기준이며,
            운영 정책에 따라 바뀔 수 있습니다.
          </li>
          <li>
            이 표는 세금 계산을 돕기 위한 자료이며 복권 구매를 권하는 글이 아닙니다. 계산 기준은{" "}
            <Link href="/data-sources" className={link}>
              데이터 출처와 계산 기준
            </Link>
            에 있습니다.
          </li>
        </ul>
      </section>

      <section className={card}>
        <h2 className={h2}>함께 보면 좋은 글</h2>
        <ul className="mt-2 space-y-1.5">
          <li>
            <Link href="/calc/prize" className={link}>
              당첨금 실수령액 계산기
            </Link>{" "}
            — 원하는 금액을 넣어 세금 계산
          </li>
          <li>
            <Link href="/guide/lotto-tax" className={link}>
              로또 당첨금 세금과 실수령액 완벽 정리
            </Link>{" "}
            — 분리과세, 소액 비과세, 수령 기한까지
          </li>
          <li>
            <Link href="/guide/lotto-claim-process" className={link}>
              로또 1등 당첨되면? 수령 절차와 주의사항
            </Link>{" "}
            — 지급처, 준비물, 수령 기한
          </li>
        </ul>
      </section>

      <Faq items={FAQ} />
    </div>
  );
}
