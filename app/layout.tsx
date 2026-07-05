import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SITE } from "@/lib/brand";
import Nav from "./components/Nav";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Google AdSense 게시자 ID
const ADSENSE_CLIENT = "ca-pub-4718898950361659";

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
  // AdSense 사이트 소유 확인용 메타 태그
  other: { "google-adsense-account": ADSENSE_CLIENT },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // lang="ko" → 브라우저가 한국어로 감지해 자동번역 제안. 외국인은 번역으로 이용.
    // suppressHydrationWarning → 크롬 자동번역이 텍스트를 바꿔도 React 오류 완화.
    <html lang="ko" className="h-full" suppressHydrationWarning>
      {/* AdSense 도메인 연결을 미리 열어 스크립트 로드 지연 완화 (FCP 개선) */}
      <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />

      {/* Google AdSense 로더 — React 19가 async 스크립트를 <head>로 끌어올려
          서버 렌더링 HTML에 그대로 찍힙니다(애드센스 심사 크롤러가 인식). */}
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        crossOrigin="anonymous"
      />

      {/* 구조화 데이터(JSON-LD) — 검색엔진이 사이트 정체성을 이해하도록 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE.name,
            alternateName: "만약에 얼마",
            url: SITE.url,
            description: SITE.description,
            inLanguage: "ko-KR",
          }),
        }}
      />
      <body className="min-h-full flex flex-col text-slate-800" suppressHydrationWarning>
        {/* ── 공통 헤더 (상단 고정) ── */}
        <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="shrink-0 whitespace-nowrap text-lg font-extrabold tracking-tight"
            >
              <span className="mr-1">{SITE.emoji}</span>
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {SITE.name}
              </span>
            </Link>
            <Nav />
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

        {/* 방문자 분석 + 속도 측정 (Vercel) */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
