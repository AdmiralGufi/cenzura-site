import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/wb";
import { site, wbProductUrl } from "@/lib/config";
import { formatPrice, pluralReviews } from "@/lib/format";
import Gallery from "@/components/Gallery";
import ProductGrid from "@/components/ProductGrid";

export const revalidate = 3600;

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(Number(params.id));
  if (!product) return { title: "Товар не найден" };
  return {
    title: product.name,
    description:
      product.description.slice(0, 160) ||
      `${product.name} от CENZURA. Купить на Wildberries.`,
    openGraph: {
      title: `${product.name} — CENZURA`,
      images: product.images.slice(0, 1),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const product = await getProduct(id);
  if (!product) notFound();

  const buyUrl = product.demo ? site.wildberries.brandUrl : wbProductUrl(id);

  // Похожие товары: та же категория, либо просто другие вещи бренда
  const all = await getProducts();
  const similar = all
    .filter(
      (p) =>
        p.id !== product.id &&
        (!product.category || p.category === product.category)
    )
    .slice(0, 4);
  const similarFinal = similar.length
    ? similar
    : all.filter((p) => p.id !== product.id).slice(0, 4);

  // Микроразметка Product (JSON-LD) для поисковиков
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || site.description,
    image: product.images,
    sku: String(product.id),
    brand: { "@type": "Brand", name: "CENZURA" },
    ...(product.rating != null && product.feedbacks
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.feedbacks,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: buyUrl,
      priceCurrency: site.wildberries.currency,
      price: product.priceCurrent,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="wrap py-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Хлебные крошки */}
      <nav className="mb-8 text-xs text-muted" aria-label="Хлебные крошки">
        <Link href="/" className="hover:text-ink hover:underline">
          Главная
        </Link>
        <span className="mx-2">/</span>
        <Link href="/catalog" className="hover:text-ink hover:underline">
          Каталог
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Gallery images={product.images} alt={product.name} />

        <div className="flex flex-col">
          {product.category && (
            <p className="h-section">{product.category}</p>
          )}
          <h1 className="mt-2 text-2xl font-medium leading-snug sm:text-3xl">
            {product.name}
          </h1>

          {product.rating != null && (
            <p className="mt-3 text-sm text-muted">
              ★ {product.rating}
              {product.feedbacks
                ? ` · ${pluralReviews(product.feedbacks)} на Wildberries`
                : ""}
            </p>
          )}

          <p className="mt-6 flex items-baseline gap-3">
            <span className="text-2xl font-medium">
              {formatPrice(product.priceCurrent)}
            </span>
            {product.priceOld && (
              <span className="text-lg text-muted line-through">
                {formatPrice(product.priceOld)}
              </span>
            )}
          </p>

          {product.sizes.length > 0 && (
            <div className="mt-8">
              <p className="h-section mb-3">Размеры</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <span
                    key={s}
                    className="border border-line px-4 py-2 text-xs uppercase tracking-wide2"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">
                Наличие размеров уточняйте на Wildberries
              </p>
            </div>
          )}

          {product.colors.length > 0 && (
            <p className="mt-6 text-sm">
              <span className="text-muted">Цвет: </span>
              {product.colors.join(", ")}
            </p>
          )}

          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-10 w-full sm:w-auto"
          >
            Купить на Wildberries ↗
          </a>
          <p className="mt-3 text-xs text-muted">
            Оплата и доставка — через Wildberries. Артикул: {product.id}
          </p>

          {product.description && (
            <div className="mt-10 border-t border-line pt-8">
              <p className="h-section mb-4">Описание</p>
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Похожие товары */}
      {similarFinal.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 text-xl font-medium tracking-wide2">
            Вам может понравиться
          </h2>
          <ProductGrid products={similarFinal} />
        </section>
      )}
    </div>
  );
}
