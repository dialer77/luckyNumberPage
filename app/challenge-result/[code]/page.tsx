import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  decodeRun,
  rankName,
  formatBuyDuration,
  prizeBreakdown,
} from "@/lib/challenge";
import { formatKRW, getDraw, drawPrizes } from "@/lib/lotto-data";

// 회차 번호로 등수별 당첨금을 구함. 회차 데이터가 없으면 안전한 기본값.
function prizesFor(drwNo: number): Record<number, number> {
  const draw = getDraw(drwNo);
  return draw
    ? drawPrizes(draw)
    : { 1: 2_000_000_000, 2: 50_000_000, 3: 1_500_000, 4: 50_000, 5: 5_000 };
}

// 공유된 도전 결과 페이지.
// URL의 [code] 에 결과가 인코딩돼 있음 (예: /challenge-result/f-1000-4-155000).
// generateStaticParams 가 없으므로 요청 시점에 렌더링됩니다(무한한 코드 대응).

export async function generateMetadata({
  params,
}: PageProps<"/challenge-result/[code]">): Promise<Metadata> {
  const { code } = await params;
  const r = decodeRun(code);
  if (!r) return { title: "결과를 찾을 수 없음" };
  const net = r.winnings - r.spent;
  return {
    title: `${r.tries.toLocaleString()}번 도전 결과`,
    description: `최고 ${rankName(r.bestRank)} · 순이익 ${formatKRW(net)}`,
  };
}

export default async function ChallengeResultPage({
  params,
}: PageProps<"/challenge-result/[code]">) {
  const { code } = await params;
  const r = decodeRun(code);
  if (!r) notFound();

  const net = r.winnings - r.spent;
  const prizes = prizesFor(r.drwNo);
  const breakdown = prizeBreakdown(r.counts, prizes);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {r.mode === "until1"
            ? `${r.tries.toLocaleString()}번 만에 1등!`
            : `${r.tries.toLocaleString()}번 도전 결과`}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          제 {r.drwNo}회 당첨번호를 목표로 한 도전 시뮬레이터 결과입니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="최고 등수" value={rankName(r.bestRank)} />
        <Stat label="총 구매금액" value={formatKRW(r.spent)} accent="loss" />
        <Stat label="총 당첨금" value={formatKRW(r.winnings)} />
        <Stat
          label="순이익"
          value={formatKRW(net)}
          accent={net < 0 ? "loss" : "gain"}
        />
      </div>

      {breakdown.length > 0 && (
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="mb-2 text-sm font-semibold text-slate-500">
            당첨 내역
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {breakdown.map((b) => (
              <li
                key={b.rank}
                className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
              >
                <b className="text-slate-800">{rankName(b.rank)}</b>{" "}
                {b.count.toLocaleString()}회 · {formatKRW(b.amount)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="rounded-xl bg-white p-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-100">
        🗓️ 주 5,000원씩 산다면 이만큼 사는 데{" "}
        <span className="font-semibold text-slate-800">
          약 {formatBuyDuration(r.tries)}
        </span>{" "}
        걸립니다.
      </p>

      <Link
        href="/tools/challenge"
        className="inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        나도 도전해보기 →
      </Link>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "gain" | "loss";
}) {
  const color =
    accent === "loss"
      ? "text-rose-500"
      : accent === "gain"
      ? "text-indigo-600"
      : "text-slate-800";
  return (
    <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-100">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`mt-1 font-bold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}
