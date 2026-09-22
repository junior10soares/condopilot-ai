"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal" className="flex flex-1 flex-col gap-1 p-3">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative rounded-lg px-3 py-2 text-sm transition-all duration-[var(--duration-micro)] ${
              active
                ? "bg-surface-elevated text-text pl-4"
                : "text-muted hover:bg-surface-elevated hover:text-text hover:pl-4"
            }`}
          >
            {active && (
              <span
                aria-hidden
                className="absolute top-1/2 left-0 h-4 w-1 -translate-y-1/2 rounded-full"
                style={{ background: "var(--gradient-brand)" }}
              />
            )}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
