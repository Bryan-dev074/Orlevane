/**
 * ORLÉVANE Pay — pasarela SIMULADA.
 *
 * Corre entera en el navegador. No hay red, no hay servidor, no hay cobro.
 * Los números de tarjeta de abajo son los de prueba públicos de la industria y
 * no corresponden a ninguna cuenta. Nunca ingresar una tarjeta real.
 */

export type Brand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard' | 'desconocida';

export const BRAND_LABEL: Record<Brand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  elo: 'Elo',
  hipercard: 'Hipercard',
  desconocida: '—',
};

export function digits(s: string): string {
  return s.replace(/\D/g, '');
}

export function detectBrand(raw: string): Brand {
  const n = digits(raw);
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^(4011|4312|4389|5041|5067|6277|6362|6363|650|651|655)/.test(n)) return 'elo';
  if (/^(606282|3841)/.test(n)) return 'hipercard';
  return 'desconocida';
}

export const brandLength = (b: Brand): number => (b === 'amex' ? 15 : 16);
export const cvvLength = (b: Brand): number => (b === 'amex' ? 4 : 3);

/** Agrupa 4-4-4-4, o 4-6-5 en Amex. */
export function formatCardNumber(raw: string): string {
  const n = digits(raw).slice(0, 16);
  if (detectBrand(n) === 'amex') {
    const a = n.slice(0, 15);
    return [a.slice(0, 4), a.slice(4, 10), a.slice(10, 15)].filter(Boolean).join(' ');
  }
  return (n.match(/.{1,4}/g) ?? []).join(' ');
}

export function formatExpiry(raw: string): string {
  const n = digits(raw).slice(0, 4);
  if (n.length <= 2) return n;
  return `${n.slice(0, 2)}/${n.slice(2)}`;
}

export function luhn(raw: string): boolean {
  const n = digits(raw);
  if (n.length < 12) return false;
  let sum = 0;
  let dbl = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = n.charCodeAt(i) - 48;
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export function validCardNumber(raw: string): boolean {
  const n = digits(raw);
  const brand = detectBrand(n);
  return n.length === brandLength(brand) && luhn(n);
}

export function validExpiry(raw: string, now = new Date()): boolean {
  const n = digits(raw);
  if (n.length !== 4) return false;
  const mm = Number(n.slice(0, 2));
  const yy = Number(n.slice(2));
  if (mm < 1 || mm > 12) return false;
  const year = 2000 + yy;
  const end = new Date(year, mm, 1).getTime();
  return end > now.getTime();
}

export interface TestCard {
  number: string;
  brand: Brand;
  label: { es: string; pt: string };
  outcome: 'aprobada' | 'rechazada' | 'fondos';
}

export const TEST_CARDS: TestCard[] = [
  {
    number: '4539 5789 0123 4564',
    brand: 'visa',
    label: { es: 'Aprueba siempre', pt: 'Aprova sempre' },
    outcome: 'aprobada',
  },
  {
    number: '5425 2334 3010 9903',
    brand: 'mastercard',
    label: { es: 'Aprueba siempre', pt: 'Aprova sempre' },
    outcome: 'aprobada',
  },
  {
    number: '3714 496353 98431',
    brand: 'amex',
    label: { es: 'Aprueba siempre', pt: 'Aprova sempre' },
    outcome: 'aprobada',
  },
  {
    number: '4000 0000 0000 0002',
    brand: 'visa',
    label: { es: 'Rechazo del emisor', pt: 'Recusa do emissor' },
    outcome: 'rechazada',
  },
  {
    number: '4000 0000 0000 9995',
    brand: 'visa',
    label: { es: 'Fondos insuficientes', pt: 'Saldo insuficiente' },
    outcome: 'fondos',
  },
];

export function outcomeFor(raw: string): TestCard['outcome'] {
  const n = digits(raw);
  const match = TEST_CARDS.find((c) => digits(c.number) === n);
  if (match) return match.outcome;
  // Convención de la demo: si el número termina en 0002 rechaza, en 9995 no alcanza.
  if (n.endsWith('0002')) return 'rechazada';
  if (n.endsWith('9995')) return 'fondos';
  return 'aprobada';
}

export type AuthStep = 'conectando' | 'verificando' | 'autorizando' | 'confirmando';
export const AUTH_STEPS: AuthStep[] = ['conectando', 'verificando', 'autorizando', 'confirmando'];

export type AuthResult = { ok: true } | { ok: false; reason: 'rechazada' | 'fondos' };

/** Recorre los pasos con una demora creíble y devuelve el desenlace. */
export function authorize(cardNumber: string, onStep: (s: AuthStep, i: number) => void): Promise<AuthResult> {
  const outcome = outcomeFor(cardNumber);
  const delays = [520, 760, 900, 520];
  return new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      if (i >= AUTH_STEPS.length) {
        resolve(outcome === 'aprobada' ? { ok: true } : { ok: false, reason: outcome });
        return;
      }
      onStep(AUTH_STEPS[i], i);
      const wait = delays[i];
      i += 1;
      setTimeout(tick, wait);
    };
    tick();
  });
}

/** Cuotas ofrecidas según el importe, como haría un emisor local. */
export function installmentOptions(totalPYG: number): number[] {
  if (totalPYG >= 3_000_000) return [1, 3, 6, 10, 12];
  if (totalPYG >= 1_500_000) return [1, 3, 6, 10];
  return [1, 3, 6];
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomChars(n: number): string {
  const bytes = new Uint8Array(n);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < n; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

export const orderCode = (): string => `ORL-${randomChars(6)}`;

export const transferRef = (): string => `ORL${randomChars(4)}${String(new Date().getFullYear()).slice(2)}`;

export const last4 = (raw: string): string => digits(raw).slice(-4);

/** Enmascara el teléfono para el paso 3-D Secure simulado. */
export const maskPhone = (phone: string): string => {
  const n = digits(phone);
  return n.length >= 4 ? n.slice(-4) : '••••';
};

export const BANK = {
  name: 'Banco Continental',
  account: '18-4402917',
  holder: 'ORLÉVANE S.A.',
  ruc: '80098765-4',
};
