import React, { useState, useEffect, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listMyOrders } from "@/lib/orders.functions";
import { STYLES, STATUSES, SERIF, MUTE } from "../constants.js";
import { normalizeDbOrder, fmtFormato } from "../helpers.js";
import { S } from "../styles.js";
import { Frame, StatusTag } from "../ui/pieces.jsx";
import NewOrder from "./NewOrder.jsx";
import ClientDetail from "./ClientDetail.jsx";

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

  return (
    <div className="reveal">
      <div style={S.dashHead}>
        <div><p style={S.eyebrow}>Bem-vinda de volta</p><h1 style={S.h1}>Meu <em>Retrato</em></h1></div>
        <button className="primary" onClick={() => setView({ name: "new" })}>+ Começar um retrato</button>
      </div>
      {orders.length === 0 ? (
        <div style={S.empty}>
          <p style={{ fontSize: 18, fontFamily: SERIF }}>Já tem a sua ideia?</p>
          <p style={{ color: MUTE, marginTop: 6 }}>Cada coleção tem um estilo artístico único. Escolha a que combina com você.</p>
          <button className="primary" style={{ marginTop: 20 }} onClick={() => setView({ name: "new" })}>Criar o meu quadro</button>
        </div>
      ) : (
        <div style={S.grid}>{orders.map((o) => <OrderCard key={o.id} o={o} onOpen={() => setView({ name: "detail", id: o.id })} />)}</div>
      )}
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
