import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import PlayBox from "./PlayBox";
import { rankName } from "@/lib/challenge";
import { formatKRW } from "@/lib/lotto-data";
import { getLiveLatest } from "@/lib/lotto-live";
import {
  getTodayLeaderboard,
  getHallOfFame,
  kstDateKey,
  TRIES_PER_DAY,
  type LbEntry,
} from "@/lib/leaderboard";
import { redis } from "@/lib/redis";

export const metadata: Metadata = {
  alternates: { canonical: "/ranking" },
  title: "오늘의 랭킹 — 로또 1,000게임 모의 도전 기록",
  description:
    "최신 회차 당첨번호를 목표로 가상의 1,000게임을 자동으로 돌려 본 모의 실험 기록입니다. 실제 돈은 오가지 않으며, 대부분 손실로 끝나는 결과로 로또의 기대값을 체감해 보세요.",
};

// 쿠키/랭킹을 요청 시점에 읽으므로 동적 렌더링
export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const [target, today, hof, c] = await Promise.all([
    getLiveLatest(),
    getTodayLeaderboard(),
    getHallOfFame(),
    cookies(),
  ]);
  const playedToday = c.get("lastPlayed")?.value === kstDateKey();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🏆 오늘의 랭킹</h1>
        <p className="mt-1 text-sm text-slate-500">
          제 {target.drwNo}회 당첨번호를 목표로, 서버가 {TRIES_PER_DAY.toLocaleString()}번
          자동 도전한 모의 결과를 모은 기록판입니다. 매일 0시(KST)에 새로 시작해요.
        </p>
        <p className="mt-2 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 ring-1 ring-slate-100">
          모든 도전은 가상 시뮬레이션이며 실제 돈을 걸거나 상품을 주지
          않습니다. 1,000게임이면 구매액은 {formatKRW(TRIES_PER_DAY * 1000)}이지만,
          로또는 판매액의 약 50%만 당첨금으로 돌려주기 때문에 평균적으로는
          절반가량을 잃는 구조입니다. 랭킹 상위권은 운이 좋았던 드문
          결과일 뿐, 순위가 아래로 갈수록 실제 로또의 평균적인 모습에 가깝습니다.
        </p>
      </div>

      {/* DB 미연결 안내 */}
      {!redis && (
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
          랭킹 서버(DB)가 아직 연결되지 않았어요. 관리자가 Upstash Redis를
          연결하면 활성화됩니다.
        </div>
      )}

      {/* 참가 */}
      {redis && <PlayBox playedToday={playedToday} />}

      {/* 오늘의 랭킹 */}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">
          오늘의 모의 순이익 TOP 20
        </h2>
        <Board rows={today} emptyText="아직 참가자가 없어요. 첫 도전자가 되어보세요!" />
      </section>

      {/* 명예의 전당 */}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">
          👑 명예의 전당 (역대 최고 모의 순이익)
        </h2>
        <Board rows={hof} showDate emptyText="아직 기록이 없어요." />
      </section>

      <Link
        href="/tools/challenge"
        className="inline-block text-sm text-indigo-600 hover:underline"
      >
        ← 혼자서 자유롭게 도전하기 (연습 모드)
      </Link>

      <p className="text-sm text-slate-500">
        👉 왜 대부분 손해로 끝나는지 궁금하다면{" "}
        <Link href="/guide/lotto-probability" className="text-indigo-600 hover:underline">
          로또 1등 확률과 번호 고르기의 진실
        </Link>
        을 읽어 보세요. 복권은 여윳돈으로 소액만 즐기시고, 도박 문제로 어려움이
        있다면 한국도박문제예방치유원(국번 없이 1336)에서 상담받을 수 있습니다.
      </p>
    </div>
  );
}

// 랭킹 목록
function Board({
  rows,
  showDate,
  emptyText,
}: {
  rows: LbEntry[];
  showDate?: boolean;
  emptyText: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl bg-white p-5 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-100">
        {emptyText}
      </p>
    );
  }
  return (
    <ol className="space-y-2">
      {rows.map((r, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-lg bg-white p-3 text-sm shadow-sm ring-1 ring-slate-100"
        >
          <span
            className={`w-7 shrink-0 text-center font-bold ${
              i === 0
                ? "text-amber-500"
                : i === 1
                ? "text-slate-400"
                : i === 2
                ? "text-amber-700"
                : "text-slate-300"
            }`}
          >
            {i + 1}
          </span>
          <span className="min-w-0 flex-1 truncate font-medium text-slate-700">
            {r.nickname}
            <span className="ml-2 text-xs font-normal text-slate-400">
              최고 {rankName(r.bestRank)}
              {showDate && r.date ? ` · ${formatDate(r.date)}` : ""}
            </span>
          </span>
          <span
            className={
              r.net >= 0
                ? "shrink-0 font-semibold text-indigo-600"
                : "shrink-0 font-semibold text-rose-500"
            }
          >
            {formatKRW(r.net)}
          </span>
        </li>
      ))}
    </ol>
  );
}

// YYYYMMDD → M.D
function formatDate(yyyymmdd: string): string {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return `${Number(yyyymmdd.slice(4, 6))}.${Number(yyyymmdd.slice(6, 8))}`;
}
