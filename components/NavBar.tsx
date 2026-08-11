"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CatMascot } from "@/components/CatMascot";

const LINKS = [
  { href: "/", label: "ダッシュボード" },
  { href: "/transactions", label: "取引" },
  { href: "/budgets", label: "予算" },
  { href: "/assets", label: "資産" },
  { href: "/categories", label: "カテゴリ" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-card">
      <nav className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-3">
        <span className="mr-4 flex shrink-0 items-center gap-1.5 font-semibold text-accent">
          <CatMascot className="h-7 w-7" />
          家計管理
        </span>
        {LINKS.map((link) => {
          const active =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/70 hover:bg-accent-soft"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
