import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/brand";

export const metadata: Metadata = {
  title: "데이터 출처와 계산 기준",
  description: `${SITE.name}(manyage.com)의 로또 당첨번호·당첨금, 주식·코인 시세, 세금·연봉·대출 계산기가 어떤 데이터를 어디서 가져와 어떤 기준으로 계산하는지 정리했습니다.`,
  alternates: { canonical: "/data-sources" },
};

// 코드 기준으로 작성한 문서입니다. 아래 파일의 기준이 바뀌면 이 페이지도 함께 고치세요.
//   로또: app/api/cron/lotto/route.ts, lib/lotto-live.ts, lib/lotto-data.ts(calcTax)
//   투자: lib/real-prices.ts, lib/coin-prices.ts, lib/stock-prices.ts, lib/invest-data.ts, lib/dividend-data.ts
//   계산기: lib/salary.ts, lib/inflation.ts, lib/loan.ts, lib/salary-rank.ts, app/calc/*Calculator.tsx
//   모의 실험: lib/leaderboard.ts, lib/challenge.ts, app/tools/*
const SUMMARY: { feature: string; source: string; kind: string }[] = [
  {
    feature: "로또 당첨번호·당첨금",
    source: "공개 데이터셋 smok95/lotto (원 출처: 동행복권 추첨 결과)",
    kind: "실제 추첨 결과",
  },
  {
    feature: "당첨금 세금·실수령액",
    source: "복권 당첨금 세율 (3억원 이하 22%, 초과분 33%)",
    kind: "근사 계산",
  },
  {
    feature: "그때샀으면 · 코인",
    source: "CoinGecko 시세",
    kind: "실데이터 (조회 실패 시 예시값)",
  },
  {
    feature: "그때샀으면 · 미국 주식·금",
    source: "Twelve Data 시세",
    kind: "실데이터 (조회 실패 시 예시값)",
  },
  {
    feature: "그때샀으면 · 삼성전자·SK하이닉스",
    source: "사이트에 내장한 연도별 어림값",
    kind: "예시값",
  },
  {
    feature: "고배당 ETF 배당 계산기",
    source: "종목별 예시 배당률",
    kind: "가정값",
  },
  {
    feature: "머니계산기",
    source: "세법·4대보험 요율·물가지수의 근사값",
    kind: "근사 계산",
  },
  {
    feature: "오늘의 랭킹·1등 도전·번호 생성기",
    source: "무작위 추첨",
    kind: "가상 모의 실험",
  },
];

export default function DataSourcesPage() {
  const h2 = "text-lg font-semibold text-slate-800";
  const link = "text-indigo-600 hover:underline";
  return (
    <article className="space-y-5 text-slate-600 leading-relaxed">
      <h1 className="text-2xl font-bold text-slate-800">데이터 출처와 계산 기준</h1>
      <p>
        {SITE.name}가 보여주는 결과는 모두 공개된 데이터와 정해진 계산식으로
        만들어집니다. 이 페이지는 기능별로 어떤 데이터를 어디서 가져오는지,
        어떤 기준으로 계산하는지, 그리고 무엇이 실제 데이터이고 무엇이
        근사값·예시값인지를 구분해 정리한 문서입니다. 계산식이나 데이터 출처가
        바뀌면 이 페이지도 함께 고칩니다.
      </p>

      <section className="space-y-2">
        <h2 className={h2}>한눈에 보기</h2>
        <div className="overflow-x-auto rounded-lg ring-1 ring-slate-100">
          <table className="w-full bg-white text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left font-medium">기능</th>
                <th className="px-3 py-2 text-left font-medium">데이터·기준</th>
                <th className="px-3 py-2 text-left font-medium">성격</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SUMMARY.map((r) => (
                <tr key={r.feature}>
                  <td className="px-3 py-2 font-medium text-slate-700">{r.feature}</td>
                  <td className="px-3 py-2">{r.source}</td>
                  <td className="px-3 py-2 text-slate-500">{r.kind}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className={h2}>1. 로또 당첨번호·당첨금</h2>
        <p>
          회차별 당첨번호와 당첨금은 동행복권의 추첨 결과를 회차별 파일로 정리해
          GitHub에 공개하는 데이터셋{" "}
          <a href="https://github.com/smok95/lotto" className={link} rel="noopener" target="_blank">
            smok95/lotto
          </a>
          에서 받아옵니다. 동행복권 사이트는 자동화된 요청을 막고 있어 직접
          수집하지 않고, 이 공개 데이터셋을 거쳐 사이트 DB(Upstash Redis)에
          회차별로 저장합니다. 지난 회차의 결과는 바뀌지 않으므로 한 번 저장한
          회차는 그대로 보관합니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>저장 항목</strong>: 회차, 추첨일, 당첨번호 6개, 보너스 번호,
            1·2·3등의 1게임당 당첨금, 1등 당첨자 수. 4등(5만원)과 5등(5천원)은
            금액이 정해져 있어 따로 저장하지 않고 규정 금액을 씁니다.
          </li>
          <li>
            <strong>갱신 주기</strong>: 서버의 예약 작업(Vercel Cron)이 매일
            오전 6시(한국 시간)에 데이터셋의 최신 회차를 확인하고, 새 회차가
            있을 때만 추가합니다. 토요일 추첨 결과는 데이터셋이 갱신된 뒤 다음
            확인 때 들어오고, 페이지는 최대 1시간(회차별 추이 대시보드는 하루)
            동안 캐시되므로 화면에 반영되기까지 조금 더 걸릴 수 있습니다.
          </li>
          <li>
            <strong>회차별 분석</strong>: 회차 상세 페이지의 홀짝·고저·합계·
            연속번호·AC값 같은 지표는 그 회차의 당첨번호 6개만으로 계산합니다.
            1~45에서 6개를 고르게 뽑는다고 가정했을 때 합계의 이론적 평균은
            138입니다.
          </li>
          <li>
            <strong>통계와 추이</strong>:{" "}
            <Link href="/stats" className={link}>
              번호 출현 통계
            </Link>
            는 최근 50회의 당첨번호 6개(보너스 번호 제외)를,{" "}
            <Link href="/lotto/trends" className={link}>
              회차별 추이 대시보드
            </Link>
            는 저장된 전 회차를 기준으로 집계합니다.
          </li>
          <li>
            <strong>내 번호 당첨확인</strong>: 저장한 번호는 이용자 브라우저에만
            보관되며, 화면에서 최신 회차 당첨번호와 대조합니다.
          </li>
        </ul>
        <p>
          외부 데이터셋을 거치는 만큼 반영이 늦거나 표시 오류가 생길 수
          있습니다. 실제 당첨 여부와 당첨금 수령은 반드시{" "}
          <a href="https://www.dhlottery.co.kr" className={link} rel="noopener" target="_blank">
            동행복권 공식 사이트
          </a>
          의 결과로 확인하세요.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className={h2}>2. 당첨금 세금과 실수령액</h2>
        <p>
          <Link href="/calc/prize" className={link}>
            당첨금 실수령액 계산기
          </Link>
          와 회차 상세 페이지의 세후 금액은 아래 기준으로 계산합니다. 금액은
          모두 1게임(1장)당 당첨금 기준입니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>200만원 이하: 비과세</li>
          <li>
            200만원 초과 3억원 이하: 당첨금 전체에 22% (소득세 20% + 지방소득세 2%)
          </li>
          <li>
            3억원 초과: 3억원까지는 22%, 3억원을 넘는 부분에만 33% (소득세 30% +
            지방소득세 3%)
          </li>
        </ul>
        <p>
          예를 들어 1등 당첨금이 20억원이면 세금은 3억원 × 22% = 6,600만원과
          17억원 × 33% = 5억 6,100만원을 더한 6억 2,700만원이고, 실수령액은
          13억 7,300만원입니다. 원 단위 처리나 공제 같은 세부는 단순화했기
          때문에 실제 지급액과 소액 차이가 날 수 있으며, 세법이 바뀌면 결과도
          달라집니다. 자세한 설명은{" "}
          <Link href="/guide/lotto-tax" className={link}>
            로또 당첨금 세금과 실수령액 완벽 정리
          </Link>
          에 있습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className={h2}>3. 그때샀으면 (투자 시뮬레이션)</h2>
        <p>
          &lsquo;그때 샀으면 지금 얼마?&rsquo;는 2015·2018·2020·2021·2023년
          가운데 고른 시점의 가격과 현재(2026년) 가격의 비율로 계산합니다. 수익
          배수는 &lsquo;지금 가격 ÷ 그때 가격&rsquo;이고, 연평균 수익률(CAGR)은
          이 배수를 보유 연수로 환산한 값입니다. 자산별 가격은 다음처럼
          가져옵니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>코인</strong>(비트코인·이더리움·리플·도지코인):{" "}
            <a href="https://www.coingecko.com" className={link} rel="noopener" target="_blank">
              CoinGecko
            </a>
            의 원화 시세를 씁니다. 과거 시점은 각 연도 1월 1일 가격이고, 현재가는
            최대 1시간 간격으로 새로 받아옵니다.
          </li>
          <li>
            <strong>미국 주식</strong>(애플·테슬라·엔비디아 등 11개 종목)
            <strong>과 금</strong>:{" "}
            <a href="https://twelvedata.com" className={link} rel="noopener" target="_blank">
              Twelve Data
            </a>
            의 월별 종가를 씁니다. 과거 시점은 각 연도 1월의 월 종가, 현재가는
            가장 최근 월 데이터의 종가이며 최대 1시간 간격으로 갱신합니다. 달러
            가격의 비율만 쓰기 때문에 원·달러 환율 변동은 반영되지 않습니다.
          </li>
          <li>
            <strong>삼성전자·SK하이닉스</strong>: 아직 실시세를 연동하지 않아,
            사이트에 내장한 연도별 어림값을 씁니다. 대략적인 참고값으로만 봐
            주세요.
          </li>
        </ul>
        <p>
          시세 조회에 실패하면 한 자산 안에서 실제 값과 예시 값이 섞이지 않도록
          그 자산 전체를 내장 어림값으로 바꿔 계산합니다. 실제 시세로 계산된
          자산 페이지에만 &lsquo;실시간 시세 반영&rsquo; 표시가 붙으니, 이 표시가
          없다면 대략적인 참고값으로 봐 주세요. 적립식 계산은 연도별 가격 사이를
          직선으로 이어 매주 같은 금액을 샀다고 가정하므로 실제 주가 흐름과는
          다릅니다. 배당·매매 수수료·세금은 반영하지 않으며, 과거 수익이 미래
          수익을 보장하지 않습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className={h2}>4. 고배당 ETF 배당 계산기</h2>
        <p>
          <Link href="/invest/dividend" className={link}>
            배당 계산기
          </Link>
          는 실제 배당 지급 이력이나 주가를 쓰지 않고, 종목별 예시 연 배당률로
          &lsquo;배당을 재투자하면 얼마가 되는가&rsquo;를 계산하는 단순
          모델입니다. 예시 배당률은 SCHD 3.5%, JEPI 7.5%, 리얼티인컴(O) 5.2%,
          TIGER 리츠부동산 6.0%, KODEX 고배당 5.0%, ARIRANG 고배당주 6.5%이며,
          배당률은 직접 바꿔 넣을 수 있습니다. 납입과 배당 지급을 월 단위로
          시뮬레이션하고, 주가 변동(시세 차익·손실)과 배당소득세(약 15.4%),
          ETF 보수는 반영하지 않은 세전 기준입니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className={h2}>5. 머니계산기</h2>
        <p>
          <Link href="/calc" className={link}>
            머니계산기
          </Link>
          는 입력한 값과 아래 기준으로 계산합니다. 대부분 공개된 산식을 그대로
          쓰되, 세금·보험료처럼 사람마다 달라지는 부분은 일반적인 경우를 가정한
          근사값입니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>당첨금 실수령액</strong>: 위 &lsquo;당첨금 세금과
            실수령액&rsquo;의 기준을 씁니다.
          </li>
          <li>
            <strong>복리</strong>: 원금 × (1 + 회당 이율)<sup>횟수</sup>로
            계산합니다. &lsquo;회&rsquo;는 연·월 등 자유롭게 정하는 단위이며,
            세금·수수료는 빼지 않습니다.
          </li>
          <li>
            <strong>연봉 실수령액·이직 연봉</strong>: 2026년 기준 근사입니다.
            부양가족이 없는 본인 1인을 가정하고, 월 비과세액(식대 기본 20만원)을
            뺀 과세 급여에 4대보험 근로자 부담분을 합계 약 9.4%의 단일 요율로
            적용합니다. 소득세는 근로소득공제 → 본인 기본공제 150만원 →
            종합소득세 누진세율(6~45%) → 근로소득세액공제 순서로 구하고,
            지방소득세는 소득세의 10%입니다. 그 밖의 공제와 보험료 상·하한은
            생략해 실제보다 세금이 조금 많게 나올 수 있습니다. 이직 연봉
            계산기도 같은 식으로 두 연봉의 실수령액을 비교합니다.
          </li>
          <li>
            <strong>적금·예금</strong>: 단리 기준입니다. 적금 이자는 월 납입액 ×
            연이율 × n(n+1)/2 ÷ 12(n은 개월 수), 예금 이자는 원금 × 연이율 ×
            개월 수 ÷ 12로 구하고, 이자소득세는 일반과세 15.4%를 적용합니다.
            비과세·세금우대 상품은 따로 반영하지 않습니다.
          </li>
          <li>
            <strong>물가</strong>: 한국 소비자물가지수(CPI, 2020=100)의 근사값을
            씁니다. 1975년부터 2020년까지 5년 간격의 값과 2026년 추정치(118.5)를
            내장해 두었으며, 공식 발표 지수와 다소 차이가 날 수 있습니다.
          </li>
          <li>
            <strong>대출 원리금</strong>: 원리금균등·원금균등·만기일시 세 방식의
            표준 공식으로 계산하며, 고정금리와 매월 상환(월 이자율 = 연이율 ÷
            12)을 가정합니다. 중도상환수수료·부대비용·변동금리는 반영하지
            않습니다.
          </li>
          <li>
            <strong>평단가·물타기</strong>: 매수 수량으로 가중한 평균 매입가와
            현재가 기준 손익을 계산하며, 수수료·세금은 빼지 않습니다.
          </li>
          <li>
            <strong>퇴직금</strong>: 법정 산식(1일 평균임금 × 30일 × 재직일수 ÷
            365)을 쓰되, 1일 평균임금은 월 평균급여 ÷ 30.42로 근사합니다. 세전
            금액이며 퇴직소득세와 상여·수당의 세부 산정은 반영하지 않습니다.
          </li>
          <li>
            <strong>연봉 상위 %</strong>: 국세청 근로소득 분포를 참고해 정한 16개
            연봉 구간의 대략적인 상위 비율 사이를 직선으로 이어 계산하는 재미용
            지표입니다. 실제 통계와 차이가 날 수 있습니다.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className={h2}>6. 랭킹·1등 도전·번호 생성기는 가상 모의 실험입니다</h2>
        <p>
          행운노트의 놀이 기능은 실제 복권 구매와 관계없는 가상 시뮬레이션입니다.
          실제 돈을 걸거나 상품을 주지 않습니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>번호 생성기</strong>: 1~45 중 서로 다른 6개를 무작위로 뽑아
            보여줄 뿐, 당첨 가능성이 높은 번호를 추천하거나 예측하지 않습니다.
            어떤 조합이든 1등 확률은 똑같이 8,145,060분의 1입니다.
          </li>
          <li>
            <strong>1등 도전 시뮬레이터</strong>: 최신 회차 당첨번호를 정답으로
            두고 이용자 브라우저에서 무작위 번호를 뽑아 맞춰 봅니다. 당첨금은 그
            회차의 등수별 1게임당 당첨금(세전), 구매액은 1게임 1,000원으로
            셈하고, 걸리는 기간은 매주 5게임(5,000원)을 산다고 가정해
            환산합니다.
          </li>
          <li>
            <strong>오늘의 랭킹</strong>: 점수 조작을 막기 위해 서버가 직접
            1,000게임을 무작위로 돌려 결과를 확정합니다. 점수는 모의 당첨금에서
            구매액(100만원)을 뺀 순이익이며, 하루 한 번 참가할 수 있고 매일
            0시(한국 시간)에 새로 시작합니다.
          </li>
        </ul>
        <p>
          로또는 판매액의 약 50%만 당첨금으로 돌려주는 구조라, 이런 모의 실험을
          여러 번 해 보면 대부분 손실로 끝납니다. 랭킹 상위권은 운이 좋았던 드문
          결과일 뿐입니다. 확률에 대한 자세한 설명은{" "}
          <Link href="/guide/lotto-probability" className={link}>
            로또 1등 확률과 번호 고르기의 진실
          </Link>
          에 있습니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className={h2}>7. 한계와 오류 신고</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            이 사이트의 모든 계산 결과는 참고용입니다. 세법·4대보험 요율·금리 같은
            기준은 바뀔 수 있고, 외부 데이터는 갱신이 늦거나 오류가 있을 수
            있습니다.
          </li>
          <li>
            세금 신고·대출·투자처럼 중요한 결정은 국세청·금융회사 등 공식 기관이나
            전문가와 확인하세요.
          </li>
          <li>
            기준이 바뀐 것을 확인하면 계산식과 관련 가이드, 이 페이지를 함께
            고칩니다.
          </li>
        </ul>
        <p>
          틀린 당첨번호나 계산 결과를 발견하셨다면{" "}
          <Link href="/contact" className={link}>
            문의 페이지
          </Link>
          로 알려 주세요. 문제가 있었던 페이지 주소, 잘못된 값과 올바른 값,
          확인한 출처를 함께 적어 주시면 원본 데이터와 계산식을 대조해 확인한 뒤
          수정합니다.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className={h2}>8. 로또·복권 이용 안내</h2>
        <p>
          {SITE.name}는 복권 판매처가 아니며, 복권 구매를 권하거나 알선하지 않고
          당첨을 보장하지 않습니다. 복권은 만 19세 이상만 구매할 수 있으니
          여윳돈으로 소액만 즐기세요. 도박 문제로 어려움을 겪고 있다면
          한국도박문제예방치유원(국번 없이 1336)에서 상담받을 수 있습니다.
        </p>
      </section>

      <p className="text-sm text-slate-400">최종 업데이트: 2026-11-11</p>
    </article>
  );
}
