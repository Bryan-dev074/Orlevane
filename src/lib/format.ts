import type { Currency, Locale } from './types';

/**
 * Tasa de demostración. El guaraní es la fuente de verdad; el real se deriva.
 * Fija a propósito: una demo no debe depender de una API de cambio.
 */
export const RATE_PYG_PER_BRL = 1400;

export const CURRENCIES: Currency[] = ['PYG', 'BRL'];

export const CURRENCY_META: Record<Currency, { code: Currency; symbol: string; label: string; long: string }> = {
  PYG: { code: 'PYG', symbol: 'Gs.', label: 'Gs.', long: 'Guaraní' },
  BRL: { code: 'BRL', symbol: 'R$', label: 'R$', long: 'Real' },
};

/** Convierte guaraníes a la moneda pedida, redondeando a una cifra creíble de vitrina. */
export function convert(pyg: number, currency: Currency): number {
  if (currency === 'PYG') return Math.round(pyg / 1000) * 1000;
  return Math.round(pyg / RATE_PYG_PER_BRL / 10) * 10;
}

/**
 * Agrupación manual con punto de millar. Se evita Intl a propósito: el servidor y el
 * navegador deben producir exactamente la misma cadena o React marca desajuste.
 */
function group(n: number): string {
  const neg = n < 0;
  const digits = Math.abs(Math.round(n)).toString();
  let out = '';
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += '.';
    out += digits[i];
  }
  return neg ? `−${out}` : out;
}

/** «Gs. 2.290.000» · «R$ 1.640» */
export function money(pyg: number, currency: Currency): string {
  const v = convert(pyg, currency);
  return `${CURRENCY_META[currency].symbol} ${group(v)}`;
}

/** Igual que money pero sin símbolo, para tablas donde el símbolo va en el encabezado. */
export function moneyBare(pyg: number, currency: Currency): string {
  return group(convert(pyg, currency));
}

export function formatDate(ts: number, locale: Locale): string {
  const d = new Date(ts);
  const meses: Record<Locale, string[]> = {
    es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    pt: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  };
  const de = locale === 'es' ? 'de' : 'de';
  return `${d.getDate()} ${de} ${meses[locale][d.getMonth()]} ${de} ${d.getFullYear()}`;
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Talla 0 significa pieza de talla única. */
export function sizeLabel(size: number, locale: Locale): string {
  if (size === 0) return locale === 'es' ? 'Única' : 'Único';
  if (size >= 80) return `${size} cm`;
  return String(size);
}
