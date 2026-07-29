import type { Metadata } from 'next';
import Doc from '@/components/pages/doc';

export const metadata: Metadata = {
  title: 'Privacidad',
  description: 'Qué datos guarda esta demostración y dónde los guarda.',
  alternates: { canonical: '/privacidad' },
};

export default function Page() {
  return (
    <Doc
      updated="07 / 2026"
      kicker={{ es: 'Legal', pt: 'Legal' }}
      title={{ es: 'Privacidad', pt: 'Privacidade' }}
      intro={{
        es: 'Resumen en una línea: todo lo que escribas se queda en tu navegador y nada viaja a un servidor nuestro, porque no hay servidor nuestro.',
        pt: 'Resumo em uma linha: tudo o que você escrever fica no seu navegador e nada viaja para um servidor nosso, porque não existe servidor nosso.',
      }}
      sections={[
        {
          h: { es: 'Qué se guarda', pt: 'O que é guardado' },
          p: [
            {
              es: 'El carrito, los favoritos, las piezas que miraste y los pedidos que confirmaste se guardan en el almacenamiento local de tu navegador, bajo la clave «orlevane.v1». El idioma y la moneda se guardan en dos cookies propias para que la página cargue en el idioma correcto desde el servidor.',
              pt: 'A sacola, os favoritos, as peças que você viu e os pedidos confirmados ficam no armazenamento local do seu navegador, sob a chave «orlevane.v1». O idioma e a moeda ficam em dois cookies próprios para que a página carregue no idioma certo desde o servidor.',
            },
            {
              es: 'Los datos que escribas en el checkout —nombre, correo, teléfono, documento, dirección— sólo existen mientras completás el pedido y quedan dentro del pedido guardado localmente. No se envían a ningún lado.',
              pt: 'Os dados que você digitar no checkout — nome, e-mail, telefone, documento, endereço — só existem enquanto você conclui o pedido e ficam dentro do pedido guardado localmente. Não são enviados a lugar nenhum.',
            },
            {
              es: 'Los datos de tarjeta no se guardan ni siquiera localmente: viven en la memoria de la página y desaparecen al recargar.',
              pt: 'Os dados de cartão não são guardados nem localmente: vivem na memória da página e somem ao recarregar.',
            },
          ],
        },
        {
          h: { es: 'Cookies', pt: 'Cookies' },
          p: [
            {
              es: 'Dos cookies propias, «orlevane_locale» y «orlevane_currency», con un año de duración y sin ningún dato personal. No hay cookies de terceros, ni analítica, ni píxeles de seguimiento, ni publicidad.',
              pt: 'Dois cookies próprios, «orlevane_locale» e «orlevane_currency», com um ano de duração e sem nenhum dado pessoal. Não há cookies de terceiros, nem analytics, nem pixels de rastreamento, nem publicidade.',
            },
          ],
        },
        {
          h: { es: 'Terceros', pt: 'Terceiros' },
          p: [
            {
              es: 'Las tipografías se sirven desde el mismo dominio. Las fotografías se sirven desde el mismo dominio. El único salto a un tercero ocurre si tocás un botón de WhatsApp o un enlace a un mapa, y en ese caso te vas a un sitio con sus propias condiciones.',
              pt: 'As tipografias são servidas do mesmo domínio. As fotografias são servidas do mesmo domínio. O único salto a um terceiro acontece se você tocar um botão de WhatsApp ou um link de mapa, e nesse caso você vai para um site com condições próprias.',
            },
          ],
        },
        {
          h: { es: 'Cómo borrar todo', pt: 'Como apagar tudo' },
          p: [
            {
              es: 'Borrar los datos del sitio desde tu navegador elimina el carrito, los favoritos, los pedidos y las preferencias. No queda copia en ningún otro lado.',
              pt: 'Apagar os dados do site pelo seu navegador elimina a sacola, os favoritos, os pedidos e as preferências. Não fica cópia em nenhum outro lugar.',
            },
          ],
        },
      ]}
    />
  );
}
