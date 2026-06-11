import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-7xl font-light tracking-brand">404</p>
      <p className="mt-6 text-sm text-muted">
        Такой страницы нет — вероятно, её вычеркнула цензура.
      </p>
      <Link href="/" className="btn-outline mt-10">
        На главную
      </Link>
    </div>
  );
}
