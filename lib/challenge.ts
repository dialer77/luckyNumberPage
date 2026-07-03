// 1등 도전 시뮬레이터에서 쓰는 공용 로직 (클라이언트 페이지 + OG 카드가 공유).
// 등수별 당첨금은 회차마다 다르므로 lotto-data 의 drawPrizes(회차) 로 구합니다.

/** 등수(1~5) → 이름. 0/그 외는 "꽝" */
export function rankName(rank: number): string {
  return rank >= 1 && rank <= 5 ? `${rank}등` : "꽝";
}

// 매주 일정 금액씩 로또를 산다고 했을 때, 그 횟수만큼 사려면 걸리는 기간.
// 기본 가정: 주 5,000원 = 한 게임 1,000원 × 주 5게임.
export function formatBuyDuration(tries: number, weeklyBudget = 5000): string {
  const ticketsPerWeek = weeklyBudget / 1000; // 주당 게임 수
  const weeks = tries / ticketsPerWeek;
  const years = weeks / 52;

  if (years >= 1) {
    const y = Math.floor(years);
    const months = Math.round((years - y) * 12);
    return months > 0
      ? `${y.toLocaleString()}년 ${months}개월`
      : `${y.toLocaleString()}년`;
  }
  return `${Math.max(1, Math.round(weeks))}주`;
}

// 한 번의 시뮬레이션 실행 결과
export type RunResult = {
  mode: "fixed" | "until1"; // 정해진 횟수 / 1등 나올 때까지
  drwNo: number; // 목표로 삼은 회차 (당첨금 계산 기준)
  tries: number; // 시도 횟수
  bestRank: number; // 최고 등수 (1이 가장 좋음, 0=꽝)
  winnings: number; // 총 당첨금
  spent: number; // 총 구매액 (tries * 1000)
  counts: number[]; // 등수별 당첨 횟수 [1등, 2등, 3등, 4등, 5등]
};

// 등수별 당첨금 소계. prizes = 해당 회차의 등수별 1게임당 당첨금(drawPrizes).
export function prizeBreakdown(
  counts: number[],
  prizes: Record<number, number>
): { rank: number; count: number; amount: number }[] {
  return counts
    .map((count, i) => ({
      rank: i + 1,
      count,
      amount: count * prizes[i + 1],
    }))
    .filter((b) => b.count > 0);
}

// 결과를 URL에 담기 좋은 짧은 코드로 인코딩/디코딩.
// 예: "f-1180-1000-4-105000-0.0.0.2.1"
//     (모드-회차-시도-최고등수-총당첨금-등수별횟수)
export function encodeRun(r: RunResult): string {
  const m = r.mode === "until1" ? "u" : "f";
  return `${m}-${r.drwNo}-${r.tries}-${r.bestRank}-${r.winnings}-${r.counts.join(
    "."
  )}`;
}

export function decodeRun(code: string): RunResult | null {
  const p = code.split("-");
  if (p.length < 5) return null;
  const drwNo = Number(p[1]);
  const tries = Number(p[2]);
  const bestRank = Number(p[3]);
  const winnings = Number(p[4]);
  if (![drwNo, tries, bestRank, winnings].every(Number.isFinite)) return null;

  let counts = [0, 0, 0, 0, 0];
  if (p[5]) {
    const c = p[5].split(".").map(Number);
    if (c.length === 5 && c.every(Number.isFinite)) counts = c;
  }
  return {
    mode: p[0] === "u" ? "until1" : "fixed",
    drwNo,
    tries,
    bestRank,
    winnings,
    spent: tries * 1000,
    counts,
  };
}
