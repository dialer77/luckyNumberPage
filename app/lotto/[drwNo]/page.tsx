import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import NumberBall from "../../components/NumberBall";
import WhatCanYouBuy from "../../components/WhatCanYouBuy";
import { getAllDraws, formatKRW, calcTax, afterTax } from "@/lib/lotto-data";
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
        <p className="mt-2 text-slate-400">
          당첨번호는 이미 공개된 추첨 결과를 정리한 정보이며, 구매를 권유하지
          않습니다.
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
