'use client';

import Link from 'next/link';
import Wordmark, { Monogram } from './wordmark';
import { LocaleSwitch, CurrencySwitch } from './switchers';
import { usePrefs } from '@/lib/prefs';
import { useShop } from '@/lib/store';
import { Marquee } from '@/components/ui/bits';
import { WHATSAPP_DISPLAY, waUrl } from '@/lib/whatsapp';

export default function Footer() {
  const { t, locale } = usePrefs();
  const setSizeGuideOpen = useShop((s) => s.setSizeGuideOpen);

  const cols: Array<{ title: string; links: Array<{ href?: string; label: string; onClick?: () => void }> }> = [
    {
      title: t('ft.comprar'),
      links: [
        { href: '/coleccion/mujer', label: t('nav.mujer') },
        { href: '/coleccion/hombre', label: t('nav.hombre') },
        { href: '/coleccion/accesorios', label: t('nav.accesorios') },
        { href: '/coleccion?serie=nanduti', label: locale === 'es' ? 'Serie Ñandutí' : 'Série Ñandutí' },
        { href: '/favoritos', label: t('nav.favoritos') },
      ],
    },
    {
      title: t('ft.casa'),
      links: [
        { href: '/maison', label: t('nav.maison') },
        { href: '/boutiques', label: t('nav.boutiques') },
        { href: '/contacto', label: t('nav.contacto') },
      ],
    },
    {
      title: t('ft.ayuda'),
      links: [
        { label: t('p.guiaTallas'), onClick: () => setSizeGuideOpen(true) },
        { href: '/envios', label: t('ft.envios') },
        { href: '/pedidos', label: t('nav.seguimiento') },
        { href: '/contacto', label: t('nav.contacto') },
      ],
    },
    {
      title: t('ft.legal'),
      links: [
        { href: '/terminos', label: t('ft.terminos') },
        { href: '/privacidad', label: t('ft.privacidad') },
      ],
    },
  ];

  return (
    <footer className="on-ink grain relative mt-px overflow-hidden">
      <div className="border-b border-paper/12 py-3.5 text-gilt-soft">
        <Marquee text={t('home.marquee')} onInk />
      </div>

      <div className="shell grid gap-12 py-16 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-4">
          <Wordmark size="md" />
          <p className="mt-5 max-w-xs font-display text-[1.35rem] leading-tight text-paper/85">{t('brand.tagline')}</p>
          <p className="label mt-6 text-paper/45">{t('brand.since')}</p>

          <address className="mt-8 space-y-2 text-[0.88rem] not-italic text-paper/70">
            <div>
              <a
                href={waUrl(locale === 'es' ? 'Hola ORLÉVANE' : 'Olá ORLÉVANE')}
                target="_blank"
                rel="noopener noreferrer"
                className="link-rule"
              >
                {WHATSAPP_DISPLAY}
              </a>
            </div>
            <div>
              <a href="mailto:atelier@orlevane.com" className="link-rule">
                atelier@orlevane.com
              </a>
            </div>
          </address>

          <div className="mt-8 flex gap-5">
            {['Instagram', 'Pinterest', 'YouTube'].map((s) => (
              <span key={s} className="label cursor-default text-paper/40">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-8">
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="label text-gilt-soft">{col.title}</h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href ? (
                      <Link href={l.href} className="link-rule text-[0.88rem] text-paper/72 hover:text-paper">
                        {l.label}
                      </Link>
                    ) : (
                      <button type="button" onClick={l.onClick} className="link-rule text-left text-[0.88rem] text-paper/72 hover:text-paper">
                        {l.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="shell border-t border-paper/12 py-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <LocaleSwitch onInk />
            <span aria-hidden className="h-3 w-px bg-paper/25" />
            <CurrencySwitch onInk />
          </div>
          <div className="flex items-center gap-3 text-paper/40">
            <Monogram className="h-6 w-6 text-gilt-soft" />
            <p className="text-[0.72rem]">
              © {new Date().getFullYear()} ORLÉVANE. {t('ft.derechos')} · {t('ft.hecho')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
