import type { Metadata } from 'next';
import Boutiques from '@/components/pages/boutiques';

export const metadata: Metadata = {
  title: 'Boutiques',
  description: 'Las direcciones de ORLÉVANE en Asunción y Ciudad del Este, y el taller que abre con cita.',
  alternates: { canonical: '/boutiques' },
};

export default function Page() {
  return <Boutiques />;
}
