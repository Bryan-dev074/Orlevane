'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import Img from '@/components/ui/img';
import ProductCard from './product-card';
import { Btn, BtnLink } from '@/components/ui/button';
import { Price, SpecRow, Stars, Badge } from '@/components/ui/bits';
import { Reveal, RuleIn } from '@/components/ui/reveal';
import { usePrefs } from '@/lib/prefs';
import { useShop } from '@/lib/store';
import { getProduct, inStock, related, totalStock } from '@/lib/products';
import { money, sizeLabel } from '@/lib/format';
import { productMessage, waUrl } from '@/lib/whatsapp';
import { SILK } from '@/lib/motion';
import type { Product } from '@/lib/types';

/* ── Acordeón ──────────────────────────────────────────────────────────── */

function Fold({ title, children, open: initial = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(initial);
  return (
    <div className="border-t border-stone/30">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-4 py-4 text-left"
        >
          <span className="label">{title}</span>
          <span aria-hidden className="relative h-3 w-3 shrink-0">
            <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
            <span
              className={`absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current transition-transform duration-[400ms] ease-silk ${
                open ? 'scale-y-0' : 'scale-y-100'
              }`}
            />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.42, ease: SILK }}
            className="overflow-hidden"
          >
            <div className="pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Ficha ─────────────────────────────────────────────────────────────── */

export default function ProductView({ slug }: { slug: string }) {
  const { t, locale, currency } = usePrefs();
  const product = getProduct(slug) as Product;

  const add = useShop((s) => s.add);
  const toast = useShop((s) => s.toast);
  const setCartOpen = useShop((s) => s.setCartOpen);
  const setSizeGuideOpen = useShop((s) => s.setSizeGuideOpen);
  const toggleWish = useShop((s) => s.toggleWish);
  const wished = useShop((s) => s.wishlist.includes(slug));
  const seeProduct = useShop((s) => s.seeProduct);

  const unique = product.sizes.length === 0;
  const [size, setSize] = useState<number | null>(unique ? 0 : null);
  const [sizeError, setSizeError] = useState(false);
  const [adding, setAdding] = useState<'idle' | 'busy' | 'done'>('idle');
  const [shot, setShot] = useState(0);
  const [copied, setCopied] = useState(false);
  const rail = useRef<HTMLDivElement>(null);
  const sizesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    seeProduct(slug);
    setSize(unique ? 0 : null);
    setShot(0);
  }, [slug, unique, seeProduct]);

  const stockHere = size == null ? 0 : inStock(product, size);
  const sold = totalStock(product) === 0;

  const doAdd = () => {
    if (size == null) {
      setSizeError(true);
      sizesRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    setAdding('busy');
    window.setTimeout(() => {
      const res = add(product.slug, size, product.colors[0].id);
      if (res === 'ok') {
        setAdding('done');
        toast({
          title: product.name,
          detail: `${t('p.talla')} ${sizeLabel(size, locale)} · ${t('p.agregado')}`,
          image: product.images[0],
          action: { label: t('nav.carrito'), run: () => setCartOpen(true) },
        });
        window.setTimeout(() => setAdding('idle'), 1600);
      } else {
        setAdding('idle');
        toast({ title: t('c.stockTope'), tone: 'warn' });
      }
    }, 420);
  };

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) await navigator.share({ title: `ORLÉVANE · ${product.name}`, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      /* el visitante canceló */
    }
  };

  const siblings = (product.siblings ?? []).map(getProduct).filter(Boolean) as Product[];

  return (
    <>
      <article className="shell pt-10 sm:pt-14">
        <nav aria-label="breadcrumb" className="label mb-8 flex flex-wrap items-center gap-2 text-stone">
          <Link href="/" className="link-rule">
            ORLÉVANE
          </Link>
          <span aria-hidden>/</span>
          <Link href={`/coleccion/${product.category}`} className="link-rule">
            {t(`nav.${product.category}` as 'nav.mujer')}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Galería */}
          <div className="lg:col-span-7">
            <div className="hidden gap-4 lg:grid">
              {product.images.map((src, i) => (
                <Reveal key={src} i={i} className="relative aspect-4/5 overflow-hidden bg-paper-2">
                  <Img
                    src={src}
                    alt={`${product.name} — ${t('p.imagen')} ${i + 1}`}
                    fill
                    priority={i === 0}
                    sizes="55vw"
                    className="object-cover"
                  />
                </Reveal>
              ))}
            </div>

            <div className="lg:hidden">
              <div
                ref={rail}
                onScroll={(e) => setShot(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}
                className="no-bar -mx-[clamp(1.15rem,4.2vw,4.5rem)] flex snap-x snap-mandatory overflow-x-auto"
              >
                {product.images.map((src, i) => (
                  <div key={src} className="relative aspect-4/5 w-full shrink-0 snap-center bg-paper-2">
                    <Img
                      src={src}
                      alt={`${product.name} — ${t('p.imagen')} ${i + 1}`}
                      fill
                      priority={i === 0}
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-1.5">
                {product.images.map((src, i) => (
                  <span key={src} className={`h-px flex-1 transition-colors duration-300 ${i === shot ? 'bg-ink' : 'bg-stone/30'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Información */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              {product.badge && (
                <div className="mb-5">
                  <Badge kind={product.badge} />
                </div>
              )}

              <h1 className="display-lg">{product.name}</h1>
              <p className="mt-3 font-display text-[1.2rem] italic text-stone-2">{product.kind[locale]}</p>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Price
                  pyg={product.pricePYG}
                  comparePyg={product.comparePYG}
                  className="font-display text-[1.75rem]"
                />
                <Stars value={product.rating} count={product.reviews} />
              </div>

              <p className="measure mt-7 text-[0.98rem] leading-relaxed">{product.intro[locale]}</p>

              {/* Procedencia */}
              <dl className="mt-8 grid grid-cols-3 gap-x-5">
                {[
                  [t('p.serie'), product.serial],
                  [t('p.horma'), product.last],
                  [t('p.curtido'), product.tannery[locale].split('·')[0].trim()],
                ].map(([k, v]) => (
                  <div key={k} className="border-t border-stone/35 pt-3">
                    <dt className="label-sm text-stone">{k}</dt>
                    <dd className="mt-2 text-[0.82rem] leading-snug">{v}</dd>
                  </div>
                ))}
              </dl>

              {/* Color */}
              <div className="mt-8">
                <p className="label text-stone-2">
                  {t('p.color')}: <span className="text-ink">{product.colors[0].name[locale]}</span>
                </p>
                <div className="mt-3 flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="h-7 w-7 border border-ink shadow-[0_0_0_2px_var(--color-paper),0_0_0_3px_var(--color-ink)]"
                    style={{ background: product.colors[0].hex }}
                  />
                  {siblings.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/producto/${s.slug}`}
                      title={`${s.name} — ${s.colors[0].name[locale]}`}
                      className="h-7 w-7 border border-stone/45 transition-[box-shadow] duration-300 hover:shadow-[0_0_0_2px_var(--color-paper),0_0_0_3px_var(--color-stone)]"
                      style={{ background: s.colors[0].hex }}
                    >
                      <span className="sr-only">{`${s.name} — ${s.colors[0].name[locale]}`}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Talla */}
              {!unique && (
                <div ref={sizesRef} className="mt-8">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="label text-stone-2">
                      {t('p.talla')}
                      <span className="ml-2 normal-case tracking-normal text-stone">({t('p.numeracionEU')})</span>
                    </p>
                    <button type="button" onClick={() => setSizeGuideOpen(true)} className="link-rule label text-gilt">
                      {t('p.guiaTallas')}
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-7">
                    {product.sizes.map((s) => {
                      const n = inStock(product, s);
                      const on = size === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={n === 0}
                          onClick={() => {
                            setSize(s);
                            setSizeError(false);
                          }}
                          aria-pressed={on}
                          className={`tnum relative h-11 border text-[0.85rem] transition-colors duration-200 ${
                            on
                              ? 'border-ink bg-ink text-paper'
                              : n === 0
                                ? 'cursor-not-allowed border-stone/25 text-stone/50'
                                : 'border-stone/40 hover:border-ink'
                          }`}
                        >
                          {sizeLabel(s, locale)}
                          {n === 0 && (
                            <span aria-hidden className="absolute inset-0 grid place-items-center">
                              <span className="h-px w-full rotate-[-24deg] bg-stone/40" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <p
                    className={`mt-3 min-h-5 text-[0.78rem] ${sizeError ? 'text-claret' : 'text-stone-2'}`}
                    role={sizeError ? 'alert' : 'status'}
                  >
                    {sizeError
                      ? t('p.elegiTalla')
                      : stockHere === 1
                        ? t('p.ultimas')
                        : stockHere > 0 && stockHere <= 3
                          ? t('p.ultimasN', { n: stockHere })
                          : ''}
                  </p>
                </div>
              )}

              {/* Acciones */}
              <div className="mt-6 space-y-2.5">
                <Btn tone="solid" size="lg" full onClick={doAdd} disabled={sold || adding === 'busy'}>
                  {sold
                    ? t('p.sinStock')
                    : adding === 'busy'
                      ? t('p.agregando')
                      : adding === 'done'
                        ? t('p.agregado')
                        : t('p.agregar')}
                </Btn>

                <a
                  href={waUrl(productMessage(product, locale, currency, size))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Btn tone="whatsapp" size="md" full>
                    {t('p.whatsapp')}
                  </Btn>
                </a>

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const now = toggleWish(slug);
                      toast({ title: product.name, detail: now ? t('p.favorito') : t('p.favoritoQuitar'), image: product.images[0] });
                    }}
                    aria-pressed={wished}
                    className="link-rule label flex items-center gap-2 py-2 text-stone-2 hover:text-claret"
                  >
                    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
                      <path
                        d="M10 17.2 3.6 10.9a4.1 4.1 0 0 1 5.8-5.8l.6.6.6-.6a4.1 4.1 0 1 1 5.8 5.8Z"
                        fill={wished ? 'var(--color-claret)' : 'none'}
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {wished ? t('p.favoritoQuitar') : t('p.favorito')}
                  </button>
                  <span aria-hidden className="my-2 w-px bg-stone/30" />
                  <button
                    type="button"
                    onClick={share}
                    className="link-rule label flex items-center gap-2 py-2 text-stone-2 hover:text-ink"
                  >
                    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
                      <path d="M10 13V3m0 0L6.6 6.4M10 3l3.4 3.4M4 12v4.2h12V12" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    {copied ? t('p.copiado') : t('p.compartir')}
                  </button>
                </div>
              </div>

              {/* Detalle */}
              <div className="mt-10">
                <Fold title={t('p.descripcion')} open>
                  <p className="measure text-[0.92rem] leading-relaxed text-stone-2">{product.story[locale]}</p>
                </Fold>
                <Fold title={t('p.ficha')}>
                  <dl>
                    {product.specs.map((s) => (
                      <SpecRow key={s.k[locale]} k={s.k[locale]} v={s.v[locale]} />
                    ))}
                    <SpecRow k={t('p.curtido')} v={product.tannery[locale]} />
                    <SpecRow k={t('p.serie')} v={product.serial} />
                  </dl>
                </Fold>
                <Fold title={t('p.cuidado')}>
                  <p className="measure text-[0.92rem] leading-relaxed text-stone-2">{product.care[locale]}</p>
                </Fold>
                <Fold title={t('p.envio')}>
                  <p className="measure text-[0.92rem] leading-relaxed text-stone-2">{t('p.envioTexto')}</p>
                </Fold>
                <div className="border-t border-stone/30" />
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Relacionados */}
      <section className="shell py-20 sm:py-24">
        <div className="flex items-end justify-between gap-6">
          <h2 className="display-md">{t('p.relacionados')}</h2>
          <BtnLink href={`/coleccion/${product.category}`} tone="quiet" size="sm" arrow className="shrink-0">
            {t('cat.verTodo')}
          </BtnLink>
        </div>
        <RuleIn className="mt-6" />
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
          {related(product, 4).map((p, i) => (
            <Reveal key={p.slug} i={i}>
              <ProductCard product={p} index={i} compact />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Barra fija en teléfono */}
      <div className="no-print sticky bottom-0 z-60 border-t border-stone/30 bg-paper/95 backdrop-blur-xl lg:hidden">
        <div className="shell flex items-center gap-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.85rem] font-medium">{product.name}</p>
            <p className="tnum text-[0.8rem] text-stone-2">
              {money(product.pricePYG, currency)}
              {size != null && !unique && ` · ${t('p.talla')} ${sizeLabel(size, locale)}`}
            </p>
          </div>
          <Btn tone="solid" size="md" onClick={doAdd} disabled={sold || adding === 'busy'} className="shrink-0">
            {sold ? t('p.sinStock') : adding === 'done' ? t('p.agregado') : t('p.agregar')}
          </Btn>
        </div>
      </div>
    </>
  );
}
