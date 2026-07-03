"use server";
// 오늘의 챌린지 "참가" 서버 액션.
// 브라우저는 이 함수를 호출만 하고, 실제 시뮬레이션과 점수 확정은 서버에서 일어남.

import { cookies } from "next/headers";
import { redis } from "@/lib/redis";
import {
  kstDateKey,
  sanitizeNick,
  simulateChallenge,
  type SimResult,
} from "@/lib/leaderboard";

export type PlayResponse =
  | { ok: true; result: SimResult; rank: number }
  | { ok: false; reason: "no-db" | "already" | "nick" };

export async function playToday(nicknameRaw: string): Promise<PlayResponse> {
  if (!redis) return { ok: false, reason: "no-db" };

  const nick = sanitizeNick(nicknameRaw || "");
  if (!nick) return { ok: false, reason: "nick" };

  const date = kstDateKey();
  const c = await cookies();

  // 하루 1회 제한: 쿠키에 마지막 참가 날짜가 오늘이면 거절
  if (c.get("lastPlayed")?.value === date) {
    return { ok: false, reason: "already" };
  }

  // ── 서버에서 시뮬레이션 실행 (조작 불가) ──
  const result = simulateChallenge();

  // 고유 id (같은 닉네임/점수 충돌 방지)
  const id = crypto.randomUUID().slice(0, 8);
  const member = `${nick}|${result.bestRank}|${id}`;

  const dayKey = `lb:${date}`;
  await redis.zadd(dayKey, { score: result.net, member });
  await redis.expire(dayKey, 60 * 60 * 24 * 3); // 3일간 보관 후 자동 삭제

  // 명예의 전당 (역대) — 상위 100명만 유지
  await redis.zadd(`hof`, {
    score: result.net,
    member: `${nick}|${result.bestRank}|${date}|${id}`,
  });
  await redis.zremrangebyrank(`hof`, 0, -101);

  // 내 순위 (0-based → 1-based)
  const rank = (await redis.zrevrank(dayKey, member)) ?? 0;

  // 오늘 참가 완료 표시 (일주일 보관, 날짜 비교로 하루 1회 판정)
  c.set("lastPlayed", date, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { ok: true, result, rank: rank + 1 };
}
