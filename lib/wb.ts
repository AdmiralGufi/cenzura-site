import { cache } from "react";
import { site } from "./config";
import type { Product, ProductsFile } from "./types";
import localData from "@/data/products.json";

/**
 * Слой данных Wildberries.
 *
 * Стратегия (как в ТЗ — парсинг + ручной фолбэк):
 *  1. Пытаемся получить живой каталог бренда через публичный JSON-API
 *     Wildberries (тот же, что использует их фронтенд). Ответ кэшируется
 *     Next.js на 1 час (ISR), сайт не дёргает WB на каждый запрос.
 *     ВАЖНО: этот API отвечает только с IP РФ/СНГ — на зарубежном хостинге
 *     (Vercel US) запрос упадёт по таймауту, и сработает пункт 2.
 *  2. Фолбэк: data/products.json — снапшот каталога, который обновляется
 *     скриптом `npm run sync` через ОФИЦИАЛЬНЫЙ Content API продавца
 *     (токен в .env). Это основной рекомендуемый путь.
 */

const LIVE_TIMEOUT_MS = 6000;
const REVALIDATE_CATALOG = 3600; // 1 час
const REVALIDATE_CARD = 86400; // 24 часа

/* ------------------------------------------------------------------ */
/* Изображения: CDN Wildberries                                        */
/* ------------------------------------------------------------------ */

/**
 * Хост basket-NN определяется диапазоном vol (nmID / 100000).
 * Таблица актуальна на 2026 г.; для новых диапазонов работает формула-фолбэк.
 * Скрипт sync берёт точные URL из официального API, поэтому эта математика
 * нужна только для живого публичного API.
 */
function basketHost(vol: number): string {
  const ranges: Array<[number, number]> = [
    [143, 1], [287, 2], [431, 3], [719, 4], [1007, 5], [1061, 6],
    [1115, 7], [1169, 8], [1313, 9], [1601, 10], [1655, 11], [1919, 12],
    [2045, 13], [2189, 14], [2405, 15], [2621, 16], [2837, 17], [3053, 18],
    [3269, 19], [3485, 20], [3701, 21], [3917, 22], [4133, 23], [4349, 24],
    [4565, 25], [4877, 26], [5189, 27], [5501, 28], [5813, 29], [6125, 30],
  ];
  for (const [max, host] of ranges) {
    if (vol <= max) return String(host).padStart(2, "0");
  }
  // Новые корзины добавляются по ~312 vol; формула-приближение
  const next = 31 + Math.floor((vol - 6126) / 312);
  return String(next).padStart(2, "0");
}

/** Построить URL изображений товара по артикулу */
export function buildImageUrls(id: number, count: number): string[] {
  const vol = Math.floor(id / 100000);
  const part = Math.floor(id / 1000);
  const host = basketHost(vol);
  const n = Math.max(1, Math.min(count || 1, 6));
  return Array.from(
    { length: n },
    (_, i) =>
      `https://basket-${host}.wbbasket.ru/vol${vol}/part${part}/${id}/images/big/${i + 1}.webp`
  );
}

/* ------------------------------------------------------------------ */
/* Живой публичный каталог бренда                                      */
/* ------------------------------------------------------------------ */

interface WbCatalogProduct {
  id: number;
  name: string;
  pics?: number;
  reviewRating?: number;
  feedbacks?: number;
  colors?: Array<{ name: string }>;
  sizes?: Array<{
    origName?: string;
    name?: string;
    price?: { basic?: number; product?: number };
  }>;
}

async function fetchLiveCatalog(): Promise<Product[]> {
  const url =
    `https://catalog.wb.ru/brands/v2/catalog?ab_testing=false&appType=1` +
    `&brand=${site.wildberries.brandId}&curr=rub&dest=-1257786&lang=ru` +
    `&page=1&sort=newly&spp=30`;

  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_CATALOG },
    signal: AbortSignal.timeout(LIVE_TIMEOUT_MS),
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`WB catalog HTTP ${res.status}`);

  const json = await res.json();
  const items: WbCatalogProduct[] = json?.data?.products ?? [];

  return items.map((p) => {
    // Цены в копейках внутри sizes[].price
    const priceObj = p.sizes?.find((s) => s.price)?.price;
    const current = priceObj?.product ? Math.round(priceObj.product / 100) : 0;
    const basic = priceObj?.basic ? Math.round(priceObj.basic / 100) : 0;
    return {
      id: p.id,
      name: p.name,
      category: "", // публичный API не отдаёт название категории
      description: "",
      priceCurrent: current,
      priceOld: basic > current ? basic : null,
      images: buildImageUrls(p.id, p.pics ?? 1),
      sizes: (p.sizes ?? [])
        .map((s) => s.origName || s.name || "")
        .filter((s) => s && s !== "0"),
      colors: (p.colors ?? []).map((c) => c.name).filter(Boolean),
      rating: p.reviewRating ?? null,
      feedbacks: p.feedbacks ?? null,
    } satisfies Product;
  });
}

/* ------------------------------------------------------------------ */
/* Публичные данные карточки (описание) — CDN, без авторизации          */
/* ------------------------------------------------------------------ */

async function fetchCardDetails(
  id: number
): Promise<{ description?: string } | null> {
  try {
    const vol = Math.floor(id / 100000);
    const part = Math.floor(id / 1000);
    const url = `https://basket-${basketHost(vol)}.wbbasket.ru/vol${vol}/part${part}/${id}/info/ru/card.json`;
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_CARD },
      signal: AbortSignal.timeout(LIVE_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return { description: json?.description ?? "" };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Публичное API                                                       */
/* ------------------------------------------------------------------ */

const localProducts = (localData as unknown as ProductsFile).products;

// Если живой API один раз не ответил, в рамках этого процесса больше
// не пытаемся (избегаем 6-секундных таймаутов на каждой странице).
let liveUnavailable = false;

/** Все товары: живой API → фолбэк на локальный снапшот */
export const getProducts = cache(async (): Promise<Product[]> => {
  if (!liveUnavailable) {
    try {
      const live = await fetchLiveCatalog();
      if (live.length > 0) return live;
    } catch {
      // живой API недоступен (гео-блок/таймаут) — используем снапшот
      liveUnavailable = true;
    }
  }
  return localProducts;
});

/** Один товар по артикулу; описание дотягивается с CDN, если пустое */
export async function getProduct(id: number): Promise<Product | null> {
  const products = await getProducts();
  const product = products.find((p) => p.id === id) ?? null;
  if (!product) return null;
  if (!product.description && !product.demo) {
    const details = await fetchCardDetails(id);
    if (details?.description) {
      return { ...product, description: details.description };
    }
  }
  return product;
}

/** Список категорий для фильтра (непустые, уникальные) */
export function categoriesOf(products: Product[]): string[] {
  return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
}
