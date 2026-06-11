import { site } from "./config";

const symbols: Record<string, string> = { RUB: "₽", KGS: "сом" };

/** 12990 → «12 990 ₽» */
export function formatPrice(value: number): string {
  const formatted = new Intl.NumberFormat("ru-RU").format(value);
  return `${formatted} ${symbols[site.wildberries.currency] ?? "₽"}`;
}

/** Склонение: 1 отзыв / 2 отзыва / 5 отзывов */
export function pluralReviews(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} отзыв`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
    return `${n} отзыва`;
  return `${n} отзывов`;
}
