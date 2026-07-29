'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Kicker } from '@/components/ui/bits';
import { Reveal, RuleIn } from '@/components/ui/reveal';
import { usePrefs } from '@/lib/prefs';
import type { L10n } from '@/lib/types';

export interface DocSection {
  h: L10n;
  p: L10n[];
}

/** Página de texto largo con índice lateral. Se usa en envíos, términos y privacidad. */
export default function Doc({
  kicker,
  title,
  intro,
  sections,
  updated,
}: {
  kicker: L10n;
  title: L10n;
  intro: L10n;
  sections: DocSection[];
  updated: string;
}) {
  const { t, locale } = usePrefs();
  const [active, setActive] = useState(0);

  const anchor = (i: number) => `s-${i + 1}`;

  return (
    <div className="shell py-14 sm:py-20">
      <nav aria-label="breadcrumb" className="label mb-8 flex items-center gap-2 text-stone">
        <Link href="/" className="link-rule">
          ORLÉVANE
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink">{title[locale]}</span>
      </nav>

      <Reveal>
        <Kicker>{kicker[locale]}</Kicker>
        <h1 className="display-xl mt-6 max-w-3xl">{title[locale]}</h1>
        <p className="measure mt-6 text-[0.98rem] leading-relaxed text-stone-2">{intro[locale]}</p>
      </Reveal>

      <RuleIn className="mt-12" />

      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
        <aside className="lg:col-span-3">
          <nav aria-label={locale === 'es' ? 'Índice' : 'Índice'} className="lg:sticky lg:top-28">
            <ol className="space-y-2.5">
              {sections.map((s, i) => (
                <li key={s.h.es}>
                  <a
                    href={`#${anchor(i)}`}
                    onClick={() => setActive(i)}
                    data-active={active === i}
                    className={`link-rule text-[0.85rem] ${active === i ? 'text-ink' : 'text-stone-2 hover:text-ink'}`}
                  >
                    <span className="tnum mr-2 text-stone">{String(i + 1).padStart(2, '0')}</span>
                    {s.h[locale]}
                  </a>
                </li>
              ))}
            </ol>
            <p className="label-sm mt-8 border-t border-stone/30 pt-4 text-stone">
              {locale === 'es' ? 'Actualizado' : 'Atualizado'} · {updated}
            </p>
          </nav>
        </aside>

        <div className="lg:col-span-8 lg:col-start-5">
          {sections.map((s, i) => (
            <section key={s.h.es} id={anchor(i)} className="scroll-mt-32 border-t border-stone/30 py-10 first:border-t-0 first:pt-0">
              <h2 className="display-md">
                <span className="tnum mr-4 align-middle text-[0.5em] text-stone">{String(i + 1).padStart(2, '0')}</span>
                {s.h[locale]}
              </h2>
              <div className="mt-5 space-y-4">
                {s.p.map((p, k) => (
                  <p key={k} className="measure text-[0.95rem] leading-relaxed text-stone-2">
                    {p[locale]}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <p className="border-t border-stone/30 pt-6 text-[0.78rem] text-stone">{t('ft.aviso')}</p>
        </div>
      </div>
    </div>
  );
}
