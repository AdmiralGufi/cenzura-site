/** Товар бренда в едином формате (живой API WB или data/products.json) */
export interface Product {
  /** Артикул Wildberries (nmID) */
  id: number;
  name: string;
  /** Категория (subjectName) — используется в фильтрах каталога */
  category: string;
  description: string;
  /** Текущая цена в рублях */
  priceCurrent: number;
  /** Старая (зачёркнутая) цена, если есть скидка */
  priceOld: number | null;
  /** Абсолютные URL изображений (CDN WB) или локальные /demo/*.svg */
  images: string[];
  sizes: string[];
  colors: string[];
  rating: number | null;
  feedbacks: number | null;
  /** true — демо-товар-заглушка (кнопка «Купить» ведёт на страницу бренда) */
  demo?: boolean;
}

export interface ProductsFile {
  syncedAt: string;
  source: "demo" | "wb-content-api" | "wb-public-api";
  products: Product[];
}
