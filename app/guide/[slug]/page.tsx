import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuide } from "@/lib/guides";
import { SITE } from "@/lib/brand";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/guide/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return { title: "가이드를 찾을 수 없음" };
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `/guide/${g.slug}` },
  };
}

export default async function GuidePage({
  params,
}: PageProps<"/guide/[slug]">) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();

  return (
    <article className="space-y-6">
      {/* Article 구조화데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: g.title,
            description: g.description,
            datePublished: g.updated,
            dateModified: g.updated,
            inLanguage: "ko-KR",
            mainEntityOfPage: `${SITE.url}/guide/${g.slug}`,
            author: { "@type": "Organization", name: SITE.name },
          }),
        }}
      />

      <div>
        <Link href="/guide" className="text-sm text-indigo-600 hover:underline">
          ← 가이드
        </Link>
        <h1 className="mt-2 text-2xl font-bold leading-snug">
          {g.emoji} {g.title}
        </h1>
        <p className="mt-1 text-xs text-slate-400">업데이트 {g.updated}</p>
      </div>

      <div className="space-y-5">
        {g.sections.map((sec, i) => (
          <section key={i} className="space-y-2">
            {sec.h && (
              <h2 className="text-lg font-semibold text-slate-800">{sec.h}</h2>
            )}
            {sec.p.map((para, j) => (
              <p key={j} className="text-sm leading-relaxed text-slate-600">
                {para}
              </p>
            ))}
          </section>
        ))}
      </div>

      {g.cta && (
        <Link
          href={g.cta.href}
          className="inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {g.cta.label}
        </Link>
      )}
    </article>
  );
}
