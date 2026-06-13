"use client";

import { useRef, useState } from "react";

/** Галерея товара: главное фото + миниатюры. На мобильных — свайп. */
export default function Gallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const list = images.length ? images : ["/demo/p1-1.svg"];

  function prev() { setActive((i) => Math.max(i - 1, 0)); }
  function next() { setActive((i) => Math.min(i + 1, list.length - 1)); }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    dx < 0 ? next() : prev();
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Главное фото */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-sand select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={list[active]}
          alt={alt}
          className="h-full w-full object-cover"
          draggable={false}
        />

        {/* Стрелки навигации (всегда) */}
        {list.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Предыдущее фото"
              onClick={prev}
              disabled={active === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center bg-paper/70 backdrop-blur-sm transition-opacity hover:bg-paper disabled:opacity-0"
            >
              <ChevronIcon dir="left" />
            </button>
            <button
              type="button"
              aria-label="Следующее фото"
              onClick={next}
              disabled={active === list.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center bg-paper/70 backdrop-blur-sm transition-opacity hover:bg-paper disabled:opacity-0"
            >
              <ChevronIcon dir="right" />
            </button>
          </>
        )}

        {/* Точки (мобильный индикатор) */}
        {list.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 md:hidden">
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Фото ${i + 1}`}
                onClick={() => setActive(i)}
                className={`h-1 rounded-full transition-all duration-300 ${i === active ? "w-5 bg-ink" : "w-1.5 bg-ink/30"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Миниатюры — горизонтальная прокрутка */}
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              aria-label={`Фото ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-20 w-16 flex-shrink-0 overflow-hidden bg-sand transition-opacity sm:h-24 sm:w-20 ${
                i === active
                  ? "outline outline-1 outline-offset-2 outline-ink"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d={dir === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}
