import { GOLD, GOLD_SOFT, INK, PAPER, LINE, MUTE, SERIF } from './constants.js';

export const S = {
  root: { minHeight: "100vh", background: "#ffffff", color: INK, fontFamily: "'Figtree', system-ui, -apple-system, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", borderBottom: `1px solid ${LINE}`, position: "sticky", top: 0, background: "rgba(255,255,255,.85)", backdropFilter: "blur(12px)", zIndex: 10 },
  brand: { display: "flex", alignItems: "baseline", gap: 10 },
  mark: { color: GOLD, fontSize: 18 },
  wordmark: { fontFamily: SERIF, fontSize: 22, fontWeight: 700, letterSpacing: "-.01em" },
  tagline: { fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: MUTE, fontWeight: 500 },
  headRight: { display: "flex", alignItems: "center", gap: 14 },
  userPill: { fontSize: 13, color: MUTE },
  main: { maxWidth: 880, margin: "0 auto", padding: "48px 28px 80px" },
  footer: { textAlign: "center", padding: "30px", fontSize: 12, color: MUTE, borderTop: `1px solid ${LINE}` },

  eyebrow: { fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: GOLD, marginBottom: 12, fontWeight: 600 },
  h1: { fontFamily: SERIF, fontSize: 44, fontWeight: 700, lineHeight: 1.05, margin: 0, letterSpacing: "-.025em", color: INK },
  h2: { fontFamily: SERIF, fontSize: 24, fontWeight: 600, margin: "0 0 16px", letterSpacing: "-.015em" },
  h3: { fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: MUTE, margin: "22px 0 10px", fontWeight: 600 },
  lede: { color: MUTE, fontSize: 16, lineHeight: 1.6, margin: "14px 0 28px" },

  adminRow: { marginTop: 18, paddingTop: 16, borderTop: `1px solid ${LINE}`, textAlign: "center" },
  dashHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 30, flexWrap: "wrap", gap: 16 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 22 },
  empty: { textAlign: "center", padding: "64px 20px", border: `1px dashed ${GOLD_SOFT}`, borderRadius: 10, background: "#fff" },

  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  orderNo: { fontFamily: SERIF, fontSize: 18, color: MUTE },
  cardPara: { fontSize: 16, margin: "2px 0 4px" },
  cardMeta: { fontSize: 13, color: "#b0a68f", marginBottom: 12 },

  card: { background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: "28px 30px", marginBottom: 22 },
  fieldHint: { color: MUTE, marginBottom: 14, fontSize: 14 },
  microHint: { fontSize: 13, color: "#b0a68f", marginTop: 8 },
  wizardNav: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 20, borderTop: `1px solid ${LINE}` },

  styleGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px,1fr))", gap: 14 },
  artGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 12 },
  artImg: { width: "100%", height: 110, objectFit: "cover", display: "block", borderRadius: "6px 6px 0 0" },
  modalBg: { position: "fixed", inset: 0, background: "rgba(31,27,22,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100 },
  modal: { background: "#fff", borderRadius: 12, padding: "24px 26px", maxWidth: 640, width: "100%", maxHeight: "85vh", overflowY: "auto" },
  modalHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  galeriaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px,1fr))", gap: 10 },
  gcheck: { position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", background: GOLD, color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13 },
  swatch: { display: "flex", height: 64, borderRadius: 6, overflow: "hidden", marginBottom: 12 },
  tonDots: { display: "flex", gap: 3, marginRight: 4 },
  relRow: { display: "flex", flexDirection: "column", gap: 10 },
  subjectCard: { border: `1px solid ${LINE}`, borderRadius: 8, padding: "16px 18px", marginBottom: 14, background: PAPER },
  subjectHead: { display: "flex", alignItems: "center", gap: 12 },
  subjectNum: { width: 26, height: 26, borderRadius: "50%", background: GOLD, color: "#fff", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, flex: "0 0 auto" },
  subjLabel: { fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: GOLD, margin: "0 0 7px", fontWeight: 600 },
  orientRow: { display: "flex", gap: 12, flexWrap: "wrap" },
  orientIconBox: { height: 44, display: "flex", alignItems: "center", justifyContent: "center" },
  orientShape: { display: "block", width: 30, background: GOLD_SOFT, borderRadius: 2 },
  orientName: { fontSize: 13, lineHeight: 1 },
  roomGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  room: { position: "relative", aspectRatio: "1 / 1", borderRadius: 8, overflow: "hidden", border: `1px solid ${LINE}` },
  roomFloor: { position: "absolute", left: 0, right: 0, bottom: 0, height: "26%" },
  roomSofa: { position: "absolute", left: "18%", right: "18%", bottom: "10%", height: "20%", backgroundColor: "#a08a6c", borderRadius: "10px 10px 4px 4px" },
  roomBed: { position: "absolute", left: "12%", right: "12%", bottom: "6%", height: "24%", background: "#c8b89a", borderRadius: "8px 8px 0 0" },
  roomLabel: { textAlign: "center", fontSize: 12, color: MUTE, marginTop: 7 },

  frameWrap: { position: "relative", aspectRatio: "100/64", overflow: "hidden", background: "#fff" },
  frameArt: { position: "absolute", inset: 9 },
  frameSvg: { position: "absolute", inset: 0, width: "100%", height: "100%" },

  detailHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", margin: "10px 0 24px", flexWrap: "wrap", gap: 14 },
  statusHint: { color: MUTE, fontStyle: "italic", margin: "14px 0 24px", fontFamily: SERIF, fontSize: 19 },

  versionGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 },
  bigArt: { borderRadius: 4, height: 230, position: "relative", border: `1px solid ${LINE}` },
  check: { position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: "50%", background: GOLD, color: "#fff", display: "grid", placeItems: "center", fontWeight: 700 },

  divider: { height: 1, background: LINE, margin: "20px 0" },
  quote: { borderLeft: `3px solid ${GOLD}`, paddingLeft: 16, margin: "12px 0 0", color: "#6a6155", fontStyle: "italic" },
  msg: { padding: "12px 14px", borderRadius: 6, background: "#faf6ec", marginBottom: 10, fontSize: 14, lineHeight: 1.5 },
  msgHead: { display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: GOLD },

  detailRow: { display: "flex", gap: 16, padding: "8px 0", borderBottom: `1px solid ${PAPER}` },
  detailK: { flex: "0 0 130px", fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "#b0a68f", paddingTop: 2 },
  detailV: { flex: 1, fontSize: 15, lineHeight: 1.55 },
  thumb: { width: 64, height: 64, borderRadius: 4, border: `1px solid ${LINE}`, position: "relative" },
  refBadge: { position: "absolute", bottom: 4, right: 4, fontSize: 9, background: "rgba(31,27,22,.6)", color: "#fff", padding: "1px 5px", borderRadius: 3, letterSpacing: ".05em" },

  table: { width: "100%", borderCollapse: "collapse", marginTop: 20, fontSize: 14 },
  adminCols: { display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 22, alignItems: "start" },
};

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Figtree:wght@400;500;600;700&display=swap');
* { box-sizing: border-box; }
body { margin: 0; }
em { font-style: italic; color: ${GOLD}; }
.reveal { animation: rise .5s ease both; }
@keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }

.lbl { display: block; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #b0a68f; margin: 0 0 7px; }
.inp { width: 100%; padding: 12px 14px; border: 1px solid ${LINE}; border-radius: 10px; font-size: 15px; font-family: inherit; background: #fff; color: ${INK}; transition: border-color .15s, box-shadow .15s; }
.inp:focus { outline: none; border-color: ${INK}; box-shadow: 0 0 0 3px rgba(13,13,13,.08); }
.ta { resize: vertical; min-height: 88px; line-height: 1.5; }
.ta.tall { min-height: 120px; }

button { cursor: pointer; font-family: inherit; }
.primary { background: ${INK}; color: #fff; border: none; padding: 12px 22px; border-radius: 10px; font-size: 14px; font-weight: 600; letter-spacing: 0; transition: transform .15s, background .2s, box-shadow .2s; }
.primary:hover { background: #000; box-shadow: 0 8px 22px rgba(0,0,0,.18); }
.primary:disabled { opacity: .35; cursor: not-allowed; box-shadow: none; }
.primary.block { width: 100%; }
.primary.lg { padding: 14px 28px; font-size: 15px; }
.ghost { background: #fff; color: ${INK}; border: 1px solid ${LINE}; padding: 11px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; transition: border-color .15s, background .15s; }
.ghost:hover { border-color: ${INK}; background: #fafafa; }
.ghost.block { width: 100%; }
.ghost:disabled { opacity: .4; cursor: not-allowed; }
.ghost.sm { padding: 6px 0; border: none; color: ${MUTE}; margin-bottom: 14px; }
.ghost.sm:hover { color: ${GOLD}; }
.ghost.sm2 { padding: 7px 14px; font-size: 13px; }
.block { margin-top: 8px; }
.google { width: 100%; margin-top: 12px; background: #fff; border: 1px solid ${GOLD_SOFT}; padding: 12px; border-radius: 6px; font-size: 14px; display: flex; gap: 10px; align-items: center; justify-content: center; color: ${INK}; }
.google:hover { border-color: ${GOLD}; }
.google b { color: ${GOLD}; font-size: 16px; }
.primary.block, .ghost.block { margin-top: 8px; }
.link { color: ${GOLD}; font-size: 13px; font-weight: 600; }

.tabs { display: flex; gap: 6px; margin: 0 0 20px; background: ${PAPER}; padding: 4px; border-radius: 8px; border: 1px solid ${LINE}; }
.tab { flex: 1; padding: 9px; border: none; background: transparent; border-radius: 5px; font-size: 13px; color: ${MUTE}; font-weight: 500; }
.tab.on { background: #fff; color: ${GOLD}; box-shadow: 0 1px 3px rgba(0,0,0,.06); }

.ordercard { text-align: left; background: #fff; border: 1px solid ${LINE}; border-radius: 14px; overflow: hidden; padding: 0; transition: transform .2s, box-shadow .2s, border-color .2s; display: block; }
.ordercard:hover { transform: translateY(-3px); box-shadow: 0 18px 40px rgba(0,0,0,.08); border-color: ${INK}; }

.tag { display: inline-block; font-size: 11px; letter-spacing: .03em; padding: 4px 11px; border-radius: 20px; font-weight: 600; white-space: nowrap; }
.tag.recebido { background: #f0ece2; color: #7a746b; }
.tag.producao { background: #fdeccb; color: #9a6b12; }
.tag.aprovacao { background: #f6ecd8; color: ${GOLD}; }
.tag.ajustes { background: #f3e6e0; color: #8a6a55; }
.tag.finalizado { background: #e7efe6; color: #5d7a5a; }

.chip { padding: 9px 16px; border: 1px solid ${LINE}; background: #fff; border-radius: 22px; font-size: 13px; color: ${INK}; transition: all .15s; font-weight: 500; }
.chip:hover { border-color: ${INK}; }
.chip.on { background: ${INK}; color: #fff; border-color: ${INK}; }

.tonchip { display: flex; align-items: center; gap: 4px; padding: 8px 14px; border: 1px solid ${GOLD_SOFT}; background: #fff; border-radius: 22px; font-size: 13px; color: #5c564c; font-weight: 500; }
.tonchip:hover { border-color: ${GOLD}; }
.tonchip.on { background: #faf4e6; border-color: ${GOLD}; color: ${GOLD}; }
.tonchip i { width: 11px; height: 11px; border-radius: 50%; display: inline-block; }

.orient { display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 8px; width: 96px; height: 96px; padding: 12px; border: 1px solid ${GOLD_SOFT}; background: #fff; border-radius: 8px; color: #5c564c; font-weight: 500; }
.orient:hover { border-color: ${GOLD}; }
.orient.on { border-color: ${GOLD}; box-shadow: 0 0 0 2px rgba(154,123,63,.28); }
.orient.on span span { background: ${GOLD}; }
.sizechip { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; padding: 10px 16px; border: 1px solid ${GOLD_SOFT}; background: #fff; border-radius: 8px; color: #5c564c; min-width: 96px; }
.sizechip:hover { border-color: ${GOLD}; }
.sizechip.on { border-color: ${GOLD}; box-shadow: 0 0 0 2px rgba(154,123,63,.28); }
.sizechip strong { font-size: 14px; }
.sizechip span { font-size: 12px; color: ${MUTE}; }

.stylecard { text-align: left; display: flex; flex-direction: column; gap: 4px; background: #fff; border: 1px solid ${GOLD_SOFT}; border-radius: 8px; padding: 12px; transition: all .18s; }
.stylecard:hover { border-color: ${GOLD}; transform: translateY(-2px); }
.stylecard.on { border-color: ${GOLD}; box-shadow: 0 0 0 2px rgba(154,123,63,.3); }

.artcard { text-align: left; display: flex; flex-direction: column; background: #fff; border: 1px solid ${GOLD_SOFT}; border-radius: 8px; overflow: hidden; transition: all .18s; padding: 0; }
.artcard:hover { border-color: ${GOLD}; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(31,27,22,.08); }
.artcard.on { border-color: ${GOLD}; box-shadow: 0 0 0 2px rgba(154,123,63,.32); }
.artcard strong { font-family: ${SERIF}; font-size: 16px; font-weight: 600; padding: 10px 12px 0; }
.artcard span { font-size: 12px; color: ${MUTE}; line-height: 1.35; padding: 2px 12px 12px; }
.artcard.sm strong { font-size: 14px; padding: 8px 10px 8px; }
.artcard.sm span { display: none; }

.painttype { text-align: left; display: flex; flex-direction: column; background: #fff; border: 1px solid ${GOLD_SOFT}; border-radius: 8px; overflow: hidden; transition: all .18s; padding: 0; }
.painttype:hover { border-color: ${GOLD}; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(31,27,22,.08); }
.painttype.on { border-color: ${GOLD}; box-shadow: 0 0 0 2px rgba(154,123,63,.32); }
.painttype .ptbody { position: relative; padding: 10px 12px 12px; }
.painttype .ptbody strong { display: block; font-family: ${SERIF}; font-size: 16px; font-weight: 600; }
.painttype .ptbody span { display: block; font-size: 12px; color: ${MUTE}; line-height: 1.3; margin-top: 1px; }
.painttype .ptbrush { height: 0; margin-top: 0; border-radius: 3px; background-size: cover; background-position: center; opacity: 0; transition: height .35s ease, margin-top .35s ease, opacity .3s ease; }
.painttype:hover .ptbrush { height: 14px; margin-top: 8px; opacity: 1; }

.gitem { position: relative; border: 2px solid ${LINE}; border-radius: 8px; overflow: hidden; padding: 0; cursor: pointer; transition: border-color .15s; background: #fff; }
.gitem:hover { border-color: ${GOLD_SOFT}; }
.gitem.on { border-color: ${GOLD}; box-shadow: 0 0 0 2px rgba(154,123,63,.3); }
.stylecard strong { font-family: ${SERIF}; font-size: 19px; font-weight: 600; }
.stylecard span { font-size: 12.5px; color: ${MUTE}; line-height: 1.4; }

.version { text-align: left; display: flex; flex-direction: column; gap: 8px; background: #fff; border: 1px solid ${GOLD_SOFT}; border-radius: 8px; padding: 12px; transition: all .18s; }
.version:hover { border-color: ${GOLD}; }
.version.on { border-color: ${GOLD}; box-shadow: 0 0 0 2px rgba(154,123,63,.32); }
.version strong { font-family: ${SERIF}; font-size: 19px; }

.dropzone { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; width: 104px; height: 104px; border: 1.5px dashed ${GOLD_SOFT}; border-radius: 8px; background: ${PAPER}; transition: border-color .2s, background .2s; }
.dropzone.big { width: 100%; height: 150px; }
.dropzone:hover { border-color: ${GOLD}; background: #fff; }
.rm { position: absolute; top: -7px; right: -7px; width: 20px; height: 20px; border-radius: 50%; background: ${INK}; color: #fff; border: none; font-size: 13px; line-height: 1; display: grid; place-items: center; }
.uploadone { width: 100%; margin-top: 8px; display: flex; align-items: center; gap: 8px; justify-content: center; padding: 14px; border: 1.5px dashed ${GOLD_SOFT}; border-radius: 8px; background: ${PAPER}; color: ${MUTE}; font-size: 13px; transition: border-color .2s; }
.uploadone:hover { border-color: ${GOLD}; }

.rail { display: flex; align-items: center; flex-wrap: wrap; }
.railstep { display: flex; align-items: center; }
.dot { width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid ${GOLD_SOFT}; color: #b0a68f; display: grid; place-items: center; font-size: 13px; flex: 0 0 auto; font-weight: 600; }
.dot.on { background: ${GOLD}; border-color: ${GOLD}; color: #fff; }
.railLbl { font-size: 12px; color: #b0a68f; margin: 0 14px 0 8px; white-space: nowrap; }
.railLbl.on { color: ${INK}; font-weight: 500; }
.bar { width: 26px; height: 1.5px; background: ${GOLD_SOFT}; margin-right: 14px; }
.bar.on { background: ${GOLD}; }

.filters { display: flex; gap: 8px; flex-wrap: wrap; margin: 22px 0 4px; }
.filt { padding: 8px 14px; border: 1px solid ${GOLD_SOFT}; background: #fff; border-radius: 22px; font-size: 13px; color: #5c564c; display: flex; gap: 7px; align-items: center; font-weight: 500; }
.filt:hover { border-color: ${GOLD}; }
.filt.on { background: ${INK}; color: #fff; border-color: ${INK}; }
.filt i { font-style: normal; opacity: .65; font-size: 11px; }

table th { text-align: left; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: #b0a68f; font-weight: 600; padding: 10px 12px; border-bottom: 1px solid ${LINE}; }
.trow td { padding: 14px 12px; border-bottom: 1px solid ${PAPER}; }
.trow:hover { background: ${PAPER}; }

@media (max-width: 880px) { [style*="grid-template-columns: 1.05fr 1fr"] { grid-template-columns: 1fr !important; } }
@media (max-width: 760px) { h1 { font-size: 34px !important; } .railLbl { display: none; } .bar { width: 16px; } }
@media (max-width: 640px) {
  table, thead, tbody, th, td, tr { display: block; }
  thead { display: none; }
  .trow { border: 1px solid ${LINE}; border-radius: 8px; margin-bottom: 12px; padding: 6px 10px; }
  .trow td { border: none; padding: 6px 4px; display: flex; justify-content: space-between; }
}
`;
