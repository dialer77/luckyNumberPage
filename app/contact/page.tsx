import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의",
  description: "행운노트에 대한 문의 연락처 안내입니다.",
};

export default function ContactPage() {
  return (
    <article className="space-y-4 text-slate-600 leading-relaxed">
      <h1 className="text-2xl font-bold text-slate-800">문의</h1>
      <p>
        서비스 이용, 정보 오류 제보, 개인정보 관련 문의는 아래 이메일로
        연락해 주세요. 확인 후 순차적으로 답변드립니다.
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
    </article>
  );
}
