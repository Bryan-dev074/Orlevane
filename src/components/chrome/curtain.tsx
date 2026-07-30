'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { usePrefs } from '@/lib/prefs';
import { useIntro, INTRO_KEY } from '@/lib/intro';
import { CURTAIN, SILK } from '@/lib/motion';
import { setScrollLock } from './smooth-scroll';

/**
 * Cortina de entrada.
 *
 * La marca se dibuja letra por letra mientras carga lo que el primer viewport
 * necesita de verdad —las tipografías y los tres negativos de vitrina— y el
 * filete dorado marca ese avance real, no un porcentaje inventado.
 *
 * Tres salvaguardas, porque una cortina mal hecha es peor que ninguna:
 *  · se muestra una sola vez por sesión;
 *  · sale igual pasado el tope de tiempo, aunque algo no haya cargado;
 *  · con movimiento reducido no hay cortina, sólo un fundido corto.
 */

const HERO_SHOTS = ['/media/h/aurore.webp', '/media/h/vinci.webp', '/media/h/nanduti-bag.webp'];
/* El mínimo no es estético: es el tiempo que tarda el sello en terminar de
   escribirse (0,05 + 7×0,04 + 0,6 ≈ 0,93 s). Con menos, la cortina se abre
   sobre una marca a medio dibujar, que es peor que no tener cortina. */
const MIN_MS = 1150;
const MAX_MS = 2600; // tope duro: la tienda nunca queda rehén de una imagen lenta

const WORDMARK = 'ORLÉVANE'.split('');

export default function Curtain() {
  const { t } = usePrefs();
  const { finish } = useIntro();
  const reduced = useReducedMotion();

  // Arranca visible y ya renderizada en el servidor: si esperara a la
  // hidratación, el visitante vería la portada un instante antes de la cortina.
  // A quien no le toca cortina se la esconde por CSS antes de pintar, con el
  // atributo que deja el guion en línea del layout.
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(0);
  const [lifting, setLifting] = useState(false);
  const settled = useRef(false);
  const locked = useRef(false);

  const release = () => {
    if (!locked.current) return;
    locked.current = false;
    setScrollLock(false);
  };

  useEffect(() => {
    const skip = document.documentElement.dataset.intro === 'skip';
    if (skip || reduced) {
      setShow(false);
      finish();
      try {
        sessionStorage.setItem(INTRO_KEY, '1');
      } catch {
        /* modo privado */
      }
      return;
    }

    locked.current = true;
    setScrollLock(true);
    const started = performance.now();

    // Cada pieza que termina suma su parte al filete.
    const jobs: Promise<unknown>[] = [
      document.fonts?.ready ?? Promise.resolve(),
      ...HERO_SHOTS.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = src;
          }),
      ),
    ];

    let landed = 0;
    jobs.forEach((job) => {
      void Promise.resolve(job).then(() => {
        landed += 1;
        setProgress(landed / jobs.length);
      });
    });

    const close = () => {
      if (settled.current) return;
      settled.current = true;
      setProgress(1);
      const waited = performance.now() - started;
      window.setTimeout(() => setLifting(true), Math.max(0, MIN_MS - waited));
    };

    void Promise.all(jobs).then(close);
    const cap = window.setTimeout(close, MAX_MS);

    return () => {
      window.clearTimeout(cap);
      release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, finish]);

  // El telón terminó de abrirse: se libera el scroll y arranca el hero.
  const onLifted = () => {
    release();
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      /* modo privado */
    }
    setShow(false);
    finish();
  };

  return (
    <AnimatePresence onExitComplete={onLifted}>
      {show && !lifting && (
        <motion.div
          key="curtain"
          className="curtain fixed inset-0 z-[200] grid place-items-center"
          exit={{ opacity: 1 }}
          /* Mantiene el nodo vivo hasta que las dos mitades terminaron de salir. */
          transition={{ duration: 1.0 }}
          aria-hidden
        >
          {/* Dos mitades que se apartan. */}
          <motion.div
            className="on-ink grain absolute inset-x-0 top-0 h-1/2"
            exit={{ y: '-100%' }}
            transition={{ duration: 0.8, ease: CURTAIN, delay: 0.16 }}
          />
          <motion.div
            className="on-ink grain absolute inset-x-0 bottom-0 h-1/2"
            exit={{ y: '100%' }}
            transition={{ duration: 0.8, ease: CURTAIN, delay: 0.16 }}
          />

          {/* Marca y avance, por encima de la juntura. */}
          <motion.div
            className="relative flex flex-col items-center"
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.3, ease: SILK }}
          >
            {/* leading holgado a propósito: con `leading-none` la máscara de cada
                letra le corta el acento a la É. */}
            <h1 className="flex font-display text-[clamp(1.6rem,5.2vw,3.2rem)] leading-[1.2] tracking-[0.3em] text-paper">
              {WORDMARK.map((ch, n) => (
                <span key={n} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.6, delay: 0.05 + n * 0.04, ease: CURTAIN }}
                  >
                    {ch}
                  </motion.span>
                </span>
              ))}
            </h1>

            <div className="mt-7 h-px w-[min(18rem,52vw)] bg-paper/18">
              <motion.div
                className="h-px origin-left bg-gilt"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: Math.max(0.06, progress) }}
                transition={{ duration: 0.5, ease: SILK }}
              />
            </div>

            <motion.p
              className="label mt-5 text-paper/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: SILK }}
            >
              {t('intro.abriendo')}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
