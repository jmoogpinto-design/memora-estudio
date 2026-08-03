import React, { useState, useEffect, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { updateOrderStatus, upsertVersion, getSignedVersionUrls, updateOrderPrice, markOrderPaid } from "@/lib/orders.functions";
import QRCode from "qrcode";
import { buildPixPayload } from "@/lib/pix";
import { PIX_KEY, PIX_NAME, PIX_CITY, MUTE } from "../constants.js";
import { S } from "../styles.js";
import { Detail, FilePick } from "../ui/pieces.jsx";

const STEPS = ["Recebido", "Em produção", "Prévia enviada", "Aprovado", "Concluído"];
const STEP_IDX = { draft: 0, awaiting_photos: 0, in_production: 1, versions_sent: 2, approved: 3, completed: 4 };

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

function StepTracker({ status }) {
  const current = STEP_IDX[status] ?? 0;
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          {i > 0 && (
            <div style={{ flex: 1, height: 0.5, background: i <= current ? "#B8861A" : "#e8e4dc", margin: "0 8px" }} />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 500, flexShrink: 0,
              background: i < current ? "#B8861A" : i === current ? "#1a1a1a" : "#f5f4f2",
              color: i <= current ? "#fff" : MUTE,
              border: i > current ? "0.5px solid #ccc" : "none",
            }}>
              {i < current ? "✓" : i + 1}
            </div>
            <div style={{ fontSize: 12, color: i === current ? "#1a1a1a" : MUTE, fontWeight: i === current ? 500 : 400, whiteSpace: "nowrap" }}>
              {label}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function AdminCloudDetail({ order, back, onChanged }) {
  const [activeTab, setActiveTab] = useState("brief");
  const [v1file, setV1file] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [versionUrls, setVersionUrls] = useState({});
  const updateStatus = useServerFn(updateOrderStatus);
  const saveVersion = useServerFn(upsertVersion);
  const signedUrls = useServerFn(getSignedVersionUrls);

  const fd = order.form_data || {};
  const { label: badgeLabel, s: badgeStyle } = getBadge(order.status);

  useEffect(() => {
    const paths = (order.order_versions || []).map(v => v.storage_path).filter(Boolean);
    if (!paths.length) return;
    signedUrls({ data: { paths } }).then(arr => {
      const map = {};
      arr.forEach(x => { map[x.path] = x.url; });
      setVersionUrls(map);
    });
  }, [order.order_versions, signedUrls]);

  const uploadVersion = async (n, file) => {
    if (!file) return;
    const path = `${order.id}/v${n}-${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const { error } = await supabase.storage.from("order-images").upload(path, file, { upsert: false });
    if (error) throw error;
    await saveVersion({ data: { order_id: order.id, version_number: n, storage_path: path } });
  };

  const mailto = (assunto, corpo) => {
    window.location.href = `mailto:${encodeURIComponent(order.client_email)}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  };

  const sendVersions = async () => {
    const existingV1 = (order.order_versions || []).find(v => v.version_number === 1);
    if (!v1file && !existingV1) { alert("Faça o upload da prévia antes de enviar."); return; }
    setBusy(true);
    try {
      if (v1file) await uploadVersion(1, v1file);
      await updateStatus({ data: { id: order.id, status: "versions_sent" } });
      const firstName = order.client_name.split(" ")[0] || "";
      const appUrl = window.location.origin;
      const body = message || `Olá, ${firstName}!\n\nSua prévia está pronta e você pode aprová-la ou solicitar 1 ajuste incluído acessando sua área:\n\n${appUrl}\n\nPedido #${order.id.slice(0, 8).toUpperCase()}\n\nCom carinho,\nAteliê Memora`;
      mailto("Sua prévia está pronta ✦ Ateliê Memora", body);
      onChanged();
    } catch (e) { alert(e.message); }
    finally { setBusy(false); }
  };

  const setStatus = async (status) => {
    await updateStatus({ data: { id: order.id, status } });
    onChanged();
  };

  const TABS = [
    { id: "brief", label: "Brief do cliente" },
    { id: "previa", label: "Enviar prévia" },
    { id: "hist", label: "Histórico" },
  ];

  return (
    <div className="reveal" style={{ maxWidth: 940, margin: "0 auto" }}>
      <button className="ghost sm" onClick={back}>← Voltar aos pedidos</button>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", margin: "16px 0 6px" }}>
        <div>
          <div style={{ fontSize: 11, color: "#B8861A", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
            Pedido #{order.id.slice(0, 8)} · {order.client_name}
          </div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>
            {order.style || "Retrato personalizado"}
          </div>
        </div>
        <span style={{ ...badgeStyle, display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.03em", marginTop: 4 }}>
          {badgeLabel}
        </span>
      </div>

      <StepTracker status={order.status} />

      <div style={{ display: "flex", borderBottom: "0.5px solid #e8e4dc", marginBottom: 16 }}>
        {TABS.map(t => (
          <div key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "8px 14px", fontSize: 13, cursor: "pointer",
            color: activeTab === t.id ? "#1a1a1a" : MUTE, fontWeight: activeTab === t.id ? 500 : 400,
            borderBottom: activeTab === t.id ? "2px solid #B8861A" : "2px solid transparent",
            marginBottom: -1,
          }}>{t.label}</div>
        ))}
      </div>

      {activeTab === "brief" && (
        <BriefTab order={order} fd={fd} setStatus={setStatus} mailto={mailto} onChanged={onChanged} />
      )}
      {activeTab === "previa" && (
        <PreviaTab
          v1file={v1file} setV1file={setV1file}
          message={message} setMessage={setMessage}
          busy={busy} order={order} versionUrls={versionUrls}
          onSend={sendVersions}
        />
      )}
      {activeTab === "hist" && <HistTab order={order} />}
    </div>
  );
}

function BriefTab({ order, fd, setStatus, mailto, onChanged }) {
  const destLabel = { "para-mim": "Para mim", "presente": "Presente", "casal": "Casal", "familia": "Família" };
  const orientLabel = { retrato: "Retrato / Vertical", paisagem: "Paisagem / Horizontal", quadrado: "Quadrado 1:1" };
  const tamanhoLabel = { essencial: "Essencial · A4", classico: "Clássico · A3", grande: "Grande · 40×60", especial: "Especial · 60×90", a4: "A4", a3: "A3", medio: "Médio", "sob-medida": "Sob medida" };

  const rows = [
    ["Para quem", fd.destinatario ? (destLabel[fd.destinatario] || fd.destinatario) : "—"],
    ["Nome / sujeito", fd.nome || "—"],
    ["Estilo", order.style || "—"],
    ["Clima / atmosfera", (fd.clima || []).join(", ") || "—"],
    ["Tons", (fd.tons || []).join(", ") || "—"],
    ["Orientação", fd.orientacao ? (orientLabel[fd.orientacao] || fd.orientacao) : "—"],
    ["Tamanho", fd.tamanho ? (tamanhoLabel[fd.tamanho] || fd.tamanho) : "—"],
    ["Personalidade", (fd.personalidades || []).join(", ") || "—"],
    ["Pessoas", String(order.people_count || 1)],
    order.include_pet ? ["Pet", "Sim"] : null,
    fd.chosen_version ? ["Versão escolhida", `Versão ${fd.chosen_version}`] : null,
    fd.inspiracoes?.length ? ["Inspirações", `${fd.inspiracoes.length} imagem(ns) selecionada(s)`] : null,
  ].filter(Boolean).filter(([, v]) => v && v !== "—");

  return (
    <div>
      <section style={S.card}>
        <h2 style={S.h2}>Resumo do pedido</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <td style={{ color: MUTE, padding: "5px 0", width: 140, verticalAlign: "top" }}>{k}</td>
                <td style={{ padding: "5px 0" }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {fd.notas && (
          <>
            <div style={{ height: 0.5, background: "#e8e4dc", margin: "14px 0" }} />
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: MUTE, marginBottom: 10 }}>O que a obra deve carregar</div>
            <div style={{ background: "#f5f4f2", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#4a4a4a", lineHeight: 1.5, fontStyle: "italic", borderLeft: "2px solid #B8861A" }}>
              "{fd.notas}"
            </div>
          </>
        )}

        {fd.adjustment_notes && (
          <>
            <div style={{ height: 0.5, background: "#e8e4dc", margin: "14px 0" }} />
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: MUTE, marginBottom: 10 }}>Ajuste solicitado</div>
            <div style={{ background: "#fff8e6", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#4a4a4a", lineHeight: 1.5, borderLeft: "2px solid #B8861A" }}>
              "{fd.adjustment_notes}"
            </div>
          </>
        )}

        <div style={{ height: 0.5, background: "#e8e4dc", margin: "14px 0" }} />
        <Detail k="Nome" v={order.client_name} />
        <Detail k="E-mail" v={order.client_email} />
      </section>

      <section style={S.card}>
        <h2 style={S.h2}>Ações</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="ghost sm2" onClick={() => setStatus("in_production")}>Marcar "Em produção"</button>
          <button className="ghost sm2" onClick={() => setStatus("versions_sent")}>Marcar "Prévia enviada"</button>
          <button className="ghost sm2" onClick={() => setStatus("approved")}>Marcar "Aprovado"</button>
          <button className="ghost sm2" onClick={() => setStatus("completed")}>Marcar "Concluído"</button>
        </div>
      </section>

      <PixCard order={order} onChanged={onChanged} mailto={mailto} />
    </div>
  );
}

function PreviaTab({ v1file, setV1file, message, setMessage, busy, order, versionUrls, onSend }) {
  const firstName = order.client_name.split(" ")[0] || "";
  const existingUrl = versionUrls[(order.order_versions || []).find(v => v.version_number === 1)?.storage_path];
  return (
    <section style={S.card}>
      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: MUTE, marginBottom: 12 }}>
        Prévia para o cliente
      </div>
      <FilePick file={v1file} onFile={setV1file} existingUrl={existingUrl} />
      <p style={{ fontSize: 12, color: MUTE, margin: "10px 0 14px" }}>
        O cliente poderá aprovar ou pedir 1 ajuste incluído.
      </p>
      <label className="lbl">Mensagem (opcional)</label>
      <textarea className="inp ta" rows={3} value={message} onChange={e => setMessage(e.target.value)}
        placeholder={`Olá ${firstName}! Sua prévia está pronta. Acesse a plataforma para aprovar ou pedir ajuste.`}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
        <button className="primary" disabled={busy} onClick={onSend}>
          {busy ? "Enviando…" : "✉ Notificar cliente →"}
        </button>
      </div>
    </section>
  );
}

function HistTab({ order }) {
  const statusLabels = { in_production: "Em produção", versions_sent: "Prévia enviada", approved: "Aprovado", completed: "Concluído" };
  return (
    <section style={S.card}>
      <h2 style={S.h2}>Histórico do pedido</h2>
      <div style={{ fontSize: 13 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{ width: 6, height: 6, background: "#B8861A", borderRadius: "50%", marginTop: 5, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 500 }}>Pedido recebido</div>
            <div style={{ fontSize: 11, color: MUTE }}>{new Date(order.created_at).toLocaleString("pt-BR")}</div>
          </div>
        </div>
        {!["draft", "awaiting_photos"].includes(order.status) && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ width: 6, height: 6, background: "#B8861A", borderRadius: "50%", marginTop: 5, flexShrink: 0 }} />
            <div style={{ fontWeight: 500 }}>Status atual: {statusLabels[order.status] || order.status}</div>
          </div>
        )}
        {order.paid_at && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 6, height: 6, background: "#2e7d32", borderRadius: "50%", marginTop: 5, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 500, color: "#2e7d32" }}>Pagamento recebido</div>
              <div style={{ fontSize: 11, color: MUTE }}>{new Date(order.paid_at).toLocaleString("pt-BR")}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PixCard({ order, onChanged, mailto }) {
  const [priceStr, setPriceStr] = useState(order.price_cents != null ? (order.price_cents / 100).toFixed(2).replace(".", ",") : "");
  const [saving, setSaving] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const savePrice = useServerFn(updateOrderPrice);
  const markPaid = useServerFn(markOrderPaid);

  const amount = useMemo(() => {
    const n = Number(priceStr.replace(/\./g, "").replace(",", "."));
    return isFinite(n) && n > 0 ? n : 0;
  }, [priceStr]);

  const payload = useMemo(() => {
    if (!amount) return "";
    return buildPixPayload({
      key: PIX_KEY, merchantName: PIX_NAME, merchantCity: PIX_CITY,
      amount, txid: order.id.replace(/-/g, "").slice(0, 20),
      description: `Pedido ${order.id.slice(0, 8)}`,
    });
  }, [amount, order.id]);

  useEffect(() => {
    if (!payload) { setQrUrl(""); return; }
    QRCode.toDataURL(payload, { width: 260, margin: 1 }).then(setQrUrl).catch(() => setQrUrl(""));
  }, [payload]);

  const persistPrice = async () => {
    setSaving(true);
    try {
      await savePrice({ data: { id: order.id, price_cents: amount ? Math.round(amount * 100) : null } });
      onChanged();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const copy = async () => {
    if (!payload) return;
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const sendPaymentEmail = () => {
    const firstName = order.client_name.split(" ")[0] || "";
    const body =
      `Olá ${firstName}!\n\n` +
      `Para confirmar seu retrato (Pedido #${order.id.slice(0, 8)}), o pagamento é via Pix:\n\n` +
      `Valor: R$ ${amount.toFixed(2).replace(".", ",")}\n` +
      `Chave Pix (telefone): ${PIX_KEY}\n` +
      `Recebedor: ${PIX_NAME}\n\n` +
      `Pix Copia e Cola:\n${payload}\n\n` +
      `Assim que recebermos, te avisamos por aqui.\nCom carinho, Ateliê Memora`;
    mailto("Pagamento do seu retrato ✦ Ateliê Memora", body);
  };

  const togglePaid = async () => {
    try {
      await markPaid({ data: { id: order.id, paid: !order.paid_at } });
      onChanged();
    } catch (e) { alert(e.message); }
  };

  return (
    <section style={S.card}>
      <h2 style={S.h2}>Pagamento (Pix)</h2>
      <label className="lbl">Valor (R$)</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="inp" inputMode="decimal" placeholder="0,00" value={priceStr} onChange={e => setPriceStr(e.target.value)} style={{ flex: 1 }} />
        <button className="ghost sm2" disabled={saving} onClick={persistPrice}>{saving ? "…" : "Salvar"}</button>
      </div>

      {order.paid_at ? (
        <div style={{ marginTop: 14, padding: 12, background: "#e9f5ea", border: "1px solid #bcdcc0", borderRadius: 10 }}>
          <strong style={{ color: "#2e7d32" }}>✓ Pagamento recebido</strong>
          <div style={{ fontSize: 12, color: MUTE, marginTop: 4 }}>{new Date(order.paid_at).toLocaleString("pt-BR")}</div>
          <button className="ghost sm2" style={{ marginTop: 8 }} onClick={togglePaid}>Desfazer</button>
        </div>
      ) : amount > 0 ? (
        <>
          {qrUrl && (
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <img src={qrUrl} alt="QR Code Pix" style={{ width: 220, height: 220, border: "1px solid #eee", borderRadius: 10 }} />
            </div>
          )}
          <label className="lbl" style={{ marginTop: 12 }}>Pix Copia e Cola</label>
          <textarea className="inp ta" rows={3} readOnly value={payload} style={{ fontFamily: "monospace", fontSize: 11 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="ghost block" onClick={copy} style={{ flex: 1 }}>{copied ? "✓ Copiado" : "Copiar código"}</button>
            <button className="ghost block" onClick={sendPaymentEmail} style={{ flex: 1 }}>✉ Enviar por e-mail</button>
          </div>
          <div style={{ fontSize: 12, color: MUTE, marginTop: 10 }}>
            Chave: <strong>{PIX_KEY}</strong> · {PIX_NAME}
          </div>
          <button className="primary block" style={{ marginTop: 12 }} onClick={togglePaid}>Marcar como pago</button>
        </>
      ) : (
        <p style={{ color: MUTE, fontSize: 13, marginTop: 12 }}>Defina o valor para gerar o QR Code Pix.</p>
      )}
    </section>
  );
}
