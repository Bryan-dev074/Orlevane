'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Btn } from '@/components/ui/button';
import { RuleIn } from '@/components/ui/reveal';
import { usePrefs } from '@/lib/prefs';
import { useShop, useHydrated } from '@/lib/store';
import { formatDate, money } from '@/lib/format';

export default function OrderLookup() {
  const { t, locale, currency } = usePrefs();
  const router = useRouter();
  const orders = useShop((s) => s.orders);
  const hydrated = useHydrated();
  const find = useShop((s) => s.findOrder);

  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="shell py-14 sm:py-20">
      <nav aria-label="breadcrumb" className="label mb-8 flex items-center gap-2 text-stone">
        <Link href="/" className="link-rule">
          ORLÉVANE
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink">{t('o.buscarTitulo')}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <h1 className="display-xl">{t('o.buscarTitulo')}</h1>
          <p className="measure mt-6 text-[0.95rem] leading-relaxed text-stone-2">{t('o.buscarTexto')}</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const found = find(code);
              if (found) router.push(`/pedido/${found.code}`);
              else setError(t('o.noEncontrado'));
            }}
            className="mt-9 max-w-md"
          >
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder={t('o.buscarPh')}
                aria-label={t('o.numero')}
                aria-invalid={!!error}
                className={`tnum h-12 min-w-0 flex-1 border bg-transparent px-3.5 tracking-[0.12em] placeholder:tracking-normal placeholder:text-stone/70 ${
                  error ? 'border-claret' : 'border-stone/40 focus:border-ink'
                }`}
              />
              <Btn tone="solid" size="md" className="shrink-0">
                {t('o.buscar')}
              </Btn>
            </div>
            {error && (
              <p role="alert" className="mt-2.5 text-[0.78rem] text-claret">
                {error}
              </p>
            )}
          </form>
        </div>

        <div className="lg:col-span-6">
          <h2 className="label text-stone-2">{t('o.misPedidos')}</h2>
          <RuleIn className="mt-4" />

          {!hydrated ? (
            <div className="h-24" />
          ) : orders.length === 0 ? (
            <p className="mt-6 text-[0.9rem] text-stone-2">{t('o.sinPedidos')}</p>
          ) : (
            <ul className="mt-2">
              {orders.map((o) => (
                <li key={o.code} className="border-b border-stone/25">
                  <Link href={`/pedido/${o.code}`} className="group/o flex items-center justify-between gap-6 py-4">
                    <span className="min-w-0">
                      <span className="tnum block font-display text-[1.1rem]">{o.code}</span>
                      <span className="mt-1 block text-[0.78rem] text-stone-2">
                        {formatDate(o.createdAt, locale)} · {o.lines.length}{' '}
                        {o.lines.length === 1 ? t('c.item') : t('c.items')}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="tnum block text-[0.9rem]">{money(o.totalPYG, currency)}</span>
                      <span className="label-sm mt-1 block text-gilt">
                        {t(`o.estado.${o.status}` as 'o.estado.confirmado')}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
