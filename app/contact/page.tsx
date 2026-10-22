import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/brand";

export const metadata: Metadata = {
  title: "문의",
  description: `${SITE.name}(manyage.com) 서비스 이용·정보 오류 제보·제휴·개인정보 관련 문의 안내입니다.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <article className="space-y-4 text-slate-600 leading-relaxed">
      <h1 className="text-2xl font-bold text-slate-800">문의</h1>
      <p>
        {SITE.name}는 1인 개발자가 운영하는 정보 서비스입니다. 서비스 이용
        방법, 당첨번호·계산 결과의 오류 제보, 기능 제안, 제휴, 개인정보 관련
        요청(랭킹 닉네임 삭제 등)은 아래 이메일로 보내 주세요. 영업일 기준
        2~3일 안에 답변드립니다.
      </p>
      <p className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-100">
        📧 이메일:{" "}
        <a
          href="mailto:dialer1993@gmail.com"
          className="font-medium text-indigo-600 hover:underline"
        >
          dialer1993@gmail.com
        </a>
      </p>

      <section className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-800">
          빠른 처리를 위해 알려 주세요
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>문제가 있었던 페이지 주소(예: manyage.com/lotto/1190)</li>
          <li>오류 제보라면 잘못된 값과 올바른 값, 확인한 출처</li>
          <li>사용한 기기와 브라우저(예: 아이폰 사파리, PC 크롬)</li>
        </ul>
      </section>

      <p className="text-sm">
        당첨금 수령 절차나 세금처럼 자주 묻는 내용은{" "}
        <Link href="/guide" className="text-indigo-600 hover:underline">
          가이드
        </Link>
        에 정리해 두었습니다. 복권 구매·당첨금 지급 문의는 사이트가 처리할 수
        없으니 동행복권 공식 고객센터를 이용해 주세요.
      </p>
    </article>
  );
}
