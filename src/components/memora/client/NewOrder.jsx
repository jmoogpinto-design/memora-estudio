import React, { useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { submitClientOrder, addOrderPhotos } from "@/lib/orders.functions";
import { STYLES, TONS, GOLD, MUTE, LINE } from "../constants.js";
import { uid } from "../helpers.js";

const DESTINOS = [
  { id: "para-mim", icon: "🪞", name: "Para mim", desc: "Amor próprio, memória pessoal" },
  { id: "presente", icon: "🎁", name: "Presente", desc: "Alguém especial" },
  { id: "casal", icon: "💑", name: "Casal", desc: "Casamento, aniversário" },
  { id: "familia", icon: "🏡", name: "Família", desc: "Filhos, pais, pets" },
];

const CLIMA = [
  { id: "realista", name: "Realista" },
  { id: "onirico", name: "Onírico" },
  { id: "popart", name: "Pop Art" },
  { id: "minimalista", name: "Minimalista" },
  { id: "street", name: "Street Art" },
  { id: "colagem", name: "Colagem" },
  { id: "classico", name: "Clássico" },
];

const PERSONALIDADES = [
  { id: "delicada", name: "Delicada" },
  { id: "elegante", name: "Elegante" },
  { id: "vibrante", name: "Vibrante" },
  { id: "calma", name: "Calma" },
  { id: "sonhadora", name: "Sonhadora" },
  { id: "criativa", name: "Criativa" },
  { id: "afetiva", name: "Afetiva" },
  { id: "urbana", name: "Urbana" },
  { id: "sofisticada", name: "Sofisticada" },
];

const ORIENTACOES = [
  { id: "retrato", name: "Retrato", desc: "Vertical" },
  { id: "paisagem", name: "Paisagem", desc: "Horizontal" },
  { id: "quadrado", name: "Quadrado", desc: "1:1" },
];

const TAMANHOS = [
  { id: "a4", name: "A4 · 21×30" },
  { id: "a3", name: "A3 · 30×42" },
  { id: "medio", name: "Médio · 40×60" },
  { id: "grande", name: "Grande · 60×90" },
  { id: "sob-medida", name: "Sob medida" },
];

const PHASE_LABELS = ["Para quem", "As fotos", "O estilo", "A obra"];

export default function NewOrder({ user, onSuccess, onCancel }) {
  const [phase, setPhase] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [f, setF] = useState({
    destinatario: "",
    nome: "",
    fotos: [],
    fotosExtras: [],
    numPessoas: 1,
    comPet: false,
    estilo: "",
    clima: [],
    tons: [],
    personalidades: [],
    notas: "",
    orientacao: "",
    tamanho: "",
  });

  const set = (patch) => setF((p) => ({ ...p, ...patch }));
  const toggle = (key, val) =>
    set({ [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val] });

  const canNext = {
    1: !!f.destinatario,
    2: f.fotos.length > 0,
    3: !!f.estilo,
    4: !!f.orientacao && !!f.tamanho,
  }[phase];

  const submitFn = useServerFn(submitClientOrder);
  const photosFn = useServerFn(addOrderPhotos);

  const handleSubmit = async () => {
    if (!canNext || submitting) return;
    setSubmitting(true);
    try {
      const { id: orderId } = await submitFn({
        data: {
          client_name: f.nome || user?.email?.split("@")[0] || "Cliente",
          client_email: user?.email || "",
          style: f.estilo || null,
          people_count: f.numPessoas,
          include_pet: f.comPet,
          form_data: {
            destinatario: f.destinatario,
            nome: f.nome,
            clima: f.clima,
            tons: f.tons,
            personalidades: f.personalidades,
            notas: f.notas,
            orientacao: f.orientacao,
            tamanho: f.tamanho,
          },
        },
      });

      const allFotos = [...f.fotos, ...f.fotosExtras];
      const paths = [];
      for (let i = 0; i < allFotos.length; i++) {
        const foto = allFotos[i];
        if (foto._file) {
          const prefix = i < f.fotos.length ? "principal" : "extra";
          const path = `${orderId}/fotos/${prefix}_${i}_${foto.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
          const { error } = await supabase.storage.from("order-images").upload(path, foto._file);
          if (!error) paths.push(path);
        }
      }
      if (paths.length > 0) await photosFn({ data: { order_id: orderId, paths } });

      onSuccess();
    } catch (e) {
      alert(e.message || "Erro ao enviar pedido. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const pct = (phase / 4) * 100;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 0 40px" }} className="reveal">

      {/* Nav + dots */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem" }}>
        <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: "0.02em" }}>✦ <strong>Memora</strong></div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {PHASE_LABELS.map((_, i) => {
            const n = i + 1;
            const active = n === phase;
            const done = n < phase;
            return (
              <div key={n} style={{
                height: 6, borderRadius: 3,
                width: active ? 18 : 6,
                background: active || done ? GOLD : LINE,
                opacity: done ? 0.4 : 1,
                transition: "all 0.3s",
              }} />
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: LINE, borderRadius: 1, marginBottom: "2.5rem", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: GOLD, borderRadius: 1, transition: "width 0.4s ease" }} />
      </div>

      {/* Section label */}
      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: GOLD, marginBottom: "1rem" }}>
        Etapa {phase} de 4 · {PHASE_LABELS[phase - 1]}
      </div>

      {/* ── Etapa 1: Para quem é? ── */}
      {phase === 1 && (
        <>
          <h1 style={{ fontSize: 26, fontWeight: 500, marginBottom: 6, lineHeight: 1.2 }}>Este retrato é para você<br />ou para presentear?</h1>
          <p style={{ fontSize: 15, color: MUTE, marginBottom: "2rem", lineHeight: 1.5 }}>Isso vai nos ajudar a entender o que faz sentido nele.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {DESTINOS.map((d) => (
              <button key={d.id} onClick={() => set({ destinatario: d.id })} style={{
                border: `${f.destinatario === d.id ? 2 : 1}px solid ${f.destinatario === d.id ? GOLD : LINE}`,
                borderRadius: 12, padding: "1.1rem 1rem", cursor: "pointer",
                background: f.destinatario === d.id ? "#fdf9ef" : "#fff",
                textAlign: "left", transition: "all 0.18s",
              }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{d.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: MUTE, marginTop: 2, lineHeight: 1.4 }}>{d.desc}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Etapa 2: As fotos ── */}
      {phase === 2 && (
        <>
          <h1 style={{ fontSize: 26, fontWeight: 500, marginBottom: 6, lineHeight: 1.2 }}>Quem vai virar obra?</h1>
          <p style={{ fontSize: 15, color: MUTE, marginBottom: "2rem", lineHeight: 1.5 }}>Envie a foto principal. Quanto mais o rosto estiver visível e iluminado, melhor o resultado.</p>

          <PhotoZone items={f.fotos} max={1} onChange={(fotos) => set({ fotos })}
            label="Toque para enviar a foto principal" hint="JPG ou PNG · Rosto bem iluminado, de frente" />

          <details style={{ marginTop: 8, marginBottom: "1.5rem" }}>
            <summary style={{ fontSize: 13, color: MUTE, cursor: "pointer", listStyle: "none", marginBottom: 10 }}>
              + Adicionar mais ângulos (opcional)
            </summary>
            <PhotoZone items={f.fotosExtras} max={2} onChange={(fotosExtras) => set({ fotosExtras })}
              label="Perfil ou outro ângulo" hint="Mais referências ajudam" />
          </details>

          <div style={{ height: 0.5, background: LINE, margin: "1.5rem 0" }} />

          <label className="lbl">Sobre quem é este quadro?</label>
          <input className="inp" value={f.nome} onChange={(e) => set({ nome: e.target.value })}
            placeholder="ex.: Você, minha mãe, Ana…" style={{ marginBottom: 16 }} />

          <label className="lbl">Quantas pessoas vão aparecer?</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[1, 2].map((n) => (
              <button key={n} className={f.numPessoas === n ? "chip on" : "chip"} onClick={() => set({ numPessoas: n })}>
                {n === 1 ? "1 pessoa" : "2 pessoas"}
              </button>
            ))}
            <button className={f.comPet ? "chip on" : "chip"} onClick={() => set({ comPet: !f.comPet })}>+ um pet 🐾</button>
          </div>
        </>
      )}

      {/* ── Etapa 3: O estilo ── */}
      {phase === 3 && (
        <>
          <h1 style={{ fontSize: 26, fontWeight: 500, marginBottom: 6, lineHeight: 1.2 }}>Como você imagina<br />essa obra?</h1>
          <p style={{ fontSize: 15, color: MUTE, marginBottom: "2rem", lineHeight: 1.5 }}>Escolha o que mais te atrai. Você pode combinar técnica e estilo livremente.</p>

          <label className="lbl" style={{ marginBottom: 10 }}>Técnica</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: "1.5rem" }}>
            {STYLES.map((s) => (
              <button key={s.id} onClick={() => set({ estilo: s.id })} style={{
                border: `${f.estilo === s.id ? 2 : 1}px solid ${f.estilo === s.id ? GOLD : LINE}`,
                borderRadius: 10, overflow: "hidden", cursor: "pointer", background: "#fff",
                textAlign: "left", transition: "all 0.18s", padding: 0,
              }}>
                <div style={{ width: "100%", height: 72, overflow: "hidden" }}>
                  <img src={s.img} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, padding: "7px 8px" }}>{s.name}</div>
              </button>
            ))}
          </div>

          <label className="lbl" style={{ marginBottom: 10 }}>Clima da obra</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.5rem" }}>
            {CLIMA.map((c) => (
              <button key={c.id} className={f.clima.includes(c.id) ? "chip on" : "chip"} onClick={() => toggle("clima", c.id)}>
                {c.name}
              </button>
            ))}
          </div>

          <label className="lbl" style={{ marginBottom: 10 }}>Tons</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TONS.map((t) => (
              <button key={t.id} className={f.tons.includes(t.id) ? "tonchip on" : "tonchip"} onClick={() => toggle("tons", t.id)}>
                <span style={{ display: "flex", gap: 3 }}>
                  {t.colors.map((c, i) => <i key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />)}
                </span>
                {t.name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Etapa 4: O que a obra carrega ── */}
      {phase === 4 && (
        <>
          <h1 style={{ fontSize: 26, fontWeight: 500, marginBottom: 6, lineHeight: 1.2 }}>O que você quer<br />guardar nela?</h1>
          <p style={{ fontSize: 15, color: MUTE, marginBottom: "2rem", lineHeight: 1.5 }}>Este é o momento de contar o que torna essa pessoa única. Quanto mais você compartilhar, mais a obra vai parecer com ela.</p>

          <label className="lbl">Personalidade (pode escolher várias)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.5rem" }}>
            {PERSONALIDADES.map((p) => (
              <button key={p.id} className={f.personalidades.includes(p.id) ? "chip on" : "chip"} onClick={() => toggle("personalidades", p.id)}>
                {p.name}
              </button>
            ))}
          </div>

          <label className="lbl">Há algo que você quer incluir na obra?</label>
          <textarea className="inp ta" rows={3} value={f.notas} onChange={(e) => set({ notas: e.target.value })}
            placeholder="Uma frase, um nome, um objeto especial, uma flor favorita, uma data... qualquer coisa que faça parte da história dela."
            style={{ marginBottom: 6 }} />
          <p style={{ fontSize: 12, color: MUTE, fontStyle: "italic", marginBottom: "1.5rem", lineHeight: 1.5 }}>
            Não se preocupe em ser técnica. A artista vai interpretar com cuidado.
          </p>

          <div style={{ height: 0.5, background: LINE, margin: "1.5rem 0" }} />

          <label className="lbl" style={{ marginBottom: 8 }}>Formato do quadro</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
            {ORIENTACOES.map((o) => (
              <button key={o.id} onClick={() => set({ orientacao: o.id, tamanho: "" })} style={{
                border: `${f.orientacao === o.id ? 2 : 1}px solid ${f.orientacao === o.id ? GOLD : LINE}`,
                borderRadius: 12, padding: "1rem", cursor: "pointer",
                background: f.orientacao === o.id ? "#fdf9ef" : "#fff",
                textAlign: "left", transition: "all 0.18s",
              }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{o.name}</div>
                <div style={{ fontSize: 12, color: MUTE, marginTop: 2 }}>{o.desc}</div>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {TAMANHOS.map((t) => (
              <button key={t.id} className={f.tamanho === t.id ? "chip on" : "chip"} onClick={() => set({ tamanho: t.id })}>
                {t.name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem", paddingTop: "1.5rem", borderTop: `0.5px solid ${LINE}` }}>
        <button className="ghost" onClick={phase > 1 ? () => setPhase(phase - 1) : onCancel}>← Voltar</button>
        {phase < 4
          ? <button className="primary" disabled={!canNext} onClick={() => setPhase(phase + 1)}>Continuar</button>
          : <button className="primary" style={{ background: GOLD }} disabled={!canNext || submitting} onClick={handleSubmit}>
              {submitting ? "Enviando…" : "Enviar para a artista →"}
            </button>
        }
      </div>
    </div>
  );
}

function PhotoZone({ items, max, onChange, label, hint }) {
  const ref = useRef();
  const add = (files) => {
    const arr = Array.from(files).slice(0, max - items.length);
    const readers = arr.map((file) => new Promise((res) => {
      const r = new FileReader();
      r.onload = () => res({ id: uid(), src: r.result, name: file.name, _file: file });
      r.readAsDataURL(file);
    }));
    Promise.all(readers).then((imgs) => onChange([...items, ...imgs]));
  };

  return (
    <div style={{ marginBottom: 12 }}>
      {items.length === 0 ? (
        <button onClick={() => ref.current.click()} style={{
          width: "100%", border: `1.5px dashed ${LINE}`, borderRadius: 12,
          padding: "2rem", textAlign: "center", cursor: "pointer",
          background: "#fafaf9", display: "block", transition: "all 0.15s",
        }}>
          <div style={{ fontSize: 28, marginBottom: 8, color: GOLD }}>＋</div>
          <div style={{ fontSize: 13, color: MUTE }}>{label}</div>
          {hint && <div style={{ fontSize: 11, color: MUTE, marginTop: 4 }}>{hint}</div>}
        </button>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {items.map((it) => (
            <div key={it.id} style={{
              position: "relative", width: 100, height: 100, borderRadius: 10, overflow: "hidden",
              background: `center/cover no-repeat url(${it.src})`,
            }}>
              <button className="rm" onClick={() => onChange(items.filter((x) => x.id !== it.id))}>×</button>
            </div>
          ))}
          {items.length < max && (
            <button className="dropzone" onClick={() => ref.current.click()}>
              <span style={{ fontSize: 22, color: GOLD }}>＋</span>
            </button>
          )}
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" multiple={max > 1} hidden onChange={(e) => add(e.target.files)} />
    </div>
  );
}
