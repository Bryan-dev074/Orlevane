'use client';

import { AnimatePresence } from 'motion/react';
import { useMemo } from 'react';

import { Sheet } from '@/components/ui/sheet';
import { Btn, BtnLink } from '@/components/ui/button';
import { CartLineRow, CouponField, FreeShippingMeter, Totals } from './cart-parts';
import { usePrefs } from '@/lib/prefs';
import { computeTotals, useShop } from '@/lib/store';
import { cartMessage, waUrl } from '@/lib/whatsapp';

export default function CartDrawer() {
  const { t, locale, currency } = usePrefs();
  const open = useShop((s) => s.cartOpen);
  const setOpen = useShop((s) => s.setCartOpen);
  const lines = useShop((s) => s.lines);
  const coupon = useShop((s) => s.coupon);

  const totals = useMemo(() => computeTotals(lines, coupon, null), [lines, coupon]);
  const empty = lines.length === 0;

  const wa = () =>
    waUrl(
      cartMessage({
        lines,
        locale,
        currency,
        subtotalPYG: totals.subtotalPYG,
        discountPYG: totals.discountPYG,
        shippingPYG: 0,
        totalPYG: totals.totalPYG,
      }),
    );

  return (
    <Sheet
      open={open}
      onClose={() => setOpen(false)}
      title={`${t('c.titulo')}${totals.count ? ` · ${totals.count}` : ''}`}
      labelClose={t('u.cerrar')}
      footer={
        empty ? undefined : (
          <div className="space-y-5 px-6 py-5">
            <CouponField compact />
            <Totals totals={totals} />
            <div className="space-y-2.5">
              <BtnLink href="/checkout" tone="solid" size="lg" full arrow onClick={() => setOpen(false)}>
                {t('c.finalizar')}
              </BtnLink>
              <a href={wa()} target="_blank" rel="noopener noreferrer" className="block">
                <Btn tone="whatsapp" size="md" full>
                  {t('c.whatsapp')}
                </Btn>
              </a>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="link-rule label mx-auto block text-stone-2">
              {t('c.seguir')}
            </button>
          </div>
        )
      }
    >
      {empty ? (
        <div className="flex h-full flex-col items-center justify-center px-8 text-center">
          <svg viewBox="0 0 60 60" className="h-16 w-16 text-stone/50" aria-hidden>
            <path d="M12 20h36l-3 30H15Z" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M22 24v-7a8 8 0 0 1 16 0v7" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
          <h3 className="display-md mt-6">{t('c.vacio')}</h3>
          <p className="measure mt-3 text-[0.9rem] text-stone-2">{t('c.vacioTexto')}</p>
          <BtnLink href="/coleccion" tone="outline" size="md" arrow className="mt-8" onClick={() => setOpen(false)}>
            {t('c.vacioCta')}
          </BtnLink>
        </div>
      ) : (
        <>
          <FreeShippingMeter totals={totals} />
          <ul className="px-6">
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <CartLineRow key={l.id} line={l} dense />
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}
    </Sheet>
  );
}
