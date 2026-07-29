'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartLine, Order, OrderStatus, ShippingMethod } from './types';
import { BY_SLUG, inStock } from './products';

/* ── Reglas comerciales de la demostración ─────────────────────────────── */

export const FREE_SHIPPING_PYG = 2_500_000;

export const SHIPPING_PYG: Record<ShippingMethod, number> = {
  estandar: 45_000,
  express: 120_000,
  boutique: 0,
};

export type Coupon = { code: string; kind: 'pct' | 'flat'; value: number };

export const COUPONS: Coupon[] = [
  { code: 'ORLEVANE10', kind: 'pct', value: 10 },
  { code: 'ÑANDUTI', kind: 'pct', value: 15 },
  { code: 'NANDUTI', kind: 'pct', value: 15 },
  { code: 'BIENVENIDA', kind: 'flat', value: 200_000 },
];

export const findCoupon = (raw: string): Coupon | undefined => {
  const code = raw.trim().toUpperCase();
  return COUPONS.find((c) => c.code === code);
};

export const lineId = (slug: string, size: number, colorId: string) => `${slug}__${size}__${colorId}`;

export type Toast = {
  id: number;
  title: string;
  detail?: string;
  image?: string;
  href?: string;
  action?: { label: string; run: () => void };
  tone?: 'default' | 'warn';
};

interface ShopState {
  lines: CartLine[];
  wishlist: string[];
  orders: Order[];
  recent: string[];
  coupon: string | null;

  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  sizeGuideOpen: boolean;
  demoOpen: boolean;
  demoBarSeen: boolean;
  toasts: Toast[];

  add: (slug: string, size: number, colorId: string, qty?: number) => 'ok' | 'tope' | 'sin-stock';
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => CartLine | undefined;
  restore: (line: CartLine) => void;
  clearCart: () => void;

  toggleWish: (slug: string) => boolean;
  isWished: (slug: string) => boolean;

  applyCoupon: (code: string) => boolean;
  clearCoupon: () => void;

  pushOrder: (order: Order) => void;
  advanceOrder: (code: string) => void;
  findOrder: (code: string) => Order | undefined;

  seeProduct: (slug: string) => void;

  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setSizeGuideOpen: (v: boolean) => void;
  setDemoOpen: (v: boolean) => void;
  dismissDemoBar: () => void;

  toast: (t: Omit<Toast, 'id'>) => void;
  dropToast: (id: number) => void;
}

let toastSeq = 0;

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      lines: [],
      wishlist: [],
      orders: [],
      recent: [],
      coupon: null,

      cartOpen: false,
      searchOpen: false,
      menuOpen: false,
      sizeGuideOpen: false,
      demoOpen: false,
      demoBarSeen: false,
      toasts: [],

      add: (slug, size, colorId, qty = 1) => {
        const product = BY_SLUG.get(slug);
        if (!product) return 'sin-stock';
        const available = inStock(product, size);
        if (available <= 0) return 'sin-stock';

        const id = lineId(slug, size, colorId);
        const existing = get().lines.find((l) => l.id === id);
        const next = (existing?.qty ?? 0) + qty;
        if (next > available) {
          if (existing && existing.qty >= available) return 'tope';
          set({ lines: get().lines.map((l) => (l.id === id ? { ...l, qty: available } : l)) });
          return 'tope';
        }

        set({
          lines: existing
            ? get().lines.map((l) => (l.id === id ? { ...l, qty: next } : l))
            : [...get().lines, { id, slug, size, colorId, qty, addedAt: Date.now() }],
        });
        return 'ok';
      },

      setQty: (id, qty) => {
        if (qty <= 0) {
          get().remove(id);
          return;
        }
        const line = get().lines.find((l) => l.id === id);
        if (!line) return;
        const product = BY_SLUG.get(line.slug);
        const cap = product ? inStock(product, line.size) : qty;
        set({ lines: get().lines.map((l) => (l.id === id ? { ...l, qty: Math.min(qty, cap) } : l)) });
      },

      remove: (id) => {
        const line = get().lines.find((l) => l.id === id);
        set({ lines: get().lines.filter((l) => l.id !== id) });
        return line;
      },

      restore: (line) => {
        if (get().lines.some((l) => l.id === line.id)) return;
        set({ lines: [...get().lines, line].sort((a, b) => a.addedAt - b.addedAt) });
      },

      clearCart: () => set({ lines: [], coupon: null }),

      toggleWish: (slug) => {
        const has = get().wishlist.includes(slug);
        set({ wishlist: has ? get().wishlist.filter((s) => s !== slug) : [slug, ...get().wishlist] });
        return !has;
      },

      isWished: (slug) => get().wishlist.includes(slug),

      applyCoupon: (code) => {
        const found = findCoupon(code);
        if (!found) return false;
        set({ coupon: found.code });
        return true;
      },

      clearCoupon: () => set({ coupon: null }),

      pushOrder: (order) => set({ orders: [order, ...get().orders].slice(0, 25) }),

      advanceOrder: (code) => {
        const chain: OrderStatus[] = ['confirmado', 'en-taller', 'despachado', 'entregado'];
        set({
          orders: get().orders.map((o) =>
            o.code === code ? { ...o, status: chain[Math.min(chain.indexOf(o.status) + 1, chain.length - 1)] } : o,
          ),
        });
      },

      findOrder: (code) => get().orders.find((o) => o.code.toUpperCase() === code.trim().toUpperCase()),

      seeProduct: (slug) => set({ recent: [slug, ...get().recent.filter((s) => s !== slug)].slice(0, 8) }),

      setCartOpen: (v) => set({ cartOpen: v, searchOpen: false, menuOpen: false }),
      setSearchOpen: (v) => set({ searchOpen: v, cartOpen: false, menuOpen: false }),
      setMenuOpen: (v) => set({ menuOpen: v, cartOpen: false, searchOpen: false }),
      setSizeGuideOpen: (v) => set({ sizeGuideOpen: v }),
      setDemoOpen: (v) => set({ demoOpen: v }),
      dismissDemoBar: () => set({ demoBarSeen: true }),

      toast: (t) => {
        const id = ++toastSeq;
        set({ toasts: [...get().toasts.slice(-2), { ...t, id }] });
        setTimeout(() => get().dropToast(id), 5200);
      },

      dropToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
    }),
    {
      name: 'orlevane.v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        lines: s.lines,
        wishlist: s.wishlist,
        orders: s.orders,
        recent: s.recent,
        coupon: s.coupon,
        demoBarSeen: s.demoBarSeen,
      }),
      onRehydrateStorage: () => (state) => {
        // Descarta líneas cuyo producto o talla dejaron de existir entre versiones
        // del catálogo: un carrito guardado no debe romper la tienda.
        if (!state) return;
        const clean = state.lines.filter((l) => {
          const p = BY_SLUG.get(l.slug);
          return p && (p.sizes.length === 0 ? l.size === 0 : p.sizes.includes(l.size));
        });
        if (clean.length !== state.lines.length) state.lines = clean;
        state.wishlist = state.wishlist.filter((s) => BY_SLUG.has(s));
        state.recent = state.recent.filter((s) => BY_SLUG.has(s));
      },
    },
  ),
);

/**
 * Verdadero una vez que localStorage ya se leyó. Todo lo que dependa del
 * carrito guardado debe esperar a esto: en el primer render el servidor no
 * conoce el carrito y pintarlo antes provoca desajuste de hidratación.
 */
export function useHydrated(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (useShop.persist.hasHydrated()) {
      setReady(true);
      return;
    }
    return useShop.persist.onFinishHydration(() => setReady(true));
  }, []);
  return ready;
}

/* ── Selectores derivados ──────────────────────────────────────────────── */

export interface CartTotals {
  count: number;
  subtotalPYG: number;
  discountPYG: number;
  shippingPYG: number;
  totalPYG: number;
  freeShipping: boolean;
  missingForFreePYG: number;
}

export function computeTotals(lines: CartLine[], coupon: string | null, shipping: ShippingMethod | null): CartTotals {
  let subtotal = 0;
  let count = 0;
  lines.forEach((l) => {
    const p = BY_SLUG.get(l.slug);
    if (!p) return;
    subtotal += p.pricePYG * l.qty;
    count += l.qty;
  });

  const c = coupon ? findCoupon(coupon) : undefined;
  const discount = !c ? 0 : c.kind === 'pct' ? Math.round((subtotal * c.value) / 100) : Math.min(c.value, subtotal);

  const net = subtotal - discount;
  const freeShipping = net >= FREE_SHIPPING_PYG;
  let ship = 0;
  if (shipping) ship = freeShipping && shipping !== 'express' ? 0 : SHIPPING_PYG[shipping];

  return {
    count,
    subtotalPYG: subtotal,
    discountPYG: discount,
    shippingPYG: ship,
    totalPYG: net + ship,
    freeShipping,
    missingForFreePYG: Math.max(0, FREE_SHIPPING_PYG - net),
  };
}
