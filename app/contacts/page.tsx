import type { Metadata } from "next";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Связаться с брендом CENZURA: Instagram, email, форма обратной связи.",
};

export default function ContactsPage() {
  return (
    <div className="wrap grid gap-16 py-16 sm:py-20 md:grid-cols-2">
      {/* Контакты */}
      <div>
        <p className="h-section">Контакты</p>
        <h1 className="mt-3 text-3xl font-medium tracking-wide2 sm:text-4xl">
          Связь
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
          Вопросы о вещах, размерах, сотрудничестве и оптовых заказах —
          пишите, отвечаем быстро. Заказы и доставка оформляются
          на Wildberries.
        </p>

        <div className="mt-10 flex flex-col gap-4 text-sm">
          <a
            href={site.contacts.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="link-line w-fit"
          >
            Instagram {site.contacts.instagramHandle}
          </a>
          {site.contacts.telegram && (
            <a
              href={site.contacts.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="link-line w-fit"
            >
              Telegram
            </a>
          )}
          <a href={`mailto:${site.contacts.email}`} className="link-line w-fit">
            {site.contacts.email}
          </a>
          <a
            href={site.wildberries.brandUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-line w-fit"
          >
            Магазин на Wildberries ↗
          </a>
        </div>
      </div>

      {/* Форма обратной связи.
          Работает без бэкенда через FormSubmit: первое отправленное письмо
          попросит подтвердить адрес получателя — после этого форма активна. */}
      <form
        action={`https://formsubmit.co/${site.contacts.email}`}
        method="POST"
        className="flex flex-col gap-6"
      >
        <input type="hidden" name="_subject" value="Сообщение с сайта CENZURA" />
        <input type="hidden" name="_captcha" value="false" />
        {/* honeypot от спама */}
        <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />

        <label className="flex flex-col gap-1 text-xs uppercase tracking-wide2 text-muted">
          Имя
          <input required name="name" placeholder="Как к вам обращаться" className="field normal-case tracking-normal" />
        </label>

        <label className="flex flex-col gap-1 text-xs uppercase tracking-wide2 text-muted">
          Email
          <input required type="email" name="email" placeholder="you@example.com" className="field normal-case tracking-normal" />
        </label>

        <label className="flex flex-col gap-1 text-xs uppercase tracking-wide2 text-muted">
          Сообщение
          <textarea required name="message" rows={5} placeholder="Текст сообщения" className="field resize-none normal-case tracking-normal" />
        </label>

        <button type="submit" className="btn-primary w-full sm:w-fit">
          Отправить
        </button>
        <p className="text-xs leading-relaxed text-muted">
          Нажимая «Отправить», вы соглашаетесь на обработку указанных данных
          для ответа на ваше обращение.
        </p>
      </form>
    </div>
  );
}
