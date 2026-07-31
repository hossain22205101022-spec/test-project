"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Search, Heart } from "lucide-react";

const tabs = [
  { href: "/feed",      label: "Discover", icon: Home    },
  { href: "/explore",   label: "Shop",     icon: Compass },
  { href: "/search",    label: "Search",   icon: Search  },
  { href: "/favorites", label: "Saved",    icon: Heart   },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const isExplore = pathname === "/explore";

  return (
    <nav
      aria-label="Mobile navigation"
      className={`lg:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl border-t bg-white/90 border-neutral-200/60`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around h-14">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors ${
                active
                  ? "text-accent"
                  : "text-neutral-400 active:text-neutral-700"
              }`}
            >
              <Icon
                size={21}
                strokeWidth={active ? 2.2 : 1.6}
                className="transition-all"
              />
              <span className="text-[10px] font-medium tracking-wide">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
