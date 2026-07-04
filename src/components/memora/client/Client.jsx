import React, { useState, useEffect, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listMyOrders } from "@/lib/orders.functions";
import { STYLES, STATUSES, SERIF, MUTE, GOLD, INK, LINE } from "../constants.js";
import { normalizeDbOrder, fmtFormato } from "../helpers.js";
import { S } from "../styles.js";
import { Frame, StatusTag } from "../ui/pieces.jsx";
import NewOrder from "./NewOrder.jsx";
import ClientDetail from "./ClientDetail.jsx";
import drawing from "@/assets/login-drawing.jpg";

export default function Client({ user }) {
  const [view, setView] = useState({ name: "dash" });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchMyOrders = useServerFn(listMyOrders);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchMyOrders();
      setOrders(data.map(normalizeDbOrder));
    } catch (e) {
      console.error("Erro ao carregar pedidos:", e);
    } finally {
      setLoading(false);
    }
  }, [fetchMyOrders]);

  useEffect(() => { refresh(); }, [refresh]);

  if (view.name === "new")
    return <NewOrder cliente={user.cliente} onCancel={() => setView({ name: "dash" })}
      onSuccess={() => { setView({ name: "dash" }); refresh(); }} />;

  if (view.name === "detail") {
    const order = orders.find((o) => o.id === view.id);
    if (!order) return null;
    return <ClientDetail order={order} back={() => setView({ name: "dash" })}
      update={(patch) => setOrders((p) => p.map((o) => (o.id === order.id ? { ...o, ...patch } : o)))} />;
  }

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: MUTE }}>Carregando seus pedidos…</div>;

  if (orders.length === 0) return <Welcome onStart={() => setView({ name: "new" })} />;

  return (
    <div className="reveal">
      <div style={S.dashHead}>
        <div><p style={S.eyebrow}>Bem-vinda de volta</p><h1 style={S.h1}>Meu <em>Retrato</em></h1></div>
        <button className="primary" onClick={() => setView({ name: "new" })}>+ Começar um retrato</button>
      </div>
      <div style={S.grid}>{orders.map((o) => <OrderCard key={o.id} o={o} onOpen={() => setView({ name: "detail", id: o.id })} />)}</div>
    </div>
  );
}

function Welcome({ onStart }) {
  const steps = [
    "Escolha as fotos",
    "Conte a história",
    "Acompanhe a criação",
    "Aprove a prévia",
    "Receba sua obra",
  ];
  const num = (n) => ({
    width: 30, height: 30, borderRadius: "50%", border: `1.5px solid ${GOLD}`,
    color: GOLD, display: "grid", placeItems: "center", fontSize: 14, fontWeight: 600,
    fontFamily: SERIF, flex: "0 0 auto",
  });
  const stepRow = { display: "flex", alignItems: "center", gap: 14, minHeight: 44 };
  const stepTxt = { fontSize: 16, fontWeight: 600, color: INK, letterSpacing: "-.01em" };
  return (
    <div className="reveal">
      <div className="welcomeGrid">
        <div>
          <p style={S.eyebrow}>Bem-vinda ao Memora Estúdio</p>
          <h1 style={{ ...S.h1, fontSize: 56 }}>Já tem a sua ideia?</h1>
          <p style={{ ...S.lede, maxWidth: 460 }}>
            Nos envie a foto que deseja transformar em obra de arte, e conta a sua história. Em até 24h você recebe a prévia.
          </p>
        </div>
        <div className="welcomeSteps">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {steps.slice(0, 3).map((s, i) => (
              <div key={s} style={stepRow}><span style={num(i + 1)}>{i + 1}</span><span style={stepTxt}>{s}</span></div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {steps.slice(3).map((s, i) => (
              <div key={s} style={stepRow}><span style={num(i + 4)}>{i + 4}</span><span style={stepTxt}>{s}</span></div>
            ))}
            <button
              onClick={onStart}
              style={{
                marginTop: 8, background: GOLD, color: "#fff", border: "none",
                padding: "14px 24px", borderRadius: 999, fontSize: 15, fontWeight: 600,
                cursor: "pointer", alignSelf: "flex-start",
              }}
            >
              Criar meu retrato agora
            </button>
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${LINE}`, marginTop: 56, paddingTop: 40 }}>
        <div className="welcomeStrip">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="stripItem">
              <img src={drawing} alt="Processo de criação" loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .welcomeGrid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 60px;
          align-items: start;
          padding-top: 20px;
        }
        .welcomeSteps {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          padding-top: 40px;
        }
        .welcomeStrip {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 14px;
        }
        .stripItem {
          aspect-ratio: 1 / 1;
          border-radius: 6px;
          overflow: hidden;
          background: #eee;
        }
        .stripItem img { width: 100%; height: 100%; object-fit: cover; display: block; }
        @media (max-width: 960px) {
          .welcomeGrid { grid-template-columns: 1fr; gap: 32px; }
          .welcomeSteps { padding-top: 0; }
          .welcomeStrip { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 560px) {
          .welcomeSteps { grid-template-columns: 1fr; }
          .welcomeStrip { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  );
}

function OrderCard({ o, onOpen }) {
  const st = STATUSES[o.status] || STATUSES.recebido;
  const style = STYLES.find((s) => s.id === o.estilo);
  return (
    <button className="ordercard" onClick={onOpen}>
      <Frame fill={st.fill} tone={o.fotos[0]?.tone || "#d8c9b4"} src={o.fotos[0]?.src} />
      <div style={{ padding: "16px 18px 18px" }}>
        <div style={S.cardTop}><span style={S.orderNo}>#{o.shortId || o.id}</span><StatusTag status={o.status} /></div>
        <p style={S.cardPara}>{style?.name || "Retrato personalizado"}</p>
        <p style={S.cardMeta}>{fmtFormato(o) || "Formato a definir"} · {o.date}</p>
        <span className="link">Ver detalhes →</span>
      </div>
    </button>
  );
}
