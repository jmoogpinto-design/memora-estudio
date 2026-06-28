import React, { useState, useEffect, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { updateOrderStatus, upsertVersion, getSignedVersionUrls, updateOrderPrice, markOrderPaid } from "@/lib/orders.functions";
import QRCode from "qrcode";
import { buildPixPayload } from "@/lib/pix";
import { PIX_KEY, PIX_NAME, PIX_CITY, STATUS_LABELS, GOLD, MUTE } from "../constants.js";
import { S } from "../styles.js";
import { Detail, FilePick } from "../ui/pieces.jsx";

export default function AdminCloudDetail({ order, back, onChanged }) {
  const [v1file, setV1file] = useState(null);
  const [v2file, setV2file] = useState(null);
  const [busy, setBusy] = useState(false);
  const [versionUrls, setVersionUrls] = useState({});
  const updateStatus = useServerFn(updateOrderStatus);
  const saveVersion = useServerFn(upsertVersion);
  const signedUrls = useServerFn(getSignedVersionUrls);

  useEffect(() => {
    const paths = (order.order_versions || []).map((v) => v.storage_path).filter(Boolean);
    if (!paths.length) return;
    signedUrls({ data: { paths } }).then((arr) => {
      const map = {};
      arr.forEach((x) => { map[x.path] = x.url; });
      setVersionUrls(map);
    });
  }, [order.order_versions, signedUrls]);

  const uploadVersion = async (n, file) => {
    if (!file) return null;
    const path = `${order.id}/v${n}-${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const { error } = await supabase.storage.from("order-images").upload(path, file, { upsert: false });
    if (error) throw error;
    await saveVersion({ data: { order_id: order.id, version_number: n, storage_path: path } });
    return path;
  };

  const mailto = (assunto, corpo) => {
    const url = `mailto:${encodeURIComponent(order.client_email)}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    window.location.href = url;
  };

  const sendVersions = async () => {
    if (!v1file && !v2file) {
      const existing = (order.order_versions || []).length;
      if (existing < 2) { alert("Faça o upload das duas imagens antes de enviar."); return; }
    }
    setBusy(true);
    try {
      if (v1file) await uploadVersion(1, v1file);
      if (v2file) await uploadVersion(2, v2file);
      await updateStatus({ data: { id: order.id, status: "versions_sent" } });
      const firstName = order.client_name.split(" ")[0] || "";
      mailto(
        "Suas versões estão prontas ✦ Ateliê Memora",
        `Olá ${firstName}!\n\nSuas duas versões estão prontas para aprovação. Acesse sua área no Ateliê Memora para escolher a favorita.\n\nPedido #${order.id.slice(0, 8)}\n\nCom carinho,\nAteliê Memora`
      );
      onChanged();
    } catch (e) { alert(e.message); }
    finally { setBusy(false); }
  };

  const setStatus = async (status) => {
    await updateStatus({ data: { id: order.id, status } });
    onChanged();
  };

  return (
    <div className="reveal" style={{ maxWidth: 940, margin: "0 auto" }}>
      <button className="ghost sm" onClick={back}>← Todos os pedidos</button>
      <div style={S.detailHead}>
        <div><p style={S.eyebrow}>Pedido #{order.id.slice(0, 8)}</p><h1 style={S.h1}>{order.client_name}</h1></div>
        <span className="chip on">{STATUS_LABELS[order.status] || order.status}</span>
      </div>

      <div style={S.adminCols}>
        <div>
          <section style={S.card}>
            <h2 style={S.h2}>Dados do cliente</h2>
            <Detail k="Nome" v={order.client_name} />
            <Detail k="E-mail" v={order.client_email} />
            <Detail k="Estilo" v={order.style || "—"} />
            <Detail k="Pessoas" v={String(order.people_count)} />
            <Detail k="Inclui pet" v={order.include_pet ? "Sim" : "Não"} />
            {order.notes && <Detail k="Observações" v={order.notes} />}
          </section>

          <section style={S.card}>
            <h2 style={S.h2}>Fluxo do pedido</h2>
            <button className="ghost block" onClick={() => setStatus("in_production")}>Marcar "Em produção"</button>
            <button className="ghost block" style={{ marginTop: 8 }} onClick={() => setStatus("completed")}>Marcar "Finalizado"</button>
          </section>

          <PixCard order={order} onChanged={onChanged} mailto={mailto} />
        </div>

        <div>
          <section style={S.card}>
            <h2 style={S.h2}>2 versões para aprovação</h2>
            <label className="lbl">Versão 1</label>
            <FilePick file={v1file} onFile={setV1file} existingUrl={versionUrls[(order.order_versions || []).find((v) => v.version_number === 1)?.storage_path]} />
            <label className="lbl" style={{ marginTop: 14 }}>Versão 2</label>
            <FilePick file={v2file} onFile={setV2file} existingUrl={versionUrls[(order.order_versions || []).find((v) => v.version_number === 2)?.storage_path]} />
            <button className="primary block" disabled={busy} style={{ marginTop: 14 }} onClick={sendVersions}>
              {busy ? "Enviando…" : "✉ Enviar versões para aprovação (e-mail)"}
            </button>
          </section>
        </div>
      </div>
    </div>
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
      key: PIX_KEY,
      merchantName: PIX_NAME,
      merchantCity: PIX_CITY,
      amount,
      txid: order.id.replace(/-/g, "").slice(0, 20),
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
        <input className="inp" inputMode="decimal" placeholder="0,00" value={priceStr} onChange={(e) => setPriceStr(e.target.value)} style={{ flex: 1 }} />
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
