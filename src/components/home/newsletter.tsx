'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { Kicker } from '@/components/ui/bits';
import { Reveal, SplitLines } from '@/components/ui/reveal';
import { Arrow } from '@/components/ui/button';
import { usePrefs } from '@/lib/prefs';
import { SILK } from '@/lib/motion';

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export default function Newsletter() {
  const { t } = usePrefs();
  const [value, setValue] = useState('');
  const [state, setState] = useState<'idle' | 'error' | 'done'>('idle');

  return (
    <section className="shell pb-24 pt-4 sm:pb-28">
      <div className="grid gap-10 border-t border-stone/35 pt-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal>
            <Kicker>{t('home.boletin.kicker')}</Kicker>
          </Reveal>
          <SplitLines as="h2" text={t('home.boletin.titulo')} className="display-md mt-5" />
        </div>

        <div className="lg:col-span-7">
          <Reveal i={1}>
            <p className="measure text-[0.95rem] leading-relaxed text-stone-2">{t('home.boletin.texto')}</p>

            <AnimatePresence mode="wait" initial={false}>
              {state === 'done' ? (
                <motion.p
                  key="done"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: SILK }}
                  className="mt-8 border-t border-gilt/50 pt-5 font-display text-[1.3rem]"
                  role="status"
                >
                  {t('home.boletin.ok')}
                </motion.p>
              ) : (
                <motion.form
                  key="form"
                  initial={false}
                  exit={{ opacity: 0 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!EMAIL.test(value.trim())) {
                      setState('error');
                      return;
                    }
                    setState('done');
                  }}
                  className="mt-8 max-w-lg"
                  noValidate
                >
                  <div className="flex items-center gap-3 border-b border-ink pb-2">
                    <input
                      type="email"
                      value={value}
                      onChange={(e) => {
                        setValue(e.target.value);
                        if (state === 'error') setState('idle');
                      }}
                      placeholder={t('home.boletin.placeholder')}
                      aria-label={t('home.boletin.placeholder')}
                      aria-invalid={state === 'error'}
                      aria-describedby="boletin-nota"
                      className="min-w-0 flex-1 bg-transparent py-2 font-display text-[1.25rem] placeholder:text-stone/70"
                    />
                    <button type="submit" className="group/btn label flex shrink-0 items-center gap-2.5 py-2 text-gilt">
                      {t('home.boletin.cta')}
                      <Arrow />
                    </button>
                  </div>
                  <p
                    id="boletin-nota"
                    className={`mt-3 text-[0.76rem] ${state === 'error' ? 'text-claret' : 'text-stone'}`}
                    role={state === 'error' ? 'alert' : undefined}
                  >
                    {state === 'error' ? t('home.boletin.error') : t('home.boletin.demo')}
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
