'use client';

import { motion } from 'motion/react';
import { SILK } from '@/lib/motion';
import { BRAND_LABEL, digits, type Brand } from '@/lib/payments';
import { usePrefs } from '@/lib/prefs';

/** Marca dibujada, no logotipo: dos discos para Mastercard, barra para el resto. */
function BrandMark({ brand }: { brand: Brand }) {
  if (brand === 'mastercard') {
    return (
      <span aria-hidden className="flex items-center">
        <span className="h-6 w-6 rounded-full bg-claret/85" />
        <span className="-ml-2.5 h-6 w-6 rounded-full bg-gilt/85" />
      </span>
    );
  }
  if (brand === 'desconocida') {
    return <span aria-hidden className="h-6 w-9 border border-paper/25" />;
  }
  return (
    <span aria-hidden className="flex flex-col items-end gap-1">
      <span className="h-[3px] w-9 bg-gilt/85" />
      <span className="h-[3px] w-6 bg-paper/40" />
    </span>
  );
}

export default function CardVisual({
  number,
  name,
  expiry,
  brand,
  flipped,
}: {
  number: string;
  name: string;
  expiry: string;
  brand: Brand;
  flipped: boolean;
}) {
  const { t } = usePrefs();
  const raw = digits(number);
  const groups = brand === 'amex' ? [4, 6, 5] : [4, 4, 4, 4];

  let cursor = 0;
  const blocks = groups.map((len) => {
    const chunk = raw.slice(cursor, cursor + len);
    cursor += len;
    return chunk.padEnd(len, '•');
  });

  return (
    <div className="[perspective:1400px]">
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.66, ease: SILK }}
        className="relative aspect-[1.586/1] w-full [transform-style:preserve-3d]"
      >
        {/* Frente */}
        <div className="on-ink grain absolute inset-0 flex flex-col justify-between overflow-hidden border border-gilt/25 p-5 [backface-visibility:hidden] sm:p-6">
          <div className="flex items-start justify-between">
            <span className="font-display text-[0.95rem] tracking-[0.3em]">ORLÉVANE</span>
            <BrandMark brand={brand} />
          </div>

          <div aria-hidden className="h-8 w-11 rounded-[3px] bg-gradient-to-br from-gilt-soft to-gilt/60" />

          <p className="tnum text-[1.05rem] tracking-[0.14em] text-paper/95 sm:text-[1.2rem]">{blocks.join('  ')}</p>

          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="label-sm text-paper/40">{t('k.tarjeta.nombre')}</p>
              <p className="mt-1 truncate text-[0.8rem] uppercase tracking-[0.1em]">
                {name.trim() || t('k.tarjeta.titular')}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="label-sm text-paper/40">{t('k.tarjeta.venc')}</p>
              <p className="tnum mt-1 text-[0.8rem] tracking-[0.1em]">{expiry || 'MM/AA'}</p>
            </div>
          </div>
        </div>

        {/* Reverso */}
        <div className="on-ink grain absolute inset-0 overflow-hidden border border-gilt/25 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div aria-hidden className="mt-6 h-11 w-full bg-ink-3" />
          <div className="px-5 pt-5 sm:px-6">
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-8 flex-1 bg-paper/85" />
              <span className="tnum grid h-8 w-14 place-items-center bg-paper/85 text-[0.8rem] text-ink">•••</span>
            </div>
            <p className="label-sm mt-4 text-paper/40">
              {BRAND_LABEL[brand] !== '—' ? BRAND_LABEL[brand] : t('k.tarjeta.cvv')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
