import type { Metadata } from 'next';
import Favorites from '@/components/shop/favorites';

export const metadata: Metadata = {
  title: 'Favoritos',
  description: 'Las piezas que guardaste de la colección ORLÉVANE.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Favorites />;
}
