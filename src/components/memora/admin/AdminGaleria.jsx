import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MUTE, GOLD, LINE } from "../constants.js";
import { S } from "../styles.js";

const BUCKETS = [
  {
    id: "gallery",
    label: "Galeria de inspirações",
    hint: "Imagens que os clientes escolhem como referência no wizard de pedido (etapa de estilo). Formatos: JPG, PNG, WEBP.",
  },
  {
    id: "mosaic",
    label: "Mosaico do dashboard",
    hint: "Obras exibidas como portfólio no topo do dashboard do cliente. Use 9 imagens verticais para melhor resultado.",
  },
];

export default function AdminGaleria() {
  const [bucket, setBucket] = useState("gallery");
  const [images, setImages] = useState({ gallery: [], mosaic: [] });
  const [loading, setLoading] = useState({ gallery: false, mosaic: false });
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const current = BUCKETS.find(b => b.id === bucket);

  const loadBucket = async (b) => {
    setLoading(p => ({ ...p, [b]: true }));
    const { data } = await supabase.storage.from(b).list("", { limit: 100, sortBy: { column: "name", order: "asc" } });
    const imgs = (data || [])
      .filter(f => !f.name.startsWith("."))
      .map(f => ({
        name: f.name,
        url: supabase.storage.from(b).getPublicUrl(f.name).data.publicUrl,
      }));
    setImages(p => ({ ...p, [b]: imgs }));
    setLoading(p => ({ ...p, [b]: false }));
  };

  useEffect(() => { loadBucket("gallery"); loadBucket("mosaic"); }, []);

  const handleFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "")}`;
        const { error } = await supabase.storage.from(bucket).upload(safeName, file, { upsert: false });
        if (error) throw error;
      }
      await loadBucket(bucket);
    } catch (e) {
      alert(`Erro no upload: ${e.message}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (name) => {
    if (!confirm(`Remover "${name}"?`)) return;
    const { error } = await supabase.storage.from(bucket).remove([name]);
    if (error) { alert(error.message); return; }
    setImages(p => ({ ...p, [bucket]: p[bucket].filter(i => i.name !== name) }));
  };

  const imgs = images[bucket];
  const isLoading = loading[bucket];

  return (
    <div className="reveal" style={{ maxWidth: 860, margin: "0 auto" }}>
      <p style={S.eyebrow}>Ateliê</p>
      <h1 style={S.h1}>Galeria de imagens</h1>

      {/* Seletor de bucket */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {BUCKETS.map(b => (
          <button key={b.id} onClick={() => setBucket(b.id)} style={{
            padding: "7px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer",
            border: `1px solid ${bucket === b.id ? GOLD : LINE}`,
            background: bucket === b.id ? "#fdf9ef" : "#fff",
            color: bucket === b.id ? "#8A6A20" : "#1a1a1a",
            fontWeight: bucket === b.id ? 500 : 400,
          }}>
            {b.label}
            {images[b.id].length > 0 && (
              <span style={{ marginLeft: 6, fontSize: 11, color: MUTE }}>({images[b.id].length})</span>
            )}
          </button>
        ))}
      </div>

      <section style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <h2 style={{ ...S.h2, marginBottom: 4 }}>{current.label}</h2>
            <p style={{ fontSize: 12, color: MUTE, margin: 0, maxWidth: 480, lineHeight: 1.5 }}>{current.hint}</p>
          </div>
          <div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={e => handleFiles(e.target.files)}
            />
            <button
              className="primary"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              style={{ fontSize: 13, padding: "8px 18px" }}
            >
              {uploading ? "Enviando…" : "+ Adicionar imagens"}
            </button>
          </div>
        </div>

        {isLoading && <p style={{ color: MUTE, fontSize: 13 }}>Carregando…</p>}

        {!isLoading && imgs.length === 0 && (
          <div style={{ border: `1px dashed ${LINE}`, borderRadius: 10, padding: "32px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: MUTE, margin: "0 0 12px" }}>Nenhuma imagem ainda.</p>
            <button className="ghost" onClick={() => inputRef.current?.click()}>
              Clique para fazer upload
            </button>
          </div>
        )}

        {!isLoading && imgs.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            {imgs.map(img => (
              <div key={img.name} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: `0.5px solid ${LINE}` }}>
                <img
                  src={img.url}
                  alt={img.name}
                  style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
                />
                <div style={{ padding: "6px 8px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: MUTE, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 90 }}>
                    {img.name}
                  </span>
                  <button
                    onClick={() => handleDelete(img.name)}
                    style={{ fontSize: 11, color: "#c0392b", background: "none", border: "none", cursor: "pointer", padding: "2px 4px", flexShrink: 0 }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
