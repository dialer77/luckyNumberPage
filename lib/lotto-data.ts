// ─────────────────────────────────────────────────────────────
// 로또 데이터 계층 (샘플)
//
// 실데이터는 lib/lotto-live.ts(Upstash)에서 읽고, 이 파일의 DRAWS는 조회 실패 시 폴백입니다.
// 화면(page.tsx)들은 이 파일의 함수만 호출하므로, 데이터 출처가
// 바뀌어도 UI 코드는 그대로 둘 수 있습니다. (관심사 분리)
//
// Flutter 대응: Dart의 model class + repository 패턴과 같은 역할.
//   LottoDraw = 데이터 모델(class)
//   아래 함수들 = repository(데이터를 꺼내주는 계층)
// ─────────────────────────────────────────────────────────────

/** 한 회차의 추첨 결과 */
export type LottoDraw = {
  drwNo: number; // 회차
  drwNoDate: string; // 추첨일 (YYYY-MM-DD)
  numbers: [number, number, number, number, number, number]; // 당첨번호 6개
  bonus: number; // 보너스 번호
  firstWinAmount: number; // 1등 1게임당 당첨금 (원)
  firstWinnerCount: number; // 1등 당첨자 수
  prize2: number; // 2등 1게임당 당첨금 (원)
  prize3: number; // 3등 1게임당 당첨금 (원)
  // 4등(5만원)·5등(5천원)은 규정상 고정이라 저장하지 않음 (drawPrizes 참고)
};

// 폴백용 내장 회차 데이터 (최신 회차가 배열 앞쪽).
// 실서비스 데이터는 Upstash(lib/lotto-live.ts)에서 읽고, 조회에 실패했을 때만 이 값을 씁니다.
// 그래서 지어낸 값이 아니라 실제 추첨 결과(제1169~1180회, smok95/lotto 기준)를 그대로 넣어 둡니다.
// ⚠️ 이 배열에 가짜 번호를 넣지 말 것 — 폴백 시 실제 회차처럼 화면에 표시됩니다.
const DRAWS: LottoDraw[] = [
  { drwNo: 1180, drwNoDate: "2025-07-12", numbers: [6, 12, 18, 37, 40, 41], bonus: 3, firstWinAmount: 2_535_566_421, firstWinnerCount: 11, prize2: 64_563_034, prize3: 1_544_365 },
  { drwNo: 1179, drwNoDate: "2025-07-05", numbers: [3, 16, 18, 24, 40, 44], bonus: 21, firstWinAmount: 2_162_821_097, firstWinnerCount: 13, prize2: 74_382_737, prize3: 1_567_787 },
  { drwNo: 1178, drwNoDate: "2025-06-28", numbers: [5, 6, 11, 27, 43, 44], bonus: 17, firstWinAmount: 2_391_608_407, firstWinnerCount: 12, prize2: 53_744_010, prize3: 1_562_633 },
  { drwNo: 1177, drwNoDate: "2025-06-21", numbers: [3, 7, 15, 16, 19, 43], bonus: 21, firstWinAmount: 4_576_672_000, firstWinnerCount: 6, prize2: 61_022_294, prize3: 1_471_126 },
  { drwNo: 1176, drwNoDate: "2025-06-14", numbers: [7, 9, 11, 21, 30, 35], bonus: 29, firstWinAmount: 2_052_166_154, firstWinnerCount: 13, prize2: 49_959_102, prize3: 1_258_523 },
  { drwNo: 1175, drwNoDate: "2025-06-07", numbers: [3, 4, 6, 8, 32, 42], bonus: 31, firstWinAmount: 1_384_026_094, firstWinnerCount: 20, prize2: 50_145_873, prize3: 1_451_675 },
  { drwNo: 1174, drwNoDate: "2025-05-31", numbers: [8, 11, 14, 17, 36, 39], bonus: 22, firstWinAmount: 1_910_619_425, firstWinnerCount: 15, prize2: 56_194_689, prize3: 1_494_540 },
  { drwNo: 1173, drwNoDate: "2025-05-24", numbers: [1, 5, 18, 20, 30, 35], bonus: 3, firstWinAmount: 1_179_946_063, firstWinnerCount: 24, prize2: 50_210_471, prize3: 1_503_595 },
  { drwNo: 1172, drwNoDate: "2025-05-17", numbers: [7, 9, 24, 40, 42, 44], bonus: 45, firstWinAmount: 2_203_004_452, firstWinnerCount: 13, prize2: 48_705_881, prize3: 1_560_372 },
  { drwNo: 1171, drwNoDate: "2025-05-10", numbers: [3, 6, 7, 11, 12, 17], bonus: 19, firstWinAmount: 1_128_345_286, firstWinnerCount: 21, prize2: 26_683_842, prize3: 742_752 },
  { drwNo: 1170, drwNoDate: "2025-05-03", numbers: [3, 13, 28, 34, 38, 42], bonus: 25, firstWinAmount: 1_386_550_969, firstWinnerCount: 20, prize2: 44_872_200, prize3: 815_427 },
  { drwNo: 1169, drwNoDate: "2025-04-26", numbers: [5, 12, 24, 26, 39, 42], bonus: 20, firstWinAmount: 2_852_735_813, firstWinnerCount: 10, prize2: 42_451_426, prize3: 1_465_648 },
];

// 등수 → 1게임당 당첨금. 1·2·3등은 해당 회차 실제 금액, 4·5등은 규정상 고정.
export function drawPrizes(draw: LottoDraw): Record<number, number> {
  return {
    1: draw.firstWinAmount,
    2: draw.prize2,
    3: draw.prize3,
    4: 50_000,
    5: 5_000,
  };
}

// ─────────────────────────────────────────────────────────────
// 회차별 번호 구성 분석 — 6개 당첨번호만으로 계산되는 "그 회차만의" 지표.
// 로또 커뮤니티에서 실제로 쓰는 홀짝·고저·합계·연속·AC값 등을 산출해,
// 회차마다 서로 다른 고유 콘텐츠를 만든다. (외부 데이터 불필요)
// ─────────────────────────────────────────────────────────────
export type DrawAnalysis = {
  sum: number; // 당첨번호 6개 합계
  average: number; // 6개 평균
  oddCount: number; // 홀수 개수
  evenCount: number; // 짝수 개수
  lowCount: number; // 저(1~22) 개수
  highCount: number; // 고(23~45) 개수
  min: number;
  max: number;
  range: number; // 최고 − 최저
  consecutivePairs: number; // 연속한 번호 쌍 수 (예: 24·25)
  acValue: number; // 산술복잡도(AC값) 0~10, 높을수록 번호가 고르게 흩어짐
  bandCounts: number[]; // 구간별 개수 [1-10,11-20,21-30,31-40,41-45]
};

/** 이론상 기준값 (참고용). 1~45 균등 추첨 가정. */
export const DRAW_BASELINE = { sum: 138, oddEven: "3:3", lowHigh: "약 3:3" };

/** 한 회차의 당첨번호 6개를 분석해 지표를 계산 */
export function analyzeDraw(draw: LottoDraw): DrawAnalysis {
  const nums = [...draw.numbers].sort((a, b) => a - b);
  const sum = nums.reduce((s, n) => s + n, 0);
  const oddCount = nums.filter((n) => n % 2 === 1).length;
  const lowCount = nums.filter((n) => n <= 22).length;

  let consecutivePairs = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    if (nums[i + 1] - nums[i] === 1) consecutivePairs++;
  }

  // AC값 = (서로 다른 양의 차이 개수) − (개수 − 1). 최댓값 10.
  const diffs = new Set<number>();
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) diffs.add(nums[j] - nums[i]);
  }
  const acValue = diffs.size - (nums.length - 1);

  const bands = [0, 0, 0, 0, 0];
  for (const n of nums) {
    const idx = Math.min(Math.floor((n - 1) / 10), 4); // 41~45는 5번째 구간
    bands[idx]++;
  }

  return {
    sum,
    average: Math.round((sum / nums.length) * 10) / 10,
    oddCount,
    evenCount: nums.length - oddCount,
    lowCount,
    highCount: nums.length - lowCount,
    min: nums[0],
    max: nums[nums.length - 1],
    range: nums[nums.length - 1] - nums[0],
    consecutivePairs,
    acValue,
    bandCounts: bands,
  };
}

/** 모든 회차 (최신순) */
export function getAllDraws(): LottoDraw[] {
  return DRAWS;
}

/** 특정 회차 하나 조회. 없으면 undefined */
export function getDraw(drwNo: number): LottoDraw | undefined {
  return DRAWS.find((d) => d.drwNo === drwNo);
}

/** 가장 최근 회차 */
export function getLatestDraw(): LottoDraw {
  return DRAWS[0];
}

/**
 * 번호별 출현 횟수 통계.
 * 1~45 각 번호가 (당첨번호로) 몇 번 나왔는지 집계해서
 * 많이 나온 순으로 정렬해 반환.
 */
export function getNumberFrequency(): { number: number; count: number }[] {
  const counts = new Map<number, number>();
  for (let n = 1; n <= 45; n++) counts.set(n, 0);

  for (const draw of DRAWS) {
    for (const n of draw.numbers) {
      counts.set(n, (counts.get(n) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([number, count]) => ({ number, count }))
    .sort((a, b) => b.count - a.count || a.number - b.number);
}

/**
 * 로또 공식 색상 규칙에 따라 번호 구간별 색을 돌려줌.
 * (Tailwind 클래스로 반환 → 화면에서 공 색칠에 사용)
 */
export function ballColor(n: number): string {
  if (n <= 10) return "bg-yellow-400 text-yellow-950";
  if (n <= 20) return "bg-blue-500 text-white";
  if (n <= 30) return "bg-red-500 text-white";
  if (n <= 40) return "bg-gray-500 text-white";
  return "bg-green-500 text-white";
}

/** 큰 금액을 "24억 3,100만원" 형태로 포맷. 음수/1만원 미만도 처리. */
export function formatKRW(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);

  // 1만원 미만은 그대로 "5,000원"
  if (abs < 10_000) return `${sign}${abs.toLocaleString()}원`;

  const eok = Math.floor(abs / 100_000_000);
  const man = Math.floor((abs % 100_000_000) / 10_000);
  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok.toLocaleString()}억`);
  if (man > 0) parts.push(`${man.toLocaleString()}만`);
  return sign + (parts.join(" ") || "0") + "원";
}

// ─────────────────────────────────────────────────────────────
// 세금 계산 (한국 복권 당첨금 기준)
//   · 200만원 이하: 비과세
//   · 3억원 이하 부분: 22% (소득세 20% + 지방소득세 2%)
//   · 3억원 초과 부분: 33% (소득세 30% + 지방소득세 3%)
// ⚠️ 참고용 근사치입니다. 실제 세율/공제는 변동될 수 있어요.
// ─────────────────────────────────────────────────────────────
const TAX_THRESHOLD = 300_000_000; // 3억
const TAX_RATE_LOW = 0.22;
const TAX_RATE_HIGH = 0.33;

/** 세금 총액 */
export function calcTax(amount: number): number {
  if (amount <= 2_000_000) return 0;
  if (amount <= TAX_THRESHOLD) return Math.floor(amount * TAX_RATE_LOW);
  const low = TAX_THRESHOLD * TAX_RATE_LOW;
  const high = (amount - TAX_THRESHOLD) * TAX_RATE_HIGH;
  return Math.floor(low + high);
}

/** 세후 실수령액 */
export function afterTax(amount: number): number {
  return amount - calcTax(amount);
}

// ─────────────────────────────────────────────────────────────
// "이 돈이면 뭘 할 수 있나" — 재미(공유) 요소.
// 가격은 대략적인 예시값입니다. (2026년 기준 어림값)
// ─────────────────────────────────────────────────────────────
type BuyItem = {
  emoji: string;
  label: string; // 무엇을
  unit: string; // 세는 단위 (채/대/회 ...)
  price: number; // 개당 가격(원)
};

const BUY_ITEMS: BuyItem[] = [
  { emoji: "🏙️", label: "서울 아파트", unit: "채", price: 1_200_000_000 },
  { emoji: "🏎️", label: "포르쉐 911", unit: "대", price: 180_000_000 },
  { emoji: "🚗", label: "제네시스 G80", unit: "대", price: 65_000_000 },
  { emoji: "✈️", label: "인천–뉴욕 비즈니스 왕복", unit: "회", price: 8_000_000 },
  { emoji: "📱", label: "최신 아이폰", unit: "대", price: 1_800_000 },
  { emoji: "🍗", label: "치킨", unit: "마리", price: 22_000 },
];

/**
 * 주어진 금액으로 각 항목을 몇 개 살 수 있는지 계산.
 * 1개 미만이면 소수 첫째 자리까지 보여줌.
 */
export function whatCanYouBuy(
  amount: number
): { emoji: string; label: string; text: string }[] {
  return BUY_ITEMS.map(({ emoji, label, unit, price }) => {
    const ratio = amount / price;
    const text =
      ratio >= 1
        ? `${Math.floor(ratio).toLocaleString()}${unit}`
        : `${ratio.toFixed(1)}${unit}`;
    return { emoji, label, text };
  });
}
