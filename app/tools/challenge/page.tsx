"use client";
// 1등 도전 시뮬레이터 — 상호작용/애니메이션이 필요하므로 Client Component.
//
// 두 가지 모드:
//  · 정해진 횟수(5·100·1,000·10,000회): 즉시 돌려서 최고 등수/총 당첨금/순이익.
//  · 1등 나올 때까지: 초당 수백만 번 뽑으며 카운터가 실시간으로 치솟음.
// 실행 결과는 아래에 기록으로 쌓이고, 공유 링크(=OG 카드)로 만들 수 있습니다.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import NumberBall from "../../components/NumberBall";
import { getLatestDraw, drawPrizes, formatKRW } from "@/lib/lotto-data";
import {
  rankName,
  encodeRun,
  formatBuyDuration,
  prizeBreakdown,
  type RunResult,
} from "@/lib/challenge";

// 정해진 횟수 모드의 프리셋 버튼
const PRESETS = [
  { n: 5, label: "5회" },
  { n: 100, label: "100회" },
  { n: 1_000, label: "1,000회" },
  { n: 10_000, label: "1만회" },
];

// 1등까지 모드에서 한 프레임(약 1/60초)에 뽑는 횟수.
// 값이 작을수록 카운터가 천천히 올라가 "감각"이 살아납니다.
// (너무 작으면 1등까지 오래 걸림 — 이 값이 속도 조절 손잡이)
const BATCH_PER_FRAME = 15_000;

export default function ChallengePage() {
  const target = getLatestDraw();
  const prizes = drawPrizes(target); // 이 회차의 등수별 당첨금

  // 실시간 표시용 상태
  const [tries, setTries] = useState(0); // (1등까지 모드) 현재 시도 횟수
  const [best, setBest] = useState(0); // (1등까지 모드) 최고 등수
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0, 0]); // 등수별 횟수
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState<RunResult | null>(null); // 방금 끝난 결과
  const [history, setHistory] = useState<RunResult[]>([]); // 지난 기록(최신 앞, 최대 5개)
  const [copied, setCopied] = useState(false);

  // 루프 내부 전용 값들 (리렌더 방지)
  const triesRef = useRef(0);
  const bestRef = useRef(0);
  const countsRef = useRef<number[]>([0, 0, 0, 0, 0]);
  const rafRef = useRef<number | null>(null);

  // 당첨번호 조회용 구조: 본번호 마스크 + 보너스
  const maskRef = useRef<Uint8Array | null>(null);
  const poolRef = useRef<number[] | null>(null);
  if (!maskRef.current) {
    const mask = new Uint8Array(46);
    target.numbers.forEach((n) => (mask[n] = 1));
    maskRef.current = mask;
    poolRef.current = Array.from({ length: 45 }, (_, i) => i + 1);
  }
  const bonus = target.bonus;

  // 한 장(6개) 뽑아 등수를 반환. 할당 없이 부분 셔플.
  //   6개 일치=1등 / 5개+보너스=2등 / 5개=3등 / 4개=4등 / 3개=5등 / 그 외=0
  function trialRank(): number {
    const mask = maskRef.current!;
    const pool = poolRef.current!;
    let match = 0;
    let bonusHit = false;
    for (let i = 0; i < 6; i++) {
      const j = i + Math.floor(Math.random() * (45 - i));
      const tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
      const v = pool[i];
      if (mask[v]) match++;
      if (v === bonus) bonusHit = true;
    }
    if (match === 6) return 1;
    if (match === 5) return bonusHit ? 2 : 3;
    if (match === 4) return 4;
    if (match === 3) return 5;
    return 0;
  }

  // 결과를 기록에 추가 + 현재 결과로 표시
  function record(result: RunResult) {
    setCurrent(result);
    setCopied(false);
    setHistory((prev) => [result, ...prev].slice(0, 5));
  }

  // counts 배열로부터 총 당첨금 계산 (이 회차 상금 기준)
  function sumWinnings(c: number[]): number {
    return c.reduce((sum, cnt, i) => sum + cnt * prizes[i + 1], 0);
  }

  // ── 정해진 횟수 모드: 즉시 실행 ──
  function runFixed(n: number) {
    setRunning(false); // 혹시 무한 모드 돌고 있으면 정지
    const c = [0, 0, 0, 0, 0];
    let bestRank = 0;
    for (let k = 0; k < n; k++) {
      const rank = trialRank();
      if (rank >= 1) {
        c[rank - 1]++;
        if (bestRank === 0 || rank < bestRank) bestRank = rank;
      }
    }
    record({
      mode: "fixed",
      drwNo: target.drwNo,
      tries: n,
      bestRank,
      winnings: sumWinnings(c),
      spent: n * 1000,
      counts: c,
    });
  }

  // ── 1등 나올 때까지 모드: 프레임마다 batch 실행 ──
  // countsRef 에 등수별 횟수를 누적하면서 돌림.
  function runBatch(batch: number) {
    const c = countsRef.current;
    let localBest = bestRef.current;
    let did = 0;
    let won = false;
    for (let k = 0; k < batch; k++) {
      const rank = trialRank();
      did++;
      if (rank >= 1) {
        c[rank - 1]++;
        if (localBest === 0 || rank < localBest) localBest = rank;
      }
      if (rank === 1) {
        won = true;
        break;
      }
    }
    return { did, localBest, won };
  }

  useEffect(() => {
    if (!running) return;
    let active = true;
    const tick = () => {
      if (!active) return;
      const { did, localBest, won } = runBatch(BATCH_PER_FRAME);
      triesRef.current += did;
      bestRef.current = localBest;
      setTries(triesRef.current);
      setBest(bestRef.current);
      setCounts([...countsRef.current]);
      if (won) {
        setRunning(false);
        record({
          mode: "until1",
          drwNo: target.drwNo,
          tries: triesRef.current,
          bestRank: 1,
          winnings: sumWinnings(countsRef.current),
          spent: triesRef.current * 1000,
          counts: [...countsRef.current],
        });
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running]);

  function startUntil1() {
    triesRef.current = 0;
    bestRef.current = 0;
    countsRef.current = [0, 0, 0, 0, 0];
    setTries(0);
    setBest(0);
    setCounts([0, 0, 0, 0, 0]);
    setRunning(true);
  }

  // 결과를 공유 링크로 복사
  async function share(r: RunResult) {
    const url = `${window.location.origin}/challenge-result/${encodeRun(r)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // 클립보드 권한이 없으면 링크 페이지로 이동해도 됨
      window.open(`/challenge-result/${encodeRun(r)}`, "_blank");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🎯 1등 도전 시뮬레이터</h1>
        <p className="mt-1 text-sm text-slate-500">
          아래 당첨번호를 목표로 무작위 번호를 뽑습니다. 정해진 횟수만큼
          돌리거나, 1등이 나올 때까지 도전해 보세요.
        </p>
        <Link
          href="/ranking"
          className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          🏆 오늘의 랭킹에 참가해 다른 사람과 겨루기 →
        </Link>
      </div>

      {/* 목표 번호 */}
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="text-xs text-slate-400">
          목표 · 제 {target.drwNo}회 당첨번호 (보너스 {bonus})
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {target.numbers.map((n) => (
            <NumberBall key={n} n={n} size="sm" />
          ))}
        </div>
      </div>

      {/* 실행 버튼들 */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.n}
            onClick={() => runFixed(p.n)}
            disabled={running}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:ring-indigo-300 disabled:opacity-40"
          >
            {p.label} 돌리기
          </button>
        ))}
        {!running ? (
          <button
            onClick={startUntil1}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            1등 나올 때까지 🚀
          </button>
        ) : (
          <button
            onClick={() => setRunning(false)}
            className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
          >
            멈추기
          </button>
        )}
      </div>

      {/* 무한 모드 실시간 카운터 (돌아가는 동안만) */}
      {running && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="시도 횟수" value={`${tries.toLocaleString()}회`} />
            <Stat label="총 구매금액" value={formatKRW(tries * 1000)} accent="loss" />
            <Stat label="최고 기록" value={best > 0 ? rankName(best) : "-"} />
          </div>
          <Breakdown counts={counts} prizes={prizes} />
        </div>
      )}

      {/* 방금 끝난 결과 */}
      {current && !running && (
        <ResultCard
          r={current}
          prizes={prizes}
          onShare={share}
          copied={copied}
        />
      )}

      {/* 지난 기록 */}
      {history.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-slate-500">
            지난 기록
          </h2>
          <ul className="space-y-2">
            {history.map((r, i) => (
              <li
                key={i}
                className="space-y-2 rounded-lg bg-white p-3 text-sm shadow-sm ring-1 ring-slate-100"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-slate-500">
                    {r.mode === "until1"
                      ? "1등까지"
                      : `${r.tries.toLocaleString()}회`}{" "}
                    · 최고{" "}
                    <b className="text-slate-700">{rankName(r.bestRank)}</b>
                  </span>
                  <span
                    className={
                      r.winnings - r.spent >= 0
                        ? "font-semibold text-indigo-600"
                        : "font-semibold text-rose-500"
                    }
                  >
                    순이익 {formatKRW(r.winnings - r.spent)}
                  </span>
                </div>
                <Breakdown counts={r.counts} prizes={prizes} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// ── 결과 카드 (현재 실행 결과 + 공유 버튼) ──
function ResultCard({
  r,
  prizes,
  onShare,
  copied,
}: {
  r: RunResult;
  prizes: Record<number, number>;
  onShare: (r: RunResult) => void;
  copied: boolean;
}) {
  const net = r.winnings - r.spent;
  return (
    <section className="rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 ring-1 ring-indigo-100">
      <div className="text-sm text-slate-500">
        {r.mode === "until1"
          ? `${r.tries.toLocaleString()}번 만에 1등 달성!`
          : `${r.tries.toLocaleString()}번 도전 결과`}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="최고 등수" value={rankName(r.bestRank)} />
        <Stat label="총 구매금액" value={formatKRW(r.spent)} accent="loss" />
        <Stat label="총 당첨금" value={formatKRW(r.winnings)} />
        <Stat
          label="순이익"
          value={formatKRW(net)}
          accent={net < 0 ? "loss" : "gain"}
        />
      </div>

      <div className="mt-3">
        <Breakdown counts={r.counts} prizes={prizes} />
      </div>

      <p className="mt-3 text-sm text-slate-500">
        🗓️ 주 5,000원(주 5게임)씩 사면 이만큼 사는 데{" "}
        <span className="font-semibold text-slate-700">
          약 {formatBuyDuration(r.tries)}
        </span>{" "}
        걸려요.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => onShare(r)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          결과 공유 링크 복사
        </button>
        {copied && (
          <span className="text-sm text-indigo-600">복사됐어요! 🔗</span>
        )}
        <Link
          href={`/challenge-result/${encodeRun(r)}`}
          className="text-sm text-slate-500 hover:text-indigo-600"
        >
          공유 페이지 미리보기 →
        </Link>
      </div>
    </section>
  );
}

// 등수별 당첨 내역 (몇 등이 몇 번, 당첨금 얼마)
function Breakdown({
  counts,
  prizes,
}: {
  counts: number[];
  prizes: Record<number, number>;
}) {
  const rows = prizeBreakdown(counts, prizes);
  if (rows.length === 0) {
    return (
      <p className="text-xs text-slate-400">아직 당첨 내역이 없어요 (전부 꽝)</p>
    );
  }
  return (
    <ul className="flex flex-wrap gap-1.5">
      {rows.map((b) => (
        <li
          key={b.rank}
          className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
        >
          <b className="text-slate-800">{rankName(b.rank)}</b>{" "}
          {b.count.toLocaleString()}회 · {formatKRW(b.amount)}
        </li>
      ))}
    </ul>
  );
}

// 작은 현황 카드
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
