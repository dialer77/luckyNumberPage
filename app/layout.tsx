import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SITE } from "@/lib/brand";

// 사이트 전체 공통 메타데이터 (SEO + 공유 미리보기의 기본값).
// 개별 페이지에서 title/description을 export 하면 이 값을 덮어씀.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url), // 공유 카드/사이트맵의 절대 URL 기준
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`, // 하위 페이지 제목 뒤에 자동으로 붙음
  },
  description: SITE.description,
  keywords: ["만약에", "로또", "당첨번호", "주식 수익 계산", "그때 샀으면", "돈 계산기"],
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    type: "website",
    locale: "ko_KR",
  },
};

// 헤더 내비게이션.
// 지금은 '행운노트(로또)' 서브브랜드만 라이브라 그 주요 기능들을 노출.
// 다른 서브브랜드가 라이브되면 섹션 단위로 확장할 예정.
const NAV = [
  { href: "/", label: "홈" },
  { href: "/lotto", label: "🍀 행운노트" },
  { href: "/invest", label: "📈 그때샀으면" },
  { href: "/calc", label: "🧮 머니계산기" },
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
            <Link
              href="/"
              className="text-lg font-extrabold text-indigo-600 whitespace-nowrap"
            >
              {SITE.emoji} {SITE.name}
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
              {SITE.name}는 공개된 데이터를 정리해 &lsquo;만약에 얼마?&rsquo;를
              재미로 보여주는 정보 서비스입니다. 로또·복권 관련 정보는 구매를
              알선하거나 당첨을 보장하지 않으며, 투자·수익 계산 결과 또한
              참고용으로 실제 수익을 보장하지 않습니다.
            </p>
            <p className="text-xs text-slate-400">© 2026 {SITE.name}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
