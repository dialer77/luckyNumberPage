import type { Metadata } from "next";
import { SITE } from "@/lib/brand";

export const metadata: Metadata = {
  title: "이용약관",
  description: `${SITE.name}(manyage.com) 서비스 이용약관입니다.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const h2 = "text-lg font-semibold text-slate-800";
  return (
    <article className="space-y-4 text-slate-600 leading-relaxed">
      <h1 className="text-2xl font-bold text-slate-800">이용약관</h1>

      <section className="space-y-1">
        <h2 className={h2}>제1조 (목적)</h2>
        <p>
          본 약관은 {SITE.name}(이하 &ldquo;사이트&rdquo;)가 제공하는 로또
          당첨번호 조회·통계(행운노트), 투자 수익 시뮬레이션(그때샀으면), 생활
          금융 계산기(머니계산기), 금융 가이드 등 모든 서비스의 이용 조건과
          절차에 관한 사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className={h2}>제2조 (정보의 성격)</h2>
        <p>
          사이트가 제공하는 당첨번호·통계·시세·계산 결과 등 모든 정보는 공개
          데이터를 바탕으로 한 참고용이며, 정확성과 최신성을 완전히 보장하지
          않습니다. 공식 당첨 결과는 동행복권, 실제 세금·급여·대출 조건은 관련
          기관과 금융회사에서 확인해야 합니다.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className={h2}>제3조 (복권·투자 관련 고지)</h2>
        <p>
          사이트는 복권을 판매하거나 구매를 대행·알선하지 않으며, 당첨 확률을
          높이는 방법을 제공하지 않습니다. 번호 생성기와 1등 도전 시뮬레이터,
          오늘의 랭킹은 확률을 체감해 보는 재미용 기능으로, 실제 금전이 오가지
          않습니다. 투자 시뮬레이션 결과는 과거 데이터에 기반한 것으로 미래
          수익을 보장하지 않으며 투자 권유가 아닙니다.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className={h2}>제4조 (이용자의 의무)</h2>
        <p>
          이용자는 랭킹 닉네임 등에 타인을 비방하거나 불쾌감을 주는 표현,
          타인의 개인정보를 입력해서는 안 되며, 자동화된 수단으로 서비스에
          과도한 부하를 주어서는 안 됩니다. 사이트는 이를 위반한 게시 내용을
          사전 통지 없이 삭제할 수 있습니다.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className={h2}>제5조 (책임의 한계)</h2>
        <p>
          사이트는 제공 정보의 오류, 서비스 중단, 이용자의 정보 활용으로 발생한
          손해에 대해 관련 법령이 허용하는 범위 내에서 책임을 지지 않습니다.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className={h2}>제6조 (약관의 변경)</h2>
        <p>
          사이트는 필요한 경우 약관을 변경할 수 있으며, 변경 시 본 페이지에
          시행일과 함께 공지합니다.
        </p>
      </section>

      <p className="text-sm text-slate-400">시행일: 2026-10-19 (최초 시행 2026-07-03)</p>
    </article>
  );
}
