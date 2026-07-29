'use client';

import CartDrawer from '@/components/shop/cart-drawer';
import SearchOverlay from '@/components/shop/search-overlay';
import SizeGuide from '@/components/shop/size-guide';
import Toaster from './toaster';

/** Todas las capas que viven por encima de la página, montadas una sola vez. */
export default function Overlays() {
  return (
    <>
      <CartDrawer />
      <SearchOverlay />
      <SizeGuide />
      <Toaster />
    </>
  );
}
