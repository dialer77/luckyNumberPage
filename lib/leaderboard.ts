// 오늘의 챌린지 랭킹 — 서버 전용 로직.
// 조작 방지 핵심: 시뮬레이션을 "여기(서버)"에서 돌려 점수를 확정합니다.
// 브라우저는 점수를 만들지 않으므로 위조할 값이 없습니다.

import { redis } from "./redis";
import { drawPrizes } from "./lotto-data";
import { getLiveLatest } from "./lotto-live";

export const TRIES_PER_DAY = 1000; // 하루 챌린지에서 뽑는 횟수(고정)

// 랭킹 한 줄
export type LbEntry = {
  nickname: string;
  net: number; // 순이익 (점수)
  bestRank: number; // 최고 등수
  date?: string; // 명예의 전당에서만 사용
};

// 시뮬레이션 결과
export type SimResult = {
  drwNo: number;
  tries: number;
  net: number;
  winnings: number;
  spent: number;
  bestRank: number;
  counts: number[];
};

// KST 기준 오늘 날짜 키 (YYYYMMDD)
export function kstDateKey(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10).replace(/-/g, "");
}

// 닉네임 정리: 구분자 제거, 공백 정리, 길이 제한
export function sanitizeNick(raw: string): string {
  return raw.replace(/[|]/g, "").trim().slice(0, 12);
}

// ── 서버에서 직접 돌리는 시뮬레이션 (조작 불가 지점) ──
export async function simulateChallenge(tries = TRIES_PER_DAY): Promise<SimResult> {
  const draw = await getLiveLatest();
  const prizes = drawPrizes(draw);
  const mask = new Uint8Array(46);
  draw.numbers.forEach((n) => (mask[n] = 1));
  const bonus = draw.bonus;
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);

  const counts = [0, 0, 0, 0, 0];
  let bestRank = 0;

  for (let k = 0; k < tries; k++) {
    let match = 0;
    let bonusHit = false;
    for (let i = 0; i < 6; i++) {
      const j = i + Math.floor(Math.random() * (45 - i));
      const t = pool[i];
      pool[i] = pool[j];
      pool[j] = t;
      const v = pool[i];
      if (mask[v]) match++;
      if (v === bonus) bonusHit = true;
    }
    let rank = 0;
    if (match === 6) rank = 1;
    else if (match === 5) rank = bonusHit ? 2 : 3;
    else if (match === 4) rank = 4;
    else if (match === 3) rank = 5;
    if (rank) {
      counts[rank - 1]++;
      if (bestRank === 0 || rank < bestRank) bestRank = rank;
    }
  }

  const winnings = counts.reduce((s, c, i) => s + c * prizes[i + 1], 0);
  const spent = tries * 1000;
  return { drwNo: draw.drwNo, tries, net: winnings - spent, winnings, spent, bestRank, counts };
}

// upstash zrange(withScores) 결과([member, score, ...])를 LbEntry[] 로 파싱
function parseZ(raw: (string | number)[], withDate = false): LbEntry[] {
  const out: LbEntry[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    const parts = String(raw[i]).split("|");
    out.push({
      nickname: parts[0] || "익명",
      bestRank: Number(parts[1]) || 0,
      date: withDate ? parts[2] : undefined,
      net: Number(raw[i + 1]),
    });
  }
  return out;
}

// 오늘의 랭킹 TOP N (순이익 높은 순)
export async function getTodayLeaderboard(limit = 20): Promise<LbEntry[]> {
  if (!redis) return [];
  const raw = (await redis.zrange(`lb:${kstDateKey()}`, 0, limit - 1, {
    rev: true,
    withScores: true,
  })) as (string | number)[];
  return parseZ(raw);
}

// 명예의 전당 TOP N (역대 순이익 높은 순)
export async function getHallOfFame(limit = 20): Promise<LbEntry[]> {
  if (!redis) return [];
  const raw = (await redis.zrange(`hof`, 0, limit - 1, {
    rev: true,
    withScores: true,
  })) as (string | number)[];
  return parseZ(raw, true);
}
