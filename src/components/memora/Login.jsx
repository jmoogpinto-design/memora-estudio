import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { S } from "./styles.js";
import { GOLD_SOFT, INK, MUTE } from "./constants.js";
import moodboard from "@/assets/login-moodboard.jpg";
import drawing from "@/assets/login-drawing.jpg";

export default function Login() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const submit = async () => {
    setError(""); setInfo("");
    if (!email || !password) { setError("Preencha e-mail e senha para continuar."); return; }
    if (password.length < 6) { setError("A senha precisa ter pelo menos 6 caracteres."); return; }
    setLoading(true);
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
      const msg = e?.message || "";
      if (/Invalid login credentials/i.test(msg)) setError("E-mail ou senha incorretos.");
      else if (/User already registered/i.test(msg)) setError("Este e-mail já tem cadastro. Faça login.");
      else if (/Password.*(short|weak|pwned|leaked)/i.test(msg)) setError("Senha muito fraca ou comprometida. Escolha outra.");
      else setError(msg || "Não foi possível concluir. Tente novamente.");
    } finally { setLoading(false); }
  };

  const forgot = async () => {
    if (!email) { setError("Digite seu e-mail acima para receber o link."); return; }
    setError(""); setInfo(""); setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw error;
      setInfo("Enviamos um link para redefinir sua senha.");
    } catch (e) {
      setError(e.message || "Não foi possível enviar o link.");
    } finally { setLoading(false); }
  };

  const cardSoft = {
    background: GOLD_SOFT,
    borderRadius: 18,
    padding: "34px 30px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    minHeight: 260,
  };
  const cardImg = {
    borderRadius: 18,
    overflow: "hidden",
    minHeight: 260,
    background: "#eee",
  };

  return (
    <div className="reveal loginGrid">
      <div className="loginBento">
        <div style={cardSoft}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, margin: "0 0 10px", color: INK, letterSpacing: "-.01em" }}>
            Cada obra começa com uma história.
          </h3>
          <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "#4a4a4a", margin: 0 }}>
            Envie suas fotos e conte o significado por trás delas. Nós transformamos suas lembranças em arte.
          </p>
        </div>
        <div style={cardImg}>
          <img src={moodboard} alt="Ateliê Memora" loading="lazy" width={1024} height={1024} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
        <div style={cardImg}>
          <img src={drawing} alt="Ilustração em processo" loading="lazy" width={1024} height={1024} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
        <div style={cardSoft}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, margin: "0 0 10px", color: INK, letterSpacing: "-.01em" }}>
            Cada traço reflete a sua essência.
          </h3>
          <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "#4a4a4a", margin: 0 }}>
            Cada ilustração nasce de um processo criativo cuidadoso, combinando técnica, sensibilidade e atenção aos detalhes.
          </p>
        </div>
      </div>

      <div className="loginPane">
        <p style={S.eyebrow}>Sua área no ateliê</p>
        <h1 style={{ ...S.h1, fontSize: 40 }}>Sua obra está prestes <em>a ganhar vida.</em></h1>
        <p style={{ ...S.lede, margin: "16px 0 22px" }}>
          Prévia em até 24h · 1 ajuste incluído · Arquivo final em alta resolução em até 48h.
        </p>
        <div style={S.card}>
          <div className="tabs">
            <button className={mode === "signin" ? "tab on" : "tab"} onClick={() => { setMode("signin"); setShowForgot(false); }}>Entrar</button>
            <button className={mode === "signup" ? "tab on" : "tab"} onClick={() => { setMode("signup"); setShowForgot(false); }}>Criar conta</button>
          </div>
          <label className="lbl">E-mail</label>
          <input className="inp" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
          {!showForgot && (<>
            <label className="lbl" style={{ marginTop: 14 }}>Senha</label>
            <input className="inp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </>)}
          {error && <p style={{ color: "#c0392b", marginTop: 10, fontSize: 13 }}>{error}</p>}
          {info && <p style={{ color: "#2e7d32", marginTop: 10, fontSize: 13 }}>{info}</p>}
          <button className="primary block" style={{ marginTop: 14 }} disabled={loading} onClick={showForgot ? forgot : submit}>
            {loading ? "Aguarde…" : showForgot ? "Enviar link" : mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
          {mode === "signin" && (
            <button onClick={() => { setShowForgot(!showForgot); setError(""); setInfo(""); }} style={{ marginTop: 12, background: "none", border: "none", color: MUTE, fontSize: 13, padding: 0, cursor: "pointer" }}>
              {showForgot ? "Voltar para entrar" : "Esqueceu sua senha?"}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .loginGrid { display: grid; grid-template-columns: 1.15fr 1fr; gap: 48px; align-items: start; margin-top: 10px; }
        .loginBento { display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: minmax(240px, auto); gap: 18px; }
        .loginPane { max-width: 440px; }
        @media (max-width: 960px) {
          .loginGrid { grid-template-columns: 1fr; gap: 32px; }
          .loginPane { max-width: 100%; }
        }
        @media (max-width: 560px) {
          .loginBento { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
