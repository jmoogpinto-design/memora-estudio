import React, { useState, useEffect, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listOrders, createOrder, claimFirstAdmin } from "@/lib/orders.functions";
import { STATUS_LABELS, MUTE } from "../constants.js";
import { S } from "../styles.js";
import AdminCloudDetail from "./AdminCloudDetail.jsx";
import NewOrderModal from "./NewOrderModal.jsx";

export default function AdminCloud() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const fetchOrders = useServerFn(listOrders);
  const claim = useServerFn(claimFirstAdmin);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchOrders().then((d) => { setOrders(d); setLoading(false); })
      .catch((e) => { console.error(e); setLoading(false); });
  }, [fetchOrders]);

  useEffect(() => { refresh(); }, [refresh]);

  if (openId) {
    const order = orders.find((o) => o.id === openId);
    if (!order) { setOpenId(null); return null; }
    return <AdminCloudDetail order={order} back={() => { setOpenId(null); refresh(); }} onChanged={refresh} />;
  }

  return (
    <div className="reveal">
      <div style={S.dashHead}>
        <div><p style={S.eyebrow}>Ateliê</p><h1 style={S.h1}>Todos os <em>pedidos</em></h1></div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ghost sm2" onClick={() => setShowClaim(true)}>Sou o ateliê</button>
          <button className="primary" onClick={() => setShowNew(true)}>+ Novo pedido</button>
        </div>
      </div>

      {loading ? <p style={{ color: MUTE }}>Carregando pedidos…</p> : (
        <table style={S.table}>
          <thead><tr><th>Pedido</th><th>Cliente</th><th>E-mail</th><th>Estilo</th><th>Pessoas</th><th>Pet</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="trow">
                <td><strong>#{o.id.slice(0, 8)}</strong></td>
                <td>{o.client_name}</td>
                <td style={{ color: MUTE }}>{o.client_email}</td>
                <td>{o.style || "—"}</td>
                <td>{o.people_count}</td>
                <td>{o.include_pet ? "Sim" : "—"}</td>
                <td><span className="chip on" style={{ fontSize: 12 }}>{STATUS_LABELS[o.status] || o.status}</span></td>
                <td><button className="ghost sm2" onClick={() => setOpenId(o.id)}>Abrir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && orders.length === 0 && <p style={{ color: MUTE, marginTop: 20 }}>Ainda não há pedidos. Clique em "+ Novo pedido".</p>}

      {showNew && <NewOrderModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); refresh(); }} />}
      {showClaim && (
        <div style={S.modalBg} onClick={() => setShowClaim(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={S.h2}>Tornar-se administradora</h2>
            <p style={{ color: MUTE, fontSize: 14 }}>Só funciona se ainda não houver nenhum admin no sistema. Use uma única vez, depois esconda este botão.</p>
            <button className="primary block" style={{ marginTop: 12 }} onClick={async () => {
              try { await claim(); alert("Pronto! Recarregue a página."); window.location.reload(); }
              catch (e) { alert(e.message); }
            }}>Quero ser admin</button>
            <button className="ghost block" style={{ marginTop: 8 }} onClick={() => setShowClaim(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
