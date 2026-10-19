import type { Metadata } from "next";

// page.tsx가 Client Component라 metadata를 export할 수 없어 레이아웃에서 지정.
// (없으면 홈과 같은 기본 제목·설명이 붙어 검색엔진이 중복 페이지로 봄)
export const metadata: Metadata = {
  title: "로또 번호 생성기 — 무작위 행운 번호 뽑기",
  description:
    "1~45 중 6개 로또 번호를 무작위로 뽑아 보세요. 중복 없는 추첨 방식, 생성 원리와 확률을 함께 안내합니다.",
  alternates: { canonical: "/tools/generator" },
};

export default function GeneratorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
