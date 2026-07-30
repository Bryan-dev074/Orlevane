'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export const INTRO_KEY = 'orlevane.intro';

/**
 * Estado de la cortina de entrada. El hero encadena su coreografía a esto: si
 * entrara al mismo tiempo que la cortina se abre, el visitante se perdería la
 * mitad del movimiento detrás de la tinta.
 */
interface IntroValue {
  /** Verdadero cuando la cortina terminó de abrirse (o nunca se mostró). */
  done: boolean;
  finish: () => void;
}

const IntroCtx = createContext<IntroValue>({ done: true, finish: () => {} });

export function IntroProvider({ children }: { children: ReactNode }) {
  // Arranca en falso; si la cortina no se monta, ella misma llama a finish().
  const [done, setDone] = useState(false);
  const finish = useCallback(() => setDone(true), []);
  const value = useMemo(() => ({ done, finish }), [done, finish]);
  return <IntroCtx.Provider value={value}>{children}</IntroCtx.Provider>;
}

export const useIntro = () => useContext(IntroCtx);
