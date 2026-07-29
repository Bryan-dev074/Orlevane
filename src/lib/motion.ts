import type { Transition, Variants } from 'motion/react';

/** Curva de la casa: salida exponencial, sin rebote. Ver DESIGN.md. */
export const SILK: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
export const CURTAIN: [number, number, number, number] = [0.65, 0, 0.35, 1];

/** 400 ms es el valor fijado en el brief para la ficha de producto. */
export const CARD_MS = 0.4;

export const silk = (duration = 0.6, delay = 0): Transition => ({ duration, delay, ease: SILK });

export const spring: Transition = { type: 'spring', stiffness: 320, damping: 34, mass: 0.9 };

/** Entrada por scroll: parte de un estado ya legible, no de la nada. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, delay: i * 0.06, ease: SILK },
  }),
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: SILK } },
};

/** Cortina: la imagen se descubre de abajo hacia arriba. */
export const curtain: Variants = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
  show: (i: number = 0) => ({
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: 0.95, delay: i * 0.08, ease: CURTAIN },
  }),
};

/** Renglones de display que suben desde una máscara. */
export const lineMask: Variants = {
  hidden: { y: '105%' },
  show: (i: number = 0) => ({
    y: '0%',
    transition: { duration: 0.85, delay: 0.06 + i * 0.075, ease: CURTAIN },
  }),
};

export const stagger = (gap = 0.06): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap } },
});

export const VIEWPORT = { once: true, amount: 0.25, margin: '0px 0px -12% 0px' } as const;
