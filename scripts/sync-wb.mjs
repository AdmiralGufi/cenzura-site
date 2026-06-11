#!/usr/bin/env node
/**
 * Синхронизация каталога CENZURA с Wildberries → data/products.json
 *
 * Источники (по приоритету):
 *  1. Официальный Content API продавца + API цен — нужен WB_API_TOKEN в .env.
 *     Самый надёжный путь: полные названия, описания, фото, размеры, категории.
 *  2. Публичный каталог бренда (тот же API, что у сайта WB) — без токена,
 *     но отвечает только с IP РФ/СНГ. Добавляет рейтинг и число отзывов.
 *
 * Запуск:  npm run sync
 * После успешной синхронизации пересоберите сайт (npm run build) или
 * запушьте изменённый data/products.json — Vercel пересоберёт сам.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "data", "products.json");
const BRAND_ID = 1241608; // CENZURA

/* ---------------- .env без зависимостей ---------------- */
function loadEnv() {
  const p = path.join(ROOT, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv();
const TOKEN = process.env.WB_API_TOKEN || "";

/* ---------------- утилиты ---------------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url, options = {}, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(20000),
      });
      if (res.status === 429) {
        // превышен лимит запросов — ждём и повторяем
        await sleep(2500 * (i + 1));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      if (i < tries - 1) await sleep(1500);
    }
  }
  throw lastErr;
}

/* ---------------- изображения (публичный CDN) ---------------- */
function basketHost(vol) {
  const ranges = [
    [143, 1], [287, 2], [431, 3], [719, 4], [1007, 5], [1061, 6],
    [1115, 7], [1169, 8], [1313, 9], [1601, 10], [1655, 11], [1919, 12],
    [2045, 13], [2189, 14], [2405, 15], [2621, 16], [2837, 17], [3053, 18],
    [3269, 19], [3485, 20], [3701, 21], [3917, 22], [4133, 23], [4349, 24],
    [4565, 25], [4877, 26], [5189, 27], [5501, 28], [5813, 29], [6125, 30],
  ];
  for (const [max, host] of ranges) {
    if (vol <= max) return String(host).padStart(2, "0");
  }
  return String(31 + Math.floor((vol - 6126) / 312)).padStart(2, "0");
}

function buildImageUrls(id, count) {
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

/* ---------------- 1) Официальный Content API ---------------- */
async function fetchCardsOfficial() {
  const cards = [];
  let cursor = { limit: 100 };
  for (;;) {
    const json = await fetchJson(
      "https://content-api.wildberries.ru/content/v2/get/cards/list",
      {
        method: "POST",
        headers: {
          Authorization: TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: { cursor, filter: { withPhoto: -1 } },
        }),
      }
    );
    const batch = json?.cards ?? [];
    cards.push(...batch);
    const c = json?.cursor;
    if (!c || batch.length < cursor.limit) break;
    cursor = { limit: 100, updatedAt: c.updatedAt, nmID: c.nmID };
    await sleep(700); // щадим лимит 100 req/min
  }
  return cards;
}

async function fetchPricesOfficial() {
  const map = new Map();
  let offset = 0;
  for (;;) {
    const json = await fetchJson(
      `https://discounts-prices-api.wildberries.ru/api/v2/list/goods/filter?limit=1000&offset=${offset}`,
      { headers: { Authorization: TOKEN } }
    );
    const goods = json?.data?.listGoods ?? [];
    for (const g of goods) {
      const sizes = g.sizes ?? [];
      const discounted = sizes
        .map((s) => s.discountedPrice ?? s.price)
        .filter((v) => typeof v === "number");
      const base = sizes
        .map((s) => s.price)
        .filter((v) => typeof v === "number");
      const current = discounted.length ? Math.min(...discounted) : 0;
      const old = base.length ? Math.min(...base) : 0;
      map.set(g.nmID, {
        current: Math.round(current),
        old: old > current ? Math.round(old) : null,
      });
    }
    if (goods.length < 1000) break;
    offset += 1000;
    await sleep(700);
  }
  return map;
}

function characteristicValues(card, nameLower) {
  const ch = (card.characteristics ?? []).find(
    (c) => String(c.name || "").toLowerCase() === nameLower
  );
  if (!ch) return [];
  return (Array.isArray(ch.value) ? ch.value : [ch.value])
    .map(String)
    .filter(Boolean);
}

function normalizeOfficial(cards, prices) {
  return cards.map((card) => {
    const price = prices.get(card.nmID) ?? { current: 0, old: null };
    const photos = (card.photos ?? [])
      .map((p) => p.big || p.c516x688 || p.square || p.tm)
      .filter(Boolean);
    return {
      id: card.nmID,
      name: card.title || card.subjectName || `Артикул ${card.nmID}`,
      category: card.subjectName || "",
      description: card.description || "",
      priceCurrent: price.current,
      priceOld: price.old,
      images: photos.length ? photos : buildImageUrls(card.nmID, 1),
      sizes: (card.sizes ?? [])
        .map((s) => s.techSize)
        .filter((s) => s && s !== "0"),
      colors: characteristicValues(card, "цвет"),
      rating: null,
      feedbacks: null,
    };
  });
}

/* ---------------- 2) Публичный каталог бренда ---------------- */
async function fetchPublicCatalog() {
  const products = [];
  for (let page = 1; page <= 10; page++) {
    const url =
      `https://catalog.wb.ru/brands/v2/catalog?ab_testing=false&appType=1` +
      `&brand=${BRAND_ID}&curr=rub&dest=-1257786&lang=ru&page=${page}` +
      `&sort=newly&spp=30`;
    const json = await fetchJson(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
    });
    const items = json?.data?.products ?? [];
    if (!items.length) break;
    products.push(...items);
    if (items.length < 100) break;
    await sleep(500);
  }
  return products;
}

function normalizePublic(items) {
  return items.map((p) => {
    const priceObj = (p.sizes ?? []).find((s) => s.price)?.price ?? {};
    const current = priceObj.product ? Math.round(priceObj.product / 100) : 0;
    const basic = priceObj.basic ? Math.round(priceObj.basic / 100) : 0;
    return {
      id: p.id,
      name: p.name,
      category: "",
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
    };
  });
}

/* ---------------- main ---------------- */
async function main() {
  let products = [];
  let source = "demo";

  if (TOKEN) {
    console.log("→ Официальный Content API Wildberries…");
    try {
      const [cards, prices] = [await fetchCardsOfficial(), await fetchPricesOfficial()];
      products = normalizeOfficial(cards, prices);
      source = "wb-content-api";
      console.log(`  получено карточек: ${products.length}`);
    } catch (e) {
      console.warn(`  не удалось (${e.message}). Пробуем публичный API…`);
    }
  } else {
    console.log("⚠ WB_API_TOKEN не найден в .env — пробуем публичный API…");
  }

  // Публичный API: основной источник без токена, иначе — обогащение рейтингом
  try {
    const publicItems = await fetchPublicCatalog();
    if (products.length === 0 && publicItems.length > 0) {
      products = normalizePublic(publicItems);
      source = "wb-public-api";
      console.log(`  публичный каталог: ${products.length} товаров`);
    } else if (publicItems.length > 0) {
      const byId = new Map(publicItems.map((p) => [p.id, p]));
      for (const product of products) {
        const pub = byId.get(product.id);
        if (pub) {
          product.rating = pub.reviewRating ?? null;
          product.feedbacks = pub.feedbacks ?? null;
        }
      }
      console.log("  рейтинг/отзывы добавлены из публичного API");
    }
  } catch (e) {
    console.warn(`  публичный API недоступен (${e.message})`);
  }

  if (products.length === 0) {
    console.error(
      "✗ Не удалось получить товары ни из одного источника.\n" +
        "  Проверьте токен в .env и доступ к интернету (API WB отвечает с IP РФ/СНГ)."
    );
    process.exit(1);
  }

  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify(
      { syncedAt: new Date().toISOString(), source, products },
      null,
      2
    ),
    "utf8"
  );
  console.log(`✓ ${products.length} товаров → data/products.json (источник: ${source})`);
  console.log("  Теперь пересоберите сайт: npm run build (или запушьте в git).");
}

main().catch((e) => {
  console.error("✗ Ошибка синхронизации:", e);
  process.exit(1);
});
