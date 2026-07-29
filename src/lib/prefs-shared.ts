import type { Currency, Locale } from './types';

/**
 * Lectura de preferencias. Vive fuera de prefs.tsx a propósito: el layout del
 * servidor necesita estos helpers y un módulo marcado 'use client' no se los
 * puede dar.
 */

export const LOCALE_COOKIE = 'orlevane_locale';
export const CURRENCY_COOKIE = 'orlevane_currency';

export const parseLocale = (v: string | undefined): Locale => (v === 'pt' ? 'pt' : 'es');

export const parseCurrency = (v: string | undefined): Currency => (v === 'BRL' ? 'BRL' : 'PYG');

/** Moneda que corresponde al idioma cuando el visitante todavía no eligió. */
export const currencyForLocale = (l: Locale): Currency => (l === 'pt' ? 'BRL' : 'PYG');
