'use client';

import { BtnLink } from '@/components/ui/button';
import { Kicker } from '@/components/ui/bits';
import { usePrefs } from '@/lib/prefs';

export default function NotFound() {
  const { t } = usePrefs();

  return (
    <div className="shell flex min-h-[72svh] flex-col justify-center py-24">
      <div className="max-w-2xl">
        <Kicker>404</Kicker>
        <h1 className="display-xl mt-6">{t('404.titulo')}</h1>
        <p className="measure mt-6 text-[0.98rem] leading-relaxed text-stone-2">{t('404.texto')}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <BtnLink href="/coleccion" tone="solid" size="lg" arrow>
            {t('404.cta')}
          </BtnLink>
          <BtnLink href="/" tone="outline" size="lg">
            {t('404.inicio')}
          </BtnLink>
        </div>
      </div>
    </div>
  );
}
