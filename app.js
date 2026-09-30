/* Dashboard futurista - datos de mock-data.json, sin dependencias */
const S = { data: [], q: "", mod: "", ttftMax: 900, sortK: "costDay", sortD: -1 };
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt$ = (n) => "$" + Number(n).toFixed(8);
const fmtN = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(0) + "K" : String(n);
const COLORS = ["#22d3ee", "#a78bfa", "#f472b6", "#a3e635", "#fbbf24", "#34d399", "#f87171", "#60a5fa", "#e879f9", "#facc15"];

async function init() {
  const r = await fetch("mock-data.json");
  const raw = await r.json();
  S.data = raw.map((m) => ({
    ...m,
    tokensDay: m.inputTokensDay + m.outputTokensDay,
    tokensWeek: m.inputTokensWeek + m.outputTokensWeek,
    costDay: m.inputTokensDay * m.inputPricePerToken + m.outputTokensDay * m.outputPricePerToken,
  }));
  $("q").addEventListener("input", (e) => { S.q = e.target.value.toLowerCase(); render(); });
  $("mod").addEventListener("change", (e) => { S.mod = e.target.value; render(); });
  $("ttft").addEventListener("input", (e) => { S.ttftMax = +e.target.value; $("ttftVal").textContent = S.ttftMax + "ms"; render(); });
  $("clear").addEventListener("click", () => { S.q = ""; S.mod = ""; S.ttftMax = 900; $("q").value = ""; $("mod").value = ""; $("ttft").value = 900; $("ttftVal").textContent = "900ms"; render(); });
  document.querySelectorAll("th[data-k]").forEach((th) => th.addEventListener("click", () => {
    const k = th.dataset.k;
    S.sortD = S.sortK === k ? -S.sortD : (k === "name" ? 1 : -1);
    S.sortK = k; render();
  }));
  $("close").addEventListener("click", () => $("modal").classList.add("hidden"));
  $("modal").addEventListener("click", (e) => { if (e.target.id === "modal") $("modal").classList.add("hidden"); });
  render();
}

function filtered() {
  return S.data
    .filter((m) => (!S.q || m.name.toLowerCase().includes(S.q)) && (!S.mod || m.inputModality === S.mod) && m.ttft_ms <= S.ttftMax)
    .sort((a, b) => (a[S.sortK] > b[S.sortK] ? 1 : -1) * S.sortD);
}

function render() {
  const f = filtered();
  // hero stats (globales)
  $("stModels").textContent = S.data.length;
  $("stCost").textContent = S.data.reduce((s, m) => s + m.costDay, 0).toFixed(2);
  $("stTokens").textContent = fmtN(S.data.reduce((s, m) => s + m.tokensDay, 0));
  $("stFast").textContent = Math.min(...S.data.map((m) => m.ttft_ms)) + "ms";
  $("count").textContent = `${f.length} de ${S.data.length} modelos`;
  renderTable(f); renderPrices(f); renderTtft(f); renderMod(f); renderUse(f);
}

function renderTable(f) {
  $("rows").innerHTML = f.map((m, i) => `<tr data-i="${S.data.indexOf(m)}">
    <td><span style="color:${COLORS[S.data.indexOf(m) % 10]}">●</span> ${esc(m.name)}</td>
    <td>${fmt$(m.inputPricePerToken)}</td><td>${fmt$(m.outputPricePerToken)}</td>
    <td>${m.ttft_ms}ms</td><td>$${m.costDay.toFixed(2)}</td><td>${fmtN(m.tokensDay)}</td></tr>`).join("");
  document.querySelectorAll("#rows tr").forEach((tr) => tr.addEventListener("click", () => openModal(S.data[+tr.dataset.i])));
}

function openModal(m) {
  const i = S.data.indexOf(m);
  $("mName").textContent = m.name;
  $("mMeta").textContent = `${m.inputModality} → ${m.outputModality} · TTFT ${m.ttft_ms}ms`;
  const max = Math.max(m.inputTokensDay, m.outputTokensDay);
  $("mBars").innerHTML = ["inputTokensDay", "outputTokensDay"].map((k, j) => `
    <div style="margin:.4rem 0"><small>${k === "inputTokensDay" ? "Input" : "Output"}: ${fmtN(m[k])}</small>
    <div style="background:rgba(255,255,255,.1);border-radius:8px"><div class="bar" style="width:${(m[k] / max * 100).toFixed(1)}%;height:12px;border-radius:8px;background:${COLORS[(i + j) % 10]}"></div></div></div>`).join("");
  $("mNums").innerHTML = `<div>💲 In/tok<br><b>${fmt$(m.inputPricePerToken)}</b></div>
    <div>💲 Out/tok<br><b>${fmt$(m.outputPricePerToken)}</b></div>
    <div>📦 Coste/día<br><b>$${m.costDay.toFixed(2)}</b></div>
    <div>📦 Tokens/sem<br><b>${fmtN(m.tokensWeek)}</b></div>`;
  $("modal").classList.remove("hidden");
}

function svgOpen(w, h) { return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="min-width:520px" role="img">`; }

function renderPrices(f) {
  const W = 640, H = 220, max = Math.max(...f.map((m) => m.outputPricePerToken), 1e-9);
  let s = svgOpen(W, H);
  const bw = Math.max(8, (W - 40) / Math.max(f.length, 1) / 2 - 4);
  f.forEach((m, i) => {
    const x = 40 + i * ((W - 40) / Math.max(f.length, 1));
    const h1 = (m.inputPricePerToken / max) * (H - 50), h2 = (m.outputPricePerToken / max) * (H - 50);
    s += `<rect class="bar" x="${x.toFixed(1)}" y="${(H - 30 - h1).toFixed(1)}" width="${bw}" height="${h1.toFixed(1)}" rx="3" fill="#22d3ee"><title>${esc(m.name)} in ${fmt$(m.inputPricePerToken)}</title></rect>`;
    s += `<rect class="bar" x="${(x + bw + 3).toFixed(1)}" y="${(H - 30 - h2).toFixed(1)}" width="${bw}" height="${h2.toFixed(1)}" rx="3" fill="#f472b6"><title>${esc(m.name)} out ${fmt$(m.outputPricePerToken)}</title></rect>`;
    s += `<text x="${(x + bw).toFixed(1)}" y="${H - 12}" font-size="9" fill="#8b98b8" text-anchor="middle" transform="rotate(-18 ${(x + bw).toFixed(1)} ${H - 12})">${esc(m.name.split(" ")[0])}</text>`;
  });
  $("chPrices").innerHTML = s + `</svg><p style="color:#8b98b8;font-size:.75rem">■ input ■ output (altura relativa al máx)</p>`;
}

function renderTtft(f) {
  const W = 420, H = 240, max = 900;
  const rows = [...f].sort((a, b) => a.ttft_ms - b.ttft_ms);
  let s = svgOpen(W, H);
  rows.forEach((m, i) => {
    const y = 10 + i * ((H - 20) / Math.max(rows.length, 1));
    const w = (m.ttft_ms / max) * (W - 150);
    const c = m.ttft_ms < 300 ? "#a3e635" : m.ttft_ms <= 400 ? "#22d3ee" : "#f472b6";
    s += `<text x="0" y="${(y + 11).toFixed(1)}" font-size="10" fill="#cbd5e1">${esc(m.name.slice(0, 14))}</text>`;
    s += `<rect class="bar" x="150" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="13" rx="6" fill="${c}"><title>${esc(m.name)} ${m.ttft_ms}ms</title></rect>`;
    s += `<text x="${(155 + w).toFixed(1)}" y="${(y + 11).toFixed(1)}" font-size="10" fill="#8b98b8">${m.ttft_ms}</text>`;
  });
  $("chTtft").innerHTML = s + "</svg>";
}

function renderMod(f) {
  const t = f.filter((m) => m.inputModality === "Text").length, ti = f.length - t;
  const total = Math.max(f.length, 1), R = 70, C = 2 * Math.PI * R, p = ti / total;
  $("chMod").innerHTML = `<svg viewBox="0 0 220 160" width="100%" role="img">
    <circle cx="110" cy="70" r="${R}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="22"/>
    <circle cx="110" cy="70" r="${R}" fill="none" stroke="#e879f9" stroke-width="22" stroke-dasharray="${(p * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 110 70)" stroke-linecap="round"/>
    <text x="110" y="75" text-anchor="middle" fill="#fff" font-size="18" font-weight="800">${f.length}</text>
    <text x="20" y="150" font-size="11" fill="#22d3ee">■ Text (${t})</text>
    <text x="120" y="150" font-size="11" fill="#e879f9">■ Text+Image (${ti})</text></svg>`;
}

function renderUse(f) {
  const W = 640, H = 40 + f.length * 26, max = Math.max(...f.map((m) => m.tokensDay), 1);
  let s = svgOpen(W, H);
  [...f].sort((a, b) => b.tokensDay - a.tokensDay).forEach((m, i) => {
    const y = 10 + i * 26, wi = (m.inputTokensDay / max) * (W - 220), wo = (m.outputTokensDay / max) * (W - 220);
    s += `<text x="0" y="${y + 12}" font-size="10" fill="#cbd5e1">${esc(m.name.slice(0, 15))}</text>`;
    s += `<rect class="bar" x="150" y="${y}" width="${wi.toFixed(1)}" height="14" fill="#22d3ee"><title>input ${fmtN(m.inputTokensDay)}</title></rect>`;
    s += `<rect class="bar" x="${(150 + wi).toFixed(1)}" y="${y}" width="${wo.toFixed(1)}" height="14" fill="#a78bfa"><title>output ${fmtN(m.outputTokensDay)}</title></rect>`;
    s += `<text x="${(155 + wi + wo).toFixed(1)}" y="${y + 12}" font-size="10" fill="#8b98b8">${fmtN(m.tokensDay)}</text>`;
  });
  $("chUse").innerHTML = s + `</svg><p style="color:#8b98b8;font-size:.75rem">■ input ■ output (tokens/día)</p>`;
}

init();
