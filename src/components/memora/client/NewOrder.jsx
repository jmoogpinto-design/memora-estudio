import React, { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { submitClientOrder, addOrderPhotos } from "@/lib/orders.functions";
import { STYLES, ARTISTICOS, CENARIOS, PERSONALIDADES, TONS, ORIENTACOES, TAMANHOS } from "../constants.js";
import { normalize, uid, phaseTitle } from "../helpers.js";
import { S } from "../styles.js";
import { Field, Uploader, ArtSample, InspiracoesGaleria, Stepper } from "../ui/pieces.jsx";

export default function NewOrder({ onSuccess, onCancel, cliente }) {
  const [phase, setPhase] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [f, setF] = useState(normalize({
    cliente: { nome: cliente?.nome || "", nascimento: "", whatsapp: "", email: "" },
    sujeitos: [{ id: uid(), quem: "", fotos: [], fotosSecundarias: [] }],
  }));
  const set = (patch) => setF((p) => ({ ...p, ...patch }));
  const setC = (k, v) => setF((p) => ({ ...p, cliente: { ...p.cliente, [k]: v } }));
  const toggleTom = (id) => set({ tons: f.tons.includes(id) ? f.tons.filter((t) => t !== id) : [...f.tons, id] });
  const rebuildSujeitos = (nPessoas, comPet) => setF((p) => {
    const prev = p.sujeitos || [];
    const pessoasPrev = prev.filter((s) => s.tipo !== "pet");
    const petPrev = prev.find((s) => s.tipo === "pet");
    const pessoas = [];
    for (let i = 0; i < nPessoas; i++) {
      pessoas.push(pessoasPrev[i] || { id: uid(), tipo: "pessoa", quem: "", fotos: [], fotosSecundarias: [] });
    }
    const arr = [...pessoas];
    if (comPet) arr.push(petPrev || { id: uid(), tipo: "pet", quem: "", fotos: [], fotosSecundarias: [] });
    return { ...p, sujeitos: arr };
  });
  const pessoasCount = f.sujeitos.filter((s) => s.tipo !== "pet").length;
  const hasPet = f.sujeitos.some((s) => s.tipo === "pet");
  const setPessoas = (n) => rebuildSujeitos(n, hasPet);
  const togglePet = () => rebuildSujeitos(pessoasCount, !hasPet);
  const updateSujeito = (id, patch) => setF((p) => ({ ...p, sujeitos: p.sujeitos.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));

  const phases = ["Sobre você", "O formato", "As fotos", "O estilo"];
  const canNext = {
    1: f.cliente.nome && f.cliente.email,
    2: f.orientacao && f.tamanho,
    3: f.sujeitos.every((s) => s.fotos.length > 0),
    4: f.estilo,
  }[phase];

  const submitFn = useServerFn(submitClientOrder);
  const photosFn = useServerFn(addOrderPhotos);

  const handleSubmit = async () => {
    if (!canNext || submitting) return;
    setSubmitting(true);
    try {
      // 1. Cria o pedido no banco
      const formData = {
        cliente: f.cliente,
        estilo: f.estilo,
        artistico: f.artistico,
        cenario: f.cenario,
        personalidades: f.personalidades,
        tons: f.tons,
        orientacao: f.orientacao,
        tamanho: f.tamanho,
        tamanhoOutro: f.tamanhoOutro,
        inspiracoes: f.inspiracoes,
        extra: f.extra,
        sujeitos: f.sujeitos.map((s) => ({
          id: s.id, tipo: s.tipo, quem: s.quem,
          fotos: s.fotos.map((p) => ({ id: p.id, name: p.name })),
          fotosSecundarias: s.fotosSecundarias.map((p) => ({ id: p.id, name: p.name })),
        })),
      };
      const { id: orderId } = await submitFn({
        data: {
          client_name: f.cliente.nome,
          client_email: f.cliente.email,
          style: f.estilo || null,
          people_count: f.sujeitos.filter((s) => s.tipo !== "pet").length || 1,
          include_pet: f.sujeitos.some((s) => s.tipo === "pet"),
          form_data: formData,
        },
      });

      // 2. Faz upload das fotos para o Storage
      const paths = [];
      for (let si = 0; si < f.sujeitos.length; si++) {
        const s = f.sujeitos[si];
        for (let pi = 0; pi < s.fotos.length; pi++) {
          const foto = s.fotos[pi];
          if (foto._file) {
            const path = `${orderId}/fotos/s${si}_${pi}_${foto.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
            const { error } = await supabase.storage.from("order-images").upload(path, foto._file);
            if (!error) paths.push(path);
          }
        }
        for (let pi = 0; pi < s.fotosSecundarias.length; pi++) {
          const foto = s.fotosSecundarias[pi];
          if (foto._file) {
            const path = `${orderId}/fotos/s${si}_sec${pi}_${foto.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
            const { error } = await supabase.storage.from("order-images").upload(path, foto._file);
            if (!error) paths.push(path);
          }
        }
      }

      // 3. Registra as fotos no banco
      if (paths.length > 0) {
        await photosFn({ data: { order_id: orderId, paths } });
      }

      onSuccess();
    } catch (e) {
      alert(e.message || "Erro ao enviar pedido. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reveal" style={{ maxWidth: 720, margin: "0 auto" }}>
      <button className="ghost sm" onClick={onCancel}>← Voltar</button>
      <p style={S.eyebrow}>Novo retrato · etapa {phase} de 4</p>
      <h1 style={S.h1}>{phaseTitle(phase)}</h1>
      <Stepper steps={phases} step={phase - 1} />

      <div style={S.card}>
        {phase === 1 && (
          <>
            <p style={S.fieldHint}>Para começarmos a te conhecer.</p>
            <Field label="Nome completo"><input className="inp" value={f.cliente.nome} onChange={(e) => setC("nome", e.target.value)} placeholder="Seu nome" /></Field>
            <Field label="Data de nascimento"><input className="inp" type="date" value={f.cliente.nascimento} onChange={(e) => setC("nascimento", e.target.value)} /></Field>
            <Field label="WhatsApp"><input className="inp" value={f.cliente.whatsapp} onChange={(e) => setC("whatsapp", e.target.value)} placeholder="(00) 00000-0000" /></Field>
            <Field label="E-mail"><input className="inp" value={f.cliente.email} onChange={(e) => setC("email", e.target.value)} placeholder="voce@email.com" /></Field>
          </>
        )}

        {phase === 2 && (
          <>
            <Field label="Orientação do quadro">
              <div style={S.orientRow}>
                {ORIENTACOES.map((o) => (
                  <button key={o.id} className={f.orientacao === o.id ? "orient on" : "orient"} onClick={() => set({ orientacao: o.id, tamanho: "" })}>
                    <span style={S.orientIconBox}><span style={{ ...S.orientShape, aspectRatio: o.ratio }} /></span>
                    <span style={S.orientName}>{o.name}</span>
                  </button>
                ))}
              </div>
            </Field>

            {f.orientacao && (
              <Field label="Tamanho">
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {TAMANHOS[f.orientacao].map((t) => (
                    <button key={t.id} className={f.tamanho === t.id ? "sizechip on" : "sizechip"} onClick={() => set({ tamanho: t.id, tamanhoOutro: "" })}>
                      <strong>{t.name}</strong><span>{t.cm}</span>
                    </button>
                  ))}
                  <button className={f.tamanho === "outro" ? "sizechip on" : "sizechip"} onClick={() => set({ tamanho: "outro" })}>
                    <strong>Outro</strong><span>medida sob medida</span>
                  </button>
                </div>
                {f.tamanho === "outro" && (
                  <input className="inp" style={{ marginTop: 10 }} value={f.tamanhoOutro} onChange={(e) => set({ tamanhoOutro: e.target.value })}
                    placeholder="Escreva o tamanho desejado — ex.: 50 × 70 cm" />
                )}
              </Field>
            )}
          </>
        )}

        {phase === 3 && (
          <>
            <p style={S.fieldHint}>Quem vai aparecer no quadro? Pode ser 1 ou 2 pessoas, com a opção de incluir o pet também.</p>

            <Field label="Quantas pessoas vão aparecer?">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[1, 2].map((n) => (
                  <button key={n} className={pessoasCount === n ? "chip on" : "chip"} onClick={() => setPessoas(n)}>
                    {n === 1 ? "1 pessoa" : "2 pessoas"}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Incluir o pet?">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className={!hasPet ? "chip on" : "chip"} onClick={() => { if (hasPet) togglePet(); }}>Sem pet</button>
                <button className={hasPet ? "chip on" : "chip"} onClick={() => { if (!hasPet) togglePet(); }}>🐾 Com pet</button>
              </div>
            </Field>

            {f.sujeitos.map((s, i) => {
              const isPet = s.tipo === "pet";
              return (
                <div key={s.id} style={S.subjectCard}>
                  <div style={S.subjectHead}>
                    <span style={S.subjectNum}>{isPet ? "🐾" : i + 1}</span>
                    <input className="inp" style={{ flex: 1 }} value={s.quem} onChange={(e) => updateSujeito(s.id, { quem: e.target.value })}
                      placeholder={isPet ? "Nome do pet — ex.: Luna, Thor…" : (i === 0 ? "Quem é? ex.: Você, eu mesma…" : "Quem é? ex.: meu namorado, minha mãe…")} />
                  </div>
                  <label className="lbl" style={{ marginTop: 14 }}>Foto principal {s.quem ? `de ${s.quem}` : (isPet ? "do pet" : "")}</label>
                  <Uploader items={s.fotos} max={1} onChange={(fotos) => updateSujeito(s.id, { fotos })} hint={isPet ? "O focinho que vira obra" : "O rosto que vira obra"} big />
                  <label className="lbl" style={{ marginTop: 14 }}>Outros ângulos (opcional, até 2)</label>
                  <Uploader items={s.fotosSecundarias} max={2} onChange={(fotosSecundarias) => updateSujeito(s.id, { fotosSecundarias })} hint="Mais ângulos" />
                </div>
              );
            })}
            <p style={S.microHint}>Mais ângulos ajudam o artista a captar melhor as feições de cada um.</p>
          </>
        )}

        {phase === 4 && (
          <>
            <Field label="1 · Tipo de pintura — qual acabamento de pincel e tinta te encanta?">
              <div style={S.artGrid}>
                {STYLES.map((s) => (
                  <button key={s.id} className={f.estilo === s.id ? "painttype on" : "painttype"} onClick={() => set({ estilo: s.id })}>
                    <img src={s.img} alt={s.name} style={S.artImg} />
                    <div className="ptbody">
                      <strong>{s.name}</strong><span>{s.desc}</span>
                      <div className="ptbrush" style={{ backgroundImage: `url(${s.brush})` }} aria-hidden="true" />
                    </div>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="2 · Estilo artístico — conjunto de técnicas, temas e formas que caracterizam a produção">
              <div style={S.artGrid}>
                {ARTISTICOS.map((a) => (
                  <button key={a.id} className={f.artistico === a.id ? "artcard on" : "artcard"} onClick={() => set({ artistico: a.id })}>
                    <img src={a.img} alt={a.name} style={S.artImg} />
                    <strong>{a.name}</strong><span>{a.desc}</span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="3 · Universo da imagem — o que envolve a pessoa">
              <div style={S.artGrid}>
                {CENARIOS.map((c) => (
                  <button key={c.id} className={f.cenario === c.id ? "artcard sm on" : "artcard sm"} onClick={() => set({ cenario: c.id })}>
                    <ArtSample kind={c.art} />
                    <strong>{c.name}</strong>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="4 · Personalidade — o que a obra deve transmitir? (pode escolher várias)">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PERSONALIDADES.map((p) => (
                  <button key={p.id} className={f.personalidades.includes(p.id) ? "chip on" : "chip"}
                    onClick={() => set({ personalidades: f.personalidades.includes(p.id) ? f.personalidades.filter((x) => x !== p.id) : [...f.personalidades, p.id] })}>
                    {p.name}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Quais tons você imagina?">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {TONS.map((t) => (
                  <button key={t.id} className={f.tons.includes(t.id) ? "tonchip on" : "tonchip"} onClick={() => toggleTom(t.id)}>
                    <span style={S.tonDots}>{t.colors.map((c, i) => <i key={i} style={{ background: c }} />)}</span>{t.name}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Selecione na galeria até 3 inspirações que você ama">
              <InspiracoesGaleria selected={f.inspiracoes} onChange={(inspiracoes) => set({ inspiracoes })} />
            </Field>

            <Field label="Tem mais algo que gostaria de incluir no seu quadro?">
              <textarea className="inp ta" value={f.extra} onChange={(e) => set({ extra: e.target.value })}
                placeholder="Uma frase, um nome, um objeto especial, o seu pet, um livro, um elemento essencial para você…" />
              <p style={S.microHint}>Esse quadro deve refletir quem a pessoa é, o que sente e o que sonha.</p>
            </Field>
          </>
        )}

        <div style={S.wizardNav}>
          {phase > 1 ? <button className="ghost" onClick={() => setPhase(phase - 1)}>Anterior</button> : <span />}
          {phase < 4
            ? <button className="primary" disabled={!canNext} onClick={() => setPhase(phase + 1)}>Continuar</button>
            : <button className="primary lg" disabled={!canNext || submitting} onClick={handleSubmit}>
                {submitting ? "Enviando…" : "Enviar para o ateliê"}
              </button>}
        </div>
      </div>
    </div>
  );
}
