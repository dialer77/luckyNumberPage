import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 2026-11: 사이트 주제("가볍지만 믿을 수 있는 돈 이야기")와 먼 일반 재테크 글을 정리하면서
  // 지운 가이드 → 가장 가까운 페이지로 영구 이동(308). 들어오던 링크·검색을 살린다.
  async redirects() {
    return [
      { source: "/guide/money-basics", destination: "/guide", permanent: true },
      { source: "/guide/crypto-risk", destination: "/invest/bitcoin", permanent: true },
      { source: "/guide/housing-subscription", destination: "/guide", permanent: true },
      { source: "/guide/credit-score", destination: "/calc/loan", permanent: true },
      { source: "/guide/isa-account", destination: "/guide/dividend-etf", permanent: true },
      { source: "/guide/jeonse-vs-monthly", destination: "/calc/loan", permanent: true },
      { source: "/guide/emergency-fund", destination: "/calc/savings", permanent: true },
      // 2026-11: 로또 '놀이' 도구(번호 생성기·1등 도전·오늘의 랭킹)와 결과 공유 페이지 삭제
      { source: "/tools/generator", destination: "/lotto", permanent: true },
      { source: "/tools/challenge", destination: "/guide/lotto-probability", permanent: true },
      { source: "/ranking", destination: "/lotto", permanent: true },
      { source: "/challenge-result/:code", destination: "/lotto", permanent: true },
    ];
  },
};

export default nextConfig;
