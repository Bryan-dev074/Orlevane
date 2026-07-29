'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Currency, Locale } from './types';
import { LOCALE_META, translate, type DictKey } from './i18n';
import { CURRENCY_COOKIE, LOCALE_COOKIE } from './prefs-shared';

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
}

interface PrefsValue {
  locale: Locale;
  currency: Currency;
  setLocale: (l: Locale) => void;
  setCurrency: (c: Currency) => void;
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
}

const PrefsCtx = createContext<PrefsValue | null>(null);

export function PrefsProvider({
  children,
  initialLocale,
  initialCurrency,
}: {
  children: ReactNode;
  initialLocale: Locale;
  initialCurrency: Currency;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [currency, setCurrencyState] = useState<Currency>(initialCurrency);

  useEffect(() => {
    document.documentElement.lang = LOCALE_META[locale].htmlLang;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    writeCookie(LOCALE_COOKIE, l);
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    writeCookie(CURRENCY_COOKIE, c);
  }, []);

  const value = useMemo<PrefsValue>(
    () => ({
      locale,
      currency,
      setLocale,
      setCurrency,
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale, currency, setLocale, setCurrency],
  );

  return <PrefsCtx.Provider value={value}>{children}</PrefsCtx.Provider>;
}

export function usePrefs(): PrefsValue {
  const ctx = useContext(PrefsCtx);
  if (!ctx) throw new Error('usePrefs debe usarse dentro de PrefsProvider');
  return ctx;
}

/** Atajo: const { t, locale } = useT(). */
export const useT = usePrefs;
