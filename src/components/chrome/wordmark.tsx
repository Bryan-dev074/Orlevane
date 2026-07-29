import Link from 'next/link';

/**
 * Marca denominativa. Didone con tracking abierto; el acento agudo es lo único
 * que se permite tocar. Nunca se le aplica degradado ni sombra.
 */
export default function Wordmark({
  className = '',
  size = 'md',
  href = '/',
  as = 'link',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  as?: 'link' | 'plain';
}) {
  const scale = size === 'sm' ? 'text-[0.95rem]' : size === 'lg' ? 'text-[2rem] sm:text-[2.6rem]' : 'text-[1.28rem]';
  const inner = (
    <span className={`font-display ${scale} leading-none tracking-[0.3em] ${className}`}>
      ORLÉVANE
      <span className="sr-only"> — Elegancia en cada paso</span>
    </span>
  );

  if (as === 'plain') return inner;

  return (
    <Link href={href} className="inline-block shrink-0" aria-label="ORLÉVANE">
      {inner}
    </Link>
  );
}

/** Monograma para el pie y los favicon del sitio. */
export function Monogram({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <path d="M24 8 L36 24 L24 40 L12 24 Z" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M24 14 L31 24 L24 34 L17 24 Z" fill="currentColor" opacity="0.18" />
    </svg>
  );
}
