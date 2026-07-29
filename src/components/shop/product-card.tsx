'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';

import Img from '@/components/ui/img';
import { Badge, Price } from '@/components/ui/bits';
import { usePrefs } from '@/lib/prefs';
import { useShop } from '@/lib/store';
import { inStock } from '@/lib/products';
import { sizeLabel } from '@/lib/format';
import type { Product } from '@/lib/types';

/**
 * Ficha de producto.
 *
 * Movimiento fijado por el brief: acercamiento del 6 %, inclinación muy suave
 * siguiendo el puntero, sombra más profunda y cruce a la segunda fotografía,
 * todo en 400 ms y sin rebote. En puntero grueso la inclinación desaparece y
 * la segunda fotografía se alcanza deslizando o tocando el indicador.
 */

const MAX_TILT = 6; // grados

export default function ProductCard({
  product,
  priority = false,
  index = 0,
  compact = false,
}: {
  product: Product;
  priority?: boolean;
  index?: number;
  compact?: boolean;
}) {
  const { t, locale } = usePrefs();
  const reduced = useReducedMotion();

  const add = useShop((s) => s.add);
  const toast = useShop((s) => s.toast);
  const setCartOpen = useShop((s) => s.setCartOpen);
  const toggleWish = useShop((s) => s.toggleWish);
  const wished = useShop((s) => s.wishlist.includes(product.slug));

  const frame = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [shot, setShot] = useState(0);
  const [hover, setHover] = useState(false);

  // Sobreamortiguado a propósito: sigue al cursor sin devolverse.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 90, damping: 20, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 90, damping: 20, mass: 0.6 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]);

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (reduced || e.pointerType !== 'mouse' || !frame.current) return;
      const r = frame.current.getBoundingClientRect();
      px.set((e.clientX - r.left) / r.width - 0.5);
      py.set((e.clientY - r.top) / r.height - 0.5);
    },
    [px, py, reduced],
  );

  const onLeave = useCallback(() => {
    px.set(0);
    py.set(0);
    setHover(false);
  }, [px, py]);

  const onRailScroll = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    setShot(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
  }, []);

  const soldOut = product.badge === 'agotado';
  const quickSizes = product.sizes.filter((s) => inStock(product, s) > 0).slice(0, 7);
  const href = `/producto/${product.slug}`;

  const quickAdd = (size: number) => {
    const res = add(product.slug, size, product.colors[0].id);
    if (res === 'ok') {
      toast({
        title: product.name,
        detail: `${t('p.talla')} ${sizeLabel(size, locale)} · ${t('p.agregado')}`,
        image: product.images[0],
        href,
        action: { label: t('nav.carrito'), run: () => setCartOpen(true) },
      });
    } else {
      toast({ title: t('c.stockTope'), tone: 'warn' });
    }
  };

  return (
    <article
      className="group/card relative"
      onPointerMove={onMove}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
      onPointerLeave={onLeave}
    >
      <motion.div
        ref={frame}
        style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1250 }}
        className={`relative transition-shadow duration-[400ms] ease-silk ${
          hover ? 'shadow-lift-deep' : 'shadow-none'
        }`}
      >
        <Link
          href={href}
          aria-label={`${product.name} — ${product.kind[locale]}`}
          className="relative block aspect-4/5 overflow-hidden bg-paper-2"
        >
          {/* Puntero fino: dos capas cruzadas. */}
          <div className="pointer-events-none absolute inset-0 hidden [@media(pointer:fine)]:block">
            {product.images.map((src, i) => (
              <Img
                key={src}
                src={src}
                alt={i === 0 ? `${product.name}, ${product.kind[locale]}` : `${product.name}, ${t('p.imagen')} 2`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 30vw"
                priority={priority && i === 0}
                className={`object-cover transition-[opacity,transform] duration-[400ms] ease-silk ${
                  i === 0 ? (hover ? 'opacity-0' : 'opacity-100') : hover ? 'opacity-100' : 'opacity-0'
                } ${hover && !reduced ? 'scale-[1.06]' : 'scale-100'}`}
              />
            ))}
          </div>

          {/* Puntero grueso: riel deslizable. */}
          <div
            ref={rail}
            onScroll={onRailScroll}
            className="no-bar absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [@media(pointer:fine)]:hidden"
          >
            {product.images.map((src, i) => (
              <div key={src} className="relative h-full w-full shrink-0 snap-center">
                <Img
                  src={src}
                  alt={i === 0 ? `${product.name}, ${product.kind[locale]}` : `${product.name}, ${t('p.imagen')} 2`}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  priority={priority && i === 0}
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {soldOut && (
            <span className="absolute inset-0 grid place-items-center bg-paper/70">
              <span className="label border border-ink/40 px-3 py-2">{t('p.agotado')}</span>
            </span>
          )}
        </Link>

        {/* Marcador de fotografía, sólo en táctil. */}
        {product.images.length > 1 && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 [@media(pointer:fine)]:hidden">
            {product.images.map((src, i) => (
              <span
                key={src}
                className={`h-1 w-1 rounded-full transition-colors duration-300 ${
                  shot === i ? 'bg-ink' : 'bg-ink/25'
                }`}
              />
            ))}
          </div>
        )}

        {product.badge && (
          <div className="pointer-events-none absolute left-3 top-3">
            <Badge kind={product.badge} />
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            const now = toggleWish(product.slug);
            toast({ title: product.name, detail: now ? t('p.favorito') : t('p.favoritoQuitar'), image: product.images[0] });
          }}
          aria-pressed={wished}
          aria-label={wished ? t('p.favoritoQuitar') : t('p.favorito')}
          className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center text-ink transition-colors duration-300 hover:text-claret"
        >
          <svg viewBox="0 0 20 20" className="h-[1.15rem] w-[1.15rem]" aria-hidden>
            <path
              d="M10 17.2 3.6 10.9a4.1 4.1 0 0 1 5.8-5.8l.6.6.6-.6a4.1 4.1 0 1 1 5.8 5.8Z"
              fill={wished ? 'var(--color-claret)' : 'none'}
              stroke="currentColor"
              strokeWidth="1.15"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Alta rápida por talla. Sólo con puntero fino y con teclado. */}
        {!soldOut && !compact && quickSizes.length > 0 && (
          <div
            className={`absolute inset-x-0 bottom-0 hidden translate-y-2 bg-paper/94 opacity-0 backdrop-blur-[2px] transition-[opacity,transform] duration-[400ms] ease-silk focus-within:translate-y-0 focus-within:opacity-100 group-hover/card:translate-y-0 group-hover/card:opacity-100 [@media(pointer:fine)]:block`}
          >
            <p className="label border-b border-stone/25 px-3 py-2 text-stone-2">{t('p.tallaElegir')}</p>
            <div className="flex flex-wrap gap-px p-2">
              {quickSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => quickAdd(s)}
                  className="tnum h-8 min-w-9 px-2 text-[0.75rem] transition-colors duration-200 hover:bg-ink hover:text-paper"
                >
                  {sizeLabel(s, locale)}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* En teléfono la ficha se apila: a dos columnas el nombre y el precio
          chocan dentro de una tarjeta de 165 px. */}
      <div className="mt-4 sm:flex sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h3 className="display-sm truncate">
            <Link href={href} className="link-rule">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 truncate text-[0.82rem] text-stone-2">{product.kind[locale]}</p>
        </div>

        <div className="mt-1.5 flex items-center gap-2.5 sm:mt-0 sm:shrink-0 sm:flex-col sm:items-end sm:gap-2">
          <Price
            pyg={product.pricePYG}
            comparePyg={product.comparePYG}
            className="font-display text-[0.98rem] leading-none sm:text-[1.05rem]"
          />
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 border border-stone/40"
            style={{ background: product.colors[0].hex }}
          />
        </div>
      </div>

      {!compact && (
        <p className="label-sm mt-2.5 truncate text-stone">
          {t('p.serie')} {product.serial}
        </p>
      )}
    </article>
  );
}
