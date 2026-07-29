import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://orlevane.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/checkout', '/carrito', '/pedido/', '/pedidos', '/favoritos'],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
