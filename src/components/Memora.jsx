import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { getMyRole, claimFirstAdmin } from "@/lib/orders.functions";
import Shell from "./memora/Shell.jsx";
import Login from "./memora/Login.jsx";
import AdminCloud from "./memora/admin/AdminCloud.jsx";
import Client from "./memora/client/Client.jsx";
import { MUTE, LINE } from "./memora/constants.js";

export default function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState(null);
  const fetchRole = useServerFn(getMyRole);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setRole(null); return; }
    fetchRole().then((r) => setRole(r.isAdmin ? "admin" : "client")).catch(() => setRole("client"));
  }, [session, fetchRole]);

  const logout = async () => { await supabase.auth.signOut(); };

  if (checking) return <Shell><div style={{ padding: 40, textAlign: "center", color: MUTE }}>Carregando…</div></Shell>;
  if (!session) return <Shell><Login /></Shell>;
  if (role === null) return <Shell user={{ email: session.user.email }} onLogout={logout}><div style={{ padding: 40, textAlign: "center", color: MUTE }}>Carregando seu ateliê…</div></Shell>;

  const user = { email: session.user.email, role, cliente: { nome: session.user.email?.split("@")[0] || "" } };
  if (role === "admin")
    return <Shell user={user} onLogout={logout}><AdminCloud /></Shell>;
  return <Shell user={user} onLogout={logout}><><ClaimAdminBar /><Client user={user} /></></Shell>;
}

function ClaimAdminBar() {
  const claim = useServerFn(claimFirstAdmin);
  const [busy, setBusy] = useState(false);
  return (
    <div style={{ margin: "0 0 18px", padding: 12, border: `1px solid ${LINE}`, borderRadius: 12, background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <div style={{ fontSize: 13, color: MUTE }}>É a artista do ateliê? Reivindique o acesso de administradora (só funciona se ainda não houver nenhum).</div>
      <button className="ghost sm2" disabled={busy} onClick={async () => {
        setBusy(true);
        try { await claim(); alert("Pronto! Recarregando…"); window.location.reload(); }
        catch (e) { alert(e.message || "Não foi possível"); setBusy(false); }
      }}>{busy ? "Processando…" : "Sou a artista"}</button>
    </div>
  );
}
