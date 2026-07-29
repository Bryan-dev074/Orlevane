'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { AnimatePresence } from 'motion/react';

import ProductCard from './product-card';
import { CartLineRow, CouponField, FreeShippingMeter, Totals } from './cart-parts';
import { Btn, BtnLink } from '@/components/ui/button';
import { Reveal, RuleIn } from '@/components/ui/reveal';
import { usePrefs } from '@/lib/prefs';
import { computeTotals, useShop, useHydrated } from '@/lib/store';
import { FEATURED } from '@/lib/products';
import { cartMessage, waUrl } from '@/lib/whatsapp';

export default function CartPage() {
  const { t, locale, currency } = usePrefs();
  const lines = useShop((s) => s.lines);
  const coupon = useShop((s) => s.coupon);
  const hydrated = useHydrated();

  const totals = useMemo(() => computeTotals(lines, coupon, null), [lines, coupon]);

  if (!hydrated) return <div className="min-h-[60vh]" />;

  if (lines.length === 0) {
    return (
      <div className="shell py-20 sm:py-28">
        <h1 className="display-xl">{t('c.titulo')}</h1>
        <RuleIn className="mt-8" />
        <div className="py-16 text-center sm:py-24">
          <h2 className="display-md">{t('c.vacio')}</h2>
          <p className="measure mx-auto mt-4 text-[0.95rem] text-stone-2">{t('c.vacioTexto')}</p>
          <BtnLink href="/coleccion" tone="solid" size="lg" arrow className="mt-9">
            {t('c.vacioCta')}
          </BtnLink>
        </div>

        <div className="mt-16">
          <h2 className="display-md">{t('home.destacados.kicker')}</h2>
          <RuleIn className="mt-6" />
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
            {FEATURED.slice(0, 4).map((p, i) => (
              <Reveal key={p.slug} i={i}>
                <ProductCard product={p} index={i} compact />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const wa = waUrl(
    cartMessage({
      lines,
      locale,
      currency,
      subtotalPYG: totals.subtotalPYG,
      discountPYG: totals.discountPYG,
      shippingPYG: 0,
      totalPYG: totals.totalPYG,
    }),
  );

  return (
    <div className="shell py-14 sm:py-20">
      <nav aria-label="breadcrumb" className="label mb-8 flex items-center gap-2 text-stone">
        <Link href="/" className="link-rule">
          ORLÉVANE
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink">{t('c.titulo')}</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-6">
        <h1 className="display-xl">{t('c.titulo')}</h1>
        <p className="tnum label pb-3 text-stone">
          {totals.count} {totals.count === 1 ? t('c.item') : t('c.items')}
        </p>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <div className="-mx-6 border-y border-stone/25">
            <FreeShippingMeter totals={totals} />
          </div>
          <ul>
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <CartLineRow key={l.id} line={l} />
              ))}
            </AnimatePresence>
          </ul>
          <Link href="/coleccion" className="link-rule label mt-6 inline-block text-stone-2 hover:text-ink">
            ← {t('c.seguir')}
          </Link>
        </div>

        <aside className="lg:col-span-5">
          <div className="bg-paper-2/70 p-6 lg:sticky lg:top-28">
            <h2 className="label mb-5 text-stone-2">{t('k.resumen')}</h2>
            <CouponField />
            <div className="mt-5">
              <Totals totals={totals} />
            </div>
            <div className="mt-7 space-y-2.5">
              <BtnLink href="/checkout" tone="solid" size="lg" full arrow>
                {t('c.finalizar')}
              </BtnLink>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="block">
                <Btn tone="whatsapp" size="md" full>
                  {t('c.whatsapp')}
                </Btn>
              </a>
            </div>
            <p className="mt-5 text-[0.75rem] leading-relaxed text-stone">{t('p.envioTexto')}</p>
          </div>
        </aside>
      </div>

      <section className="mt-24">
        <h2 className="display-md">{t('p.tambienVisto')}</h2>
        <RuleIn className="mt-6" />
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
          {FEATURED.filter((p) => !lines.some((l) => l.slug === p.slug))
            .slice(0, 4)
            .map((p, i) => (
              <Reveal key={p.slug} i={i}>
                <ProductCard product={p} index={i} compact />
              </Reveal>
            ))}
        </div>
      </section>
    </div>
  );
}
