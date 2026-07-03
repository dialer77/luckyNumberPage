import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

// 사이트 전체 공통 메타데이터 (SEO + 공유 미리보기의 기본값).
// 개별 페이지에서 title/description을 export 하면 이 값을 덮어씀.
export const metadata: Metadata = {
  // 공유 카드/사이트맵의 절대 URL 기준. ⚠️ 배포 시 실제 도메인으로 교체.
  metadataBase: new URL("https://example.com"),
  title: {
    default: "행운노트 — 로또 당첨번호 조회·통계",
    template: "%s | 행운노트", // 하위 페이지 제목 뒤에 자동으로 붙음
  },
  description:
    "역대 로또 당첨번호를 빠르게 조회하고, 번호별 출현 통계를 한눈에 확인하는 정보 서비스입니다.",
  keywords: ["로또", "당첨번호", "로또조회", "로또통계", "회차별 당첨번호"],
  openGraph: {
    title: "행운노트 — 로또 당첨번호 조회·통계",
    description: "역대 당첨번호 조회와 번호 통계를 한 곳에서.",
    type: "website",
    locale: "ko_KR",
  },
};

// 헤더 내비게이션 항목 (한 곳에서 관리 → 링크 추가가 쉬움)
const NAV = [
  { href: "/", label: "홈" },
  { href: "/lotto", label: "당첨번호 조회" },
  { href: "/stats", label: "번호 통계" },
  { href: "/tools/generator", label: "번호 생성기" },
  { href: "/tools/challenge", label: "1등 도전" },
  { href: "/ranking", label: "오늘의 랭킹" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800">
        {/* ── 공통 헤더 ── */}
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between gap-4">
            <Link href="/" className="text-lg font-extrabold text-indigo-600">
              🍀 행운노트
            </Link>
            <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-slate-600 hover:text-indigo-600"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* ── 페이지 본문이 여기에 들어감 ── */}
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
          {children}
        </main>

        {/* ── 공통 푸터 (애드센스 승인에 필요한 필수 페이지 링크 포함) ── */}
        <footer className="border-t border-slate-200 bg-white text-sm text-slate-500">
          <div className="mx-auto max-w-3xl px-4 py-6 space-y-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/about" className="hover:text-indigo-600">사이트 소개</Link>
              <Link href="/privacy" className="hover:text-indigo-600">개인정보처리방침</Link>
              <Link href="/terms" className="hover:text-indigo-600">이용약관</Link>
              <Link href="/contact" className="hover:text-indigo-600">문의</Link>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              본 사이트는 이미 공개된 로또 추첨 결과를 정리해 제공하는 정보
              서비스이며, 복권 구매를 알선하거나 당첨을 보장하지 않습니다.
              구매는 동행복권 등 공식 판매처를 이용하세요.
            </p>
            <p className="text-xs text-slate-400">© 2026 행운노트</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
