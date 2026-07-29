'use client';

import { Modal } from '@/components/ui/sheet';
import { usePrefs } from '@/lib/prefs';
import { useShop } from '@/lib/store';

/** Equivalencias de la casa. Sintéticas, coherentes con la numeración europea. */
const ROWS_W = [
  [35, 34, 5, 22.4],
  [36, 35, 6, 23.1],
  [37, 36, 6.5, 23.8],
  [38, 37, 7.5, 24.5],
  [39, 38, 8.5, 25.2],
  [40, 39, 9, 25.9],
  [41, 40, 10, 26.6],
];

const ROWS_M = [
  [39, 38, 6.5, 25.3],
  [40, 39, 7, 26.0],
  [41, 40, 8, 26.7],
  [42, 41, 8.5, 27.4],
  [43, 42, 9.5, 28.1],
  [44, 43, 10.5, 28.8],
  [45, 44, 11, 29.5],
];

function Table({ title, rows }: { title: string; rows: number[][] }) {
  const { t } = usePrefs();
  return (
    <div>
      <h3 className="label mb-3 text-gilt">{title}</h3>
      <table className="w-full border-collapse text-[0.85rem]">
        <thead>
          <tr className="border-b border-ink">
            {[t('g.eu'), t('g.br'), t('g.us'), t('g.cm')].map((h) => (
              <th key={h} className="label px-1 py-2.5 text-left font-medium text-stone-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="tnum">
          {rows.map((r) => (
            <tr key={r[0]} className="border-b border-stone/25">
              {r.map((cell, i) => (
                <td key={i} className={`px-1 py-2.5 ${i === 0 ? 'font-medium' : 'text-stone-2'}`}>
                  {i === 3 ? cell.toFixed(1) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SizeGuide() {
  const { t } = usePrefs();
  const open = useShop((s) => s.sizeGuideOpen);
  const setOpen = useShop((s) => s.setSizeGuideOpen);

  return (
    <Modal open={open} onClose={() => setOpen(false)} title={t('g.titulo')} labelClose={t('g.cerrar')} size="lg">
      <p className="measure text-[0.92rem] leading-relaxed text-stone-2">{t('g.texto')}</p>
      <div className="mt-8 grid gap-10 sm:grid-cols-2">
        <Table title={t('g.mujer')} rows={ROWS_W} />
        <Table title={t('g.hombre')} rows={ROWS_M} />
      </div>
      <p className="mt-8 border-t border-stone/25 pt-5 text-[0.82rem] text-stone-2">{t('g.nota')}</p>
    </Modal>
  );
}
