'use client';

import { useEffect } from 'react';
import { Btn, BtnLink } from '@/components/ui/button';
import { usePrefs } from '@/lib/prefs';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t, locale } = usePrefs();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="shell flex min-h-[72svh] flex-col justify-center py-24">
      <div className="max-w-2xl">
        <p className="label text-claret">{t('u.error')}</p>
        <h1 className="display-lg mt-5">
          {locale === 'es' ? 'Se nos soltó una costura' : 'Soltou uma costura'}
        </h1>
        <p className="measure mt-6 text-[0.98rem] leading-relaxed text-stone-2">
          {locale === 'es'
            ? 'Algo falló al mostrar esta página. Podés reintentar; si vuelve a pasar, volvé a la colección y avisanos por WhatsApp.'
            : 'Algo falhou ao mostrar esta página. Você pode tentar de novo; se acontecer outra vez, volte à coleção e avise pelo WhatsApp.'}
        </p>
        {error.digest && <p className="tnum mt-4 text-[0.75rem] text-stone">ref: {error.digest}</p>}
        <div className="mt-10 flex flex-wrap gap-3">
          <Btn tone="solid" size="lg" arrow onClick={reset}>
            {t('u.reintentar')}
          </Btn>
          <BtnLink href="/coleccion" tone="outline" size="lg">
            {t('404.cta')}
          </BtnLink>
        </div>
      </div>
    </div>
  );
}
