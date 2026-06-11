/**
 * Центральный конфиг сайта CENZURA.
 * Все контакты, ссылки и параметры Wildberries меняются здесь.
 */
export const site = {
  name: "CENZURA",
  tagline: "Одежда как высказывание",
  description:
    "CENZURA — модный бренд с супер-минималистичной эстетикой. Чистые линии, честные материалы, одежда без лишнего. Покупайте коллекции бренда на Wildberries.",
  // Публичный URL сайта после деплоя (нужен для SEO: sitemap, Open Graph).
  // После деплоя замените на свой домен.
  url: "https://cenzura.example.com",

  wildberries: {
    // ID бренда CENZURA на Wildberries
    brandId: 1241608,
    // Домен маркетплейса для кнопок «Купить»
    domain: "https://www.wildberries.ru",
    // Страница бренда
    brandUrl: "https://www.wildberries.ru/brands/cenzura",
    // Валюта каталога
    currency: "RUB" as const,
  },

  contacts: {
    instagram: "https://www.instagram.com/cenzura.wear/",
    instagramHandle: "@cenzura.wear",
    // Telegram появится позже — оставьте "" чтобы скрыть ссылку в футере
    telegram: "",
    // Почта для формы обратной связи (FormSubmit) и ссылки mailto.
    // При необходимости замените на брендовую почту.
    email: "bakyt130600@gmail.com",
  },
} as const;

/** Ссылка на страницу товара на Wildberries */
export function wbProductUrl(id: number): string {
  return `${site.wildberries.domain}/catalog/${id}/detail.aspx`;
}
