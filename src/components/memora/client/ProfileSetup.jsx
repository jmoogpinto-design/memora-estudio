import React, { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { saveMyProfile } from "@/lib/orders.functions";
import { MUTE, GOLD } from "../constants.js";
import { S } from "../styles.js";

export default function ProfileSetup({ user, onComplete }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [whatsapp, setWhatsapp]   = useState("");
  const [address, setAddress]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const saveFn = useServerFn(saveMyProfile);

  const formatWhatsapp = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const rawWhatsapp = whatsapp.replace(/\D/g, "");
  const canSave = firstName.trim().length >= 2 && lastName.trim().length >= 2
    && rawWhatsapp.length >= 10 && address.trim().length >= 5;

  const handleSave = async () => {
    if (!canSave || loading) return;
    setError("");
    setLoading(true);
    try {
      await saveFn({ data: {
        first_name: firstName.trim(),
        last_name:  lastName.trim(),
        whatsapp:   rawWhatsapp,
        address:    address.trim(),
      }});
      onComplete();
    } catch (e) {
      setError(e.message || "Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reveal" style={{ maxWidth: 520, margin: "10px auto 0" }}>
      <p style={S.eyebrow}>Quase lá</p>
      <h1 style={S.h1}>Complete seu <em>cadastro</em></h1>
      <p style={{ ...S.lede, marginBottom: "2rem" }}>
        Precisamos de mais alguns dados para acompanhar seu pedido e entrar em contato se precisar.
      </p>

      <div style={S.card}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <label className="lbl">Nome</label>
            <input className="inp" value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Julia" autoComplete="given-name" />
          </div>
          <div>
            <label className="lbl">Sobrenome</label>
            <input className="inp" value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Pinto" autoComplete="family-name" />
          </div>
        </div>

        <label className="lbl">E-mail</label>
        <input className="inp" value={user?.email ?? ""} readOnly
          style={{ background: "#f5f4f2", color: MUTE, cursor: "default", marginBottom: 14 }} />

        <label className="lbl">WhatsApp</label>
        <input className="inp" type="tel" value={whatsapp}
          onChange={e => setWhatsapp(formatWhatsapp(e.target.value))}
          placeholder="(11) 99999-9999" autoComplete="tel" />
        <p style={{ fontSize: 11, color: MUTE, marginTop: 4, marginBottom: 14 }}>
          Usado apenas para avisos sobre seu pedido.
        </p>

        <label className="lbl">Endereço completo</label>
        <textarea className="inp ta" rows={3} value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Rua, número, complemento, bairro, cidade — SP, CEP 00000-000" />
        <p style={{ fontSize: 11, color: MUTE, marginTop: 4 }}>
          Necessário caso queira receber a obra impressa futuramente.
        </p>

        {error && <p style={{ color: "#c0392b", fontSize: 13, marginTop: 10 }}>{error}</p>}

        <button className="primary block"
          style={{ marginTop: 20, background: canSave ? GOLD : undefined, opacity: canSave ? 1 : 0.5 }}
          disabled={!canSave || loading} onClick={handleSave}>
          {loading ? "Salvando…" : "Salvar e continuar →"}
        </button>
      </div>
    </div>
  );
}
