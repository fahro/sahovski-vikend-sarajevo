/* =====================================================
   ŠAHOVSKI VIKEND SARAJEVO · 2026
   ===================================================== */

const FORMATS = [
  { label: "3+2", rounds: 13, dur: "2h30",   durMin: 150 },
  { label: "5+3", rounds: 11, dur: "3h30",   durMin: 210 },
  { label: "7+3", rounds:  9, dur: "3h30",   durMin: 210 },
];

const START      = new Date(2026, 5, 20);  // subota 20. jun
const END        = new Date(2027, 0, 2);   // slot 15: jan 2 (override na 26 dec)
const START_HOUR = 12;
const START_MIN  = 30;
const LOCATION   = "SK Sarajevo";
const SERIES     = "Šahovski Vikend Sarajevo";

// progresivno otkrivanje redova
const CAL_INITIAL   = 6;
const CAL_STEP      = 4;
const PRIZE_INITIAL = 6;
const PRIZE_STEP    = 4;

// ─── HARDKODOVANI POMJERAJI ─────────────────────────────
// Da pomjeriš termin, dodaj/ažuriraj unos po nultobaziranom indexu (idx).
//   date:   ISO datum (YYYY-MM-DD)
//   reason: kratko obrazloženje (prikazuje se na kalendaru i u modalu)
const OVERRIDES = {
  0:  { date: "2026-06-21", reason: "Turnir u Srebreniku"  }, // 1. turnir:  sub 20 jun → ned 21 jun
  1:  { date: "2026-07-05", reason: "Turnir u Stocu"       }, // 2. turnir:  sub 4 jul → ned 5 jul
  5:  { date: "2026-08-22", reason: "A/B i Premijer liga"  }, // 6. turnir:  sub 29 aug → sub 22 aug
  14: { date: "2026-12-26", reason: ""                     }, // 15. turnir: sub 2 jan → sub 26 dec
};

const DAYS        = ["Ned","Pon","Uto","Sri","Čet","Pet","Sub"];
const DAYS_FULL   = ["Nedjelja","Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak","Subota"];
const MONTHS      = ["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"];
const MONTHS_FULL = ["januar","februar","mart","april","maj","juni","juli","august","septembar","oktobar","novembar","decembar"];

const ENTRY_FEE = 10;
let _upisnina  = ENTRY_FEE;

// Broj nagrada po broju igrača
function numPrizes(n) {
  if (n <= 11) return { reg: 2, spc: 2 };
  if (n <= 14) return { reg: 3, spc: 2 };
  if (n <= 18) return { reg: 4, spc: 2 };
  if (n <= 22) return { reg: 4, spc: 3 };
  if (n <= 26) return { reg: 5, spc: 3 };
  return { reg: 5, spc: 4 };
}

// Raspoređuje total KM na count nagrada (zaokruženo na 10).
// Polazi od jednakih dijela → manji raspon između nagrada.
// firstMin = minimalni iznos 1. nagrade (default 10); ostale ≥ 10.
function distribute(total, count, firstMin = 10) {
  if (!count || !total) return [];
  const extra0 = Math.max(firstMin - 10, 0);
  let n = Math.min(count, Math.floor((total - extra0) / 10));
  if (!n) return total >= firstMin ? [total] : [];
  const base = Math.max(Math.floor(total / n / 10) * 10, 10);
  const arr  = Array(n).fill(base);
  if (arr[0] < firstMin) arr[0] = firstMin;
  arr[0] += total - arr.reduce((a, b) => a + b, 0); // ostatak zaokruživanja → 1. nagrada
  // 1. nagrada mora biti bar malo veća od 2.
  if (arr.length > 1 && arr[0] <= arr[1]) {
    for (let i = arr.length - 1; i > 0; i--) {
      if (arr[i] >= 20) { arr[i] -= 10; arr[0] += 10; break; }
    }
  }
  return arr;
}

// Finale: fiksno 1× upisnina po turniru; ostatak 65% reg · 35% spc.
function computePrizesForN(n, upisnina) {
  const total   = n * upisnina;
  const finale  = upisnina;                               // fiksno 1× upisnina po turniru
  const rem     = total - finale;
  const regular = Math.floor(rem * 13 / 19 / 10) * 10;   // ≈ 65 % od ostatka
  const special = rem - regular;                          // ≈ 35 % od ostatka
  const { reg, spc } = numPrizes(n);
  return {
    n, total, regular, special, finale,
    regPrizes: distribute(regular, reg),
    spcPrizes: distribute(special, spc),
  };
}

/* =====================================================
   UTIL
   ===================================================== */
function pad(n) { return String(n).padStart(2, "0"); }

function el(tag, cls, txt) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (txt !== undefined && txt !== null) n.textContent = String(txt);
  return n;
}

function daysDiff(from, to) {
  const a = new Date(from); a.setHours(0,0,0,0);
  const b = new Date(to);   b.setHours(0,0,0,0);
  return Math.round((b - a) / 86400000);
}

function isoDate(d) {
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

function parseIso(s) {
  if (!s) return null;
  const [y, m, day] = s.split("-").map(Number);
  return new Date(y, m - 1, day);
}

function addMin(d, mins) {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() + mins);
  return x;
}

function startTime(d) {
  const x = new Date(d);
  x.setHours(START_HOUR, START_MIN, 0, 0);
  return x;
}

function endTime(d, fmt) {
  return addMin(startTime(d), fmt.durMin);
}

function fmtTime(d) {
  return pad(d.getHours()) + ":" + pad(d.getMinutes());
}

function timeRange(d, fmt) {
  return fmtTime(startTime(d)) + " do " + fmtTime(endTime(d, fmt));
}

function formatDateLong(d) {
  return `${DAYS_FULL[d.getDay()]} · ${pad(d.getDate())}. ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

function shortDate(d) {
  return `${DAYS[d.getDay()]} ${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;
}

function daysUntilText(d) {
  const dd = daysDiff(new Date(), d);
  if (dd === 0) return "danas";
  if (dd === 1) return "sutra";
  if (dd > 0) return `za ${dd} dana`;
  if (dd === -1) return "jučer";
  return `prije ${-dd} dana`;
}

/* =====================================================
   ITEMS
   ===================================================== */
function buildItems() {
  const items = [];
  const cur = new Date(START);
  let i = 0;
  while (cur <= END) {
    const original = new Date(cur);
    const overr = OVERRIDES[i];
    let d = original;
    let moved = false;
    let reason = "";
    if (overr && overr.date) {
      const parsed = parseIso(overr.date);
      if (parsed) {
        d = parsed;
        moved = isoDate(d) !== isoDate(original) && !!reason;
        reason = overr.reason || "";
      }
    }
    items.push({
      idx: i,
      d,
      originalD: original,
      moved,
      reason,
      fmt: FORMATS[i % FORMATS.length],
    });
    cur.setDate(cur.getDate() + 14);
    i++;
  }
  items.sort((a, b) => a.d - b.d);
  return items;
}

function findNextIdxInList(items) {
  const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 0; i < items.length; i++) {
    if (items[i].d >= today) return i;
  }
  return -1;
}

/* =====================================================
   UPCOMING SLIDER
   ===================================================== */
let _items = [];
let _nextPos = -1;
let _nextItem = null;

function buildUpcomingSlider(items, nextPos) {
  const track = document.getElementById("usTrack");
  const count = document.getElementById("usCount");
  if (!track) return;

  // upcoming = sve od nextPos do kraja
  const upcoming = nextPos === -1 ? [] : items.slice(nextPos);

  if (count) count.textContent = `${upcoming.length} · od ${items.length}`;

  const frag = document.createDocumentFragment();
  upcoming.forEach((it, i) => {
    const card = el("button", "us-card");
    card.type = "button";
    card.dataset.idx = String(it.idx);
    card.setAttribute("role", "listitem");
    if (i === 0) card.classList.add("is-next");
    if (it.moved) card.classList.add("is-moved");

    const top = el("div", "usc-top");
    top.appendChild(el("span", "usc-no", "#" + pad(it.idx + 1)));
    if (i === 0) top.appendChild(el("span", "usc-tag", "sljedeći"));
    else if (it.moved) {
      const tag = el("span", "usc-tag usc-tag-moved", "↗ pomjeren");
      top.appendChild(tag);
    }
    card.appendChild(top);

    const dayWrap = el("div", "usc-day");
    dayWrap.appendChild(el("span", "usc-dy", DAYS[it.d.getDay()]));
    dayWrap.appendChild(el("span", "usc-num", pad(it.d.getDate())));
    dayWrap.appendChild(el("span", "usc-mo", MONTHS[it.d.getMonth()]));
    card.appendChild(dayWrap);

    const meta = el("div", "usc-meta");

    const fmt = el("div", "usc-fmt");
    fmt.dataset.t = it.fmt.label;
    fmt.appendChild(document.createTextNode(it.fmt.label));
    fmt.appendChild(el("em", null, `${it.fmt.rounds}k`));
    meta.appendChild(fmt);

    meta.appendChild(el("div", "usc-tm", timeRange(it.d, it.fmt)));
    meta.appendChild(el("div", "usc-cd", daysUntilText(it.d)));

    card.appendChild(meta);

    card.addEventListener("click", () => openDetail(it.idx));
    frag.appendChild(card);
  });
  track.replaceChildren(frag);

  // arrows
  const prev = document.getElementById("usPrev");
  const next = document.getElementById("usNext");
  if (prev) prev.onclick = () => track.scrollBy({ left: -160, behavior: "smooth" });
  if (next) next.onclick = () => track.scrollBy({ left:  160, behavior: "smooth" });

  // update next item ref for backwards compat (modal status check etc.)
  _nextItem = upcoming[0] || null;
}

/* =====================================================
   CALENDAR
   ===================================================== */
function buildCalendar(items, nextPos) {
  const list = document.getElementById("calList");
  if (!list) return;

  const frag = document.createDocumentFragment();
  items.forEach((it, pos) => {
    const row = el("button", "cal-row");
    row.type = "button";
    row.dataset.idx = String(it.idx);
    row.setAttribute("role", "listitem");
    if (pos === nextPos) row.classList.add("next-row");
    if (it.moved) {
      row.classList.add("moved");
      if (it.reason) row.title = `pomjeren: ${it.reason} (original: ${shortDate(it.originalD)})`;
    }

    row.appendChild(el("span", "cr-n", pad(it.idx + 1)));

    const dt = el("div", "cr-dt");
    dt.appendChild(el("span", "cr-dy", DAYS[it.d.getDay()]));
    dt.appendChild(el("span", "cr-day", pad(it.d.getDate())));
    dt.appendChild(el("span", "cr-mo", MONTHS[it.d.getMonth()]));
    row.appendChild(dt);

    const tempo = el("span", "cr-tempo", it.fmt.label);
    tempo.dataset.t = it.fmt.label;
    row.appendChild(tempo);

    row.appendChild(el("span", "cr-rd", it.fmt.rounds));
    row.appendChild(el("span", "cr-dur", it.fmt.dur));

    if (it.moved) {
      const r = el("div", "cr-reason");
      r.appendChild(el("span", "crr-ico", "↗"));
      const tx = el("span", "crr-tx");
      tx.appendChild(document.createTextNode("pomjeren: "));
      const strong = document.createElement("strong");
      strong.textContent = it.reason || "vikend zauzet";
      tx.appendChild(strong);
      r.appendChild(tx);
      r.appendChild(el("em", "crr-orig", `bilo: ${shortDate(it.originalD)}`));
      row.appendChild(r);
    }

    row.addEventListener("click", () => openDetail(it.idx));
    frag.appendChild(row);
  });
  list.replaceChildren(frag);

  const meta = document.getElementById("calMeta");
  if (meta) meta.textContent = `${items.length} turnira · tap za detalje`;

  const aboutCount = document.getElementById("aboutCount");
  if (aboutCount) aboutCount.textContent = String(items.length);
}

/* =====================================================
   DISTRIBUTION
   ===================================================== */
function buildDistribution(items) {
  const total = items.length;
  const counts = {};
  FORMATS.forEach((f) => (counts[f.label] = 0));
  items.forEach((it) => counts[it.fmt.label]++);

  const map = { "3+2": "d3", "5+3": "d5", "7+3": "d7" };
  FORMATS.forEach((f) => {
    const n = document.getElementById(map[f.label]);
    if (n) n.textContent = `${counts[f.label]}×`;
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll(".dist-row").forEach((row) => {
        const t = row.dataset.t;
        const fill = row.querySelector(".df");
        if (!fill) return;
        const pct = total ? (counts[t] / total) * 100 : 0;
        fill.style.width = pct + "%";
      });
    });
  });
}

/* =====================================================
   PRIZES
   ===================================================== */
function buildPrizes(upisnina) {
  _upisnina = (upisnina != null && !isNaN(upisnina)) ? upisnina : ENTRY_FEE;
  const body = document.getElementById("prizeBody");
  if (!body) return;
  const frag = document.createDocumentFragment();

  for (let n = 10; n <= 25; n++) {
    const p  = computePrizesForN(n, _upisnina);
    const tr = el("tr");

    tr.appendChild(el("td", "p-n", n));

    const fTd = el("td", "p-f");
    fTd.appendChild(document.createTextNode(p.total));
    fTd.appendChild(el("em", null, "KM"));
    tr.appendChild(fTd);

    const r = el("td", "p-r");
    p.regPrizes.forEach((v, i) => {
      r.appendChild(el("span", i === 0 ? "first" : null, v));
      if (i < p.regPrizes.length - 1) r.appendChild(document.createTextNode(" · "));
    });
    tr.appendChild(r);

    const s = el("td", "p-s");
    p.spcPrizes.forEach((v, i) => {
      s.appendChild(el("span", i === 0 ? "first" : null, v));
      if (i < p.spcPrizes.length - 1) s.appendChild(document.createTextNode(" · "));
    });
    tr.appendChild(s);

    const finTd = el("td", "p-fin");
    finTd.appendChild(document.createTextNode("+" + p.finale));
    finTd.appendChild(el("em", null, "KM"));
    tr.appendChild(finTd);

    frag.appendChild(tr);
  }
  body.replaceChildren(frag);
}

/* =====================================================
   DETAIL MODAL
   ===================================================== */
function findItemByIdx(idx) {
  return _items.find((it) => it.idx === idx);
}

function openDetail(idx) {
  const it = findItemByIdx(idx);
  if (!it) return;
  const dlg = document.getElementById("detail");
  if (!dlg) return;

  renderDetail(it);
  if (typeof dlg.showModal === "function") dlg.showModal();
  else dlg.setAttribute("open", "");
}

function closeDetail() {
  const dlg = document.getElementById("detail");
  if (!dlg) return;
  if (typeof dlg.close === "function") dlg.close();
  else dlg.removeAttribute("open");
}

function renderDetail(it) {
  const status = document.getElementById("dStatus");
  status.classList.remove("is-moved", "is-next");
  if (_nextItem && _nextItem.idx === it.idx) {
    status.textContent = "sljedeći";
    status.classList.add("is-next");
  } else if (it.moved) {
    status.textContent = "pomjeren";
    status.classList.add("is-moved");
  } else {
    status.textContent = "default termin";
  }

  document.getElementById("dNo").textContent = `TURNIR · #${pad(it.idx + 1)}`;
  document.getElementById("dDy").textContent = DAYS_FULL[it.d.getDay()];
  document.getElementById("dDay").textContent = pad(it.d.getDate());
  document.getElementById("dMo").textContent = `${MONTHS_FULL[it.d.getMonth()]} 2026`;
  document.getElementById("dFmt").textContent = it.fmt.label;
  document.getElementById("dRounds").textContent = it.fmt.rounds;
  document.getElementById("dTime").textContent = timeRange(it.d, it.fmt);
  document.getElementById("dDur").textContent = "~ " + it.fmt.dur;
  document.getElementById("dDays").textContent = daysUntilText(it.d);

  const orig = document.getElementById("dOrig");
  if (it.moved) {
    orig.hidden = false;
    document.getElementById("dOrigDate").textContent = formatDateLong(it.originalD);
    document.getElementById("dReason").textContent = it.reason || "…";
  } else {
    orig.hidden = true;
  }
}

function setupDetail() {
  const dlg = document.getElementById("detail");
  if (!dlg) return;

  const closeBtn = document.getElementById("dClose");
  if (closeBtn) closeBtn.addEventListener("click", closeDetail);

  // backdrop click closes
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) closeDetail();
  });
}

/* =====================================================
   TOAST
   ===================================================== */
function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._h);
  showToast._h = setTimeout(() => t.classList.remove("show"), 1700);
}

/* =====================================================
   COPY
   ===================================================== */
function buildShareText() {
  const items = _items;
  const preview = items.slice(0, 6).map((it) => {
    const note = it.moved ? `  (pomjeren: ${it.reason || "nepoznat razlog"})` : "";
    return `${pad(it.idx + 1)}. ${DAYS[it.d.getDay()]} ${pad(it.d.getDate())}.${pad(it.d.getMonth() + 1)}  ${it.fmt.label} (${it.fmt.rounds} kola)${note}`;
  });
  const next = _nextItem;
  const nextLine = next
    ? `${DAYS[next.d.getDay()]} ${pad(next.d.getDate())}.${pad(next.d.getMonth() + 1)} · ${next.fmt.label} · ${next.fmt.rounds} kola · ${fmtTime(startTime(next.d))}`
    : "još nema termina";

  return [
    `${SERIES.toUpperCase()} · 2026`,
    `Blitz turniri svake druge subote u 12:30 · ${LOCATION}.`,
    "",
    `Sljedeći: ${nextLine}`,
    "",
    `Kalendar (prvih 6 od ${items.length}):`,
    ...preview,
    "...",
    "",
    `• Upisnina ${_upisnina} KM`,
    "• Tempo rotira: 3+2 (13k, ~2h30) → 5+3 (11k, ~3h30) → 7+3 (9k, ~3h30)",
    `• Fond: od ostatka ~65% reg · ~35% spc · ${_upisnina} KM/turniru → finale`,
    `• Min. nagrada ≥ ${_upisnina} KM`,
    "• Preferiramo subotu u 12:30h",
    "• Subota zauzeta → nedjelja istog vikenda",
    "• Cijeli vikend zauzet → sedmicu ranije ili kasnije (prema slobodnoj suboti)",
  ].join("\n");
}

function setupCopy() {
  const btn = document.getElementById("copyBtn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(buildShareText());
      showToast("kopirano ✓");
    } catch {
      showToast("greška");
    }
  });
}

/* =====================================================
   PDF
   ===================================================== */
function setupPDF() {
  const btn = document.getElementById("pdfBtn");
  if (!btn) return;
  btn.addEventListener("click", () => window.print());
}

/* =====================================================
   ICS
   ===================================================== */
function icsDt(d, addMins = 0) {
  const x = new Date(d);
  x.setHours(START_HOUR, START_MIN, 0, 0);
  x.setMinutes(x.getMinutes() + addMins);
  return x.getFullYear() + pad(x.getMonth() + 1) + pad(x.getDate()) + "T" +
         pad(x.getHours()) + pad(x.getMinutes()) + "00";
}
function icsEscape(s) {
  return String(s).replace(/[,;\\]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
}
function buildICS() {
  const items = _items;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${SERIES}//Turniri 2026//BS`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${SERIES} 2026`,
    "X-WR-TIMEZONE:Europe/Sarajevo",
  ];
  const stamp = icsDt(new Date());
  items.forEach((it) => {
    const summary = `ŠVS #${pad(it.idx + 1)} · ${it.fmt.label} (${it.fmt.rounds} kola)${it.moved ? " · POMJEREN" : ""}`;
    const descParts = [
      `${SERIES}`,
      `Format: ${it.fmt.label} · ${it.fmt.rounds} kola · ~${it.fmt.dur}`,
      `Početak: ${fmtTime(startTime(it.d))}`,
      `Lokacija: ${LOCATION}`,
      `Upisnina: ${_upisnina} KM`,
      `Fond: ~65% reg · ~35% spc · ${_upisnina} KM/turniru finale`,
    ];
    if (it.moved) {
      descParts.push(`POMJEREN sa: ${formatDateLong(it.originalD)}`);
      if (it.reason) descParts.push(`Razlog: ${it.reason}`);
    }
    const desc = descParts.join("\\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:svs-${it.idx + 1}-${it.d.getFullYear()}${pad(it.d.getMonth() + 1)}${pad(it.d.getDate())}@svs.local`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Europe/Sarajevo:${icsDt(it.d, 0)}`,
      `DTEND;TZID=Europe/Sarajevo:${icsDt(it.d, it.fmt.durMin)}`,
      `SUMMARY:${icsEscape(summary)}`,
      `DESCRIPTION:${desc}`,
      `LOCATION:${icsEscape(LOCATION)}`,
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:${icsEscape("Sutra: " + summary)}`,
      "END:VALARM",
      "END:VEVENT"
    );
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
function setupICS() {
  const btn = document.getElementById("icsBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const ics = buildICS();
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sahovski-vikend-sarajevo-2026.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(".ics preuzet ✓");
  });
}

/* =====================================================
   FINALE PRIZES
   ===================================================== */
const FINALE_PLAYERS     = 12;
const FINALE_TOURNAMENTS = 15;
const FINALE_SPC_COUNT   = 3;
const FINALE_REG_PRIZES  = [60, 40, 30, 30, 20]; // fiksne regularne nagrade finala

function buildFinalePrizes() {
  const el2 = document.getElementById("finalePrizeBody");
  if (!el2) return;
  const upisnina    = _upisnina;
  const fromPlayers = FINALE_PLAYERS * upisnina;           // 12 × 10 = 120
  const fromSeries  = FINALE_TOURNAMENTS * upisnina;       // 15 × 10 = 150
  const total       = fromPlayers + fromSeries;            // 270 KM
  const regPrizes   = FINALE_REG_PRIZES;
  const regular     = regPrizes.reduce((a, b) => a + b, 0);
  const special     = total - regular;
  const spcPrizes   = distribute(special, FINALE_SPC_COUNT);

  // update summary line
  const sumEl = document.getElementById("finaleFondTotal");
  if (sumEl) sumEl.textContent = total;
  const fromPEl = document.getElementById("finaleFondPlayers");
  if (fromPEl) fromPEl.textContent = fromPlayers;
  const fromSEl = document.getElementById("finaleFondSeries");
  if (fromSEl) fromSEl.textContent = fromSeries;

  const frag = document.createDocumentFragment();

  // regular prizes
  regPrizes.forEach((v, i) => {
    const tr = el("tr");
    tr.appendChild(el("td", "p-n fp-pos", i + 1));
    tr.appendChild(el("td", "p-f fp-cat", "reg."));
    const td = el("td", "p-r");
    td.appendChild(el("span", "first", v));
    td.appendChild(el("em", null, "KM"));
    tr.appendChild(td);
    frag.appendChild(tr);
  });

  // special prizes
  spcPrizes.forEach((v, i) => {
    const tr = el("tr");
    tr.appendChild(el("td", "p-n fp-pos fp-spc", i + 1));
    tr.appendChild(el("td", "p-f fp-cat fp-spc", "spc."));
    const td = el("td", "p-s");
    td.appendChild(el("span", i === 0 ? "first" : null, v));
    td.appendChild(el("em", null, "KM"));
    tr.appendChild(td);
    frag.appendChild(tr);
  });

  el2.replaceChildren(frag);
}

/* =====================================================
   PRIZE CALCULATOR
   ===================================================== */
function setupPrizeCalc() {
  const inp = document.getElementById("upisnina-input");
  if (!inp) return;
  inp.addEventListener("input", () => {
    const v = Math.max(1, parseInt(inp.value, 10) || ENTRY_FEE);
    buildPrizes(v);
    buildFinalePrizes();
    refreshPrizeVisibility();
  });
}

/* =====================================================
   PROGRESIVNO OTKRIVANJE REDOVA
   ===================================================== */
let _calVisible   = CAL_INITIAL;
let _prizeVisible = PRIZE_INITIAL;

function applyVisibility(rowSelector, btnId, visible, step) {
  const rows = document.querySelectorAll(rowSelector);
  rows.forEach((r, i) => r.classList.toggle("row-hidden", i >= visible));
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const remaining = rows.length - visible;
  if (remaining <= 0) { btn.hidden = true; return; }
  btn.hidden = false;
  const next = Math.min(step, remaining);
  btn.replaceChildren();
  btn.appendChild(document.createTextNode("prikaži još "));
  const s = document.createElement("strong");
  s.textContent = String(next);
  btn.appendChild(s);
  btn.appendChild(document.createTextNode(" (preostalo "));
  const r = document.createElement("strong");
  r.textContent = String(remaining);
  btn.appendChild(r);
  btn.appendChild(document.createTextNode(")"));
}

function refreshCalVisibility() {
  applyVisibility("#calList .cal-row", "calMore", _calVisible, CAL_STEP);
}
function refreshPrizeVisibility() {
  applyVisibility("#prizeBody tr", "prizeMore", _prizeVisible, PRIZE_STEP);
}

function setupShowMore() {
  const calBtn = document.getElementById("calMore");
  if (calBtn) {
    calBtn.addEventListener("click", () => {
      _calVisible += CAL_STEP;
      refreshCalVisibility();
    });
  }
  const prizeBtn = document.getElementById("prizeMore");
  if (prizeBtn) {
    prizeBtn.addEventListener("click", () => {
      _prizeVisible += PRIZE_STEP;
      refreshPrizeVisibility();
    });
  }
}

/* =====================================================
   INIT
   ===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  _items = buildItems();
  _nextPos = findNextIdxInList(_items);

  // ako je next-pos van inicijalne grupe, proširi da bude vidljiv + 2 reda konteksta
  if (_nextPos >= 0 && _nextPos + 1 > _calVisible) {
    _calVisible = Math.min(_items.length, _nextPos + 2);
  }

  buildUpcomingSlider(_items, _nextPos);
  buildCalendar(_items, _nextPos);
  buildDistribution(_items);
  buildPrizes();
  buildFinalePrizes();

  setupDetail();
  setupCopy();
  setupPDF();
  setupICS();
  setupPrizeCalc();
  setupShowMore();

  refreshCalVisibility();
  refreshPrizeVisibility();
});
