// 자주 묻는 질문 섹션 + FAQPage 구조화데이터(JSON-LD).
// 콘텐츠 깊이 보강(애드센스/thin content 대응) + 검색 리치결과.

export type FaqItem = { q: string; a: string };

export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <section className="space-y-3">
      {/* 검색엔진용 FAQ 구조화데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((it) => ({
              "@type": "Question",
              name: it.q,
              acceptedAnswer: { "@type": "Answer", text: it.a },
            })),
          }),
        }}
      />

      <h2 className="text-sm font-semibold text-slate-500">자주 묻는 질문</h2>
      <div className="divide-y divide-slate-100 rounded-2xl bg-white ring-1 ring-slate-100">
        {items.map((it, i) => (
          <details key={i} className="group p-4">
            <summary className="cursor-pointer list-none font-medium text-slate-800 marker:hidden">
              <span className="text-indigo-500">Q. </span>
              {it.q}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
