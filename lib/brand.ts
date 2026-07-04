// 사이트 브랜드 구조 (한 곳에서 관리).
//
// 우산(부모) 브랜드 "만약에" 아래에 영역별 서브브랜드가 붙는 구조.
// 홈 허브·헤더·푸터가 모두 이 파일을 참조하므로, 서브브랜드를 추가하려면
// 여기 SUB_BRANDS 배열에 한 줄만 넣으면 됩니다.

export const SITE = {
  name: "만약에",
  emoji: "🔮",
  tagline: "만약에 ~하면, 얼마?",
  description:
    "로또·투자·계산으로 '만약에 얼마?'를 재미로 확인하는 곳. 당첨금·수익·세금을 시뮬레이션해 보세요.",
  url: "https://manyage.com",
};

export type SubBrand = {
  key: string;
  emoji: string;
  name: string;
  tagline: string;
  status: "live" | "soon"; // live = 이용 가능, soon = 준비 중(예고만)
  href?: string; // live일 때 이동 경로
};

// 우산 아래 서브브랜드들. 위에서부터 홈 허브에 노출됨.
export const SUB_BRANDS: SubBrand[] = [
  {
    key: "lotto",
    emoji: "🍀",
    name: "행운노트",
    tagline: "로또·복권 당첨번호 조회부터 1등 도전·랭킹까지",
    status: "live",
    href: "/lotto",
  },
  {
    key: "invest",
    emoji: "📈",
    name: "그때샀으면",
    tagline: "그때 주식·코인을 샀다면 지금 얼마가 됐을까?",
    status: "live",
    href: "/invest",
  },
  {
    key: "calc",
    emoji: "🧮",
    name: "머니계산기",
    tagline: "당첨금 실수령·세금·복리 등 돈 계산 모음",
    status: "live",
    href: "/calc",
  },
];

// 행운노트(로또) 서브브랜드의 세부 기능 — 홈 허브와 로또 섹션에서 사용.
export const LOTTO_FEATURES = [
  { href: "/lotto", emoji: "📜", title: "회차별 당첨번호", desc: "역대 회차를 한눈에 조회" },
  { href: "/stats", emoji: "📊", title: "번호 출현 통계", desc: "어떤 번호가 자주 나왔나" },
  { href: "/tools/generator", emoji: "🎲", title: "번호 생성기", desc: "무작위 행운 번호 뽑기" },
  { href: "/tools/challenge", emoji: "🎯", title: "1등 도전 시뮬레이터", desc: "몇 번 만에 1등이 나올까?" },
  { href: "/ranking", emoji: "🏆", title: "오늘의 랭킹", desc: "매일 순이익으로 겨루기" },
];
