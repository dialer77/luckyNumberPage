import type { Metadata } from "next";
import Link from "next/link";
import NumberBall from "./components/NumberBall";
import { getLatestDraw, formatKRW, afterTax } from "@/lib/lotto-data";
import { SITE, SUB_BRANDS } from "@/lib/brand";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// 우산 허브 홈.
// 상단: "만약에" 브랜드 소개 → 서브브랜드 3종 진입 카드 → 행운노트 스포트라이트.

export default function HomePage() {
  const latest = getLatestDraw();

  return (
    <div className="space-y-12">
      {/* ── 히어로: 우산 브랜드 ── */}
      <section className="text-center">
        <div className="text-4xl">{SITE.emoji}</div>
        <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">만약에, 얼마?</h1>
        <p className="mx-auto mt-3 max-w-sm text-pretty text-sm leading-relaxed text-slate-500">
          로또에 당첨되면, 그때 그 주식을 샀으면, 세금을 떼면 —
          <br />
          <b className="text-slate-700">&lsquo;만약에 얼마?&rsquo;</b>를 재미로
          확인하는 곳이에요.
        </p>
      </section>

      {/* ── 서브브랜드 진입 카드 ── */}
      <section className="grid gap-4 sm:grid-cols-3">
        {SUB_BRANDS.map((brand) =>
          brand.status === "live" && brand.href ? (
            <Link
              key={brand.key}
              href={brand.href}
              className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-3xl">{brand.emoji}</div>
              <div className="mt-2 font-bold">{brand.name}</div>
              <div className="mt-1 text-sm text-slate-500">{brand.tagline}</div>
            </Link>
          ) : (
            <div
              key={brand.key}
              className="flex flex-col rounded-2xl border border-dashed border-slate-200 bg-white/50 p-5"
            >
              <div className="text-3xl grayscale">{brand.emoji}</div>
              <div className="mt-2 font-bold text-slate-500">
                {brand.name}
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-400">
                  준비 중
                </span>
              </div>
              <div className="mt-1 text-sm text-slate-400">{brand.tagline}</div>
            </div>
          )
        )}
      </section>

      {/* ── 행운노트 스포트라이트: 최신 회차 ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-500">
          🍀 이번 주 로또 당첨번호
        </h2>
        <Link
          href={`/lotto/${latest.drwNo}`}
          className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 hover:ring-indigo-200"
        >
          <div className="text-xs text-slate-400">
            제 {latest.drwNo}회 · {latest.drwNoDate}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {latest.numbers.map((n) => (
              <NumberBall key={n} n={n} size="md" />
            ))}
            <span className="mx-1 text-slate-300">+</span>
            <NumberBall n={latest.bonus} size="md" />
          </div>
          <div className="mt-3 text-sm text-slate-500">
            세후 실수령{" "}
            <span className="font-semibold text-indigo-600">
              {formatKRW(afterTax(latest.firstWinAmount))}
            </span>
          </div>
        </Link>
      </section>
    </div>
  );
}
