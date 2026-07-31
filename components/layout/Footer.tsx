import Link from "next/link";
import { Instagram, Twitter, Youtube, Facebook } from "lucide-react";

/* ── Link data ── */
const explore = [
  { label: "Discover", href: "/feed" },
  { label: "Shop", href: "/explore" },
  { label: "Saved", href: "/favorites" },
  { label: "Trending", href: "/feed" },
];

const company = [
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Newsroom", href: "/newsroom" },
  { label: "Creators", href: "/creators" },
];

const legal = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
];

const socials = [
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "Twitter", href: "https://twitter.com", icon: Twitter },
  { label: "YouTube", href: "https://youtube.com", icon: Youtube },
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
] as const;

/* ── Reusable column ── */
function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
        {title}
      </p>
      <ul className="space-y-2">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-[13px] text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Footer ── */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-neutral-200/60 bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-4 lg:px-5 py-8">

        {/* Top: logo + columns */}
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:grid-cols-5">
          {/* Brand block — spans full row on mobile, first col on lg */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-2 mb-2 lg:mb-0">
            <Link
              href="/feed"
              className="inline-block text-lg font-semibold tracking-tight text-neutral-900"
            >
              Style<span className="text-accent">Feed</span>
            </Link>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-neutral-400">
              Discover trending fashion &amp; lifestyle content from top
              creators. Shop curated products and share your favorite styles.
            </p>

            {/* Social icons */}
            <div className="mt-4 flex items-center gap-3">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-neutral-300 hover:text-neutral-700 transition-colors"
                >
                  <Icon size={16} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <FooterColumn title="Explore" links={explore} />
          <FooterColumn title="Company" links={company} />
          <FooterColumn title="Legal" links={legal} />
        </div>

        {/* Divider + bottom bar */}
        <div className="mt-8 border-t border-neutral-100 pt-5 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-neutral-400">
            &copy; {year} StyleFeed Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-[12px] text-neutral-400">
            <Link href="/terms" className="hover:text-neutral-600 transition-colors">
              Terms
            </Link>
            <span className="text-neutral-200">·</span>
            <Link href="/privacy" className="hover:text-neutral-600 transition-colors">
              Privacy
            </Link>
            <span className="text-neutral-200">·</span>
            <Link href="/sitemap.xml" className="hover:text-neutral-600 transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
