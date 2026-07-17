import type { Metadata } from "next";
import Link from "next/link";
import NumberBall from "../../components/NumberBall";
import LottoSearch from "../../components/LottoSearch";
import { getLiveRecent, getLiveLatestNo } from "@/lib/lotto-live";

// 회차별 당첨번호 목록 (행운노트 대문에서 한 단계 들어온 페이지).
export const metadata: Metadata = {
  title: "회차별 당첨번호 조회 — 1회부터 최신회까지",
  description:
    "역대 로또 당첨번호를 회차 번호로 검색해 조회하세요. 1회부터 최신 회차까지 당첨번호·보너스·1등 당첨금과 세후 실수령액을 확인할 수 있습니다.",
  alternates: { canonical: "/lotto/list" },
};

export const revalidate = 3600;

export default async function LottoListPage() {
  const [draws, latestNo] = await Promise.all([
    getLiveRecent(30),
    getLiveLatestNo(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/lotto" className="text-sm text-indigo-600 hover:underline">
          ← 행운노트
        </Link>
        <h1 className="mt-2 text-2xl font-bold">회차별 당첨번호</h1>
        <p className="mt-1 text-sm text-slate-500">
          1회부터 최신 {latestNo}회까지 조회할 수 있어요. 아래에서 회차 번호로
          바로 찾거나, 최신 회차부터 훑어보세요.
        </p>
      </div>

      {/* 회차 검색 */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <LottoSearch latestNo={latestNo} />
        <p className="mt-2 text-xs text-slate-400">
          예: 1000 을 입력하면 제 1000회 당첨번호로 이동합니다.
        </p>
      </section>

      <h2 className="text-sm font-semibold text-slate-700">최근 30회</h2>
      <ul className="space-y-3">
        {draws.map((draw) => (
          <li key={draw.drwNo}>
            <Link
              href={`/lotto/${draw.drwNo}`}
              className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 hover:ring-indigo-200"
            >
              <div className="w-20 shrink-0">
                <div className="font-bold">{draw.drwNo}회</div>
                <div className="text-xs text-slate-400">{draw.drwNoDate}</div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {draw.numbers.map((n) => (
                  <NumberBall key={n} n={n} size="sm" />
                ))}
                <span className="mx-0.5 text-slate-300">+</span>
                <NumberBall n={draw.bonus} size="sm" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
