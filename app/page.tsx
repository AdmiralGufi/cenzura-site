import Link from "next/link";
import { getProducts } from "@/lib/wb";
import { site } from "@/lib/config";
import ProductGrid from "@/components/ProductGrid";

export const revalidate = 3600;

export default async function HomePage() {
  const products = await getProducts();
  const latest = products.slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="wrap flex min-h-[78vh] flex-col items-center justify-center py-24 text-center">
          <p className="h-section fade-up">Модный бренд</p>
          <h1
            className="fade-up mt-6 text-[13vw] font-medium leading-none tracking-brand sm:text-7xl lg:text-8xl"
            style={{ animationDelay: "80ms" }}
          >
            CENZURA
          </h1>
          <p
            className="fade-up mt-8 max-w-md text-sm leading-relaxed text-muted sm:text-base"
            style={{ animationDelay: "160ms" }}
          >
            {site.tagline}. Чистые линии, честные материалы
            и ничего лишнего.
          </p>
          <div
            className="fade-up mt-12 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "240ms" }}
          >
            <Link href="/catalog" className="btn-primary">
              Смотреть каталог
            </Link>
            <a
              href={site.wildberries.brandUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              Купить на Wildberries
            </a>
          </div>
        </div>
      </section>

      {/* Новинки */}
      <section className="wrap py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="h-section">Коллекция</p>
            <h2 className="mt-3 text-2xl font-medium tracking-wide2 sm:text-3xl">
              Новинки
            </h2>
          </div>
          <Link
            href="/catalog"
            className="link-line hidden text-xs uppercase tracking-wide2 sm:block"
          >
            Весь каталог
          </Link>
        </div>

        <ProductGrid products={latest} />

        <div className="mt-12 text-center sm:hidden">
          <Link href="/catalog" className="btn-outline w-full">
            Весь каталог
          </Link>
        </div>
      </section>

      {/* Манифест */}
      <section className="border-y border-line bg-sand">
        <div className="wrap py-24 text-center">
          <p className="h-section">Манифест</p>
          <blockquote className="mx-auto mt-8 max-w-3xl text-2xl font-light leading-snug sm:text-4xl">
            Мы убрали всё, что можно убрать.
            <br />
            Осталось только то, что нужно носить.
          </blockquote>
          <Link
            href="/about"
            className="link-line mt-10 inline-block text-xs uppercase tracking-wide2"
          >
            О бренде
          </Link>
        </div>
      </section>

      {/* Принципы */}
      <section className="wrap grid gap-10 py-20 sm:grid-cols-3">
        {[
          {
            n: "01",
            title: "Меньше, но точнее",
            text: "Каждая вещь продумана до шва. Никаких случайных деталей и сезонного шума.",
          },
          {
            n: "02",
            title: "Честные материалы",
            text: "Плотный хлопок, шерсть, вискоза. Ткани, которые приятно носить и легко любить.",
          },
          {
            n: "03",
            title: "Вне трендов",
            text: "Силуэты, которые работают сегодня и через пять лет. Гардероб, а не лента покупок.",
          },
        ].map((item) => (
          <div key={item.n} className="border-t border-ink pt-6">
            <p className="text-xs text-muted">{item.n}</p>
            <h3 className="mt-3 text-base font-medium tracking-wide2">
              {item.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.text}</p>
          </div>
        ))}
      </section>
    </>
  );
}
