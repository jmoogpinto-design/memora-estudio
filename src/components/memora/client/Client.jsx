import React, { useState, useEffect, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listMyOrders, getMyProfile, listMosaicImages } from "@/lib/orders.functions";
import { SERIF, MUTE, GOLD } from "../constants.js";
import { normalizeDbOrder } from "../helpers.js";
import { S } from "../styles.js";
import NewOrder from "./NewOrder.jsx";
import ClientDetail from "./ClientDetail.jsx";
import ProfileSetup from "./ProfileSetup.jsx";

const CLIENT_STEPS = ["Confirmando Pix", "Em criação", "Prévia · 24h", "Arquivo final"];
const CLIENT_STEP = { recebido: 0, producao: 1, aprovacao: 2, ajustes: 1, finalizado: 3 };

const BADGE_S = {
  recv:  { background: "#FFF8E6", color: "#8A5F00", border: "0.5px solid #E8C96A" },
  prod:  { background: "#E8F0FE", color: "#1A4A9A", border: "0.5px solid #9AB8F0" },
  aprov: { background: "#FFF0E6", color: "#8A3A00", border: "0.5px solid #E8A06A" },
  done:  { background: "#E8F5E9", color: "#1A6A2A", border: "0.5px solid #8ACA9A" },
};

const CLIENT_BADGE = {
  recebido:   { label: "Confirmando Pix", s: BADGE_S.recv },
  producao:   { label: "Em criação",      s: BADGE_S.prod },
  aprovacao:  { label: "Prévia pronta",   s: BADGE_S.aprov },
  ajustes:    { label: "Em ajustes",      s: BADGE_S.recv },
  finalizado: { label: "Arquivo pronto",  s: BADGE_S.done },
};

function GalleryMosaic() {
  const [images, setImages] = useState([]);
  const fetchMosaic = useServerFn(listMosaicImages);

  useEffect(() => {
    fetchMosaic().then(urls => {
      if (urls?.length) setImages(urls);
    }).catch(() => {});
  }, []);

  if (images.length === 0) return null;

  return (
    <div style={{ margin: "40px 0 0", display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
      {images.map((url, i) => (
        <div key={i} style={{ flexShrink: 0, width: 140, height: 190, borderRadius: 14, overflow: "hidden" }}>
          <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={e => { e.target.parentElement.style.display = "none"; }} />
        </div>
      ))}
    </div>
  );
}

export default function Client({ user, homeKey }) {
  const [view, setView] = useState({ name: "dash" });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileDone, setProfileDone] = useState(null); // null = loading, true/false
  const fetchMyOrders = useServerFn(listMyOrders);
  const fetchMyProfile = useServerFn(getMyProfile);

  useEffect(() => { if (homeKey > 0) setView({ name: "dash" }); }, [homeKey]);

  const refresh = useCallback(async () => {
    try {
      const [data, profile] = await Promise.all([fetchMyOrders(), fetchMyProfile()]);
      setOrders(data.map(normalizeDbOrder));
      setProfileDone(!!(profile?.whatsapp));
    } catch (e) {
      console.error("Erro ao carregar:", e);
      setProfileDone(true); // em caso de erro, não bloqueia
    } finally {
      setLoading(false);
    }
  }, [fetchMyOrders, fetchMyProfile]);

  useEffect(() => { refresh(); }, [refresh]);

  if (view.name === "new")
    return <NewOrder user={user} onCancel={() => setView({ name: "dash" })}
      onSuccess={() => { setView({ name: "dash" }); refresh(); }} />;

  if (view.name === "detail") {
    const order = orders.find(o => o.id === view.id);
    if (!order) return null;
    return <ClientDetail order={order} back={() => { setView({ name: "dash" }); refresh(); }} />;
  }

  if (loading || profileDone === null) return <div style={{ padding: 60, textAlign: "center", color: MUTE }}>Carregando…</div>;

  if (!profileDone) return <ProfileSetup user={user} onComplete={() => setProfileDone(true)} />;

  const isFirstTime = orders.length === 0;

  return (
    <div className="reveal">
      {isFirstTime ? (
        <>
          <p style={S.eyebrow}>Bem-vinda ao Memora Estúdio</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", margin: "24px 0 40px" }}>
            {/* Esquerda */}
            <div>
              <h1 style={{ ...S.h1, marginBottom: 20 }}>Já tem a <em>sua ideia?</em></h1>
              <p style={{ fontSize: 15, color: MUTE, lineHeight: 1.7, maxWidth: 380 }}>
                Nos envie a foto que deseja transformar em obra de arte,
                e conta a sua história. Em até 24h você recebe a prévia.
              </p>
            </div>

            {/* Direita */}
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 32px", marginBottom: 24 }}>
                {[
                  "Escolha as fotos",
                  "Conte a história",
                  "Acompanhe a criação",
                  "Aprove a prévia",
                  "Receba sua obra",
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                      border: `1.5px solid ${GOLD}`, color: GOLD,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 600,
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>{step}</span>
                  </div>
                ))}
              </div>
              <button className="primary" style={{ background: GOLD, borderRadius: 50, padding: "14px 28px", fontSize: 14 }}
                onClick={() => setView({ name: "new" })}>
                Criar meu retrato agora
              </button>
            </div>
          </div>
          <GalleryMosaic />
        </>
      ) : (
        <>
          <div style={S.dashHead}>
            <div>
              <p style={S.eyebrow}>Bem-vinda de volta</p>
              <h1 style={S.h1}>Meu <em>Retrato</em></h1>
            </div>
            <button className="primary" onClick={() => setView({ name: "new" })}>+ Novo retrato</button>
          </div>
          <div style={S.grid}>
            {orders.map(o => <OrderCard key={o.id} o={o} onOpen={() => setView({ name: "detail", id: o.id })} />)}
          </div>
        </>
      )}
    </div>
  );
}

function OrderCard({ o, onOpen }) {
  const { label: badgeLabel, s: badgeStyle } = CLIENT_BADGE[o.status] || CLIENT_BADGE.recebido;
  const current = CLIENT_STEP[o.status] ?? 0;

  return (
    <div style={{ ...S.card, cursor: "pointer" }} onClick={onOpen}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            {o.estilo || "Retrato personalizado"}
          </div>
          <div style={{ fontSize: 12, color: MUTE, marginTop: 2 }}>Pedido em {o.date}</div>
        </div>
        <span style={{ ...badgeStyle, display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.03em", whiteSpace: "nowrap", marginLeft: 8 }}>
          {badgeLabel}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        {CLIENT_STEPS.map((label, i) => (
          <React.Fragment key={label}>
            {i > 0 && (
              <div style={{ flex: 1, height: 0.5, background: i <= current ? "#B8861A" : "#e8e4dc", margin: "0 4px" }} />
            )}
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 500, flexShrink: 0,
              background: i < current ? "#B8861A" : i === current ? "#1a1a1a" : "#f5f4f2",
              color: i <= current ? "#fff" : MUTE,
              border: i > current ? "0.5px solid #ccc" : "none",
            }}>
              {i < current ? "✓" : i + 1}
            </div>
          </React.Fragment>
        ))}
      </div>

      <div style={{ fontSize: 13, color: "#B8861A", fontWeight: 500 }}>
        {o.status === "aprovacao" ? "Ver prévia →" : o.status === "finalizado" ? "Baixar arquivo →" : "Ver detalhes →"}
      </div>
    </div>
  );
}
