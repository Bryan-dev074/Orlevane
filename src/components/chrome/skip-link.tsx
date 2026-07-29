'use client';

import { usePrefs } from '@/lib/prefs';

export default function SkipLink() {
  const { t } = usePrefs();
  return (
    <a
      href="#contenido"
      className="label sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:bg-ink focus:px-5 focus:py-3 focus:text-paper"
    >
      {t('nav.saltarContenido')}
    </a>
  );
}
