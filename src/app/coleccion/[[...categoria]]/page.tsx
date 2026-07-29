import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import CollectionView from '@/components/shop/collection-view';
import type { Category } from '@/lib/types';

const VALID: Category[] = ['mujer', 'hombre', 'accesorios'];

const TITLES: Record<Category | 'todo', { title: string; description: string }> = {
  mujer: {
    title: 'Mujer',
    description: 'Escarpines, sandalias, bailarinas y botas montados sobre hormas propias en el atelier de Asunción.',
  },
  hombre: {
    title: 'Hombre',
    description: 'Oxford, derby, mocasines y chelsea con costura Goodyear y suela cambiable.',
  },
  accesorios: {
    title: 'Accesorios',
    description: 'Marroquinería, cinturones y el estuche de cuidado del taller ORLÉVANE.',
  },
  todo: {
    title: 'Colección',
    description: 'Las treinta y seis referencias de la casa: mujer, hombre y accesorios.',
  },
};

type Params = { categoria?: string[] };

function resolve(segments?: string[]): Category | 'todo' | null {
  if (!segments || segments.length === 0) return 'todo';
  if (segments.length > 1) return null;
  const first = segments[0] as Category;
  return VALID.includes(first) ? first : null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { categoria } = await params;
  const key = resolve(categoria);
  if (!key) return { title: 'Colección' };
  return {
    title: TITLES[key].title,
    description: TITLES[key].description,
    alternates: { canonical: key === 'todo' ? '/coleccion' : `/coleccion/${key}` },
  };
}

export function generateStaticParams(): Params[] {
  return [{ categoria: [] }, ...VALID.map((c) => ({ categoria: [c] }))];
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { categoria } = await params;
  const key = resolve(categoria);
  if (!key) notFound();

  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <CollectionView category={key} />
    </Suspense>
  );
}
