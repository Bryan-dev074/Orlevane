import type { Metadata } from 'next';
import Checkout from '@/components/checkout/checkout';

export const metadata: Metadata = {
  title: 'Finalizar compra',
  description: 'Checkout de demostración de ORLÉVANE. Los pagos son simulados.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Checkout />;
}
