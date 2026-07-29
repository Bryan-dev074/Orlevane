'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

import Img from '@/components/ui/img';
import { Btn, BtnLink } from '@/components/ui/button';
import { RuleIn } from '@/components/ui/reveal';
import { usePrefs } from '@/lib/prefs';
import { useShop, useHydrated } from '@/lib/store';
import { formatDate, money, sizeLabel } from '@/lib/format';
import { orderMessage, waUrl } from '@/lib/whatsapp';
import { BANK } from '@/lib/payments';
import { CURTAIN, SILK } from '@/lib/motion';
import type { OrderStatus } from '@/lib/types';

const CHAIN: OrderStatus[] = ['confirmado', 'en-taller', 'despachado', 'entregado'];

export default function OrderView({ code }: { code: string }) {
  const { t, locale, currency } = usePrefs();
  const hydrated = useHydrated();
  const order = useShop((s) => s.orders.find((o) => o.code.toUpperCase() === code.toUpperCase()));
  const advance = useShop((s) => s.advanceOrder);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(id);
  }, [copied]);

  if (!hydrated) return <div className="min-h-[60vh]" />;

  if (!order) {
    return (
      <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <h1 className="display-lg">{t('o.noEncontrado')}</h1>
        <p className="tnum measure mt-4 text-[0.95rem] text-stone-2">{code}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <BtnLink href="/pedidos" tone="solid" size="md" arrow>
            {t('o.buscarTitulo')}
          </BtnLink>
          <BtnLink href="/coleccion" tone="outline" size="md">
            {t('o.seguir')}
          </BtnLink>
        </div>
      </div>
    );
  }

  const idx = CHAIN.indexOf(order.status);
  const wa = waUrl(orderMessage(order));

  return (
    <div className="shell py-14 sm:py-20">
      {/* Confirmación */}
      <header className="border-b border-stone/30 pb-10">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: SILK }}
          className="label text-gilt"
        >
          {t('o.gracias')}, {order.customer.name.split(' ')[0]}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.08, ease: SILK }}
          className="display-lg mt-5"
        >
          {t('o.confirmado')}
        </motion.h1>

        <div className="mt-8 flex flex-wrap items-end gap-x-12 gap-y-6">
          <div>
            <p className="label-sm text-stone">{t('o.numero')}</p>
            <div className="mt-2 flex items-center gap-3">
              <p className="tnum font-display text-[1.7rem] tracking-[0.06em]">{order.code}</p>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(order.code);
                  setCopied(true);
                }}
                className="link-rule label text-stone-2 hover:text-ink"
              >
                {copied ? t('o.copiado') : t('o.copiar')}
              </button>
            </div>
          </div>
          <div>
            <p className="label-sm text-stone">{t('o.fecha')}</p>
            <p className="mt-2 text-[0.9rem]">{formatDate(order.createdAt, locale)}</p>
          </div>
          <div>
            <p className="label-sm text-stone">{t('c.total')}</p>
            <p className="tnum mt-2 font-display text-[1.25rem]">{money(order.totalPYG, currency)}</p>
          </div>
        </div>

        <p className="mt-7 text-[0.85rem] text-stone-2">
          {t('o.correo', { email: order.customer.email })}{' '}
          <span className="text-stone">{t('o.correoDemo')}</span>
        </p>
      </header>

      <div className="grid gap-12 py-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          {/* Estado */}
          <section>
            <h2 className="label text-stone-2">{t('o.estado')}</h2>
            <ol className="mt-6">
              {CHAIN.map((s, i) => {
                const done = i < idx;
                const now = i === idx;
                return (
                  <li key={s} className="relative flex gap-4 pb-8 last:pb-0">
                    {i < CHAIN.length - 1 && (
                      <span aria-hidden className="absolute left-[7px] top-4 h-full w-px bg-stone/30">
                        {(done || now) && (
                          <motion.span
                            className="block w-px origin-top bg-gilt"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: done ? 1 : 0 }}
                            transition={{ duration: 0.7, delay: 0.2 + i * 0.12, ease: CURTAIN }}
                            style={{ height: '100%' }}
                          />
                        )}
                      </span>
                    )}
                    <span
                      aria-hidden
                      className={`relative mt-1 h-3.5 w-3.5 shrink-0 rotate-45 border transition-colors duration-500 ${
                        done ? 'border-gilt bg-gilt' : now ? 'border-gilt bg-paper' : 'border-stone/40 bg-paper'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`label ${now ? 'text-ink' : done ? 'text-stone-2' : 'text-stone'}`}>
                        {t(`o.estado.${s}` as 'o.estado.confirmado')}
                      </p>
                      <p className={`mt-2 text-[0.85rem] leading-relaxed ${now ? 'text-stone-2' : 'text-stone'}`}>
                        {t(`o.estadoD.${s}` as 'o.estadoD.confirmado')}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {idx < CHAIN.length - 1 && (
              <Btn tone="outline" size="sm" arrow className="mt-2" onClick={() => advance(order.code)}>
                {t('o.avanzar')}
              </Btn>
            )}
          </section>

          {/* Pago */}
          <section className="mt-14">
            <h2 className="label text-stone-2">{t('o.pago')}</h2>
            <RuleIn className="mt-4" />

            {order.payment === 'tarjeta' && (
              <p className="mt-5 text-[0.92rem]">
                {order.cardBrand} ···· {order.cardLast4}
                {order.installments && order.installments > 1 && (
                  <span className="text-stone-2">
                    {' · '}
                    {order.installments}× {money(Math.round(order.totalPYG / order.installments), currency)}
                  </span>
                )}
              </p>
            )}

            {order.payment === 'transferencia' && (
              <div className="mt-5 border border-gilt/40 p-5">
                <h3 className="label text-gilt">{t('o.transferencia')}</h3>
                <dl className="mt-4 space-y-2.5 text-[0.88rem]">
                  {[
                    [t('o.banco'), BANK.name],
                    [t('o.cuenta'), BANK.account],
                    [t('o.titular'), `${BANK.holder} · RUC ${BANK.ruc}`],
                    [t('c.total'), money(order.totalPYG, currency)],
                    [t('o.referencia'), order.transferRef ?? order.code],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 border-b border-stone/20 pb-2">
                      <dt className="text-stone-2">{k}</dt>
                      <dd className="tnum text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-[0.8rem] leading-relaxed text-stone-2">{t('o.transferTexto')}</p>
              </div>
            )}

            {order.payment === 'contra-entrega' && (
              <p className="mt-5 text-[0.92rem] leading-relaxed text-stone-2">{t('o.contraTexto')}</p>
            )}

            {order.payment === 'whatsapp' && (
              <div className="mt-5">
                <p className="text-[0.92rem] leading-relaxed text-stone-2">{t('o.waTexto')}</p>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
                  <Btn tone="whatsapp" size="md">
                    {t('o.waAbrir')}
                  </Btn>
                </a>
              </div>
            )}
          </section>

          {/* Entrega */}
          <section className="mt-14">
            <h2 className="label text-stone-2">{t('o.entrega')}</h2>
            <RuleIn className="mt-4" />
            <div className="mt-5 space-y-1 text-[0.92rem] leading-relaxed">
              <p>{t(order.shipping === 'express' ? 'k.envio.express' : order.shipping === 'boutique' ? 'k.envio.boutique' : 'k.envio.estandar')}</p>
              <p className="text-stone-2">{order.customer.name}</p>
              {order.shipping !== 'boutique' && <p className="text-stone-2">{order.customer.address}</p>}
              <p className="text-stone-2">
                {order.customer.city} · {order.customer.country === 'PY' ? t('k.py') : t('k.br')}
              </p>
              <p className="text-stone-2">{order.customer.phone}</p>
              {order.customer.notes && <p className="mt-3 text-stone">{order.customer.notes}</p>}
            </div>
          </section>
        </div>

        {/* Detalle */}
        <aside className="lg:col-span-5">
          <div className="bg-paper-2/70 p-6">
            <h2 className="label mb-5 text-stone-2">{t('o.detalle')}</h2>
            <ul className="space-y-4">
              {order.lines.map((l) => (
                <li key={l.id} className="flex gap-3.5">
                  <Link href={`/producto/${l.slug}`} className="relative h-20 w-16 shrink-0 overflow-hidden bg-paper-3">
                    <Img src={l.image} alt="" fill sizes="64px" className="object-cover" />
                    <span className="tnum absolute right-0 top-0 grid h-5 min-w-5 place-items-center bg-ink px-1 text-[0.65rem] text-paper">
                      {l.qty}
                    </span>
                  </Link>
                  <span className="min-w-0 flex-1">
                    <Link href={`/producto/${l.slug}`} className="link-rule block truncate text-[0.88rem] font-medium">
                      {l.name}
                    </Link>
                    <span className="label-sm mt-1.5 block text-stone">
                      {t('p.talla')} {sizeLabel(l.size, locale)}
                    </span>
                  </span>
                  <span className="tnum shrink-0 text-[0.85rem]">{money(l.pricePYG * l.qty, currency)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2.5 border-t border-stone/30 pt-5 text-[0.88rem]">
              <div className="flex justify-between">
                <dt className="text-stone-2">{t('c.subtotal')}</dt>
                <dd className="tnum">{money(order.subtotalPYG, currency)}</dd>
              </div>
              {order.discountPYG > 0 && (
                <div className="flex justify-between text-claret">
                  <dt>
                    {t('c.descuento')}
                    {order.couponCode ? ` · ${order.couponCode}` : ''}
                  </dt>
                  <dd className="tnum">−{money(order.discountPYG, currency)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-stone-2">{t('c.envio')}</dt>
                <dd className="tnum">{order.shippingPYG === 0 ? t('c.envioGratis') : money(order.shippingPYG, currency)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-stone/30 pt-3">
                <dt className="label">{t('c.total')}</dt>
                <dd className="tnum font-display text-[1.35rem]">{money(order.totalPYG, currency)}</dd>
              </div>
            </dl>

            <div className="no-print mt-7 space-y-2.5">
              <BtnLink href="/coleccion" tone="solid" size="md" full arrow>
                {t('o.seguir')}
              </BtnLink>
              <Btn tone="outline" size="sm" full onClick={() => window.print()}>
                {t('o.imprimir')}
              </Btn>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
