import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { decodeShare } from "@/lib/share";

// 범용 공유 결과 페이지. 무한한 code라 요청 시 렌더링.
export async function generateMetadata({
  params,
}: PageProps<"/s/[code]">): Promise<Metadata> {
  const { code } = await params;
  const p = decodeShare(code);
  if (!p) return { title: "결과를 찾을 수 없음" };
  return { title: `${p.t} — ${p.v}`, description: p.s };
}

export default async function SharePage({ params }: PageProps<"/s/[code]">) {
  const { code } = await params;
  const p = decodeShare(code);
  if (!p) notFound();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 text-center ring-1 ring-indigo-100">
        <div className="text-4xl">{p.e}</div>
        <div className="mt-2 text-sm text-slate-500">{p.t}</div>
        <div className="mt-1 text-3xl font-extrabold text-indigo-600">{p.v}</div>
        {p.s && <div className="mt-2 text-sm text-slate-500">{p.s}</div>}
      </section>

      <Link
        href="/"
        className="inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        나도 계산해보기 →
      </Link>
    </div>
  );
}
