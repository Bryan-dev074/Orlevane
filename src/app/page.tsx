'use client';

import Hero from '@/components/home/hero';
import Featured from '@/components/home/featured';
import Worlds from '@/components/home/worlds';
import Atelier from '@/components/home/atelier';
import Nanduti from '@/components/home/nanduti';
import Reviews from '@/components/home/reviews';
import Measure from '@/components/home/measure';
import Newsletter from '@/components/home/newsletter';
import { Marquee } from '@/components/ui/bits';
import { usePrefs } from '@/lib/prefs';

export default function Home() {
  const { t } = usePrefs();

  return (
    <>
      <Hero />

      <div className="border-b border-stone/25 py-4 text-gilt">
        <Marquee text={t('home.marquee')} />
      </div>

      <Featured />
      <Worlds />
      <Atelier />
      <Nanduti />
      <Reviews />
      <Measure />
      <Newsletter />
    </>
  );
}
