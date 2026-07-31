"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, Heart, Menu, X } from "lucide-react";
import MobileDrawer from "./MobileDrawer";

const navLinks = [
  { href: "/feed", label: "Discover" },
  { href: "/explore", label: "Shop" },
  { href: "/favorites", label: "Saved" },
];

/** Returns true when window width is below the lg breakpoint (1024px). */
function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // hide-on-scroll: true = header fully visible
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const isExplore = pathname === "/explore";
  const router = useRouter();
  const isMobile = useMobile();

  // Initialize scroll state on mount
  useEffect(() => {
    setIsScrolled(window.scrollY > 20);
    lastScrollY.current = window.scrollY;
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  /** Hide when scrolling DOWN past 60px; show when scrolling UP or near top. */
  const handleScroll = useCallback(() => {
    if (ticking.current) return;

    ticking.current = true;
    requestAnimationFrame(() => {
      const currentY = window.scrollY;
      
      setIsScrolled(currentY > 20);

      if (isMobile) {
        const delta = currentY - lastScrollY.current;

        if (currentY < 60) {
          // Always show near top
          setHeaderVisible(true);
        } else if (delta > 4) {
          // Scrolling DOWN — hide
          setHeaderVisible(false);
          // Also close drawer / search when hiding
          setSearchOpen(false);
        } else if (delta < -4) {
          // Scrolling UP — show
          setHeaderVisible(true);
        }
      }

      lastScrollY.current = currentY;
      ticking.current = false;
    });
  }, [isMobile]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Always show header when drawer opens
  useEffect(() => {
    if (isDrawerOpen) setHeaderVisible(true);
  }, [isDrawerOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      setSearchOpen(false);
      setSearchQuery("");
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out border-b
          ${isMobile && !headerVisible ? "-translate-y-full" : "translate-y-0"}
          ${
            isScrolled || isExplore
              ? "bg-white/90 backdrop-blur-xl border-neutral-200/60 shadow-sm text-neutral-900"
              : "bg-transparent border-transparent text-neutral-900"
          }
        `}
      >
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-4 lg:px-5">

          {/* ── Desktop (≥1024px) ── */}
          <div className="hidden lg:grid grid-cols-3 h-14 items-center">

            {/* Logo */}
            <div className="justify-self-start">
              <Link href="/feed" className="text-lg font-semibold tracking-tight text-neutral-900">
                Style<span className="text-accent">Feed</span>
              </Link>
            </div>

            {/* Nav — centered */}
            <nav className="justify-self-center flex items-center gap-0.5">
              {navLinks.map(({ href, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative px-5 py-1 text-[13px] font-medium tracking-wide uppercase transition-colors ${
                      active
                        ? "text-accent"
                        : "text-neutral-400 hover:text-neutral-700"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="justify-self-end flex items-center gap-1">
              {/* Expandable search */}
              <div className={`flex items-center transition-all duration-200 ease-out ${
                searchOpen ? "w-52" : "w-8"
              }`}>
                {searchOpen ? (
                  <form onSubmit={handleSearchSubmit} className="relative flex-1">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search…"
                      className="w-full pl-7 pr-7 py-1.5 text-xs border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent/40 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X size={12} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    aria-label="Open search"
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 transition-colors"
                  >
                    <Search size={17} />
                  </button>
                )}
              </div>

              <Link
                href="/favorites"
                aria-label="Saved"
                className="p-1.5 text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <Heart size={17} />
              </Link>

              <Link
                href="/api/auth/login"
                aria-label="Sign in"
                className="ml-1 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
              >
                <User size={13} />
                Sign in
              </Link>
            </div>
          </div>

          {/* ── Mobile + Tablet (<1024px) ── */}
          <div className="lg:hidden">
            <div className="flex h-12 items-center justify-between">
              {/* Logo */}
              <Link
                href="/feed"
                className="text-base font-semibold tracking-tight text-neutral-900"
              >
                Style<span className="text-accent">Feed</span>
              </Link>

              {/* Right actions */}
              <div className="flex items-center gap-0.5 -mr-1">
                {/* Mobile menu only */}
                {!searchOpen && (
                  <button
                    aria-label="Open menu"
                    className="p-2 text-neutral-400 hover:text-neutral-700 transition-colors"
                    onClick={() => setIsDrawerOpen(true)}
                  >
                    <Menu size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Spacer so content sits below the fixed header */}
      <div className="h-12 lg:h-14" aria-hidden="true" />

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
