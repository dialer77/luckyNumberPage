import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AssetSimulator from "../AssetSimulator";
import Faq from "../../components/Faq";
import { ASSETS, getAsset, analyzeAsset, CURRENT_YEAR } from "@/lib/invest-data";
import { formatKRW } from "@/lib/lotto-data";
import { getRealPrices } from "@/lib/real-prices";

// 배수 표기: 10배↑ 정수, 1배↑ 소수1자리, 손실이면 하락률 병기
function fmtMultiple(m: number): string {
  if (m >= 10) return `${Math.round(m).toLocaleString()}배`;
  if (m >= 1) return `${m.toFixed(1)}배`;
  return `${m.toFixed(2)}배 (−${Math.round((1 - m) * 100)}%)`;
}

// 자산별 페이지: /invest/bitcoin, /invest/samsung ...
// 코인은 CoinGecko 실데이터를 서버에서 주입 → 1시간마다 현재가 갱신(ISR).
export const revalidate = 3600;

export function generateStaticParams() {
  return ASSETS.map((a) => ({ asset: a.key }));
}

export async function generateMetadata({
  params,
}: PageProps<"/invest/[asset]">): Promise<Metadata> {
  const { asset: key } = await params;
  const asset = getAsset(key);
  if (!asset) return { title: "자산을 찾을 수 없음" };
  return {
    title: `그때 ${asset.name} 샀으면 — 지금 얼마?`,
    description: `그때 ${asset.name}에 투자했다면 지금 얼마가 됐을까? 일시불·적립식으로 수익을 시뮬레이션해 보세요.`,
    alternates: { canonical: `/invest/${asset.key}` },
  };
}

export default async function AssetPage({
  params,
}: PageProps<"/invest/[asset]">) {
  const { asset: key } = await params;
  const asset = getAsset(key);
  if (!asset) notFound();

  // 실데이터 소스(코인·미국주식·금)가 있으면 교체, 실패 시 예시값 폴백
  const { prices, live } = await getRealPrices(asset);
  const resolved = { ...asset, prices };

  return (
    <div className="space-y-6">
      <Link href="/invest" className="text-sm text-indigo-600 hover:underline">
        ← 그때샀으면
      </Link>
      <div>
        <h1 className="text-2xl font-bold">
          {asset.emoji} 그때 {asset.name} 샀으면?
        </h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
          시점과 금액을 골라 지금 얼마가 됐을지 확인해 보세요.
          {live && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600 ring-1 ring-emerald-100">
              실시간 시세 반영
            </span>
          )}
        </p>
      </div>
      <AssetSimulator asset={resolved} />

      {/* 연도별 수익 요약 — 자산별 실데이터로 계산된 고유 콘텐츠 */}
      {(() => {
        const a = analyzeAsset(prices);
        const FAQ = [
          {
            q: `그때 ${asset.name}에 100만원 넣었으면 지금 얼마인가요?`,
            a: `가장 오래된 시점(${a.earliestYear}년)에 100만원을 넣었다면 지금 약 ${formatKRW(
              a.rows[0]?.valueOf1M ?? 0
            )}가 됐습니다(약 ${fmtMultiple(a.rows[0]?.multiple ?? 1)}). 시점별 결과는 위 계산기에서 금액을 바꿔 확인할 수 있어요.`,
          },
          {
            q: `${asset.name} 수익률(배수)은 어떻게 계산하나요?`,
            a: `'지금 가격 ÷ 그때 가격'으로 배수를 구합니다. 예를 들어 그때 가격의 3배가 됐다면 100만원이 300만원이 된 셈입니다. 연평균 수익률(CAGR)은 이 배수를 보유 연수로 환산한 값입니다.`,
          },
          {
            q: `여기 수치는 실제 시세인가요?`,
            a: live
              ? `${asset.name}은 현재가를 실시간 시세로 반영합니다. 다만 과거 시점 가격은 대표값을 사용한 근사치이며, 배당·수수료·세금은 반영하지 않은 참고용 계산입니다.`
              : `과거·현재 가격 모두 대표 시점의 근사치를 사용한 참고용 수치입니다. 배당·수수료·세금은 반영하지 않으며, 실제 수익과 다를 수 있습니다.`,
          },
        ];
        return (
          <>
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-base font-bold text-slate-800">
                시점별로 100만원 넣었으면 (지금 {CURRENT_YEAR}년 기준)
              </h2>
              <div className="mt-3 overflow-hidden rounded-lg ring-1 ring-slate-100">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">투자 시점</th>
                      <th className="px-3 py-2 text-right font-medium">수익 배수</th>
                      <th className="px-3 py-2 text-right font-medium">100만원 → 지금</th>
                      <th className="px-3 py-2 text-right font-medium">연평균</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {a.rows.map((r) => (
                      <tr key={r.year}>
                        <td className="px-3 py-2 font-semibold">{r.year}년</td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {fmtMultiple(r.multiple)}
                        </td>
                        <td className="px-3 py-2 text-right font-medium tabular-nums text-indigo-600">
                          {formatKRW(r.valueOf1M)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-slate-500">
                          {r.annualized >= 0 ? "+" : ""}
                          {r.annualized.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                배당·수수료·세금 미반영. 과거 수익은 미래를 보장하지 않습니다.
              </p>
            </section>

            {/* 자산별 해설 — 데이터 기반 서술로 페이지마다 고유 */}
            <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-base font-bold text-slate-800">
                {asset.name}, 그때 샀으면 지금은?
              </h2>
              <p className="mt-2">
                이 데이터 기준으로 <b>{asset.name}</b>에 가장 크게 벌 수 있었던
                시점은 <b>{a.best.year}년</b>으로, 그때 100만원이면 지금 약{" "}
                <b>{formatKRW(a.best.valueOf1M)}</b>({fmtMultiple(a.best.multiple)})가
                됐습니다. 반대로 상대적으로 덜 오른 시점은 {a.worst.year}년(
                {fmtMultiple(a.worst.multiple)})이었습니다. {a.earliestYear}년부터
                지금까지의 연평균 수익률(CAGR)은 약 {a.cagrFromEarliest.toFixed(1)}%
                수준입니다.
              </p>
              <p className="mt-2">
                물론 이건 &lsquo;결과를 아는 지금&rsquo; 돌아본 숫자입니다. 실제
                투자에서는 언제 사고팔지, 중간의 큰 하락을 버틸 수 있을지가
                수익을 좌우합니다. 큰 상승 뒤에는 깊은 조정도 있었다는 점을 함께
                기억하세요. 꾸준히 나눠 사는 방식이 궁금하면{" "}
                <Link href="/guide/dca-vs-lumpsum" className="text-indigo-600 hover:underline">
                  적립식 vs 일시불 가이드
                </Link>
                를 참고하세요.
              </p>
              <p className="mt-2 text-slate-400">
                다른 자산도 궁금하다면{" "}
                <Link href="/invest" className="text-indigo-600 hover:underline">
                  그때샀으면 전체 목록
                </Link>
                에서 비교해 보세요.
              </p>
            </div>

            <Faq items={FAQ} />
          </>
        );
      })()}
    </div>
  );
}
