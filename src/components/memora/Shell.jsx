import React from "react";
import { S, CSS } from "./styles.js";
import { PIX_KEY } from "./constants.js";

const WA_NUMBER = PIX_KEY.replace(/\D/g, "");
const WA_MSG = encodeURIComponent("Olá! Tenho uma dúvida sobre meu pedido no Ateliê Memora. 🎨");
const WA_HREF = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;
const SITE_URL = "https://memoraestudio.com.br";

function WhatsAppButton() {
  return (
    <a
      href={WA_HREF}
      target="_blank"
      rel="noopener noreferrer"
      title="Fale conosco pelo WhatsApp"
      style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 200,
        display: "flex", alignItems: "center", gap: 8,
        background: "#25D366", color: "#fff",
        borderRadius: 28, padding: "10px 16px 10px 12px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        textDecoration: "none", fontSize: 13, fontWeight: 500,
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.22)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.18)"; }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      Alguma dúvida?
    </a>
  );
}

export default function Shell({ children, user, onLogout, wide, fluid, onHome }) {
  const mainStyle = wide
    ? { padding: 0 }
    : fluid
    ? { ...S.main, maxWidth: "none" }
    : S.main;

  return (
    <div style={S.root}>
      <style>{CSS}</style>
      <header style={S.header}>
        <div style={S.brand}>
          {onHome ? (
            <button onClick={onHome} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", lineHeight: 0 }}>
              <img src="/logo.png" alt="Memora" style={{ height: 36, display: "block" }} />
            </button>
          ) : (
            <a href={SITE_URL} title="Voltar para o site" style={{ lineHeight: 0 }}>
              <img src="/logo.png" alt="Memora" style={{ height: 36, display: "block" }} />
            </a>
          )}
        </div>
        {user && (
          <div style={S.headRight}>
            <span style={S.userPill}>{user.role === "admin" ? "Ateliê" : user.cliente?.nome || user.email}</span>
            <button className="ghost sm2" onClick={onLogout}>Sair</button>
          </div>
        )}
      </header>
      <main style={mainStyle}>{children}</main>
      {!wide && !fluid && <footer style={S.footer}>Memora · cada retrato é uma história contada à mão</footer>}
      {user && user.role !== "admin" && <WhatsAppButton />}
    </div>
  );
}
