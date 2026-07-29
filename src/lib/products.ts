import type { Category, ColorWay, Family, L10n, Product } from './types';

/* ──────────────────────────────────────────────────────────────────────────
   Catálogo ORLÉVANE — 36 referencias.

   TODO EL CONTENIDO COMERCIAL ES SINTÉTICO: precios, stock, series, hormas,
   curtidos, valoraciones y reseñas están inventados para que la demostración
   se sostenga. Reemplazar por datos reales antes de cualquier uso comercial.
   ────────────────────────────────────────────────────────────────────────── */

const W_SIZES = [35, 36, 37, 38, 39, 40, 41];
const M_SIZES = [39, 40, 41, 42, 43, 44, 45];
const BELT_SIZES = [85, 90, 95, 100, 105];

/** Hash estable: el stock tiene que ser idéntico en servidor y navegador. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Stock verosímil: las tallas del medio abundan, las de los extremos escasean. */
function mkStock(slug: string, sizes: number[]): Record<number, number> {
  if (sizes.length === 0) return { 0: 4 + (hash(slug) % 9) };
  const out: Record<number, number> = {};
  const mid = (sizes.length - 1) / 2;
  sizes.forEach((size, i) => {
    const edge = Math.abs(i - mid) / mid;
    const seed = hash(`${slug}:${size}`) % 100;
    let n = Math.round((1 - edge) * 6 + (seed % 4));
    if (seed < 9) n = 0;
    else if (seed < 20) n = 1;
    out[size] = Math.max(0, n);
  });
  // Una pieza sin ninguna talla disponible sería un error de catálogo, no una demo.
  if (sizes.every((s) => out[s] === 0)) out[sizes[Math.floor(mid)]] = 3;
  return out;
}

const C = {
  noirCharol: { id: 'noir-charol', name: { es: 'Negro charol', pt: 'Preto verniz' }, hex: '#14100E' },
  noirNapa: { id: 'noir-napa', name: { es: 'Negro napa', pt: 'Preto napa' }, hex: '#1B1714' },
  noirAnte: { id: 'noir-ante', name: { es: 'Negro ante', pt: 'Preto camurça' }, hex: '#232019' },
  marfil: { id: 'marfil', name: { es: 'Marfil', pt: 'Marfim' }, hex: '#EFE6D6' },
  blanco: { id: 'blanco', name: { es: 'Blanco tiza', pt: 'Branco giz' }, hex: '#F7F4EE' },
  crema: { id: 'crema', name: { es: 'Crema', pt: 'Creme' }, hex: '#E4DAC6' },
  arena: { id: 'arena', name: { es: 'Arena', pt: 'Areia' }, hex: '#C8B394' },
  rose: { id: 'rose', name: { es: 'Rosé pálido', pt: 'Rosé pálido' }, hex: '#D9BCB1' },
  bordo: { id: 'bordo', name: { es: 'Bordó profundo', pt: 'Bordô profundo' }, hex: '#721F2B' },
  cognac: { id: 'cognac', name: { es: 'Coñac', pt: 'Conhaque' }, hex: '#8A5A2B' },
  castano: { id: 'castano', name: { es: 'Castaño', pt: 'Castanho' }, hex: '#5C3A22' },
  leonado: { id: 'leonado', name: { es: 'Leonado', pt: 'Fulvo' }, hex: '#A9713C' },
  avellana: { id: 'avellana', name: { es: 'Avellana', pt: 'Avelã' }, hex: '#B0824F' },
  oliva: { id: 'oliva', name: { es: 'Ante oliva', pt: 'Camurça oliva' }, hex: '#5A5B44' },
  humo: { id: 'humo', name: { es: 'Gris humo', pt: 'Cinza fumo' }, hex: '#8D8982' },
  tabaco: { id: 'tabaco', name: { es: 'Tabaco', pt: 'Tabaco' }, hex: '#6B4A2E' },
} satisfies Record<string, ColorWay>;

const CARE: Record<Family, L10n> = {
  escarpin: {
    es: 'Guardá el par con su horma de cedro y en la bolsa de algodón. El charol se limpia con paño seco; nunca con alcohol. Si se moja, secalo a temperatura ambiente, lejos de la estufa.',
    pt: 'Guarde o par com a fôrma de cedro e no saco de algodão. O verniz limpa-se com pano seco; nunca com álcool. Se molhar, seque à temperatura ambiente, longe do aquecedor.',
  },
  sandalia: {
    es: 'Pasá un paño apenas húmedo por las tiras después de cada uso. El cuero de la plantilla toma el color del pie con el tiempo: es normal y no se corrige.',
    pt: 'Passe um pano levemente úmido nas tiras depois de cada uso. O couro da palmilha toma a cor do pé com o tempo: é normal e não se corrige.',
  },
  bailarina: {
    es: 'Cepillá en seco siguiendo el sentido de la flor del cuero. La suela fina se repone en el taller una vez por año si el uso es diario.',
    pt: 'Escove a seco no sentido da flor do couro. A sola fina é reposta na oficina uma vez por ano se o uso for diário.',
  },
  bota: {
    es: 'Hormá la bota apenas te la sacás, todavía tibia. Crema neutra cada diez usos y grasa de caballo antes del invierno. El ante, sólo cepillo de crepé.',
    pt: 'Coloque a fôrma assim que tirar a bota, ainda morna. Creme neutro a cada dez usos e graxa antes do inverno. A camurça, só escova de crepe.',
  },
  mocasin: {
    es: 'Alterná el par: el cuero necesita un día para soltar la humedad. Crema del tono cada quince usos, lustre con cepillo de crin y paño de algodón.',
    pt: 'Alterne o par: o couro precisa de um dia para soltar a umidade. Creme do tom a cada quinze usos, lustro com escova de crina e pano de algodão.',
  },
  oxford: {
    es: 'Cepillá antes de guardar y hormá siempre. Cada quince usos, crema nutritiva; cada cincuenta, cera en capas finas sobre la puntera. La suela cosida se cambia sin desarmar el zapato.',
    pt: 'Escove antes de guardar e use sempre a fôrma. A cada quinze usos, creme nutritivo; a cada cinquenta, cera em camadas finas na biqueira. A sola costurada troca-se sem desmontar o sapato.',
  },
  sneaker: {
    es: 'Napa blanca: paño húmedo con jabón neutro, nunca lavarropas. Los cordones salen y se lavan aparte. Secar a la sombra.',
    pt: 'Napa branca: pano úmido com sabão neutro, nunca na máquina. Os cadarços saem e lavam-se à parte. Secar à sombra.',
  },
  cinturon: {
    es: 'Enrollado, nunca colgado del gancho: la hebilla marca el cuero. Crema neutra dos veces al año.',
    pt: 'Enrolado, nunca pendurado no gancho: a fivela marca o couro. Creme neutro duas vezes ao ano.',
  },
  bolso: {
    es: 'Guardalo relleno con papel sin tinta y dentro de su bolsa. El curtido vegetal se oscurece con la luz: es la pátina, no un defecto.',
    pt: 'Guarde-a preenchida com papel sem tinta e dentro do saco. O curtimento vegetal escurece com a luz: é a pátina, não um defeito.',
  },
  marroquineria: {
    es: 'El cuero se aceita solo con el uso. Si se reseca, una pasada mínima de crema neutra y veinticuatro horas de reposo.',
    pt: 'O couro se oleia sozinho com o uso. Se ressecar, uma passada mínima de creme neutro e vinte e quatro horas de descanso.',
  },
  cuidado: {
    es: 'Cerrá bien los potes y guardá el estuche lejos del calor. Los cepillos se limpian golpeándolos entre sí, en seco.',
    pt: 'Feche bem os potes e guarde o estojo longe do calor. As escovas limpam-se batendo uma na outra, a seco.',
  },
};

const TANNERY = {
  chaco: { es: 'Vegetal al quebracho · Chaco', pt: 'Vegetal ao quebracho · Chaco' },
  charol: { es: 'Charol italiano · Toscana', pt: 'Verniz italiano · Toscana' },
  ante: { es: 'Ante de becerro · Chaco', pt: 'Camurça de vitelo · Chaco' },
  napa: { es: 'Napa de cordero · Concepción', pt: 'Napa de cordeiro · Concepción' },
  raso: { es: 'Raso de seda · Itauguá', pt: 'Cetim de seda · Itauguá' },
} satisfies Record<string, L10n>;

type Seed = {
  slug: string;
  name: string;
  family: Family;
  category: Category;
  kind: L10n;
  pricePYG: number;
  comparePYG?: number;
  color: ColorWay;
  tannery: L10n;
  heelMm?: number;
  weightG?: number;
  badge?: Product['badge'];
  featured?: boolean;
  serial: string;
  last: string;
  intro: L10n;
  story: L10n;
  rating: number;
  reviews: number;
  siblings?: string[];
  specs?: Array<{ k: L10n; v: L10n }>;
};

const SPEC = {
  montado: { es: 'Montado', pt: 'Montagem' },
  suela: { es: 'Suela', pt: 'Sola' },
  forro: { es: 'Forro', pt: 'Forro' },
  plantilla: { es: 'Plantilla', pt: 'Palmilha' },
  taco: { es: 'Taco', pt: 'Salto' },
  cierre: { es: 'Cierre', pt: 'Fecho' },
  herraje: { es: 'Herraje', pt: 'Metais' },
  medidas: { es: 'Medidas', pt: 'Medidas' },
  capacidad: { es: 'Capacidad', pt: 'Capacidade' },
  contenido: { es: 'Contenido', pt: 'Conteúdo' },
  ancho: { es: 'Ancho', pt: 'Largura' },
  origen: { es: 'Origen', pt: 'Origem' },
} satisfies Record<string, L10n>;

const V = {
  goodyear: { es: 'Cosido Goodyear a mano', pt: 'Costura Goodyear à mão' },
  blake: { es: 'Cosido Blake', pt: 'Costura Blake' },
  cueroSuela: { es: 'Cuero de suela, 5 mm', pt: 'Couro de sola, 5 mm' },
  gomaSuela: { es: 'Goma vulcanizada, 8 mm', pt: 'Borracha vulcanizada, 8 mm' },
  cabritilla: { es: 'Cabritilla natural', pt: 'Pelica natural' },
  vacunoForro: { es: 'Vacuno curtido vegetal', pt: 'Bovino curtido vegetal' },
  latonPulido: { es: 'Latón pulido a mano', pt: 'Latão polido à mão' },
  paraguay: { es: 'Paraguay', pt: 'Paraguai' },
} satisfies Record<string, L10n>;

const SEEDS: Seed[] = [
  /* ── MUJER ─────────────────────────────────────────────────────────── */
  {
    slug: 'vesper',
    name: 'Vesper',
    family: 'escarpin',
    category: 'mujer',
    kind: { es: 'Escarpín de charol', pt: 'Scarpin de verniz' },
    pricePYG: 2290000,
    color: C.noirCharol,
    tannery: TANNERY.charol,
    heelMm: 95,
    weightG: 290,
    featured: true,
    serial: 'N.º 004 / 220',
    last: 'H-072',
    rating: 4.8,
    reviews: 63,
    siblings: ['aurore', 'nocturne'],
    intro: {
      es: 'La punta larga de la casa sobre un taco de 95 que no se siente. Es el par que más volvemos a montar.',
      pt: 'A bica longa da casa sobre um salto de 95 que não se sente. É o par que mais voltamos a montar.',
    },
    story: {
      es: 'El Vesper nació de una horma napolitana de 1971 que corregimos tres veces hasta que el empeine dejó de morder. Charol italiano sobre forro de cabritilla, cosido Blake para que el zapato quede fino de perfil. El taco lleva alma de acero: por eso aguanta el asfalto sin torcerse.',
      pt: 'O Vesper nasceu de uma fôrma napolitana de 1971 que corrigimos três vezes até o peito do pé parar de morder. Verniz italiano sobre forro de pelica, costura Blake para o sapato ficar fino de perfil. O salto leva alma de aço: por isso aguenta o asfalto sem torcer.',
    },
  },
  {
    slug: 'aurore',
    name: 'Aurore',
    family: 'escarpin',
    category: 'mujer',
    kind: { es: 'Escarpín de napa', pt: 'Scarpin de napa' },
    pricePYG: 2150000,
    color: C.marfil,
    tannery: TANNERY.napa,
    heelMm: 85,
    weightG: 275,
    featured: true,
    serial: 'N.º 011 / 180',
    last: 'H-072',
    rating: 4.7,
    reviews: 41,
    siblings: ['vesper', 'nocturne'],
    intro: {
      es: 'El mismo cuerpo del Vesper en napa marfil y taco 85. Se pide para casamientos y termina usándose todo el año.',
      pt: 'O mesmo corpo do Vesper em napa marfim e salto 85. Pede-se para casamento e acaba usado o ano inteiro.',
    },
    story: {
      es: 'Napa de cordero teñida en cuatro capas hasta llegar al marfil cálido de la casa, que no es blanco ni beige. Al ser un tono claro, cada par se corta de una sola piel: dos pieles distintas nunca dan exactamente el mismo marfil.',
      pt: 'Napa de cordeiro tingida em quatro camadas até chegar ao marfim quente da casa, que não é branco nem bege. Por ser um tom claro, cada par é cortado de uma só pele: duas peles diferentes nunca dão exatamente o mesmo marfim.',
    },
  },
  {
    slug: 'nocturne',
    name: 'Nocturne',
    family: 'escarpin',
    category: 'mujer',
    kind: { es: 'Escarpín de ante', pt: 'Scarpin de camurça' },
    pricePYG: 2450000,
    comparePYG: 2890000,
    color: C.noirAnte,
    tannery: TANNERY.ante,
    heelMm: 90,
    weightG: 280,
    serial: 'N.º 002 / 140',
    last: 'H-081',
    rating: 4.6,
    reviews: 28,
    siblings: ['vesper', 'aurore'],
    intro: {
      es: 'Ante negro de pelo corto, escote profundo. Ajuste de fin de temporada: quedan las tallas del medio.',
      pt: 'Camurça preta de pelo curto, decote profundo. Ajuste de fim de temporada: restam as numerações do meio.',
    },
    story: {
      es: 'El escote del Nocturne baja dos milímetros más que el del Vesper, lo suficiente para alargar el pie sin que el zapato se salga al caminar. El ante se cepilla contra el pelo antes de salir del taller; por eso llega con ese gris azulado en vez del negro plano.',
      pt: 'O decote do Nocturne desce dois milímetros a mais que o do Vesper, o suficiente para alongar o pé sem o sapato sair ao caminhar. A camurça é escovada contra o pelo antes de sair da oficina; por isso chega com esse cinza azulado em vez do preto chapado.',
    },
  },
  {
    slug: 'sanguine',
    name: 'Sanguine',
    family: 'sandalia',
    category: 'mujer',
    kind: { es: 'Sandalia de tiras', pt: 'Sandália de tiras' },
    pricePYG: 2290000,
    color: C.bordo,
    tannery: TANNERY.ante,
    heelMm: 100,
    weightG: 260,
    badge: 'nuevo',
    featured: true,
    serial: 'N.º 001 / 90',
    last: 'H-114',
    rating: 4.9,
    reviews: 17,
    intro: {
      es: 'Nueve tiras de ante bordó sobre una plantilla acolchada. El taco más alto que hacemos y el más caminable.',
      pt: 'Nove tiras de camurça bordô sobre uma palmilha acolchoada. O salto mais alto que fazemos e o mais caminhável.',
    },
    story: {
      es: 'Todo el peso cae sobre una plantilla de cuero rellena de látex de tres milímetros, así que el taco de 100 se comporta como uno de 80. Las tiras se cortan al bies para que se estiren con el pie y no con el uso.',
      pt: 'Todo o peso cai numa palmilha de couro com látex de três milímetros, então o salto de 100 se comporta como um de 80. As tiras são cortadas no viés para esticarem com o pé e não com o uso.',
    },
  },
  {
    slug: 'lumiere',
    name: 'Lumière',
    family: 'sandalia',
    category: 'mujer',
    kind: { es: 'Sandalia de cuero', pt: 'Sandália de couro' },
    pricePYG: 1990000,
    color: C.cognac,
    tannery: TANNERY.chaco,
    heelMm: 75,
    weightG: 250,
    serial: 'N.º 018 / 160',
    last: 'H-108',
    rating: 4.5,
    reviews: 34,
    intro: {
      es: 'Taco medio, empeine cruzado y hebilla de latón. La sandalia que sobrevive a un día entero de pie.',
      pt: 'Salto médio, peito cruzado e fivela de latão. A sandália que sobrevive a um dia inteiro em pé.',
    },
    story: {
      es: 'Cuero del Chaco curtido al quebracho, que empieza tostado y termina en un coñac oscuro después de dos veranos. La hebilla es de latón macizo pulido a mano; se opaca y se vuelve a lustrar, no se descascara.',
      pt: 'Couro do Chaco curtido ao quebracho, que começa tostado e termina num conhaque escuro depois de dois verões. A fivela é de latão maciço polido à mão; opaca e volta a lustrar, não descasca.',
    },
  },
  {
    slug: 'blanche',
    name: 'Blanche',
    family: 'sandalia',
    category: 'mujer',
    kind: { es: 'Sandalia de napa', pt: 'Sandália de napa' },
    pricePYG: 1890000,
    color: C.blanco,
    tannery: TANNERY.napa,
    heelMm: 80,
    weightG: 245,
    serial: 'N.º 007 / 120',
    last: 'H-108',
    rating: 4.4,
    reviews: 22,
    intro: {
      es: 'Tira al tobillo, puntera cuadrada, blanco tiza. Se ensucia y se limpia; para eso va con su kit.',
      pt: 'Tira no tornozelo, bico quadrado, branco giz. Suja e limpa; por isso vai com o seu kit.',
    },
    story: {
      es: 'El blanco tiza es el tono más difícil del taller: cualquier resto de tinte en la mesa lo arruina, así que se cortan siempre a primera hora, con las cuchillas recién limpias. Sale del taller con un frasco de limpiador neutro adentro de la caja.',
      pt: 'O branco giz é o tom mais difícil da oficina: qualquer resto de tinta na mesa o estraga, então cortam-se sempre logo cedo, com as facas recém-limpas. Sai da oficina com um frasco de limpador neutro dentro da caixa.',
    },
  },
  {
    slug: 'cadence',
    name: 'Cadence',
    family: 'sandalia',
    category: 'mujer',
    kind: { es: 'Mule de ante', pt: 'Mule de camurça' },
    pricePYG: 1790000,
    color: C.arena,
    tannery: TANNERY.ante,
    heelMm: 60,
    weightG: 230,
    serial: 'N.º 026 / 200',
    last: 'H-095',
    rating: 4.6,
    reviews: 51,
    intro: {
      es: 'Mule de taco bajo en ante arena. Se pone sin manos y no se sale al caminar, que es todo el truco.',
      pt: 'Mule de salto baixo em camurça areia. Calça sem as mãos e não sai ao caminhar, que é todo o truque.',
    },
    story: {
      es: 'La pala tiene una curva interna de siete milímetros que agarra el empeine sin apretar. Es el detalle que separa un mule que se queda de uno que se arrastra, y es la razón por la que este modelo lleva su propia horma.',
      pt: 'A pala tem uma curva interna de sete milímetros que segura o peito do pé sem apertar. É o detalhe que separa um mule que fica de um que se arrasta, e é a razão de este modelo ter fôrma própria.',
    },
  },
  {
    slug: 'solene',
    name: 'Solène',
    family: 'bailarina',
    category: 'mujer',
    kind: { es: 'Bailarina de napa', pt: 'Sapatilha de napa' },
    pricePYG: 1590000,
    color: C.noirNapa,
    tannery: TANNERY.napa,
    weightG: 190,
    featured: true,
    serial: 'N.º 031 / 320',
    last: 'H-060',
    rating: 4.8,
    reviews: 88,
    siblings: ['seraphine'],
    intro: {
      es: 'Napa negra, suela de cuero de tres milímetros, sin forro para que apoye como una media.',
      pt: 'Napa preta, sola de couro de três milímetros, sem forro para apoiar como uma meia.',
    },
    story: {
      es: 'Sin forro y con el ribete cosido a mano, la Solène pesa 190 gramos y se dobla entera para entrar en un bolso. Es la pieza que más reponemos y la que más vuelve al taller a cambiar suela, que es exactamente lo que queríamos.',
      pt: 'Sem forro e com o debrum costurado à mão, a Solène pesa 190 gramas e dobra inteira para caber numa bolsa. É a peça que mais repomos e a que mais volta à oficina para trocar sola, que é exatamente o que queríamos.',
    },
  },
  {
    slug: 'seraphine',
    name: 'Séraphine',
    family: 'bailarina',
    category: 'mujer',
    kind: { es: 'Bailarina de raso, serie Ñandutí', pt: 'Sapatilha de cetim, série Ñandutí' },
    pricePYG: 1790000,
    color: C.rose,
    tannery: TANNERY.raso,
    weightG: 185,
    badge: 'nanduti',
    featured: true,
    serial: 'Ñ-014 / 80',
    last: 'H-060',
    rating: 4.9,
    reviews: 19,
    siblings: ['solene'],
    intro: {
      es: 'Raso de seda con el calado del ñandutí abierto a mano sobre la pala. Ochenta pares y no se repone.',
      pt: 'Cetim de seda com o vazado do ñandutí aberto à mão na pala. Oitenta pares e não se repõe.',
    },
    story: {
      es: 'El patrón sale del ñandutí de Itauguá, el encaje radial que se teje sobre bastidor. Lo cala a mano la misma tejedora que nos enseñó el punto, con punzón, sobre el raso ya montado. Cada par lleva su número bordado en bordó bajo la plantilla.',
      pt: 'O padrão vem do ñandutí de Itauguá, a renda radial tecida em bastidor. Quem vaza à mão é a mesma rendeira que nos ensinou o ponto, com punção, sobre o cetim já montado. Cada par leva o seu número bordado em bordô sob a palmilha.',
    },
  },
  {
    slug: 'mireille',
    name: 'Mireille',
    family: 'bota',
    category: 'mujer',
    kind: { es: 'Bota alta de becerro', pt: 'Bota alta de vitelo' },
    pricePYG: 3950000,
    color: C.noirNapa,
    tannery: TANNERY.chaco,
    heelMm: 45,
    weightG: 720,
    featured: true,
    serial: 'N.º 003 / 70',
    last: 'H-140',
    rating: 4.7,
    reviews: 24,
    intro: {
      es: 'Caña alta de becerro negro que se para sola. Sin cierre: entra por elasticidad del cuero.',
      pt: 'Cano alto de vitelo preto que fica em pé sozinho. Sem zíper: entra pela elasticidade do couro.',
    },
    story: {
      es: 'La caña se monta sobre una horma de pantorrilla de 38 centímetros y se deja veintiún días, una semana más que el resto, porque el cuero de la caña tarda en asentar. Al no llevar cierre no hay costura que ceda: la bota envejece entera o no envejece.',
      pt: 'O cano é montado numa fôrma de panturrilha de 38 centímetros e fica vinte e um dias, uma semana a mais que o resto, porque o couro do cano demora a assentar. Sem zíper não há costura que ceda: a bota envelhece inteira ou não envelhece.',
    },
  },
  {
    slug: 'verona',
    name: 'Verona',
    family: 'bota',
    category: 'mujer',
    kind: { es: 'Botín de napa', pt: 'Botinha de napa' },
    pricePYG: 2890000,
    color: C.rose,
    tannery: TANNERY.napa,
    heelMm: 70,
    weightG: 420,
    serial: 'N.º 009 / 110',
    last: 'H-126',
    rating: 4.5,
    reviews: 37,
    intro: {
      es: 'Botín al tobillo en napa rosé, cierre lateral oculto y taco cubierto en el mismo cuero.',
      pt: 'Botinha no tornozelo em napa rosé, zíper lateral oculto e salto revestido no mesmo couro.',
    },
    story: {
      es: 'El rosé de la casa se logra tiñendo napa marfil con tres pasadas de anilina rojiza; nunca sale dos veces igual, y ese es el punto. El cierre va cosido por dentro del forro para que la línea del tobillo quede limpia de perfil.',
      pt: 'O rosé da casa sai tingindo napa marfim com três passadas de anilina avermelhada; nunca sai duas vezes igual, e é esse o ponto. O zíper vai costurado por dentro do forro para a linha do tornozelo ficar limpa de perfil.',
    },
  },
  {
    slug: 'fauve',
    name: 'Fauve',
    family: 'bota',
    category: 'mujer',
    kind: { es: 'Botín de cuero', pt: 'Botinha de couro' },
    pricePYG: 2950000,
    color: C.leonado,
    tannery: TANNERY.chaco,
    heelMm: 55,
    weightG: 450,
    serial: 'N.º 021 / 130',
    last: 'H-126',
    rating: 4.6,
    reviews: 45,
    intro: {
      es: 'Cuero leonado curtido al quebracho, suela de cuero cosida. Se compra claro y termina oscuro.',
      pt: 'Couro fulvo curtido ao quebracho, sola de couro costurada. Compra-se claro e termina escuro.',
    },
    story: {
      es: 'Sale del taller casi anaranjado. A los seis meses es coñac, al año y medio es castaño. No lo tratamos con nada que frene esa marcha: la pátina es lo que estás comprando.',
      pt: 'Sai da oficina quase alaranjado. Aos seis meses é conhaque, ao ano e meio é castanho. Não tratamos com nada que trave essa marcha: a pátina é o que você está comprando.',
    },
  },
  {
    slug: 'rebelle',
    name: 'Rebelle',
    family: 'bota',
    category: 'mujer',
    kind: { es: 'Botín acordonado', pt: 'Botinha com cadarço' },
    pricePYG: 3150000,
    color: C.noirNapa,
    tannery: TANNERY.chaco,
    heelMm: 40,
    weightG: 540,
    badge: 'nuevo',
    serial: 'N.º 001 / 100',
    last: 'H-133',
    rating: 4.7,
    reviews: 12,
    intro: {
      es: 'Ocho pares de ojales, suela de goma con dibujo y puntera reforzada. Para el invierno de verdad.',
      pt: 'Oito pares de ilhoses, sola de borracha com desenho e biqueira reforçada. Para o inverno de verdade.',
    },
    story: {
      es: 'Es el único modelo de la casa con suela de goma vulcanizada, porque nos cansamos de decirle a la gente que no saliera con cuero bajo la lluvia. Los ojales son de latón sin barnizar: se opacan y quedan mejor.',
      pt: 'É o único modelo da casa com sola de borracha vulcanizada, porque cansamos de dizer para não sair com couro na chuva. Os ilhoses são de latão sem verniz: opacam e ficam melhores.',
    },
  },

  /* ── HOMBRE ────────────────────────────────────────────────────────── */
  {
    slug: 'ravel',
    name: 'Ravel',
    family: 'oxford',
    category: 'hombre',
    kind: { es: 'Oxford grabado', pt: 'Oxford trabalhado' },
    pricePYG: 3290000,
    color: C.cognac,
    tannery: TANNERY.chaco,
    weightG: 780,
    featured: true,
    serial: 'N.º 002 / 60',
    last: 'H-201',
    rating: 4.9,
    reviews: 31,
    intro: {
      es: 'Oxford cerrado con el grabado floral repujado a mano sobre la pala. Sesenta pares por año.',
      pt: 'Oxford fechado com o trabalho floral repuxado à mão na pala. Sessenta pares por ano.',
    },
    story: {
      es: 'El repujado se hace con matriz de bronce sobre cuero húmedo, pieza por pieza, antes del montado. Una pala mal golpeada se descarta: no hay forma de corregirla. De ahí que el modelo tenga un tope de sesenta pares y una lista de espera.',
      pt: 'O repuxo é feito com matriz de bronze sobre couro úmido, peça por peça, antes da montagem. Uma pala mal batida é descartada: não há como corrigir. Daí o modelo ter teto de sessenta pares e uma lista de espera.',
    },
  },
  {
    slug: 'montaigne',
    name: 'Montaigne',
    family: 'oxford',
    category: 'hombre',
    kind: { es: 'Derby de becerro', pt: 'Derby de vitelo' },
    pricePYG: 2950000,
    color: C.castano,
    tannery: TANNERY.chaco,
    weightG: 760,
    featured: true,
    serial: 'N.º 014 / 240',
    last: 'H-188',
    rating: 4.8,
    reviews: 76,
    siblings: ['sartor', 'meridien'],
    intro: {
      es: 'Derby de cinco ojales sobre horma ancha. El zapato de todos los días de la casa.',
      pt: 'Derby de cinco ilhoses em fôrma larga. O sapato de todo dia da casa.',
    },
    story: {
      es: 'Horma 188, la más ancha del taller, pensada para el pie que se hincha a media tarde. Cosido Goodyear, así que la suela se cambia cuatro o cinco veces antes de que el corte se rinda. Es el modelo que más vuelve para resuelas y el que menos vuelve por defectos.',
      pt: 'Fôrma 188, a mais larga da oficina, pensada para o pé que incha no meio da tarde. Costura Goodyear, então a sola troca-se quatro ou cinco vezes antes de o cabedal se render. É o modelo que mais volta para solado e o que menos volta por defeito.',
    },
  },
  {
    slug: 'bristol',
    name: 'Bristol',
    family: 'oxford',
    category: 'hombre',
    kind: { es: 'Brogue de cuero', pt: 'Brogue de couro' },
    pricePYG: 3150000,
    color: C.avellana,
    tannery: TANNERY.chaco,
    weightG: 800,
    serial: 'N.º 006 / 150',
    last: 'H-201',
    rating: 4.7,
    reviews: 42,
    intro: {
      es: 'Puntera de ala completa, picado en tres calibres. Avellana con la puntera lustrada más oscura.',
      pt: 'Biqueira de asa completa, picotado em três calibres. Avelã com a biqueira lustrada mais escura.',
    },
    story: {
      es: 'El picado se hace con tres punzones distintos para que el dibujo tenga jerarquía y no parezca estampado. La puntera se lustra ocho tonos más oscura a mano, con cera y agua, hasta que refleja: eso lleva cuarenta minutos por par y no se puede acelerar.',
      pt: 'O picotado é feito com três punções diferentes para o desenho ter hierarquia e não parecer estampa. A biqueira é lustrada oito tons mais escura à mão, com cera e água, até refletir: isso leva quarenta minutos por par e não dá para acelerar.',
    },
  },
  {
    slug: 'havana',
    name: 'Havana',
    family: 'mocasin',
    category: 'hombre',
    kind: { es: 'Mocasín penny', pt: 'Mocassim penny' },
    pricePYG: 2590000,
    color: C.cognac,
    tannery: TANNERY.chaco,
    weightG: 620,
    featured: true,
    serial: 'N.º 022 / 260',
    last: 'H-176',
    rating: 4.8,
    reviews: 94,
    siblings: ['onyx', 'etrier'],
    intro: {
      es: 'Penny clásico de antifaz cosido a mano, en coñac. Sin forro en la pala para que ceda al pie.',
      pt: 'Penny clássico de máscara costurada à mão, em conhaque. Sem forro na pala para ceder ao pé.',
    },
    story: {
      es: 'El antifaz se cose a mano con hilo encerado de lino, punto por punto, y ese es el único punto del zapato que no puede hacer una máquina sin que se note. La pala va sin forro: los primeros diez días aprieta, después es tuyo.',
      pt: 'A máscara é costurada à mão com linha encerada de linho, ponto por ponto, e esse é o único ponto do sapato que uma máquina não faz sem se notar. A pala vai sem forro: nos primeiros dez dias aperta, depois é seu.',
    },
  },
  {
    slug: 'onyx',
    name: 'Onyx',
    family: 'mocasin',
    category: 'hombre',
    kind: { es: 'Mocasín de charol', pt: 'Mocassim de verniz' },
    pricePYG: 2750000,
    color: C.noirCharol,
    tannery: TANNERY.charol,
    weightG: 610,
    serial: 'N.º 005 / 90',
    last: 'H-176',
    rating: 4.6,
    reviews: 29,
    siblings: ['havana', 'etrier'],
    intro: {
      es: 'El mismo mocasín en charol negro y suela fina. Para la noche, y para el que no quiere atarse nada.',
      pt: 'O mesmo mocassim em verniz preto e sola fina. Para a noite, e para quem não quer amarrar nada.',
    },
    story: {
      es: 'Charol italiano sobre horma 176, con suela Blake de tres milímetros para que el zapato quede plano contra el pantalón. Es el único par de la casa que pedimos que no salga con lluvia: el charol se marca y no vuelve.',
      pt: 'Verniz italiano na fôrma 176, com sola Blake de três milímetros para o sapato ficar plano contra a calça. É o único par da casa que pedimos para não sair na chuva: o verniz marca e não volta.',
    },
  },
  {
    slug: 'etrier',
    name: 'Étrier',
    family: 'mocasin',
    category: 'hombre',
    kind: { es: 'Mocasín con brida', pt: 'Mocassim com fivela' },
    pricePYG: 2690000,
    color: C.cognac,
    tannery: TANNERY.chaco,
    weightG: 640,
    serial: 'N.º 017 / 170',
    last: 'H-176',
    rating: 4.7,
    reviews: 38,
    siblings: ['havana', 'onyx'],
    intro: {
      es: 'Brida de latón macizo sobre la pala. El herraje se lustra con el zapato, no se cambia nunca.',
      pt: 'Fivela de latão maciço na pala. O metal lustra-se com o sapato, não se troca nunca.',
    },
    story: {
      es: 'La brida es de latón macizo fundido en Luque, sin baño ni barniz. Se opaca en tres meses y ahí queda, con ese dorado apagado que no se consigue comprando la pieza dorada. Va remachada, no pegada.',
      pt: 'A fivela é de latão maciço fundido em Luque, sem banho nem verniz. Opaca em três meses e fica assim, com aquele dourado apagado que não se consegue comprando a peça já dourada. Vai rebitada, não colada.',
    },
  },
  {
    slug: 'vannerie',
    name: 'Vannerie',
    family: 'mocasin',
    category: 'hombre',
    kind: { es: 'Mocasín trenzado', pt: 'Mocassim trançado' },
    pricePYG: 2450000,
    color: C.tabaco,
    tannery: TANNERY.chaco,
    weightG: 590,
    badge: 'nuevo',
    serial: 'N.º 001 / 120',
    last: 'H-176',
    rating: 4.5,
    reviews: 9,
    intro: {
      es: 'Pala trenzada a mano con tiras de cuatro milímetros. Respira, que es todo lo que se le pide en enero.',
      pt: 'Pala trançada à mão com tiras de quatro milímetros. Respira, que é tudo o que se pede em janeiro.',
    },
    story: {
      es: 'Cincuenta y dos tiras cortadas de la misma piel y trenzadas sobre la horma, no antes: si se trenza plano y después se monta, el dibujo se abre en el empeine. Son dos horas y media de trenzado por par.',
      pt: 'Cinquenta e duas tiras cortadas da mesma pele e trançadas sobre a fôrma, não antes: se trançar no plano e montar depois, o desenho abre no peito do pé. São duas horas e meia de trançado por par.',
    },
  },
  {
    slug: 'vinci',
    name: 'Vinci',
    family: 'bota',
    category: 'hombre',
    kind: { es: 'Botín chelsea', pt: 'Botinha chelsea' },
    pricePYG: 3450000,
    color: C.castano,
    tannery: TANNERY.chaco,
    weightG: 820,
    featured: true,
    serial: 'N.º 008 / 140',
    last: 'H-193',
    rating: 4.9,
    reviews: 57,
    siblings: ['sierra'],
    intro: {
      es: 'Chelsea de becerro castaño con elástico italiano y tirador de cuero. Se pone de un movimiento.',
      pt: 'Chelsea de vitelo castanho com elástico italiano e puxador de couro. Calça num movimento.',
    },
    story: {
      es: 'El elástico es el punto débil de toda chelsea: el nuestro es italiano, de 42 milímetros, cosido en dos líneas y con refuerzo de cuero por dentro. Cuando cede a los cinco o seis años se cambia en el taller sin tocar el resto de la bota.',
      pt: 'O elástico é o ponto fraco de toda chelsea: o nosso é italiano, de 42 milímetros, costurado em duas linhas e com reforço de couro por dentro. Quando cede aos cinco ou seis anos, troca-se na oficina sem tocar no resto da bota.',
    },
  },
  {
    slug: 'sierra',
    name: 'Sierra',
    family: 'bota',
    category: 'hombre',
    kind: { es: 'Botín chelsea de ante', pt: 'Botinha chelsea de camurça' },
    pricePYG: 3290000,
    color: C.oliva,
    tannery: TANNERY.ante,
    weightG: 790,
    serial: 'N.º 012 / 120',
    last: 'H-193',
    rating: 4.6,
    reviews: 33,
    siblings: ['vinci'],
    intro: {
      es: 'La misma bota en ante oliva y suela de goma. Menos formal, más útil.',
      pt: 'A mesma bota em camurça oliva e sola de borracha. Menos formal, mais útil.',
    },
    story: {
      es: 'El ante oliva se tiñe en tambor durante ocho horas para que el color llegue al centro de la piel; así, cuando el pelo se raspa, abajo hay el mismo verde y no un beige. Suela de goma con dibujo bajo, que no hace ruido en piso duro.',
      pt: 'A camurça oliva é tingida em fulão por oito horas para a cor chegar ao centro da pele; assim, quando o pelo raspa, embaixo há o mesmo verde e não um bege. Sola de borracha com desenho baixo, que não faz barulho em piso duro.',
    },
  },
  {
    slug: 'meridien',
    name: 'Méridien',
    family: 'oxford',
    category: 'hombre',
    kind: { es: 'Derby de vestir', pt: 'Derby social' },
    pricePYG: 2890000,
    color: C.castano,
    tannery: TANNERY.chaco,
    weightG: 740,
    serial: 'N.º 019 / 200',
    last: 'H-188',
    rating: 4.5,
    reviews: 48,
    siblings: ['montaigne', 'sartor'],
    intro: {
      es: 'Derby liso, sin costura decorativa, con puntera espejada. Lo que se pone cuando el traje ya dice todo.',
      pt: 'Derby liso, sem costura decorativa, com biqueira espelhada. O que se calça quando o terno já diz tudo.',
    },
    story: {
      es: 'Sin picado, sin brogue, sin nada: toda la gracia está en que la pala se corta de una sola pieza y no hay costura que interrumpa el reflejo. Por eso se descarta más cuero por par que en cualquier otro modelo de la casa.',
      pt: 'Sem picotado, sem brogue, sem nada: toda a graça está na pala cortada de uma só peça, sem costura que interrompa o reflexo. Por isso descarta-se mais couro por par que em qualquer outro modelo da casa.',
    },
  },
  {
    slug: 'sartor',
    name: 'Sartor',
    family: 'oxford',
    category: 'hombre',
    kind: { es: 'Derby de becerro', pt: 'Derby de vitelo' },
    pricePYG: 2750000,
    comparePYG: 3190000,
    color: C.cognac,
    tannery: TANNERY.chaco,
    weightG: 730,
    serial: 'N.º 027 / 180',
    last: 'H-188',
    rating: 4.4,
    reviews: 61,
    siblings: ['montaigne', 'meridien'],
    intro: {
      es: 'Derby de tres ojales en coñac, suela de cuero. Ajuste de temporada mientras queden tallas.',
      pt: 'Derby de três ilhoses em conhaque, sola de couro. Ajuste de temporada enquanto houver numeração.',
    },
    story: {
      es: 'Es el Montaigne con dos ojales menos y la costura del talón corrida un centímetro: parece un detalle, y hace que el zapato entre con calcetín fino sin quedar flojo con calcetín de lana. Sale de catálogo en marzo.',
      pt: 'É o Montaigne com dois ilhoses a menos e a costura do calcanhar deslocada um centímetro: parece detalhe, e faz o sapato entrar com meia fina sem ficar folgado com meia de lã. Sai de catálogo em março.',
    },
  },
  {
    slug: 'atelier-blanc',
    name: 'Atelier Blanc',
    family: 'sneaker',
    category: 'hombre',
    kind: { es: 'Deportivo de napa', pt: 'Tênis de napa' },
    pricePYG: 2150000,
    color: C.blanco,
    tannery: TANNERY.napa,
    weightG: 480,
    featured: true,
    serial: 'N.º 010 / 300',
    last: 'H-155',
    rating: 4.7,
    reviews: 112,
    siblings: ['creme'],
    intro: {
      es: 'Napa blanca sobre suela de goma cosida, sin logo. Cuando se gasta, vuelve al taller.',
      pt: 'Napa branca sobre sola de borracha costurada, sem logo. Quando gasta, volta à oficina.',
    },
    story: {
      es: 'Es el único deportivo que conocemos con la suela cosida en vez de pegada, y eso es lo que permite cambiarla. Cuesta el doble de fabricar y dura cuatro veces más. Sin ninguna marca en el exterior: el número de serie va troquelado adentro del talón.',
      pt: 'É o único tênis que conhecemos com a sola costurada em vez de colada, e é isso que permite trocá-la. Custa o dobro para fabricar e dura quatro vezes mais. Sem nenhuma marca por fora: o número de série vai gravado dentro do calcanhar.',
    },
  },
  {
    slug: 'creme',
    name: 'Crème',
    family: 'sneaker',
    category: 'hombre',
    kind: { es: 'Deportivo de napa', pt: 'Tênis de napa' },
    pricePYG: 1990000,
    color: C.crema,
    tannery: TANNERY.napa,
    weightG: 470,
    serial: 'N.º 013 / 260',
    last: 'H-155',
    rating: 4.6,
    reviews: 67,
    siblings: ['atelier-blanc'],
    intro: {
      es: 'El Atelier Blanc en crema, con la lengüeta y el talón en ante del mismo tono.',
      pt: 'O Atelier Blanc em creme, com a língua e o calcanhar em camurça do mesmo tom.',
    },
    story: {
      es: 'El crema aguanta mejor el uso diario que el blanco: no marca los pliegues del empeine. Mismo armado, misma suela cosida, mismo taller. Es el que recomendamos si es tu primer par de la casa.',
      pt: 'O creme aguenta melhor o uso diário que o branco: não marca as dobras do peito do pé. Mesma montagem, mesma sola costurada, mesma oficina. É o que recomendamos se for seu primeiro par da casa.',
    },
  },

  /* ── ACCESORIOS ────────────────────────────────────────────────────── */
  {
    slug: 'sillar',
    name: 'Sillar',
    family: 'cinturon',
    category: 'accesorios',
    kind: { es: 'Cinturón de ante', pt: 'Cinto de camurça' },
    pricePYG: 790000,
    color: C.oliva,
    tannery: TANNERY.ante,
    weightG: 180,
    serial: 'N.º 034 / 400',
    last: '—',
    rating: 4.5,
    reviews: 26,
    intro: {
      es: 'Ante oliva de 35 milímetros con hebilla de latón macizo. Se corta a tu medida en la boutique.',
      pt: 'Camurça oliva de 35 milímetros com fivela de latão maciço. Cortado à sua medida na boutique.',
    },
    story: {
      es: 'Una sola tira, sin empalme, cortada del lomo de la piel que es la parte que menos estira. La hebilla se saca sin herramienta, así que la misma tira sirve con tres hebillas distintas.',
      pt: 'Uma só tira, sem emenda, cortada do lombo da pele, que é a parte que menos estica. A fivela sai sem ferramenta, então a mesma tira serve com três fivelas diferentes.',
    },
  },
  {
    slug: 'cinta',
    name: 'Cinta',
    family: 'cinturon',
    category: 'accesorios',
    kind: { es: 'Cinturón de cuero grabado', pt: 'Cinto de couro trabalhado' },
    pricePYG: 890000,
    color: C.castano,
    tannery: TANNERY.chaco,
    weightG: 210,
    serial: 'N.º 029 / 300',
    last: '—',
    rating: 4.6,
    reviews: 19,
    intro: {
      es: 'Cuero castaño con el mismo repujado del Ravel y hebilla trabajada. El par del oxford.',
      pt: 'Couro castanho com o mesmo repuxo do Ravel e fivela trabalhada. O par do oxford.',
    },
    story: {
      es: 'Sale de los recortes de lomo del Ravel, así que el grabado es literalmente el mismo, hecho con la misma matriz el mismo día. Cuando se agota el Ravel, se agota el Cinta.',
      pt: 'Sai das sobras de lombo do Ravel, então o repuxo é literalmente o mesmo, feito com a mesma matriz no mesmo dia. Quando o Ravel esgota, o Cinta esgota.',
    },
  },
  {
    slug: 'nanduti-bag',
    name: 'Ñandutí',
    family: 'bolso',
    category: 'accesorios',
    kind: { es: 'Bolso de mano, serie Ñandutí', pt: 'Bolsa de mão, série Ñandutí' },
    pricePYG: 3200000,
    color: C.bordo,
    tannery: TANNERY.chaco,
    weightG: 640,
    badge: 'nanduti',
    featured: true,
    serial: 'Ñ-006 / 40',
    last: '—',
    rating: 4.9,
    reviews: 11,
    intro: {
      es: 'Cuero bordó grabado con el radial del ñandutí y cerradura de latón. Cuarenta piezas.',
      pt: 'Couro bordô gravado com o radial do ñandutí e fecho de latão. Quarenta peças.',
    },
    story: {
      es: 'El grabado va prensado en caliente sobre cuero curtido al quebracho, no impreso: se siente con el dedo y no se borra. La cerradura es de latón fundido, con el número de pieza troquelado en la cara interna de la tapa.',
      pt: 'A gravação vai prensada a quente sobre couro curtido ao quebracho, não impressa: sente-se com o dedo e não apaga. O fecho é de latão fundido, com o número da peça gravado na face interna da tampa.',
    },
  },
  {
    slug: 'tote-noir',
    name: 'Tote Noir',
    family: 'bolso',
    category: 'accesorios',
    kind: { es: 'Bolso estructurado', pt: 'Bolsa estruturada' },
    pricePYG: 2750000,
    color: C.noirNapa,
    tannery: TANNERY.chaco,
    weightG: 780,
    serial: 'N.º 016 / 120',
    last: '—',
    rating: 4.7,
    reviews: 34,
    intro: {
      es: 'Negro, estructurado, con base rígida y pie de latón. Entra una portátil de trece pulgadas.',
      pt: 'Preto, estruturado, com base rígida e pés de latão. Cabe um notebook de treze polegadas.',
    },
    story: {
      es: 'La base lleva un refuerzo de cuero prensado de cuatro milímetros: por eso el bolso se para solo aunque esté vacío, que es la diferencia entre un tote y una bolsa. Cuatro pies de latón para que el fondo no toque el piso.',
      pt: 'A base leva um reforço de couro prensado de quatro milímetros: por isso a bolsa fica em pé sozinha mesmo vazia, que é a diferença entre uma tote e um saco. Quatro pés de latão para o fundo não tocar o chão.',
    },
  },
  {
    slug: 'cognac-bag',
    name: 'Palma',
    family: 'bolso',
    category: 'accesorios',
    kind: { es: 'Bolso de mano', pt: 'Bolsa de mão' },
    pricePYG: 2450000,
    color: C.cognac,
    tannery: TANNERY.chaco,
    weightG: 690,
    serial: 'N.º 023 / 160',
    last: '—',
    rating: 4.6,
    reviews: 28,
    intro: {
      es: 'Coñac curtido vegetal con dos manijas cosidas a mano. Lleva el nombre de la calle del primer taller.',
      pt: 'Conhaque curtido vegetal com duas alças costuradas à mão. Leva o nome da rua da primeira oficina.',
    },
    story: {
      es: 'Las manijas se cosen con el mismo punto de silla que usamos en los mocasines, cuatro puntadas por centímetro, con hilo de lino encerado. Si una se corta, el resto de la costura no se suelta: es la ventaja del punto a mano.',
      pt: 'As alças são costuradas com o mesmo ponto de sela dos mocassins, quatro pontos por centímetro, com linha de linho encerada. Se uma arrebentar, o resto da costura não solta: é a vantagem do ponto à mão.',
    },
  },
  {
    slug: 'ivoire-bag',
    name: 'Ivoire',
    family: 'bolso',
    category: 'accesorios',
    kind: { es: 'Bolso bandolera', pt: 'Bolsa transversal' },
    pricePYG: 2290000,
    color: C.marfil,
    tannery: TANNERY.napa,
    weightG: 520,
    serial: 'N.º 025 / 140',
    last: '—',
    rating: 4.5,
    reviews: 23,
    intro: {
      es: 'Bandolera de napa marfil con correa regulable y cierre de solapa magnética.',
      pt: 'Transversal de napa marfim com alça regulável e fecho de aba magnética.',
    },
    story: {
      es: 'La correa se regula entre 95 y 130 centímetros y se saca entera, así que el bolso funciona también de cartera de mano. El imán va escondido entre dos capas de cuero: no se ve ni se oye.',
      pt: 'A alça regula entre 95 e 130 centímetros e sai inteira, então a bolsa funciona também como carteira de mão. O ímã vai escondido entre duas camadas de couro: não se vê nem se ouve.',
    },
  },
  {
    slug: 'portefeuille',
    name: 'Portefeuille',
    family: 'marroquineria',
    category: 'accesorios',
    kind: { es: 'Billetera de cuero', pt: 'Carteira de couro' },
    pricePYG: 690000,
    color: C.leonado,
    tannery: TANNERY.chaco,
    weightG: 95,
    featured: true,
    serial: 'N.º 038 / 500',
    last: '—',
    rating: 4.8,
    reviews: 143,
    siblings: ['compacta'],
    intro: {
      es: 'Ocho ranuras, dos billeteros y ningún forro. Nueve milímetros de espesor cerrada.',
      pt: 'Oito divisórias, dois espaços para notas e nenhum forro. Nove milímetros fechada.',
    },
    story: {
      es: 'Sin forro y sin pegamento: dos capas de cuero cosidas al canto, nada más. Por eso es la billetera más fina que hacemos y por eso el cuero se marca con lo que llevás adentro, que a los dos años es medio punto del asunto.',
      pt: 'Sem forro e sem cola: duas camadas de couro costuradas na borda, só isso. Por isso é a carteira mais fina que fazemos e por isso o couro marca com o que você leva dentro, o que aos dois anos é metade da graça.',
    },
  },
  {
    slug: 'compacta',
    name: 'Compacta',
    family: 'marroquineria',
    category: 'accesorios',
    kind: { es: 'Billetera compacta', pt: 'Carteira compacta' },
    pricePYG: 590000,
    color: C.castano,
    tannery: TANNERY.chaco,
    weightG: 70,
    serial: 'N.º 041 / 500',
    last: '—',
    rating: 4.7,
    reviews: 97,
    siblings: ['portefeuille'],
    intro: {
      es: 'Cuatro ranuras y un bolsillo de monedas con broche. Para el bolsillo delantero.',
      pt: 'Quatro divisórias e um porta-moedas com botão. Para o bolso da frente.',
    },
    story: {
      es: 'Pensada para llevarse adelante, así que mide once centímetros de ancho y no doce: la diferencia se nota sentado. El broche es de latón macizo y se ajusta con la uña si con los años queda flojo.',
      pt: 'Pensada para o bolso da frente, então mede onze centímetros de largura e não doze: a diferença sente-se sentado. O botão é de latão maciço e ajusta-se com a unha se com os anos ficar folgado.',
    },
  },
  {
    slug: 'estuche',
    name: 'Estuche Atelier',
    family: 'cuidado',
    category: 'accesorios',
    kind: { es: 'Estuche de cuidado', pt: 'Estojo de cuidado' },
    pricePYG: 450000,
    color: C.tabaco,
    tannery: TANNERY.chaco,
    weightG: 850,
    serial: 'N.º 044 / 600',
    last: '—',
    rating: 4.8,
    reviews: 78,
    intro: {
      es: 'Dos cepillos, tres ceras, paño de algodón y calzador de latón, en bandeja de cuero.',
      pt: 'Duas escovas, três ceras, pano de algodão e calçadeira de latão, em bandeja de couro.',
    },
    story: {
      es: 'Es exactamente lo que usa el taller, sin versión doméstica. Las ceras son neutra, coñac y castaño, que cubren todo el catálogo. El calzador mide dieciocho centímetros, que es el largo mínimo para no romper el contrafuerte.',
      pt: 'É exatamente o que a oficina usa, sem versão doméstica. As ceras são neutra, conhaque e castanha, que cobrem todo o catálogo. A calçadeira mede dezoito centímetros, que é o comprimento mínimo para não quebrar o contraforte.',
    },
  },
  {
    slug: 'crin',
    name: 'Cepillo de crin',
    family: 'cuidado',
    category: 'accesorios',
    kind: { es: 'Cepillo de lustre', pt: 'Escova de lustro' },
    pricePYG: 190000,
    color: C.tabaco,
    tannery: TANNERY.chaco,
    weightG: 210,
    serial: 'N.º 046 / 800',
    last: '—',
    rating: 4.6,
    reviews: 54,
    intro: {
      es: 'Crin de caballo sobre madera de guatambú. El único cepillo que hace falta si tenés cera.',
      pt: 'Crina de cavalo sobre madeira de guatambu. A única escova necessária se você tem cera.',
    },
    story: {
      es: 'Crin natural, no sintética: la sintética calienta el cuero y quema la cera antes de que se asiente. Con dos cepillos, uno para claros y otro para oscuros, tenés resuelto todo el catálogo por veinte años.',
      pt: 'Crina natural, não sintética: a sintética esquenta o couro e queima a cera antes de assentar. Com duas escovas, uma para claros e outra para escuros, você resolve todo o catálogo por vinte anos.',
    },
  },
];

function sizesFor(seed: Seed): number[] {
  if (seed.family === 'cinturon') return BELT_SIZES;
  if (seed.category === 'accesorios') return [];
  return seed.category === 'mujer' ? W_SIZES : M_SIZES;
}

function specsFor(seed: Seed): Array<{ k: L10n; v: L10n }> {
  if (seed.specs) return seed.specs;
  const base: Array<{ k: L10n; v: L10n }> = [];
  const soft = seed.family === 'sneaker' || seed.family === 'bailarina';

  if (['oxford', 'mocasin', 'bota'].includes(seed.family)) {
    base.push({ k: SPEC.montado, v: seed.family === 'mocasin' ? V.blake : V.goodyear });
    base.push({ k: SPEC.suela, v: seed.slug === 'rebelle' || seed.slug === 'sierra' ? V.gomaSuela : V.cueroSuela });
  } else if (soft) {
    base.push({ k: SPEC.montado, v: V.blake });
    base.push({ k: SPEC.suela, v: seed.family === 'sneaker' ? V.gomaSuela : V.cueroSuela });
  } else if (seed.category === 'mujer') {
    base.push({ k: SPEC.montado, v: V.blake });
    base.push({ k: SPEC.suela, v: V.cueroSuela });
  }

  if (seed.category !== 'accesorios') base.push({ k: SPEC.forro, v: V.cabritilla });
  else base.push({ k: SPEC.herraje, v: V.latonPulido });

  if (seed.heelMm) base.push({ k: SPEC.taco, v: { es: `${seed.heelMm} mm`, pt: `${seed.heelMm} mm` } });
  if (seed.weightG) {
    const unit = seed.category === 'accesorios' ? '' : seed.category === 'mujer' ? ' (talla 38)' : ' (talla 42)';
    const unitPt = seed.category === 'accesorios' ? '' : seed.category === 'mujer' ? ' (nº 38)' : ' (nº 42)';
    base.push({
      k: { es: 'Peso', pt: 'Peso' },
      v: { es: `${seed.weightG} g${unit}`, pt: `${seed.weightG} g${unitPt}` },
    });
  }
  base.push({ k: SPEC.origen, v: V.paraguay });
  return base;
}

export const PRODUCTS: Product[] = SEEDS.map((seed, i) => {
  const sizes = sizesFor(seed);
  const stock = mkStock(seed.slug, sizes);
  const total = Object.values(stock).reduce((a, b) => a + b, 0);
  return {
    slug: seed.slug,
    name: seed.name,
    family: seed.family,
    category: seed.category,
    kind: seed.kind,
    pricePYG: seed.pricePYG,
    comparePYG: seed.comparePYG,
    colors: [seed.color],
    sizes,
    stock,
    images: [`/media/p/${seed.slug}-1.webp`, `/media/p/${seed.slug}-2.webp`],
    badge: total === 0 ? 'agotado' : total <= 4 ? 'ultimas' : seed.badge,
    featured: seed.featured,
    serial: seed.serial,
    last: seed.last,
    tannery: seed.tannery,
    heelMm: seed.heelMm,
    weightG: seed.weightG,
    intro: seed.intro,
    story: seed.story,
    specs: specsFor(seed),
    care: CARE[seed.family],
    rating: seed.rating,
    reviews: seed.reviews,
    rank: i,
    siblings: seed.siblings,
  };
});

export const BY_SLUG = new Map(PRODUCTS.map((p) => [p.slug, p]));

export const getProduct = (slug: string): Product | undefined => BY_SLUG.get(slug);

export const byCategory = (c: Category): Product[] => PRODUCTS.filter((p) => p.category === c);

export const FEATURED: Product[] = PRODUCTS.filter((p) => p.featured);

export const NANDUTI: Product[] = PRODUCTS.filter((p) => p.badge === 'nanduti');

export const totalStock = (p: Product): number => Object.values(p.stock).reduce((a, b) => a + b, 0);

export const inStock = (p: Product, size: number): number => p.stock[size] ?? 0;

export const priceRange = (): [number, number] => {
  const prices = PRODUCTS.map((p) => p.pricePYG);
  return [Math.min(...prices), Math.max(...prices)];
};

/** Familias presentes en cada categoría, en el orden en que se muestran. */
export const familiesOf = (c: Category | 'todo'): Family[] => {
  const pool = c === 'todo' ? PRODUCTS : byCategory(c);
  const seen: Family[] = [];
  pool.forEach((p) => {
    if (!seen.includes(p.family)) seen.push(p.family);
  });
  return seen;
};

/** Colores presentes, deduplicados por id. */
export const colorsOf = (c: Category | 'todo'): ColorWay[] => {
  const pool = c === 'todo' ? PRODUCTS : byCategory(c);
  const map = new Map<string, ColorWay>();
  pool.forEach((p) => p.colors.forEach((col) => map.set(col.id, col)));
  return [...map.values()];
};

export const sizesOf = (c: Category | 'todo'): number[] => {
  const pool = c === 'todo' ? PRODUCTS : byCategory(c);
  const s = new Set<number>();
  pool.forEach((p) => p.sizes.forEach((x) => s.add(x)));
  return [...s].sort((a, b) => a - b);
};

/** Piezas de la misma horma o, si no hay, de la misma familia. */
export function related(p: Product, limit = 4): Product[] {
  const sameLast = PRODUCTS.filter((x) => x.slug !== p.slug && x.last === p.last && x.last !== '—');
  const sameFamily = PRODUCTS.filter((x) => x.slug !== p.slug && x.family === p.family && !sameLast.includes(x));
  const sameCat = PRODUCTS.filter(
    (x) => x.slug !== p.slug && x.category === p.category && !sameLast.includes(x) && !sameFamily.includes(x),
  );
  return [...sameLast, ...sameFamily, ...sameCat].slice(0, limit);
}
