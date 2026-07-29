'use client';

import type { ReactNode } from 'react';
import { usePrefs } from '@/lib/prefs';
import { money } from '@/lib/format';
import type { Badge as BadgeKind } from '@/lib/types';

/* ── Precio ────────────────────────────────────────────────────────────── */

export function Price({
  pyg,
  comparePyg,
  className = '',
  compareClassName = '',
}: {
  pyg: number;
  comparePyg?: number;
  className?: string;
  compareClassName?: string;
}) {
  const { currency, locale } = usePrefs();
  return (
    <span className={`tnum inline-flex items-baseline gap-2.5 ${className}`}>
      <span>{money(pyg, currency)}</span>
      {comparePyg && comparePyg > pyg && (
        <span className={`text-[0.82em] line-through opacity-55 ${compareClassName}`}>
          <span className="sr-only">{locale === 'es' ? 'Precio anterior' : 'Preço anterior'}: </span>
          {money(comparePyg, currency)}
        </span>
      )}
    </span>
  );
}

/* ── Etiquetas de estado ───────────────────────────────────────────────── */

const BADGE_TEXT: Record<BadgeKind, { es: string; pt: string }> = {
  nuevo: { es: 'Nuevo', pt: 'Novo' },
  nanduti: { es: 'Serie Ñandutí', pt: 'Série Ñandutí' },
  ultimas: { es: 'Últimas unidades', pt: 'Últimas unidades' },
  agotado: { es: 'Agotado', pt: 'Esgotado' },
};

export function Badge({ kind, onInk = false }: { kind: BadgeKind; onInk?: boolean }) {
  const { locale } = usePrefs();
  const style =
    kind === 'nanduti'
      ? 'bg-claret text-paper border-claret'
      : kind === 'ultimas'
        ? 'bg-transparent text-claret border-claret/60'
        : kind === 'agotado'
          ? 'bg-transparent text-stone border-stone/50'
          : onInk
            ? 'bg-transparent text-paper border-paper/45'
            : 'bg-transparent text-ink border-ink/45';

  return (
    <span className={`label-sm inline-flex items-center border px-2 py-[0.3rem] ${style}`}>
      {BADGE_TEXT[kind][locale]}
    </span>
  );
}

/* ── Antetítulo con filete ─────────────────────────────────────────────── */

export function Kicker({
  children,
  onInk = false,
  className = '',
}: {
  children: ReactNode;
  onInk?: boolean;
  className?: string;
}) {
  return (
    <p className={`label flex items-center gap-3 ${onInk ? 'text-gilt-soft' : 'text-gilt'} ${className}`}>
      <span aria-hidden className={`h-px w-8 ${onInk ? 'bg-gilt-soft/60' : 'bg-gilt/60'}`} />
      {children}
    </p>
  );
}

/* ── Valoración ────────────────────────────────────────────────────────── */

export function Stars({ value, count, onInk = false }: { value: number; count?: number; onInk?: boolean }) {
  const { locale } = usePrefs();
  const full = Math.round(value * 2) / 2;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex items-center gap-[0.15rem]" aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => {
          const fill = full >= n ? 1 : full >= n - 0.5 ? 0.5 : 0;
          return (
            <svg key={n} viewBox="0 0 12 12" className="h-[0.7rem] w-[0.7rem]">
              <defs>
                <linearGradient id={`s${n}-${fill}`}>
                  <stop offset={`${fill * 100}%`} stopColor="var(--color-gilt)" />
                  <stop offset={`${fill * 100}%`} stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                d="M6 .8 7.5 4.3l3.7.35-2.8 2.5.83 3.65L6 8.85 2.77 10.8l.83-3.65L.8 4.65l3.7-.35Z"
                fill={`url(#s${n}-${fill})`}
                stroke="var(--color-gilt)"
                strokeWidth="0.7"
                strokeLinejoin="round"
                opacity={onInk ? 0.95 : 0.85}
              />
            </svg>
          );
        })}
      </span>
      <span className={`tnum text-[0.7rem] ${onInk ? 'text-paper/60' : 'text-stone-2'}`}>
        {value.toFixed(1)}
        {count != null && (
          <>
            {' · '}
            {count} {locale === 'es' ? 'reseñas' : 'avaliações'}
          </>
        )}
      </span>
    </span>
  );
}

/* ── Cinta corrida ─────────────────────────────────────────────────────── */

export function Marquee({
  text,
  onInk = false,
  className = '',
}: {
  text: string;
  onInk?: boolean;
  className?: string;
}) {
  const item = (
    <span className="label flex shrink-0 items-center gap-8 pr-8">
      {text.split('·').map((chunk, i) => (
        <span key={i} className="flex items-center gap-8">
          {chunk.trim()}
          <span aria-hidden className={`inline-block h-1 w-1 rotate-45 ${onInk ? 'bg-gilt-soft' : 'bg-gilt'}`} />
        </span>
      ))}
    </span>
  );

  return (
    <div className={`relative flex overflow-hidden ${className}`} aria-hidden>
      <div className="flex min-w-full shrink-0 animate-marquee items-center motion-reduce:animate-none">
        <div className="flex shrink-0 items-center">{item}</div>
        <div className="flex shrink-0 items-center">{item}</div>
        <div className="flex shrink-0 items-center">{item}</div>
        <div className="flex shrink-0 items-center">{item}</div>
      </div>
    </div>
  );
}

/* ── Ficha de taller: par etiqueta/valor con filete ────────────────────── */

export function SpecRow({
  k,
  v,
  onInk = false,
}: {
  k: ReactNode;
  v: ReactNode;
  onInk?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-6 border-t py-3 ${
        onInk ? 'border-paper/12' : 'border-stone/25'
      }`}
    >
      <dt className={`label shrink-0 ${onInk ? 'text-paper/55' : 'text-stone-2'}`}>{k}</dt>
      <dd className="text-right text-[0.9rem] leading-snug">{v}</dd>
    </div>
  );
}
