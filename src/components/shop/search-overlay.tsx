'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import Img from '@/components/ui/img';
import { Price } from '@/components/ui/bits';
import { usePrefs } from '@/lib/prefs';
import { useShop } from '@/lib/store';
import { PRODUCTS, FEATURED } from '@/lib/products';
import { CURTAIN, SILK } from '@/lib/motion';
import { setScrollLock } from '@/components/chrome/smooth-scroll';
import type { Locale, Product } from '@/lib/types';

/** Sin acentos ni mayúsculas: «ñanduti» tiene que encontrar «Ñandutí». */
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

function score(p: Product, q: string, locale: Locale): number {
  const n = norm(q);
  const name = norm(p.name);
  if (name === n) return 100;
  if (name.startsWith(n)) return 80;
  if (name.includes(n)) return 60;
  const hay = norm(
    [p.kind[locale], p.family, p.category, p.colors.map((c) => c.name[locale]).join(' '), p.serial, p.last].join(' '),
  );
  return hay.includes(n) ? 30 : 0;
}

export default function SearchOverlay() {
  const { t, locale } = usePrefs();
  const router = useRouter();
  const open = useShop((s) => s.searchOpen);
  const setOpen = useShop((s) => s.setSearchOpen);
  const recent = useShop((s) => s.recent);

  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setScrollLock(true);
    const id = window.setTimeout(() => input.current?.focus(), 60);
    return () => {
      window.clearTimeout(id);
      setScrollLock(false);
      setQ('');
      setCursor(0);
    };
  }, [open]);

  const results = useMemo(() => {
    if (q.trim().length < 1) return [];
    return PRODUCTS.map((p) => ({ p, s: score(p, q.trim(), locale) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || a.p.rank - b.p.rank)
      .slice(0, 8)
      .map((r) => r.p);
  }, [q, locale]);

  const suggestions = useMemo(() => {
    const seen = recent.map((slug) => PRODUCTS.find((p) => p.slug === slug)).filter(Boolean) as Product[];
    return (seen.length >= 3 ? seen : [...seen, ...FEATURED]).slice(0, 4);
  }, [recent]);

  useEffect(() => setCursor(0), [q]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return setOpen(false);
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (c + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (c - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = results[cursor];
      if (target) {
        setOpen(false);
        router.push(`/producto/${target.slug}`);
      }
    }
  };

  const Row = ({ p, active }: { p: Product; active?: boolean }) => (
    <Link
      href={`/producto/${p.slug}`}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-4 border-b border-stone/20 px-1 py-3 transition-colors duration-200 ${
        active ? 'bg-paper-2' : 'hover:bg-paper-2/70'
      }`}
    >
      <span className="relative h-16 w-[3.2rem] shrink-0 overflow-hidden bg-paper-2">
        <Img src={p.images[0]} alt="" fill sizes="60px" className="object-cover" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="display-sm block truncate">{p.name}</span>
        <span className="block truncate text-[0.78rem] text-stone-2">{p.kind[locale]}</span>
      </span>
      <Price pyg={p.pricePYG} className="shrink-0 text-[0.85rem]" />
    </Link>
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="no-print fixed inset-0 z-100">
          <motion.button
            type="button"
            aria-label={t('s.cerrar')}
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: SILK }}
            className="absolute inset-0 h-full w-full cursor-default bg-ink/45 backdrop-blur-[3px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('s.titulo')}
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.5, ease: CURTAIN }}
            className="relative max-h-[86vh] overflow-y-auto overscroll-contain bg-paper shadow-lift-deep"
          >
            <div className="shell-tight py-6">
              <div className="flex items-center gap-4 border-b border-ink pb-3">
                <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-stone-2" aria-hidden>
                  <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.15" />
                  <path d="m13.6 13.6 3.4 3.4" stroke="currentColor" strokeWidth="1.15" />
                </svg>
                <input
                  ref={input}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={onKey}
                  type="search"
                  autoComplete="off"
                  placeholder={t('s.placeholder')}
                  aria-label={t('s.titulo')}
                  className="min-w-0 flex-1 bg-transparent py-2 font-display text-[1.5rem] tracking-tight placeholder:text-stone/70 sm:text-[2rem]"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t('s.cerrar')}
                  className="grid h-10 w-10 shrink-0 place-items-center transition-colors hover:text-gilt"
                >
                  <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
                    <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.15" />
                  </svg>
                </button>
              </div>

              <div className="pb-4 pt-6">
                {q.trim().length === 0 ? (
                  <>
                    <p className="label mb-4 text-gilt">{t('s.sugerencias')}</p>
                    <div className="grid gap-x-8 sm:grid-cols-2">
                      {suggestions.map((p) => (
                        <Row key={p.slug} p={p} />
                      ))}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {[
                        { href: '/coleccion/mujer', label: t('nav.mujer') },
                        { href: '/coleccion/hombre', label: t('nav.hombre') },
                        { href: '/coleccion/accesorios', label: t('nav.accesorios') },
                        { href: '/coleccion?serie=nanduti', label: locale === 'es' ? 'Serie Ñandutí' : 'Série Ñandutí' },
                      ].map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          onClick={() => setOpen(false)}
                          className="label border border-stone/40 px-3.5 py-2 transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : results.length > 0 ? (
                  <>
                    <p className="label mb-4 text-gilt">
                      {t('s.resultados')} · {results.length}
                    </p>
                    <div className="grid gap-x-8 sm:grid-cols-2">
                      {results.map((p, i) => (
                        <Row key={p.slug} p={p} active={i === cursor} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-8">
                    <h3 className="display-md">{t('s.vacio', { q })}</h3>
                    <p className="measure mt-3 text-[0.9rem] text-stone-2">{t('s.vacioTexto')}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
