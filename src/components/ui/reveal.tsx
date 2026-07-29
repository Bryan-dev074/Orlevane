'use client';

import { motion, useInView, useReducedMotion, type HTMLMotionProps } from 'motion/react';
import { useRef, type ElementType, type ReactNode } from 'react';
import { CURTAIN, SILK, VIEWPORT } from '@/lib/motion';

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  /** Escalonado dentro de un mismo grupo. */
  i?: number;
  as?: ElementType;
  distance?: number;
}

/** Entrada al entrar en pantalla. Una sola vez, desde un estado ya legible. */
export function Reveal({ children, i = 0, as = 'div', distance = 24, className, ...rest }: RevealProps) {
  const reduced = useReducedMotion();
  const Tag = motion[as as 'div'] ?? motion.div;

  if (reduced) {
    const Plain = as as ElementType;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.72, delay: i * 0.06, ease: SILK }}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Título display que sube por renglones desde una máscara.
 * El texto se parte por `|` para controlar el corte a mano.
 *
 * El observador se pone en el contenedor, no en el renglón: el renglón arranca
 * desplazado dentro de un padre con `overflow-hidden`, y el IntersectionObserver
 * recorta contra ese padre, así que nunca se vería a sí mismo entrar en pantalla.
 */
export function SplitLines({
  text,
  className = '',
  lineClassName = '',
  delay = 0,
  as: Tag = 'h2',
}: {
  text: string;
  className?: string;
  lineClassName?: string;
  delay?: number;
  as?: ElementType;
}) {
  const reduced = useReducedMotion();
  const host = useRef<HTMLElement>(null);
  const inView = useInView(host, { once: true, amount: 0.2, margin: '0px 0px -8% 0px' });
  const lines = text.split('|');

  if (reduced) {
    return (
      <Tag className={className}>
        {lines.map((l, k) => (
          <span key={k} className={`block ${lineClassName}`}>
            {l}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag ref={host as never} className={className}>
      {lines.map((l, k) => (
        <span key={k} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={`block ${lineClassName}`}
            initial={{ y: '110%' }}
            animate={inView ? { y: '0%' } : { y: '110%' }}
            transition={{ duration: 0.9, delay: delay + k * 0.08, ease: CURTAIN }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Filete que se dibuja de izquierda a derecha al aparecer. */
export function RuleIn({ className = '', tone = 'stone' }: { className?: string; tone?: 'stone' | 'gilt' | 'paper' }) {
  const color = tone === 'gilt' ? 'bg-gilt/60' : tone === 'paper' ? 'bg-paper/25' : 'bg-stone/35';
  return (
    <motion.div
      aria-hidden
      className={`h-px origin-left ${color} ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 1, ease: CURTAIN }}
    />
  );
}
