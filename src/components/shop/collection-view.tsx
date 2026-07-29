'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import ProductCard from './product-card';
import { Btn } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { usePrefs } from '@/lib/prefs';
import { PRODUCTS, byCategory, colorsOf, familiesOf, priceRange, sizesOf, totalStock } from '@/lib/products';
import { money, sizeLabel } from '@/lib/format';
import { SILK } from '@/lib/motion';
import { setScrollLock } from '@/components/chrome/smooth-scroll';
import type { Category, Family, Product } from '@/lib/types';

type Sort = 'destacados' | 'nuevos' | 'precio-asc' | 'precio-desc' | 'nombre';

const SORTS: Array<{ id: Sort; key: 'cat.orden.destacados' | 'cat.orden.nuevos' | 'cat.orden.precioAsc' | 'cat.orden.precioDesc' | 'cat.orden.nombre' }> = [
  { id: 'destacados', key: 'cat.orden.destacados' },
  { id: 'nuevos', key: 'cat.orden.nuevos' },
  { id: 'precio-asc', key: 'cat.orden.precioAsc' },
  { id: 'precio-desc', key: 'cat.orden.precioDesc' },
  { id: 'nombre', key: 'cat.orden.nombre' },
];

const CAT_TITLE: Record<Category | 'todo', 'nav.mujer' | 'nav.hombre' | 'nav.accesorios' | 'cat.titulo'> = {
  mujer: 'nav.mujer',
  hombre: 'nav.hombre',
  accesorios: 'nav.accesorios',
  todo: 'cat.titulo',
};

const CAT_INTRO: Record<Category | 'todo', { es: string; pt: string }> = {
  mujer: {
    es: 'Trece hormas propias entre escarpines, sandalias, bailarinas y botas. Todas se montan sobre madera y descansan catorce días.',
    pt: 'Treze fôrmas próprias entre scarpins, sandálias, sapatilhas e botas. Todas montadas em madeira e descansadas catorze dias.',
  },
  hombre: {
    es: 'Oxford, derby, mocasines y chelsea con costura Goodyear o Blake. La suela se cambia sin desarmar el zapato.',
    pt: 'Oxford, derby, mocassins e chelsea com costura Goodyear ou Blake. A sola troca-se sem desmontar o sapato.',
  },
  accesorios: {
    es: 'Marroquinería del mismo cuero que los pares, cinturones cortados de una sola tira y el estuche que usa el taller.',
    pt: 'Marroquinaria do mesmo couro dos pares, cintos cortados de uma só tira e o estojo que a oficina usa.',
  },
  todo: {
    es: 'Treinta y seis referencias. La colección entera cabe en una tarde y esa es la idea: cada pieza tiene que justificar su lugar.',
    pt: 'Trinta e seis referências. A coleção inteira cabe numa tarde e é essa a ideia: cada peça precisa justificar seu lugar.',
  },
};

function useFilterState(category: Category | 'todo') {
  const params = useSearchParams();
  const router = useRouter();

  const read = useCallback((key: string) => params.get(key)?.split(',').filter(Boolean) ?? [], [params]);

  const state = useMemo(
    () => ({
      familias: read('familia') as Family[],
      tallas: read('talla').map(Number),
      colores: read('color'),
      serie: params.get('serie') ?? '',
      max: Number(params.get('max') ?? 0),
      disponible: params.get('stock') === '1',
      sort: (params.get('orden') as Sort) || 'destacados',
    }),
    [params, read],
  );

  const push = useCallback(
    (next: Partial<Record<string, string | null>>) => {
      const sp = new URLSearchParams(params.toString());
      Object.entries(next).forEach(([k, v]) => {
        if (!v) sp.delete(k);
        else sp.set(k, v);
      });
      const qs = sp.toString();
      router.replace(`/coleccion${category === 'todo' ? '' : `/${category}`}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [params, router, category],
  );

  const toggle = useCallback(
    (key: string, value: string) => {
      const current = read(key);
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      push({ [key]: next.length ? next.join(',') : null });
    },
    [read, push],
  );

  const clear = useCallback(() => {
    router.replace(`/coleccion${category === 'todo' ? '' : `/${category}`}`, { scroll: false });
  }, [router, category]);

  return { state, push, toggle, clear };
}

function FilterPanel({
  category,
  state,
  push,
  toggle,
  clear,
}: {
  category: Category | 'todo';
  state: ReturnType<typeof useFilterState>['state'];
  push: ReturnType<typeof useFilterState>['push'];
  toggle: ReturnType<typeof useFilterState>['toggle'];
  clear: () => void;
}) {
  const { t, locale, currency } = usePrefs();
  const [minP, maxP] = priceRange();
  const families = familiesOf(category);
  const sizes = sizesOf(category);
  const colors = colorsOf(category);
  const cap = state.max || maxP;

  const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border-t border-stone/30 py-6">
      <h3 className="label mb-4 text-stone-2">{title}</h3>
      {children}
    </div>
  );

  return (
    <div>
      <Group title={t('cat.familia')}>
        <ul className="space-y-2.5">
          {families.map((f) => {
            const on = state.familias.includes(f);
            return (
              <li key={f}>
                <label className="flex cursor-pointer items-center gap-3 text-[0.9rem]">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle('familia', f)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className={`grid h-4 w-4 shrink-0 place-items-center border transition-colors duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gilt ${
                      on ? 'border-ink bg-ink text-paper' : 'border-stone/50'
                    }`}
                  >
                    {on && (
                      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5">
                        <path d="m1.5 5 2.4 2.4L8.5 2.8" fill="none" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    )}
                  </span>
                  <span className={on ? 'text-ink' : 'text-stone-2'}>
                    {t(`cat.familia.${f}` as 'cat.familia.escarpin')}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </Group>

      {sizes.length > 0 && (
        <Group title={t('cat.talla')}>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => {
              const on = state.tallas.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle('talla', String(s))}
                  aria-pressed={on}
                  className={`tnum h-9 min-w-10 border px-2 text-[0.8rem] transition-colors duration-200 ${
                    on ? 'border-ink bg-ink text-paper' : 'border-stone/40 hover:border-ink'
                  }`}
                >
                  {sizeLabel(s, locale)}
                </button>
              );
            })}
          </div>
        </Group>
      )}

      <Group title={t('cat.color')}>
        <ul className="space-y-2.5">
          {colors.map((c) => {
            const on = state.colores.includes(c.id);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => toggle('color', c.id)}
                  aria-pressed={on}
                  className="flex items-center gap-3 text-[0.9rem]"
                >
                  <span
                    aria-hidden
                    className={`h-4 w-4 shrink-0 border transition-[box-shadow] duration-200 ${
                      on ? 'border-ink shadow-[0_0_0_2px_var(--color-paper),0_0_0_3px_var(--color-ink)]' : 'border-stone/45'
                    }`}
                    style={{ background: c.hex }}
                  />
                  <span className={on ? 'text-ink' : 'text-stone-2'}>{c.name[locale]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Group>

      <Group title={t('cat.precio')}>
        <input
          type="range"
          min={minP}
          max={maxP}
          step={50000}
          value={cap}
          onChange={(e) => push({ max: e.target.value === String(maxP) ? null : e.target.value })}
          aria-label={`${t('cat.precio')} ${t('cat.hasta')} ${money(cap, currency)}`}
          className="h-1 w-full cursor-pointer appearance-none bg-stone/35 accent-ink"
        />
        <p className="tnum mt-3 text-[0.82rem] text-stone-2">
          {t('cat.hasta')} <span className="text-ink">{money(cap, currency)}</span>
        </p>
      </Group>

      <Group title={t('cat.filtros')}>
        <ul className="space-y-2.5 text-[0.9rem]">
          <li>
            <button
              type="button"
              onClick={() => push({ serie: state.serie === 'nanduti' ? null : 'nanduti' })}
              aria-pressed={state.serie === 'nanduti'}
              className={`link-rule ${state.serie === 'nanduti' ? 'text-claret' : 'text-stone-2 hover:text-ink'}`}
            >
              {locale === 'es' ? 'Sólo serie Ñandutí' : 'Só série Ñandutí'}
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => push({ stock: state.disponible ? null : '1' })}
              aria-pressed={state.disponible}
              className={`link-rule ${state.disponible ? 'text-ink' : 'text-stone-2 hover:text-ink'}`}
            >
              {locale === 'es' ? 'Sólo disponibles' : 'Só disponíveis'}
            </button>
          </li>
        </ul>
      </Group>

      <button type="button" onClick={clear} className="link-rule label mt-2 text-stone-2 hover:text-claret">
        {t('cat.limpiar')}
      </button>
    </div>
  );
}

export default function CollectionView({ category }: { category: Category | 'todo' }) {
  const { t, locale } = usePrefs();
  const { state, push, toggle, clear } = useFilterState(category);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (!panelOpen) return;
    setScrollLock(true);
    return () => setScrollLock(false);
  }, [panelOpen]);

  const pool = category === 'todo' ? PRODUCTS : byCategory(category);

  const items = useMemo(() => {
    let out: Product[] = pool.filter((p) => {
      if (state.familias.length && !state.familias.includes(p.family)) return false;
      if (state.tallas.length && !state.tallas.some((s) => (p.stock[s] ?? 0) > 0)) return false;
      if (state.colores.length && !p.colors.some((c) => state.colores.includes(c.id))) return false;
      if (state.serie === 'nanduti' && p.badge !== 'nanduti' && !p.serial.startsWith('Ñ')) return false;
      if (state.max && p.pricePYG > state.max) return false;
      if (state.disponible && totalStock(p) === 0) return false;
      return true;
    });

    const by: Record<Sort, (a: Product, b: Product) => number> = {
      destacados: (a, b) => Number(!!b.featured) - Number(!!a.featured) || a.rank - b.rank,
      nuevos: (a, b) => Number(b.badge === 'nuevo') - Number(a.badge === 'nuevo') || a.rank - b.rank,
      'precio-asc': (a, b) => a.pricePYG - b.pricePYG,
      'precio-desc': (a, b) => b.pricePYG - a.pricePYG,
      nombre: (a, b) => a.name.localeCompare(b.name, locale),
    };
    out = [...out].sort(by[state.sort] ?? by.destacados);
    return out;
  }, [pool, state, locale]);

  const activeCount =
    state.familias.length +
    state.tallas.length +
    state.colores.length +
    (state.serie ? 1 : 0) +
    (state.max ? 1 : 0) +
    (state.disponible ? 1 : 0);

  return (
    <>
      <header className="shell pb-10 pt-14 sm:pt-20">
        <Reveal>
          <nav aria-label="breadcrumb" className="label mb-8 flex items-center gap-2 text-stone">
            <a href="/" className="link-rule">
              ORLÉVANE
            </a>
            <span aria-hidden>/</span>
            <span className="text-ink">{t(CAT_TITLE[category])}</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h1 className="display-xl">{t(CAT_TITLE[category])}</h1>
            <p className="tnum label pb-3 text-stone">
              {items.length} {items.length === 1 ? t('cat.pieza') : t('cat.piezas')}
            </p>
          </div>
          <p className="measure mt-6 text-[0.95rem] leading-relaxed text-stone-2">{CAT_INTRO[category][locale]}</p>
        </Reveal>
      </header>

      {/* Barra de control */}
      {/* top-16 = alto del encabezado ya compactado; con otro valor se abre una
          franja por la que asoman las fichas. */}
      <div className="sticky top-16 z-50 border-y border-stone/30 bg-paper/92 backdrop-blur-xl">
        <div className="shell flex items-center justify-between gap-4 py-3">
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="label flex items-center gap-2.5 lg:hidden"
          >
            <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden>
              <path d="M1 4h16M4 9h10M7 14h4" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            {t('cat.filtrar')}
            {activeCount > 0 && <span className="tnum text-gilt">({activeCount})</span>}
          </button>

          <div className="hidden items-center gap-4 lg:flex">
            <span className="label text-stone-2">{t('cat.filtros')}</span>
            {activeCount > 0 && (
              <button type="button" onClick={clear} className="link-rule label text-claret">
                {t('cat.limpiar')} ({activeCount})
              </button>
            )}
          </div>

          <label className="flex items-center gap-2.5">
            <span className="label hidden text-stone-2 sm:inline">{t('cat.orden')}</span>
            <select
              value={state.sort}
              onChange={(e) => push({ orden: e.target.value === 'destacados' ? null : e.target.value })}
              className="label cursor-pointer border border-stone/40 bg-transparent py-2 pl-3 pr-8 transition-colors hover:border-ink"
              style={{
                appearance: 'none',
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%238D8982' stroke-width='1.2'/%3E%3C/svg%3E\")",
                backgroundPosition: 'right 0.7rem center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {t(s.key)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="shell grid gap-10 py-12 lg:grid-cols-12 lg:gap-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-36">
            <FilterPanel category={category} state={state} push={push} toggle={toggle} clear={clear} />
          </div>
        </aside>

        <div className="lg:col-span-9">
          {items.length === 0 ? (
            <div className="border-t border-stone/30 py-20 text-center">
              <h2 className="display-md">{t('cat.vacio.titulo')}</h2>
              <p className="measure mx-auto mt-4 text-[0.95rem] text-stone-2">{t('cat.vacio.texto')}</p>
              <Btn tone="outline" className="mt-8" onClick={clear}>
                {t('cat.vacio.cta')}
              </Btn>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-x-5 gap-y-14 sm:gap-x-8 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {items.map((p, i) => (
                  <motion.div
                    key={p.slug}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.5, delay: Math.min(i, 8) * 0.035, ease: SILK }}
                  >
                    <ProductCard product={p} index={i} priority={i < 3} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Panel de filtros en teléfono */}
      <AnimatePresence>
        {panelOpen && (
          <div className="fixed inset-0 z-100 lg:hidden">
            <motion.button
              type="button"
              aria-label={t('u.cerrar')}
              onClick={() => setPanelOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 h-full w-full bg-ink/45 backdrop-blur-[3px]"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t('cat.filtros')}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.5, ease: SILK }}
              className="absolute inset-x-0 bottom-0 flex max-h-[86vh] flex-col bg-paper"
            >
              <div className="flex items-center justify-between border-b border-stone/30 px-5 py-4">
                <h2 className="display-sm">{t('cat.filtros')}</h2>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  aria-label={t('u.cerrar')}
                  className="-mr-2 grid h-10 w-10 place-items-center"
                >
                  <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
                    <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.15" />
                  </svg>
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5">
                <FilterPanel category={category} state={state} push={push} toggle={toggle} clear={clear} />
              </div>
              <div className="border-t border-stone/30 p-4">
                <Btn tone="solid" size="lg" full onClick={() => setPanelOpen(false)}>
                  {t('cat.aplicar')} ({items.length})
                </Btn>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
