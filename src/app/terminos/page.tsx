import type { Metadata } from 'next';
import Doc from '@/components/pages/doc';

export const metadata: Metadata = {
  title: 'Términos de venta',
  description: 'Condiciones de la tienda de demostración ORLÉVANE.',
  alternates: { canonical: '/terminos' },
};

export default function Page() {
  return (
    <Doc
      updated="07 / 2026"
      kicker={{ es: 'Legal', pt: 'Legal' }}
      title={{ es: 'Términos de venta', pt: 'Termos de venda' }}
      intro={{
        es: 'Condiciones bajo las que ORLÉVANE vende, entrega y repara. Están escritas para leerse de una sentada.',
        pt: 'Condições sob as quais a ORLÉVANE vende, entrega e conserta. Escritas para serem lidas de uma vez.',
      }}
      sections={[
        {
          h: { es: 'La compra', pt: 'A compra' },
          p: [
            {
              es: 'El pedido queda cerrado cuando recibís el número que empieza con ORL-. Hasta ese momento las tallas quedan reservadas por veinte minutos y después vuelven al stock.',
              pt: 'O pedido é fechado quando você recebe o número que começa com ORL-. Até esse momento as numerações ficam reservadas por vinte minutos e depois voltam ao estoque.',
            },
            {
              es: 'Si una talla se agota entre el pedido y el despacho, te escribimos antes de cobrar nada y elegís entre esperar la reposición, cambiar de talla o cancelar.',
              pt: 'Se uma numeração esgotar entre o pedido e o despacho, escrevemos antes de cobrar qualquer coisa e você escolhe entre esperar a reposição, trocar de numeração ou cancelar.',
            },
          ],
        },
        {
          h: { es: 'Precios y moneda', pt: 'Preços e moeda' },
          p: [
            {
              es: 'Los precios se expresan en guaraníes y se convierten a reales con una tasa fija que se revisa cada temporada. El precio que vale es el que figura al confirmar el pedido.',
              pt: 'Os preços são expressos em guaranis e convertidos a reais com uma taxa fixa revisada a cada temporada. O preço que vale é o que aparece ao confirmar o pedido.',
            },
          ],
        },
        {
          h: { es: 'Pedidos por WhatsApp', pt: 'Pedidos por WhatsApp' },
          p: [
            {
              es: 'El botón de WhatsApp abre una conversación con la boutique, con el pedido ya escrito a partir de tu carrito. Esa conversación ocurre fuera de este sitio y bajo las condiciones de WhatsApp.',
              pt: 'O botão de WhatsApp abre uma conversa com a boutique, com o pedido já escrito a partir da sua sacola. Essa conversa acontece fora deste site e sob as condições do WhatsApp.',
            },
          ],
        },
        {
          h: { es: 'Garantía', pt: 'Garantia' },
          p: [
            {
              es: 'Dos años sobre defectos de fabricación: costura, montado y herrajes. El desgaste de suela y taco no entra en garantía, pero se repara en el taller a precio de costo mientras exista la horma, que es siempre.',
              pt: 'Dois anos sobre defeitos de fabricação: costura, montagem e metais. O desgaste de sola e salto não entra na garantia, mas conserta-se na oficina a preço de custo enquanto existir a fôrma, o que é sempre.',
            },
          ],
        },
        {
          h: { es: 'Propiedad del material', pt: 'Propriedade do material' },
          p: [
            {
              es: 'Los textos, el diseño y el código de este sitio son originales. Las fotografías provienen de Unsplash y se usan bajo la Unsplash License.',
              pt: 'Os textos, o design e o código deste site são originais. As fotografias vêm do Unsplash e são usadas sob a Unsplash License.',
            },
          ],
        },
        {
          h: { es: 'Sobre esta versión del sitio', pt: 'Sobre esta versão do site' },
          p: [
            {
              es: 'Esta instalación es una pieza de demostración: el catálogo, los precios, el stock, las boutiques, las reseñas y los datos bancarios son material de muestra, y el checkout no cobra. El botón final del pago lo dice antes de confirmar.',
              pt: 'Esta instalação é uma peça de demonstração: o catálogo, os preços, o estoque, as boutiques, as avaliações e os dados bancários são material de amostra, e o checkout não cobra. O botão final do pagamento avisa antes de confirmar.',
            },
            {
              es: 'Por eso, nunca ingreses los datos de una tarjeta real. En el paso de pago hay tarjetas de prueba para recorrer el flujo completo.',
              pt: 'Por isso, nunca digite os dados de um cartão real. No passo de pagamento há cartões de teste para percorrer o fluxo completo.',
            },
          ],
        },
      ]}
    />
  );
}
