import React, { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getSignedVersionUrls, approveClientVersion } from "@/lib/orders.functions";
import { MUTE } from "../constants.js";
import { S } from "../styles.js";

function OrderPhotos({ paths }) {
  const [urls, setUrls] = useState([]);
  const getUrls = useServerFn(getSignedVersionUrls);
  useEffect(() => {
    if (!paths.length) return;
    getUrls({ data: { paths } }).then(arr => setUrls(arr.map(x => x.url).filter(Boolean)));
  }, [paths.join(",")]);
  if (!urls.length) return <p style={{ fontSize: 13, color: MUTE }}>Carregando fotos…</p>;
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
      {urls.map((url, i) => (
        <a key={i} href={url} target="_blank" rel="noreferrer">
          <img src={url} alt={`Foto ${i + 1}`} style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 8, border: "0.5px solid #e8e4dc" }} />
        </a>
      ))}
    </div>
  );
}

const STEPS = ["Confirmando Pix", "Em criação", "Prévia pronta", "Arquivo final"];
const STATUS_STEP = { recebido: 0, producao: 1, aprovacao: 2, ajustes: 1, finalizado: 3 };
const STATUS_HINT = {
  recebido: "Confirmando seu Pix — assim que recebermos, sua obra entra em criação.",
  producao: "Sua obra está sendo criada. Prévia em até 24h.",
  ajustes: "A artista está refinando sua obra. Em breve você receberá a nova versão.",
};

function StepTracker({ status }) {
  const current = STATUS_STEP[status] ?? 0;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", margin: "16px 0" }}>
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          {i > 0 && (
            <div style={{ flex: 1, height: 0.5, background: i <= current ? "#B8861A" : "#e8e4dc", margin: "10px 6px 0" }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 500, flexShrink: 0,
              background: i < current ? "#B8861A" : i === current ? "#1a1a1a" : "#f5f4f2",
              color: i <= current ? "#fff" : MUTE,
              border: i > current ? "0.5px solid #ccc" : "none",
            }}>
              {i < current ? "✓" : i + 1}
            </div>
            <div style={{ fontSize: 10, color: i === current ? "#1a1a1a" : MUTE, fontWeight: i === current ? 500 : 400, textAlign: "center", maxWidth: 60 }}>
              {label}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function ClientDetail({ order, back }) {
  const [versionUrls, setVersionUrls] = useState({});
  const [wantsAdj, setWantsAdj] = useState(null);
  const [adjText, setAdjText] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const signedUrls = useServerFn(getSignedVersionUrls);
  const approve = useServerFn(approveClientVersion);

  const versoes = (order.versoes || []).sort((a, b) => {
    const na = parseInt(a.nome?.replace(/\D/g, "")) || 0;
    const nb = parseInt(b.nome?.replace(/\D/g, "")) || 0;
    return na - nb;
  });

  useEffect(() => {
    const paths = versoes.map(v => v.storage_path).filter(Boolean);
    if (!paths.length) return;
    signedUrls({ data: { paths } }).then(arr => {
      const map = {};
      arr.forEach(x => { map[x.path] = x.url; });
      setVersionUrls(map);
    });
  }, [order.id]);

  const handleApprove = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await approve({
        data: {
          order_id: order.id,
          chosen_version: 1,
          adjustment_notes: wantsAdj === "sim" ? (adjText.trim() || null) : null,
        },
      });
      setConfirmed(true);
      setTimeout(() => back(), 3000);
    } catch (e) { alert(e.message); }
    finally { setBusy(false); }
  };

  if (confirmed) {
    return (
      <div className="reveal" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: "60px 0" }}>
        <div style={{ fontSize: 36, marginBottom: 14 }}>{wantsAdj === "sim" ? "✏️" : "✓"}</div>
        <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>
          {wantsAdj === "sim" ? "Pedido de ajuste enviado" : "Prévia aprovada!"}
        </div>
        <div style={{ fontSize: 14, color: MUTE, maxWidth: 320, margin: "0 auto", lineHeight: 1.6 }}>
          {wantsAdj === "sim"
            ? "A artista vai fazer o ajuste e entregar o arquivo final em até 48h."
            : "Ótimo! O arquivo final em alta resolução ficará disponível aqui em até 48h."}
        </div>
      </div>
    );
  }

  const isApproval = order.status === "aprovacao";
  const isFinalizado = order.status === "finalizado";

  return (
    <div className="reveal" style={{ maxWidth: 620, margin: "0 auto" }}>
      <button className="ghost sm" onClick={back}>← Meus retratos</button>

      {isApproval ? (
        <>
          <div style={{ textAlign: "center", padding: "24px 0 16px" }}>
            <div style={{ fontSize: 11, color: "#B8861A", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>
              Prévia pronta
            </div>
            <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>Sua prévia está pronta</div>
            <div style={{ fontSize: 14, color: MUTE, lineHeight: 1.5 }}>
              Veja com atenção e nos diga se quer aprovar ou pedir um ajuste — você tem direito a 1 ajuste incluído.
            </div>
          </div>

          {versoes.length === 0 && (
            <p style={{ textAlign: "center", color: MUTE, marginTop: 20 }}>A imagem está sendo preparada…</p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {versoes.map((v) => {
              const url = versionUrls[v.storage_path];
              return (
                <div key={v.id} style={{ borderRadius: 12, overflow: "hidden", border: "1.5px solid #e8e4dc" }}>
                  {url
                    ? <img src={url} alt={v.nome} style={{ width: "100%", display: "block" }} />
                    : <div style={{ height: 260, background: "#f5f4f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 28, color: "#ccc" }}>⊡</span>
                      </div>
                  }
                </div>
              );
            })}
          </div>

          <section style={S.card}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>O que você acha?</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[["nao", "Ficou perfeita assim ✓"], ["sim", "Quero um ajuste incluído"]].map(([val, lbl]) => (
                <div key={val} onClick={() => setWantsAdj(val)} style={{
                  flex: 1, textAlign: "center", padding: "10px 8px", fontSize: 13, cursor: "pointer",
                  border: wantsAdj === val ? "1.5px solid #B8861A" : "0.5px solid #ccc",
                  borderRadius: 8, background: wantsAdj === val ? "#fff9f0" : "transparent",
                  transition: "border-color 0.15s",
                }}>{lbl}</div>
              ))}
            </div>
            {wantsAdj === "sim" && (
              <textarea className="inp ta" rows={3} value={adjText} onChange={e => setAdjText(e.target.value)}
                placeholder="Descreva o ajuste… ex: 'a cor do fundo poderia ser um pouco mais escura'"
                style={{ marginBottom: 10 }}
              />
            )}
            {wantsAdj !== null && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="primary" onClick={handleApprove}
                  disabled={busy || (wantsAdj === "sim" && !adjText.trim())}>
                  {busy ? "Enviando…" : "Enviar resposta →"}
                </button>
              </div>
            )}
          </section>
        </>
      ) : isFinalizado ? (
        <>
          <div style={{ textAlign: "center", padding: "24px 0 16px" }}>
            <div style={{ fontSize: 11, color: "#1A6A2A", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>
              Arquivo pronto
            </div>
            <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>Sua obra está pronta</div>
            <div style={{ fontSize: 14, color: MUTE, lineHeight: 1.5 }}>
              Baixe o arquivo em alta resolução e leve para impressão onde preferir.
            </div>
          </div>
          <StepTracker status={order.status} />
          {versoes.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {versoes.map((v) => {
                const url = versionUrls[v.storage_path];
                return url ? (
                  <div key={v.id} style={{ borderRadius: 12, overflow: "hidden", border: "1.5px solid #e8e4dc" }}>
                    <img src={url} alt={v.nome} style={{ width: "100%", display: "block" }} />
                    <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 12, color: MUTE }}>Arquivo final · alta resolução</div>
                      <a href={url} download target="_blank" rel="noreferrer"
                        style={{
                          fontSize: 13, fontWeight: 500, padding: "6px 16px",
                          background: "#1a1a1a", color: "#fff", borderRadius: 8, textDecoration: "none",
                          display: "inline-block",
                        }}>
                        Baixar arquivo
                      </a>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <div style={S.detailHead}>
            <div>
              <p style={S.eyebrow}>Pedido #{order.shortId || order.id?.slice(0, 8)}</p>
              <h1 style={S.h1}>Seu retrato</h1>
            </div>
          </div>
          <StepTracker status={order.status} />
          {STATUS_HINT[order.status] && (
            <p style={{ color: MUTE, fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>{STATUS_HINT[order.status]}</p>
          )}

          {/* Fotos enviadas */}
          {order.fotos?.length > 0 && (
            <section style={{ ...S.card, marginBottom: 12 }}>
              <h2 style={S.h2}>Fotos enviadas</h2>
              <OrderPhotos paths={order.fotos.map(f => f.path).filter(Boolean)} />
            </section>
          )}

          <section style={S.card}>
            <h2 style={S.h2}>Resumo do seu pedido</h2>
            {[
              order.destinatario  ? ["Para quem", { "para-mim": "Para mim", "presente": "Presente", "casal": "Casal", "familia": "Família" }[order.destinatario] || order.destinatario] : null,
              order.nomeRetrato   ? ["Sobre quem", order.nomeRetrato] : null,
              order.estilo        ? ["Estilo", order.estilo] : null,
              order.clima?.length ? ["Clima", order.clima.join(", ")] : null,
              order.tons?.length  ? ["Tons", order.tons.join(", ")] : null,
              order.personalidades?.length ? ["Personalidade", order.personalidades.join(", ")] : null,
              order.tamanho       ? ["Tamanho", { essencial: "Essencial · A4 · 21×30cm", classico: "Clássico · A3 · 30×42cm", grande: "Grande · 40×60cm", especial: "Especial · 60×90cm" }[order.tamanho] || order.tamanho] : null,
              order.notas         ? ["Notas", order.notas] : null,
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 12, padding: "7px 0", fontSize: 13, borderBottom: "0.5px solid #f0ede8" }}>
                <div style={{ color: MUTE, width: 120, flexShrink: 0 }}>{k}</div>
                <div style={{ lineHeight: 1.5 }}>{v}</div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
