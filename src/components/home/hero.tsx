'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

import Img from '@/components/ui/img';
import { BtnLink } from '@/components/ui/button';
import { usePrefs } from '@/lib/prefs';
import { money } from '@/lib/format';
import { getProduct } from '@/lib/products';
import { CURTAIN, SILK } from '@/lib/motion';

const VITRINA = ['aurore', 'vinci', 'nanduti-bag'] as const;
const DWELL = 7000;

export default function Hero() {
  const { t, locale, currency } = usePrefs();
  const reduced = useReducedMotion();

  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const wrap = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const fichaY = useTransform(scrollYProgress, [0, 1], ['0%', '32%']);
  const veil = useTransform(scrollYProgress, [0, 1], [0, 0.45]);

  const go = useCallback((n: number) => setI(((n % VITRINA.length) + VITRINA.length) % VITRINA.length), []);

  useEffect(() => {
    if (paused || reduced) return;
    const id = window.setTimeout(() => go(i + 1), DWELL);
    return () => window.clearTimeout(id);
  }, [i, paused, reduced, go]);

  const product = getProduct(VITRINA[i])!;

  return (
    <section
      ref={wrap}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={t('home.hero.vitrina')}
      /* -mt-20 mete la vitrina por debajo del encabezado transparente: sobre
         marfil la navegación en marfil no se vería. */
      className="on-ink grain relative isolate -mt-20 overflow-hidden"
    >
      <div className="relative grid min-h-[calc(100svh-3.5rem)] grid-cols-1 lg:grid-cols-12">
        {/* Fotografía */}
        <motion.div
          style={reduced ? undefined : { y: photoY }}
          className="relative order-1 col-span-1 aspect-4/5 w-full overflow-hidden sm:aspect-16/10 lg:order-2 lg:col-span-7 lg:aspect-auto lg:h-auto"
        >
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 0.9, ease: SILK }, scale: { duration: 8.2, ease: 'linear' } }}
              className="absolute inset-0"
            >
              <Img
                src={product.images[0]}
                alt={`${product.name} — ${product.kind[locale]}`}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <motion.div
            aria-hidden
            style={{ opacity: veil }}
            className="absolute inset-0 bg-ink"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink via-ink/12 to-transparent lg:bg-gradient-to-r lg:from-ink lg:via-transparent lg:to-transparent"
          />
          {/* Sostiene el contraste de la navegación cuando la foto queda arriba. */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/70 to-transparent lg:hidden" />
        </motion.div>

        {/* Ficha */}
        <motion.div
          style={reduced ? undefined : { y: fichaY }}
          className="relative order-2 col-span-1 flex flex-col justify-center px-[clamp(1.15rem,4.2vw,4.5rem)] py-14 lg:order-1 lg:col-span-5 lg:py-24"
        >
          <div className="max-w-lg">
            <p className="label flex items-center gap-3 text-gilt-soft">
              <span aria-hidden className="h-px w-8 bg-gilt-soft/60" />
              {t('home.hero.vitrina')}
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={product.slug}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.62, ease: SILK }}
              >
                <h1 className="display-xl mt-6">{product.name}</h1>
                <p className="mt-4 font-display text-[1.35rem] italic leading-snug text-paper/80">
                  {product.kind[locale]}
                </p>

                <dl className="mt-9 grid max-w-sm grid-cols-3 gap-x-5">
                  {[
                    [t('home.hero.serie'), product.serial],
                    [t('home.hero.horma'), product.last],
                    [t('home.hero.curtido'), product.tannery[locale].split('·')[0].trim()],
                  ].map(([k, v]) => (
                    <div key={k} className="border-t border-paper/20 pt-3">
                      <dt className="label-sm text-paper/45">{k}</dt>
                      <dd className="mt-2 text-[0.82rem] leading-snug text-paper/85">{v}</dd>
                    </div>
                  ))}
                </dl>

                <p className="tnum mt-8 font-display text-[1.5rem]">{money(product.pricePYG, currency)}</p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <BtnLink href={`/producto/${product.slug}`} tone="onInk" size="lg" arrow>
                {t('home.hero.ver')}
              </BtnLink>
              <Link href="/coleccion" className="link-rule label px-2 py-3 text-paper/75 hover:text-paper">
                {t('home.hero.explorar')}
              </Link>
            </div>

            {/* Avance entre piezas */}
            <div className="mt-12 flex items-center gap-4">
              <div className="flex flex-1 gap-2">
                {VITRINA.map((slug, n) => (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => go(n)}
                    aria-label={`${t('home.hero.pieza')} ${n + 1} ${t('home.hero.de')} ${VITRINA.length}`}
                    aria-current={n === i}
                    className="group/tick relative h-6 flex-1"
                  >
                    <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-paper/22" />
                    {n === i && (
                      <motion.span
                        key={`${slug}-${i}-${String(paused)}`}
                        className="absolute inset-x-0 top-1/2 h-px origin-left -translate-y-1/2 bg-gilt"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: reduced || paused ? 0.4 : DWELL / 1000, ease: 'linear' }}
                      />
                    )}
                    {n < i && <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gilt/45" />}
                  </button>
                ))}
              </div>
              <p className="tnum label shrink-0 text-paper/45">
                {String(i + 1).padStart(2, '0')} / {String(VITRINA.length).padStart(2, '0')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pie de sección */}
      <div className="relative border-t border-paper/12">
        <div className="shell flex items-center justify-between py-4">
          <p className="label text-paper/45">{t('brand.tagline')}</p>
          <motion.p
            className="label flex items-center gap-2.5 text-paper/45"
            animate={reduced ? undefined : { y: [0, 4, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: CURTAIN }}
          >
            {t('home.hero.desliza')}
            <svg viewBox="0 0 10 24" className="h-4 w-2.5" aria-hidden>
              <path d="M5 0v22M1.5 18.5 5 22l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </motion.p>
        </div>
      </div>
    </section>
  );
}
