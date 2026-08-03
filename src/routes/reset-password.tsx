import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Redefinir senha — Memora" }],
  }),
  component: ResetPassword,
});

const GOLD = "#B8861A";
const MUTE = "#7a7672";
const LINE = "#e8e4dc";

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [ready, setReady]           = useState(false);
  const [done, setDone]             = useState(false);

  useEffect(() => {
    // Supabase coloca o token no hash da URL: #access_token=...&type=recovery
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken  = params.get("access_token");
    const refreshToken = params.get("refresh_token") ?? "";
    const type         = params.get("type");

    if (accessToken && type === "recovery") {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (error) setError("Link inválido ou expirado. Solicite um novo.");
          else setReady(true);
        });
    } else {
      setError("Link inválido. Solicite a redefinição de senha novamente.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("A senha deve ter pelo menos 8 caracteres."); return; }
    if (password !== confirm) { setError("As senhas não coincidem."); return; }

    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => navigate({ to: "/" }), 3000);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#faf9f7", fontFamily: "'Outfit', system-ui, sans-serif",
    }}>
      <div style={{
        width: "100%", maxWidth: 420, padding: "40px 36px",
        background: "#fff", borderRadius: 16, border: `1px solid ${LINE}`,
        boxShadow: "0 4px 24px rgba(0,0,0,.06)",
      }}>
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <img src="/logo.png" alt="Memora" style={{ height: 32, marginBottom: 20 }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: "0 0 6px" }}>
            Redefinir senha
          </h1>
          <p style={{ fontSize: 14, color: MUTE, margin: 0 }}>
            Escolha uma nova senha para a sua conta Memora.
          </p>
        </div>

        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 6 }}>Senha alterada!</p>
            <p style={{ fontSize: 13, color: MUTE }}>Redirecionando para o app…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: MUTE, textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 6 }}>
                Nova senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={!ready || loading}
                placeholder="mínimo 8 caracteres"
                style={{
                  width: "100%", padding: "11px 14px", fontSize: 14,
                  border: `1px solid ${LINE}`, borderRadius: 8, outline: "none",
                  background: !ready ? "#f5f4f2" : "#fff", boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: MUTE, textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 6 }}>
                Confirmar senha
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                disabled={!ready || loading}
                placeholder="repita a nova senha"
                style={{
                  width: "100%", padding: "11px 14px", fontSize: 14,
                  border: `1px solid ${LINE}`, borderRadius: 8, outline: "none",
                  background: !ready ? "#f5f4f2" : "#fff", boxSizing: "border-box",
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize: 13, color: "#c0392b", margin: 0 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={!ready || loading}
              style={{
                marginTop: 4, padding: "13px", fontSize: 14, fontWeight: 600,
                background: ready ? GOLD : "#e8e4dc", color: ready ? "#fff" : MUTE,
                border: "none", borderRadius: 8, cursor: ready ? "pointer" : "not-allowed",
                transition: "background .2s",
              }}
            >
              {loading ? "Salvando…" : "Salvar nova senha"}
            </button>

            <p style={{ fontSize: 12, color: MUTE, textAlign: "center", margin: 0 }}>
              <a href="/" style={{ color: GOLD, textDecoration: "none" }}>← Voltar ao início</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
