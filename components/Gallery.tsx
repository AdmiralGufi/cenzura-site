"use client";

import { useState } from "react";

/** Галерея товара: главное фото + миниатюры */
export default function Gallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : ["/demo/p1-1.svg"];

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[3/4] w-full overflow-hidden bg-sand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={list[active]}
          alt={alt}
          className="h-full w-full object-cover"
        />
      </div>

      {list.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              aria-label={`Фото ${i + 1}`}
              onClick={() => setActive(i)}
              className={`aspect-[3/4] overflow-hidden bg-sand transition-opacity ${
                i === active
                  ? "outline outline-1 outline-offset-2 outline-ink"
                  : "opacity-60 hover:opacity-100"
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
