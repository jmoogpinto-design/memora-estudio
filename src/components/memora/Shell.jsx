import React from "react";
import { S, CSS } from "./styles.js";

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
          <button onClick={onHome} style={{ background: "none", border: "none", padding: 0, cursor: onHome ? "pointer" : "default", lineHeight: 0 }}>
            <img src="/logo.png" alt="Memora" style={{ height: 36, display: "block" }} />
          </button>
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
    </div>
  );
}
