(function () {
  const S = window.SOURCES, C = window.COMPETITORS;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const keys = Object.keys(S);
  const num = k => keys.indexOf(k) + 1;
  const cite = arr => (arr || []).map(k => `<a href="#s-${k}" title="${esc(S[k].t)}">[${num(k)}]</a>`).join(" ");

  // Sources list
  document.getElementById("srcList").innerHTML = keys.map(k =>
    `<li id="s-${k}">${esc(S[k].t)} — <a href="${esc(S[k].u)}" target="_blank" rel="noopener">${esc(S[k].u)}</a></li>`).join("");

  // Market bars
  const M = window.MARKET, max = Math.max(...M.map(m => m.fc));
  document.getElementById("marketBars").innerHTML = M.map(m => `
    <div style="margin:10px 0 16px"><b>${esc(m.name)}</b> <span class="src">${cite([m.src])}</span>
      <div class="barrow"><span>${m.baseYr}</span><div class="bar" style="width:${Math.max(0.6, m.base / max * 100)}%"></div><span>$${m.base >= 1000 ? (m.base / 1000).toFixed(2) + "B" : m.base + "M"}</span></div>
      <div class="barrow"><span>${m.fcYr} forecast</span><div class="bar" style="opacity:.55;width:${m.fc / max * 100}%"></div><span>$${m.fc >= 1000 ? (m.fc / 1000).toFixed(2) + "B" : m.fc + "M"}</span></div>
      <div class="meta">CAGR ${m.cagr} · ${esc(m.note)}</div></div>`).join("");

  // Competitor table
  let filt = "all", sortK = null, sortDir = 1;
  const tbody = document.querySelector("#compTable tbody");
  function renderComp() {
    const q = document.getElementById("q").value.toLowerCase();
    let rows = C.filter(c => filt === "all" || (filt === "thai" ? c.thai : c.seg === filt))
      .filter(c => !q || JSON.stringify(c).toLowerCase().includes(q));
    if (sortK) rows = rows.slice().sort((a, b) => {
      const x = a[sortK], y = b[sortK];
      if (typeof x === "number" || typeof y === "number") return ((x ?? 1e9) - (y ?? 1e9)) * sortDir;
      return String(x).localeCompare(String(y)) * sortDir;
    });
    tbody.innerHTML = rows.map(c => `<tr>
      <td><b>${esc(c.name)}</b><div class="meta">${esc(c.co)}</div></td>
      <td><span class="tag ${c.seg}">${c.seg === "med" ? "Health" : "Artist"}</span></td>
      <td>${esc(c.price)}<div class="meta">${esc(c.model)}</div></td>
      <td class="num">${c.priceUSDyr == null ? "—" : "$" + c.priceUSDyr}</td>
      <td>${esc(c.platforms)}</td>
      <td>${esc(c.langs)} ${c.thai ? '<span class="tag yes">TH</span>' : ""}</td>
      <td>${esc(c.rating)}</td><td>${esc(c.killer)}</td><td>${esc(c.weak)}</td><td class="src">${cite(c.src)}</td></tr>`).join("");
  }
  document.querySelectorAll("#segFilter button").forEach(b => b.onclick = () => {
    document.querySelectorAll("#segFilter button").forEach(x => x.classList.remove("on"));
    b.classList.add("on"); filt = b.dataset.f; renderComp();
  });
  document.getElementById("q").oninput = renderComp;
  document.querySelectorAll("#compTable th[data-k]").forEach(th => th.onclick = () => {
    const k = th.dataset.k; sortDir = sortK === k ? -sortDir : 1; sortK = k; renderComp();
  });
  renderComp();

  // Positioning map (SVG)
  const svg = document.getElementById("posMap"), W = 760, H = 400, L = 60, R = 20, T = 20, B = 50;
  const xs = v => L + (Math.log10(Math.max(v, 3)) - Math.log10(3)) / (Math.log10(400) - Math.log10(3)) * (W - L - R);
  const ys = d => H - B - (d - 1) / 4 * (H - T - B);
  let g = "";
  [3, 10, 30, 100, 300].forEach(v => { g += `<line x1="${xs(v)}" x2="${xs(v)}" y1="${T}" y2="${H - B}" stroke="currentColor" opacity=".12"/><text x="${xs(v)}" y="${H - B + 16}" text-anchor="middle">${v === 3 ? "Free–$3" : "$" + v}</text>`; });
  [1, 2, 3, 4, 5].forEach(d => { g += `<line x1="${L}" x2="${W - R}" y1="${ys(d)}" y2="${ys(d)}" stroke="currentColor" opacity=".12"/><text x="${L - 8}" y="${ys(d) + 4}" text-anchor="end">${d}</text>`; });
  g += `<text x="${(W + L) / 2}" y="${H - 10}" text-anchor="middle">≈ US$ per year (log)</text><text transform="translate(14 ${(H) / 2}) rotate(-90)" text-anchor="middle">Content depth (est.)</text>`;
  // target zone
  g += `<rect x="${xs(5)}" y="${ys(4.3)}" width="${xs(20) - xs(5)}" height="${ys(3.3) - ys(4.3)}" fill="none" stroke="#2e7d4f" stroke-width="2" stroke-dasharray="6 4"/><text x="${xs(5) + 4}" y="${ys(4.3) - 6}" style="font-weight:700;fill:#2e7d4f">Our target: $5–20, local language, offline</text>`;
  C.filter(c => c.priceUSDyr != null).forEach((c, i) => {
    const x = xs(c.priceUSDyr), y = ys(c.depth), col = c.seg === "med" ? "#2f6db4" : "#b4472f";
    g += `<circle cx="${x}" cy="${y}" r="6" fill="${col}" opacity=".85"><title>${esc(c.name)} — ${esc(c.price)}</title></circle><text x="${x > W - 120 ? x - 8 : x + 8}" text-anchor="${x > W - 120 ? "end" : "start"}" y="${y + (i % 2 ? 12 : -4)}">${esc(c.name.split(" (")[0].split(" –")[0])}</text>`;
  });
  g += `<circle cx="${W - 170}" cy="${T + 8}" r="5" fill="#2f6db4"/><text x="${W - 160}" y="${T + 12}">Healthcare</text><circle cx="${W - 90}" cy="${T + 8}" r="5" fill="#b4472f"/><text x="${W - 80}" y="${T + 12}">Artist</text>`;
  svg.innerHTML = g;

  // Country scoring
  const Wt = Object.assign({}, window.WEIGHTS), dims = ["size", "wtp", "gap", "home", "ipad"];
  const names = { size: "Size", wtp: "Willingness to pay", gap: "Competitive gap", home: "Home advantage", ipad: "iPad fit" };
  const wbox = document.getElementById("weights");
  wbox.innerHTML = '<b style="width:100%">Weights</b>' + dims.map(d => `<label style="font-size:13px">${names[d]} <input type="range" min="0" max="0.5" step="0.05" value="${Wt[d]}" data-d="${d}" style="width:110px;vertical-align:middle"> <output>${Wt[d]}</output></label>`).join("");
  wbox.querySelectorAll("input").forEach(i => i.oninput = () => { Wt[i.dataset.d] = +i.value; i.nextElementSibling.textContent = i.value; renderCty(); });
  function renderCty() {
    const sum = dims.reduce((a, d) => a + Wt[d], 0) || 1;
    const rows = window.COUNTRIES.map(c => Object.assign({ score: dims.reduce((a, d) => a + c[d] * Wt[d], 0) / sum }, c)).sort((a, b) => b.score - a.score);
    document.querySelector("#ctyTable tbody").innerHTML = rows.map((c, i) => `<tr>
      <td><b>${i + 1}. ${c.flag} ${esc(c.c)}</b></td>${dims.map(d => `<td class="num">${c[d]}</td>`).join("")}
      <td class="num"><b>${c.score.toFixed(2)}</b></td><td>${esc(c.lang)}</td><td>${esc(c.why)} <span class="src">${cite(c.ev)}</span></td></tr>`).join("");
  }
  renderCty();

  // Revenue calc
  const P = { th: [40000, 6, 7], in: [129026, 3, 3.5], sea: [300000, 3, 4], art: [500000, 2, 9.99] };
  const $ = id => document.getElementById(id);
  function calc() {
    const n = +$("n").value, c = +$("c").value, p = +$("p").value, f = +$("f").value;
    $("oN").textContent = n.toLocaleString(); $("oC").textContent = c; $("oP").textContent = p; $("oF").textContent = f;
    $("rev").textContent = "$" + Math.round(n * c / 100 * p * (1 - f / 100)).toLocaleString();
  }
  function preset() { const v = P[$("preset").value]; $("n").value = v[0]; $("c").value = v[1]; $("p").value = v[2]; $("f").value = 15; calc(); }
  ["n", "c", "p", "f"].forEach(id => $(id).oninput = calc);
  $("preset").onchange = preset; preset();
})();
