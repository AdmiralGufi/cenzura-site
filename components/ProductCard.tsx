"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { site, wbProductUrl } from "@/lib/config";

/**
 * Карточка товара: изображение + название + цена.
 * Десктоп: hover меняет фото. Мобильный: тап по фото переключает.
 */
export default function ProductCard({ product }: { product: Product }) {
  const buyUrl = product.demo
    ? site.wildberries.brandUrl
    : wbProductUrl(product.id);
  const [first, second] = product.images;
  const [tapped, setTapped] = useState(false);

  // На мобильных тап по фото переключает на второе изображение
  function handleTap(e: React.MouseEvent) {
    if (!second) return;
    // Определяем мобильный по отсутствию hover
    if (window.matchMedia("(hover: none)").matches) {
      e.preventDefault();
      setTapped((v) => !v);
    }
  }

  const showSecond = second && tapped;

  return (
    <article className="group flex flex-col">
      <Link
        href={`/product/${product.id}`}
        aria-label={product.name}
        className="relative block overflow-hidden bg-sand"
        onClick={handleTap}
      >
        <div className="aspect-[3/4] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={first}
            alt={product.name}
            loading="lazy"
            className={`h-full w-full object-cover transition-opacity duration-300 ${second ? "group-hover:opacity-0" : ""} ${showSecond ? "opacity-0" : ""}`}
          />
          {second && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={second}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-100 ${showSecond ? "opacity-100" : "opacity-0"}`}
            />
          )}
        </div>

        {/* Бейдж скидки */}
        {product.priceOld && (
          <span className="absolute left-3 top-3 bg-ink px-2 py-1 text-[10px] uppercase tracking-wide2 text-paper">
            Sale
          </span>
        )}

        {/* Подсказка «листнуть» для мобильных (только если есть второе фото) */}
        {second && !tapped && (
          <span className="absolute bottom-3 right-3 bg-paper/80 px-2 py-1 text-[10px] text-ink backdrop-blur-sm sm:hidden">
            ещё фото
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 pt-3 sm:pt-4">
        <Link href={`/product/${product.id}`} className="hover:underline">
          <h3 className="text-sm leading-snug">{product.name}</h3>
        </Link>

        {product.colors.length > 0 && (
          <p className="text-xs text-muted">{product.colors.join(", ")}</p>
        )}

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
          className="mt-2 block py-2 text-center text-[11px] uppercase tracking-wide2 border border-line transition-colors hover:border-ink sm:w-fit sm:py-0 sm:border-0 sm:text-left sm:underline sm:decoration-1 sm:underline-offset-4 sm:hover:decoration-2"
        >
          Купить на Wildberries
        </a>
      </div>
    </article>
  );
}
