import { ballColor } from "@/lib/lotto-data";

// 재사용 컴포넌트: 로또 번호 하나를 색칠된 "공"으로 그림.
// Flutter 대응: 재사용 위젯(StatelessWidget) 하나를 만든 것과 같음.
//   props(size, n) = 위젯 생성자 파라미터.
//
// Server Component (기본값) — 상호작용이 없으므로 "use client" 불필요.

type Props = {
  n: number;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
};

export default function NumberBall({ n, size = "md" }: Props) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold shadow-sm ${ballColor(
        n
      )} ${sizeClass[size]}`}
    >
      {n}
    </span>
  );
}
