import React, { useState } from "react";
import { STATUSES, STYLES, ARTISTICOS, CENARIOS, TONS, MUTE, GALERIA } from "../constants.js";
import { artGradient, nameOf, fmtPersonalidades, fmtFormato, uid, today, ratioOf } from "../helpers.js";
import { S } from "../styles.js";
import { StatusTag, ProgressRail, Detail, Thumb, ArtSample, SubjectPhotos, RoomMockup } from "../ui/pieces.jsx";

export default function ClientDetail({ order, back, update }) {
  const [pick, setPick] = useState(order.escolha);
  const [ajuste, setAjuste] = useState("");
  const st = STATUSES[order.status];
  const style = STYLES.find((s) => s.id === order.estilo);

  return (
    <div className="reveal" style={{ maxWidth: 820, margin: "0 auto" }}>
      <button className="ghost sm" onClick={back}>← Meus retratos</button>
      <div style={S.detailHead}>
        <div><p style={S.eyebrow}>Pedido #{order.id} · {order.date}</p><h1 style={S.h1}>Seu retrato</h1></div>
        <StatusTag status={order.status} big />
      </div>
      <ProgressRail status={order.status} />
      <p style={S.statusHint}>{st.hint}</p>

      {order.mensagens.length > 0 && (
        <section style={S.card}>
          <h2 style={S.h2}>Recado do ateliê</h2>
          {order.mensagens.map((m) => (
            <div key={m.id} style={S.msg}>
              <div style={S.msgHead}><span>{m.de === "ateliê" ? "✦ Ateliê Memora" : "Você"}</span><span style={{ color: MUTE }}>{m.data}</span></div>
              <p style={{ margin: "6px 0 0" }}>{m.texto}</p>
            </div>
          ))}
        </section>
      )}

      {order.status === "aprovacao" && (
        <section style={S.card}>
          <h2 style={S.h2}>Escolha sua versão favorita</h2>
          <div style={S.versionGrid}>
            {order.versoes.map((v, i) => (
              <button key={v.id} className={pick === i ? "version on" : "version"} onClick={() => setPick(i)}>
                <div style={{ ...S.bigArt, background: v.src ? `center/cover no-repeat url(${v.src})` : artGradient(v.tone) }}>{pick === i && <span style={S.check}>✓</span>}</div>
                <strong>{v.nome}</strong>{v.obs && <span style={{ color: MUTE, fontSize: 13 }}>{v.obs}</span>}
              </button>
            ))}
          </div>
          <button className="primary lg" style={{ marginTop: 18 }} disabled={pick === null}
            onClick={() => update({ escolha: pick, status: "finalizado", final: { tone: order.versoes[pick].tone } })}>
            Aprovar versão {pick !== null ? pick + 1 : ""}
          </button>
          <div style={S.divider} />
          <label className="lbl">Prefere ajustar algo antes?</label>
          <textarea className="inp ta" value={ajuste} onChange={(e) => setAjuste(e.target.value)} placeholder="Menos flores · mais claro · trocar cores · centralizar rosto" />
          <button className="ghost" style={{ marginTop: 10 }} disabled={!ajuste.trim()}
            onClick={() => update({ status: "ajustes", ajusteTexto: ajuste, mensagens: [...order.mensagens, { id: uid(), de: "cliente", texto: ajuste, data: today().slice(0, 6) }] })}>
            Solicitar ajustes
          </button>
        </section>
      )}

      {order.status === "finalizado" && order.final && (
        <section style={S.card}>
          <h2 style={S.h2}>Sua obra está pronta.</h2>
          <div style={{ ...S.bigArt, background: order.final.src ? `center/cover no-repeat url(${order.final.src})` : artGradient(order.final.tone), height: 340, marginBottom: 22, aspectRatio: ratioOf(order.orientacao) }} />
          <h3 style={S.h3}>Veja na parede</h3>
          <RoomMockup tone={order.final.tone} orientacao={order.orientacao} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
            <button className="primary">Baixar JPG</button>
            <button className="ghost">Baixar PNG</button>
            <button className="ghost">Baixar PDF</button>
          </div>
        </section>
      )}

      {order.status === "ajustes" && (
        <section style={S.card}>
          <h2 style={S.h2}>Estamos refinando</h2>
          <p style={{ color: MUTE }}>Seu pedido de ajuste:</p>
          <blockquote style={S.quote}>{order.ajusteTexto}</blockquote>
        </section>
      )}

      <ResumoPedido order={order} style={style} />
    </div>
  );
}

function ResumoPedido({ order, style }) {
  return (
    <section style={S.card}>
      <h2 style={S.h2}>Resumo do pedido</h2>
      <Detail k="Tipo de pintura" v={style?.name} />
      <Detail k="Estilo artístico" v={nameOf(ARTISTICOS, order.artistico)} />
      <Detail k="Universo" v={nameOf(CENARIOS, order.cenario)} />
      <Detail k="Personalidade" v={fmtPersonalidades(order.personalidades)} />
      <Detail k="Formato" v={fmtFormato(order)} />
      <Detail k="Tons" v={order.tons.map((t) => TONS.find((x) => x.id === t)?.name).filter(Boolean).join(", ")} />
      {order.extra && <Detail k="Pedido especial" v={order.extra} />}
      {order.inspiracoes.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <p style={S.subjLabel}>Inspirações escolhidas</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {order.inspiracoes.map((id) => {
              const g = GALERIA.find((x) => x.id === id);
              return <div key={id} style={{ ...S.thumb, width: 64, height: 64, overflow: "hidden" }}><ArtSample kind={g?.art} /></div>;
            })}
          </div>
        </div>
      )}
      <SubjectPhotos order={order} />
      {order.referencias.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          {order.referencias.map((p) => <Thumb key={p.id} tone={p.tone} src={p.src} ref_ />)}
        </div>
      )}
    </section>
  );
}
