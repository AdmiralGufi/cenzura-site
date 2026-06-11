import Link from "next/link";
import { site } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="wrap grid gap-12 py-16 md:grid-cols-3">
        {/* Бренд */}
        <div>
          <p className="text-lg font-medium tracking-brand">CENZURA</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            {site.tagline}. Минимализм, форма, характер — без лишних слов.
          </p>
        </div>

        {/* Навигация */}
        <nav className="flex flex-col gap-3 text-sm">
          <p className="h-section mb-2">Разделы</p>
          <Link href="/catalog" className="w-fit hover:underline">
            Каталог
          </Link>
          <Link href="/about" className="w-fit hover:underline">
            О бренде
          </Link>
          <Link href="/contacts" className="w-fit hover:underline">
            Контакты
          </Link>
          <a
            href={site.wildberries.brandUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit hover:underline"
          >
            Магазин на Wildberries ↗
          </a>
        </nav>

        {/* Контакты */}
        <div className="flex flex-col gap-3 text-sm">
          <p className="h-section mb-2">Связь</p>
          <a
            href={site.contacts.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit hover:underline"
          >
            Instagram {site.contacts.instagramHandle}
          </a>
          {site.contacts.telegram && (
            <a
              href={site.contacts.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit hover:underline"
            >
              Telegram
            </a>
          )}
          <a href={`mailto:${site.contacts.email}`} className="w-fit hover:underline">
            {site.contacts.email}
          </a>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CENZURA. Все права защищены.</p>
          <p>Покупка товаров осуществляется на Wildberries.</p>
        </div>
      </div>
    </footer>
  );
}
