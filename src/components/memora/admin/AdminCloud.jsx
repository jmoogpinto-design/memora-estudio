import React, { useState, useCallback, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listOrders } from "@/lib/orders.functions";
import { MUTE } from "../constants.js";
import { S } from "../styles.js";
import AdminCloudDetail from "./AdminCloudDetail.jsx";
import NewOrderModal from "./NewOrderModal.jsx";

const TABS = [
  { id: "all", label: "Todos" },
  { id: "awaiting_photos", label: "Recebidos" },
  { id: "in_production", label: "Em produção" },
  { id: "versions_sent", label: "Aguard. aprovação" },
  { id: "concluded", label: "Concluídos" },
];

const BADGE_S = {
  recv:  { background: "#FFF8E6", color: "#8A5F00", border: "0.5px solid #E8C96A" },
  prod:  { background: "#E8F0FE", color: "#1A4A9A", border: "0.5px solid #9AB8F0" },
  aprov: { background: "#FFF0E6", color: "#8A3A00", border: "0.5px solid #E8A06A" },
  done:  { background: "#E8F5E9", color: "#1A6A2A", border: "0.5px solid #8ACA9A" },
};

function getBadge(status) {
  if (status === "in_production") return { label: "Em produção", s: BADGE_S.prod };
  if (status === "versions_sent") return { label: "Aguard. aprovação", s: BADGE_S.aprov };
  if (status === "approved") return { label: "Aprovado", s: BADGE_S.done };
  if (status === "completed") return { label: "Concluído", s: BADGE_S.done };
  return { label: "Recebido", s: BADGE_S.recv };
}

function initials(name = "") {
  return name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("") || "?";
}

export default function AdminCloud({ homeKey }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [tab, setTab] = useState("all");
  const fetchOrders = useServerFn(listOrders);

  useEffect(() => { if (homeKey > 0) { setOpenId(null); setShowNew(false); } }, [homeKey]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchOrders().then(d => { setOrders(d); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  }, [fetchOrders]);

  useEffect(() => { refresh(); }, [refresh]);

  if (openId) {
    const order = orders.find(o => o.id === openId);
    if (!order) { setOpenId(null); return null; }
    return <AdminCloudDetail order={order} back={() => { setOpenId(null); refresh(); }} onChanged={refresh} />;
  }

  const active = orders.filter(o => !["approved", "completed"].includes(o.status)).length;
  const pending = orders.filter(o => o.status === "versions_sent").length;
  const done = orders.filter(o => ["approved", "completed"].includes(o.status)).length;

  const visible = tab === "all" ? orders
    : tab === "concluded" ? orders.filter(o => ["approved", "completed"].includes(o.status))
    : orders.filter(o => o.status === tab);

  return (
    <div className="reveal">
      <div style={S.dashHead}>
        <div><p style={S.eyebrow}>Ateliê</p><h1 style={S.h1}>Todos os <em>pedidos</em></h1></div>
        <button className="primary" onClick={() => setShowNew(true)}>+ Novo pedido</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {[["Pedidos ativos", active], ["Aguardando aprovação", pending], ["Concluídos", done]].map(([k, v]) => (
          <div key={k} style={{ background: "#f5f4f2", borderRadius: 8, padding: "12px 14px", border: "0.5px solid #e8e4dc" }}>
            <div style={{ fontSize: 22, fontWeight: 500 }}>{v}</div>
            <div style={{ fontSize: 11, color: MUTE, marginTop: 2 }}>{k}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", borderBottom: "0.5px solid #e8e4dc", marginBottom: 16 }}>
        {TABS.map(t => (
          <div key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 14px", fontSize: 13, cursor: "pointer",
            color: tab === t.id ? "#1a1a1a" : MUTE, fontWeight: tab === t.id ? 500 : 400,
            borderBottom: tab === t.id ? "2px solid #B8861A" : "2px solid transparent",
            marginBottom: -1,
          }}>{t.label}</div>
        ))}
      </div>

      {loading ? (
        <p style={{ color: MUTE, padding: "20px 0" }}>Carregando…</p>
      ) : (
        <div style={{ ...S.card, padding: "4px 14px" }}>
          {visible.length === 0 && (
            <p style={{ color: MUTE, fontSize: 13, padding: "14px 0" }}>Nenhum pedido nesta categoria.</p>
          )}
          {visible.map(o => {
            const { label, s } = getBadge(o.status);
            return (
              <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "0.5px solid #eeebe4" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F0E8D8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "#8A6A30", flexShrink: 0 }}>
                  {initials(o.client_name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {o.client_name} <span style={{ color: MUTE, fontWeight: 400 }}>#{o.id.slice(0, 8)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: MUTE }}>
                    {o.style || "—"} · {new Date(o.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                  </div>
                </div>
                <span style={{ ...s, display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
                  {label}
                </span>
                <button className="ghost sm2" onClick={() => setOpenId(o.id)}>Ver pedido →</button>
              </div>
            );
          })}
        </div>
      )}

      {showNew && <NewOrderModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); refresh(); }} />}
    </div>
  );
}
