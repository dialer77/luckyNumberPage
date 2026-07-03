import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: "행운노트 서비스 이용약관입니다.",
};

// ⚠️ 샘플 템플릿. 실제 배포 전 서비스 실정에 맞게 수정하세요.
export default function TermsPage() {
  return (
    <article className="space-y-4 text-slate-600 leading-relaxed">
      <h1 className="text-2xl font-bold text-slate-800">이용약관</h1>

      <section className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-800">제1조 (목적)</h2>
        <p>
          본 약관은 행운노트(이하 &ldquo;사이트&rdquo;)가 제공하는 로또 정보
          조회 서비스의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로
          합니다.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-800">
          제2조 (정보의 성격)
        </h2>
        <p>
          사이트가 제공하는 당첨번호·통계 등 모든 정보는 참고용이며, 정확성을
          완전히 보장하지 않습니다. 사이트는 복권 구매를 권유하거나 당첨을
          보장하지 않으며, 정보 이용에 따른 판단과 책임은 이용자에게 있습니다.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-800">
          제3조 (책임의 한계)
        </h2>
        <p>
          사이트는 제공 정보의 오류, 서비스 중단, 이용자의 정보 활용으로 발생한
          손해에 대해 관련 법령이 허용하는 범위 내에서 책임을 지지 않습니다.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-800">
          제4조 (약관의 변경)
        </h2>
        <p>
          사이트는 필요한 경우 약관을 변경할 수 있으며, 변경 시 본 페이지에
          공지합니다.
        </p>
      </section>

      <p className="text-sm text-slate-400">시행일: 2026-07-03</p>
    </article>
  );
}
