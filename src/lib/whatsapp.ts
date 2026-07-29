import type { CartLine, Currency, Customer, Locale, Order, Product, ShippingMethod } from './types';
import { BY_SLUG } from './products';
import { money, sizeLabel } from './format';

/** Número de la boutique. Configurable en Vercel sin tocar código. */
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '595982064334').replace(/\D/g, '');

export const WHATSAPP_DISPLAY = '+595 982 064 334';

export const waUrl = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

const SHIP_LABEL: Record<ShippingMethod, Record<Locale, string>> = {
  estandar: { es: 'Envío estándar', pt: 'Entrega padrão' },
  express: { es: 'Envío express', pt: 'Entrega expressa' },
  boutique: { es: 'Retiro en boutique', pt: 'Retirada na boutique' },
};

const HEAD: Record<Locale, string> = {
  es: 'Hola ORLÉVANE, quiero hacer este pedido:',
  pt: 'Olá ORLÉVANE, quero fazer este pedido:',
};

const L = {
  talla: { es: 'Talla', pt: 'Nº' },
  color: { es: 'Color', pt: 'Cor' },
  serie: { es: 'Serie', pt: 'Série' },
  cant: { es: 'Cantidad', pt: 'Quantidade' },
  subtotal: { es: 'Subtotal', pt: 'Subtotal' },
  desc: { es: 'Descuento', pt: 'Desconto' },
  envio: { es: 'Envío', pt: 'Entrega' },
  total: { es: 'Total', pt: 'Total' },
  entrega: { es: 'Entrega', pt: 'Entrega' },
  datos: { es: 'Mis datos', pt: 'Meus dados' },
  nota: { es: 'Nota', pt: 'Observação' },
  pedido: { es: 'Pedido', pt: 'Pedido' },
  demo: {
    es: '— Enviado desde la tienda de demostración orlevane.',
    pt: '— Enviado da loja de demonstração orlevane.',
  },
  consulta: { es: 'Hola ORLÉVANE, me interesa esta pieza:', pt: 'Olá ORLÉVANE, tenho interesse nesta peça:' },
  consultaTalla: { es: 'Quería consultar por la talla', pt: 'Queria perguntar sobre o número' },
  cita: {
    es: 'Hola ORLÉVANE, quisiera coordinar una cita en el taller para tomar medidas a horma.',
    pt: 'Olá ORLÉVANE, gostaria de marcar um horário na oficina para tirar medidas de fôrma.',
  },
} satisfies Record<string, Record<Locale, string>>;

function lineText(l: CartLine, locale: Locale, currency: Currency): string | null {
  const p = BY_SLUG.get(l.slug);
  if (!p) return null;
  const color = p.colors[0]?.name[locale] ?? '';
  const bits = [`${L.talla[locale]} ${sizeLabel(l.size, locale)}`, color, `x${l.qty}`].filter(Boolean);
  return `• *${p.name}* — ${p.kind[locale]}\n  ${bits.join(' · ')} — ${money(p.pricePYG * l.qty, currency)}`;
}

/** Mensaje armado desde el carrito real: modelo, talla, color, cantidad y totales. */
export function cartMessage(opts: {
  lines: CartLine[];
  locale: Locale;
  currency: Currency;
  subtotalPYG: number;
  discountPYG: number;
  shippingPYG: number;
  totalPYG: number;
  shipping?: ShippingMethod | null;
  customer?: Partial<Customer> | null;
  code?: string;
}): string {
  const { lines, locale, currency } = opts;
  const parts: string[] = [HEAD[locale], ''];

  lines.forEach((l) => {
    const t = lineText(l, locale, currency);
    if (t) parts.push(t);
  });

  parts.push('');
  parts.push(`${L.subtotal[locale]}: ${money(opts.subtotalPYG, currency)}`);
  if (opts.discountPYG > 0) parts.push(`${L.desc[locale]}: −${money(opts.discountPYG, currency)}`);
  if (opts.shipping) {
    const ship = opts.shippingPYG === 0 ? (locale === 'es' ? 'bonificado' : 'cortesia') : money(opts.shippingPYG, currency);
    parts.push(`${L.envio[locale]}: ${SHIP_LABEL[opts.shipping][locale]} — ${ship}`);
  }
  parts.push(`*${L.total[locale]}: ${money(opts.totalPYG, currency)}*`);

  const c = opts.customer;
  if (c && (c.name || c.city || c.address)) {
    parts.push('', `${L.datos[locale]}:`);
    if (c.name) parts.push(c.name);
    if (c.doc) parts.push(c.doc);
    if (c.phone) parts.push(c.phone);
    if (c.address || c.city) parts.push([c.address, c.city].filter(Boolean).join(', '));
    if (c.notes) parts.push(`${L.nota[locale]}: ${c.notes}`);
  }

  if (opts.code) parts.push('', `${L.pedido[locale]}: ${opts.code}`);
  parts.push('', L.demo[locale]);
  return parts.join('\n');
}

export function orderMessage(order: Order): string {
  return cartMessage({
    lines: order.lines,
    locale: order.locale,
    currency: order.currency,
    subtotalPYG: order.subtotalPYG,
    discountPYG: order.discountPYG,
    shippingPYG: order.shippingPYG,
    totalPYG: order.totalPYG,
    shipping: order.shipping,
    customer: order.customer,
    code: order.code,
  });
}

/** Consulta sobre una pieza puntual, desde la ficha. */
export function productMessage(p: Product, locale: Locale, currency: Currency, size?: number | null): string {
  const parts = [
    L.consulta[locale],
    '',
    `*${p.name}* — ${p.kind[locale]}`,
    `${L.serie[locale]} ${p.serial}`,
    `${p.colors[0].name[locale]} — ${money(p.pricePYG, currency)}`,
  ];
  if (size != null) parts.push('', `${L.consultaTalla[locale]} ${sizeLabel(size, locale)}.`);
  parts.push('', L.demo[locale]);
  return parts.join('\n');
}

export const appointmentMessage = (locale: Locale) => `${L.cita[locale]}\n\n${L.demo[locale]}`;
