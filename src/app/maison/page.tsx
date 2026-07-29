import type { Metadata } from 'next';
import Maison from '@/components/pages/maison';

export const metadata: Metadata = {
  title: 'La Maison',
  description:
    'Un taller en Asunción y hormas de tradición europea. Cuero del Chaco curtido al quebracho, catorce días en la horma y una serie corta con calado de ñandutí.',
  alternates: { canonical: '/maison' },
};

export default function Page() {
  return <Maison />;
}
