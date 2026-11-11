import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuide } from "@/lib/guides";
import { SITE } from "@/lib/brand";

// 같은 주제(로또·복권 / 돈·금융) 글을 우선해 관련 가이드 3개를 고른다.
// 글 끝이 막다른 길이 되지 않도록 → 체류·내부 링크 신호 보강.
const LOTTO_SLUGS = new Set([
  "lotto-tax",
  "lotto-probability",
  "lotto-claim-process",
  "lotto-prize-tiers",
  "pension-lottery",
  "how-to-check-lotto-numbers",
  "lotto-biggest-smallest-jackpots",
  "lotto-most-winners-draws",
  "lotto-jackpot-real-value",
  "lotto-number-frequency-test",
  "lotto-odd-even-sum-distribution",
  "lotto-no-winner-draws",
]);
function relatedGuides(slug: string) {
  const isLotto = LOTTO_SLUGS.has(slug);
  const idx = GUIDES.findIndex((g) => g.slug === slug);
  // 현재 글 다음 순서부터 돌며 고르면 글마다 추천이 고르게 분산됨
  const rotated = [...GUIDES.slice(idx + 1), ...GUIDES.slice(0, idx)];
  const same = rotated.filter((g) => LOTTO_SLUGS.has(g.slug) === isLotto);
  const other = rotated.filter((g) => LOTTO_SLUGS.has(g.slug) !== isLotto);
  return [...same, ...other].slice(0, 3);
}

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
            author: {
              "@type": "Organization",
              name: SITE.name,
              url: `${SITE.url}/about`,
            },
            publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "가이드", item: `${SITE.url}/guide` },
              {
                "@type": "ListItem",
                position: 2,
                name: g.title,
                item: `${SITE.url}/guide/${g.slug}`,
              },
            ],
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
        <p className="mt-1 text-xs text-slate-400">
          업데이트 {g.updated} · 글{" "}
          <Link href="/about" className="hover:underline">
            {SITE.name} 운영자
          </Link>
        </p>
      </div>

      <div className="space-y-5">
        {g.sections.map((sec, i) => (
          <section key={i} className="space-y-2">
            {sec.h && (
              <h2 className="text-lg font-semibold text-slate-800">{sec.h}</h2>
            )}
            {sec.p?.map((para, j) => (
              <p key={j} className="text-sm leading-relaxed text-slate-600">
                {para}
              </p>
            ))}
            {sec.list && (
              <ul className="ml-4 list-disc space-y-1.5 text-sm leading-relaxed text-slate-600 marker:text-indigo-400">
                {sec.list.map((li, k) => (
                  <li key={k} className="pl-1">
                    {li}
                  </li>
                ))}
              </ul>
            )}
            {sec.table && (
              <div className="space-y-1">
                <div className="overflow-x-auto rounded-lg ring-1 ring-slate-100">
                  <table className="w-full border-collapse text-sm">
                    {sec.table.caption && (
                      <caption className="bg-white px-3 pt-2 pb-1 text-left text-xs font-medium text-slate-500">
                        {sec.table.caption}
                      </caption>
                    )}
                    <thead>
                      <tr className="bg-slate-50">
                        {sec.table.head.map((h, k) => (
                          <th
                            key={k}
                            scope="col"
                            className="border-b border-slate-200 px-3 py-2 text-left font-semibold whitespace-nowrap text-slate-700"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {sec.table.rows.map((row, r) => (
                        <tr key={r} className="border-b border-slate-100 last:border-0">
                          {row.map((cell, c) => (
                            <td
                              key={c}
                              className="px-3 py-2 whitespace-nowrap text-slate-600"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {sec.table.note && (
                  <p className="text-xs leading-relaxed text-slate-400">
                    {sec.table.note}
                  </p>
                )}
              </div>
            )}
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

      <section className="space-y-2 border-t border-slate-100 pt-5">
        <h2 className="text-sm font-semibold text-slate-500">
          함께 읽으면 좋은 가이드
        </h2>
        <ul className="space-y-2">
          {relatedGuides(g.slug).map((r) => (
            <li key={r.slug}>
              <Link
                href={`/guide/${r.slug}`}
                className="block rounded-lg bg-white p-3 text-sm shadow-sm ring-1 ring-slate-100 hover:ring-indigo-200"
              >
                <span className="font-medium text-slate-800">
                  {r.emoji} {r.title}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {r.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
