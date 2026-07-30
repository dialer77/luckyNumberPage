import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import NumberBall from "../../components/NumberBall";
import WhatCanYouBuy from "../../components/WhatCanYouBuy";
import {
  getAllDraws,
  formatKRW,
  calcTax,
  afterTax,
  analyzeDraw,
  drawPrizes,
  DRAW_BASELINE,
} from "@/lib/lotto-data";
import { getLiveDraw } from "@/lib/lotto-live";
import { SITE } from "@/lib/brand";

// ─────────────────────────────────────────────────────────────
// 동적 라우트: /lotto/1180, /lotto/1179 ...
// [drwNo] 폴더명이 URL 변수(회차 번호)가 됩니다.
//
// generateStaticParams() 로 "어떤 회차 페이지들을 미리 만들지" 알려주면
// Next.js가 빌드 시점에 회차마다 정적 HTML을 뽑아냅니다.
// → 검색엔진이 각 회차 페이지를 개별적으로 수집 (SEO 유입의 핵심).
// Flutter에는 없는, 웹(SSG) 특유의 강점입니다.
// ─────────────────────────────────────────────────────────────

// 최근 회차(예시 기준)만 미리 생성, 나머지는 요청 시 라이브로 렌더
export function generateStaticParams() {
  return getAllDraws().map((d) => ({ drwNo: String(d.drwNo) }));
}
export const dynamicParams = true;
export const revalidate = 3600;

// 회차별로 <title>/<description>을 다르게 → 검색 결과 노출 최적화
export async function generateMetadata({
  params,
}: PageProps<"/lotto/[drwNo]">): Promise<Metadata> {
  const { drwNo } = await params;
  const draw = await getLiveDraw(Number(drwNo));
  if (!draw) return { title: "회차를 찾을 수 없음" };

  return {
    title: `${draw.drwNo}회 로또 당첨번호 (${draw.drwNoDate})`,
    description: `제 ${draw.drwNo}회 로또 당첨번호는 ${draw.numbers.join(
      ", "
    )} + 보너스 ${draw.bonus}. 1등 당첨금과 세후 실수령액까지 한눈에 확인하세요.`,
    alternates: { canonical: `/lotto/${draw.drwNo}` },
  };
}

export default async function DrawDetailPage({
  params,
}: PageProps<"/lotto/[drwNo]">) {
  const { drwNo } = await params;
  const draw = await getLiveDraw(Number(drwNo));

  // 없는 회차면 404 페이지로
  if (!draw) notFound();

  const numbersText = draw.numbers.join(", ");

  // 이 회차만의 번호 구성 분석 + 등수별 당첨금 (회차마다 다른 고유 데이터)
  const a = analyzeDraw(draw);
  const prizes = drawPrizes(draw);
  const bandLabels = ["1–10", "11–20", "21–30", "31–40", "41–45"];
  const sumVsBase =
    a.sum > DRAW_BASELINE.sum
      ? `이론상 평균(${DRAW_BASELINE.sum})보다 높은`
      : a.sum < DRAW_BASELINE.sum
        ? `이론상 평균(${DRAW_BASELINE.sum})보다 낮은`
        : `이론상 평균(${DRAW_BASELINE.sum})과 같은`;

  return (
    <div className="space-y-6">
      {/* 구조화 데이터: 경로(빵부스러기) → 검색결과 계층 표시 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "행운노트", item: `${SITE.url}/lotto` },
              {
                "@type": "ListItem",
                position: 2,
                name: `${draw.drwNo}회 당첨번호`,
                item: `${SITE.url}/lotto/${draw.drwNo}`,
              },
            ],
          }),
        }}
      />

      <Link href="/lotto" className="text-sm text-indigo-600 hover:underline">
        ← 회차 목록으로
      </Link>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-2xl font-bold">제 {draw.drwNo}회 당첨번호</h1>
        <p className="mt-1 text-sm text-slate-500">{draw.drwNoDate} 추첨</p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {draw.numbers.map((n) => (
            <NumberBall key={n} n={n} size="lg" />
          ))}
          <span className="mx-1 text-slate-400">+</span>
          <NumberBall n={draw.bonus} size="lg" />
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-4">
            <dt className="text-slate-500">1등 당첨자</dt>
            <dd className="mt-1 text-lg font-bold">
              {draw.firstWinnerCount}명
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <dt className="text-slate-500">당첨금 (세전)</dt>
            <dd className="mt-1 text-lg font-bold">
              {formatKRW(draw.firstWinAmount)}
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <dt className="text-slate-500">세금 (약 33%)</dt>
            <dd className="mt-1 text-lg font-bold text-rose-500">
              −{formatKRW(calcTax(draw.firstWinAmount))}
            </dd>
          </div>
          <div className="rounded-lg bg-indigo-50 p-4 ring-1 ring-indigo-100">
            <dt className="text-slate-500">실수령액 (세후)</dt>
            <dd className="mt-1 text-lg font-bold text-indigo-600">
              {formatKRW(afterTax(draw.firstWinAmount))}
            </dd>
          </div>
        </dl>
      </section>

      {/* 등수별 당첨금 — 1등만이 아니라 2~5등까지 (회차별 실데이터) */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-lg font-bold">등수별 당첨금</h2>
        <p className="mt-1 text-sm text-slate-500">
          {draw.drwNo}회 각 등수의 1게임당 당첨금입니다.
        </p>
        <div className="mt-4 overflow-hidden rounded-lg ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left font-medium">등수</th>
                <th className="px-4 py-2 text-left font-medium">조건</th>
                <th className="px-4 py-2 text-right font-medium">
                  1게임당 당첨금
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { rank: 1, cond: "번호 6개 일치" },
                { rank: 2, cond: "번호 5개 + 보너스 일치" },
                { rank: 3, cond: "번호 5개 일치" },
                { rank: 4, cond: "번호 4개 일치" },
                { rank: 5, cond: "번호 3개 일치" },
              ].map(({ rank, cond }) => (
                <tr key={rank}>
                  <td className="px-4 py-2 font-semibold">{rank}등</td>
                  <td className="px-4 py-2 text-slate-500">{cond}</td>
                  <td className="px-4 py-2 text-right font-medium">
                    {formatKRW(prizes[rank])}
                    {rank === 1 && (
                      <span className="ml-1 text-xs text-slate-400">
                        ({draw.firstWinnerCount}명)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          1·2·3등은 판매액과 당첨자 수에 따라 회차마다 달라지고, 4등(5만원)·
          5등(5천원)은 고정입니다. 4·5등은 200만원 이하라 비과세로 전액
          지급됩니다.
        </p>
      </section>

      {/* 이 회차만의 번호 구성 분석 — 6개 번호에서 계산된 고유 지표 */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-lg font-bold">{draw.drwNo}회 번호 구성 분석</h2>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-slate-500">홀짝 비율</dt>
            <dd className="mt-1 font-bold">
              홀 {a.oddCount} : 짝 {a.evenCount}
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-slate-500">고저 비율 (1–22 / 23–45)</dt>
            <dd className="mt-1 font-bold">
              저 {a.lowCount} : 고 {a.highCount}
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-slate-500">번호 합계</dt>
            <dd className="mt-1 font-bold">{a.sum}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-slate-500">최저 ~ 최고 (범위)</dt>
            <dd className="mt-1 font-bold">
              {a.min} ~ {a.max}{" "}
              <span className="font-normal text-slate-400">({a.range})</span>
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-slate-500">연속번호 쌍</dt>
            <dd className="mt-1 font-bold">{a.consecutivePairs}쌍</dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-slate-500">AC값 (0–10)</dt>
            <dd className="mt-1 font-bold">{a.acValue}</dd>
          </div>
        </dl>

        {/* 구간(10단위) 분포 막대 */}
        <div className="mt-5">
          <p className="text-sm text-slate-500">10단위 구간 분포</p>
          <div className="mt-2 space-y-1.5">
            {a.bandCounts.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-14 shrink-0 text-slate-500">
                  {bandLabels[i]}
                </span>
                <div className="h-3 flex-1 rounded bg-slate-100">
                  <div
                    className="h-3 rounded bg-indigo-400"
                    style={{ width: `${(c / 6) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right font-medium">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 검색 유입용 설명 문단 (사람과 검색엔진 모두를 위한 텍스트) */}
      <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
        <p>
          <b>제 {draw.drwNo}회 로또 당첨번호</b>는 {draw.drwNoDate} 추첨에서
          {" "}
          <b>{numbersText}</b>, 보너스 번호는 <b>{draw.bonus}</b>번입니다. 이번
          회차 1등은 {draw.firstWinnerCount}명으로, 1게임당 당첨금은 세전{" "}
          {formatKRW(draw.firstWinAmount)}이며 세금(약 33%)을 공제한 세후
          실수령액은 약 {formatKRW(afterTax(draw.firstWinAmount))}입니다.
        </p>
        <p className="mt-2">
          이 회차의 6개 번호는 <b>홀수 {a.oddCount}개·짝수 {a.evenCount}개</b>,{" "}
          <b>저(1–22) {a.lowCount}개·고(23–45) {a.highCount}개</b>로 구성됐고,
          번호 합계는 <b>{a.sum}</b>으로 {sumVsBase} 값입니다. 연속한 번호는{" "}
          {a.consecutivePairs}쌍, 가장 작은 번호와 큰 번호의 차이(범위)는{" "}
          {a.range}입니다. 번호가 흩어진 정도를 나타내는 AC값은 {a.acValue}
          (최대 10)로{" "}
          {a.acValue >= 7
            ? "번호들이 비교적 고르게 분산된"
            : a.acValue >= 4
              ? "보통 수준으로 분포한"
              : "번호가 다소 몰려 있는"}{" "}
          편입니다.
        </p>
        <p className="mt-2 text-slate-400">
          위 지표는 이미 공개된 추첨 결과를 분석한 통계 정보이며, 특정 번호의
          당첨 가능성을 높여주지 않습니다. 로또는 매 회차 독립적인 추첨이며 본
          페이지는 구매를 권유하지 않습니다.
        </p>
      </div>

      {/* 재미(공유) 요소: 세후 실수령액이면 뭘 살 수 있나 */}
      <WhatCanYouBuy amount={afterTax(draw.firstWinAmount)} />

      {/* 다른 엔진으로 유도 (클릭 도미노) */}
      <p className="text-sm text-slate-500">
        👉 번호가 얼마나 자주 나왔는지 궁금하다면{" "}
        <Link href="/stats" className="text-indigo-600 hover:underline">
          번호 출현 통계
        </Link>
        도 확인해 보세요.
      </p>
    </div>
  );
}
