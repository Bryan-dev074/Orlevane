'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Tone = 'solid' | 'outline' | 'quiet' | 'onInk' | 'claret' | 'whatsapp';
type Size = 'sm' | 'md' | 'lg';

const TONE: Record<Tone, string> = {
  solid:
    'bg-ink text-paper border border-ink hover:bg-ink-2 hover:border-gilt disabled:bg-stone disabled:border-stone disabled:text-paper/70',
  outline:
    'bg-transparent text-ink border border-stone/55 hover:border-ink hover:bg-ink hover:text-paper disabled:opacity-45 disabled:hover:bg-transparent disabled:hover:text-ink',
  onInk:
    'bg-paper text-ink border border-paper hover:bg-gilt-soft hover:border-gilt-soft disabled:opacity-45',
  quiet:
    'bg-transparent text-ink border border-transparent hover:border-stone/45 disabled:opacity-45',
  claret:
    'bg-claret text-paper border border-claret hover:bg-[#8b2735] hover:border-[#8b2735] disabled:opacity-45',
  whatsapp:
    'bg-transparent text-ink border border-stone/55 hover:border-[#1f7a4d] hover:text-[#155f3b] disabled:opacity-45',
};

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-4 text-[0.6875rem]',
  md: 'h-12 px-7 text-[0.75rem]',
  lg: 'h-[3.5rem] px-9 text-[0.8125rem]',
};

const BASE =
  'group/btn relative inline-flex items-center justify-center gap-2.5 select-none uppercase tracking-[0.16em] font-medium ' +
  'transition-[background-color,border-color,color,transform] duration-[400ms] ease-silk ' +
  'active:translate-y-px disabled:cursor-not-allowed disabled:active:translate-y-0';

export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 10"
      aria-hidden="true"
      className={`h-[0.6em] w-auto overflow-visible transition-transform duration-[400ms] ease-silk group-hover/btn:translate-x-1 ${className}`}
    >
      <path d="M0 5h22M17.5 1 22 5l-4.5 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

interface Common {
  tone?: Tone;
  size?: Size;
  arrow?: boolean;
  full?: boolean;
  children: ReactNode;
  className?: string;
}

export function Btn({
  tone = 'solid',
  size = 'md',
  arrow = false,
  full = false,
  className = '',
  children,
  ...rest
}: Common & ComponentProps<'button'>) {
  return (
    <button
      {...rest}
      className={`${BASE} ${TONE[tone]} ${SIZE[size]} ${full ? 'w-full' : ''} ${className}`}
    >
      <span className="translate-y-px">{children}</span>
      {arrow && <Arrow />}
    </button>
  );
}

export function BtnLink({
  tone = 'solid',
  size = 'md',
  arrow = false,
  full = false,
  className = '',
  children,
  ...rest
}: Common & ComponentProps<typeof Link>) {
  return (
    <Link {...rest} className={`${BASE} ${TONE[tone]} ${SIZE[size]} ${full ? 'w-full' : ''} ${className}`}>
      <span className="translate-y-px">{children}</span>
      {arrow && <Arrow />}
    </Link>
  );
}

/** Enlace de texto con el filete que crece. Se usa en párrafos y pies. */
export function TextLink({
  className = '',
  children,
  ...rest
}: { children: ReactNode; className?: string } & ComponentProps<typeof Link>) {
  return (
    <Link {...rest} className={`link-rule label ${className}`}>
      {children}
    </Link>
  );
}
