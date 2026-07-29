'use client';

import Img from '@/components/ui/img';
import { Btn } from '@/components/ui/button';
import { Kicker } from '@/components/ui/bits';
import { Reveal, SplitLines } from '@/components/ui/reveal';
import { usePrefs } from '@/lib/prefs';
import { appointmentMessage, waUrl } from '@/lib/whatsapp';

export default function Measure() {
  const { t, locale } = usePrefs();

  return (
    <section className="on-ink grain relative overflow-hidden">
      <div className="grid lg:grid-cols-2">
        <Reveal className="relative aspect-16/10 lg:aspect-auto lg:min-h-[30rem]">
          <Img
            src="/media/e/atelier-costura.webp"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover opacity-80"
          />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent lg:bg-gradient-to-r" />
        </Reveal>

        <div className="flex items-center px-[clamp(1.15rem,4.2vw,4.5rem)] py-16 sm:py-20">
          <div className="max-w-lg">
            <Reveal>
              <Kicker onInk>{t('home.medida.kicker')}</Kicker>
            </Reveal>
            <SplitLines as="h2" text={t('home.medida.titulo')} className="display-lg mt-6" />
            <Reveal i={1}>
              <p className="measure mt-6 text-[0.98rem] leading-relaxed text-paper/70">{t('home.medida.texto')}</p>

              <dl className="mt-9 grid grid-cols-3 gap-x-5">
                {[
                  ['14', locale === 'es' ? 'medidas del pie' : 'medidas do pé'],
                  ['9', locale === 'es' ? 'semanas el primero' : 'semanas o primeiro'],
                  ['3', locale === 'es' ? 'semanas los siguientes' : 'semanas os seguintes'],
                ].map(([n, l]) => (
                  <div key={l} className="border-t border-paper/20 pt-3">
                    <dt className="tnum font-display text-[1.9rem] leading-none">{n}</dt>
                    <dd className="label-sm mt-2.5 leading-snug text-paper/50">{l}</dd>
                  </div>
                ))}
              </dl>

              <a
                href={waUrl(appointmentMessage(locale))}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-9 inline-block"
              >
                <Btn tone="onInk" size="lg" arrow>
                  {t('home.medida.cta')}
                </Btn>
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
