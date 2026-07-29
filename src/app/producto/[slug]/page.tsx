import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ProductView from '@/components/shop/product-view';
import { PRODUCTS, getProduct, totalStock } from '@/lib/products';
import { convert } from '@/lib/format';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return { title: 'Pieza no encontrada' };
  return {
    title: `${p.name} · ${p.kind.es}`,
    description: p.intro.es,
    alternates: { canonical: `/producto/${p.slug}` },
    openGraph: {
      title: `${p.name} — ${p.kind.es} · ORLÉVANE`,
      description: p.intro.es,
      images: [{ url: p.images[0], width: 1000, height: 1250, alt: p.name }],
      type: 'website',
    },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();

  // Datos estructurados. Precio en guaraníes, que es la moneda de referencia.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `ORLÉVANE ${p.name}`,
    description: p.intro.es,
    image: p.images,
    sku: p.serial.replace(/\s/g, ''),
    brand: { '@type': 'Brand', name: 'ORLÉVANE' },
    material: p.tannery.es,
    countryOfOrigin: 'PY',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: p.rating,
      reviewCount: p.reviews,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PYG',
      price: convert(p.pricePYG, 'PYG'),
      availability: totalStock(p) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Contenido propio y estático: no hay entrada de usuario en este objeto.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductView slug={p.slug} />
    </>
  );
}
