import type { Metadata } from 'next';
import CartPage from '@/components/shop/cart-page';

export const metadata: Metadata = {
  title: 'Carrito',
  description: 'Tu selección en ORLÉVANE.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CartPage />;
}
