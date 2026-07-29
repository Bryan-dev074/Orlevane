'use client';

import Img from '@/components/ui/img';
import { Btn } from '@/components/ui/button';
import { Kicker } from '@/components/ui/bits';
import { Reveal, RuleIn, SplitLines } from '@/components/ui/reveal';
import { usePrefs } from '@/lib/prefs';
import { appointmentMessage, waUrl, WHATSAPP_DISPLAY } from '@/lib/whatsapp';
import type { Locale } from '@/lib/types';

/** Direcciones de demostración. No son locales reales. */
const PLACES: Array<{
  id: string;
  kind: 'tienda' | 'taller';
  name: string;
  city: Record<Locale, string>;
  address: string;
  hours: Record<Locale, string>;
  img: string;
  map: string;
}> = [
  {
    id: 'villa-morra',
    kind: 'tienda',
    name: 'Villa Morra',
    city: { es: 'Asunción, Paraguay', pt: 'Assunção, Paraguai' },
    address: 'Av. San Martín 1234, esq. Malutín',
    hours: { es: 'Lun a sáb · 10:00 – 20:00', pt: 'Seg a sáb · 10:00 – 20:00' },
    img: '/media/e/boutique-calle.webp',
    map: 'https://www.google.com/maps/search/?api=1&query=Av.+San+Mart%C3%ADn+Villa+Morra+Asunci%C3%B3n',
  },
  {
    id: 'ciudad-del-este',
    kind: 'tienda',
    name: 'Ciudad del Este',
    city: { es: 'Alto Paraná, Paraguay', pt: 'Alto Paraná, Paraguai' },
    address: 'Av. Monseñor Rodríguez 880, Centro',
    hours: { es: 'Lun a sáb · 09:00 – 19:00', pt: 'Seg a sáb · 09:00 – 19:00' },
    img: '/media/e/campana-salon.webp',
    map: 'https://www.google.com/maps/search/?api=1&query=Av.+Monse%C3%B1or+Rodr%C3%ADguez+Ciudad+del+Este',
  },
  {
    id: 'taller-palma',
    kind: 'taller',
    name: 'Taller Palma',
    city: { es: 'Asunción, Paraguay', pt: 'Assunção, Paraguai' },
    address: 'Palma 615, casi 15 de Agosto',
    hours: { es: 'Con cita · Mar a vie · 14:00 – 18:00', pt: 'Com hora marcada · Ter a sex · 14:00 – 18:00' },
    img: '/media/e/atelier-mesa.webp',
    map: 'https://www.google.com/maps/search/?api=1&query=Palma+615+Asunci%C3%B3n',
  },
];

export default function Boutiques() {
  const { t, locale } = usePrefs();

  return (
    <div className="shell py-14 sm:py-20">
      <Reveal>
        <Kicker>{t('b.kicker')}</Kicker>
      </Reveal>
      <SplitLines as="h1" text={t('b.titulo')} className="display-xl mt-6 max-w-3xl" />
      <Reveal i={1}>
        <p className="measure mt-6 text-[0.98rem] leading-relaxed text-stone-2">{t('b.texto')}</p>
      </Reveal>

      <RuleIn className="mt-12" />

      <div className="mt-12 grid gap-x-8 gap-y-14 lg:grid-cols-3">
        {PLACES.map((p, i) => (
          <Reveal key={p.id} i={i} as="article">
            <div className="relative aspect-4/5 overflow-hidden bg-paper-2">
              <Img
                src={p.img}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 32vw"
                className="object-cover"
              />
              <span className="label-sm absolute left-3 top-3 border border-ink bg-paper px-2 py-[0.3rem]">
                {p.kind === 'taller' ? t('b.taller') : t('b.tienda')}
              </span>
            </div>

            <h2 className="display-md mt-6">{p.name}</h2>
            <p className="mt-1.5 text-[0.85rem] text-stone-2">{p.city[locale]}</p>

            <dl className="mt-6 space-y-3.5">
              {[
                [t('b.direccion'), p.address],
                [t('b.horario'), p.hours[locale]],
                [t('b.telefono'), WHATSAPP_DISPLAY],
              ].map(([k, v]) => (
                <div key={k} className="border-t border-stone/30 pt-3">
                  <dt className="label-sm text-stone">{k}</dt>
                  <dd className="mt-1.5 text-[0.88rem] leading-snug">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a href={p.map} target="_blank" rel="noopener noreferrer">
                <Btn tone="outline" size="sm" arrow>
                  {t('b.comoLlegar')}
                </Btn>
              </a>
              <a
                href={waUrl(
                  p.kind === 'taller'
                    ? appointmentMessage(locale)
                    : locale === 'es'
                      ? `Hola ORLÉVANE, quiero consultar por la boutique de ${p.name}.`
                      : `Olá ORLÉVANE, quero perguntar sobre a boutique de ${p.name}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Btn tone="whatsapp" size="sm">
                  {p.kind === 'taller' ? t('b.cita') : t('b.escribir')}
                </Btn>
              </a>
            </div>
          </Reveal>
        ))}
      </div>

      <p className="mt-16 border-t border-stone/30 pt-6 text-[0.78rem] text-stone">{t('ft.aviso')}</p>
    </div>
  );
}
