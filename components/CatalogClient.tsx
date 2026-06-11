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
        break; // порядок из источника = сначала новые
    }
    return list;
  }, [products, query, category, sort]);

  const shown = filtered.slice(0, visible);

  return (
    <div>
      {/* Панель управления */}
      <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Категории */}
        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={category === ""}
              onClick={() => {
                setCategory("");
                setVisible(PAGE_SIZE);
              }}
            >
              Все
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c}
                active={category === c}
                onClick={() => {
                  setCategory(c);
                  setVisible(PAGE_SIZE);
                }}
              >
                {c}
              </FilterChip>
            ))}
          </div>
        ) : (
          <span />
        )}

        {/* Сортировка */}
        <label className="flex items-center gap-3 text-xs uppercase tracking-wide2 text-muted">
          Сортировка
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="border-b border-line bg-transparent py-1 text-xs uppercase tracking-wide2 text-ink focus:border-ink focus:outline-none"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Результат поиска */}
      {query && (
        <p className="mb-6 text-sm text-muted">
          Поиск: «{query}» — {filtered.length} шт.
        </p>
      )}

      <ProductGrid products={shown} />

      {/* Показать ещё */}
      {visible < filtered.length && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            className="btn-outline"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
          >
            Показать ещё
          </button>
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
