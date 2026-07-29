'use client';

import ProductCard from '@/components/shop/product-card';
import { BtnLink } from '@/components/ui/button';
import { Kicker } from '@/components/ui/bits';
import { Reveal, RuleIn, SplitLines } from '@/components/ui/reveal';
import { usePrefs } from '@/lib/prefs';
import { FEATURED } from '@/lib/products';

export default function Featured() {
  const { t } = usePrefs();

  return (
    <section className="shell py-20 sm:py-28">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <Reveal>
            <Kicker>{t('home.destacados.kicker')}</Kicker>
          </Reveal>
          <SplitLines
            as="h2"
            text={t('home.destacados.titulo')}
            className="display-lg mt-6"
          />
        </div>
        <div className="lg:col-span-5">
          <Reveal i={1}>
            <p className="measure text-[0.95rem] leading-relaxed text-stone-2">{t('home.destacados.texto')}</p>
            <BtnLink href="/coleccion" tone="outline" size="md" arrow className="mt-7">
              {t('home.destacados.todos')}
            </BtnLink>
          </Reveal>
        </div>
      </div>

      <RuleIn className="mt-12" />

      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-14 sm:gap-x-8 lg:grid-cols-4">
        {FEATURED.slice(0, 8).map((p, i) => (
          <Reveal key={p.slug} i={i % 4}>
            <ProductCard product={p} index={i} priority={i < 2} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
