import type { Metadata } from "next";
import { SITE, SUB_BRANDS } from "@/lib/brand";

export const metadata: Metadata = {
  title: "사이트 소개",
  description: `${SITE.name}가 어떤 서비스인지 소개합니다.`,
};

export default function AboutPage() {
  return (
    <article className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">사이트 소개</h1>
        <p className="mt-2 text-slate-600 leading-relaxed">
          <strong>{SITE.name}</strong>는 &lsquo;만약에 얼마?&rsquo;를 재미로
          확인하는 정보 서비스입니다. 로또에 당첨되면 세후로 얼마인지, 그때 그
          주식을 샀다면 지금 얼마가 됐을지처럼, 공개된 데이터를 바탕으로 다양한
          &lsquo;만약에&rsquo;를 계산해 보여줍니다.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">구성</h2>
        <ul className="space-y-2">
          {SUB_BRANDS.map((b) => (
            <li
              key={b.key}
              className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
            >
              <span className="text-2xl">{b.emoji}</span>
              <div>
                <div className="font-semibold">
                  {b.name}
                  {b.status === "soon" && (
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-400">
                      준비 중
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-sm text-slate-500">{b.tagline}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">데이터 및 안내</h2>
        <p className="text-slate-600 leading-relaxed">
          당첨번호·시세 등 정보는 공개된 데이터를 바탕으로 제공되며, 지속적으로
          업데이트됩니다. {SITE.name}는 복권 구매를 알선하거나 당첨을 보장하지
          않으며, 투자·수익 계산 결과 또한 참고용으로 실제 수익을 보장하지
          않습니다. 로또·복권 구매는 동행복권 등 공식 판매처를 이용하시기
          바랍니다.
        </p>
      </section>
    </article>
  );
}
