import type { MetadataRoute } from 'next';
import { PRODUCTS } from '@/lib/products';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://orlevane.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const fixed = [
    { path: '', priority: 1 },
    { path: '/coleccion', priority: 0.9 },
    { path: '/coleccion/mujer', priority: 0.9 },
    { path: '/coleccion/hombre', priority: 0.9 },
    { path: '/coleccion/accesorios', priority: 0.8 },
    { path: '/maison', priority: 0.7 },
    { path: '/boutiques', priority: 0.6 },
    { path: '/contacto', priority: 0.5 },
    { path: '/envios', priority: 0.4 },
    { path: '/terminos', priority: 0.3 },
    { path: '/privacidad', priority: 0.3 },
  ];

  return [
    ...fixed.map((f) => ({
      url: `${SITE}${f.path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: f.priority,
    })),
    ...PRODUCTS.map((p) => ({
      url: `${SITE}/producto/${p.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
