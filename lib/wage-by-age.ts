// 나이대별 월급 수준 — 국가데이터처(옛 통계청) 공식 자료로 계산.
//
// 출처: 국가데이터처 「2024년 임금근로일자리 소득(보수) 결과」 보도자료(2026-02-24)
//       통계표 7. 연령별 소득, 8. 성·연령별 소득
//       https://www.korea.kr/briefing/pressReleaseView.do?newsId=156745446
// '소득'은 고용주가 근로자에게 지급한 보수로 **세전, 월 단위**다(출장비 등 실비변상 비과세 제외).
// 2024년 12월 임금근로일자리 근로자 기준, 연령은 12월 31일 기준.
//
// 상위 % 추정: 소득 구간(10개)별 비중을 누적하고, 구간 안에서는 고르게 퍼져 있다고 보고
// 직선으로 잇는다. 이렇게 구한 중위값이 공식 중위값과 거의 같다(검증 스크립트로 확인).
// 맨 위 구간(1,000만원 이상)은 위쪽 끝이 없어 그 안에서는 "상위 몇 % 이내"로만 말한다.

export const WAGE_SOURCE = {
  name: "국가데이터처 2024년 임금근로일자리 소득(보수) 결과",
  year: 2024,
  url: "https://www.korea.kr/briefing/pressReleaseView.do?newsId=156745446",
};

/** 소득 구간 경계(만원, 월) — 마지막 구간은 1,000만원 이상 */
export const BAND_EDGES = [0, 85, 150, 250, 350, 450, 550, 650, 800, 1000] as const;
export const BAND_LABELS = [
  "85만원 미만",
  "85~150만원",
  "150~250만원",
  "250~350만원",
  "350~450만원",
  "450~550만원",
  "550~650만원",
  "650~800만원",
  "800~1,000만원",
  "1,000만원 이상",
];

export type AgeGroup = {
  key: string;
  label: string;
  /** 구간별 비중(%) — BAND_LABELS 순서 */
  share: number[];
  mean: number; // 평균(만원, 월)
  median: number; // 중위(만원, 월)
  male: { mean: number; median: number };
  female: { mean: number; median: number };
};

// 표 7(연령별 소득)과 표 8(성·연령별 소득)의 2024년 값
export const AGE_GROUPS: AgeGroup[] = [
  { key: "all", label: "전체", share: [12.2, 8.4, 20.9, 20.1, 11.7, 7.8, 5.3, 5.6, 3.7, 4.3], mean: 375, median: 288, male: { mean: 442, median: 344 }, female: { mean: 289, median: 240 } },
  { key: "u19", label: "19세 이하", share: [61.2, 17.2, 14.0, 5.7, 1.2, 0.4, 0.2, 0.1, 0.0, 0.0], mean: 95, median: 62, male: { mean: 103, median: 64 }, female: { mean: 88, median: 60 } },
  { key: "20-24", label: "20~24세", share: [25.2, 12.0, 29.4, 23.9, 6.2, 1.7, 0.8, 0.5, 0.1, 0.1], mean: 200, median: 210, male: { mean: 214, median: 222 }, female: { mean: 187, median: 205 } },
  { key: "25-29", label: "25~29세", share: [7.4, 4.9, 24.2, 34.8, 16.2, 6.1, 3.0, 2.4, 0.8, 0.3], mean: 304, median: 284, male: { mean: 315, median: 296 }, female: { mean: 290, median: 272 } },
  { key: "30-34", label: "30~34세", share: [5.4, 4.0, 16.4, 29.0, 20.9, 11.1, 5.1, 4.2, 2.5, 1.3], mean: 368, median: 333, male: { mean: 389, median: 353 }, female: { mean: 339, median: 306 } },
  { key: "35-39", label: "35~39세", share: [5.7, 4.7, 14.6, 20.9, 17.9, 13.5, 7.8, 6.3, 4.5, 4.1], mean: 430, median: 372, male: { mean: 471, median: 410 }, female: { mean: 371, median: 311 } },
  { key: "40-44", label: "40~44세", share: [6.5, 5.7, 15.7, 16.6, 13.4, 12.4, 10.0, 8.1, 5.4, 6.3], mean: 464, median: 389, male: { mean: 529, median: 461 }, female: { mean: 369, median: 290 } },
  { key: "45-49", label: "45~49세", share: [7.4, 6.8, 17.9, 15.8, 10.7, 9.3, 8.9, 9.9, 5.6, 7.7], mean: 474, median: 368, male: { mean: 559, median: 479 }, female: { mean: 357, median: 266 } },
  { key: "50-54", label: "50~54세", share: [8.6, 8.0, 20.2, 16.7, 9.4, 7.3, 6.3, 9.3, 5.8, 8.4], mean: 464, median: 324, male: { mean: 566, median: 455 }, female: { mean: 326, median: 249 } },
  { key: "55-59", label: "55~59세", share: [10.6, 9.9, 21.9, 17.6, 8.8, 6.4, 4.5, 6.9, 6.1, 7.2], mean: 424, median: 287, male: { mean: 529, median: 394 }, female: { mean: 283, median: 231 } },
  { key: "60-64", label: "60~64세", share: [13.9, 14.3, 28.0, 18.3, 7.8, 5.1, 3.2, 3.3, 2.9, 3.3], mean: 319, median: 230, male: { mean: 392, median: 280 }, female: { mean: 220, median: 200 } },
  { key: "65-69", label: "65~69세", share: [19.8, 17.2, 31.7, 16.0, 5.5, 3.0, 1.8, 1.9, 1.1, 2.0], mean: 253, median: 200, male: { mean: 317, median: 233 }, female: { mean: 169, median: 149 } },
  { key: "70+", label: "70세 이상", share: [48.6, 14.5, 22.7, 7.2, 2.1, 1.3, 0.7, 0.8, 0.6, 1.5], mean: 165, median: 90, male: { mean: 234, median: 166 }, female: { mean: 95, median: 58 } },
];

export function getAgeGroup(key: string): AgeGroup | undefined {
  return AGE_GROUPS.find((g) => g.key === key);
}

/** 구간별 비중을 합이 100이 되게 맞춘 값(반올림 오차 보정) */
function normalized(share: number[]): number[] {
  const sum = share.reduce((sum0, x) => sum0 + x, 0);
  return share.map((x) => (x / sum) * 100);
}

// 누적 분포의 꺾은선 점들: [월 소득(만원), 그 아래 비율(%)].
// 구간 경계마다 점을 두고, 공식 중위값을 (중위, 50%) 점으로 끼워 넣어 가운데를 정확히 맞춘다.
// 맨 위 구간(1,000만원 이상)은 끝이 없어 점을 두지 않는다.
function knots(group: AgeGroup): [number, number][] {
  const share = normalized(group.share);
  const pts: [number, number][] = [];
  let below = 0;
  for (let b = 0; b < BAND_EDGES.length; b++) {
    pts.push([BAND_EDGES[b], below]);
    below += share[b];
  }
  const m = group.median;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, c0] = pts[i];
    const [x1, c1] = pts[i + 1];
    if (x0 < m && m < x1 && c0 < 50 && 50 < c1) {
      pts.splice(i + 1, 0, [m, 50]);
      break;
    }
  }
  return pts;
}

export type WageRank = {
  /** 상위 % (작을수록 높음) */
  topPercent: number;
  /** 맨 위 구간에 있어 "상위 topPercent% 이내"로만 말할 수 있으면 true */
  openTop: boolean;
  /** 소득이 속한 구간 번호(BAND_LABELS 기준) */
  band: number;
};

function bandOf(monthlyManwon: number): number {
  let b = 0;
  for (let i = 0; i < BAND_EDGES.length; i++) if (monthlyManwon >= BAND_EDGES[i]) b = i;
  return b;
}

/** 월 세전 소득(만원) → 그 나이대에서 상위 몇 % */
export function wageTopPercent(group: AgeGroup, monthlyManwon: number): WageRank {
  const x = Math.max(0, monthlyManwon);
  const pts = knots(group);
  const last = pts[pts.length - 1];
  const band = bandOf(x);
  if (x >= last[0]) return { topPercent: 100 - last[1], openTop: true, band };
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, c0] = pts[i];
    const [x1, c1] = pts[i + 1];
    if (x >= x0 && x < x1) {
      const below = c0 + ((c1 - c0) * (x - x0)) / (x1 - x0);
      return { topPercent: Math.max(0, 100 - below), openTop: false, band };
    }
  }
  return { topPercent: 100, openTop: false, band };
}

/** 그 나이대에서 상위 p%의 경계 월 소득(만원). 맨 위 구간 안이면 null */
export function wageAtTopPercent(group: AgeGroup, p: number): number | null {
  const targetBelow = 100 - p;
  const pts = knots(group);
  if (targetBelow > pts[pts.length - 1][1]) return null;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, c0] = pts[i];
    const [x1, c1] = pts[i + 1];
    if (targetBelow >= c0 && targetBelow <= c1 && c1 > c0) {
      return x0 + ((targetBelow - c0) / (c1 - c0)) * (x1 - x0);
    }
  }
  return null;
}
