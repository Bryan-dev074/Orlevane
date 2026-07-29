'use client';

import Link from 'next/link';

import Img from '@/components/ui/img';
import { Arrow } from '@/components/ui/button';
import { Kicker } from '@/components/ui/bits';
import { Reveal, RuleIn } from '@/components/ui/reveal';
import { usePrefs } from '@/lib/prefs';
import { byCategory } from '@/lib/products';
import type { Category } from '@/lib/types';

/**
 * Los tres planos van en el mismo registro —una sola pieza, fondo claro, sombra
 * blanda— porque si no se leen como tres fotos sueltas en vez de una campaña.
 * Y en una casa de calzado, la entrada a cada mundo tiene que mostrar la pieza.
 */
const WORLDS = [
  { id: 'mujer', img: '/media/c/mundo-mujer.webp', t: 'home.mundos.mujer.titulo', d: 'home.mundos.mujer.texto' },
  { id: 'hombre', img: '/media/c/mundo-hombre.webp', t: 'home.mundos.hombre.titulo', d: 'home.mundos.hombre.texto' },
  { id: 'accesorios', img: '/media/c/mundo-accesorios.webp', t: 'home.mundos.accesorios.titulo', d: 'home.mundos.accesorios.texto' },
] as const;

export default function Worlds() {
  const { t, locale } = usePrefs();

  return (
    <section className="shell pb-24 pt-8 sm:pb-28">
      <Reveal>
        <Kicker>{t('home.mundos.kicker')}</Kicker>
      </Reveal>
      <RuleIn className="mt-7" />

      <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-3">
        {WORLDS.map((w, i) => (
          <Reveal key={w.id} i={i}>
            <Link href={`/coleccion/${w.id}`} className="group/w block">
              <div className="relative aspect-3/4 overflow-hidden bg-paper-2">
                <Img
                  src={w.img}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 32vw"
                  className="object-cover transition-transform duration-[900ms] ease-silk group-hover/w:scale-[1.05]"
                />
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-stone/30 pt-4">
                <h3 className="display-md">{t(w.t)}</h3>
                <span className="tnum label shrink-0 text-stone">
                  {String(byCategory(w.id as Category).length).padStart(2, '0')}{' '}
                  {locale === 'es' ? 'piezas' : 'peças'}
                </span>
              </div>
              <p className="mt-3 max-w-[34ch] text-[0.88rem] leading-relaxed text-stone-2">{t(w.d)}</p>
              <span className="label mt-5 inline-flex items-center gap-2.5 text-gilt">
                {t('home.mundos.entrar')}
                <span className="inline-block transition-transform duration-[400ms] ease-silk group-hover/w:translate-x-1.5">
                  <Arrow />
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
