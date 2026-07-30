'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

import Img from '@/components/ui/img';
import { BtnLink } from '@/components/ui/button';
import { Price } from '@/components/ui/bits';
import { Reveal, SplitLines } from '@/components/ui/reveal';
import { usePrefs } from '@/lib/prefs';
import { NANDUTI } from '@/lib/products';
import { CURTAIN, SILK } from '@/lib/motion';

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
  const inView = useInView(host, { once: true, amount: 0.1 });

  /* El dibujo trazo a trazo eran ~125 nodos SVG animados a la vez por
     JavaScript: al entrar a la sección se medían cuadros de hasta 167 ms en
     escritorio, y en teléfono eso era el tirón que congelaba el scroll. El
     dibujo queda para puntero fino y pantalla grande; en teléfono el bastidor
     entra entero con un solo fundido: una animación en lugar de ciento
     veinticinco. Y los nudos, incluso en escritorio, entran como UN grupo. */
  const [rich, setRich] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (min-width: 1024px)');
    const sync = () => setRich(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  const draw = rich && !reduced;

  const spokes = Array.from({ length: 24 }, (_, i) => (i * Math.PI * 2) / 24);
  const rings = [0.26, 0.44, 0.62, 0.8, 0.96];
  const dots = spokes.flatMap((a, i) =>
    rings.slice(0, 4).map((r, j) => (
      <circle key={`${i}-${j}`} cx={r5(Math.cos(a) * r)} cy={r5(Math.sin(a) * r)} r={0.012} />
    )),
  );

  return (
    <div ref={host} className={className} aria-hidden>
      <motion.svg
        viewBox="-1.1 -1.1 2.2 2.2"
        className="h-full w-full"
        initial={false}
        animate={{ opacity: reduced || draw || inView ? 1 : 0 }}
        transition={{ duration: draw || reduced ? 0 : 1.3, ease: SILK }}
      >
        <g fill="none" stroke="currentColor" strokeWidth="0.007">
          {spokes.map((a, i) =>
            draw ? (
              <motion.line
                key={i}
                x1={0}
                y1={0}
                x2={r5(Math.cos(a))}
                y2={r5(Math.sin(a))}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inView ? { pathLength: 1, opacity: 0.85 } : undefined}
                transition={{ duration: 1.1, delay: i * 0.022, ease: CURTAIN }}
              />
            ) : (
              <line key={i} x1={0} y1={0} x2={r5(Math.cos(a))} y2={r5(Math.sin(a))} opacity={0.85} />
            ),
          )}
          {rings.map((r, i) =>
            draw ? (
              <motion.circle
                key={r}
                cx={0}
                cy={0}
                r={r}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inView ? { pathLength: 1, opacity: 0.7 } : undefined}
                transition={{ duration: 1.4, delay: 0.35 + i * 0.09, ease: CURTAIN }}
              />
            ) : (
              <circle key={r} cx={0} cy={0} r={r} opacity={0.7} />
            ),
          )}
          {draw ? (
            <motion.g
              fill="currentColor"
              stroke="none"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 0.55 } : undefined}
              transition={{ duration: 0.9, delay: 0.75, ease: CURTAIN }}
            >
              {dots}
            </motion.g>
          ) : (
            <g fill="currentColor" stroke="none" opacity={0.55}>
              {dots}
            </g>
          )}
        </g>
      </motion.svg>
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
