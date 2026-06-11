import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "О бренде",
  description:
    "CENZURA — бренд одежды с философией минимализма: чистые силуэты, честные материалы, вещи вне трендов.",
};

export default function AboutPage() {
  return (
    <>
      {/* Интро */}
      <section className="border-b border-line">
        <div className="wrap py-20 sm:py-28">
          <p className="h-section">О бренде</p>
          <h1 className="mt-6 max-w-4xl text-3xl font-light leading-tight sm:text-5xl">
            CENZURA — это одежда, прошедшая внутреннюю цензуру.
            Всё лишнее вычеркнуто.
          </h1>
        </div>
      </section>

      {/* История */}
      <section className="wrap grid gap-12 py-20 md:grid-cols-2">
        <div>
          <p className="h-section">Идея</p>
          <h2 className="mt-3 text-2xl font-medium tracking-wide2">
            Имя как метод
          </h2>
        </div>
        <div className="space-y-5 text-sm leading-relaxed text-ink/80 sm:text-base">
          <p>
            Цензура обычно запрещает. Наша — отбирает. Каждая вещь CENZURA
            проходит один и тот же фильтр: если деталь не делает вещь лучше —
            её не будет. Если ткань не хочется трогать — она не пойдёт в
            производство. Если силуэт устареет через сезон — мы его не выпускаем.
          </p>
          <p>
            Так собирается гардероб, в котором всё сочетается со всем: плотные
            базовые футболки, объёмные худи, строгие пальто, текучие платья.
            Вещи без логотипов на всю грудь и без случайных деталей — только
            форма, ткань и посадка.
          </p>
          <p>
            Мы продаём на Wildberries: это быстрые доставка и возврат,
            привычная оплата и честные отзывы покупателей. Здесь, на сайте, —
            бренд, коллекции и контекст.
          </p>
        </div>
      </section>

      {/* Ценности */}
      <section className="border-y border-line bg-sand">
        <div className="wrap py-20">
          <p className="h-section mb-12">Принципы</p>
          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Форма важнее декора",
                text: "Силуэт и посадка решают всё. Украшательства не выдерживают цензуру.",
              },
              {
                n: "02",
                title: "Ткань, которую любишь",
                text: "Плотный хлопок 240–380 г/м², шерсть, вискоза. Материалы, которые живут дольше трендов.",
              },
              {
                n: "03",
                title: "Гардероб, а не лента",
                text: "Мы выпускаем вещи, которые сочетаются между собой и не устаревают к следующему сезону.",
              },
            ].map((v) => (
              <div key={v.n} className="border-t border-ink pt-6">
                <p className="text-xs text-muted">{v.n}</p>
                <h3 className="mt-3 text-base font-medium tracking-wide2">
                  {v.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {v.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="wrap py-24 text-center">
        <h2 className="mx-auto max-w-2xl text-2xl font-light leading-snug sm:text-3xl">
          Посмотрите, что прошло цензуру в этом сезоне
        </h2>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/catalog" className="btn-primary">
            Смотреть каталог
          </Link>
          <a
            href={site.wildberries.brandUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            CENZURA на Wildberries
          </a>
        </div>
      </section>
    </>
  );
}
