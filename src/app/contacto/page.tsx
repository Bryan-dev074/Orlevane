import type { Metadata } from 'next';
import Contacto from '@/components/pages/contacto';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Escribinos por WhatsApp o correo. Atendemos de lunes a sábado desde el taller de Asunción.',
  alternates: { canonical: '/contacto' },
};

export default function Page() {
  return <Contacto />;
}
