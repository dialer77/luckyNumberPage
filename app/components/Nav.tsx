"use client";
// 헤더 내비게이션 — 현재 위치한 섹션을 강조 표시.

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "홈" },
  { href: "/lotto", label: "🍀 행운노트" },
  { href: "/invest", label: "📈 그때샀으면" },
  { href: "/calc", label: "🧮 머니계산기" },
  { href: "/guide", label: "📚 가이드" },
];

export default function Nav() {
  const path = usePathname();

  return (
    <nav className="no-scrollbar -mx-4 flex flex-nowrap gap-x-4 overflow-x-auto px-4 text-sm sm:mx-0 sm:px-0">
      {NAV.map((item) => {
        const active =
          item.href === "/" ? path === "/" : path.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap py-0.5 ${
              active
                ? "font-semibold text-indigo-600"
                : "text-slate-600 hover:text-indigo-600"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
