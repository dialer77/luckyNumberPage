import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "가이드 — 로또·투자·돈 계산 이야기",
  description:
    "로또 세금, 복리, 고배당 ETF, 투자 시뮬레이션 등 돈과 관련된 알아두면 좋은 이야기를 정리했습니다.",
  alternates: { canonical: "/guide" },
};

export default function GuideIndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📚 가이드</h1>
        <p className="mt-1 text-sm text-slate-500">
          돈과 관련해 알아두면 좋은 이야기를 정리했어요.
        </p>
      </div>

      <ul className="space-y-3">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/guide/${g.slug}`}
              className="group flex items-start gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-950/5 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-indigo-200"
            >
              <span className="text-2xl">{g.emoji}</span>
              <div>
                <div className="font-semibold group-hover:text-indigo-600">
                  {g.title}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {g.description}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
