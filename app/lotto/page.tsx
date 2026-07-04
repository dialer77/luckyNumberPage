import type { Metadata } from "next";
import Link from "next/link";
import NumberBall from "../components/NumberBall";
import { formatKRW, afterTax } from "@/lib/lotto-data";
import { getLiveLatest } from "@/lib/lotto-live";
import { LOTTO_FEATURES } from "@/lib/brand";

// 행운노트 서브브랜드 "대문" — 기능들을 카드로 정리해 보여주는 랜딩.
export const metadata: Metadata = {
  title: "행운노트 — 로또·복권",
  description:
    "로또·복권 당첨번호 조회, 번호 통계, 번호 생성기, 1등 도전, 오늘의 랭킹을 한곳에서.",
  alternates: { canonical: "/lotto" },
};

export const revalidate = 3600;

export default async function LottoHomePage() {
  const latest = await getLiveLatest();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🍀 행운노트</h1>
        <p className="mt-1 text-sm text-slate-500">
          로또·복권 당첨번호부터 1등 도전·랭킹까지, 원하는 기능을 골라보세요.
        </p>
      </div>

      {/* 최신 회차 하이라이트 */}
      <Link
        href={`/lotto/${latest.drwNo}`}
        className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 hover:ring-indigo-200"
      >
        <div className="text-xs text-slate-400">
          제 {latest.drwNo}회 · {latest.drwNoDate} 최신 당첨번호
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

      {/* 기능 카드 */}
      <div className="grid gap-3 sm:grid-cols-2">
        {LOTTO_FEATURES.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-2xl">{f.emoji}</span>
            <div>
              <div className="font-semibold">{f.title}</div>
              <div className="mt-0.5 text-sm text-slate-500">{f.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
