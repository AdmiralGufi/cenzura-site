import type { Metadata } from "next";
import { Suspense } from "react";
import { getProducts, categoriesOf } from "@/lib/wb";
import CatalogClient from "@/components/CatalogClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Каталог",
  description:
    "Каталог одежды CENZURA: пальто, худи, платья, брюки и базовые вещи. Покупка — на Wildberries.",
};

export default async function CatalogPage() {
  const products = await getProducts();
  const categories = categoriesOf(products);

  return (
    <div className="wrap py-12 sm:py-16">
      <p className="h-section">Коллекция</p>
      <h1 className="mb-10 mt-3 text-3xl font-medium tracking-wide2 sm:text-4xl">
        Каталог
      </h1>

      {/* useSearchParams требует Suspense-границу */}
      <Suspense>
        <CatalogClient products={products} categories={categories} />
      </Suspense>
    </div>
  );
}
