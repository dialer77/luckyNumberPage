// ─────────────────────────────────────────────────────────────
// 로또 데이터 계층 (샘플)
//
// ⚠️ 지금은 하드코딩된 "예시 데이터"입니다.
// 실제 배포 시에는 이 파일을 §8-1 데이터 파이프라인(동행복권 수집 →
// 자체 DB)에서 읽어오는 코드로 교체하면 됩니다.
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

// 예시 회차 데이터 (최신 회차가 배열 앞쪽).
// 실제 서비스에서는 전 회차를 자체 DB에 축적합니다.
const DRAWS: LottoDraw[] = [
  { drwNo: 1180, drwNoDate: "2026-06-27", numbers: [3, 12, 19, 27, 38, 42], bonus: 7, firstWinAmount: 2_431_000_000, firstWinnerCount: 11, prize2: 54_800_000, prize3: 1_640_000 },
  { drwNo: 1179, drwNoDate: "2026-06-20", numbers: [8, 15, 22, 24, 31, 45], bonus: 18, firstWinAmount: 1_876_540_000, firstWinnerCount: 14, prize2: 48_200_000, prize3: 1_510_000 },
  { drwNo: 1178, drwNoDate: "2026-06-13", numbers: [1, 9, 16, 28, 33, 40], bonus: 25, firstWinAmount: 3_102_880_000, firstWinnerCount: 8, prize2: 61_300_000, prize3: 1_720_000 },
  { drwNo: 1177, drwNoDate: "2026-06-06", numbers: [5, 11, 20, 29, 36, 44], bonus: 2, firstWinAmount: 2_045_120_000, firstWinnerCount: 13, prize2: 50_900_000, prize3: 1_480_000 },
  { drwNo: 1176, drwNoDate: "2026-05-30", numbers: [4, 13, 18, 23, 39, 41], bonus: 30, firstWinAmount: 1_559_770_000, firstWinnerCount: 17, prize2: 43_600_000, prize3: 1_390_000 },
  { drwNo: 1175, drwNoDate: "2026-05-23", numbers: [7, 14, 21, 26, 35, 43], bonus: 10, firstWinAmount: 2_780_430_000, firstWinnerCount: 9, prize2: 58_100_000, prize3: 1_680_000 },
  { drwNo: 1174, drwNoDate: "2026-05-16", numbers: [2, 10, 17, 32, 37, 45], bonus: 6, firstWinAmount: 1_920_650_000, firstWinnerCount: 12, prize2: 49_500_000, prize3: 1_530_000 },
  { drwNo: 1173, drwNoDate: "2026-05-09", numbers: [6, 12, 24, 30, 34, 42], bonus: 19, firstWinAmount: 3_450_000_000, firstWinnerCount: 7, prize2: 64_700_000, prize3: 1_790_000 },
  { drwNo: 1172, drwNoDate: "2026-05-02", numbers: [1, 8, 15, 27, 33, 44], bonus: 22, firstWinAmount: 2_210_340_000, firstWinnerCount: 11, prize2: 52_300_000, prize3: 1_600_000 },
  { drwNo: 1171, drwNoDate: "2026-04-25", numbers: [9, 16, 20, 28, 38, 40], bonus: 3, firstWinAmount: 1_688_910_000, firstWinnerCount: 15, prize2: 45_800_000, prize3: 1_440_000 },
  { drwNo: 1170, drwNoDate: "2026-04-18", numbers: [4, 11, 19, 25, 31, 43], bonus: 14, firstWinAmount: 2_905_770_000, firstWinnerCount: 8, prize2: 59_600_000, prize3: 1_710_000 },
  { drwNo: 1169, drwNoDate: "2026-04-11", numbers: [5, 13, 22, 29, 36, 41], bonus: 17, firstWinAmount: 1_777_200_000, firstWinnerCount: 16, prize2: 47_100_000, prize3: 1_470_000 },
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
