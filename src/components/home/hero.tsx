'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';

import Img from '@/components/ui/img';
import { BtnLink } from '@/components/ui/button';
import { usePrefs } from '@/lib/prefs';
import { useIntro } from '@/lib/intro';
import { money } from '@/lib/format';
import { getProduct } from '@/lib/products';
import { CURTAIN, SILK } from '@/lib/motion';

const VITRINA = ['aurore', 'vinci', 'nanduti-bag'] as const;
const DWELL = 7000;
const DRAG_MIN = 56; // píxeles de arrastre para que cuente como cambio de pieza

export default function Hero() {
  const { t, locale, currency } = usePrefs();
  const reduced = useReducedMotion();
  const { done: introDone } = useIntro();

  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const wrap = useRef<HTMLElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const dragFrom = useRef<number | null>(null);

  const show = introDone || reduced;

  /* En teléfono la vitrina se apila, y ahí el paralaje deja de ser profundidad:
     desplaza la ficha sobre la cinta de abajo. Sólo corre en escritorio. */
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  const depth = wide && !reduced;

  /* ── Paralaje de desplazamiento ──────────────────────────────────────── */
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const fichaY = useTransform(scrollYProgress, [0, 1], ['0%', '32%']);
  const veil = useTransform(scrollYProgress, [0, 1], [0, 0.45]);

  /* ── Paralaje de puntero: la vitrina gana profundidad ────────────────── */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 20, mass: 0.8 });
  const sy = useSpring(py, { stiffness: 60, damping: 20, mass: 0.8 });
  const shotX = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const shotY = useTransform(sy, [-0.5, 0.5], [-10, 10]);
  const cardX = useTransform(sx, [-0.5, 0.5], [5, -5]);

  const go = useCallback((n: number) => setI(((n % VITRINA.length) + VITRINA.length) % VITRINA.length), []);

  useEffect(() => {
    if (paused || reduced || !show) return;
    const id = window.setTimeout(() => go(i + 1), DWELL);
    return () => window.clearTimeout(id);
  }, [i, paused, reduced, show, go]);

  // Flechas del teclado, sólo mientras la vitrina está en pantalla.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const r = wrap.current?.getBoundingClientRect();
      if (!r || r.bottom < 120) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      go(i + (e.key === 'ArrowRight' ? 1 : -1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [i, go]);

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== 'mouse' || !wrap.current) return;
    const r = wrap.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const product = getProduct(VITRINA[i])!;

  /** Entradas escalonadas, encadenadas a la cortina. */
  const step = (n: number) => ({
    initial: reduced ? false : { opacity: 0, y: 26 },
    animate: show ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 },
    transition: { duration: 0.85, delay: 0.06 + n * 0.09, ease: SILK },
  });

  const RIBBON = [
    { href: '/coleccion', label: t('home.destacados.todos') },
    { href: '/maison', label: t('home.atelier.kicker') },
    { href: '/coleccion?serie=nanduti', label: t('home.nanduti.kicker') },
    { href: '/contacto', label: t('home.medida.kicker') },
  ];

  return (
    <section
      ref={wrap}
      onPointerMove={onPointerMove}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => {
        setPaused(false);
        px.set(0);
        py.set(0);
      }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={t('home.hero.vitrina')}
      /* -mt-20 mete la vitrina por debajo del encabezado transparente: sobre
         marfil la navegación en marfil no se vería. */
      className="on-ink grain relative isolate -mt-20 overflow-hidden"
    >
      {/* La altura deja asomar la sección siguiente: sin ese borde, la portada
          parece terminar acá y el visitante no sabe que hay tienda debajo. */}
      <div className="relative grid min-h-[calc(100svh-8rem)] grid-cols-1 lg:grid-cols-12">
        {/* Fotografía */}
        <motion.div
          style={depth ? { y: photoY } : undefined}
          className="relative order-1 col-span-1 aspect-4/5 w-full overflow-hidden sm:aspect-16/10 lg:order-2 lg:col-span-7 lg:aspect-auto lg:h-auto"
        >
          <motion.div
            ref={photo}
            style={depth ? { x: shotX, y: shotY } : undefined}
            data-cursor="drag"
            data-cursor-label={t('home.hero.arrastrar')}
            onPointerDown={(e) => {
              dragFrom.current = e.clientX;
            }}
            onPointerUp={(e) => {
              const from = dragFrom.current;
              dragFrom.current = null;
              if (from == null) return;
              const dx = e.clientX - from;
              if (Math.abs(dx) > DRAG_MIN) go(i + (dx < 0 ? 1 : -1));
            }}
            className="absolute -inset-4 touch-pan-y select-none"
          >
            <AnimatePresence initial={false} mode="sync">
              <motion.div
                key={product.slug}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: 0.9, ease: SILK }, scale: { duration: 8.2, ease: 'linear' } }}
                className="absolute inset-0"
              >
                {/* Negativo propio de vitrina: 2000×2500. La ficha de catálogo
                    no alcanza para un plano a sangre en pantalla retina. */}
                <motion.div
                  className="absolute inset-0"
                  initial={reduced ? false : { scale: 1.12 }}
                  animate={show ? { scale: 1 } : { scale: 1.12 }}
                  transition={{ duration: 1.9, ease: CURTAIN }}
                >
                  <Img
                    src={`/media/h/${product.slug}.webp`}
                    alt={`${product.name} — ${product.kind[locale]}`}
                    fill
                    priority={i === 0}
                    quality={90}
                    sizes="(max-width: 1024px) 100vw, 68vw"
                    className="object-cover"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Luz que recorre la pieza. Es lo que mantiene viva la vitrina entre
              cambio y cambio; sin esto el primer viewport queda congelado. */}
          {!reduced && show && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-paper/10 to-transparent"
              initial={{ x: 0 }}
              animate={{ x: ['0%', '520%'] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 4.6, ease: SILK, delay: 1.6 }}
            />
          )}

          <motion.div aria-hidden style={{ opacity: veil }} className="absolute inset-0 bg-ink" />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink via-ink/12 to-transparent lg:bg-gradient-to-r lg:from-ink lg:via-transparent lg:to-transparent"
          />
          {/* Sostiene el contraste de la navegación cuando la foto queda arriba. */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/70 to-transparent lg:hidden" />

          {/* Flecha de deslizar, sólo en el apilado de teléfono: en escritorio
              ese aviso lo da el cursor. Late constante hacia la derecha para
              decir «hay más piezas», y tocada también pasa a la siguiente. */}
          <motion.button
            type="button"
            onClick={() => go(i + 1)}
            aria-label={t('u.siguiente')}
            className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2 p-3 text-paper/90 lg:hidden"
            initial={{ opacity: 0 }}
            animate={show ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 1.5, ease: SILK }}
          >
            <motion.span
              className="block drop-shadow-[0_1px_6px_rgba(23,20,17,0.6)]"
              animate={reduced ? undefined : { x: [0, 5, 0], opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: CURTAIN }}
            >
              <svg viewBox="0 0 10 18" className="h-[1.2rem] w-auto" aria-hidden>
                <path
                  d="M1.5 1.5 8.5 9l-7 7.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Ficha */}
        <motion.div
          style={depth ? { y: fichaY, x: cardX } : undefined}
          className="relative order-2 col-span-1 flex flex-col justify-center px-[clamp(1.15rem,4.2vw,4.5rem)] py-14 lg:order-1 lg:col-span-5 lg:py-24"
        >
          <div className="max-w-lg">
            <motion.p className="label flex items-center gap-3 text-gilt-soft" {...step(0)}>
              <motion.span
                aria-hidden
                className="h-px origin-left bg-gilt-soft/60"
                initial={reduced ? false : { width: 0 }}
                animate={show ? { width: 32 } : { width: 0 }}
                transition={{ duration: 0.7, delay: 0.14, ease: CURTAIN }}
              />
              {t('home.hero.vitrina')}
            </motion.p>

            <AnimatePresence mode="wait">
              <motion.div
                key={product.slug}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.62, ease: SILK }}
              >
                <motion.h1 className="display-xl mt-6" {...step(1)}>
                  {product.name}
                </motion.h1>
                <motion.p
                  className="mt-4 font-display text-[1.35rem] italic leading-snug text-paper/80"
                  {...step(2)}
                >
                  {product.kind[locale]}
                </motion.p>

                <dl className="mt-9 grid max-w-sm grid-cols-3 gap-x-5">
                  {[
                    [t('home.hero.serie'), product.serial],
                    [t('home.hero.horma'), product.last],
                    [t('home.hero.curtido'), product.tannery[locale].split('·')[0].trim()],
                  ].map(([k, v], n) => (
                    <motion.div key={k} className="pt-3" {...step(3 + n * 0.4)}>
                      {/* El filete se dibuja: da la sensación de ficha escrita a mano. */}
                      <motion.span
                        aria-hidden
                        className="mb-3 block h-px origin-left bg-paper/20"
                        initial={reduced ? false : { scaleX: 0 }}
                        animate={show ? { scaleX: 1 } : { scaleX: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 + n * 0.11, ease: CURTAIN }}
                      />
                      <dt className="label-sm text-paper/45">{k}</dt>
                      <dd className="mt-2 text-[0.82rem] leading-snug text-paper/85">{v}</dd>
                    </motion.div>
                  ))}
                </dl>

                <motion.p className="tnum mt-8 font-display text-[1.5rem]" {...step(5)}>
                  {money(product.pricePYG, currency)}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            <motion.div className="mt-9 flex flex-wrap items-center gap-3" {...step(6)}>
              <BtnLink href={`/producto/${product.slug}`} tone="onInk" size="lg" arrow>
                {t('home.hero.ver')}
              </BtnLink>
              <Link href="/coleccion" className="link-rule label px-2 py-3 text-paper/75 hover:text-paper">
                {t('home.hero.explorar')}
              </Link>
            </motion.div>

            {/* Vitrina: miniaturas en vez de puntos. Con tres filetes de un píxel
                nadie entiende que hay más piezas, y la portada parece un solo
                producto. */}
            <motion.div className="mt-12 flex items-end gap-4" {...step(7)}>
              <div className="flex gap-2.5">
                {VITRINA.map((slug, n) => {
                  const piece = getProduct(slug)!;
                  const active = n === i;
                  return (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => go(n)}
                      aria-label={`${piece.name} — ${t('home.hero.pieza')} ${n + 1} ${t('home.hero.de')} ${VITRINA.length}`}
                      aria-current={active}
                      className="group/tick block w-16 shrink-0 text-left sm:w-[4.75rem]"
                    >
                      {/* El filete de borde hace legible la miniatura aunque el
                          negativo sea oscuro: sin él, a este tamaño se pierde. */}
                      <span
                        className={`relative block aspect-4/5 overflow-hidden border bg-ink-2 transition-[opacity,border-color] duration-[400ms] ease-silk ${
                          active
                            ? 'border-gilt/50 opacity-100'
                            : 'border-paper/15 opacity-50 group-hover/tick:opacity-85'
                        }`}
                      >
                        <Img
                          src={`/media/p/${slug}-1.webp`}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </span>
                      <span className="mt-2 block h-px w-full bg-paper/22">
                        {active && (
                          <motion.span
                            key={`${slug}-${i}-${String(paused)}`}
                            className="block h-px origin-left bg-gilt"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: reduced || paused ? 0.4 : DWELL / 1000, ease: 'linear' }}
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="tnum label shrink-0 pb-1 text-paper/45">
                {String(i + 1).padStart(2, '0')} / {String(VITRINA.length).padStart(2, '0')}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Pie de vitrina: dice qué más hay abajo. */}
      <motion.div
        className="relative border-t border-paper/12"
        initial={reduced ? false : { opacity: 0 }}
        animate={show ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.9, ease: SILK }}
      >
        <div className="shell flex items-center justify-between gap-6 py-4">
          <nav aria-label={t('nav.coleccion')} className="no-bar -mx-1 flex gap-5 overflow-x-auto px-1 sm:gap-7">
            {RIBBON.map((r) => (
              <Link key={r.href} href={r.href} className="link-rule label shrink-0 text-paper/55 hover:text-paper">
                {r.label}
              </Link>
            ))}
          </nav>

          <div className="label flex shrink-0 items-center gap-3 text-paper/45">
            <span className="hidden sm:inline">{t('home.hero.desliza')}</span>
            <span aria-hidden className="relative block h-9 w-px bg-paper/22">
              <motion.span
                className="absolute left-1/2 top-0 block h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gilt"
                animate={reduced ? undefined : { y: [0, 30, 30], opacity: [0, 1, 0] }}
                transition={{ duration: 2.1, repeat: Infinity, ease: CURTAIN, times: [0, 0.75, 1] }}
              />
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
