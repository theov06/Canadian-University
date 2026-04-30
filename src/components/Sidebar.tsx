"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { useTranslation } from "./LanguageProvider";

const nav = [
  { href: "/", key: "nav.explore", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
  { href: "/search", key: "nav.search", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" },
  { href: "/compare", key: "nav.compare", icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" },
  { href: "/graph", key: "nav.graph", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" },
  { href: "/find-my-program", key: "nav.quiz", icon: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { theme, resolved, setTheme } = useTheme();
  const { locale, setLocale, t } = useTranslation();

  const cycleTheme = () => {
    const order: ("light" | "dark" | "system")[] = ["light", "dark", "system"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 lg:w-56 glass flex flex-col z-50 border-r border-[var(--border)]">
      <div className="h-16 flex items-center px-4 border-b border-[var(--border)]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          BA
        </div>
        <span className="ml-3 font-semibold text-sm hidden lg:block">Canada BA Explorer</span>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
                  : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-glass)]"
              }`}
            >
              <NavIcon d={item.icon} />
              <span className="hidden lg:block">{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[var(--border)] space-y-1.5">
        {/* Language toggle */}
        <button
          onClick={() => setLocale(locale === "en" ? "vi" : "en")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-glass)] transition-all"
          aria-label="Switch language"
        >
          <span className="w-5 h-5 rounded border border-[var(--border)] flex items-center justify-center text-[9px] font-bold">{locale === "en" ? "EN" : "VI"}</span>
          <span className="hidden lg:block">{locale === "en" ? "Tiếng Việt" : "English"}</span>
        </button>
        <button
          onClick={cycleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-glass)] transition-all"
          aria-label="Toggle theme"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            {resolved === "dark" ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            )}
          </svg>
          <span className="hidden lg:block capitalize">{theme === "system" ? `System (${resolved})` : theme}</span>
        </button>
        <div className="text-[10px] text-[var(--text-muted)] hidden lg:block text-center">
          14 bachelor programs · Official data
        </div>
      </div>
    </aside>
  );
}
