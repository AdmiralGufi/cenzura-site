import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { site, wbProductUrl } from "@/lib/config";

/**
 * Карточка товара: изображение + название + цена.
 * При наведении показывается второе фото (если есть).
 * Кнопка «Купить на Wildberries» — отдельная ссылка (не вложена в Link).
 */
export default function ProductCard({ product }: { product: Product }) {
  const buyUrl = product.demo
    ? site.wildberries.brandUrl
    : wbProductUrl(product.id);
  const [first, second] = product.images;

  return (
    <article className="group flex flex-col">
      <Link
        href={`/product/${product.id}`}
        aria-label={product.name}
        className="relative block overflow-hidden bg-sand"
      >
        <div className="aspect-[3/4] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={first}
            alt={product.name}
            loading="lazy"
            className={`h-full w-full object-cover transition-opacity duration-300 ${second ? "group-hover:opacity-0" : ""}`}
          />
          {second && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={second}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </div>
        {product.priceOld && (
          <span className="absolute left-3 top-3 bg-ink px-2 py-1 text-[10px] uppercase tracking-wide2 text-paper">
            Sale
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 pt-4">
        <Link href={`/product/${product.id}`} className="hover:underline">
          <h3 className="text-sm leading-snug">{product.name}</h3>
        </Link>

        <p className="flex items-baseline gap-2 text-sm">
          <span className="font-medium">{formatPrice(product.priceCurrent)}</span>
          {product.priceOld && (
            <span className="text-muted line-through">
              {formatPrice(product.priceOld)}
            </span>
          )}
        </p>

        {product.rating != null && (
          <p className="text-xs text-muted">
            ★ {product.rating}
            {product.feedbacks != null && ` · ${product.feedbacks}`}
          </p>
        )}

        <a
          href={buyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 w-fit text-[11px] uppercase tracking-wide2 underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          Купить на Wildberries
        </a>
      </div>
    </article>
  );
}
