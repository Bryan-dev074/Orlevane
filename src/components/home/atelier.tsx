'use client';

import dynamic from 'next/dynamic';

import Img from '@/components/ui/img';
import { BtnLink } from '@/components/ui/button';
import { Kicker } from '@/components/ui/bits';
import { Reveal, RuleIn, SplitLines } from '@/components/ui/reveal';
import { usePrefs } from '@/lib/prefs';

const AtelierCloud = dynamic(() => import('./atelier-cloud'), { ssr: false });

const STEPS = [
  { n: '01', t: 'home.atelier.paso1.t', d: 'home.atelier.paso1.d', img: '/media/e/atelier-horma.webp' },
  { n: '02', t: 'home.atelier.paso2.t', d: 'home.atelier.paso2.d', img: '/media/e/atelier-herramientas.webp' },
  { n: '03', t: 'home.atelier.paso3.t', d: 'home.atelier.paso3.d', img: '/media/e/atelier-banco.webp' },
  { n: '04', t: 'home.atelier.paso4.t', d: 'home.atelier.paso4.d', img: '/media/e/atelier-lustre.webp' },
] as const;

export default function Atelier() {
  const { t } = usePrefs();

  return (
    <section className="on-ink grain relative overflow-hidden py-20 sm:py-28">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <Kicker onInk>{t('home.atelier.kicker')}</Kicker>
            </Reveal>
            <SplitLines as="h2" text={t('home.atelier.titulo')} className="display-lg mt-6" />
            <Reveal i={1}>
              <p className="measure mt-7 text-[0.98rem] leading-relaxed text-paper/70">{t('home.atelier.texto')}</p>
              <BtnLink href="/maison" tone="onInk" size="md" arrow className="mt-9">
                {t('home.atelier.conocer')}
              </BtnLink>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <AtelierCloud className="aspect-4/3 w-full" />
          </div>
        </div>

        <RuleIn className="mt-16" tone="paper" />

        <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} i={i} as="li">
              <div className="relative aspect-4/3 overflow-hidden bg-ink-2">
                <Img
                  src={s.img}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover opacity-70 transition-opacity duration-700 hover:opacity-95"
                />
              </div>
              <p className="tnum label mt-5 text-gilt-soft">{s.n}</p>
              <h3 className="display-sm mt-2">{t(s.t)}</h3>
              <p className="mt-2 text-[0.86rem] leading-relaxed text-paper/60">{t(s.d)}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
