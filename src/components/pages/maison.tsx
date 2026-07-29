'use client';

import Img from '@/components/ui/img';
import { BtnLink } from '@/components/ui/button';
import { Kicker, Marquee } from '@/components/ui/bits';
import { Reveal, RuleIn, SplitLines } from '@/components/ui/reveal';
import { usePrefs } from '@/lib/prefs';

const CHAPTERS = [
  { t: 'm.cap1.t', d: 'm.cap1.d', img: '/media/e/bodegon-cuero.webp' },
  { t: 'm.cap2.t', d: 'm.cap2.d', img: '/media/e/atelier-horma.webp' },
  { t: 'm.cap3.t', d: 'm.cap3.d', img: '/media/e/atelier-costura.webp' },
  { t: 'm.cap4.t', d: 'm.cap4.d', img: '/media/e/atelier-mesa.webp' },
] as const;

export default function Maison() {
  const { t } = usePrefs();

  return (
    <>
      {/* Apertura */}
      <section className="on-ink grain relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Img src="/media/e/atelier-banco.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/85 to-ink" />
        </div>

        <div className="shell flex min-h-[72svh] flex-col justify-end py-20 sm:py-28">
          <Reveal>
            <Kicker onInk>{t('m.kicker')}</Kicker>
          </Reveal>
          <SplitLines as="h1" text={t('m.titulo')} className="display-xl mt-7 max-w-4xl" />
          <Reveal i={1}>
            <p className="measure mt-9 text-[1rem] leading-relaxed text-paper/72">{t('m.intro')}</p>
          </Reveal>
        </div>

        <div className="border-t border-paper/12 py-3.5 text-gilt-soft">
          <Marquee text={t('home.marquee')} onInk />
        </div>
      </section>

      {/* Cifras */}
      <section className="shell py-16 sm:py-20">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {[
            ['2.400', 'm.cifra1'],
            ['26', 'm.cifra2'],
            ['14', 'm.cifra3'],
            ['104', 'm.cifra4'],
          ].map(([n, k], i) => (
            <Reveal key={k} i={i}>
              <div className="border-t border-stone/35 pt-4">
                <dt className="tnum font-display text-[clamp(2.4rem,5vw,3.6rem)] leading-none tracking-[-0.03em]">{n}</dt>
                <dd className="label mt-4 text-stone-2">{t(k as 'm.cifra1')}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Capítulos */}
      <section className="shell pb-8">
        {CHAPTERS.map((c, i) => (
          <div
            key={c.t}
            className={`grid gap-8 border-t border-stone/30 py-14 lg:grid-cols-12 lg:gap-14 lg:py-20 ${
              i % 2 === 1 ? 'lg:[direction:rtl]' : ''
            }`}
          >
            <Reveal className="lg:col-span-6 lg:[direction:ltr]">
              <div className="relative aspect-4/3 overflow-hidden bg-paper-2">
                <Img src={c.img} alt="" fill sizes="(max-width: 1024px) 100vw, 48vw" className="object-cover" />
              </div>
            </Reveal>
            <div className="flex flex-col justify-center lg:col-span-6 lg:[direction:ltr]">
              <Reveal i={1}>
                <p className="tnum label text-gilt">0{i + 1}</p>
                <h2 className="display-lg mt-4">{t(c.t)}</h2>
                <p className="measure mt-6 text-[0.98rem] leading-relaxed text-stone-2">{t(c.d)}</p>
              </Reveal>
            </div>
          </div>
        ))}
      </section>

      {/* Cierre */}
      <section className="on-ink grain relative overflow-hidden py-24 text-center sm:py-32">
        <div className="shell-tight">
          <SplitLines as="p" text={t('m.cierre')} className="display-lg" />
          <RuleIn className="mx-auto mt-10 w-24" tone="gilt" />
          <Reveal i={1}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <BtnLink href="/coleccion" tone="onInk" size="lg" arrow>
                {t('home.destacados.todos')}
              </BtnLink>
              <BtnLink href="/boutiques" tone="quiet" size="lg" className="text-paper hover:border-paper/40">
                {t('nav.boutiques')}
              </BtnLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
