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
    <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {NAV.map((item) => {
        const active =
          item.href === "/" ? path === "/" : path.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "font-semibold text-indigo-600"
                : "text-slate-600 hover:text-indigo-600"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
