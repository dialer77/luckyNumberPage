"use client";

// 최신 회차 카드 — 첫 화면과 행운노트(/lotto)에서 쓴다.
//
// 서버가 그려 준 회차(initial)를 먼저 보여 주고, 다음 회차 추첨 시각(토 20:35)이 지났는데
// 아직 이전 회차라면 /api/lotto/latest 를 불러 그 자리에서 바꾼다. 추첨 후 3시간 동안은
// 30초마다 다시 확인하므로, 페이지를 열어 둔 사람은 번호 → 당첨금 순으로 바뀌는 걸 그대로 본다.

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import NumberBall from "./NumberBall";
import { formatKRW, afterTax, type LottoDraw } from "@/lib/lotto-data";
import { drawTime, expectedLatestNo } from "@/lib/lotto-schedule";

type Pending = Pick<LottoDraw, "drwNo" | "drwNoDate" | "numbers" | "bonus">;
type Status = "ok" | "waiting" | "stale";

const POLL_MS = 30_000;
const POLL_WINDOW_MS = 3 * 60 * 60 * 1000; // 추첨 후 3시간까지만 자동 확인

type Props = {
  initial: LottoDraw;
  /** 회차 줄 끝에 붙일 말 (예: "최신 당첨번호") */
  suffix?: string;
};

export default function LatestDrawCard({ initial, suffix }: Props) {
  const [latest, setLatest] = useState<LottoDraw>(initial);
  const [pending, setPending] = useState<Pending | null>(null);
  const [status, setStatus] = useState<Status>("ok");
  const [waitingFor, setWaitingFor] = useState<number | null>(null);

  useEffect(() => {
    const expected = expectedLatestNo();
    if (initial.drwNo >= expected) return; // 이미 최신

    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const withinWindow = () => Date.now() - drawTime(expected) < POLL_WINDOW_MS;

    const tick = async () => {
      try {
        const res = await fetch("/api/lotto/latest", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as {
          latest: LottoDraw;
          pending: Pending | null;
        };
        if (stopped) return;

        const fresh = data.latest;
        setLatest((cur) => (fresh.drwNo >= cur.drwNo ? fresh : cur));
        setPending(data.pending);

        const behind = expected - fresh.drwNo;
        if (behind <= 0) {
          setStatus("ok");
          setWaitingFor(null);
          return; // 당첨금까지 반영됨 → 더 확인할 필요 없음
        }
        if (behind >= 2) {
          // 두 회차 이상 뒤처짐 = 데이터 조회 문제. 자동 확인은 멈춘다.
          setStatus("stale");
          setWaitingFor(null);
          return;
        }
        setStatus("waiting");
        setWaitingFor(data.pending ? null : expected);
        if (withinWindow()) timer = setTimeout(tick, POLL_MS);
      } catch {
        if (!stopped && withinWindow()) timer = setTimeout(tick, POLL_MS * 2);
      }
    };

    tick();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [initial.drwNo]);

  const shown = pending ?? latest;
  const noWinner = !pending && latest.firstWinnerCount === 0;

  const body = (
    <>
      <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
        <span>
          제 {shown.drwNo}회 · {shown.drwNoDate}
          {suffix ? ` ${suffix}` : ""}
        </span>
        {pending && (
          <span className="animate-pulse rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-500 ring-1 ring-rose-100">
            방금 발표
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {shown.numbers.map((n) => (
          <NumberBall key={n} n={n} size="md" />
        ))}
        <span className="mx-1 text-slate-300">+</span>
        <NumberBall n={shown.bonus} size="md" />
      </div>

      {pending ? (
        <div className="mt-3 text-sm text-slate-500">
          <span className="font-semibold text-slate-700">당첨금 집계 중…</span>{" "}
          <span className="text-xs text-slate-400">
            보통 추첨 15분 안에 발표되고, 나오면 이 카드가 자동으로 바뀝니다.
          </span>
        </div>
      ) : noWinner ? (
        <div className="mt-3 text-sm text-slate-500">
          1등 당첨자 없음 — 1등 당첨금은 다음 회차로 이월됩니다.
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          <span>
            1등 {latest.firstWinnerCount.toLocaleString()}명 · 1게임당{" "}
            <span className="font-semibold text-slate-700">
              {formatKRW(latest.firstWinAmount)}
            </span>
          </span>
          <span>
            세후 실수령{" "}
            <span className="font-semibold text-indigo-600">
              {formatKRW(afterTax(latest.firstWinAmount))}
            </span>
          </span>
        </div>
      )}

      {status === "waiting" && waitingFor && (
        <p className="mt-2 text-xs text-amber-600">
          제 {waitingFor}회 추첨 결과를 기다리는 중이에요. 발표되면 자동으로
          바뀝니다.
        </p>
      )}
      {status === "stale" && (
        <p className="mt-2 text-xs text-rose-500">
          최신 회차를 불러오지 못했어요. 정확한 결과는 동행복권에서 확인해 주세요.
        </p>
      )}
    </>
  );

  return pending ? (
    <Card>{body}</Card>
  ) : (
    <Card href={`/lotto/${latest.drwNo}`}>{body}</Card>
  );
}

function Card({ href, children }: { href?: string; children: ReactNode }) {
  const cls =
    "block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100";
  return href ? (
    <Link href={href} className={`${cls} hover:ring-indigo-200`}>
      {children}
    </Link>
  ) : (
    <div className={cls}>{children}</div>
  );
}
