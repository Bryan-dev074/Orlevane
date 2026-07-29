export type Locale = 'es' | 'pt';
export type Currency = 'PYG' | 'BRL';

/** Texto que existe en los dos idiomas de la casa. */
export type L10n = Record<Locale, string>;

export type Category = 'mujer' | 'hombre' | 'accesorios';

export type Family =
  | 'escarpin'
  | 'sandalia'
  | 'bailarina'
  | 'bota'
  | 'mocasin'
  | 'oxford'
  | 'sneaker'
  | 'cinturon'
  | 'bolso'
  | 'marroquineria'
  | 'cuidado';

export type Badge = 'nuevo' | 'nanduti' | 'ultimas' | 'agotado';

export interface ColorWay {
  id: string;
  name: L10n;
  hex: string;
  /** Segundo tono para cueros bicolor; opcional. */
  hex2?: string;
}

export interface Product {
  slug: string;
  /** Nombre del modelo. Igual en los dos idiomas: es un nombre propio. */
  name: string;
  family: Family;
  category: Category;
  /** Descriptor corto bajo el nombre: «Escarpín de charol», «Chelsea de becerro». */
  kind: L10n;
  /** Precio de lista en guaraníes. Fuente de verdad; el real se deriva. */
  pricePYG: number;
  /** Precio tachado, si la pieza está en ajuste de temporada. */
  comparePYG?: number;
  colors: ColorWay[];
  sizes: number[];
  /** Unidades por talla. Cero = agotada. */
  stock: Record<number, number>;
  images: string[];
  badge?: Badge;
  featured?: boolean;
  /** Procedencia: lo que hace que la ficha valga como argumento. */
  serial: string;
  last: string;
  tannery: L10n;
  heelMm?: number;
  weightG?: number;
  intro: L10n;
  story: L10n;
  specs: Array<{ k: L10n; v: L10n }>;
  care: L10n;
  rating: number;
  reviews: number;
  /** Orden de aparición dentro de su categoría. */
  rank: number;
  /** Otras versiones del mismo modelo, por slug. */
  siblings?: string[];
}

export interface CartLine {
  id: string;
  slug: string;
  size: number;
  colorId: string;
  qty: number;
  addedAt: number;
}

export type ShippingMethod = 'estandar' | 'express' | 'boutique';
export type PaymentMethod = 'tarjeta' | 'transferencia' | 'contra-entrega' | 'whatsapp';

export interface Customer {
  name: string;
  email: string;
  phone: string;
  doc: string;
  country: 'PY' | 'BR';
  city: string;
  address: string;
  notes: string;
}

export type OrderStatus = 'confirmado' | 'en-taller' | 'despachado' | 'entregado';

export interface Order {
  code: string;
  createdAt: number;
  lines: Array<CartLine & { name: string; pricePYG: number; image: string }>;
  customer: Customer;
  shipping: ShippingMethod;
  payment: PaymentMethod;
  currency: Currency;
  locale: Locale;
  subtotalPYG: number;
  shippingPYG: number;
  discountPYG: number;
  totalPYG: number;
  couponCode?: string;
  /** Últimos cuatro dígitos de la tarjeta simulada, si se pagó con tarjeta. */
  cardLast4?: string;
  cardBrand?: string;
  installments?: number;
  /** Referencia generada para transferencia. */
  transferRef?: string;
  status: OrderStatus;
}
