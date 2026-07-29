'use client';

import { usePrefs } from '@/lib/prefs';
import { LOCALES, LOCALE_META } from '@/lib/i18n';
import { CURRENCIES, CURRENCY_META } from '@/lib/format';

/** Control segmentado de dos posiciones. El estado activo se marca con filete dorado. */
function Seg({
  options,
  value,
  onChange,
  label,
  onInk = false,
}: {
  options: Array<{ id: string; label: string; title: string }>;
  value: string;
  onChange: (id: string) => void;
  label: string;
  onInk?: boolean;
}) {
  return (
    <div role="group" aria-label={label} className="flex items-center">
      {options.map((o, i) => {
        const active = o.id === value;
        return (
          <span key={o.id} className="flex items-center">
            {i > 0 && <span aria-hidden className={`mx-1.5 h-2.5 w-px ${onInk ? 'bg-paper/25' : 'bg-stone/40'}`} />}
            <button
              type="button"
              onClick={() => onChange(o.id)}
              aria-pressed={active}
              title={o.title}
              className={`label px-0.5 py-1 transition-colors duration-300 ${
                active
                  ? onInk
                    ? 'text-gilt-soft'
                    : 'text-gilt'
                  : onInk
                    ? 'text-paper/55 hover:text-paper'
                    : 'text-stone-2 hover:text-ink'
              }`}
            >
              {o.label}
            </button>
          </span>
        );
      })}
    </div>
  );
}

export function LocaleSwitch({ onInk = false }: { onInk?: boolean }) {
  const { locale, setLocale, currency, setCurrency, t } = usePrefs();
  return (
    <Seg
      label={t('ft.idioma')}
      onInk={onInk}
      value={locale}
      options={LOCALES.map((l) => ({ id: l, label: LOCALE_META[l].label, title: LOCALE_META[l].long }))}
      onChange={(id) => {
        const next = id as typeof locale;
        setLocale(next);
        // La moneda sigue al idioma salvo que el visitante ya la haya movido a mano.
        if ((locale === 'es' && currency === 'PYG') || (locale === 'pt' && currency === 'BRL')) {
          setCurrency(next === 'pt' ? 'BRL' : 'PYG');
        }
      }}
    />
  );
}

export function CurrencySwitch({ onInk = false }: { onInk?: boolean }) {
  const { currency, setCurrency, t } = usePrefs();
  return (
    <Seg
      label={t('ft.moneda')}
      onInk={onInk}
      value={currency}
      options={CURRENCIES.map((c) => ({ id: c, label: CURRENCY_META[c].label, title: CURRENCY_META[c].long }))}
      onChange={(id) => setCurrency(id as typeof currency)}
    />
  );
}
