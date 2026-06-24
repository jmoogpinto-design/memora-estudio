import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("*, order_versions(*), order_photos(*)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      client_name: string;
      client_email: string;
      style?: string;
      people_count?: number;
      include_pet?: boolean;
      notes?: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { data: row, error } = await context.supabase
      .from("orders")
      .insert({
        client_name: data.client_name,
        client_email: data.client_email,
        style: data.style ?? null,
        people_count: data.people_count ?? 1,
        include_pet: data.include_pet ?? false,
        notes: data.notes ?? null,
        status: "awaiting_photos",
        created_by: context.userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status as never })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateOrderPrice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; price_cents: number | null }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("orders")
      .update({ price_cents: data.price_cents })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const markOrderPaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; paid: boolean }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("orders")
      .update({ paid_at: data.paid ? new Date().toISOString() : null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { order_id: string; version_number: 1 | 2; storage_path: string }) => d,
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("order_versions")
      .upsert(
        {
          order_id: data.order_id,
          version_number: data.version_number,
          storage_path: data.storage_path,
        },
        { onConflict: "order_id,version_number" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { count, error: countErr } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if (countErr) throw new Error(countErr.message);
    if ((count ?? 0) > 0) throw new Error("Já existe um administrador.");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const roles = (data ?? []).map((r) => r.role as string);
    return { isAdmin: roles.includes("admin"), roles };
  });

export const getSignedVersionUrls = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { paths: string[] }) => d)
  .handler(async ({ data, context }) => {
    if (!data.paths.length) return [] as { path: string; url: string }[];
    const out: { path: string; url: string }[] = [];
    for (const p of data.paths) {
      const { data: s, error } = await context.supabase.storage
        .from("order-images")
        .createSignedUrl(p, 3600);
      if (!error && s) out.push({ path: p, url: s.signedUrl });
    }
    return out;
  });
