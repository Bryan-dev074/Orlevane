'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';

import Img from '@/components/ui/img';
import { useShop } from '@/lib/store';
import { usePrefs } from '@/lib/prefs';
import { SILK } from '@/lib/motion';

export default function Toaster() {
  const { t } = usePrefs();
  const toasts = useShop((s) => s.toasts);
  const drop = useShop((s) => s.dropToast);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="no-print pointer-events-none fixed inset-x-0 bottom-0 z-110 flex flex-col items-end gap-2 p-4 sm:p-6"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.28, ease: SILK } }}
            transition={{ duration: 0.44, ease: SILK }}
            className={`pointer-events-auto flex w-full max-w-[22rem] items-center gap-3 border px-3 py-3 shadow-lift ${
              toast.tone === 'warn' ? 'border-claret/40 bg-paper text-claret' : 'border-ink bg-ink text-paper'
            }`}
          >
            {toast.image && (
              <span className="relative h-14 w-11 shrink-0 overflow-hidden bg-paper-2">
                <Img src={toast.image} alt="" fill sizes="44px" className="object-cover" />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.88rem] font-medium">
                {toast.href ? (
                  <Link href={toast.href} onClick={() => drop(toast.id)} className="link-rule">
                    {toast.title}
                  </Link>
                ) : (
                  toast.title
                )}
              </span>
              {toast.detail && (
                <span className={`mt-0.5 block truncate text-[0.75rem] ${toast.tone === 'warn' ? 'text-claret/80' : 'text-paper/60'}`}>
                  {toast.detail}
                </span>
              )}
            </span>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action!.run();
                  drop(toast.id);
                }}
                className={`label shrink-0 border px-2.5 py-2 transition-colors ${
                  toast.tone === 'warn'
                    ? 'border-claret/40 hover:bg-claret hover:text-paper'
                    : 'border-paper/35 hover:bg-paper hover:text-ink'
                }`}
              >
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => drop(toast.id)}
              aria-label={t('u.cerrar')}
              className="-mr-1 grid h-7 w-7 shrink-0 place-items-center opacity-60 transition-opacity hover:opacity-100"
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden>
                <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
