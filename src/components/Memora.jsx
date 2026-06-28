import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { getMyRole } from "@/lib/orders.functions";
import Shell from "./memora/Shell.jsx";
import Login from "./memora/Login.jsx";
import AdminCloud from "./memora/admin/AdminCloud.jsx";
import Client from "./memora/client/Client.jsx";
import { MUTE } from "./memora/constants.js";

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
  return <Shell user={user} onLogout={logout}><Client user={user} /></Shell>;
}
