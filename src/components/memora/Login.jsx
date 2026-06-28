import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { S } from "./styles.js";

export default function Login() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const submit = async () => {
    setError(""); setInfo(""); setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setInfo("Conta criada! Você já está conectada.");
      }
    } catch (e) {
      setError(e.message || "Erro ao entrar.");
    } finally { setLoading(false); }
  };

  return (
    <div className="reveal" style={{ maxWidth: 440, margin: "10px auto 0" }}>
      <p style={S.eyebrow}>Sua área no ateliê</p>
      <h1 style={S.h1}>Acompanhe sua <em>obra</em> nascer.</h1>
      <p style={S.lede}>Entre para enviar fotos, escolher um estilo e ver cada etapa da criação.</p>
      <div style={S.card}>
        <div className="tabs">
          <button className={mode === "signin" ? "tab on" : "tab"} onClick={() => setMode("signin")}>Entrar</button>
          <button className={mode === "signup" ? "tab on" : "tab"} onClick={() => setMode("signup")}>Criar conta</button>
        </div>
        <label className="lbl">E-mail</label>
        <input className="inp" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
        <label className="lbl">Senha</label>
        <input className="inp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        {error && <p style={{ color: "#c0392b", marginTop: 10, fontSize: 13 }}>{error}</p>}
        {info && <p style={{ color: "#2e7d32", marginTop: 10, fontSize: 13 }}>{info}</p>}
        <button className="primary block" disabled={loading} onClick={submit}>
          {loading ? "Aguarde…" : mode === "signin" ? "Entrar" : "Criar conta"}
        </button>
        <p style={{ color: "#6b6b6b", fontSize: 12, marginTop: 14, textAlign: "center" }}>
          Primeiro acesso do ateliê? Crie a conta e, no painel, clique em "Sou o ateliê".
        </p>
      </div>
    </div>
  );
}
