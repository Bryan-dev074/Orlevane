'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';

import ProductCard from './product-card';
import { BtnLink } from '@/components/ui/button';
import { RuleIn } from '@/components/ui/reveal';
import { usePrefs } from '@/lib/prefs';
import { useShop, useHydrated } from '@/lib/store';
import { BY_SLUG } from '@/lib/products';
import { SILK } from '@/lib/motion';

export default function Favorites() {
  const { t } = usePrefs();
  const wishlist = useShop((s) => s.wishlist);
  const hydrated = useHydrated();

  const items = wishlist.map((slug) => BY_SLUG.get(slug)).filter(Boolean);

  if (!hydrated) return <div className="min-h-[60vh]" />;

  return (
    <div className="shell py-14 sm:py-20">
      <nav aria-label="breadcrumb" className="label mb-8 flex items-center gap-2 text-stone">
        <Link href="/" className="link-rule">
          ORLÉVANE
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink">{t('f.titulo')}</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-6">
        <h1 className="display-xl">{t('f.titulo')}</h1>
        {items.length > 0 && (
          <p className="tnum label pb-3 text-stone">
            {items.length} {items.length === 1 ? t('cat.pieza') : t('cat.piezas')}
          </p>
        )}
      </div>

      <RuleIn className="mt-10" />

      {items.length === 0 ? (
        <div className="py-20 text-center sm:py-28">
          <svg viewBox="0 0 40 40" className="mx-auto h-14 w-14 text-stone/45" aria-hidden>
            <path
              d="M20 34 7 21.2a8.2 8.2 0 0 1 11.6-11.6l1.4 1.4 1.4-1.4A8.2 8.2 0 1 1 33 21.2Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>
          <h2 className="display-md mt-6">{t('f.vacio')}</h2>
          <p className="measure mx-auto mt-4 text-[0.95rem] text-stone-2">{t('f.vacioTexto')}</p>
          <BtnLink href="/coleccion" tone="solid" size="lg" arrow className="mt-9">
            {t('c.vacioCta')}
          </BtnLink>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-14 sm:gap-x-8 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {items.map((p, i) => (
              <motion.div
                key={p!.slug}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, delay: Math.min(i, 6) * 0.04, ease: SILK }}
              >
                <ProductCard product={p!} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
