import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "사이트 소개",
  description: "행운노트가 어떤 서비스인지 소개합니다.",
};

export default function AboutPage() {
  return (
    <article className="prose-sm space-y-4">
      <h1 className="text-2xl font-bold">사이트 소개</h1>
      <p className="text-slate-600 leading-relaxed">
        <strong>행운노트</strong>는 이미 공개된 로또 추첨 결과를 보기 쉽게
        정리해 제공하는 정보 서비스입니다. 회차별 당첨번호 조회, 번호 출현
        통계, 행운 번호 생성기를 한 곳에서 이용할 수 있습니다.
      </p>
      <h2 className="text-lg font-semibold pt-2">제공하는 기능</h2>
      <ul className="list-disc pl-5 text-slate-600 space-y-1">
        <li>회차별 당첨번호 조회</li>
        <li>번호별 출현 통계</li>
        <li>행운 번호 생성기</li>
      </ul>
      <h2 className="text-lg font-semibold pt-2">데이터 안내</h2>
      <p className="text-slate-600 leading-relaxed">
        당첨번호 정보는 공개된 추첨 결과를 바탕으로 제공되며, 지속적으로
        업데이트됩니다. 본 사이트는 복권 구매를 알선하거나 당첨을 보장하지
        않으며, 실제 구매는 동행복권 등 공식 판매처를 이용하시기 바랍니다.
      </p>
    </article>
  );
}
