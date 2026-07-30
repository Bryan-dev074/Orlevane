'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Cursor de la casa.
 *
 * Un punto que sigue al instante y un anillo que llega con retardo. El punto da
 * precisión, el anillo da el peso; juntos se leen como un instrumento y no como
 * un adorno.
 *
 * Reglas para no arruinar la página, que es el riesgo real de esto:
 *  · sólo con puntero fino y sin movimiento reducido;
 *  · nunca sobre campos de formulario, donde tapa el cursor de texto;
 *  · `pointer-events: none` siempre, para no comerse ningún clic;
 *  · mezcla por diferencia, así se lee igual sobre marfil que sobre tinta.
 *
 * El estado sale de `data-cursor` en el elemento más cercano, así cada zona
 * pide su forma sin que este componente conozca la página.
 */

type Mode = 'default' | 'link' | 'view' | 'drag' | 'hidden';

const RING: Record<Mode, number> = { default: 13, link: 38, view: 76, drag: 76, hidden: 0 };

export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [mode, setMode] = useState<Mode>('default');
  const [label, setLabel] = useState('');

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || still.matches) return;

    setOn(true);
    // La clase es la que apaga el puntero nativo. Se pone acá y no en una
    // consulta de CSS suelta para que sea imposible quedarse sin ninguno de los
    // dos: si este componente no corre, el cursor del sistema sigue ahí.
    document.documentElement.classList.add('has-cursor');

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const eased = { x: target.x, y: target.y };
    let raf = 0;
    let alive = false;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!alive) {
        alive = true;
        eased.x = e.clientX;
        eased.y = e.clientY;
      }

      const el = (e.target as Element | null)?.closest?.(
        '[data-cursor],a,button,input,textarea,select,label,[role="button"]',
      );
      if (!el) return setMode('default');

      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return setMode('hidden');

      const asked = el.getAttribute('data-cursor');
      if (asked === 'view' || asked === 'drag') {
        setLabel(el.getAttribute('data-cursor-label') ?? '');
        return setMode(asked);
      }
      if (asked === 'hidden') return setMode('hidden');
      setMode('link');
    };

    const onLeave = () => setMode('hidden');
    const onEnter = () => setMode('default');

    const tick = () => {
      raf = requestAnimationFrame(tick);
      eased.x += (target.x - eased.x) * 0.18;
      eased.y += (target.y - eased.y) * 0.18;
      if (ring.current) ring.current.style.transform = `translate3d(${eased.x}px, ${eased.y}px, 0) translate(-50%, -50%)`;
      if (dot.current) dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
    };
    tick();

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
    };
  }, []);

  if (!on) return null;

  const size = RING[mode];
  const filled = mode === 'view' || mode === 'drag';

  return (
    <div aria-hidden className="no-print pointer-events-none fixed inset-0 z-[190] hidden [@media(pointer:fine)]:block">
      <div
        ref={ring}
        className="fixed left-0 top-0 grid place-items-center rounded-full transition-[width,height,background-color,border-color,opacity] duration-[420ms] ease-silk"
        style={{
          width: size,
          height: size,
          opacity: mode === 'hidden' ? 0 : 1,
          border: filled ? '1px solid transparent' : '1px solid var(--color-gilt)',
          background: filled ? 'var(--color-gilt)' : 'transparent',
          mixBlendMode: filled ? 'normal' : 'difference',
        }}
      >
        {filled && label && (
          <span className="label-sm select-none text-ink" style={{ letterSpacing: '0.14em' }}>
            {label}
          </span>
        )}
      </div>

      <div
        ref={dot}
        className="fixed left-0 top-0 rounded-full bg-gilt transition-opacity duration-300"
        style={{
          width: 4,
          height: 4,
          opacity: mode === 'default' ? 1 : 0,
          mixBlendMode: 'difference',
        }}
      />
    </div>
  );
}
