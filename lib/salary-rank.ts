// 연봉(근로소득) 상위 % 근사.
// ⚠️ 국세청 근로소득 분포를 참고한 대략적인 값입니다. 재미·참고용이며
// 실제 통계와 차이날 수 있어요.

// [연봉(원), 상위 %] — 연봉이 높을수록 상위 %는 작아짐
const DIST: [number, number][] = [
  [15_000_000, 92],
  [25_000_000, 78],
  [30_000_000, 68],
  [35_000_000, 55],
  [40_000_000, 46],
  [45_000_000, 38],
  [50_000_000, 32],
  [60_000_000, 23],
  [70_000_000, 17],
  [80_000_000, 13],
  [90_000_000, 10],
  [100_000_000, 7.5],
  [120_000_000, 5],
  [150_000_000, 3],
  [200_000_000, 1.5],
  [300_000_000, 0.7],
];

// 연봉 → 상위 %
export function salaryTopPercent(salary: number): number {
  if (salary <= DIST[0][0]) return 95;
  const last = DIST[DIST.length - 1];
  if (salary >= last[0]) return 0.4;
  for (let i = 0; i < DIST.length - 1; i++) {
    const [s0, p0] = DIST[i];
    const [s1, p1] = DIST[i + 1];
    if (salary >= s0 && salary <= s1) {
      const t = (salary - s0) / (s1 - s0);
      return p0 + (p1 - p0) * t;
    }
  }
  return 50;
}
