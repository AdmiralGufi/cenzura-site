"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import ProductGrid from "./ProductGrid";

type SortKey = "new" | "price-asc" | "price-desc";

const PAGE_SIZE = 12;

const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: "new", label: "Сначала новые" },
  { value: "price-asc", label: "Дешевле" },
  { value: "price-desc", label: "Дороже" },
];

/**
 * Клиентская часть каталога: поиск (?q=), фильтр по категории,
 * сортировка и постраничный показ «Показать ещё».
 */
export default function CatalogClient({
  products,
  categories,
}: {
  products: Product[];
  categories: string[];
}) {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();

  const [category, setCategory] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("new");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  function selectCategory(c: string) {
    setCategory(c);
    setVisible(PAGE_SIZE);
    setFiltersOpen(false);
  }

  const filtered = useMemo(() => {
    let list = products;
    if (query) {
      list = list.filter((p) => p.name.toLowerCase().includes(query));
    }
    if (category) {
      list = list.filter((p) => p.category === category);
    }
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.priceCurrent - b.priceCurrent);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.priceCurrent - a.priceCurrent);
        break;
      default:
        break;
    }
    return list;
  }, [products, query, category, sort]);

  const shown = filtered.slice(0, visible);
  const activeLabel = category || "Все";

  return (
    <div>
      {/* ── Панель управления ── */}
      <div className="mb-8 border-b border-line pb-5">

        {/* Мобильная строка: кнопка фильтра + сортировка */}
        <div className="flex items-center justify-between gap-3 sm:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="flex items-center gap-2 border border-line px-4 py-2.5 text-xs uppercase tracking-wide2 transition-colors active:bg-ink active:text-paper"
          >
            <FilterIcon />
            {activeLabel !== "Все" ? activeLabel : "Фильтр"}
            {activeLabel !== "Все" && (
              <span className="ml-1 h-1.5 w-1.5 rounded-full bg-ink" />
            )}
          </button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="flex-1 border border-line bg-transparent py-2.5 pl-3 pr-2 text-xs uppercase tracking-wide2 text-ink focus:border-ink focus:outline-none"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Мобильный выпадающий фильтр */}
        {filtersOpen && categories.length > 0 && (
          <div className="mt-3 flex flex-col gap-1 sm:hidden">
            <FilterChip active={category === ""} onClick={() => selectCategory("")}>
              Все
            </FilterChip>
            {categories.map((c) => (
              <FilterChip key={c} active={category === c} onClick={() => selectCategory(c)}>
                {c}
              </FilterChip>
            ))}
          </div>
        )}

        {/* Десктоп: чипы + сортировка в одну строку */}
        <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <FilterChip active={category === ""} onClick={() => selectCategory("")}>
                Все
              </FilterChip>
              {categories.map((c) => (
                <FilterChip key={c} active={category === c} onClick={() => selectCategory(c)}>
                  {c}
                </FilterChip>
              ))}
            </div>
          ) : (
            <span />
          )}

          <label className="flex flex-shrink-0 items-center gap-3 text-xs uppercase tracking-wide2 text-muted">
            Сортировка
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border-b border-line bg-transparent py-1 text-xs uppercase tracking-wide2 text-ink focus:border-ink focus:outline-none"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Результат поиска */}
      {query && (
        <p className="mb-6 text-sm text-muted">
          Поиск: «{query}» — {filtered.length} шт.
        </p>
      )}

      {/* Нет результатов */}
      {filtered.length === 0 && (
        <p className="py-20 text-center text-sm text-muted">Ничего не найдено</p>
      )}

      <ProductGrid products={shown} />

      {/* Показать ещё */}
      {visible < filtered.length && (
        <div className="mt-12 flex flex-col items-center gap-2">
          <button
            type="button"
            className="btn-outline w-full sm:w-auto"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
          >
            Показать ещё
          </button>
          <p className="text-xs text-muted">
            {shown.length} из {filtered.length}
          </p>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-4 py-2 text-xs uppercase tracking-wide2 transition-colors ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-line text-ink hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 6h18M7 12h10M11 18h2" />
    </svg>
  );
}
