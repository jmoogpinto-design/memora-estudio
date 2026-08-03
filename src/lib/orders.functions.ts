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
  .validator(
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
  .validator((d: { id: string; status: string }) => d)
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
  .validator((d: { id: string; price_cents: number | null }) => d)
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
  .validator((d: { id: string; paid: boolean }) => d)
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
  .validator(
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
    const { error } = await context.supabase
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) {
      if (error.code === "42501" || error.message.includes("row-level security"))
        throw new Error("Já existe uma administradora.");
      throw new Error(error.message);
    }
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

export const submitClientOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (d: {
      client_name: string;
      client_email: string;
      style: string | null;
      people_count: number;
      include_pet: boolean;
      form_data: Record<string, unknown>;
      price_cents?: number;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("orders")
      .insert({
        client_user_id: context.userId,
        client_name: data.client_name,
        client_email: data.client_email,
        style: data.style,
        people_count: data.people_count,
        include_pet: data.include_pet,
        status: "awaiting_photos",
        form_data: data.form_data,
        price_cents: data.price_cents ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("*, order_versions(*), order_photos(*)")
      .eq("client_user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addOrderPhotos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { order_id: string; paths: string[] }) => d)
  .handler(async ({ data, context }) => {
    if (!data.paths.length) return { ok: true };
    const { error } = await context.supabase
      .from("order_photos")
      .insert(
        data.paths.map((path) => ({
          order_id: data.order_id,
          storage_path: path,
          uploaded_by: context.userId,
        })),
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const approveClientVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { order_id: string; chosen_version: number; adjustment_notes: string | null }) => d)
  .handler(async ({ data, context }) => {
    const { data: existing, error: fetchErr } = await context.supabase
      .from("orders")
      .select("form_data")
      .eq("id", data.order_id)
      .eq("client_user_id", context.userId)
      .single();
    if (fetchErr || !existing) throw new Error("Pedido não encontrado ou sem permissão");
    const merged = {
      ...((existing.form_data as Record<string, unknown>) || {}),
      chosen_version: data.chosen_version,
      adjustment_notes: data.adjustment_notes,
    };
    const newStatus = data.adjustment_notes ? "in_production" : "approved";
    const { error } = await context.supabase
      .from("orders")
      .update({ form_data: merged, status: newStatus as never })
      .eq("id", data.order_id)
      .eq("client_user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true, status: newStatus };
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    return (data ?? null) as { id: string; whatsapp: string | null; address: string | null } | null;
  });

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { first_name: string; last_name: string; whatsapp: string; address: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .upsert({
        id: context.userId,
        first_name: data.first_name,
        last_name:  data.last_name,
        whatsapp:   data.whatsapp,
        address:    data.address,
        updated_at: new Date().toISOString(),
      });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listGalleryImages = createServerFn({ method: "GET" })
  .handler(async () => {
    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/gallery`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: "", limit: 60, offset: 0 }),
    });
    if (!res.ok) return [] as string[];
    const files = (await res.json()) as Array<{ name: string }>;
    return files
      .filter(f => !f.name.startsWith("."))
      .map(f => `${SUPABASE_URL}/storage/v1/object/public/gallery/${encodeURIComponent(f.name)}`);
  });

export const listMosaicImages = createServerFn({ method: "GET" })
  .handler(async () => {
    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/mosaic`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: "", limit: 9, offset: 0 }),
    });
    if (!res.ok) return [] as string[];
    const files = (await res.json()) as Array<{ name: string }>;
    return files
      .filter(f => !f.name.startsWith("."))
      .map(f => `${SUPABASE_URL}/storage/v1/object/public/mosaic/${encodeURIComponent(f.name)}`);
  });

export const getSignedVersionUrls = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { paths: string[] }) => d)
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
