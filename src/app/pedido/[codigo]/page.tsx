import type { Metadata } from 'next';
import OrderView from '@/components/shop/order-view';

export const metadata: Metadata = {
  title: 'Tu pedido',
  description: 'Detalle y seguimiento del pedido.',
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  return <OrderView code={decodeURIComponent(codigo)} />;
}
