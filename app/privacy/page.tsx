import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "행운노트의 개인정보 처리 및 광고 쿠키에 관한 안내입니다.",
};

// ⚠️ 이 문서는 샘플 템플릿입니다. 실제 배포 전에 도메인/연락처/실제
// 사용하는 광고·분석 도구에 맞게 수정하고, 필요하면 법률 검토를 받으세요.
export default function PrivacyPage() {
  return (
    <article className="space-y-4 text-slate-600 leading-relaxed">
      <h1 className="text-2xl font-bold text-slate-800">개인정보처리방침</h1>
      <p>
        행운노트(이하 &ldquo;사이트&rdquo;)는 이용자의 개인정보를 중요하게
        생각하며, 아래와 같이 처리 방침을 안내합니다.
      </p>

      <section className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-800">
          1. 수집하는 정보
        </h2>
        <p>
          사이트는 회원가입 없이 이용할 수 있으며, 이름·연락처 등 개인을 직접
          식별하는 정보를 수집하지 않습니다. 번호 저장 등 일부 기능은 이용자
          브라우저의 로컬 저장소(localStorage)에만 저장되며 서버로 전송되지
          않습니다.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-800">
          2. 광고 및 쿠키
        </h2>
        <p>
          사이트는 제3자 광고(예: Google AdSense)를 게재할 수 있습니다. 이
          과정에서 광고 사업자가 쿠키를 사용해 이용자의 관심사에 맞는 광고를
          제공할 수 있습니다. 이용자는 브라우저 설정에서 쿠키를 차단하거나
          Google 광고 설정에서 맞춤 광고를 해제할 수 있습니다.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-800">
          3. 접속 분석
        </h2>
        <p>
          서비스 개선을 위해 접속 통계 도구를 사용할 수 있으며, 이 경우 익명화된
          방문 정보만 수집됩니다.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-800">4. 문의</h2>
        <p>
          개인정보 처리에 관한 문의는{" "}
          <a href="/contact" className="text-indigo-600 hover:underline">
            문의 페이지
          </a>
          를 통해 접수할 수 있습니다.
        </p>
      </section>

      <p className="text-sm text-slate-400">시행일: 2026-07-03</p>
    </article>
  );
}
