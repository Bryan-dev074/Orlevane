'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'motion/react';

import Img from '@/components/ui/img';
import { Price } from '@/components/ui/bits';
import { usePrefs } from '@/lib/prefs';
import { useShop, findCoupon, type CartTotals } from '@/lib/store';
import { BY_SLUG } from '@/lib/products';
import { money, sizeLabel } from '@/lib/format';
import { SILK } from '@/lib/motion';
import type { CartLine } from '@/lib/types';

/* ── Renglón de carrito ────────────────────────────────────────────────── */

export function CartLineRow({ line, dense = false }: { line: CartLine; dense?: boolean }) {
  const { t, locale } = usePrefs();
  const setQty = useShop((s) => s.setQty);
  const remove = useShop((s) => s.remove);
  const restore = useShop((s) => s.restore);
  const toast = useShop((s) => s.toast);

  const p = BY_SLUG.get(line.slug);
  if (!p) return null;
  const color = p.colors.find((c) => c.id === line.colorId) ?? p.colors[0];
  const cap = p.stock[line.size] ?? 0;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24, transition: { duration: 0.3, ease: SILK } }}
      transition={{ duration: 0.45, ease: SILK }}
      className="flex gap-4 border-b border-stone/25 py-5"
    >
      <Link
        href={`/producto/${p.slug}`}
        className={`relative shrink-0 overflow-hidden bg-paper-2 ${dense ? 'h-24 w-[4.8rem]' : 'h-32 w-[6.4rem]'}`}
      >
        <Img src={p.images[0]} alt={p.name} fill sizes="110px" className="object-cover" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="display-sm truncate">
              <Link href={`/producto/${p.slug}`} className="link-rule">
                {p.name}
              </Link>
            </h3>
            <p className="mt-0.5 truncate text-[0.8rem] text-stone-2">{p.kind[locale]}</p>
            <p className="label-sm mt-2 text-stone-2">
              {t('p.talla')} {sizeLabel(line.size, locale)} · {color.name[locale]}
            </p>
          </div>
          <Price pyg={p.pricePYG * line.qty} className="shrink-0 font-display text-[0.98rem]" />
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 pt-3">
          <div className="flex items-center border border-stone/40">
            <button
              type="button"
              onClick={() => setQty(line.id, line.qty - 1)}
              aria-label={t('c.restar')}
              className="grid h-8 w-8 place-items-center transition-colors hover:bg-ink hover:text-paper"
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
                <path d="M2 6h8" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
            <span className="tnum w-8 text-center text-[0.85rem]" aria-live="polite">
              {line.qty}
            </span>
            <button
              type="button"
              onClick={() => {
                if (line.qty >= cap) {
                  toast({ title: t('c.stockTope'), tone: 'warn' });
                  return;
                }
                setQty(line.id, line.qty + 1);
              }}
              aria-label={t('c.sumar')}
              disabled={line.qty >= cap}
              className="grid h-8 w-8 place-items-center transition-colors hover:bg-ink hover:text-paper disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-ink"
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
                <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const gone = remove(line.id);
              if (gone)
                toast({
                  title: t('c.quitado', { nombre: p.name }),
                  action: { label: t('c.deshacer'), run: () => restore(gone) },
                  image: p.images[0],
                });
            }}
            className="link-rule label text-stone-2 hover:text-claret"
          >
            {t('c.quitar')}
          </button>
        </div>
      </div>
    </motion.li>
  );
}

/* ── Medidor de envío bonificado ───────────────────────────────────────── */

export function FreeShippingMeter({ totals }: { totals: CartTotals }) {
  const { t, currency } = usePrefs();
  const net = totals.subtotalPYG - totals.discountPYG;
  const pct = Math.min(100, Math.round((net / (net + totals.missingForFreePYG || 1)) * 100));

  return (
    <div className="border-b border-stone/25 px-6 py-4">
      <p className="text-[0.78rem] text-stone-2">
        {totals.freeShipping ? (
          <span className="text-ink">{t('c.envioBonificado')}</span>
        ) : (
          t('c.faltaEnvioGratis', { monto: money(totals.missingForFreePYG, currency) })
        )}
      </p>
      <div className="mt-2.5 h-px w-full bg-stone/30" role="presentation">
        <motion.div
          className="h-px bg-gilt"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: (totals.freeShipping ? 100 : pct) / 100 }}
          style={{ originX: 0 }}
          transition={{ duration: 0.7, ease: SILK }}
        />
      </div>
    </div>
  );
}

/* ── Código de la casa ─────────────────────────────────────────────────── */

export function CouponField({ compact = false }: { compact?: boolean }) {
  const { t } = usePrefs();
  const coupon = useShop((s) => s.coupon);
  const apply = useShop((s) => s.applyCoupon);
  const clear = useShop((s) => s.clearCoupon);
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  if (coupon) {
    const c = findCoupon(coupon);
    return (
      <div className="flex items-center justify-between gap-4 py-1">
        <p className="label text-ink">
          {t('c.cuponOk', { code: coupon })}
          {c && <span className="ml-2 text-gilt">{c.kind === 'pct' ? `−${c.value}%` : '−Gs.'}</span>}
        </p>
        <button type="button" onClick={clear} className="link-rule label text-stone-2 hover:text-claret">
          {t('c.cuponQuitar')}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const ok = apply(value);
        setError(!ok);
        if (ok) setValue('');
      }}
      className="py-1"
    >
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          placeholder={t('c.cuponPlaceholder')}
          aria-label={t('c.cupon')}
          aria-invalid={error}
          className="h-10 min-w-0 flex-1 border border-stone/40 bg-transparent px-3 text-[0.85rem] uppercase tracking-[0.1em] placeholder:normal-case placeholder:tracking-normal placeholder:text-stone focus:border-ink"
        />
        <button
          type="submit"
          className="label h-10 shrink-0 border border-stone/40 px-4 transition-colors hover:border-ink hover:bg-ink hover:text-paper"
        >
          {t('c.cuponAplicar')}
        </button>
      </div>
      <p className={`mt-2 text-[0.72rem] ${error ? 'text-claret' : 'text-stone'}`} role={error ? 'alert' : undefined}>
        {error ? t('c.cuponMal') : compact ? '' : t('c.cuponPista')}
      </p>
    </form>
  );
}

/* ── Bloque de totales ─────────────────────────────────────────────────── */

export function Totals({ totals, showShipping = false }: { totals: CartTotals; showShipping?: boolean }) {
  const { t, currency } = usePrefs();
  return (
    <dl className="space-y-2.5 text-[0.88rem]">
      <div className="flex justify-between">
        <dt className="text-stone-2">{t('c.subtotal')}</dt>
        <dd className="tnum">{money(totals.subtotalPYG, currency)}</dd>
      </div>
      {totals.discountPYG > 0 && (
        <div className="flex justify-between text-claret">
          <dt>{t('c.descuento')}</dt>
          <dd className="tnum">−{money(totals.discountPYG, currency)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-stone-2">{t('c.envio')}</dt>
        <dd className="tnum">
          {showShipping
            ? totals.shippingPYG === 0
              ? t('c.envioGratis')
              : money(totals.shippingPYG, currency)
            : <span className="text-stone-2">{t('c.envioCalculado')}</span>}
        </dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-stone/30 pt-3">
        <dt className="label">{t('c.total')}</dt>
        <dd className="tnum font-display text-[1.4rem]">{money(totals.totalPYG, currency)}</dd>
      </div>
    </dl>
  );
}
