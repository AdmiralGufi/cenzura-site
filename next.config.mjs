/** @type {import('next').NextConfig} */
const nextConfig = {
  // Линтер не блокирует production-сборку (запускайте отдельно при необходимости)
  eslint: { ignoreDuringBuilds: true },
  // Изображения товаров приходят с CDN Wildberries (basket-*.wbbasket.ru).
  // Используем обычные <img>, чтобы не зависеть от оптимизатора Next
  // и не платить за Image Optimization на Vercel.
  images: { unoptimized: true },
};

export default nextConfig;
