"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  // Блокируем прокрутку под мобильным меню
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Фокус на поиск при открытии
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function close() { setMenuOpen(false); }

  function submitSearch(e: React.FormEvent, q?: string) {
    e.preventDefault();
    const term = (q ?? query).trim();
    setSearchOpen(false);
    setMenuOpen(false);
    setQuery("");
    router.push(term ? `/catalog?q=${encodeURIComponent(term)}` : "/catalog");
  }

  function submitMobileSearch(e: React.FormEvent) {
    submitSearch(e, mobileSearchRef.current?.value ?? "");
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
        <div className="wrap flex h-14 items-center justify-between gap-4 sm:h-16">

          {/* Бургер (мобильный) */}
          <button
            type="button"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            className="relative flex h-11 w-11 flex-col items-center justify-center gap-[5px] md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={`h-px w-5 bg-ink transition-all duration-300 ${menuOpen ? "translate-y-[3px] rotate-45" : ""}`} />
            <span className={`h-px w-5 bg-ink transition-all duration-300 ${menuOpen ? "-translate-y-[3px] -rotate-45" : ""}`} />
          </button>

          {/* Логотип */}
          <Link
            href="/"
            className="text-base font-medium tracking-brand md:text-lg"
            onClick={close}
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

          {/* Поиск (desktop) */}
          <div className="hidden items-center justify-end md:flex">
            {searchOpen ? (
              <form onSubmit={submitSearch} className="flex items-center gap-2">
                <input
                  ref={searchInputRef}
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

          {/* Поиск (мобильный — всегда видна иконка) */}
          <button
            type="button"
            aria-label="Поиск"
            className="p-2 md:hidden"
            onClick={() => { setMenuOpen(false); setSearchOpen((v) => !v); }}
          >
            <SearchIcon />
          </button>
        </div>

        {/* Строка поиска на мобильных (раскрывается под хедером) */}
        <div
          className={`overflow-hidden transition-all duration-300 md:hidden ${searchOpen ? "max-h-16 border-b border-line" : "max-h-0"}`}
        >
          <form onSubmit={submitMobileSearch} className="wrap flex items-center gap-3 py-3">
            <input
              ref={mobileSearchRef}
              placeholder="Поиск по каталогу…"
              aria-label="Поиск по каталогу"
              autoComplete="off"
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
            <button type="submit" aria-label="Найти" className="p-1">
              <SearchIcon />
            </button>
            <button
              type="button"
              aria-label="Закрыть поиск"
              onClick={() => setSearchOpen(false)}
              className="p-1 text-muted"
            >
              <CloseIcon />
            </button>
          </form>
        </div>
      </header>

      {/* Затемнение фона при открытом меню */}
      <div
        className={`fixed inset-0 z-40 bg-ink/40 transition-opacity duration-300 md:hidden ${menuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Мобильное меню — выезжает слева */}
      <div
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[80vw] max-w-xs flex-col bg-paper transition-transform duration-300 ease-out md:hidden ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!menuOpen}
      >
        {/* Шапка меню */}
        <div className="flex h-14 items-center justify-between border-b border-line px-6 sm:h-16">
          <span className="text-base font-medium tracking-brand">CENZURA</span>
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={close}
            className="p-2 -mr-2"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Навигация */}
        <nav className="flex flex-col px-6 pt-8">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={`border-b border-line py-5 text-xl tracking-wide2 transition-all duration-300 ${menuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
              style={{ transitionDelay: menuOpen ? `${80 + i * 60}ms` : "0ms" }}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={site.wildberries.brandUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`pt-6 text-xs uppercase tracking-wide2 text-muted transition-all duration-300 ${menuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
            style={{ transitionDelay: menuOpen ? "260ms" : "0ms" }}
          >
            CENZURA на Wildberries ↗
          </a>
        </nav>

        {/* Нижняя часть меню */}
        <div className="mt-auto border-t border-line px-6 py-6">
          <p className="text-xs text-muted">{site.contacts.email}</p>
        </div>
      </div>
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
