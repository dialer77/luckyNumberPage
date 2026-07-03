"use client";
// 오늘의 챌린지 참가 상자 — 닉네임 입력 + 참가 버튼.
// 서버 액션 playToday 를 호출하고, 성공하면 목록을 새로고침(router.refresh).

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { playToday } from "./actions";
import { rankName } from "@/lib/challenge";
import { formatKRW } from "@/lib/lotto-data";

export default function PlayBox({
  playedToday,
}: {
  playedToday: boolean;
}) {
  const [nick, setNick] = useState("");
  const [msg, setMsg] = useState<React.ReactNode>(null);
  const [done, setDone] = useState(playedToday);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    if (!nick.trim() || pending) return;
    startTransition(async () => {
      const res = await playToday(nick);
      if (res.ok) {
        setDone(true);
        setMsg(
          <>
            🎉 <b>{res.rank}위</b> · 순이익{" "}
            <b>{formatKRW(res.result.net)}</b> · 최고{" "}
            {rankName(res.result.bestRank)}
          </>
        );
        router.refresh(); // 랭킹 목록 갱신
      } else if (res.reason === "already") {
        setDone(true);
        setMsg("오늘은 이미 참가했어요. 내일 다시 도전해 주세요!");
      } else if (res.reason === "nick") {
        setMsg("닉네임을 입력해 주세요.");
      } else {
        setMsg("아직 랭킹 서버가 준비 중이에요.");
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-xl bg-indigo-50 p-4 text-sm text-slate-700 ring-1 ring-indigo-100">
        {msg ?? "오늘은 이미 참가했어요. 내일 다시 도전해 주세요!"}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="text-sm font-semibold">오늘의 챌린지 참가</div>
      <p className="mt-1 text-xs text-slate-500">
        서버가 1,000번 자동으로 뽑아 순이익으로 순위를 매깁니다. 하루 한 번!
      </p>
      <div className="mt-3 flex gap-2">
        <input
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="닉네임 (최대 12자)"
          maxLength={12}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        <button
          onClick={submit}
          disabled={pending || !nick.trim()}
          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          {pending ? "도전 중..." : "참가"}
        </button>
      </div>
      {msg && <div className="mt-2 text-sm text-slate-600">{msg}</div>}
    </div>
  );
}
