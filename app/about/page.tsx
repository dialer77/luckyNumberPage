import type { Metadata } from "next";
import Link from "next/link";
import { SITE, SUB_BRANDS } from "@/lib/brand";

export const metadata: Metadata = {
  title: "사이트 소개",
  description: `${SITE.name}(manyage.com)의 운영 목적과 서비스 구성, 운영자, 데이터 출처와 편집 원칙을 소개합니다.`,
  alternates: { canonical: "/about" },
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

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">운영 목적</h2>
        <p className="text-slate-600 leading-relaxed">
          큰돈에 관한 막연한 상상을 실제 숫자로 바꿔 보는 것이 {SITE.name}의
          목적입니다. 로또 1등에 당첨되면 세금을 떼고 실제로 얼마를 받는지, 몇 년
          전에 산 주식·코인이 지금 몇 배가 됐는지, 내 연봉의 실수령액은 얼마인지처럼
          궁금하지만 직접 계산하기 번거로운 질문에 빠르게 답하려고 합니다. 특히
          로또는 1등 확률과 평균적으로 돌려받는 금액을 숫자로 보여 드려, 큰 기대보다
          가벼운 재미로 즐길 수 있도록 돕고자 합니다.
        </p>
        <p className="text-slate-600 leading-relaxed">
          사이트 운영 비용은 페이지에 게재하는 광고(Google AdSense)로 충당하며,
          복권을 판매하거나 투자 상품을 중개해 수수료를 받지 않습니다.
        </p>
      </section>

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
        <h2 className="text-lg font-semibold">운영자</h2>
        <p className="text-slate-600 leading-relaxed">
          {SITE.name}는 1인 개발자가 직접 기획·
          개발·운영합니다. 기능과 글은 모두 직접 계산식을 검증해 작성하며,
          오류를 발견하시면{" "}
          <Link href="/contact" className="text-indigo-600 hover:underline">
            문의 페이지
          </Link>
          로 알려 주세요. 확인 즉시 바로잡습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">데이터 출처와 갱신 주기</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-600 leading-relaxed">
          <li>
            <strong>로또 당첨번호·당첨금</strong>: 동행복권이 공개한 회차별
            결과를 자체 DB에 저장하고, 매주 토요일 추첨 다음 날 아침 자동으로 갱신합니다.
            번호 출현 통계는 이 DB의 최근 50회, 추이 그래프는 전 회차 데이터로
            계산합니다.
          </li>
          <li>
            <strong>주식·코인 시세</strong>: Twelve Data, CoinGecko 등 공개
            시세 데이터의 과거 종가를 사용합니다.
          </li>
          <li>
            <strong>세금·급여 계산</strong>: 소득세법·4대 보험 요율 등 공개된
            기준을 반영하며, 기준이 바뀌면 계산식과 가이드를 함께 수정합니다.
          </li>
        </ul>
        <p className="text-slate-600 leading-relaxed">
          로또 데이터는 동행복권 추첨 결과를 정리한 공개 데이터셋(smok95/lotto)을
          거쳐 받아오고, 삼성전자·SK하이닉스처럼 실시세를 연동하지 않은 자산이나
          시세 조회에 실패한 경우에는 대략적인 예시값으로 계산합니다. 기능별 데이터
          출처와 계산식, 근사값을 쓰는 부분은{" "}
          <Link href="/data-sources" className="text-indigo-600 hover:underline">
            데이터 출처와 계산 기준
          </Link>
          에 자세히 정리해 두었습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">콘텐츠·편집 원칙</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-600 leading-relaxed">
          <li>
            &lsquo;당첨 확률을 높이는 번호&rsquo;처럼 근거 없는 주장을 하지
            않습니다. 로또는 매 회차 독립 시행이며, 통계는 재미와 이해를 위한
            자료입니다.
          </li>
          <li>
            복권은 여윳돈으로 소액만 즐기도록 안내하며, 과도한 구매를 권하지
            않습니다. 도박 문제로 어려움을 겪고 있다면 한국도박문제예방치유원
            (국번 없이 1336)에서 상담받을 수 있습니다.
          </li>
          <li>
            모든 계산 결과는 참고용이며, 중요한 금융 결정은 공식 기관이나
            전문가와 상의하시기 바랍니다.
          </li>
          <li>
            번호 생성기·1등 도전·오늘의 랭킹은 무작위 추첨을 흉내 낸 가상 모의
            실험입니다. &lsquo;추천 번호&rsquo;나 &lsquo;당첨 비법&rsquo;을 제공하지
            않으며, 실제 돈을 걸거나 상품을 주지 않습니다.
          </li>
          <li>
            데이터를 어디서 가져와 어떻게 계산하는지 공개합니다. 실제 데이터와
            근사값·예시값을 구분해 밝히고, 계산식이나 출처가 바뀌면 안내 문서도 함께
            고칩니다.
          </li>
          <li>
            오류 제보를 받으면 원본 데이터와 계산식을 대조해 확인한 뒤 수정합니다.
          </li>
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
