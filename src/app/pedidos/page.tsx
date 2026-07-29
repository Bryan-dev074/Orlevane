import type { Metadata } from 'next';
import OrderLookup from '@/components/shop/order-lookup';

export const metadata: Metadata = {
  title: 'Seguí tu pedido',
  description: 'Consultá el estado de un pedido de ORLÉVANE con su número.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <OrderLookup />;
}
