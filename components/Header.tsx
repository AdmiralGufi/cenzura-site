"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/config";

const nav = [
  { href: "/catalog", label: "Каталог" },
  { href: "/about", label: "О бренде" },
  { href: "/contacts", label: "Контакты" },
];

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Блокируем прокрутку под мобильным меню
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    setMenuOpen(false);
    setQuery("");
    router.push(q ? `/catalog?q=${encodeURIComponent(q)}` : "/catalog");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        {/* Бургер (мобильный) */}
        <button
          type="button"
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span
            className={`h-px w-5 bg-ink transition-transform ${menuOpen ? "translate-y-[3px] rotate-45" : ""}`}
          />
          <span
            className={`h-px w-5 bg-ink transition-transform ${menuOpen ? "-translate-y-[3px] -rotate-45" : ""}`}
          />
        </button>

        {/* Логотип */}
        <Link
          href="/"
          className="text-base font-medium tracking-brand md:text-lg"
          onClick={() => setMenuOpen(false)}
        >
          CENZURA
        </Link>

        {/* Навигация (desktop) */}
        <nav className="hidden items-center gap-10 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[11px] uppercase tracking-wide2 text-ink/80 transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Поиск */}
        <div className="flex items-center justify-end">
          {searchOpen ? (
            <form onSubmit={submitSearch} className="flex items-center gap-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => !query && setSearchOpen(false)}
                placeholder="Поиск по каталогу"
                aria-label="Поиск по каталогу"
                className="w-40 border-b border-ink bg-transparent py-1 text-sm focus:outline-none sm:w-56"
              />
              <button type="submit" aria-label="Найти" className="p-1">
                <SearchIcon />
              </button>
            </form>
          ) : (
            <button
              type="button"
              aria-label="Открыть поиск"
              className="p-2"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon />
            </button>
          )}
        </div>
      </div>

      {/* Мобильное меню */}
      {menuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 bg-paper md:hidden">
          <nav className="wrap flex flex-col gap-2 pt-10">
            {nav.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="fade-up border-b border-line py-5 text-2xl tracking-wide2"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={site.wildberries.brandUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="fade-up py-5 text-sm uppercase tracking-wide2 text-muted"
              style={{ animationDelay: "200ms" }}
            >
              CENZURA на Wildberries ↗
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
