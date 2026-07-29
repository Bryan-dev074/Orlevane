'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import Wordmark from './wordmark';
import { LocaleSwitch, CurrencySwitch } from './switchers';
import Img from '@/components/ui/img';
import { Price } from '@/components/ui/bits';
import { usePrefs } from '@/lib/prefs';
import { useShop, useHydrated } from '@/lib/store';
import { byCategory, familiesOf } from '@/lib/products';
import { CURTAIN, SILK } from '@/lib/motion';
import type { Category } from '@/lib/types';
import { setScrollLock } from './smooth-scroll';

const WORLDS: Array<{ id: Category; key: 'nav.mujer' | 'nav.hombre' | 'nav.accesorios' }> = [
  { id: 'mujer', key: 'nav.mujer' },
  { id: 'hombre', key: 'nav.hombre' },
  { id: 'accesorios', key: 'nav.accesorios' },
];

function IconBtn({
  label,
  onClick,
  href,
  badge,
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  badge?: number;
  children: React.ReactNode;
}) {
  const inner = (
    <>
      {children}
      {badge != null && badge > 0 && (
        <span className="tnum absolute -right-1 -top-0.5 grid h-4 min-w-4 place-items-center bg-claret px-1 text-[0.6rem] leading-none text-paper">
          {badge > 99 ? '99' : badge}
        </span>
      )}
      <span className="sr-only">{label}</span>
    </>
  );
  const cls =
    'relative grid h-10 w-10 place-items-center text-current transition-colors duration-300 hover:text-gilt';
  return href ? (
    <Link href={href} aria-label={label} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} aria-label={label} className={cls}>
      {inner}
    </button>
  );
}

export default function Header() {
  const { t, locale } = usePrefs();
  const pathname = usePathname();

  const lines = useShop((s) => s.lines);
  const wishlist = useShop((s) => s.wishlist);
  const hydrated = useHydrated();
  const setCartOpen = useShop((s) => s.setCartOpen);
  const setSearchOpen = useShop((s) => s.setSearchOpen);
  const menuOpen = useShop((s) => s.menuOpen);
  const setMenuOpen = useShop((s) => s.setMenuOpen);

  const count = hydrated ? lines.reduce((a, l) => a + l.qty, 0) : 0;
  const wishCount = hydrated ? wishlist.length : 0;

  const [compact, setCompact] = useState(false);
  const [world, setWorld] = useState<Category | null>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setWorld(null);
    setMenuOpen(false);
  }, [pathname, setMenuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    setScrollLock(true);
    return () => setScrollLock(false);
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setWorld(null);
        setMenuOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMenuOpen, setSearchOpen]);

  const openWorld = (id: Category) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setWorld(id);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setWorld(null), 140);
  };

  const isDark = pathname === '/';
  const solid = compact || world !== null || !isDark;

  return (
    <>
      <header
        onPointerLeave={scheduleClose}
        className={`no-print sticky top-0 z-70 transition-[background-color,border-color,color] duration-500 ease-silk ${
          solid ? 'border-b border-stone/20 bg-paper/92 text-ink backdrop-blur-xl' : 'border-b border-transparent text-paper'
        }`}
      >
        <div className={`shell flex items-center justify-between transition-[height] duration-500 ease-silk ${compact ? 'h-16' : 'h-20'}`}>
          {/* Izquierda */}
          <nav aria-label={t('nav.menu')} className="hidden flex-1 items-center gap-7 lg:flex">
            {WORLDS.map((w) => (
              <Link
                key={w.id}
                href={`/coleccion/${w.id}`}
                onPointerEnter={() => openWorld(w.id)}
                onFocus={() => openWorld(w.id)}
                data-active={pathname.startsWith(`/coleccion/${w.id}`)}
                className="link-rule label py-2"
              >
                {t(w.key)}
              </Link>
            ))}
            <Link href="/maison" data-active={pathname === '/maison'} className="link-rule label py-2">
              {t('nav.maison')}
            </Link>
            <Link href="/boutiques" data-active={pathname === '/boutiques'} className="link-rule label py-2">
              {t('nav.boutiques')}
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t('nav.abrirMenu')}
            className="-ml-2 grid h-10 w-10 place-items-center lg:hidden"
          >
            <span aria-hidden className="flex w-5 flex-col gap-[5px]">
              <span className="h-px w-full bg-current" />
              <span className="h-px w-full bg-current" />
              <span className="h-px w-3.5 bg-current" />
            </span>
          </button>

          {/* Centro */}
          <div className="flex flex-1 justify-center lg:flex-none">
            <Wordmark size={compact ? 'sm' : 'md'} className="transition-[font-size] duration-500 ease-silk" />
          </div>

          {/* Derecha */}
          <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
            <div className="mr-2 hidden items-center gap-3 xl:flex">
              <LocaleSwitch onInk={!solid} />
              <span aria-hidden className={`h-3 w-px ${solid ? 'bg-stone/35' : 'bg-paper/25'}`} />
              <CurrencySwitch onInk={!solid} />
            </div>

            <IconBtn label={t('nav.buscar')} onClick={() => setSearchOpen(true)}>
              <svg viewBox="0 0 20 20" className="h-[1.15rem] w-[1.15rem]" aria-hidden>
                <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.15" />
                <path d="m13.6 13.6 3.4 3.4" stroke="currentColor" strokeWidth="1.15" />
              </svg>
            </IconBtn>

            <div className="hidden sm:block">
              <IconBtn label={t('nav.favoritos')} href="/favoritos" badge={wishCount}>
                <svg viewBox="0 0 20 20" className="h-[1.15rem] w-[1.15rem]" aria-hidden>
                  <path
                    d="M10 17.2 3.6 10.9a4.1 4.1 0 0 1 5.8-5.8l.6.6.6-.6a4.1 4.1 0 1 1 5.8 5.8Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.15"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconBtn>
            </div>

            <IconBtn label={t('c.abrirCarrito')} onClick={() => setCartOpen(true)} badge={count}>
              <svg viewBox="0 0 20 20" className="h-[1.15rem] w-[1.15rem]" aria-hidden>
                <path d="M3.6 6.4h12.8l-1 10.2H4.6Z" fill="none" stroke="currentColor" strokeWidth="1.15" />
                <path d="M7.2 8V5.6a2.8 2.8 0 0 1 5.6 0V8" fill="none" stroke="currentColor" strokeWidth="1.15" />
              </svg>
            </IconBtn>
          </div>
        </div>

        {/* Panel de mundo */}
        <AnimatePresence>
          {world && (
            <motion.div
              key={world}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.42, ease: CURTAIN }}
              onPointerEnter={() => openWorld(world)}
              className="hidden overflow-hidden border-t border-stone/20 bg-paper text-ink lg:block"
            >
              <div className="shell grid grid-cols-12 gap-10 py-9">
                <div className="col-span-3">
                  <p className="label mb-5 text-gilt">{t(WORLDS.find((w) => w.id === world)!.key)}</p>
                  <ul className="space-y-3">
                    <li>
                      <Link href={`/coleccion/${world}`} className="link-rule display-sm">
                        {t('cat.verTodo')}
                      </Link>
                    </li>
                    {familiesOf(world).map((f) => (
                      <li key={f}>
                        <Link
                          href={`/coleccion/${world}?familia=${f}`}
                          className="link-rule text-[0.95rem] text-stone-2 hover:text-ink"
                        >
                          {t(`cat.familia.${f}` as 'cat.familia.escarpin')}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-span-9 grid grid-cols-4 gap-6">
                  {byCategory(world)
                    .slice(0, 4)
                    .map((p, i) => (
                      <motion.div
                        key={p.slug}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.05 + i * 0.05, ease: SILK }}
                      >
                        <Link href={`/producto/${p.slug}`} className="group/mm block">
                          <div className="relative aspect-4/5 overflow-hidden bg-paper-2">
                            <Img
                              src={p.images[0]}
                              alt={p.name}
                              fill
                              sizes="20vw"
                              className="object-cover transition-transform duration-[600ms] ease-silk group-hover/mm:scale-[1.06]"
                            />
                          </div>
                          <p className="display-sm mt-3">{p.name}</p>
                          <p className="text-[0.8rem] text-stone-2">{p.kind[locale]}</p>
                          <Price pyg={p.pricePYG} comparePyg={p.comparePYG} className="mt-1 text-[0.85rem]" />
                        </Link>
                      </motion.div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Menú en teléfono */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.52, ease: CURTAIN }}
            className="on-ink grain fixed inset-0 z-90 overflow-y-auto lg:hidden"
          >
            <div className="shell flex min-h-full flex-col py-5">
              <div className="flex h-10 items-center justify-between">
                <Wordmark size="sm" />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label={t('nav.cerrarMenu')}
                  className="-mr-2 grid h-10 w-10 place-items-center"
                >
                  <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
                    <path d="m4 4 12 12M16 4 4 16" stroke="currentColor" strokeWidth="1.15" />
                  </svg>
                </button>
              </div>

              <nav aria-label={t('nav.menu')} className="mt-10 flex-1">
                <ul>
                  {[
                    { href: '/coleccion/mujer', label: t('nav.mujer') },
                    { href: '/coleccion/hombre', label: t('nav.hombre') },
                    { href: '/coleccion/accesorios', label: t('nav.accesorios') },
                    { href: '/coleccion', label: t('nav.coleccion') },
                  ].map((item, i) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.14 + i * 0.05, ease: SILK }}
                      className="border-b border-paper/12"
                    >
                      <Link href={item.href} className="display-lg block py-4">
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>

                <ul className="mt-9 space-y-4">
                  {[
                    { href: '/maison', label: t('nav.maison') },
                    { href: '/boutiques', label: t('nav.boutiques') },
                    { href: '/favoritos', label: `${t('nav.favoritos')}${wishCount ? ` (${wishCount})` : ''}` },
                    { href: '/pedidos', label: t('nav.seguimiento') },
                    { href: '/contacto', label: t('nav.contacto') },
                  ].map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="label text-paper/75">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-10 flex items-center justify-between border-t border-paper/12 pt-6">
                <LocaleSwitch onInk />
                <CurrencySwitch onInk />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
