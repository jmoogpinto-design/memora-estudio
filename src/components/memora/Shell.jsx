import React from "react";
import { S, CSS } from "./styles.js";

export default function Shell({ children, user, onLogout }) {
  return (
    <div style={S.root}>
      <style>{CSS}</style>
      <header style={S.header}>
        <div style={S.brand}>
          <span style={S.mark}>✶</span>
          <span style={S.wordmark}>Memora</span>
          <span style={S.tagline}>ateliê de retratos</span>
        </div>
        {user && (
          <div style={S.headRight}>
            <span style={S.userPill}>{user.role === "admin" ? "Ateliê" : user.cliente?.nome || user.email}</span>
            <button className="ghost sm2" onClick={onLogout}>Sair</button>
          </div>
        )}
      </header>
      <main style={{ ...S.main, maxWidth: 1180 }}>{children}</main>
      <footer style={S.footer}>Memora · cada retrato é uma história contada à mão</footer>
    </div>
  );
}
