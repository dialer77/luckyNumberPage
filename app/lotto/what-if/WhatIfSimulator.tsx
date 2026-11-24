"use client";
// "내 번호로 1회부터 샀다면?" — 번호 6개를 고르면 1회부터 최신 회차까지의 성적을 바로 계산.
// 데이터는 서버(page.tsx)가 줄여서(packDraws) 넘기고, 계산은 lib/lotto-history.ts 순수 함수로 브라우저에서 한다.
// ?n=1,2,3,4,5,6 이 있으면 그 번호로 시작하고, 6개를 다 고르면 주소도 같은 형식으로 바꿔 둔다(그대로 링크 공유 가능).

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import NumberBall from "../../components/NumberBall";
import ShareButton from "../../components/ShareButton";
import { ballColor } from "@/lib/lotto-data";
import {
  averageReturn,
  formatDateKo,
  formatExpected,
  formatRate,
  formatWon,
  isValidPick,
  parsePick,
  pickLabel,
  simulate,
  summaryLine,
  unpackDraws,
  weeksToYears,
  type HistoryDraw,
  type PackedDraw,
  type WhatIfResult,
} from "@/lib/lotto-history";

const ALL = Array.from({ length: 45 }, (_, i) => i + 1);

export type QuickPick = { label: string; pick: number[] };

// 주소의 n이 바뀌면(다른 페이지 링크, 본문의 예시 링크) key로 새로 시작한다.
export default function WhatIfSimulator(props: {
  packed: PackedDraw[];
  quickPicks: QuickPick[];
}) {
  const n = useSearchParams().get("n") ?? "";
  return <Simulator key={n} initial={parsePick(n)} {...props} />;
}

function Simulator({
  packed,
  quickPicks,
  initial,
}: {
  packed: PackedDraw[];
  quickPicks: QuickPick[];
  initial: number[];
}) {
  const draws = useMemo(() => unpackDraws(packed), [packed]);
  const avg = useMemo(() => averageReturn(draws), [draws]);
  const [picked, setPicked] = useState<number[]>(initial);
  const result = useMemo(
    () => (isValidPick(picked) ? simulate(picked, draws) : null),
    [picked, draws]
  );

  function apply(next: number[]) {
    setPicked(next);
    if (next.length === 6) {
      try {
        window.history.replaceState(null, "", `?n=${next.join(",")}`);
      } catch {}
    }
  }

  function toggle(n: number) {
    if (picked.includes(n)) apply(picked.filter((x) => x !== n));
    else if (picked.length < 6) apply([...picked, n].sort((a, b) => a - b));
  }

  function fillRandom() {
    const pool = [...ALL];
    const pick: number[] = [];
    for (let i = 0; i < 6; i++) {
      const j = Math.floor(Math.random() * pool.length);
      pick.push(pool.splice(j, 1)[0]);
    }
    apply(pick.sort((a, b) => a - b));
  }

  return (
    <div className="space-y-4">
      {/* 번호 고르기 */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold">번호 6개 고르기</h2>
          <div className="flex shrink-0 gap-3 text-sm">
            <button onClick={fillRandom} className="text-indigo-600 hover:underline">
              🎲 랜덤
            </button>
            {picked.length > 0 && (
              <button
                onClick={() => apply([])}
                className="text-slate-400 hover:text-slate-600"
              >
                지우기
              </button>
            )}
          </div>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          1~45 중 6개를 고르면 바로 계산돼요. ({picked.length}/6)
        </p>

        <div className="mt-4 grid grid-cols-7 gap-1.5 sm:grid-cols-9">
          {ALL.map((n) => {
            const on = picked.includes(n);
            return (
              <button
                key={n}
                onClick={() => toggle(n)}
                aria-pressed={on}
                className={`flex h-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                  on
                    ? `${ballColor(n)} shadow-sm`
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>

        {quickPicks.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-400">예시로 보기</span>
            {quickPicks.map((q) => (
              <button
                key={q.label}
                onClick={() => apply(q.pick)}
                className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-600 hover:bg-indigo-100"
              >
                {q.label}
              </button>
            ))}
          </div>
        )}
      </section>

      {result ? (
        <Result result={result} draws={draws} avgRate={avg.rate} avgLowerRate={avg.lowerOnlyRate} />
      ) : (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-100">
          번호 6개를 고르면 제{draws[0]?.no ?? 1}회부터 제
          {draws[draws.length - 1]?.no ?? 0}회까지의 성적이
          여기에 나와요.
        </p>
      )}
    </div>
  );
}

const card = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100";
const h3 = "font-bold text-slate-800";

function Stat({ label, value, tone }: { label: string; value: string; tone?: "gain" | "loss" }) {
  const color =
    tone === "loss" ? "text-rose-500" : tone === "gain" ? "text-indigo-600" : "text-slate-800";
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`mt-1 break-keep text-sm font-bold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function DrawLink({ no, date }: { no: number; date: string }) {
  return (
    <>
      <Link href={`/lotto/${no}`} className="font-medium text-indigo-600 hover:underline">
        제{no}회
      </Link>{" "}
      <span className="whitespace-nowrap text-slate-400">({date})</span>
    </>
  );
}

function Result({
  result: r,
  draws,
  avgRate,
  avgLowerRate,
}: {
  result: WhatIfResult;
  draws: HistoryDraw[];
  avgRate: number;
  avgLowerRate: number;
}) {
  const byNo = new Map(draws.map((d) => [d.no, d]));
  const unknownTotal = r.ranks.reduce((a, s) => a + s.unknown, 0);
  const maxMatch = Math.max(...r.matchCounts, 1);
  const lastBest = r.bestMatchDraws[r.bestMatchDraws.length - 1];

  return (
    <div className="space-y-4">
      {/* 요약 */}
      <section className={card}>
        <div className="flex flex-wrap gap-1.5">
          {r.pick.map((n) => (
            <NumberBall key={n} n={n} size="sm" />
          ))}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{summaryLine(r)}</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="총 구매액" value={formatWon(r.spent)} />
          <Stat label="총 당첨금(세전)" value={formatWon(r.totalPrize)} tone="gain" />
          <Stat
            label="회수율"
            value={formatRate(r.returnRate)}
            tone={r.returnRate >= 1 ? "gain" : "loss"}
          />
        </div>
        <ul className="mt-3 space-y-1 text-sm text-slate-500">
          <li>
            손익(세전):{" "}
            <b className={r.net >= 0 ? "text-indigo-600" : "text-rose-500"}>
              {r.net >= 0 ? "+" : ""}
              {formatWon(r.net)}
            </b>
          </li>
          <li>
            5등 이상 당첨된 주: {r.winGames.toLocaleString("ko-KR")}주 /{" "}
            {r.games.toLocaleString("ko-KR")}주
            {r.winGames > 0 && ` (평균 ${(r.games / r.winGames).toFixed(1)}주에 한 번)`}
          </li>
          <li>
            비교: 무작위 조합 1개의 평균 회수율은 {formatRate(avgRate)}, 4·5등만 따지면{" "}
            {formatRate(avgLowerRate)}
          </li>
        </ul>
        <div className="mt-4">
          <ShareButton
            payload={{
              e: "🕰️",
              t: "내 번호로 1회부터 샀다면",
              v: `회수율 ${formatRate(r.returnRate)}`,
              s: `${pickLabel(r.pick)} · ${r.games.toLocaleString("ko-KR")}주 · ${formatWon(r.spent)} 써서 ${formatWon(r.totalPrize)} 당첨`,
            }}
          />
        </div>
      </section>

      {/* 등수별 성적 */}
      <section className={card}>
        <h3 className={h3}>등수별 당첨 횟수</h3>
        <div className="mt-3 overflow-x-auto rounded-lg ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left font-medium">등수</th>
                <th className="px-3 py-2 text-right font-medium">당첨</th>
                <th className="px-3 py-2 text-right font-medium">이론상 평균</th>
                <th className="px-3 py-2 text-right font-medium">합계(세전)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {r.ranks.map((s) => (
                <tr key={s.rank} className={s.count > 0 ? "" : "text-slate-400"}>
                  <td className="whitespace-nowrap px-3 py-2 font-medium">{s.rank}등</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                    {s.count}번
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-400">
                    {formatExpected(s.expected)}번
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                    {s.count === 0 ? "—" : s.count === s.unknown ? "기록 없음" : formatWon(s.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          이론상 평균 = {r.games.toLocaleString("ko-KR")}게임 × 그 등수에 해당하는 조합 수 ÷
          8,145,060. 어떤 번호든 같습니다.
          {unknownTotal > 0 &&
            ` ${unknownTotal}번은 그 회차에 실제 당첨자가 없어 1게임당 금액 기록이 없으므로 합계에서 뺐습니다.`}
        </p>
      </section>

      {/* 1~3등 회차 */}
      <section className={card}>
        <h3 className={h3}>1~3등 당첨 회차</h3>
        {r.topWins.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            {r.games.toLocaleString("ko-KR")}주 동안 1~3등은 한 번도 없었어요.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-100 text-sm">
            {r.topWins.map((w) => (
              <li key={w.no} className="flex flex-wrap items-center gap-x-2 gap-y-1 py-2">
                <DrawLink no={w.no} date={w.date} />
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                  {w.rank}등
                </span>
                <span className="ml-auto tabular-nums text-slate-700">
                  {w.prizeKnown ? formatWon(w.prize) : "금액 기록 없음(그 회차 당첨자 없음)"}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-slate-400">
          4등 {r.ranks[3].count}번({formatWon(r.ranks[3].total)}) · 5등 {r.ranks[4].count}번(
          {formatWon(r.ranks[4].total)})은 횟수와 합계만 표시합니다.
        </p>
      </section>

      {/* 아깝게 놓친 회차 */}
      <section className={card}>
        <h3 className={h3}>아깝게 놓친 회차</h3>
        {r.fiveMatches.length > 0 && (
          <>
            <p className="mt-2 text-sm text-slate-600">
              당첨번호 6개 중 5개를 맞혀 1등까지 번호 1개가 모자랐던 회차예요.
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
              {r.fiveMatches.map((f) => (
                <li key={f.no}>
                  <DrawLink no={f.no} date={f.date} /> {f.rank}등 — 당첨번호{" "}
                  <b>{f.drawnMiss}</b>번을 못 골랐고, 내 번호 <b>{f.myMiss}</b>번은
                  {f.rank === 2 ? " 보너스 번호였어요" : " 빗나갔어요"}
                </li>
              ))}
            </ul>
          </>
        )}
        {r.fourPlusBonus.length > 0 && (
          <>
            <p className="mt-3 text-sm text-slate-600">
              당첨번호 4개에 보너스 번호까지 맞혔지만, 보너스는 5개를 맞혔을 때만 쓰여서
              4등이었던 회차예요.
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {r.fourPlusBonus.map((f) => (
                <li key={f.no}>
                  <DrawLink no={f.no} date={f.date} /> — 보너스 {byNo.get(f.no)?.bonus}번 일치
                </li>
              ))}
            </ul>
          </>
        )}
        {r.fiveMatches.length === 0 && r.fourPlusBonus.length === 0 && (
          <p className="mt-2 text-sm text-slate-600">
            5개를 맞히거나, 4개에 보너스 번호까지 맞힌 회차는 없었어요.
          </p>
        )}
        {r.bestMatch > 0 && lastBest && (
          <p className="mt-3 text-sm text-slate-600">
            가장 많이 맞힌 건 <b>{r.bestMatch}개</b>로 {r.bestMatchDraws.length}번이고, 가장
            최근은 <DrawLink no={lastBest.no} date={lastBest.date} />
            이에요.
          </p>
        )}
      </section>

      {/* 기록 */}
      <section className={card}>
        <h3 className={h3}>{r.games.toLocaleString("ko-KR")}주의 기록</h3>
        <p className="mt-2 text-sm text-slate-500">매주 당첨번호 6개 중 몇 개를 맞혔나</p>
        <ul className="mt-2 space-y-1.5">
          {r.matchCounts.map((c, m) => (
            <li key={m} className="flex items-center gap-3 text-sm">
              <span className="w-10 shrink-0 text-slate-500">{m}개</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${(c / maxMatch) * 100}%` }}
                />
              </div>
              <span className="w-14 shrink-0 text-right tabular-nums text-slate-500">
                {c.toLocaleString("ko-KR")}주
              </span>
            </li>
          ))}
        </ul>
        <ul className="mt-4 space-y-1 text-sm text-slate-600">
          {r.firstWin && (
            <li>
              첫 당첨: <DrawLink no={r.firstWin.no} date={r.firstWin.date} /> {r.firstWin.rank}등
            </li>
          )}
          {r.bestWin && (
            <li>
              한 번에 가장 많이 받은 회차: <DrawLink no={r.bestWin.no} date={r.bestWin.date} />{" "}
              {r.bestWin.rank}등 {formatWon(r.bestWin.prize)}
            </li>
          )}
          {r.longestDrought.length > 0 && (
            <li>
              가장 길게 이어진 꽝: <b>{r.longestDrought.length.toLocaleString("ko-KR")}주</b>
              (약 {weeksToYears(r.longestDrought.length)}년, 제{r.longestDrought.fromNo}회~제
              {r.longestDrought.toNo}회)
            </li>
          )}
          <li className="text-slate-400">
            기간: 제{r.firstNo}회 {formatDateKo(r.firstDate)} ~ 제
            {r.lastNo}회 {formatDateKo(r.lastDate)}
          </li>
        </ul>
      </section>
    </div>
  );
}
