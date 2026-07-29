'use client';

import { useRef, useState } from 'react';

import { Kicker, Stars } from '@/components/ui/bits';
import { Reveal, RuleIn, SplitLines } from '@/components/ui/reveal';
import { usePrefs } from '@/lib/prefs';
import type { Locale } from '@/lib/types';

/** Testimonios sintéticos. No son clientes reales; ver PRODUCT.md. */
const NOTES: Array<{ who: string; where: Record<Locale, string>; model: string; stars: number; text: Record<Locale, string> }> = [
  {
    who: 'Camila R.',
    where: { es: 'Asunción', pt: 'Assunção' },
    model: 'Vesper',
    stars: 5,
    text: {
      es: 'Trabajo doce horas de pie y es el único taco de 95 con el que llego al final del día sin acordarme de los pies. La suela ya volvió una vez al taller y salió como nueva.',
      pt: 'Trabalho doze horas em pé e é o único salto de 95 com que chego ao fim do dia sem lembrar dos pés. A sola já voltou uma vez à oficina e saiu como nova.',
    },
  },
  {
    who: 'Rodrigo M.',
    where: { es: 'Ciudad del Este', pt: 'Ciudad del Este' },
    model: 'Montaigne',
    stars: 5,
    text: {
      es: 'Cuatro años, dos resuelas y el corte sigue entero. Los primeros diez días aprietan como avisan; después no te los sacás.',
      pt: 'Quatro anos, dois solados e o cabedal continua inteiro. Nos primeiros dez dias apertam como avisam; depois você não tira mais.',
    },
  },
  {
    who: 'Larissa F.',
    where: { es: 'Foz do Iguaçu', pt: 'Foz do Iguaçu' },
    model: 'Séraphine',
    stars: 5,
    text: {
      es: 'Compré la Ñandutí por el calado y me quedé por lo liviana que es. Tiene el número bordado abajo, cosa que no vi en ninguna otra marca.',
      pt: 'Comprei a Ñandutí pelo vazado e fiquei pela leveza. Tem o número bordado embaixo, coisa que não vi em nenhuma outra marca.',
    },
  },
  {
    who: 'Andrés V.',
    where: { es: 'Encarnación', pt: 'Encarnación' },
    model: 'Vinci',
    stars: 4,
    text: {
      es: 'La bota es impecable. Tardó tres semanas más de lo que esperaba, pero me avisaron por WhatsApp cada vez que cambió de estado.',
      pt: 'A bota é impecável. Demorou três semanas a mais do que eu esperava, mas me avisaram pelo WhatsApp a cada mudança de status.',
    },
  },
];

export default function Reviews() {
  const { t, locale } = usePrefs();
  const rail = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  return (
    <section className="shell py-20 sm:py-28">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <Reveal>
            <Kicker>{t('home.reseñas.kicker')}</Kicker>
          </Reveal>
          <SplitLines as="h2" text={t('home.reseñas.titulo')} className="display-lg mt-6" />
        </div>
        <div className="lg:col-span-5">
          <Reveal i={1}>
            <p className="measure text-[0.95rem] leading-relaxed text-stone-2">
              {locale === 'es'
                ? 'Cuatro pares, cuatro ciudades y varios años de uso. Lo que nos interesa no es la primera semana: es cómo está el par al tercer invierno.'
                : 'Quatro pares, quatro cidades e vários anos de uso. O que nos interessa não é a primeira semana: é como está o par no terceiro inverno.'}
            </p>
          </Reveal>
        </div>
      </div>

      <RuleIn className="mt-10" />

      <ul
        ref={rail}
        onScroll={(e) => {
          const el = e.currentTarget;
          const card = el.scrollWidth / NOTES.length;
          setActive(Math.round(el.scrollLeft / Math.max(1, card)));
        }}
        className="no-bar -mx-[clamp(1.15rem,4.2vw,4.5rem)] mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-[clamp(1.15rem,4.2vw,4.5rem)] pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible lg:px-0"
      >
        {NOTES.map((n, i) => (
          <Reveal
            key={n.who}
            i={i}
            as="li"
            className="w-[82vw] shrink-0 snap-start sm:w-[46vw] lg:w-auto"
          >
            <div className="flex h-full flex-col border-t border-stone/35 pt-5">
              <Stars value={n.stars} />
              <blockquote className="mt-5 flex-1 font-display text-[1.12rem] leading-snug">
                <p>«{n.text[locale]}»</p>
              </blockquote>
              <footer className="mt-6">
                <p className="label">{n.who}</p>
                <p className="mt-1.5 text-[0.78rem] text-stone-2">
                  {n.where[locale]} · {n.model}
                </p>
              </footer>
            </div>
          </Reveal>
        ))}
      </ul>

      <div className="mt-6 flex gap-1.5 lg:hidden">
        {NOTES.map((n, i) => (
          <span key={n.who} className={`h-px flex-1 transition-colors duration-300 ${i === active ? 'bg-gilt' : 'bg-stone/30'}`} />
        ))}
      </div>
    </section>
  );
}
