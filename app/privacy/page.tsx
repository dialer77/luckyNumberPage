import type { Metadata } from "next";
import { SITE } from "@/lib/brand";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${SITE.name}(manyage.com)의 개인정보 처리, 쿠키, Google AdSense 광고에 관한 안내입니다.`,
  alternates: { canonical: "/privacy" },
};

// 실제 사용 중인 도구 기준으로 작성:
// Google AdSense(광고 쿠키), Vercel Analytics/Speed Insights(익명 통계),
// localStorage(내 번호 저장), Upstash Redis(랭킹 닉네임), lastPlayed 쿠키(랭킹 1일 1회).
// 도구를 추가·변경하면 이 문서와 시행일을 함께 갱신하세요.
export default function PrivacyPage() {
  const h2 = "text-lg font-semibold text-slate-800";
  const link = "text-indigo-600 hover:underline";
  return (
    <article className="space-y-5 text-slate-600 leading-relaxed">
      <h1 className="text-2xl font-bold text-slate-800">개인정보처리방침</h1>
      <p>
        {SITE.name}({SITE.url.replace("https://", "")}, 이하 &ldquo;사이트&rdquo;)는
        이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련
        법령을 준수합니다. 이 방침은 사이트가 어떤 정보를 어떻게 다루는지,
        특히 광고와 쿠키를 어떻게 사용하는지 안내합니다.
      </p>

      <section className="space-y-1">
        <h2 className={h2}>1. 수집하는 정보와 이용 목적</h2>
        <p>
          사이트는 회원가입 없이 이용할 수 있으며, 이름·전화번호·주소 등
          개인을 직접 식별하는 정보를 요구하지 않습니다. 기능별로 다루는
          정보는 다음과 같습니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>내 번호 저장(로또 당첨확인)</strong>: 저장한 번호는 이용자
            브라우저의 로컬 저장소(localStorage)에만 보관되며 서버로 전송되지
            않습니다. 브라우저 데이터를 지우면 함께 삭제됩니다.
          </li>
          <li>
            <strong>오늘의 랭킹</strong>: 참가 시 입력한 닉네임과 시뮬레이션
            점수가 랭킹 표시를 위해 서버(Upstash)에 저장됩니다. 일일 랭킹은
            3일 후 자동 삭제되며, 명예의 전당에는 상위 100건만 유지됩니다.
            실명 등 개인을 알아볼 수 있는 닉네임은 입력하지 마세요.
          </li>
          <li>
            <strong>접속 기록</strong>: 서비스 운영 과정에서 서버가 IP 주소,
            브라우저 종류, 접속 시각 등을 자동으로 처리할 수 있으며, 보안과
            장애 대응 목적으로만 사용됩니다.
          </li>
        </ul>
      </section>

      <section className="space-y-1">
        <h2 className={h2}>2. 쿠키 사용</h2>
        <p>
          쿠키는 웹사이트가 이용자 브라우저에 저장하는 작은 텍스트 파일입니다.
          사이트는 오늘의 랭킹 하루 1회 참가 여부를 확인하는 쿠키
          (lastPlayed, 7일 보관)를 사용하며, 아래 광고 서비스가 쿠키를
          사용할 수 있습니다. 이용자는 브라우저 설정에서 쿠키 저장을 거부하거나
          삭제할 수 있으나, 일부 기능이 제한될 수 있습니다.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className={h2}>3. 광고 (Google AdSense)</h2>
        <p>
          사이트는 Google AdSense를 통해 광고를 게재합니다. 이와 관련해 다음
          사항을 알려드립니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Google을 포함한 제3자 광고 사업자는 쿠키를 사용해 이용자가 이
            사이트나 다른 웹사이트를 이전에 방문한 기록을 바탕으로 광고를
            게재합니다.
          </li>
          <li>
            Google은 광고 쿠키를 사용해 이용자의 이 사이트 및 다른 사이트 방문
            기록에 기반한 맞춤 광고를 이용자에게 제공할 수 있습니다.
          </li>
          <li>
            이용자는{" "}
            <a href="https://adssettings.google.com" className={link} rel="noopener" target="_blank">
              Google 광고 설정
            </a>
            에서 맞춤 광고를 해제할 수 있으며,{" "}
            <a href="https://www.aboutads.info/choices" className={link} rel="noopener" target="_blank">
              www.aboutads.info
            </a>
            에서 제3자 광고 사업자의 맞춤 광고 쿠키 사용을 거부할 수 있습니다.
          </li>
          <li>
            Google이 수집한 정보를 사용하는 방식은{" "}
            <a
              href="https://policies.google.com/technologies/partner-sites?hl=ko"
              className={link}
              rel="noopener"
              target="_blank"
            >
              Google 파트너 사이트 데이터 사용 안내
            </a>
            에서 확인할 수 있습니다.
          </li>
        </ul>
      </section>

      <section className="space-y-1">
        <h2 className={h2}>4. 접속 통계</h2>
        <p>
          서비스 개선을 위해 Vercel Web Analytics와 Speed Insights를
          사용합니다. 이 도구는 쿠키를 사용하지 않으며, 페이지 조회수·유입
          경로·로딩 속도 같은 익명 통계만 집계합니다. 또한 Google Search
          Console을 통해 검색 노출·클릭 같은 집계 데이터를 확인하며, 이
          데이터에는 개별 이용자를 식별하는 정보가 포함되지 않습니다.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className={h2}>5. 제3자 제공 및 처리 위탁</h2>
        <p>
          사이트는 이용자의 정보를 판매하거나 법령에 근거한 경우를 제외하고
          제3자에게 제공하지 않습니다. 서비스 운영을 위해 호스팅(Vercel),
          데이터 저장(Upstash), 광고(Google) 서비스를 이용하며, 각 사업자는
          자체 개인정보처리방침에 따라 정보를 처리합니다.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className={h2}>6. 아동의 개인정보</h2>
        <p>
          사이트는 만 14세 미만 아동을 대상으로 하지 않으며, 아동의 개인정보를
          고의로 수집하지 않습니다. 복권은 만 19세 이상만 구매할 수 있습니다.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className={h2}>7. 이용자의 권리와 문의</h2>
        <p>
          이용자는 랭킹에 등록된 닉네임의 삭제 등 자신과 관련된 정보의 열람·
          정정·삭제를 요청할 수 있습니다. 개인정보 관련 문의는{" "}
          <a href="/contact" className={link}>
            문의 페이지
          </a>
          의 이메일로 접수해 주시면 지체 없이 처리하겠습니다.
        </p>
      </section>

      <section className="space-y-1">
        <h2 className={h2}>8. 방침의 변경</h2>
        <p>
          이 방침은 법령이나 서비스 변경에 따라 수정될 수 있으며, 변경 시 이
          페이지에 시행일과 함께 공지합니다.
        </p>
      </section>

      <p className="text-sm text-slate-400">시행일: 2026-10-19 (최초 시행 2026-07-03)</p>
    </article>
  );
}
