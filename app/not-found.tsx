import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="text-5xl">🔮</div>
      <h1 className="mt-4 text-2xl font-bold">페이지를 찾을 수 없어요</h1>
      <p className="mt-2 text-sm text-slate-500">
        주소가 바뀌었거나 없는 페이지예요.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        홈으로 가기
      </Link>
    </div>
  );
}
