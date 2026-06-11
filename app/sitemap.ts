import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/wb";
import { site } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: now, priority: 1 },
    { url: `${site.url}/catalog`, lastModified: now, priority: 0.9 },
    { url: `${site.url}/about`, lastModified: now, priority: 0.6 },
    { url: `${site.url}/contacts`, lastModified: now, priority: 0.5 },
  ];

  const products = await getProducts();
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${site.url}/product/${p.id}`,
    lastModified: now,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}
