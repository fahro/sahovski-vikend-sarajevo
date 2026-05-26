/* =====================================================
   ŠAHOVSKI VIKEND SARAJEVO · 2026
   ===================================================== */

const FORMATS = [
  { label: "3+2", rounds: 13, dur: "2h30",   durMin: 150 },
  { label: "5+3", rounds: 11, dur: "3h30",   durMin: 210 },
  { label: "7+3", rounds:  9, dur: "3h30",   durMin: 210 },
];

const START      = new Date(2026, 5, 7);   // nedjelja 7. jun
const END        = new Date(2026, 11, 20); // nedjelja 20. dec
const START_HOUR = 10;
const LOCATION   = "SK Sarajevo";
const SERIES     = "Šahovski Vikend Sarajevo";

// ─── HARDKODOVANI POMJERAJI ─────────────────────────────
// Da pomjeriš termin, dodaj/ažuriraj unos po nultobaziranom indexu (idx).
//   date   — ISO datum (YYYY-MM-DD)
//   reason — kratko obrazloženje (prikazuje se na kalendaru i u modalu)
const OVERRIDES = {
  6: { date: "2026-08-23", reason: "A/B i Premijer liga" }, // 7. turnir: 30 → 23 aug
};

const DAYS        = ["Ned","Pon","Uto","Sri","Čet","Pet","Sub"];
const DAYS_FULL   = ["Nedjelja","Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak","Subota"];
const MONTHS      = ["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"];
const MONTHS_FULL = ["januar","februar","mart","april","maj","juni","juli","august","septembar","oktobar","novembar","decembar"];

const PRIZES = [
  [10, 200, [60, 40, 30, 20],            [30, 20]],
  [11, 220, [70, 50, 30, 20],            [30, 20]],
  [12, 240, [80, 50, 30, 20],            [40, 20]],
  [13, 260, [80, 60, 40, 20],            [40, 20]],
  [14, 280, [90, 60, 40, 20],            [40, 30]],
  [15, 300, [80, 60, 40, 30, 20],        [40, 30]],
  [16, 320, [80, 60, 50, 30, 20],        [50, 30]],
  [17, 340, [90, 70, 50, 30, 20],        [50, 30]],
  [18, 360, [90, 70, 60, 30, 20],        [50, 40]],
  [19, 380, [100, 70, 60, 40, 20],       [50, 40]],
  [20, 400, [90, 70, 50, 40, 30, 20],    [50, 30, 20]],
  [21, 420, [100, 80, 50, 40, 30, 20],   [50, 30, 20]],
  [22, 440, [110, 80, 50, 40, 30, 20],   [50, 40, 20]],
  [23, 460, [110, 90, 60, 40, 30, 20],   [50, 40, 20]],
  [24, 480, [120, 90, 60, 40, 30, 20],   [50, 40, 30]],
  [25, 500, [120, 100, 70, 40, 30, 20],  [50, 40, 30]],
];

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
  x.setHours(START_HOUR, 0, 0, 0);
  return x;
}

function endTime(d, fmt) {
  return addMin(startTime(d), fmt.durMin);
}

function fmtTime(d) {
  return pad(d.getHours()) + ":" + pad(d.getMinutes());
}

function timeRange(d, fmt) {
  return fmtTime(startTime(d)) + " — " + fmtTime(endTime(d, fmt));
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
        moved = isoDate(d) !== isoDate(original);
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
      tx.appendChild(document.createTextNode("pomjeren — "));
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

  const infoCount = document.getElementById("infoCount");
  if (infoCount) infoCount.textContent = String(items.length);
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
function buildPrizes() {
  const body = document.getElementById("prizeBody");
  if (!body) return;
  const frag = document.createDocumentFragment();

  PRIZES.forEach(([n, fond, reg, spc]) => {
    const tr = el("tr");

    tr.appendChild(el("td", "p-n", n));

    const fTd = el("td", "p-f", fond);
    fTd.appendChild(el("em", null, "KM"));
    tr.appendChild(fTd);

    const r = el("td", "p-r");
    reg.forEach((v, i) => {
      r.appendChild(el("span", i === 0 ? "first" : null, v));
      if (i < reg.length - 1) r.appendChild(document.createTextNode(" · "));
    });
    tr.appendChild(r);

    const s = el("td", "p-s");
    spc.forEach((v, i) => {
      s.appendChild(el("span", i === 0 ? "first" : null, v));
      if (i < spc.length - 1) s.appendChild(document.createTextNode(" · "));
    });
    tr.appendChild(s);

    frag.appendChild(tr);
  });
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
    document.getElementById("dReason").textContent = it.reason || "—";
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
    const note = it.moved ? `  (pomjeren: ${it.reason || "—"})` : "";
    return `${pad(it.idx + 1)}. ${DAYS[it.d.getDay()]} ${pad(it.d.getDate())}.${pad(it.d.getMonth() + 1)}  ${it.fmt.label} (${it.fmt.rounds} kola)${note}`;
  });
  const next = _nextItem;
  const nextLine = next
    ? `${DAYS[next.d.getDay()]} ${pad(next.d.getDate())}.${pad(next.d.getMonth() + 1)} · ${next.fmt.label} · ${next.fmt.rounds} kola · ${fmtTime(startTime(next.d))}`
    : "—";

  return [
    `${SERIES.toUpperCase()} · 2026`,
    `Blitz turniri svake druge nedjelje · 10:00 · ${LOCATION}.`,
    "",
    `Sljedeći: ${nextLine}`,
    "",
    `Kalendar (prvih 6 od ${items.length}):`,
    ...preview,
    "...",
    "",
    "• Upisnina 20 KM",
    "• Tempo rotira: 3+2 (13k, ~2h30) → 5+3 (11k, ~3h30) → 7+3 (9k, ~3h30)",
    "• Fond: 75% regularne · 25% specijalne (donja 50% liste po rejtingu)",
    "• Min. nagrada ≥ 20 KM",
    "• Nedjelja zauzeta → subota istog vikenda",
    "• Cijeli vikend zauzet → sedmicu ranije ili kasnije (prema slobodnoj nedjelji)",
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
  x.setHours(START_HOUR, 0, 0, 0);
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
      `Upisnina: 20 KM`,
      `Fond: 75% regularne · 25% specijalne`,
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
   INIT
   ===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  _items = buildItems();
  _nextPos = findNextIdxInList(_items);

  buildUpcomingSlider(_items, _nextPos);
  buildCalendar(_items, _nextPos);
  buildDistribution(_items);
  buildPrizes();

  setupDetail();
  setupCopy();
  setupPDF();
  setupICS();
});
