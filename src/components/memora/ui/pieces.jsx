import React, { useState, useRef } from "react";
import { GOLD, MUTE, LINE, GALERIA, STATUSES } from "../constants.js";
import { artGradient, uid, ratioOf } from "../helpers.js";
import { S } from "../styles.js";

/* ---- ArtSample: SVG miniatura para cenários e galeria ---- */
export function ArtSample({ kind }) {
  const face = (fill, stroke) => (
    <g>
      <circle cx="50" cy="42" r="16" fill={fill} />
      <path d="M30 78 Q50 58 70 78 L70 84 L30 84 Z" fill={fill} />
      {stroke && <><circle cx="50" cy="42" r="16" fill="none" stroke={stroke} strokeWidth="1.5" /><path d="M30 78 Q50 58 70 78" fill="none" stroke={stroke} strokeWidth="1.5" /></>}
    </g>
  );
  const A = { width: "100%", height: 84, viewBox: "0 0 100 84", preserveAspectRatio: "xMidYMid slice", style: { display: "block", borderRadius: "6px 6px 0 0" } };
  switch (kind) {
    case "aquarela": return <svg {...A}><rect width="100" height="84" fill="#f3eee6"/><circle cx="38" cy="34" r="26" fill="#cfe0e6" opacity=".7"/><circle cx="64" cy="48" r="22" fill="#e8cdbf" opacity=".7"/><circle cx="52" cy="30" r="18" fill="#dfe6cf" opacity=".6"/>{face("#b98e74")}</svg>;
    case "acrilica": return <svg {...A}><rect width="100" height="84" fill="#efe7da"/><rect x="10" y="14" width="80" height="18" fill="#d98a4e" opacity=".8"/><rect x="14" y="50" width="72" height="16" fill="#3f8a7a" opacity=".75"/>{face("#8a5a3a")}</svg>;
    case "oleo": return <svg {...A}><rect width="100" height="84" fill="#2b2620"/><ellipse cx="50" cy="44" rx="34" ry="32" fill="#5a4630"/>{face("#c89a6a")}</svg>;
    case "sketch": return <svg {...A}><rect width="100" height="84" fill="#fbfaf6"/><g fill="none" stroke="#3b352c" strokeWidth="1.4"><circle cx="50" cy="40" r="16"/><path d="M32 80 Q50 60 68 80"/><path d="M40 38 q4 4 8 0"/></g></svg>;
    case "popart": return <svg {...A}><rect width="50" height="42" fill="#f6c026"/><rect x="50" width="50" height="42" fill="#e0517a"/><rect y="42" width="50" height="42" fill="#3f9ad8"/><rect x="50" y="42" width="50" height="42" fill="#5db06a"/>{face("#2b2620")}</svg>;
    case "street": return <svg {...A}><rect width="100" height="84" fill="#3a3a3c"/><path d="M0 60 L100 40" stroke="#e0517a" strokeWidth="8"/><path d="M0 30 L100 70" stroke="#f6c026" strokeWidth="6" opacity=".8"/>{face("#d8c4a8")}</svg>;
    case "colagem": return <svg {...A}><rect width="100" height="84" fill="#ece5d8"/><rect x="8" y="10" width="40" height="36" fill="#c9a87c" transform="rotate(-6 28 28)"/><rect x="52" y="30" width="38" height="44" fill="#9ab0a0" transform="rotate(5 71 52)"/>{face("#6f5a3e")}</svg>;
    case "digital": return <svg {...A}><defs><linearGradient id="dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b59cc4"/><stop offset="1" stopColor="#e8c7b0"/></linearGradient></defs><rect width="100" height="84" fill="url(#dg)"/>{face("#7a5c6a", "#fff")}</svg>;
    case "flores": return <svg {...A}><rect width="100" height="84" fill="#f3eee6"/>{[[16,20,"#e0517a"],[80,26,"#f0a02a"],[24,64,"#c97b9a"],[78,66,"#e9b04a"]].map(([x,y,c],i)=><g key={i}>{[0,72,144,216,288].map(a=><ellipse key={a} cx={x} cy={y} rx="6" ry="3" fill={c} transform={`rotate(${a} ${x} ${y})`}/>)}</g>)}{face("#b98e74")}</svg>;
    case "jardim": return <svg {...A}><rect width="100" height="84" fill="#eaf0e2"/><path d="M0 84 Q20 60 30 84 M70 84 Q82 58 100 84" fill="#7d9471"/>{[14,86].map(x=><path key={x} d={`M${x} 80 q-6 -16 0 -28`} stroke="#5d7a5a" strokeWidth="3" fill="none"/>)}{face("#b98e74")}</svg>;
    case "sonhador": return <svg {...A}><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a4a72"/><stop offset="1" stopColor="#b59cc4"/></linearGradient></defs><rect width="100" height="84" fill="url(#sk)"/>{[[18,16],[30,28],[78,18],[86,40],[60,12]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="1.6" fill="#fff"/>)}<circle cx="74" cy="60" r="10" fill="#f4e6c4" opacity=".5"/>{face("#d8c4a8")}</svg>;
    case "borboletas": return <svg {...A}><rect width="100" height="84" fill="#f5eef0"/>{[[20,22,"#c97b9a"],[82,30,"#9ab0c4"]].map(([x,y,c],i)=><g key={i} fill={c} opacity=".85"><ellipse cx={x-4} cy={y} rx="4" ry="6"/><ellipse cx={x+4} cy={y} rx="4" ry="6"/></g>)}{face("#b98e74")}</svg>;
    case "cidade": return <svg {...A}><rect width="100" height="84" fill="#cdd2d6"/><g fill="#9aa3a8">{[6,22,40,62,80].map((x,i)=><rect key={i} x={x} y={30+(i%3)*8} width="12" height="54"/>)}</g>{face("#7a6450")}</svg>;
    case "abstrato": return <svg {...A}><rect width="100" height="84" fill="#efe7da"/><path d="M-5 50 Q30 20 55 50 T105 45" stroke="#c97b3f" strokeWidth="7" fill="none" opacity=".7"/><path d="M-5 64 Q40 40 70 66 T105 60" stroke="#7d94a8" strokeWidth="6" fill="none" opacity=".6"/>{face("#8a6e4b")}</svg>;
    case "colorido": return <svg {...A}><defs><linearGradient id="cl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#e0517a"/><stop offset=".5" stopColor="#f0a02a"/><stop offset="1" stopColor="#3f9ad8"/></linearGradient></defs><rect width="100" height="84" fill="url(#cl)" opacity=".85"/>{face("#5a4630","#fff")}</svg>;
    case "recortes": return <svg {...A}><rect width="100" height="84" fill="#ece5d8"/>{[[6,8,18],[70,10,-10],[12,56,8],[64,58,12]].map(([x,y,r],i)=><rect key={i} x={x} y={y} width="26" height="14" fill="#fff" stroke="#bbb" transform={`rotate(${r} ${x} ${y})`}/>)}{face("#6f5a3e")}</svg>;
    case "minimal": return <svg {...A}><rect width="100" height="84" fill="#f6f3ec"/><g fill="none" stroke="#b0a68f" strokeWidth="1.4"><circle cx="50" cy="40" r="15"/><path d="M34 80 Q50 62 66 80"/></g></svg>;
    case "mediterraneo": return <svg {...A}><rect width="100" height="84" fill="#e9d9b8"/><rect y="58" width="100" height="26" fill="#5a8aa8" opacity=".6"/><circle cx="80" cy="20" r="9" fill="#f0c04a"/>{face("#c89a6a")}</svg>;
    case "biblioteca": return <svg {...A}><rect width="100" height="84" fill="#e7d8c4"/><g>{[6,20,34].map((y,i)=><g key={i}>{[10,22,34,46,58,70,82].map(x=><rect key={x} x={x} y={y} width="8" height="12" fill={["#8a4a3a","#3a5a6a","#7a6a3a"][(x+y)%3]}/>)}</g>)}</g>{face("#6f5a3e")}</svg>;
    case "mar": return <svg {...A}><rect width="100" height="84" fill="#bfe0e0"/><path d="M0 60 Q25 52 50 60 T100 60 V84 H0Z" fill="#5a9aa8"/><path d="M0 70 Q25 64 50 70 T100 70 V84 H0Z" fill="#3f7a8a"/>{face("#d8c4a8")}</svg>;
    case "campo": return <svg {...A}><rect width="100" height="84" fill="#dCe6c8"/><rect y="62" width="100" height="22" fill="#a8b878"/><circle cx="82" cy="18" r="8" fill="#f0c04a"/>{face("#b98e74")}</svg>;
    case "personalizado": return <svg {...A}><rect width="100" height="84" fill="#efe7da"/><text x="50" y="20" textAnchor="middle" fontSize="14" fill="#9a7b3f">✦</text>{face("#8a6e4b")}</svg>;
    default: return <svg {...A}><rect width="100" height="84" fill="#ece5d8"/>{face("#8a6e4b")}</svg>;
  }
}

/* ---- ArtStyleSample: SVG miniatura para estilos artísticos (camada 2) ---- */
export function ArtStyleSample({ kind }) {
  const A = { width: "100%", height: 78, viewBox: "0 0 100 78", preserveAspectRatio: "xMidYMid slice", style: { display: "block", borderRadius: "6px 6px 0 0" } };
  const face = (fill) => <g><circle cx="50" cy="38" r="14" fill={fill} /><path d="M32 72 Q50 54 68 72 Z" fill={fill} /></g>;
  switch (kind) {
    case "realista": return <svg {...A}><defs><radialGradient id="re" cx="50%" cy="40%"><stop offset="0" stopColor="#e8cdb0"/><stop offset="1" stopColor="#9a7250"/></radialGradient></defs><rect width="100" height="78" fill="#cdbfa6"/><ellipse cx="50" cy="40" rx="22" ry="26" fill="url(#re)"/>{face("#b98e6a")}</svg>;
    case "abstrata": return <svg {...A}><rect width="100" height="78" fill="#efe7da"/><path d="M-5 45 Q30 15 55 45 T105 40" stroke="#c97b3f" strokeWidth="8" fill="none" opacity=".7"/><path d="M-5 60 Q40 35 70 62 T105 56" stroke="#7d94a8" strokeWidth="7" fill="none" opacity=".6"/><circle cx="52" cy="40" r="13" fill="#8a6e4b" opacity=".85"/></svg>;
    case "geometrica": return <svg {...A}><rect width="100" height="78" fill="#e7dcc4"/><g opacity=".88"><polygon points="50,12 66,40 50,40" fill="#c98a4e"/><polygon points="50,12 34,40 50,40" fill="#e0b07a"/><polygon points="34,40 66,40 50,68" fill="#9a7250"/><polygon points="30,30 44,52 18,52" fill="#7d94a8" opacity=".7"/></g></svg>;
    case "popart": return <svg {...A}><rect width="50" height="39" fill="#f6c026"/><rect x="50" width="50" height="39" fill="#e0517a"/><rect y="39" width="50" height="39" fill="#3f9ad8"/><rect x="50" y="39" width="50" height="39" fill="#5db06a"/>{face("#2b2620")}</svg>;
    case "street": return <svg {...A}><rect width="100" height="78" fill="#3a3a3c"/><path d="M0 56 L100 36" stroke="#e0517a" strokeWidth="9"/><path d="M0 28 L100 66" stroke="#f6c026" strokeWidth="6" opacity=".8"/>{face("#d8c4a8")}</svg>;
    case "colagem": return <svg {...A}><rect width="100" height="78" fill="#ece5d8"/><rect x="8" y="8" width="40" height="34" fill="#c9a87c" transform="rotate(-6 28 25)"/><rect x="52" y="28" width="38" height="42" fill="#9ab0a0" transform="rotate(5 71 49)"/>{face("#6f5a3e")}</svg>;
    default: return <svg {...A}><rect width="100" height="78" fill="#ece5d8"/>{face("#8a6e4b")}</svg>;
  }
}

/* ---- InspiracoesGaleria: seleção de até 3 da galeria ---- */
export function InspiracoesGaleria({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else if (selected.length < 3) onChange([...selected, id]);
  };
  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {selected.map((id) => {
          const g = GALERIA.find((x) => x.id === id);
          return <div key={id} style={{ ...S.thumb, width: 70, height: 70, overflow: "hidden" }}><ArtSample kind={g?.art} /></div>;
        })}
        <button className="ghost" type="button" onClick={() => setOpen(true)}>✦ Abrir galeria de inspirações</button>
        <span style={{ fontSize: 13, color: MUTE }}>{selected.length}/3 selecionadas</span>
      </div>

      {open && (
        <div style={S.modalBg} onClick={() => setOpen(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHead}>
              <h3 style={{ ...S.h2, margin: 0 }}>Galeria de inspirações</h3>
              <button className="ghost sm2" onClick={() => setOpen(false)}>Fechar</button>
            </div>
            <p style={{ color: MUTE, fontSize: 14, margin: "0 0 16px" }}>Toque para selecionar até 3 que combinam com o que você sonha.</p>
            <div style={S.galeriaGrid}>
              {GALERIA.map((g) => (
                <button key={g.id} type="button" className={selected.includes(g.id) ? "gitem on" : "gitem"} onClick={() => toggle(g.id)}>
                  <ArtSample kind={g.art} />
                  {selected.includes(g.id) && <span style={S.gcheck}>✓</span>}
                </button>
              ))}
            </div>
            <button className="primary block" style={{ marginTop: 18 }} onClick={() => setOpen(false)}>Concluir seleção ({selected.length}/3)</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- RoomMockup: arte em 3 ambientes de parede ---- */
const ROOMS = [
  { id: "sala", name: "Sala", wall: "#e9e3d8", floor: "#cbb89a", scale: 0.52, x: "50%", y: "42%", sofa: true },
  { id: "destaque", name: "Em destaque", wall: "#dfd8cb", floor: null, scale: 0.66, x: "50%", y: "46%", sofa: false },
  { id: "quarto", name: "Quarto", wall: "#e4dccf", floor: "#bfa988", scale: 0.46, x: "50%", y: "40%", sofa: false, bed: true },
];

export function RoomMockup({ tone, orientacao }) {
  return (
    <div style={S.roomGrid}>
      {ROOMS.map((r) => (
        <div key={r.id}>
          <div style={{ ...S.room, background: r.wall }}>
            {r.floor && <div style={{ ...S.roomFloor, background: r.floor }} />}
            {r.sofa && <div style={S.roomSofa} />}
            {r.bed && <div style={S.roomBed} />}
            <div style={{
              position: "absolute", left: r.x, top: r.y, transform: "translate(-50%,-50%)",
              height: `${r.scale * 100}%`, aspectRatio: ratioOf(orientacao),
              background: artGradient(tone), border: "4px solid #fff",
              boxShadow: "0 6px 16px rgba(0,0,0,.22)", borderRadius: 1,
            }} />
          </div>
          <p style={S.roomLabel}>{r.name}</p>
        </div>
      ))}
    </div>
  );
}

/* ---- SubjectPhotos: fotos agrupadas por sujeito ---- */
export function SubjectPhotos({ order, big }) {
  const subs = (order.sujeitos && order.sujeitos.length)
    ? order.sujeitos
    : [{ id: "legacy", quem: "", fotos: order.fotos || [], fotosSecundarias: order.fotosSecundarias || [] }];
  return (
    <div>
      {subs.map((s, i) => {
        const todas = [...(s.fotos || []), ...(s.fotosSecundarias || [])];
        if (todas.length === 0) return null;
        return (
          <div key={s.id} style={{ marginBottom: 12 }}>
            {(order.sujeitos && order.sujeitos.length > 1 || s.quem) && <p style={S.subjLabel}>{s.quem || `Pessoa ${i + 1}`}</p>}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {todas.map((p, j) => <Thumb key={p.id} tone={p.tone} src={p.src} big={big && j === 0} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---- Frame: moldura animada no card de pedido ---- */
export function Frame({ fill, tone, src }) {
  return (
    <div style={S.frameWrap}>
      <div style={{ ...S.frameArt, background: src ? `center/cover no-repeat url(${src})` : artGradient(tone) }} />
      <svg style={S.frameSvg} viewBox="0 0 100 64" preserveAspectRatio="none">
        <rect x="3" y="3" width="94" height="58" fill="none" stroke={LINE} strokeWidth="2" />
        <rect x="3" y="3" width="94" height="58" fill="none" stroke={GOLD} strokeWidth="2"
          strokeDasharray="304" strokeDashoffset={304 * (1 - fill)}
          style={{ transition: "stroke-dashoffset .8s ease" }} />
      </svg>
    </div>
  );
}

/* ---- ProgressRail: trilho de progresso do pedido ---- */
export function ProgressRail({ status }) {
  const order = ["recebido", "producao", "aprovacao", "finalizado"];
  const map = { recebido: 0, producao: 1, aprovacao: 2, ajustes: 2, finalizado: 3 };
  const cur = map[status];
  return (
    <div className="rail">
      {order.map((s, i) => (
        <div key={s} className="railstep">
          <span className={i <= cur ? "dot on" : "dot"}>{i < cur ? "✓" : i + 1}</span>
          <span className={i <= cur ? "railLbl on" : "railLbl"}>{STATUSES[s].label}</span>
          {i < order.length - 1 && <span className={i < cur ? "bar on" : "bar"} />}
        </div>
      ))}
    </div>
  );
}

/* ---- Stepper: barra de progresso do wizard de pedido ---- */
export function Stepper({ steps, step }) {
  return (
    <div className="rail" style={{ marginBottom: 22 }}>
      {steps.map((s, i) => (
        <div key={s} className="railstep">
          <span className={i <= step ? "dot on" : "dot"}>{i < step ? "✓" : i + 1}</span>
          <span className={i <= step ? "railLbl on" : "railLbl"}>{s}</span>
          {i < steps.length - 1 && <span className={i < step ? "bar on" : "bar"} />}
        </div>
      ))}
    </div>
  );
}

/* ---- Pequenos componentes reutilizáveis ---- */
export function StatusTag({ status, big }) {
  return <span className={`tag ${status}`} style={big ? { fontSize: 13, padding: "6px 14px" } : undefined}>{STATUSES[status].label}</span>;
}

export function Field({ label, children }) {
  return <div style={{ marginBottom: 18 }}><label className="lbl">{label}</label>{children}</div>;
}

export function Detail({ k, v }) {
  return <div style={S.detailRow}><span style={S.detailK}>{k}</span><span style={S.detailV}>{v || "—"}</span></div>;
}

export function Thumb({ tone, src, ref_, big }) {
  const sz = big ? 88 : 64;
  return (
    <div style={{ ...S.thumb, width: sz, height: sz, overflow: "hidden", background: src ? `center/cover no-repeat url(${src})` : artGradient(tone) }}>
      {ref_ && <span style={S.refBadge}>ref</span>}
    </div>
  );
}

export function Empty({ t }) {
  return <span style={{ color: MUTE, fontSize: 13 }}>{t}</span>;
}

export function UploadOne({ label, value, onChange }) {
  const inputRef = React.useRef(null);
  const handle = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange && onChange(reader.result);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <button type="button" className="uploadone" onClick={() => inputRef.current?.click()}
        style={value ? { borderStyle: "solid", padding: 0, height: 160, overflow: "hidden", background: `center/cover no-repeat url(${value})` } : undefined}>
        {!value && <><span style={{ fontSize: 18, color: GOLD }}>＋</span> {label}</>}
      </button>
      {value && <button type="button" className="ghost sm" style={{ marginTop: 6 }} onClick={() => onChange && onChange(null)}>Trocar imagem</button>}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handle} />
    </div>
  );
}

export function Chips({ options, value, onChange, freeText, freePlaceholder }) {
  const isCustom = value && !options.includes(value);
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {options.map((o) => <button key={o} className={value === o ? "chip on" : "chip"} onClick={() => onChange(o)}>{o}</button>)}
      </div>
      {freeText && <input className="inp" style={{ marginTop: 10 }} value={isCustom ? value : ""} onChange={(e) => onChange(e.target.value)} placeholder={freePlaceholder || "Ou escreva por extenso…"} />}
    </div>
  );
}

export function Uploader({ items, max, onChange, hint, big }) {
  const ref = useRef();
  const add = (files) => {
    const arr = Array.from(files).slice(0, max - items.length);
    const readers = arr.map((file) => new Promise((res) => {
      const r = new FileReader();
      r.onload = () => res({ id: uid(), src: r.result, name: file.name, _file: file });
      r.onerror = () => res({ id: uid(), src: null });
      r.readAsDataURL(file);
    }));
    Promise.all(readers).then((imgs) => onChange([...items, ...imgs]));
  };
  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {items.map((it) => {
          const sz = big && max === 1 ? 120 : 80;
          return (
            <div key={it.id} style={{ ...S.thumb, width: sz, height: sz, position: "relative", overflow: "hidden",
              background: it.src ? `center/cover no-repeat url(${it.src})` : artGradient(it.tone) }}>
              <button className="rm" onClick={() => onChange(items.filter((x) => x.id !== it.id))}>×</button>
            </div>
          );
        })}
        {items.length < max && (
          <button className={big && items.length === 0 ? "dropzone big" : "dropzone"} onClick={() => ref.current.click()}>
            <span style={{ fontSize: big && items.length === 0 ? 30 : 22, color: GOLD }}>＋</span>
            <span style={{ fontSize: 12, color: MUTE }}>{hint}</span>
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={(e) => add(e.target.files)} />
    </div>
  );
}

/* ---- FilePick: seleção de imagem única para upload de versão ---- */
export function FilePick({ file, onFile, existingUrl }) {
  const inputRef = useRef(null);
  const preview = file ? URL.createObjectURL(file) : existingUrl;
  return (
    <div>
      <button type="button" className="uploadone" onClick={() => inputRef.current?.click()}
        style={preview ? { borderStyle: "solid", padding: 0, height: 160, overflow: "hidden", background: `center/cover no-repeat url(${preview})` } : undefined}>
        {!preview && <><span style={{ fontSize: 18, color: GOLD }}>＋</span> Escolher imagem</>}
      </button>
      {file && <button type="button" className="ghost sm" style={{ marginTop: 6 }} onClick={() => onFile(null)}>Remover</button>}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onFile(e.target.files?.[0] || null)} />
    </div>
  );
}
