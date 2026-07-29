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
        es: 'Lo primero y más importante: este sitio es una demostración. No es un comercio habilitado, no procesa pagos y no despacha mercadería.',
        pt: 'O primeiro e mais importante: este site é uma demonstração. Não é um comércio habilitado, não processa pagamentos e não despacha mercadoria.',
      }}
      sections={[
        {
          h: { es: 'Naturaleza del sitio', pt: 'Natureza do site' },
          p: [
            {
              es: 'ORLÉVANE, tal como se presenta acá, es una pieza de demostración construida para mostrar cómo se vería y funcionaría una tienda de calzado en línea. La marca, el catálogo, los precios, el stock, las boutiques, las reseñas y los datos bancarios son material inventado.',
              pt: 'A ORLÉVANE, como se apresenta aqui, é uma peça de demonstração construída para mostrar como seria e funcionaria uma loja de calçados on-line. A marca, o catálogo, os preços, o estoque, as boutiques, as avaliações e os dados bancários são material inventado.',
            },
            {
              es: 'Ningún pedido realizado en este sitio genera una obligación de entrega ni un cargo real.',
              pt: 'Nenhum pedido feito neste site gera obrigação de entrega nem cobrança real.',
            },
          ],
        },
        {
          h: { es: 'Pagos simulados', pt: 'Pagamentos simulados' },
          p: [
            {
              es: 'La pasarela «ORLÉVANE Pay» corre por completo dentro de tu navegador. No hay servidor, no hay red y no hay procesador de pagos. Los números de tarjeta de prueba que aparecen en el checkout son los públicos de la industria y no corresponden a ninguna cuenta.',
              pt: 'O checkout «ORLÉVANE Pay» roda inteiramente dentro do seu navegador. Não há servidor, não há rede e não há processadora de pagamentos. Os números de cartão de teste que aparecem no checkout são os públicos da indústria e não correspondem a nenhuma conta.',
            },
            {
              es: 'Nunca ingreses datos reales de una tarjeta. Aunque este sitio no los transmite a ningún lado, es una costumbre que no conviene tener.',
              pt: 'Nunca digite dados reais de um cartão. Embora este site não os transmita a lugar nenhum, é um hábito que não convém ter.',
            },
          ],
        },
        {
          h: { es: 'Pedidos por WhatsApp', pt: 'Pedidos por WhatsApp' },
          p: [
            {
              es: 'El botón de WhatsApp sí abre WhatsApp de verdad, con un mensaje armado a partir de tu carrito. A partir de ahí la conversación ocurre fuera de este sitio y bajo las condiciones de WhatsApp.',
              pt: 'O botão de WhatsApp abre o WhatsApp de verdade, com uma mensagem montada a partir da sua sacola. A partir daí a conversa acontece fora deste site e sob as condições do WhatsApp.',
            },
          ],
        },
        {
          h: { es: 'Precios y moneda', pt: 'Preços e moeda' },
          p: [
            {
              es: 'Los precios se expresan en guaraníes y se convierten a reales con una tasa fija de demostración. No reflejan el mercado ni ninguna lista real.',
              pt: 'Os preços são expressos em guaranis e convertidos a reais com uma taxa fixa de demonstração. Não refletem o mercado nem nenhuma tabela real.',
            },
          ],
        },
        {
          h: { es: 'Propiedad del material', pt: 'Propriedade do material' },
          p: [
            {
              es: 'Las fotografías provienen de Unsplash bajo la licencia de Unsplash y están usadas como material de referencia. Los textos, el diseño y el código son originales de esta demostración.',
              pt: 'As fotografias vêm do Unsplash sob a licença do Unsplash e são usadas como material de referência. Os textos, o design e o código são originais desta demonstração.',
            },
          ],
        },
      ]}
    />
  );
}
