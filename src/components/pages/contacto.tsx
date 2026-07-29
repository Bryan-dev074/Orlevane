'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { Btn } from '@/components/ui/button';
import { Kicker } from '@/components/ui/bits';
import { Reveal, RuleIn, SplitLines } from '@/components/ui/reveal';
import { usePrefs } from '@/lib/prefs';
import { waUrl, WHATSAPP_DISPLAY } from '@/lib/whatsapp';
import { SILK } from '@/lib/motion';

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

const SUBJECTS = ['ct.asunto.pedido', 'ct.asunto.talla', 'ct.asunto.medida', 'ct.asunto.prensa', 'ct.asunto.otro'] as const;

export default function Contacto() {
  const { t, locale } = usePrefs();
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0] as string, message: '' });
  const [state, setState] = useState<'idle' | 'error' | 'done'>('idle');

  const field = 'h-12 w-full border border-stone/40 bg-transparent px-3.5 text-[0.95rem] transition-colors focus:border-ink';

  return (
    <div className="shell py-14 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal>
            <Kicker>{t('ct.kicker')}</Kicker>
          </Reveal>
          <SplitLines as="h1" text={t('ct.titulo')} className="display-xl mt-6" />
          <Reveal i={1}>
            <p className="measure mt-6 text-[0.98rem] leading-relaxed text-stone-2">{t('ct.texto')}</p>

            <dl className="mt-10 space-y-5">
              <div className="border-t border-stone/30 pt-4">
                <dt className="label-sm text-stone">WhatsApp</dt>
                <dd className="mt-2">
                  <a
                    href={waUrl(locale === 'es' ? 'Hola ORLÉVANE' : 'Olá ORLÉVANE')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-rule tnum text-[1.05rem]"
                  >
                    {WHATSAPP_DISPLAY}
                  </a>
                </dd>
              </div>
              <div className="border-t border-stone/30 pt-4">
                <dt className="label-sm text-stone">{locale === 'es' ? 'Correo' : 'E-mail'}</dt>
                <dd className="mt-2">
                  <a href="mailto:atelier@orlevane.com" className="link-rule text-[1.05rem]">
                    atelier@orlevane.com
                  </a>
                </dd>
              </div>
              <div className="border-t border-stone/30 pt-4">
                <dt className="label-sm text-stone">{t('b.taller')}</dt>
                <dd className="mt-2 text-[0.95rem] leading-relaxed">
                  Palma 615, casi 15 de Agosto
                  <br />
                  <span className="text-stone-2">{locale === 'es' ? 'Asunción, Paraguay' : 'Assunção, Paraguai'}</span>
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <RuleIn className="mb-10 lg:hidden" />
          <AnimatePresence mode="wait" initial={false}>
            {state === 'done' ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: SILK }}
                className="border-t border-gilt/50 pt-8"
                role="status"
              >
                <p className="display-md">{t('ct.ok')}</p>
                <a
                  href={waUrl(
                    `${form.name || ''}\n${form.message}`.trim() || (locale === 'es' ? 'Hola ORLÉVANE' : 'Olá ORLÉVANE'),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-block"
                >
                  <Btn tone="whatsapp" size="md">
                    {t('ct.enviarWa')}
                  </Btn>
                </a>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                exit={{ opacity: 0 }}
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  if (form.name.trim().length < 2 || !EMAIL.test(form.email.trim()) || form.message.trim().length < 8) {
                    setState('error');
                    return;
                  }
                  setState('done');
                }}
                className="grid gap-5 sm:grid-cols-2"
              >
                <div>
                  <label htmlFor="ct-name" className="label text-stone-2">
                    {t('k.nombre')}
                  </label>
                  <input
                    id="ct-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    autoComplete="name"
                    className={`mt-2 ${field}`}
                  />
                </div>
                <div>
                  <label htmlFor="ct-email" className="label text-stone-2">
                    {t('k.email')}
                  </label>
                  <input
                    id="ct-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="email"
                    className={`mt-2 ${field}`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="ct-subject" className="label text-stone-2">
                    {t('ct.asunto')}
                  </label>
                  <select
                    id="ct-subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className={`mt-2 ${field}`}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {t(s)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="ct-message" className="label text-stone-2">
                    {t('ct.mensaje')}
                  </label>
                  <textarea
                    id="ct-message"
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="mt-2 w-full border border-stone/40 bg-transparent p-3.5 text-[0.95rem] transition-colors focus:border-ink"
                  />
                </div>

                {state === 'error' && (
                  <p role="alert" className="text-[0.8rem] text-claret sm:col-span-2">
                    {t('ct.error')}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                  <Btn tone="solid" size="lg" arrow>
                    {t('ct.enviar')}
                  </Btn>
                  <a
                    href={waUrl(locale === 'es' ? 'Hola ORLÉVANE' : 'Olá ORLÉVANE')}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Btn tone="whatsapp" size="lg" type="button">
                      {t('ct.enviarWa')}
                    </Btn>
                  </a>
                </div>

                <p className="text-[0.75rem] text-stone sm:col-span-2">{t('ft.aviso')}</p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
