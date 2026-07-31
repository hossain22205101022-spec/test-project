"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, Home, Compass, Heart, LogIn, Search } from "lucide-react";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { href: "/feed", label: "Discover", icon: Home },
  { href: "/explore", label: "Shop", icon: Compass },
  { href: "/favorites", label: "Saved", icon: Heart },
];

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      setSearchQuery("");
      onClose();
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[min(288px,85vw)] bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <span className="text-base font-semibold tracking-tight text-neutral-900">
            Style<span className="text-accent">Feed</span>
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search styles…"
              className="w-full pl-8 pr-4 py-2 text-xs border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent/40 transition-all"
            />
          </form>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col px-3 py-2 gap-0.5 flex-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-medium tracking-wide transition-colors ${
                  active
                    ? "bg-neutral-50 text-accent"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                }`}
              >
                <Icon size={17} strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign in */}
        <div className="px-5 pb-6 border-t border-neutral-100 pt-4">
          <Link
            href="/api/auth/login"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-neutral-900 text-white text-xs font-medium tracking-wide hover:bg-neutral-800 transition-colors"
          >
            <LogIn size={14} />
            Sign in
          </Link>
        </div>
      </div>
    </>
  );
}
