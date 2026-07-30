'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import { usePrefs } from '@/lib/prefs';
import { useIntro } from '@/lib/intro';
import { CURTAIN, SILK } from '@/lib/motion';
import { setScrollLock } from './smooth-scroll';

/**
 * Cortina de entrada.
 *
 * Dos paños de tela que se abren, no un rectángulo que se va. La diferencia
 * está en tres cosas: la textura de pliegues, la sombra en el canto interno
 * —que es donde la tela se junta y se oscurece— y que los paños no salen a la
 * vez: el derecho sale un pelo después, como pasa cuando dos cuerdas no tiran
 * exactamente igual.
 *
 * La secuencia tiene compases, no un fundido:
 *   0,00  tinta, nada
 *   0,30  una línea de luz asoma por la juntura
 *   0,55  el sello se escribe letra por letra
 *   1,10  la leyenda entra y el filete marca la carga real
 *   2,20  compás
 *   —     los paños se abren en 1,4 s
 *
 * Se muestra en cada recarga. Se puede saltar con un clic o con Escape, y con
 * movimiento reducido no aparece.
 */

/** Lo que tarda la secuencia en contarse entera. */
const MIN_MS = 2200;
/** Tope duro: la tienda nunca queda rehén de una imagen lenta. */
const MAX_MS = 4200;

const WORDMARK = 'ORLÉVANE'.split('');

type Phase = 'closed' | 'open' | 'gone';

export default function Curtain() {
  const { t } = usePrefs();
  const { finish } = useIntro();
  const reduced = useReducedMotion();

  // Arranca cerrada y ya renderizada en el servidor: si esperara a la
  // hidratación, el visitante vería la portada un instante antes de la cortina.
  const [phase, setPhase] = useState<Phase>('closed');
  const [progress, setProgress] = useState(0);
  const [hint, setHint] = useState(false);
  const settled = useRef(false);
  const locked = useRef(false);

  const release = useCallback(() => {
    if (!locked.current) return;
    locked.current = false;
    setScrollLock(false);
  }, []);

  const open = useCallback(() => {
    if (settled.current) return;
    settled.current = true;
    setProgress(1);
    setPhase('open');
  }, []);

  useEffect(() => {
    if (document.documentElement.dataset.intro === 'skip' || reduced) {
      setPhase('gone');
      finish();
      return;
    }

    locked.current = true;
    setScrollLock(true);
    const started = performance.now();

    /* Se espera a la tipografía y al `load` de la página, nunca a los archivos
       de vitrina a mano: pedirlos acá bajaba el negativo crudo de 2000 px y
       después next/image bajaba el mismo ya optimizado. Eran medio mega tirado
       a la basura. La primera fotografía ya viaja con prioridad por su cuenta. */
    const jobs: Promise<unknown>[] = [
      document.fonts?.ready ?? Promise.resolve(),
      new Promise<void>((resolve) => {
        if (document.readyState === 'complete') return resolve();
        window.addEventListener('load', () => resolve(), { once: true });
      }),
    ];

    let landed = 0;
    jobs.forEach((job) => {
      void Promise.resolve(job).then(() => {
        landed += 1;
        setProgress(landed / jobs.length);
      });
    });

    const settle = () => {
      const waited = performance.now() - started;
      window.setTimeout(open, Math.max(0, MIN_MS - waited));
    };

    void Promise.all(jobs).then(settle);
    const cap = window.setTimeout(open, MAX_MS);
    // La salida sólo se ofrece a quien esperó; en una visita normal no se ve.
    const nudge = window.setTimeout(() => setHint(true), 2600);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') open();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.clearTimeout(cap);
      window.clearTimeout(nudge);
      window.removeEventListener('keydown', onKey);
      release();
    };
  }, [reduced, finish, open, release]);

  if (phase === 'gone') return null;

  const opening = phase === 'open';

  return (
    <div
      className="curtain fixed inset-0 z-[200] cursor-none"
      onClick={open}
      role="presentation"
      aria-hidden
    >
      {/* Paño izquierdo */}
      <motion.div
        className="drape drape-l absolute inset-y-0 left-0 w-1/2 will-change-transform"
        initial={{ x: 0 }}
        animate={{ x: opening ? '-100%' : 0 }}
        transition={{ duration: 1.4, ease: CURTAIN }}
        onAnimationComplete={() => {
          if (!opening) return;
          setPhase('gone');
          release();
          finish();
        }}
      />

      {/* Paño derecho: sale un poco después, para que no parezca una puerta. */}
      <motion.div
        className="drape drape-r absolute inset-y-0 right-0 w-1/2 will-change-transform"
        initial={{ x: 0 }}
        animate={{ x: opening ? '100%' : 0 }}
        transition={{ duration: 1.4, delay: opening ? 0.09 : 0, ease: CURTAIN }}
      />

      {/* Luz por la juntura: es lo que dice que hay algo detrás de la tela. */}
      <motion.div
        className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-gilt/70 shadow-[0_0_22px_rgba(184,154,91,0.32)]"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={
          opening
            ? { scaleY: 1, opacity: [0.45, 1, 0], transition: { duration: 0.9, ease: SILK } }
            : { scaleY: 1, opacity: 0.45, transition: { duration: 1.1, delay: 0.3, ease: CURTAIN } }
        }
      />

      {/* Sello y avance */}
      <motion.div
        className="absolute inset-0 grid place-items-center"
        animate={{ opacity: opening ? 0 : 1, scale: opening ? 1.05 : 1 }}
        transition={{ duration: 0.45, ease: SILK }}
      >
        <div className="flex flex-col items-center">
          {/* leading holgado a propósito: con `leading-none` la máscara de cada
              letra le corta el acento a la É. */}
          <h1 className="flex font-display text-[clamp(1.6rem,5.2vw,3.2rem)] leading-[1.2] tracking-[0.3em] text-paper">
            {WORDMARK.map((ch, n) => (
              <span key={n} className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.78, delay: 0.55 + n * 0.06, ease: CURTAIN }}
                >
                  {ch}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            className="mt-8 h-px w-[min(18rem,52vw)] bg-paper/15"
            initial={{ opacity: 0, scaleX: 0.4 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.9, delay: 1.1, ease: CURTAIN }}
          >
            <motion.div
              className="h-px origin-left bg-gilt"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: Math.max(0.04, progress) }}
              transition={{ duration: 0.6, ease: SILK }}
            />
          </motion.div>

          <motion.p
            className="label mt-5 text-paper/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.25, ease: SILK }}
          >
            {t('intro.abriendo')}
          </motion.p>
        </div>
      </motion.div>

      {/* Salida para el impaciente */}
      <motion.p
        className="label absolute inset-x-0 bottom-10 text-center text-paper/22"
        initial={{ opacity: 0 }}
        animate={{ opacity: hint && !opening ? 1 : 0 }}
        transition={{ duration: 0.8, ease: SILK }}
      >
        {t('intro.saltar')}
      </motion.p>
    </div>
  );
}
