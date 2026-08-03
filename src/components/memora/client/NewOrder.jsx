import React, { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { submitClientOrder, addOrderPhotos, listGalleryImages } from "@/lib/orders.functions";
import { buildPixPayload } from "@/lib/pix";
import QRCode from "qrcode";
import { GOLD, MUTE, LINE, PAPER, PIX_KEY, PIX_NAME, PIX_CITY } from "../constants.js";
import { uid } from "../helpers.js";

const LINGUAGENS = [
  { name: "Clássico",    desc: "Formas equilibradas, harmonia e elegância atemporal." },
  { name: "Gráfico",     desc: "Formas chapadas, cores contrastantes e composição moderna." },
  { name: "Pintórico",   desc: "Pinceladas expressivas, texturas aparentes e arte com emoção." },
  { name: "Minimalista", desc: "Menos é mais. Formas sutis, cores neutras e muito espaço." },
  { name: "Ilustrativo", desc: "Traços delicados e narrativos para contar histórias com arte." },
];
const TEMAS = [
  { name: "Floral & Botânico", desc: "Flores, folhagens, plantas e elementos vegetais." },
  { name: "Paisagem",          desc: "Cenários naturais, cidades e vistas inspiradoras." },
  { name: "Pessoas",           desc: "Retratos, figuras humanas e expressões." },
  { name: "Pets",              desc: "Cachorros, gatos e outros animais de estimação." },
  { name: "Abstrato",          desc: "Formas, cores e composições abstratas." },
  { name: "Arquitetura",       desc: "Casas, edifícios e elementos arquitetônicos." },
  { name: "Infantil",          desc: "Elementos lúdicos, divertidos e cheios de imaginação." },
  { name: "Passatempos",       desc: "Seus hobbies: ler, esportes, cinema, viajar, cozinhar, desenhar…" },
];
const ATMOSFERAS = [
  { name: "Alegre",      desc: "Transmite felicidade, energia e boas sensações." },
  { name: "Dramático",   desc: "Intensa, impactante e cheia de personalidade." },
  { name: "Romântico",   desc: "Suave, afetiva e inspirada no amor e na delicadeza." },
  { name: "Vintage",     desc: "Clássica, nostálgica e inspirada em outras épocas." },
  { name: "Sofisticado", desc: "Chique, equilibrada e com atenção aos detalhes." },
  { name: "Leve",        desc: "Suave, minimalista e que transmite tranquilidade." },
  { name: "Colorido",    desc: "Vibrante, divertida e cheia de vida e expressão." },
  { name: "Neutro",      desc: "Discreta, equilibrada e com paleta de cores suaves." },
];
const PALETAS = [
  { name: "Tons quentes",   colors: ["#D4522A","#E8883A","#C4724A","#E8A460"] },
  { name: "Tons frios",     colors: ["#4A7EC4","#6A9ED4","#4A9EC4","#7AB4D4"] },
  { name: "Tons vibrantes", colors: ["#E84A3A","#E8C43A","#3AA8E8","#9A4AE8"] },
  { name: "Tons suaves",    colors: ["#E8C4D4","#D4C4E8","#C4D4E8","#E8D4C4"] },
  { name: "Tons terrosos",  colors: ["#8B6A3A","#A07A4A","#7A6A5A","#B08A5A"] },
  { name: "Tons neutros",   colors: ["#D4D0CA","#B8B4AE","#9A9692","#7A7672"] },
  { name: "Tons escuros",   colors: ["#2A2A2A","#3A3A3A","#4A4A4A","#5A5A5A"] },
];

const FORMATOS = [
  { id: "vertical",   name: "Vertical",   ratio: "3 / 5", desc: "Ideal para retratos" },
  { id: "horizontal", name: "Horizontal", ratio: "5 / 3", desc: "Ideal para grupos" },
  { id: "quadrado",   name: "Quadrado",   ratio: "1 / 1", desc: "Versátil" },
];

const PRICE_BASE      = 350;
const PRICE_CENOGRAFIA = 140;
const NUM_PHASES      = 6;
const PHASE_LABELS    = ["Sua Memória", "Como é pintado?", "O que torna essa obra única?", "Formato", "Impressão", "Revisão"];

export default function NewOrder({ user, onSuccess, onCancel }) {
  const [phase, setPhase]           = useState(1);
  const [openAccs, setOpenAccs]     = useState({ paleta: false, galeria: false });
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed]   = useState(false);
  const [qrUrl, setQrUrl]           = useState("");
  const [copied, setCopied]         = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);

  const [f, setF] = useState({
    fotos:         [],
    historia:      "",
    linguagem:     "",
    temas:         [],
    atmosfera:     "",
    paleta:        "",
    formato:       "",
    tipoFundo:      "",
    querCenografia: false,
    cenografiaDesc: "",
    inspiracaoDesc: "",
    inspiracoes:   [],
    querImpressao: null,
    endereco:      "",
  });

  const set       = (patch) => setF(p => ({ ...p, ...patch }));
  const toggleAcc = (k)    => setOpenAccs(prev => ({ ...prev, [k]: !prev[k] }));

  const totalPrice = PRICE_BASE + (f.querCenografia ? PRICE_CENOGRAFIA : 0);

  const submitFn     = useServerFn(submitClientOrder);
  const photosFn     = useServerFn(addOrderPhotos);
  const fetchGallery = useServerFn(listGalleryImages);

  useEffect(() => {
    if (openAccs.galeria && galleryImages.length === 0) {
      fetchGallery()
        .then(urls => { if (urls?.length) setGalleryImages(urls.map((url, i) => ({ id: `g${i}`, url }))); })
        .catch(() => {});
    }
  }, [openAccs.galeria]);

  useEffect(() => {
    if (phase !== 6) { setQrUrl(""); return; }
    const payload = buildPixPayload({
      key: PIX_KEY, merchantName: PIX_NAME, merchantCity: PIX_CITY,
      amount: totalPrice,
      txid: "MEMORA" + Date.now().toString().slice(-8),
      description: "Retrato Memora",
    });
    QRCode.toDataURL(payload, { width: 200, margin: 1, color: { dark: "#1a1a1a", light: "#ffffff" } })
      .then(setQrUrl).catch(() => setQrUrl(""));
  }, [phase, totalPrice]);

  const canNext = ({
    1: f.fotos.length > 0,
    2: !!f.linguagem,
    3: !!f.tipoFundo,
    4: !!f.formato,
    5: f.querImpressao !== null && (f.querImpressao === false || f.endereco.trim().length >= 10),
    6: !submitting,
  })[phase];

  const goNext = () => setPhase(p => p + 1);

  const goBack = () => {
    if (phase > 1) { setPhase(p => p - 1); return; }
    onCancel();
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { id: orderId } = await submitFn({
        data: {
          client_name:  user?.email?.split("@")[0] || "Cliente",
          client_email: user?.email || "",
          style:        f.linguagem || null,
          people_count: 1,
          include_pet:  f.temas.includes("Pets"),
          price_cents:  totalPrice * 100,
          form_data: {
            historia: f.historia, linguagem: f.linguagem,
            temas: f.temas, atmosfera: f.atmosfera, paleta: f.paleta,
            formato: f.formato, tipoFundo: f.tipoFundo,
            querCenografia: f.querCenografia, cenografiaDesc: f.cenografiaDesc,
            inspiracaoDesc: f.inspiracaoDesc,
            inspiracoes: f.inspiracoes, querImpressao: f.querImpressao,
            endereco: f.endereco, preco: totalPrice,
          },
        },
      });
      const paths = [];
      for (let i = 0; i < f.fotos.length; i++) {
        const foto = f.fotos[i];
        if (foto._file) {
          const path = `${orderId}/fotos/foto_${i}_${foto.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
          const { error } = await supabase.storage.from("order-images").upload(path, foto._file);
          if (!error) paths.push(path);
        }
      }
      if (paths.length > 0) await photosFn({ data: { order_id: orderId, paths } });
      setConfirmed(true);
      setTimeout(() => onSuccess(), 5000);
    } catch (e) {
      alert(e.message || "Erro ao enviar pedido. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) return <SuccessScreen />;

  const pct     = (phase / NUM_PHASES) * 100;
  const isFirst = phase === 1;

  return (
    <div style={{ padding: "0 0 72px", display: "flex", flexDirection: "column", minHeight: "calc(100vh - 130px)" }} className="reveal">

      {/* Progress header */}
      <div style={{ marginBottom: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <button className="ghost sm" onClick={goBack}
            style={{ padding: "4px 0", fontSize: 13, color: MUTE }}>
            ← {isFirst ? "Cancelar" : "Voltar"}
          </button>
          <span style={{ fontSize: 11, color: MUTE, letterSpacing: ".06em" }}>
            {phase}/{NUM_PHASES} · {PHASE_LABELS[phase - 1]}
          </span>
        </div>
        <div style={{ height: 3, background: LINE, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: GOLD, borderRadius: 2, transition: "width 0.4s ease" }} />
        </div>
      </div>

      {/* ── Etapa 1 — Sua Memória ── */}
      {phase === 1 && (
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <p style={eyebrow}>Etapa 1</p>
          <h1 style={{ ...h1, fontSize: 34, marginBottom: 6 }}>Sua Memória</h1>
          <p style={{ ...lede, margin: "0 0 16px", fontSize: 14 }}>Envie a fotografia que será transformada em pintura.</p>
          <label className="lbl" style={{ marginBottom: 8 }}>
            Fotografias
            <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: MUTE, marginLeft: 6 }}>até 5 imagens</span>
          </label>
          <PhotoZone items={f.fotos} max={5} onChange={fotos => set({ fotos })}
            label="Clique para enviar fotos" hint="JPG ou PNG · pode enviar mais de uma" />
        </div>
      )}

      {/* ── Etapa 2 — Como é pintado? ── */}
      {phase === 2 && (
            <>
              <p style={eyebrow}>Estilo Artístico</p>
              <h1 style={h1}>Como é pintado?</h1>
              <p style={lede}>Escolha a linguagem artística que mais combina com o que você imagina.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 24 }}>
                {LINGUAGENS.map(opt => {
                  const on = f.linguagem === opt.name;
                  return (
                    <button key={opt.name} onClick={() => set({ linguagem: on ? "" : opt.name })} style={{
                      border: `${on ? 2 : 1}px solid ${on ? GOLD : LINE}`,
                      borderRadius: 12, padding: "16px 12px 14px", cursor: "pointer",
                      background: on ? "#fdf9ef" : "#fff", textAlign: "left", transition: "all .18s",
                      display: "flex", flexDirection: "column", gap: 10,
                    }}>
                      <OptionIcon name={opt.name} active={on} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: on ? "#8A6A20" : "#1a1a1a", lineHeight: 1.2, marginBottom: 4 }}>{opt.name}</div>
                        <div style={{ fontSize: 11, color: MUTE, lineHeight: 1.45 }}>{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 16 }}>
                <Accordion label="Paleta cromática" hint="opcional"
                  badge={f.paleta || null}
                  open={openAccs.paleta} onToggle={() => toggleAcc("paleta")}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))", gap: 8 }}>
                    {PALETAS.map(opt => {
                      const on = f.paleta === opt.name;
                      return (
                        <button key={opt.name} onClick={() => set({ paleta: on ? "" : opt.name })} style={{
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                          padding: "12px 10px", border: `${on ? 2 : 1}px solid ${on ? GOLD : LINE}`,
                          borderRadius: 12, cursor: "pointer", background: on ? "#fdf9ef" : "#fff", transition: "all .15s",
                        }}>
                          <div style={{ display: "flex", gap: 2, borderRadius: 4, overflow: "hidden" }}>
                            {opt.colors.map(cl => (
                              <div key={cl} style={{ width: 13, height: 28, background: cl }} />
                            ))}
                          </div>
                          <span style={{ fontSize: 11, fontWeight: on ? 600 : 400, color: on ? "#8A6A20" : "#3a3a3a", textAlign: "center", lineHeight: 1.3 }}>{opt.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </Accordion>

                <Accordion label="Galeria de inspirações" hint="até 3 obras"
                  badge={f.inspiracoes.length > 0 ? `${f.inspiracoes.length}/3` : null}
                  open={openAccs.galeria} onToggle={() => toggleAcc("galeria")}>
                  <p style={{ fontSize: 13, color: MUTE, margin: "0 0 10px" }}>Selecione obras que combinam com o que você imagina.</p>
                  <GallerySelector images={galleryImages} selected={f.inspiracoes}
                    onChange={inspiracoes => set({ inspiracoes })} />
                </Accordion>
              </div>
            </>
          )}

      {/* ── Etapa 3 — O que torna essa obra única? ── */}
      {phase === 3 && (
        <>
          <p style={eyebrow}>Estilo Artístico</p>
          <h1 style={{ ...h1, marginBottom: 16 }}>Defina quanto da sua história fará parte da composição da obra.</h1>

          {/* Fundo — largura total */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 20 }}>
            {[
              { id: "original",   label: "Manter o fundo original da fotografia" },
              { id: "liso",       label: "Substituir por um fundo liso" },
              { id: "cenografia", label: "Criar uma cenografia exclusiva", extra: "+ R$ 140" },
            ].map(opt => {
              const on = f.tipoFundo === opt.id;
              return (
                <button key={opt.id} onClick={() => set({ tipoFundo: opt.id, querCenografia: opt.id === "cenografia" })} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  border: `${on ? 1.5 : 1}px solid ${on ? GOLD : LINE}`,
                  borderRadius: 10, padding: "11px 14px", cursor: "pointer",
                  background: on ? "#fdf9ef" : "#fff", textAlign: "left", transition: "all .15s",
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${on ? GOLD : LINE}`, background: on ? GOLD : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {on && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}
                  </div>
                  <span style={{ fontSize: 13, color: on ? "#8A6A20" : "#1a1a1a", fontWeight: on ? 500 : 400, flex: 1 }}>{opt.label}</span>
                  {opt.extra && <span style={{ fontSize: 12, color: GOLD, fontWeight: 600, flexShrink: 0 }}>{opt.extra}</span>}
                </button>
              );
            })}
          </div>

          {/* Tema | Inspire — mesma altura, proporcionais */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "stretch" }}>

            {/* Esquerda: Tema */}
            <div style={{ opacity: f.querCenografia ? 1 : 0.42, transition: "opacity .2s", pointerEvents: f.querCenografia ? "auto" : "none", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: ".06em" }}>Tema</span>
                <span style={{ fontSize: 11, color: MUTE }}>
                  {f.querCenografia ? "pode escolher mais de um" : "disponível com Cenografia Exclusiva"}
                </span>
              </div>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "1fr 1fr", gap: 6 }}>
                {TEMAS.map(opt => {
                  const on = f.temas.includes(opt.name);
                  return (
                    <button key={opt.name}
                      onClick={() => set({ temas: on ? f.temas.filter(x => x !== opt.name) : [...f.temas, opt.name] })}
                      style={{
                        border: `${on ? 2 : 1}px solid ${on ? GOLD : LINE}`,
                        borderRadius: 10, padding: "10px 6px 8px", cursor: "pointer",
                        background: on ? "#fdf9ef" : "#fff", textAlign: "center", transition: "all .18s",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                      }}>
                      <OptionIcon name={opt.name} active={on} size={28} />
                      <div style={{ fontSize: 10, fontWeight: 600, color: on ? "#8A6A20" : "#1a1a1a", lineHeight: 1.2 }}>{opt.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direita: Inspire */}
            <div style={{ opacity: f.querCenografia ? 1 : 0.42, transition: "opacity .2s", display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: ".06em" }}>Inspire nossa equipe artística</span>
                <span style={{ fontSize: 11, color: MUTE, marginLeft: 8 }}>opcional</span>
              </div>
              <textarea className="inp ta" disabled={!f.querCenografia} value={f.inspiracaoDesc}
                onChange={e => set({ inspiracaoDesc: e.target.value })}
                style={{ flex: 1, minHeight: 0, resize: "none" }}
                placeholder="Conte o significado desta memória. Há alguma história, lugar, momento ou detalhe que você gostaria que estivesse presente na pintura?" />
            </div>

          </div>
        </>
      )}

      {/* ── Etapa 4 — Formato ── */}
      {phase === 4 && (
        <>
          <p style={eyebrow}>Etapa 4</p>
          <h1 style={h1}>Formato</h1>
          <p style={lede}>Como você imagina a orientação da sua obra?</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 8 }}>
            {FORMATOS.map(fm => {
              const on = f.formato === fm.id;
              return (
                <button key={fm.id} onClick={() => set({ formato: fm.id })} style={{
                  border: `${on ? 2 : 1}px solid ${on ? GOLD : LINE}`,
                  borderRadius: 12, padding: "14px 10px 12px", cursor: "pointer",
                  background: on ? "#fdf9ef" : "#fff", textAlign: "center", transition: "all .18s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                }}>
                  <div style={{
                    aspectRatio: fm.ratio, background: on ? GOLD : "#e8e4dc",
                    borderRadius: 4, width: fm.id === "horizontal" ? 48 : fm.id === "quadrado" ? 36 : 28,
                    transition: "background .18s",
                  }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: on ? "#8A6A20" : "#1a1a1a" }}>{fm.name}</div>
                    <div style={{ fontSize: 11, color: MUTE, marginTop: 2 }}>{fm.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ── Etapa 5 — Impressão ── */}
      {phase === 5 && (
        <>
          <p style={eyebrow}>Etapa 5</p>
          <h1 style={h1}>Impressão</h1>
          <p style={lede}>Gostaria de receber sua obra impressa?</p>
          <div className="fg sm" style={{ marginBottom: 20 }}>
            {[
              { val: false, label: "Não, desejo apenas o arquivo digital", desc: "Você recebe o arquivo em alta resolução para imprimir onde quiser." },
              { val: true,  label: "Sim, quero um orçamento para impressão", desc: "Nossa equipe envia um orçamento com tamanho, acabamento, moldura e frete." },
            ].map(opt => {
              const on = f.querImpressao === opt.val;
              return (
                <button key={String(opt.val)} onClick={() => set({ querImpressao: opt.val })} style={{
                  border: `${on ? 2 : 1}px solid ${on ? GOLD : LINE}`,
                  borderRadius: 12, padding: "16px 18px", cursor: "pointer",
                  background: on ? "#fdf9ef" : "#fff", textAlign: "left", transition: "all .18s",
                  display: "flex", alignItems: "flex-start", gap: 12,
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                    border: `2px solid ${on ? GOLD : LINE}`, background: on ? GOLD : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {on && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: on ? "#8A6A20" : "#1a1a1a" }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: MUTE, marginTop: 3, lineHeight: 1.5 }}>{opt.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
          {f.querImpressao === true && (
            <>
              <label className="lbl">Endereço completo</label>
              <textarea className="inp ta" rows={3} value={f.endereco}
                onChange={e => set({ endereco: e.target.value })}
                placeholder="Rua, número, complemento, bairro, cidade — UF, CEP 00000-000" />
              <p style={{ fontSize: 12, color: MUTE, marginTop: 4, lineHeight: 1.5 }}>
                Necessário para calcular o frete. O orçamento final será enviado por nossa equipe.
              </p>
            </>
          )}
        </>
      )}

      {/* ── Etapa 6 — Revisão Final ── */}
      {phase === 6 && (
        <>
          <p style={eyebrow}>Etapa 6</p>
          <h1 style={h1}>Revisão Final</h1>
          <p style={lede}>Confira os detalhes antes de criar sua obra.</p>
          <div className="fg sm" style={{ alignItems: "start" }}>
            <div style={card}>
              {f.fotos.length > 0 && (
                <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {f.fotos.slice(0, 4).map(foto => (
                    <div key={foto.id} style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                      <img src={foto.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                  {f.fotos.length > 4 && <span style={{ fontSize: 12, color: MUTE, alignSelf: "center" }}>+{f.fotos.length - 4}</span>}
                </div>
              )}
              <div style={{ height: 1, background: LINE, margin: "12px 0" }} />
              <ReviewRow label="Linguagem" value={f.linguagem} />
              {f.temas.length > 0 && <ReviewRow label="Tema" value={f.temas.join(", ")} />}
              {f.atmosfera && <ReviewRow label="Atmosfera" value={f.atmosfera} />}
              {f.paleta    && <ReviewRow label="Paleta" value={f.paleta} />}
              <ReviewRow label="Formato" value={FORMATOS.find(fm => fm.id === f.formato)?.name} />
              <ReviewRow label="Fundo" value={f.tipoFundo === "original" ? "Fundo original" : "Fundo liso"} />
              {f.querCenografia && <ReviewRow label="Cenografia" value="Exclusiva incluída · +R$ 140" gold />}
              <ReviewRow label="Impressão" value={f.querImpressao ? "Quero orçamento de impressão" : "Somente arquivo digital"} />
              {f.inspiracoes.length > 0 && <ReviewRow label="Inspirações" value={`${f.inspiracoes.length} obra(s) selecionada(s)`} />}
              <div style={{ height: 1, background: LINE, margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>Valor total</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: GOLD }}>R$ {totalPrice}</span>
              </div>
            </div>

            <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: 18, background: "#fff" }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase", color: MUTE, marginBottom: 14 }}>
                Pague via Pix
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                {qrUrl
                  ? <img src={qrUrl} alt="QR Code Pix" style={{ width: 96, height: 96, borderRadius: 8, flexShrink: 0, border: `0.5px solid ${LINE}` }} />
                  : <div style={{ width: 96, height: 96, borderRadius: 8, background: "#f5f4f2", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: MUTE }}>…</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: MUTE, marginBottom: 2 }}>Chave Pix</div>
                  <div style={{ fontSize: 13, fontWeight: 500, wordBreak: "break-all", marginBottom: 8 }}>{PIX_KEY}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", marginBottom: 10 }}>R$ {totalPrice}</div>
                  <button onClick={() => {
                    navigator.clipboard.writeText(PIX_KEY).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
                  }} style={{
                    fontSize: 12, padding: "5px 12px", border: `0.5px solid ${GOLD}`,
                    borderRadius: 6, cursor: "pointer", background: copied ? "#fdf9ef" : "#fff",
                    color: GOLD, fontWeight: 500,
                  }}>
                    {copied ? "Copiado ✓" : "Copiar chave"}
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 12, color: MUTE, marginTop: 12, lineHeight: 1.6 }}>
                Faça o Pix no valor exato e clique em <strong>"Criar minha obra"</strong> abaixo. Confirmamos o pagamento em instantes.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Footer navigation — sticky */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "12px 32px", zIndex: 20,
        background: "rgba(255,255,255,.96)", backdropFilter: "blur(10px)",
        borderTop: `1px solid ${LINE}`,
        display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16,
      }}>
        {phase === 2 && (
          <span style={{ fontSize: 12, color: MUTE, marginRight: "auto" }}>
            {!f.linguagem ? "Escolha a linguagem artística" : f.linguagem}
          </span>
        )}
        {phase < NUM_PHASES ? (
          <button className="primary"
            style={{ minWidth: 160, background: canNext ? GOLD : undefined, opacity: canNext ? 1 : 0.45 }}
            disabled={!canNext} onClick={goNext}>
            Continuar →
          </button>
        ) : (
          <button className="primary" style={{ minWidth: 240, background: GOLD }}
            disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Enviando…" : "Já paguei · criar minha obra →"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ── */

const eyebrow = { fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 10, fontWeight: 600 };
const h1      = { fontFamily: "'Montserrat', 'Outfit', system-ui, sans-serif", fontSize: 38, fontWeight: 800, lineHeight: 1.1, margin: "0 0 10px", letterSpacing: "-.02em", color: "#000" };
const lede    = { color: "#6b6b6b", fontSize: 15, lineHeight: 1.6, margin: "0 0 24px" };
const card    = { background: "#fff", border: "1px solid #ececec", borderRadius: 14, padding: "20px 22px", marginBottom: 14 };

function Accordion({ label, hint, badge, open, onToggle, locked, children }) {
  return (
    <div style={{ borderBottom: `1px solid ${LINE}`, marginBottom: 2, opacity: locked ? 0.4 : 1, transition: "opacity .2s" }}>
      <button onClick={locked ? undefined : onToggle} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 8,
        padding: "14px 0", background: "none", border: "none",
        cursor: locked ? "not-allowed" : "pointer", textAlign: "left",
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", flex: 1 }}>{label}</span>
        {locked
          ? <span style={{ fontSize: 11, color: MUTE, fontStyle: "italic" }}>disponível com Cenografia Exclusiva</span>
          : hint && <span style={{ fontSize: 11, color: MUTE }}>{hint}</span>
        }
        {!locked && badge && (
          <span style={{ fontSize: 11, fontWeight: 600, color: "#8A6A20", background: "#fdf0d0", borderRadius: 20, padding: "2px 8px" }}>{badge}</span>
        )}
        <span style={{ fontSize: 14, color: MUTE, transition: "transform .2s", transform: open && !locked ? "rotate(180deg)" : "none" }}>▾</span>
      </button>
      {!locked && open && (
        <div style={{ paddingBottom: 16 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function OptionIcon({ name, active, size = 44 }) {
  const c = active ? "#8A6A20" : "#1a1a1a";
  const g = { fill: "none", stroke: c, strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };
  const S = { width: size, height: size };
  const icons = {
    "Clássico":    <svg viewBox="0 0 44 44" {...S} {...g}><rect x="10" y="38" width="24" height="3" rx="1"/><rect x="14" y="10" width="4" height="28" rx="1"/><rect x="26" y="10" width="4" height="28" rx="1"/><rect x="8" y="6" width="28" height="4" rx="1"/><path d="M14 6C14 6 16 2 22 2C28 2 30 6 30 6"/></svg>,
    "Gráfico":     <svg viewBox="0 0 44 44" {...S} {...g}><rect x="4" y="8" width="22" height="17" rx="2"/><rect x="18" y="19" width="22" height="17" rx="2" fill={active?"#fdf9ef":"#f5f4f2"}/></svg>,
    "Pintórico":   <svg viewBox="0 0 44 44" {...S} {...g}><path d="M8 36C12 29 19 21 25 14C29 10 35 6 39 9C42 11 41 18 38 22C34 26 27 30 21 34C15 38 11 42 9 42C7 42 6 39 8 36Z"/></svg>,
    "Minimalista": <svg viewBox="0 0 44 44" {...S} {...g}><circle cx="22" cy="30" r="12"/><circle cx="22" cy="10" r="4"/></svg>,
    "Ilustrativo": <svg viewBox="0 0 44 44" {...S} {...g}><path d="M22 42V16"/><path d="M22 16C22 16 10 22 12 31C14 39 22 42 22 42"/><path d="M22 16C22 16 34 22 32 31C30 39 22 42 22 42"/><path d="M22 27C22 27 16 30 16 34"/><path d="M22 27C22 27 28 30 28 34"/></svg>,
    "Floral & Botânico": <svg viewBox="0 0 44 44" {...S} {...g}><line x1="22" y1="42" x2="22" y2="26"/><circle cx="22" cy="20" r="5"/><circle cx="22" cy="9" r="4"/><circle cx="12" cy="14" r="4"/><circle cx="32" cy="14" r="4"/><circle cx="12" cy="26" r="4"/><circle cx="32" cy="26" r="4"/></svg>,
    "Paisagem":    <svg viewBox="0 0 44 44" {...S} {...g}><path d="M2 38L14 19L24 29L30 21L42 38Z"/><circle cx="36" cy="12" r="6"/><line x1="2" y1="38" x2="42" y2="38"/></svg>,
    "Pessoas":     <svg viewBox="0 0 44 44" {...S} {...g}><circle cx="15" cy="11" r="5"/><circle cx="29" cy="11" r="5"/><path d="M8 40C8 28 13 18 22 18C31 18 36 28 36 40"/><path d="M8 27C14 34 30 34 36 27"/></svg>,
    "Pets":        <svg viewBox="0 0 44 44" {...S} {...g}><ellipse cx="22" cy="29" rx="7" ry="6"/><ellipse cx="10" cy="18" rx="4" ry="3.5"/><ellipse cx="18" cy="13" rx="3.5" ry="3"/><ellipse cx="26" cy="13" rx="3.5" ry="3"/><ellipse cx="34" cy="18" rx="4" ry="3.5"/></svg>,
    "Abstrato":    <svg viewBox="0 0 44 44" {...S} {...g}><circle cx="16" cy="16" r="10" fill={active?"#fdf9ef":"none"}/><rect x="22" y="24" width="18" height="14" rx="1"/><path d="M5 42L13 27L21 42Z"/></svg>,
    "Arquitetura": <svg viewBox="0 0 44 44" {...S} {...g}><path d="M4 40L4 18L22 6L40 18L40 40Z"/><path d="M16 40L16 30L28 30L28 40"/><rect x="6" y="22" width="7" height="7" rx="1"/><rect x="31" y="22" width="7" height="7" rx="1"/><line x1="2" y1="40" x2="42" y2="40"/></svg>,
    "Infantil":    <svg viewBox="0 0 44 44" {...S} {...g}><path d="M8 24C8 12 14 6 22 6C30 6 36 12 36 24"/><path d="M14 20C14 12 17 8 22 8C27 8 30 12 30 20"/><circle cx="22" cy="36" r="7"/></svg>,
    "Passatempos": <svg viewBox="0 0 44 44" {...S} {...g}><path d="M22 6L26 18L38 22L26 26L22 38L18 26L6 22L18 18Z"/><circle cx="8" cy="8" r="2" fill={c} stroke="none"/><circle cx="36" cy="8" r="2" fill={c} stroke="none"/><circle cx="8" cy="36" r="2" fill={c} stroke="none"/><circle cx="36" cy="36" r="2" fill={c} stroke="none"/></svg>,
    "Alegre":      <svg viewBox="0 0 44 44" {...S} {...g}><circle cx="22" cy="22" r="10"/><line x1="22" y1="4" x2="22" y2="8"/><line x1="22" y1="36" x2="22" y2="40"/><line x1="4" y1="22" x2="8" y2="22"/><line x1="36" y1="22" x2="40" y2="22"/><line x1="8.1" y1="8.1" x2="11" y2="11"/><line x1="33" y1="33" x2="35.9" y2="35.9"/><line x1="8.1" y1="35.9" x2="11" y2="33"/><line x1="33" y1="11" x2="35.9" y2="8.1"/></svg>,
    "Dramático":   <svg viewBox="0 0 44 44" {...S} {...g}><path d="M26 4L12 24H22L18 40L34 18H24L26 4Z"/></svg>,
    "Romântico":   <svg viewBox="0 0 44 44" {...S} {...g}><path d="M22 38C22 38 4 26 4 14C4 7 9 4 14 6C17 7 20 11 22 14C24 11 27 7 30 6C35 4 40 7 40 14C40 26 22 38 22 38Z"/></svg>,
    "Vintage":     <svg viewBox="0 0 44 44" {...S} {...g}><rect x="8" y="8" width="28" height="28" rx="3"/><rect x="12" y="12" width="20" height="20" rx="2"/><circle cx="22" cy="22" r="7"/><path d="M4 8C4 6 6 4 8 4"/><path d="M40 8C40 6 38 4 36 4"/><path d="M4 36C4 38 6 40 8 40"/><path d="M40 36C40 38 38 40 36 40"/></svg>,
    "Sofisticado": <svg viewBox="0 0 44 44" {...S} {...g}><rect x="4" y="22" width="20" height="20" rx="2" fill={active?"#fdf9ef":"#f5f4f2"}/><rect x="20" y="2" width="20" height="20" rx="2" fill={active?"#8A6A20":"#1a1a1a"} stroke="none"/></svg>,
    "Leve":        <svg viewBox="0 0 44 44" {...S} {...g}><circle cx="22" cy="12" r="7"/><path d="M2 28C8 24 12 32 20 28C28 24 32 32 40 28"/><path d="M2 38C8 34 12 42 20 38C28 34 32 42 40 38"/></svg>,
    "Colorido":    <svg viewBox="0 0 44 44" {...S} {...g}>{[[10,10],[22,10],[34,10],[10,22],[22,22],[34,22],[10,34],[22,34],[34,34]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={4.5} fill={[0,4,8].includes(i)?(active?"#8A6A20":"#1a1a1a"):"none"} stroke={c}/>)}</svg>,
    "Neutro":      <svg viewBox="0 0 44 44" {...S} {...g}><circle cx="22" cy="22" r="18"/><circle cx="22" cy="22" r="11"/><circle cx="22" cy="22" r="4"/></svg>,
  };
  return icons[name] || <svg viewBox="0 0 44 44" {...S} {...g}><circle cx="22" cy="22" r="14"/></svg>;
}

function ReviewRow({ label, value, gold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: "1px solid #fafaf9" }}>
      <span style={{ fontSize: 12, color: "#6b6b6b", letterSpacing: ".04em" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: gold ? "#c9a84c" : "#1a1a1a", textAlign: "right", maxWidth: "60%" }}>{value || "—"}</span>
    </div>
  );
}

function GallerySelector({ images, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter(x => x !== id));
    else if (selected.length < 3) onChange([...selected, id]);
  };
  const selectedImages = images.filter(img => selected.includes(img.id));

  if (images.length === 0) {
    return (
      <div style={{ padding: "16px", border: `1px dashed ${LINE}`, borderRadius: 10, textAlign: "center" }}>
        <p style={{ fontSize: 13, color: MUTE, margin: 0 }}>Galeria em breve — obras sendo adicionadas.</p>
      </div>
    );
  }

  return (
    <div>
      {selectedImages.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {selectedImages.map(img => (
            <div key={img.id} style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden", border: `2px solid ${GOLD}` }}>
              <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
          <span style={{ fontSize: 12, color: MUTE, alignSelf: "center" }}>{selected.length}/3</span>
        </div>
      )}
      <button className="ghost" onClick={() => setOpen(true)} style={{ fontSize: 13 }}>
        {selected.length === 0 ? "✦ Abrir galeria de inspirações" : "Editar seleção"}
      </button>
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(31,27,22,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100 }}
          onClick={() => setOpen(false)}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "22px 20px", maxWidth: 580, width: "100%", maxHeight: "85vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Galeria de inspirações</h3>
              <button className="ghost sm2" onClick={() => setOpen(false)}>Fechar</button>
            </div>
            <p style={{ fontSize: 13, color: MUTE, margin: "0 0 14px" }}>Selecione até 3 obras que combinam com o que você imagina.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {images.map(img => {
                const on = selected.includes(img.id);
                return (
                  <button key={img.id} onClick={() => toggle(img.id)} style={{
                    position: "relative", aspectRatio: "1/1", padding: 0,
                    border: on ? `2.5px solid ${GOLD}` : "2px solid transparent",
                    borderRadius: 10, overflow: "hidden", cursor: "pointer",
                    background: "#f5f4f2", transition: "border-color .15s",
                    boxShadow: on ? `0 0 0 2px rgba(201,168,76,.2)` : "none",
                  }}>
                    <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    {on && (
                      <span style={{
                        position: "absolute", top: 6, right: 6,
                        width: 22, height: 22, borderRadius: "50%",
                        background: GOLD, color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700,
                      }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
            <button className="primary" style={{ width: "100%", marginTop: 16, background: GOLD }}
              onClick={() => setOpen(false)}>
              Confirmar seleção ({selected.length}/3)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoZone({ items, max, onChange, label, hint }) {
  const ref = useRef();
  const add = (files) => {
    const arr = Array.from(files).slice(0, max - items.length);
    Promise.all(arr.map(file => new Promise(res => {
      const r = new FileReader();
      r.onload = () => res({ id: uid(), src: r.result, name: file.name, _file: file });
      r.readAsDataURL(file);
    }))).then(imgs => onChange([...items, ...imgs]));
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {items.length === 0 ? (
        <button onClick={() => ref.current.click()} style={{
          flex: 1, width: "100%", border: `1.5px dashed ${LINE}`, borderRadius: 12,
          padding: "1.5rem 1rem", textAlign: "center", cursor: "pointer",
          background: "#fafaf9", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", transition: "all .15s", minHeight: 200,
        }}>
          <div style={{ fontSize: 24, marginBottom: 6, color: GOLD }}>＋</div>
          <div style={{ fontSize: 13, color: MUTE }}>{label}</div>
          {hint && <div style={{ fontSize: 11, color: MUTE, marginTop: 3 }}>{hint}</div>}
        </button>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8, alignContent: "start" }}>
          {items.map(it => (
            <div key={it.id} style={{
              position: "relative", aspectRatio: "1/1", borderRadius: 10, overflow: "hidden",
              background: `center/cover no-repeat url(${it.src})`,
            }}>
              <button className="rm" onClick={() => onChange(items.filter(x => x.id !== it.id))}>×</button>
            </div>
          ))}
          {items.length < max && (
            <button onClick={() => ref.current.click()} style={{
              aspectRatio: "1/1", border: `1.5px dashed ${LINE}`, borderRadius: 10,
              background: "#fafaf9", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", transition: "all .15s",
            }}>
              <span style={{ fontSize: 22, color: GOLD }}>＋</span>
            </button>
          )}
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" multiple={max > 1} hidden onChange={e => add(e.target.files)} />
    </div>
  );
}

function SuccessScreen() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
      <h2 style={{ fontFamily: "'Outfit', system-ui, sans-serif", fontSize: 28, fontWeight: 700, color: "#0d0d0d", marginBottom: 12 }}>
        Pedido recebido!
      </h2>
      <p style={{ fontSize: 15, color: "#6b6b6b", lineHeight: 1.7, maxWidth: 380, margin: "0 auto" }}>
        Confirmamos seu Pix e em breve nossa equipe começa a criar sua obra. Você receberá uma prévia para aprovação.
      </p>
    </div>
  );
}
