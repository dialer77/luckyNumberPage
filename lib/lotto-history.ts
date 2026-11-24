// "내 번호로 1회부터 샀다면?" 계산 — 순수 함수만 둔다(서버·브라우저 공용, 외부 의존 없음).
//
// 원천 데이터: 공개 데이터셋 smok95/lotto 의 results/all.json (원 출처 동행복권).
//   각 원소 = { draw_no, numbers[6], bonus_no, date, divisions[0..4] = 1~5등 {prize, winners} }
//   · 당첨자가 없던 등수는 {} (1등 없던 회차 14번, 2등 없던 회차 2번 — 3·5회)
//   · 4등은 400회까지 회차마다 금액이 달랐고 401회부터 5만원 고정
//   · 5등은 1게임 2,000원이던 87회까지 1만원, 88회부터 5천원
// 그래서 4·5등도 "규정 금액"이 아니라 회차별 실제 금액을 그대로 쓴다.
//
// 서버(page.tsx)가 all.json을 parseSmokAll → packDraws 로 줄여 넘기고,
// 클라이언트가 unpackDraws → simulate 로 즉시 계산한다. 페이지 본문 예시도 같은 함수로 계산.

/** 계산에 필요한 최소 필드만 담은 한 회차 */
export type HistoryDraw = {
  no: number; // 회차
  date: string; // 추첨일 YYYY-MM-DD
  numbers: number[]; // 당첨번호 6개(오름차순)
  bonus: number; // 보너스 번호
  /** [1등, 2등, 3등, 4등, 5등] 1게임당 세전 당첨금(원). 0 = 그 회차에 해당 등수 당첨자가 없어 금액 기록 없음 */
  prizes: number[];
};

/** 전송용으로 줄인 한 회차: [회차, YYYYMMDD, 번호6, 보너스, 1~5등 금액] (길이 14) */
export type PackedDraw = number[];

/** 1~45 중 6개를 고를 때 등수별 해당 조합 수(총 8,145,060) — 이론상 평균 횟수 계산용 */
export const TOTAL_COMBINATIONS = 8_145_060;
export const RANK_COMBINATIONS = [1, 6, 228, 11_115, 182_780]; // 1~5등

/** 회차별 1게임 가격: 1~87회(~2004-07-31) 2,000원, 88회(2004-08-07)부터 1,000원 */
export function ticketPrice(no: number): number {
  return no <= 87 ? 2_000 : 1_000;
}

// ─────────────────────────────────────────────────────────────
// 원천 데이터 변환
// ─────────────────────────────────────────────────────────────

const isNum = (x: unknown): x is number =>
  typeof x === "number" && Number.isFinite(x);

const validBall = (x: unknown): x is number =>
  isNum(x) && Number.isInteger(x) && x >= 1 && x <= 45;

/**
 * smok95 all.json → HistoryDraw[] (회차 오름차순).
 * 형식이 어긋난 원소는 건너뛰고, 당첨금이 아직 안 나온 회차(추첨 직후 번호만 올라온 상태)도 뺀다.
 * 5등은 매 회차 수십만~수백만 명이 나오므로 5등 금액이 있으면 당첨금이 나온 회차로 본다.
 */
export function parseSmokAll(raw: unknown): HistoryDraw[] {
  if (!Array.isArray(raw)) return [];
  const byNo = new Map<number, HistoryDraw>();
  for (const r of raw) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    const no = o.draw_no;
    const nums = o.numbers;
    const bonus = o.bonus_no;
    const date = o.date;
    const divs = o.divisions;
    if (!isNum(no) || !Number.isInteger(no) || no < 1) continue;
    if (!Array.isArray(nums) || nums.length !== 6 || !nums.every(validBall)) continue;
    if (!validBall(bonus) || typeof date !== "string") continue;
    if (new Set([...nums, bonus]).size !== 7) continue;
    if (!Array.isArray(divs)) continue;
    const prizes = [0, 1, 2, 3, 4].map((k) => {
      const d = divs[k] as { prize?: unknown } | undefined;
      return d && isNum(d.prize) && d.prize > 0 ? Math.round(d.prize) : 0;
    });
    if (prizes[4] <= 0) continue; // 당첨금 미발표
    byNo.set(no, {
      no,
      date: date.slice(0, 10),
      numbers: [...(nums as number[])].sort((a, b) => a - b),
      bonus,
      prizes,
    });
  }
  return [...byNo.values()].sort((a, b) => a.no - b.no);
}

export function packDraws(draws: HistoryDraw[]): PackedDraw[] {
  return draws.map((d) => [
    d.no,
    Number(d.date.replace(/-/g, "")),
    ...d.numbers,
    d.bonus,
    ...d.prizes,
  ]);
}

export function unpackDraws(packed: PackedDraw[]): HistoryDraw[] {
  return packed
    .filter((p) => Array.isArray(p) && p.length === 14)
    .map((p) => {
      const ymd = String(p[1]);
      return {
        no: p[0],
        date: `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`,
        numbers: p.slice(2, 8),
        bonus: p[8],
        prizes: p.slice(9, 14),
      };
    });
}

// ─────────────────────────────────────────────────────────────
// 번호 입력
// ─────────────────────────────────────────────────────────────

/** "1,2,3,4,5,6" 같은 쿼리 → 1~45 중복 없는 번호(최대 6개, 오름차순). 이상한 값은 버린다. */
export function parsePick(input: string | null | undefined): number[] {
  if (!input) return [];
  const out: number[] = [];
  for (const tok of input.split(/[^0-9]+/)) {
    if (!tok) continue;
    const n = Number(tok);
    if (validBall(n) && !out.includes(n)) out.push(n);
    if (out.length === 6) break;
  }
  return out.sort((a, b) => a - b);
}

export function isValidPick(pick: number[]): boolean {
  return pick.length === 6 && pick.every(validBall) && new Set(pick).size === 6;
}

// ─────────────────────────────────────────────────────────────
// 등수 판정과 시뮬레이션
// ─────────────────────────────────────────────────────────────

export type Judge = { match: number; bonusHit: boolean; rank: number };

/** 6개=1등, 5개+보너스=2등, 5개=3등, 4개=4등, 3개=5등, 그 밖=0(꽝) */
export function judge(pick: number[], draw: Pick<HistoryDraw, "numbers" | "bonus">): Judge {
  const main = new Set(draw.numbers);
  const match = pick.filter((n) => main.has(n)).length;
  const bonusHit = pick.includes(draw.bonus);
  let rank = 0;
  if (match === 6) rank = 1;
  else if (match === 5) rank = bonusHit ? 2 : 3;
  else if (match === 4) rank = 4;
  else if (match === 3) rank = 5;
  return { match, bonusHit, rank };
}

export type WinRecord = {
  no: number;
  date: string;
  rank: number;
  prize: number; // 1게임당 세전 금액(0 = 기록 없음)
  prizeKnown: boolean;
};

export type RankSummary = {
  rank: number;
  count: number; // 당첨 횟수
  total: number; // 당첨금 합계(세전, 기록 있는 회차만)
  unknown: number; // 당첨자가 없던 회차라 금액 기록이 없는 횟수
  expected: number; // 이론상 평균 횟수 = 게임 수 × 해당 조합 수 / 8,145,060
};

/** 5개를 맞힌 회차(2·3등) — 1등까지 번호 1개 차이 */
export type FiveMatch = WinRecord & {
  myMiss: number; // 내 번호 중 당첨번호가 아니었던 것
  drawnMiss: number; // 당첨번호 중 내가 못 고른 것
};

export type WhatIfResult = {
  pick: number[];
  games: number; // 산 게임 수(= 회차 수)
  firstNo: number;
  firstDate: string;
  lastNo: number;
  lastDate: string;
  spent: number; // 총 구매액
  totalPrize: number; // 총 당첨금(세전)
  net: number; // 총 당첨금 − 총 구매액
  returnRate: number; // 총 당첨금 ÷ 총 구매액
  ranks: RankSummary[]; // [1등..5등]
  winGames: number; // 5등 이상 당첨된 회차 수
  topWins: WinRecord[]; // 1~3등 당첨 회차(오름차순)
  bestWin: WinRecord | null; // 한 번에 가장 많이 받은 회차
  firstWin: WinRecord | null; // 처음 당첨된 회차
  matchCounts: number[]; // [0개..6개] 일치한 회차 수
  bestMatch: number; // 가장 많이 맞힌 개수
  bestMatchDraws: { no: number; date: string }[]; // 그 개수를 맞힌 회차(오름차순)
  fiveMatches: FiveMatch[]; // 5개 일치(2·3등)
  fourPlusBonus: { no: number; date: string }[]; // 당첨번호 4개 + 보너스까지 맞힌 회차(4등)
  longestDrought: { length: number; fromNo: number; toNo: number }; // 가장 길게 이어진 꽝
};

/** 1회부터 매주 같은 번호로 1게임씩 샀다고 보고 결과를 집계한다. draws는 회차 오름차순. */
export function simulate(pick: number[], draws: HistoryDraw[]): WhatIfResult {
  const ranks: RankSummary[] = [1, 2, 3, 4, 5].map((rank) => ({
    rank,
    count: 0,
    total: 0,
    unknown: 0,
    expected: (draws.length * RANK_COMBINATIONS[rank - 1]) / TOTAL_COMBINATIONS,
  }));
  const matchCounts = [0, 0, 0, 0, 0, 0, 0];
  const topWins: WinRecord[] = [];
  const fiveMatches: FiveMatch[] = [];
  const fourPlusBonus: { no: number; date: string }[] = [];
  let spent = 0;
  let totalPrize = 0;
  let winGames = 0;
  let bestWin: WinRecord | null = null;
  let firstWin: WinRecord | null = null;
  let drought = { length: 0, fromNo: 0, toNo: 0 };
  let runLen = 0;
  let runFrom = 0;
  const mine = new Set(pick);

  for (const d of draws) {
    spent += ticketPrice(d.no);
    const { match, bonusHit, rank } = judge(pick, d);
    matchCounts[match]++;
    if (match === 4 && bonusHit) fourPlusBonus.push({ no: d.no, date: d.date });

    if (rank === 0) {
      if (runLen === 0) runFrom = d.no;
      runLen++;
      if (runLen > drought.length) drought = { length: runLen, fromNo: runFrom, toNo: d.no };
      continue;
    }
    runLen = 0;
    winGames++;

    const prize = d.prizes[rank - 1] ?? 0;
    const rec: WinRecord = { no: d.no, date: d.date, rank, prize, prizeKnown: prize > 0 };
    const s = ranks[rank - 1];
    s.count++;
    if (rec.prizeKnown) {
      s.total += prize;
      totalPrize += prize;
    } else {
      s.unknown++;
    }
    if (!firstWin) firstWin = rec;
    if (rec.prizeKnown && (!bestWin || prize > bestWin.prize)) bestWin = rec;
    if (rank <= 3) topWins.push(rec);
    if (match === 5) {
      fiveMatches.push({
        ...rec,
        myMiss: pick.find((n) => !d.numbers.includes(n)) ?? 0,
        drawnMiss: d.numbers.find((n) => !mine.has(n)) ?? 0,
      });
    }
  }

  let bestMatch = 0;
  for (let m = 6; m >= 0; m--) {
    if (matchCounts[m] > 0) {
      bestMatch = m;
      break;
    }
  }
  const bestMatchDraws = draws
    .filter((d) => judge(pick, d).match === bestMatch)
    .map((d) => ({ no: d.no, date: d.date }));

  const first = draws[0];
  const last = draws[draws.length - 1];
  return {
    pick: [...pick].sort((a, b) => a - b),
    games: draws.length,
    firstNo: first?.no ?? 0,
    firstDate: first?.date ?? "",
    lastNo: last?.no ?? 0,
    lastDate: last?.date ?? "",
    spent,
    totalPrize,
    net: totalPrize - spent,
    returnRate: spent > 0 ? totalPrize / spent : 0,
    ranks,
    winGames,
    topWins,
    bestWin,
    firstWin,
    matchCounts,
    bestMatch,
    bestMatchDraws,
    fiveMatches,
    fourPlusBonus,
    longestDrought: drought,
  };
}

/**
 * 비교 기준: 45개 중 6개를 무작위로 고른 조합 하나의 "평균" 당첨금.
 * 회차마다 등수별 조합 수 × 실제 1게임당 금액 ÷ 8,145,060 을 더한다(금액 기록 없는 등수는 0).
 * lowerOnly = 4·5등만 더한 값(1~3등은 대부분의 조합이 한 번도 못 받는 금액이라 따로 본다).
 */
export function averageReturn(draws: HistoryDraw[]): {
  spent: number;
  expectedPrize: number;
  rate: number;
  lowerOnlyRate: number;
} {
  let spent = 0;
  let all = 0;
  let lower = 0;
  for (const d of draws) {
    spent += ticketPrice(d.no);
    for (let k = 0; k < 5; k++) {
      const v = (RANK_COMBINATIONS[k] * (d.prizes[k] ?? 0)) / TOTAL_COMBINATIONS;
      all += v;
      if (k >= 3) lower += v;
    }
  }
  return {
    spent,
    expectedPrize: all,
    rate: spent > 0 ? all / spent : 0,
    lowerOnlyRate: spent > 0 ? lower / spent : 0,
  };
}

// ─────────────────────────────────────────────────────────────
// 표시용 문자열
// ─────────────────────────────────────────────────────────────

/** 원 단위까지 정확히: 1,338,000 → "133만 8,000원", 2,025,045,509 → "20억 2,504만 5,509원" */
export function formatWon(amount: number): string {
  const n = Math.round(Math.abs(amount));
  const sign = amount < 0 ? "−" : "";
  if (n === 0) return "0원";
  const eok = Math.floor(n / 100_000_000);
  const man = Math.floor((n % 100_000_000) / 10_000);
  const rest = n % 10_000;
  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok.toLocaleString("ko-KR")}억`);
  if (man > 0) parts.push(`${man.toLocaleString("ko-KR")}만`);
  if (rest > 0) parts.push(rest.toLocaleString("ko-KR"));
  return `${sign}${parts.join(" ")}원`;
}

/** 0.2196 → "22.0%", 1513.741 → "151,374.1%" */
export function formatRate(rate: number): string {
  return `${(rate * 100).toLocaleString("ko-KR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

/** 이론상 평균 횟수 표기: 28.07 → "28.1", 0.0352 → "0.035", 0.000154 → "0.00015" */
export function formatExpected(x: number): string {
  if (x >= 1) return x.toFixed(1);
  if (x <= 0) return "0";
  return String(Number(x.toPrecision(2)));
}

/** 주 → 대략 몇 년(소수 첫째 자리) */
export function weeksToYears(weeks: number): string {
  return ((weeks * 7) / 365.25).toFixed(1);
}

/** "2002-12-07" → "2002년 12월 7일" */
export function formatDateKo(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

export function pickLabel(pick: number[]): string {
  return pick.join("·");
}

/** 결과 한 줄 요약 */
export function summaryLine(r: WhatIfResult): string {
  const head = `${pickLabel(r.pick)} 번호로 제${r.firstNo}회부터 제${r.lastNo}회까지 ${r.games.toLocaleString("ko-KR")}주 동안 매주 1게임씩 샀다면 ${formatWon(r.spent)}을 쓰고 당첨금 ${formatWon(r.totalPrize)}을 받았어요(회수율 ${formatRate(r.returnRate)}).`;
  const top = r.ranks.find((s) => s.count > 0);
  if (!top) return `${head} 5등 이상은 한 번도 없었어요.`;
  const tail =
    top.unknown > 0
      ? ` 그중 ${top.unknown}번은 실제 ${top.rank}등 당첨자가 없던 회차라 금액 기록이 없어 합계에서 뺐어요.`
      : "";
  if (top.rank === 1) return `${head} 1등이 ${top.count}번 나왔어요.${tail}`;
  return `${head} 최고 성적은 ${top.rank}등(${top.count}번)이에요.${tail}`;
}
