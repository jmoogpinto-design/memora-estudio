import { PERSONALIDADES, ORIENTACOES, TAMANHOS } from './constants.js';

let UID = 100;
export const uid = () => ++UID;

export function normalize(o) {
  return {
    fotos: [], fotosSecundarias: [], sujeitos: [], referencias: [], versoes: [], mensagens: [],
    tons: [], destino: "", paraQuem: "", relGenero: "", relComplemento: "", escrita: "", historia: "",
    estilo: null, artistico: null, cenario: null, personalidades: [], inspiracoes: [], extra: "", transmitir: "", conceito: "", inscricao: "",
    orientacao: "retrato", tamanho: "", tamanhoOutro: "",
    escolha: null, ajusteTexto: "", final: null,
    cliente: { nome: "", nascimento: "", whatsapp: "", email: "" },
    ...o,
  };
}

export const seedOrders = () => [
  normalize({
    id: 1042, owner: "ana@email.com", date: "12 jun 2026", status: "aprovacao",
    cliente: { nome: "Ana Beatriz", nascimento: "1990-04-02", whatsapp: "(51) 99999-0000", email: "ana@email.com" },
    destino: "Minha mãe", paraQuem: "É para presentear alguém", relGenero: "Minha", relComplemento: "mãe", local: "Sala de estar",
    historia: "Aniversário de 60 anos dela, no jardim que ela mesma cultivou. Ela é a pessoa mais forte que conheço.",
    transmitir: "Acolhimento, alegria e gratidão.", escrita: "Para você, com amor — 1964",
    estilo: "aquarela", artistico: "realista", cenario: "floral", personalidades: ["delicado","afetivo"], extra: "Gostaria de incluir o cachorro dela, a Mel, em algum cantinho.", tons: ["quentes"], orientacao: "retrato", tamanho: "4060",
    conceito: "Algo alegre, flores ao fundo, delicado e sofisticado.",
    fotos: [{ id: uid(), tone: "#d8c4a8" }], fotosSecundarias: [{ id: uid(), tone: "#cdbfa6" }, { id: uid(), tone: "#c7b89a" }],
    sujeitos: [{ id: uid(), quem: "Minha mãe", fotos: [{ id: uid(), tone: "#d8c4a8" }], fotosSecundarias: [{ id: uid(), tone: "#cdbfa6" }] }],
    referencias: [{ id: uid(), tone: "#c7b89a" }, { id: uid(), tone: "#a8b59c" }],
    versoes: [
      { id: uid(), nome: "Versão mais vibrante", obs: "Flores em destaque, luz quente.", tone: "#e7c9a0" },
      { id: uid(), nome: "Versão mais clássica", obs: "Paleta suave, fundo discreto.", tone: "#cdbfa6" },
    ],
    mensagens: [{ id: uid(), de: "ateliê", texto: "Oi Ana! Preparamos duas versões com base na sua história. Dá uma olhada e nos conte qual te tocou mais. 💛", data: "14 jun" }],
  }),
  normalize({
    id: 1039, owner: "ana@email.com", date: "2 jun 2026", status: "finalizado",
    cliente: { nome: "Ana Beatriz", nascimento: "1990-04-02", whatsapp: "(51) 99999-0000", email: "ana@email.com" },
    destino: "Meu pet", paraQuem: "É para presentear alguém", relGenero: "Meu", relComplemento: "pet", local: "Quarto",
    historia: "O Tom, nosso caramelo, no melhor dia de sol.", transmitir: "Saudade boa e ternura.",
    escrita: "Tom · 2018–2025", estilo: "aquarela", artistico: "realista", cenario: "minimal", personalidades: ["calmo","natural"], tons: ["quentes"], orientacao: "quadrado", tamanho: "40",
    conceito: "Aparência delicada, tons quentes, fundo claro.",
    fotos: [{ id: uid(), tone: "#e0c9a0" }],
    sujeitos: [
      { id: uid(), quem: "Eu", fotos: [{ id: uid(), tone: "#e0c9a0" }], fotosSecundarias: [] },
      { id: uid(), quem: "Meu cachorro Tom", fotos: [{ id: uid(), tone: "#cdb98a" }], fotosSecundarias: [] },
    ],
    versoes: [{ id: uid(), nome: "Versão A", obs: "", tone: "#e4cba2" }, { id: uid(), nome: "Versão B", obs: "", tone: "#d6c4a4" }],
    escolha: 0, final: { tone: "#e4cba2" },
  }),
];

export const DB_STATUS_MAP = {
  draft: "recebido",
  awaiting_photos: "recebido",
  in_production: "producao",
  versions_sent: "aprovacao",
  approved: "finalizado",
  completed: "finalizado",
};

export function normalizeDbOrder(o) {
  const fd = o.form_data || {};
  return normalize({
    id: o.id,
    shortId: o.id.slice(0, 8),
    owner: o.client_email,
    date: new Date(o.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" }).replace(".", ""),
    status: DB_STATUS_MAP[o.status] || "recebido",
    cliente: {
      nome: o.client_name || fd.cliente?.nome || "",
      nascimento: fd.cliente?.nascimento || "",
      whatsapp: fd.cliente?.whatsapp || "",
      email: o.client_email,
    },
    estilo: o.style || fd.estilo || null,
    artistico: fd.artistico || null,
    cenario: fd.cenario || null,
    personalidades: fd.personalidades || [],
    tons: fd.tons || [],
    orientacao: fd.orientacao || "retrato",
    tamanho: fd.tamanho || "",
    tamanhoOutro: fd.tamanhoOutro || "",
    inspiracoes: fd.inspiracoes || [],
    extra: fd.extra || "",
    sujeitos: fd.sujeitos || [],
    fotos: (o.order_photos || []).map((p, i) => ({ id: `photo_${i}`, path: p.storage_path, tone: "#d8c9b4" })),
    versoes: (o.order_versions || []).map((v) => ({
      id: v.id,
      nome: `Versão ${v.version_number}`,
      obs: "",
      tone: "#d8c9b4",
      storage_path: v.storage_path,
    })),
  });
}

export function artGradient(tone = "#d8c9b4") {
  return `radial-gradient(120% 90% at 30% 20%, ${tone} 0%, ${shade(tone, -16)} 58%, ${shade(tone, -34)} 100%)`;
}

export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp((n >> 16) + amt), g = clamp(((n >> 8) & 255) + amt), b = clamp((n & 255) + amt);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

const clamp = (v) => Math.max(0, Math.min(255, v));

export function today() {
  return new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" }).replace(".", "");
}

export function nameOf(list, id) {
  const x = list.find((e) => e.id === id);
  return x ? x.name : "";
}

export function fmtPersonalidades(ids) {
  return (ids || []).map((id) => nameOf(PERSONALIDADES, id)).filter(Boolean).join(", ");
}

export function fmtFormato(o) {
  const orient = (ORIENTACOES.find((x) => x.id === o.orientacao) || {}).name || "";
  const medida = o.tamanho === "outro"
    ? (o.tamanhoOutro || "sob medida")
    : ((TAMANHOS[o.orientacao] || []).find((x) => x.id === o.tamanho) || {}).cm;
  return [orient, medida].filter(Boolean).join(" · ");
}

export function fmtDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function ratioOf(orient) {
  return orient === "paisagem" ? "4 / 3" : orient === "quadrado" ? "1 / 1" : "3 / 4";
}

export function phaseTitle(p) {
  return ["", "Sobre você", "Formato do quadro", "Suas fotos", "O estilo da obra"][p];
}
