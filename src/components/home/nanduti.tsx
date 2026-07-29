'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

import Img from '@/components/ui/img';
import { BtnLink } from '@/components/ui/button';
import { Price } from '@/components/ui/bits';
import { Reveal, SplitLines } from '@/components/ui/reveal';
import { usePrefs } from '@/lib/prefs';
import { NANDUTI } from '@/lib/products';
import { CURTAIN } from '@/lib/motion';

/**
 * Radial de ñandutí dibujado como trazo, no como imagen: se dibuja al entrar.
 * Las coordenadas se redondean porque el último dígito de un seno difiere entre
 * el servidor y el navegador, y React marca eso como desajuste de hidratación.
 */
const r5 = (n: number) => Number(n.toFixed(5));

function Radial({ className = '' }: { className?: string }) {
  const reduced = useReducedMotion();
  // El bastidor asoma fuera de la sección recortada; se observa el contenedor,
  // no cada trazo, porque muchos trazos nunca llegan a intersecar por sí solos.
  const host = useRef<HTMLDivElement>(null);
  const on = useInView(host, { once: true, amount: 0.1 }) && !reduced;

  const spokes = Array.from({ length: 24 }, (_, i) => (i * Math.PI * 2) / 24);
  const rings = [0.26, 0.44, 0.62, 0.8, 0.96];

  return (
    <div ref={host} className={className} aria-hidden>
      <svg viewBox="-1.1 -1.1 2.2 2.2" className="h-full w-full">
        <g fill="none" stroke="currentColor" strokeWidth="0.007">
          {spokes.map((a, i) => (
            <motion.line
              key={i}
              x1={0}
              y1={0}
              x2={r5(Math.cos(a))}
              y2={r5(Math.sin(a))}
              initial={reduced ? false : { pathLength: 0, opacity: 0 }}
              animate={on ? { pathLength: 1, opacity: 0.85 } : undefined}
              transition={{ duration: 1.1, delay: i * 0.022, ease: CURTAIN }}
            />
          ))}
          {rings.map((r, i) => (
            <motion.circle
              key={r}
              cx={0}
              cy={0}
              r={r}
              initial={reduced ? false : { pathLength: 0, opacity: 0 }}
              animate={on ? { pathLength: 1, opacity: 0.7 } : undefined}
              transition={{ duration: 1.4, delay: 0.35 + i * 0.09, ease: CURTAIN }}
            />
          ))}
          {spokes.map((a, i) =>
            rings.slice(0, 4).map((r, j) => (
              <motion.circle
                key={`${i}-${j}`}
                cx={r5(Math.cos(a) * r)}
                cy={r5(Math.sin(a) * r)}
                r={0.012}
                fill="currentColor"
                stroke="none"
                initial={reduced ? false : { scale: 0, opacity: 0 }}
                animate={on ? { scale: 1, opacity: 0.55 } : undefined}
                transition={{ duration: 0.5, delay: 0.7 + (i * 0.012 + j * 0.05), ease: CURTAIN }}
              />
            )),
          )}
        </g>
      </svg>
    </div>
  );
}

export default function Nanduti() {
  const { t, locale } = usePrefs();

  return (
    <section className="relative overflow-hidden bg-paper-2 py-20 sm:py-28">
      <Radial className="pointer-events-none absolute -right-32 -top-24 h-[34rem] w-[34rem] text-claret/12 sm:-right-20" />

      <div className="shell relative grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5 lg:pt-8">
          <Reveal>
            <p className="label flex items-center gap-3 text-claret">
              <span aria-hidden className="h-px w-8 bg-claret/50" />
              {t('home.nanduti.kicker')}
            </p>
          </Reveal>
          <SplitLines as="h2" text={t('home.nanduti.titulo')} className="display-lg mt-6" />
          <Reveal i={1}>
            <p className="measure mt-7 text-[0.98rem] leading-relaxed text-stone-2">{t('home.nanduti.texto')}</p>
            <p className="label mt-7 text-claret">
              {locale === 'es' ? '80 pares por temporada · numerados' : '80 pares por temporada · numerados'}
            </p>
            <BtnLink href="/coleccion?serie=nanduti" tone="claret" size="md" arrow className="mt-8">
              {t('home.nanduti.ver')}
            </BtnLink>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:gap-8 lg:col-span-7">
          {NANDUTI.slice(0, 2).map((p, i) => (
            <Reveal key={p.slug} i={i} className={i === 1 ? 'sm:mt-16' : ''}>
              <Link href={`/producto/${p.slug}`} className="group/n block">
                <div className="relative aspect-4/5 overflow-hidden bg-paper-3">
                  <Img
                    src={p.images[0]}
                    alt={`${p.name} — ${p.kind[locale]}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 30vw"
                    className="object-cover transition-transform duration-[900ms] ease-silk group-hover/n:scale-[1.06]"
                  />
                  <span className="label-sm absolute left-3 top-3 border border-claret bg-claret px-2 py-[0.3rem] text-paper">
                    {p.serial}
                  </span>
                </div>
                <h3 className="display-sm mt-4">{p.name}</h3>
                <p className="text-[0.82rem] text-stone-2">{p.kind[locale]}</p>
                <Price pyg={p.pricePYG} className="mt-1.5 font-display text-[1rem]" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
