import React, { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createOrder } from "@/lib/orders.functions";
import { MUTE } from "../constants.js";
import { S } from "../styles.js";

export default function NewOrderModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ client_name: "", client_email: "", style: "", people_count: 1, include_pet: false, notes: "" });
  const [saving, setSaving] = useState(false);
  const create = useServerFn(createOrder);

  const save = async () => {
    if (!form.client_name || !form.client_email) { alert("Preencha nome e e-mail."); return; }
    setSaving(true);
    try { await create({ data: form }); onCreated(); }
    catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={S.modalBg} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={S.h2}>Novo pedido</h2>
        <label className="lbl">Nome do cliente</label>
        <input className="inp" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
        <label className="lbl">E-mail do cliente</label>
        <input className="inp" type="email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} />
        <label className="lbl">Estilo</label>
        <input className="inp" value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} placeholder="aquarela, óleo, sketch…" />
        <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
          <div style={{ flex: 1 }}>
            <label className="lbl">Pessoas</label>
            <select className="inp" value={form.people_count} onChange={(e) => setForm({ ...form, people_count: Number(e.target.value) })}>
              <option value={1}>1 pessoa</option>
              <option value={2}>2 pessoas</option>
            </select>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center", paddingBottom: 12 }}>
              <input type="checkbox" checked={form.include_pet} onChange={(e) => setForm({ ...form, include_pet: e.target.checked })} /> Inclui pet
            </label>
          </div>
        </div>
        <label className="lbl">Observações</label>
        <textarea className="inp ta" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button className="primary block" disabled={saving} style={{ marginTop: 14 }} onClick={save}>{saving ? "Salvando…" : "Criar pedido"}</button>
        <button className="ghost block" style={{ marginTop: 8 }} onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}
