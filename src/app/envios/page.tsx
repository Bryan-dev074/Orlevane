import type { Metadata } from 'next';
import Doc from '@/components/pages/doc';

export const metadata: Metadata = {
  title: 'Envíos y devoluciones',
  description: 'Plazos, costos, cambios de talla y devoluciones en ORLÉVANE.',
  alternates: { canonical: '/envios' },
};

export default function Page() {
  return (
    <Doc
      updated="07 / 2026"
      kicker={{ es: 'Ayuda', pt: 'Ajuda' }}
      title={{ es: 'Envíos y devoluciones', pt: 'Entregas e devoluções' }}
      intro={{
        es: 'Lo que tarda, lo que cuesta y qué pasa si la talla no era. Todo lo de esta página es de demostración: no hay logística real detrás.',
        pt: 'O que demora, o que custa e o que acontece se a numeração não era essa. Tudo nesta página é demonstração: não há logística real por trás.',
      }}
      sections={[
        {
          h: { es: 'Plazos', pt: 'Prazos' },
          p: [
            {
              es: 'Paraguay: 24 a 72 horas hábiles desde que el pedido queda confirmado. Dentro de Asunción, con envío express, sale el mismo día si el pedido entra antes de las 14:00.',
              pt: 'Paraguai: 24 a 72 horas úteis desde que o pedido é confirmado. Dentro de Assunção, com entrega expressa, sai no mesmo dia se o pedido entrar antes das 14:00.',
            },
            {
              es: 'Brasil: 5 a 9 días hábiles, con despacho aduanero incluido. El express llega en 48 horas a capitales.',
              pt: 'Brasil: 5 a 9 dias úteis, com despacho aduaneiro incluído. O expresso chega em 48 horas às capitais.',
            },
            {
              es: 'Las piezas de la serie Ñandutí y los pares a medida se despachan cuando terminan sus catorce días de horma; en esos casos el plazo se avisa al confirmar.',
              pt: 'As peças da série Ñandutí e os pares sob medida saem quando terminam os catorze dias de fôrma; nesses casos o prazo é avisado na confirmação.',
            },
          ],
        },
        {
          h: { es: 'Costos', pt: 'Custos' },
          p: [
            {
              es: 'Envío estándar: Gs. 45.000, bonificado a partir de Gs. 2.500.000. Envío express: Gs. 120.000, sin bonificación. Retiro en boutique: sin costo, disponible desde las 48 horas.',
              pt: 'Entrega padrão: Gs. 45.000, cortesia a partir de Gs. 2.500.000. Entrega expressa: Gs. 120.000, sem cortesia. Retirada na boutique: sem custo, disponível a partir de 48 horas.',
            },
            {
              es: 'Los precios en reales se calculan con una tasa fija de demostración de 1.400 guaraníes por real y se redondean.',
              pt: 'Os preços em reais são calculados com uma taxa fixa de demonstração de 1.400 guaranis por real e são arredondados.',
            },
          ],
        },
        {
          h: { es: 'Cambios de talla', pt: 'Troca de numeração' },
          p: [
            {
              es: 'El primer cambio de talla lo paga la casa, dentro de los treinta días y con el par sin usar en calle. Se cambia por la misma referencia en otra talla; si no hay stock, se ofrece nota de crédito o reembolso.',
              pt: 'A primeira troca de numeração é por conta da casa, dentro de trinta dias e com o par sem uso na rua. Troca-se pela mesma referência em outra numeração; se não houver estoque, oferecemos crédito ou reembolso.',
            },
            {
              es: 'Probate el par sobre alfombra. Una suela de cuero marcada por el asfalto ya no vuelve.',
              pt: 'Experimente o par sobre carpete. Uma sola de couro marcada pelo asfalto já não volta.',
            },
          ],
        },
        {
          h: { es: 'Devoluciones', pt: 'Devoluções' },
          p: [
            {
              es: 'Treinta días desde la entrega, con la caja original, la bolsa de algodón y la horma. El reembolso vuelve por el mismo medio de pago dentro de los diez días hábiles siguientes a que el par llega al taller.',
              pt: 'Trinta dias desde a entrega, com a caixa original, o saco de algodão e a fôrma. O reembolso volta pelo mesmo meio de pagamento em até dez dias úteis após o par chegar à oficina.',
            },
            {
              es: 'Las piezas a medida y las numeradas de la serie Ñandutí no tienen devolución por arrepentimiento, porque se montan sobre una horma que no vuelve a usarse.',
              pt: 'As peças sob medida e as numeradas da série Ñandutí não têm devolução por arrependimento, porque são montadas em uma fôrma que não volta a ser usada.',
            },
          ],
        },
        {
          h: { es: 'Garantía y reparación', pt: 'Garantia e conserto' },
          p: [
            {
              es: 'Dos años sobre defectos de fabricación: costura, montado, herrajes. El desgaste normal de suela y taco no entra, pero se repara en el taller a precio de costo mientras exista la horma, que es siempre.',
              pt: 'Dois anos sobre defeitos de fabricação: costura, montagem, metais. O desgaste normal de sola e salto não entra, mas conserta-se na oficina a preço de custo enquanto existir a fôrma, o que é sempre.',
            },
          ],
        },
      ]}
    />
  );
}
