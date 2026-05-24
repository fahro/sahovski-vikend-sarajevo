/* =====================================================
   ŠAHOVSKI VIKEND SARAJEVO · 2026
   ===================================================== */

const FORMATS = [
  { label: "3+2", rounds: 13, dur: "2h",    durMin: 120 },
  { label: "5+3", rounds: 11, dur: "2h30",  durMin: 150 },
  { label: "7+3", rounds:  9, dur: "2h45",  durMin: 165 },
];

// Prvi turnir: nedjelja, 7. jun 2026. u 10:00, SK Sarajevo
// Zadnji turnir: nedjelja, 20. decembar 2026.
const START      = new Date(2026, 5, 7);
const END        = new Date(2026, 11, 20);
const START_HOUR = 10;
const LOCATION   = "SK Sarajevo";
const SERIES     = "Šahovski Vikend Sarajevo";

const DAYS = ["Ned","Pon","Uto","Sri","Čet","Pet","Sub"];
const MONTHS = ["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"];
const MONTHS_FULL = ["januar","februar","mart","april","maj","juni","juli","august","septembar","oktobar","novembar","decembar"];

const PRIZES = [
  [10, 200, [60, 40, 30, 20],            [30, 20]],
  [11, 220, [70, 50, 30, 20],            [30, 20]],
  [12, 240, [80, 50, 30, 20],            [30, 20]],
  [13, 260, [80, 60, 40, 20],            [40, 20]],
  [14, 280, [90, 60, 40, 20],            [40, 30]],
  [15, 300, [80, 50, 40, 30, 20],        [40, 30]],
  [16, 320, [80, 60, 50, 30, 20],        [50, 30]],
  [17, 340, [90, 60, 50, 30, 20],        [50, 40]],
  [18, 360, [90, 70, 50, 30, 20],        [50, 40]],
  [19, 380, [100, 70, 60, 30, 20],       [50, 40]],
  [20, 400, [100, 80, 60, 40, 20],       [60, 40]],
  [21, 420, [100, 80, 60, 50, 30, 20],   [50, 40]],
  [22, 440, [110, 80, 60, 50, 30, 20],   [60, 40]],
  [23, 460, [110, 90, 70, 50, 30, 20],   [60, 40]],
  [24, 480, [120, 90, 70, 50, 40, 20],   [60, 40]],
  [25, 500, [120, 100, 80, 50, 30, 20],  [70, 50]],
];

function pad(n) { return String(n).padStart(2, "0"); }

function el(tag, cls, txt) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (txt !== undefined && txt !== null) n.textContent = String(txt);
  return n;
}

function daysDiff(from, to) {
  const ms = new Date(to).setHours(0,0,0,0) - new Date(from).setHours(0,0,0,0);
  return Math.round(ms / 86400000);
}

/* ----- DATA ----- */
function buildItems() {
  const items = [];
  const d = new Date(START);
  let i = 0;
  while (d <= END) {
    items.push({
      idx: i,
      d: new Date(d),
      fmt: FORMATS[i % FORMATS.length],
    });
    d.setDate(d.getDate() + 14);
    i++;
  }
  return items;
}

function findNextIdx(items) {
  const today = new Date();
  today.setHours(0,0,0,0);
  for (let i = 0; i < items.length; i++) {
    if (items[i].d >= today) return i;
  }
  return -1;
}

/* ----- NEXT CARD ----- */
function fillNextCard(items, nextIdx) {
  if (nextIdx === -1) return;
  const it = items[nextIdx];

  document.getElementById("ncDy").textContent = DAYS[it.d.getDay()].toUpperCase();
  document.getElementById("ncDay").textContent = pad(it.d.getDate());
  document.getElementById("ncMo").textContent = `${MONTHS_FULL[it.d.getMonth()]} 2026`;
  document.getElementById("ncFmt").textContent = it.fmt.label;
  document.getElementById("ncRounds").textContent = it.fmt.rounds;
  document.getElementById("ncDur").textContent = "~ " + it.fmt.dur;

  const cd = document.getElementById("ncCd");
  if (cd) {
    const dd = daysDiff(new Date(), new Date(it.d));
    cd.replaceChildren();
    if (dd === 0) cd.appendChild(el("strong", null, "danas"));
    else if (dd === 1) cd.appendChild(el("strong", null, "sutra"));
    else if (dd > 0) {
      cd.appendChild(el("strong", null, String(dd)));
      cd.appendChild(document.createTextNode(" dana"));
    } else cd.textContent = "—";
  }
}

/* ----- CALENDAR ----- */
function buildCalendar(items, nextIdx) {
  const list = document.getElementById("calList");
  if (!list) return;

  const frag = document.createDocumentFragment();
  items.forEach((it) => {
    const row = el("div", "cal-row");
    if (it.idx === nextIdx) row.classList.add("next-row");

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
    row.appendChild(el("span", "cr-dur", "~" + it.fmt.dur));

    frag.appendChild(row);
  });
  list.replaceChildren(frag);

  const meta = document.getElementById("calMeta");
  if (meta) meta.textContent = `${items.length} turnira · ned 10:00 · ${LOCATION}`;

  const infoCount = document.getElementById("infoCount");
  if (infoCount) infoCount.textContent = String(items.length);
}

/* ----- DISTRIBUTION ----- */
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

/* ----- PRIZES ----- */
function buildPrizes() {
  const body = document.getElementById("prizeBody");
  if (!body) return;
  const frag = document.createDocumentFragment();

  PRIZES.forEach(([n, fond, reg, spc]) => {
    const tr = el("tr");
    tr.appendChild(el("td", "p-n", n));
    tr.appendChild(el("td", "p-f", fond));

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

/* ----- TOAST ----- */
function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._h);
  showToast._h = setTimeout(() => t.classList.remove("show"), 1600);
}

/* ----- COPY ----- */
function buildShareText(items, nextIdx) {
  const preview = items.slice(0, 6).map((it) =>
    `${pad(it.idx + 1)}. ${DAYS[it.d.getDay()]} ${pad(it.d.getDate())}.${pad(it.d.getMonth() + 1)}  ${it.fmt.label} (${it.fmt.rounds} kola)`
  );
  const nextLine = nextIdx >= 0
    ? `${DAYS[items[nextIdx].d.getDay()]} ${pad(items[nextIdx].d.getDate())}.${pad(items[nextIdx].d.getMonth() + 1)} · ${items[nextIdx].fmt.label} · ${items[nextIdx].fmt.rounds} kola`
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
    "• Tempo rotira: 3+2 (13 kola) → 5+3 (11 kola) → 7+3 (9 kola)",
    "• Fond: 75% regularne · 25% specijalne (donja 50% liste po rejtingu)",
    "• Min. nagrada ≥ 20 KM",
    "• Nedjelja zauzeta → subota istog vikenda",
    "• I subota i nedjelja zauzete → sljedeći vikend",
  ].join("\n");
}

function setupCopy(items, nextIdx) {
  const btn = document.getElementById("copyBtn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const text = buildShareText(items, nextIdx);
    try {
      await navigator.clipboard.writeText(text);
      showToast("kopirano ✓");
    } catch {
      showToast("greška");
    }
  });
}

/* ----- PDF ----- */
function setupPDF() {
  const btn = document.getElementById("pdfBtn");
  if (!btn) return;
  btn.addEventListener("click", () => window.print());
}

/* ----- ICS ----- */
function icsDt(d, addMin = 0) {
  const x = new Date(d);
  x.setHours(START_HOUR, 0, 0, 0);
  x.setMinutes(x.getMinutes() + addMin);
  return (
    x.getFullYear() +
    pad(x.getMonth() + 1) +
    pad(x.getDate()) +
    "T" +
    pad(x.getHours()) +
    pad(x.getMinutes()) +
    "00"
  );
}
function icsEscape(s) {
  return String(s).replace(/[,;\\]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
}
function buildICS(items) {
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
    const summary = `ŠVS #${pad(it.idx + 1)} · ${it.fmt.label} (${it.fmt.rounds} kola)`;
    const desc =
      `${SERIES}\\n` +
      `Format: ${it.fmt.label} · ${it.fmt.rounds} kola\\n` +
      `Početak: 10:00\\n` +
      `Lokacija: ${LOCATION}\\n` +
      `Upisnina: 20 KM\\n` +
      `Fond: 75% regularne · 25% specijalne (donja 50% liste)`;
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
function setupICS(items) {
  const btn = document.getElementById("icsBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const ics = buildICS(items);
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

/* ----- INIT ----- */
document.addEventListener("DOMContentLoaded", () => {
  const items = buildItems();
  const nextIdx = findNextIdx(items);

  fillNextCard(items, nextIdx);
  buildCalendar(items, nextIdx);
  buildDistribution(items);
  buildPrizes();

  setupCopy(items, nextIdx);
  setupPDF();
  setupICS(items);
});
