'use client';

import { AnimatePresence, motion } from 'motion/react';
import { usePrefs } from '@/lib/prefs';
import { useShop, useHydrated } from '@/lib/store';
import { SILK } from '@/lib/motion';

export default function DemoBar() {
  const { t } = usePrefs();
  const seen = useShop((s) => s.demoBarSeen);
  const hydrated = useHydrated();
  const dismiss = useShop((s) => s.dismissDemoBar);
  const setDemoOpen = useShop((s) => s.setDemoOpen);

  const show = hydrated && !seen;

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          transition={{ duration: 0.45, ease: SILK }}
          className="no-print overflow-hidden bg-claret text-paper"
        >
          <div className="shell flex items-center gap-3 py-2.5 sm:gap-4">
            <span className="label-sm hidden shrink-0 border border-paper/45 px-1.5 py-1 sm:inline-block">
              {t('demo.badge')}
            </span>
            <p className="min-w-0 flex-1 text-[0.74rem] leading-snug sm:text-[0.78rem]">{t('demo.bar')}</p>
            <button type="button" onClick={() => setDemoOpen(true)} className="link-rule label hidden shrink-0 md:inline-block">
              {t('demo.masInfo')}
            </button>
            <button
              type="button"
              onClick={dismiss}
              aria-label={t('demo.cerrar')}
              className="-mr-2 grid h-8 w-8 shrink-0 place-items-center opacity-75 transition-opacity hover:opacity-100"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
                <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
