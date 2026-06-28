import { ART_IMAGES, BRUSH_IMAGES, ARTSTYLE_IMAGES } from './images.js';

export { ART_IMAGES, BRUSH_IMAGES, ARTSTYLE_IMAGES };

export const PIX_KEY = "+5551998799694";
export const PIX_NAME = "Atelie Memora";
export const PIX_CITY = "PORTO ALEGRE";

export const GOLD = "#c9a84c";
export const GOLD_SOFT = "#e8d9a8";
export const INK = "#0d0d0d";
export const PAPER = "#fafaf9";
export const LINE = "#ececec";
export const MUTE = "#6b6b6b";

export const SERIF = "'Outfit', system-ui, sans-serif";

export const STYLES = [
  { id: "aquarela", name: "Aquarela", desc: "Delicada, leve, fluida.", img: ART_IMAGES.aquarela, brush: BRUSH_IMAGES.aquarela },
  { id: "acrilica", name: "Tinta acrílica", desc: "Moderna, vibrante, texturizada.", img: ART_IMAGES.acrilica, brush: BRUSH_IMAGES.acrilica },
  { id: "oleo", name: "Tinta a óleo", desc: "Clássica, encorpada, atemporal.", img: ART_IMAGES.oleo, brush: BRUSH_IMAGES.oleo },
  { id: "nanquim", name: "Nanquim / caneta", desc: "Traço marcante, expressivo.", img: ART_IMAGES.nanquim, brush: BRUSH_IMAGES.nanquim },
  { id: "giz", name: "Giz / pastel", desc: "Textura macia, artesanal.", img: ART_IMAGES.giz, brush: BRUSH_IMAGES.giz },
  { id: "digital", name: "Digital Fine Art", desc: "Moderno, refinado, versátil.", img: ART_IMAGES.digital, brush: BRUSH_IMAGES.digital },
];

export const ARTISTICOS = [
  { id: "realista", name: "Realista", desc: "Fiel às feições, natural.", img: ARTSTYLE_IMAGES.realista },
  { id: "surreal", name: "Surrealismo", desc: "Onírico, simbólico, livre.", img: ARTSTYLE_IMAGES.surreal },
  { id: "geometrica", name: "Geométrico", desc: "Facetas, planos, estrutura.", img: ARTSTYLE_IMAGES.geometrica },
  { id: "popart", name: "Pop Art", desc: "Cores chapadas, ousado.", img: ARTSTYLE_IMAGES.popart },
  { id: "street", name: "Street Art / Grafite", desc: "Urbano, jovem, espontâneo.", img: ARTSTYLE_IMAGES.street },
  { id: "colagem", name: "Colagem", desc: "Camadas, recortes, editorial.", img: ARTSTYLE_IMAGES.colagem },
];

export const CENARIOS = [
  { id: "floral", name: "Floral / jardim", art: "flores" },
  { id: "surreal", name: "Surrealismo", art: "sonhador" },
  { id: "grafites", name: "Grafites urbanos", art: "cidade" },
  { id: "recortes", name: "Recortes e frases", art: "recortes" },
  { id: "minimal", name: "Formas minimalistas", art: "minimal" },
  { id: "rococo", name: "Rococó / clássico", art: "biblioteca" },
  { id: "paisagem", name: "Paisagem clássica", art: "mediterraneo" },
  { id: "abstrato", name: "Fundo abstrato", art: "abstrato" },
];

export const PERSONALIDADES = [
  { id: "delicado", name: "Delicado" }, { id: "elegante", name: "Elegante" },
  { id: "vibrante", name: "Vibrante" }, { id: "urbano", name: "Urbano" },
  { id: "natural", name: "Natural" }, { id: "criativo", name: "Criativo" },
  { id: "calmo", name: "Calmo" }, { id: "sonhador", name: "Sonhador" },
  { id: "sofisticado", name: "Sofisticado" }, { id: "afetivo", name: "Afetivo" },
];

export const GALERIA = [
  { id: "g1", art: "flores" }, { id: "g2", art: "sonhador" }, { id: "g3", art: "cidade" },
  { id: "g4", art: "abstrato" }, { id: "g5", art: "minimal" }, { id: "g6", art: "mediterraneo" },
  { id: "g7", art: "biblioteca" }, { id: "g8", art: "mar" }, { id: "g9", art: "colorido" },
  { id: "g10", art: "recortes" }, { id: "g11", art: "borboletas" }, { id: "g12", art: "campo" },
];

export const TONS = [
  { id: "quentes", name: "Tons quentes", colors: ["#c97b3f", "#e0a86a", "#d8c9a8"] },
  { id: "frios", name: "Tons frios", colors: ["#7d94a8", "#a8b8c4", "#cdd9e0"] },
  { id: "neutros", name: "Neutros / terrosos", colors: ["#8a7458", "#bda884", "#e7dcc4"] },
  { id: "pb", name: "Preto e branco", colors: ["#2a2622", "#8a857e", "#e8e4dd"] },
  { id: "vibrantes", name: "Vibrantes", colors: ["#c43f5a", "#e0a020", "#3f8a6a"] },
];

export const STATUSES = {
  recebido:   { label: "Pedido recebido",      fill: 0.18, hint: "Recebemos sua história — já estamos com ela." },
  producao:   { label: "Em produção",          fill: 0.5,  hint: "Sua obra está sendo criada à mão." },
  aprovacao:  { label: "Aguardando aprovação", fill: 0.78, hint: "Duas versões te aguardam abaixo." },
  ajustes:    { label: "Em ajustes",           fill: 0.62, hint: "Estamos refinando conforme seu pedido." },
  finalizado: { label: "Finalizado",           fill: 1,    hint: "Sua obra está pronta." },
};

export const STATUS_ORDER = ["recebido", "producao", "aprovacao", "ajustes", "finalizado"];

export const LOCAIS = ["Sala de estar", "Quarto", "Escritório", "Entrada / hall", "Cozinha", "Ainda não sei"];

export const DESTINOS = ["Minha mãe", "Meu pai", "Minha avó", "Meu avô", "Meu irmão", "Minha irmã", "Meu filho", "Minha filha", "Meu namorado", "Minha namorada", "Meu marido", "Minha esposa", "Meu amigo", "Minha amiga", "Meu pet", "Minha família"];

export const ORIENTACOES = [
  { id: "retrato", name: "Retrato", ratio: "3 / 4" },
  { id: "paisagem", name: "Paisagem", ratio: "4 / 3" },
  { id: "quadrado", name: "Quadrado", ratio: "1 / 1" },
];

export const TAMANHOS = {
  retrato:  [{ id: "a4", name: "A4", cm: "21 × 30 cm" }, { id: "a3", name: "A3", cm: "30 × 42 cm" }, { id: "4060", name: "Médio", cm: "40 × 60 cm" }, { id: "6090", name: "Grande", cm: "60 × 90 cm" }],
  paisagem: [{ id: "a4", name: "A4", cm: "30 × 21 cm" }, { id: "a3", name: "A3", cm: "42 × 30 cm" }, { id: "6040", name: "Médio", cm: "60 × 40 cm" }, { id: "9060", name: "Grande", cm: "90 × 60 cm" }],
  quadrado: [{ id: "30", name: "Pequeno", cm: "30 × 30 cm" }, { id: "40", name: "Médio", cm: "40 × 40 cm" }, { id: "60", name: "Grande", cm: "60 × 60 cm" }, { id: "80", name: "Extra", cm: "80 × 80 cm" }],
};

export const STATUS_LABELS = {
  draft: "Rascunho",
  awaiting_photos: "Aguardando fotos",
  in_production: "Em produção",
  versions_sent: "Versões enviadas",
  approved: "Aprovado",
  completed: "Finalizado",
};
