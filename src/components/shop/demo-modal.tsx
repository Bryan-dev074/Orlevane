'use client';

import { Modal } from '@/components/ui/sheet';
import { Btn } from '@/components/ui/button';
import { usePrefs } from '@/lib/prefs';
import { useShop } from '@/lib/store';
import { TEST_CARDS } from '@/lib/payments';
import { WHATSAPP_DISPLAY } from '@/lib/whatsapp';

export default function DemoModal() {
  const { t, locale } = usePrefs();
  const open = useShop((s) => s.demoOpen);
  const setOpen = useShop((s) => s.setDemoOpen);

  return (
    <Modal open={open} onClose={() => setOpen(false)} title={t('demo.tituloModal')} labelClose={t('u.cerrar')}>
      <div className="measure space-y-4 text-[0.92rem] leading-relaxed text-stone-2">
        <p>{t('demo.p1')}</p>
        <p className="border-l-0 text-ink">{t('demo.p2')}</p>
        <p>
          {t('demo.p3')} <span className="tnum whitespace-nowrap text-ink">{WHATSAPP_DISPLAY}</span>
        </p>
      </div>

      <div className="mt-8 border-t border-stone/25 pt-6">
        <h3 className="label text-gilt">{t('k.tarjeta.demo')}</h3>
        <ul className="mt-4 space-y-2">
          {TEST_CARDS.map((c) => (
            <li key={c.number} className="flex items-baseline justify-between gap-4 border-b border-stone/20 pb-2 text-[0.85rem]">
              <span className="tnum">{c.number}</span>
              <span className={c.outcome === 'aprobada' ? 'text-stone-2' : 'text-claret'}>{c.label[locale]}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[0.78rem] text-stone">
          {locale === 'es'
            ? 'Vencimiento: cualquier fecha futura. CVV: cualquier número. Código del banco: cualquiera de seis dígitos, salvo 000000.'
            : 'Validade: qualquer data futura. CVV: qualquer número. Código do banco: qualquer um de seis dígitos, exceto 000000.'}
        </p>
      </div>

      <div className="mt-8 flex justify-end">
        <Btn tone="solid" onClick={() => setOpen(false)}>
          {t('demo.entendido')}
        </Btn>
      </div>
    </Modal>
  );
}
