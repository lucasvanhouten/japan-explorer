#!/usr/bin/env node
/* route.js — the Japan Trip Kit's route engine, a dependency-free Node CLI.
 * Ships at kit/builder/route.js and runs from that folder: it loads ./route-builder-logic.js and
 * ./route-data.js headlessly (the same vm trick as the project's load-builder.js, copied inline) and
 * reads ./places.json for each place's night range (emitted by the kit build; see README.md), or
 * ../stages/2-orientation.md when no places.json ships. Every hour printed comes from the builder's
 * LEGS table through legBetween(); this file never types a travel time, and a pair no table joins
 * prints `to confirm` with no number at all.
 *
 *   node route.js spines [--nights N] [--draws food,onsen] [--repeat] [--in X --out Y]   the menu: the nine spines
 *   node route.js spine s1 [--set inn=nikko …] [--nights kyoto=5 …] [--total 12] [--in X --out Y] [--reverse] [--before "<stops>"]   one spine, walked
 *   node route.js compare "<stops A>" "<stops B>" [--in X --out Y]     two or three routes side by side
 *   node route.js stays kyoto [--budget modest|comfortable|splurge] [--bath] [--all]   the shortlist for a place
 *   node route.js plan "tokyo:4,nikko:2r,tokyo:2,kyoto:4" --in HND --out KIX [--repeat] [--nights N]
 *   node route.js connectors kyoto kanazawa [--all]   node route.js exit kyoto   node route.js legs tokyo nikko
 *   --json on any command; --md (default) prints the kit's markdown tables.
 *
 * Stops are `place:nights`; `place:2r` is two room-only nights (no inn dinner, so the run of inn
 * dinners resets there). `inn:<slug>:nights` resolves to the inn's town. `spines`, `spine` and
 * `compare` read ./spines.json (the nine spines and their decisions) and assemble a stop string the
 * same buildPlan prices; nights come from places.json and move only where asked. `stays` reads
 * ./shortlist.json, the master table as data. `orders` (every order of a stop list, ranked) is an
 * internal helper; it is not part of the agent-facing surface.
 */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");

/* ───────────── 1. headless loader (inline copy of planning/load-builder.js) ───────────── */
function loadBuilder(dir) {
  const stub = new Proxy(function () {}, {
    get(t, p) { if (p === Symbol.toPrimitive) return () => ""; if (p === Symbol.iterator) return function* () {};
      if (p === "then" || p === Symbol.toStringTag) return undefined; return stub; },
    apply() { return stub; }, construct() { return stub; }, has() { return true; } });
  const BUILTINS = { Math, Date, JSON, console, parseInt, parseFloat, isNaN, isFinite, Infinity, NaN, undefined,
    RegExp, Object, Array, String, Number, Boolean, Symbol, Map, Set, Promise, Error, encodeURIComponent,
    decodeURIComponent, Function, setTimeout, clearTimeout,
    btoa: (s) => Buffer.from(s, "binary").toString("base64"), atob: (s) => Buffer.from(s, "base64").toString("binary") };
  const store = Object.create(null);
  const sandbox = new Proxy(store, { has() { return true; },
    get(t, p) { if (p === Symbol.unscopables) return undefined; if (p in t) return t[p];
      if (p === "globalThis" || p === "window" || p === "self") return sandbox;
      return Object.prototype.hasOwnProperty.call(BUILTINS, p) ? BUILTINS[p] : stub; },
    set(t, p, v) { t[p] = v; return true; } });
  const ctx = vm.createContext(sandbox);
  for (const f of ["route-data.js", "route-builder-logic.js"]) {
    try { vm.runInContext(fs.readFileSync(path.join(dir, f), "utf8"), ctx, { filename: f, timeout: 20000 }); } catch (e) { /* render against the stub DOM may throw; data is set */ }
  }
  return { W: store, B: store.__BUILDER__ };
}
/* KIT_BUILDER_DIR lets the source project run this file against a built kit's builder/ folder without
 * shipping it there (the kit build prices the library in both layouts; only one ships the engine) */
const DIR = process.env.KIT_BUILDER_DIR ? path.resolve(process.env.KIT_BUILDER_DIR) : __dirname;
const { W, B } = loadBuilder(DIR);
if (!B) { console.error("route.js: could not load ./route-builder-logic.js + ./route-data.js"); process.exit(2); }
const RYK = W.RYOKANS || {}, SYNTH = W.SYNTH || {}, HOTELS = W.HOTELS || {};

/* ───────────── 2. labels, airports, hubs, coordinates ───────────── */
/* every loc a stop, a connector row or a corridor row can name — a place prints its card's name,
 * never an inn's address line (Matsumoto is Matsumoto, not "Tobira Onsen") */
const LABEL = { tokyo: "Tokyo", sendai: "Sendai", kanazawa: "Kanazawa", takayama: "Takayama", kyoto: "Kyoto", nara: "Nara",
  osaka: "Osaka", hiroshima: "Hiroshima", fukuoka: "Fukuoka (Hakata)", beppu: "Beppu", kumamoto: "Kumamoto", nagasaki: "Nagasaki",
  kagoshima: "Kagoshima", hakone: "Hakone", kurokawa: "Kurokawa Onsen", nikko: "Nikkō", izu: "Izu peninsula (Shuzenji)",
  echigoyuzawa: "Echigo-Yuzawa (snow country)", tanigawa: "Minakami / Tanigawa (snow country)", kawaguchiko: "Lake Kawaguchi (Mt Fuji)",
  miyajima: "Miyajima", yufuin: "Yufuin", kirishima: "Kirishima (Myōken Onsen)", amakusa: "Amakusa (Matsushima)", takeo: "Takeo Onsen",
  yamashiro: "Yamashiro Onsen (Kaga)", yamanaka: "Yamanaka Onsen (Kaga)", mikuni: "Mikuni / Awara", toyama: "Sasazu (Toyama)", unzen: "Unzen",
  karatsu: "Karatsu", hita: "Amagase (Hita)", yakushima: "Yakushima", iki: "Iki island", okayama: "Okayama", naoshima: "Naoshima (Miyanoura)",
  uno: "Uno port", kakunodate: "Kakunodate", nagoya: "Nagoya", nyuto: "Nyūtō Onsen", sapporo: "Sapporo", niseko: "Niseko (Hirafu)",
  furano: "Furano", noboribetsu: "Noboribetsu Onsen", otaru: "Otaru", akan: "Lake Akan (Akanko Onsen)", takachiho: "Takachiho",
  jozankei: "Jōzankei Onsen", kochi: "Kōchi (Shikoku)",
  yudanaka: "Yudanaka (Shibu Onsen)", yamadaonsen: "Yamada Onsen", matsunoyama: "Matsunoyama Onsen", karuizawa: "Karuizawa (Miyota)",
  tsuchiyu: "Tsuchiyu Onsen", iizaka: "Iizaka Onsen", bandaiatami: "Bandai-Atami", aizuwakamatsu: "Aizu-Wakamatsu", sukagawa: "Sukagawa",
  akayu: "Akayu Onsen", kaminoyama: "Kaminoyama Onsen", hottoyuda: "Hotto-Yuda", shizukuishi: "Shizukuishi", matsumoto: "Matsumoto",
  kamasaki: "Kamasaki Onsen", kiso: "Kiso valley", suwa: "Suwa", oyama: "Oyama (Mt Fuji)", yugashima: "Yugashima (Izu)",
  koshu: "Kōshū (Yamanashi)", kobuchizawa: "Kobuchizawa (Yatsugatake)", izukogen: "Izu-Kōgen", atami: "Atami", shimoda: "Shimoda",
  yugawara: "Yugawara", notojima: "Notojima (Noto)", eiheiji: "Eiheiji", gero: "Gero Onsen", inuyama: "Inuyama",
  katsuragi: "Katsuragi (Kōyasan side)", amino: "Taiza (Tango coast)", kinosaki: "Kinosaki Onsen", arima: "Arima Onsen", ise: "Ise-Shima",
  yunoyama: "Yunoyama Onsen", onomichi: "Onomichi", tomonoura: "Tomonoura", setoda: "Setoda (Ikuchijima)", hatsukaichi: "Hatsukaichi (Miyajima side)" };
/* intl: the airports Stage 1 says a trip normally leaves from — each flies long-haul itself. Every other
 * airport counts as an exit too when the tables hold its flight to Haneda (`<code>>hnd`); one with
 * neither is listed last and says so. */
const AIRPORT = { HND: { label: "Haneda (HND)", hubs: ["tokyo"], intl: true }, NRT: { label: "Narita (NRT)", hubs: ["tokyo"], intl: true },
  KIX: { label: "Kansai (KIX)", hubs: ["osaka", "kyoto"], intl: true }, ITM: { label: "Itami (ITM)", hubs: ["osaka", "kyoto"] },
  FUK: { label: "Fukuoka (FUK)", hubs: ["fukuoka"], intl: true }, NGS: { label: "Nagasaki (NGS)", hubs: ["nagasaki"] },
  HIJ: { label: "Hiroshima (HIJ)", hubs: ["hiroshima"] }, KOJ: { label: "Kagoshima (KOJ)", hubs: ["kagoshima"], intl: true },
  KMJ: { label: "Kumamoto (KMJ)", hubs: ["kumamoto"] }, OIT: { label: "Ōita (OIT)", hubs: ["beppu", "yufuin"] },
  KMQ: { label: "Komatsu (KMQ)", hubs: ["kanazawa"] }, NGO: { label: "Nagoya Centrair (NGO)", hubs: ["nagoya"], intl: true },
  CTS: { label: "New Chitose (CTS)", hubs: ["sapporo"], intl: true } };
const AP_CODES = Object.keys(AIRPORT), apKey = (c) => c.toLowerCase();
/* the hubs a pair is composed through: every corridor city, plus the Nagoya and Okayama gateways and
 * the Sapporo hub — the same list Stages 3 and 5 print */
const HUBS = ["tokyo", "sendai", "kanazawa", "takayama", "kyoto", "nara", "osaka", "nagoya", "okayama", "hiroshima",
  "fukuoka", "beppu", "kumamoto", "nagasaki", "kagoshima", "sapporo"];
const DENSITY_MAX = 60;        // minutes of travel per night — the kit's flag
const TICKET_FLIGHT_MAX = 3;   // domestic flights a booked ticket may force before the menu row stops printing a figure
const FLIGHT_CAP_H = 3;        // a domestic flight leg counts at most this much in the per-night figure
/* lat/lng for the city locs no inn sits in (inn locs average their inns' SYNTH geo) */
const CITY_GEO = { tokyo: [35.681, 139.767], kyoto: [34.985, 135.758], osaka: [34.702, 135.495], nagoya: [35.171, 136.882],
  okayama: [34.666, 133.918], hiroshima: [34.397, 132.475], fukuoka: [33.590, 130.420], nagasaki: [32.752, 129.871],
  kumamoto: [32.790, 130.689], kagoshima: [31.584, 130.541], beppu: [33.284, 131.491], sendai: [38.260, 140.882],
  kanazawa: [36.578, 136.648], takayama: [36.142, 137.252], naoshima: [34.460, 133.990], uno: [34.490, 133.950],
  sapporo: [43.068, 141.351], niseko: [42.862, 140.697], furano: [43.342, 142.383], noboribetsu: [42.494, 141.146],
  otaru: [43.191, 140.995], akan: [43.441, 144.096], nyuto: [39.796, 140.800] };
const PLACES = {};   // loc → {loc,name,kind,ideal,minimum,repeat,region[,lat,lng,label,cores]} — filled by loadPlaces()
/* the five kinds (2026-09-11): city · inn-town · onsen-town · day-trip · island. An inn town's or onsen
 * town's lodging is an inn dinner (the three-dinner run counts it); a city, a day-trip overnight or an
 * island night resets the run and counts as a city night unless the stop names an inn. */
const INN_KINDS = new Set(["inn-town", "onsen-town", "inn"]);
const isInnKind = (k) => INN_KINDS.has(k);
const isBaseKind = (k) => k === "city" || k === "island";
const GEOS = {};
Object.keys(RYK).forEach((k) => { const g = SYNTH[k] && SYNTH[k].geo; const l = RYK[k].loc;
  if (g && g.lat && l) (GEOS[l] = GEOS[l] || []).push([g.lat, g.lng]); });
function coord(loc) { const p = PLACES[loc]; if (p && p.lat) return [p.lat, p.lng]; if (CITY_GEO[loc]) return CITY_GEO[loc]; const a = GEOS[loc]; if (!a) return null;
  return [a.reduce((s, p) => s + p[0], 0) / a.length, a.reduce((s, p) => s + p[1], 0) / a.length]; }
function km(a, b) { if (!a || !b) return null; const R = 6371, d = Math.PI / 180, dl = (b[0] - a[0]) * d, dg = (b[1] - a[1]) * d;
  const h = Math.sin(dl / 2) ** 2 + Math.cos(a[0] * d) * Math.cos(b[0] * d) * Math.sin(dg / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
function label(loc) { if (PLACES[loc] && PLACES[loc].label) return PLACES[loc].label; if (LABEL[loc]) return LABEL[loc]; return cap(String(loc)); }
const short = (loc) => label(loc).replace(/\s*\(.*/, "");
/* hours print as the tables do — `2h45`, `36 min`; a minute is the unit, half rounds up */
const hm = (h) => { const t = Math.round(h * 60), H = Math.floor(t / 60), M = t % 60; return H ? `${H}h${M ? String(M).padStart(2, "0") : ""}` : `${M} min`; };
const chg = (n) => `${n} change${n === 1 ? "" : "s"}`;
const roundHalfUp = (x) => Math.floor(x + 0.5);

/* ───────────── 3. places: night ranges from places.json or ../stages/2-orientation.md ───────────── */
const ALIAS = { "fuji lakes": ["kawaguchiko", "oyama"], "izu": ["izu", "yugashima", "izukogen", "atami", "shimoda", "yugawara"],
  "the kaga onsen towns yamashiro yamanaka": ["yamashiro", "yamanaka"], "takayama hida the alps": ["takayama", "gero", "matsumoto", "kiso", "suwa", "inuyama"],
  "each snow valley": ["tanigawa", "echigoyuzawa", "matsunoyama", "yudanaka", "yamadaonsen"],
  "tohoku inn towns": ["kakunodate", "hottoyuda", "shizukuishi", "tsuchiyu", "iizaka", "bandaiatami", "aizuwakamatsu", "sukagawa", "akayu", "kaminoyama", "kamasaki"],
  "miyajima": ["miyajima", "hatsukaichi"], "amagase": ["hita"], "takeo onsen": ["takeo"], "hakone": ["hakone"], "nikko": ["nikko"] };
function kindOf(text, fallback) { const t = norm(text);
  return /onsen town/.test(t) ? "onsen-town" : /inn town|inn night/.test(t) ? "inn-town" : /day trip/.test(t) ? "day-trip" : /island/.test(t) ? "island" : fallback; }
function baseKind(s) { const t = norm(s); return /onsen town/.test(t) ? "onsen-town" : /inn town/.test(t) ? "inn-town" : /day trip/.test(t) ? "day-trip" : "city"; }
function locsForName(name) { const n = norm(name); if (ALIAS[n]) return ALIAS[n];
  const byKey = Object.keys(B.LOC_REGION).find((l) => l === n.replace(/ /g, "")); if (byKey) return [byKey];
  const byLabel = Object.keys(LABEL).find((l) => norm(LABEL[l]) === n || norm(LABEL[l]).split(" ")[0] === n); return byLabel ? [byLabel] : []; }
function parseRange(s) { const m = /ideal\s+(\d+)(?:\s*[–-]\s*(\d+))?\s*·\s*minimum\s+(\d+)/.exec(s); if (!m) return null;
  return { ideal: [+m[1], +(m[2] || m[1])], minimum: +m[3], note: s.split("·").slice(2).join("·").trim() }; }
function loadPlaces() {
  const pj = path.join(DIR, "places.json");
  if (fs.existsSync(pj)) { const j = JSON.parse(fs.readFileSync(pj, "utf8")); (Array.isArray(j) ? j : j.places || []).forEach((p) => { PLACES[p.loc] = p; }); return "places.json"; }
  const md = path.join(DIR, "..", "stages", "2-orientation.md");
  if (!fs.existsSync(md)) return null;
  let card = null;
  fs.readFileSync(md, "utf8").split("\n").forEach((line) => {
    const h = /^### (.+)$/.exec(line); if (h) { card = { name: h[1].trim(), base: "city", locs: locsForName(h[1]), inherited: [] }; return; }
    if (!card) return;
    const base = /^- \*\*base:\*\*\s*(.+)$/.exec(line);   // `base:` comes after `places:` on a card, so back-fill the sub-items that inherited the default
    if (base) { card.base = baseKind(base[1]); card.locs.concat(card.inherited).forEach((l) => { if (PLACES[l]) PLACES[l].kind = card.base; }); return; }
    const nights = /^- \*\*nights:\*\*\s*(.+)$/.exec(line);
    if (nights) { const r = parseRange(nights[1]); if (r) card.locs.forEach((l) => { PLACES[l] = { loc: l, name: card.name, kind: card.base, ideal: r.ideal, minimum: r.minimum, region: B.regionOfLoc(l), card: card.name }; }); return; }
    const rep = /^- \*\*repeat visit:\*\*\s*read the ideal as\s+(\d+)\s*[–-]\s*(\d+)/.exec(line);
    if (rep) { card.locs.forEach((l) => { if (PLACES[l]) PLACES[l].repeat = [+rep[1], +rep[2]]; }); return; }
    const sub = /^\s+- \*\*([^:]+):\*\*\s*(.+)$/.exec(line);
    if (sub) { const r = parseRange(sub[2]); if (!r) return; const locs = locsForName(sub[1]), own = kindOf(r.note, null);
      locs.forEach((l) => { PLACES[l] = { loc: l, name: sub[1].trim(), kind: own || card.base, ideal: r.ideal, minimum: r.minimum, region: B.regionOfLoc(l), card: card.name }; if (!own) card.inherited.push(l); }); }
  });
  /* a city card's range applies to its city; an inn loc under it (no hotels) is an inn town, one night */
  Object.values(PLACES).forEach((p) => { if ((HOTELS[p.loc] || []).length) p.kind = "city";
    else if (p.kind === "city" && Object.values(RYK).some((r) => r.loc === p.loc)) Object.assign(p, { kind: "inn-town", ideal: [1, 1], minimum: 1 }); });
  return "2-orientation.md";
}
const PLACES_SRC = loadPlaces();
/* a loc with no card line gets a derived record — an inn town at one night where an inn sits there, a
 * city otherwise — and says so in the checks; the kit build is meant to leave none of these */
function placeOf(loc) { if (PLACES[loc]) return PLACES[loc];
  const hasInn = Object.values(RYK).some((r) => r.loc === loc), hasHotel = (HOTELS[loc] || []).length > 0;
  return { loc, name: label(loc), kind: hasHotel ? "city" : hasInn ? "inn-town" : "city", ideal: hasHotel || !hasInn ? [2, 3] : [1, 1], minimum: hasInn && !hasHotel ? 1 : 2, region: B.regionOfLoc(loc), unlisted: true }; }
/* the shortlist as data (builder/shortlist.json, written by the kit build from the master inn table and the
 * hotel tables): `connectors` and `stays` never name an inn the master table omits (fixlist 20) */
let SHORTLIST = null;
try { const sj = path.join(DIR, "shortlist.json"); if (fs.existsSync(sj)) { SHORTLIST = JSON.parse(fs.readFileSync(sj, "utf8")); SHORTLIST.keys = new Set((SHORTLIST.inns || []).map((i) => i.key).filter(Boolean)); } } catch (e) { SHORTLIST = null; }
const onShortlist = (key) => !SHORTLIST || SHORTLIST.keys.has(key);

/* ───────────── 4. resolving stop names ───────────── */
let CATALOG = null;
try { const c = JSON.parse(fs.readFileSync(path.join(DIR, "..", "catalog", "catalog.json"), "utf8")); CATALOG = c.inns || c; } catch (e) { CATALOG = null; }
const slugify = (s) => norm(s).replace(/ /g, "-");
function slugOf(key) { const r = RYK[key]; if (!r) return null;
  const hit = CATALOG && CATALOG.find((i) => norm(i.name) === norm(r.name)); return hit ? hit.slug : slugify(r.name); }
function innByRef(ref) { const n = norm(ref); if (RYK[ref]) return ref;
  const hit = Object.keys(RYK).find((k) => norm(RYK[k].name) === n || slugOf(k) === n.replace(/ /g, "-")); if (hit) return hit;
  const c = CATALOG && CATALOG.find((i) => i.slug === n.replace(/ /g, "-")); return c ? Object.keys(RYK).find((k) => norm(RYK[k].name) === norm(c.name)) || null : null; }
function resolveLoc(q) {
  if (q == null || q === "") throw new Error("a place is missing — give a loc key, a place name, or inn:<slug>");
  if (/^inn:/.test(q)) { const k = innByRef(q.slice(4)); if (!k) throw new Error(`unknown inn "${q.slice(4)}"`); return RYK[k].loc; }
  const n = norm(q), locs = Object.keys(B.LOC_REGION).concat(Object.keys(CITY_GEO).filter((l) => !B.LOC_REGION[l]));
  Object.values(RYK).forEach((r) => { if (r.loc && !locs.includes(r.loc)) locs.push(r.loc); });
  if (locs.includes(n.replace(/ /g, ""))) return n.replace(/ /g, "");
  const cands = [];   // [loc, score] — 3 exact alias, 2 alias starts with query, 1 alias contains query
  const add = (loc, alias) => { const a = norm(alias); if (!a) return; const s = a === n ? 3 : a.startsWith(n) ? 2 : a.includes(n) ? 1 : 0; if (s) cands.push([loc, s]); };
  locs.forEach((l) => { add(l, label(l)); add(l, label(l).replace(/\s*\([^)]*\)/g, "")); (label(l).match(/\(([^)]+)\)/) || []).slice(1).forEach((x) => add(l, x)); });
  Object.values(PLACES).forEach((p) => add(p.loc, p.name));
  Object.keys(ALIAS).forEach((a) => ALIAS[a].forEach((l, i) => { if (i === 0) add(l, a); }));
  Object.values(RYK).forEach((r) => { if (r.where) { add(r.loc, r.where.split(",")[0]); add(r.loc, r.where); } });
  /* an inn's own name answers for its town (2026-09-13): `stays soneka` is what a reader types after
   * reading the row, and the shortlist is the table that knows where every listed inn sleeps */
  if (SHORTLIST) (SHORTLIST.inns || []).forEach((i) => { if (!i.loc) return; add(i.loc, i.name); add(i.loc, String(i.slug || "").replace(/-/g, " ")); });
  if (!cands.length) throw new Error(`unknown place "${q}" — use a loc key (${locs.slice(0, 12).join(", ")}, …), a place name, or inn:<slug>`);
  const best = Math.max(...cands.map((c) => c[1])), top = [...new Set(cands.filter((c) => c[1] === best).map((c) => c[0]))];
  if (top.length > 1 && best < 3) throw new Error(`"${q}" is ambiguous: ${top.map((l) => `${l} (${label(l)})`).join(" · ")}`);
  return top[0];
}
/* one stop record from a loc key — what parseStops builds, and what the library generator builds directly */
function stopOf(loc, nights, inn, roomOnly) { const p = placeOf(loc); const kind = inn ? "inn" : p.kind;
  return { loc, nights, inn: inn || null, kind, roomOnly: !!roomOnly, name: inn ? `${RYK[inn].name} · ${label(loc)}` : label(loc) }; }
function parseNights(s, dflt) { const m = /^(\d+)(r)?$/.exec(String(s == null || s === "" ? dflt : s).trim());
  if (!m) throw new Error(`bad night count "${s}" — write 2, or 2r for room-only nights`); return { n: +m[1], r: !!m[2] }; }
function parseStops(spec) {
  return spec.split(",").map((tok) => tok.trim()).filter(Boolean).map((tok) => {
    const parts = tok.split(":"); let inn = null, loc, n;
    if (parts[0] === "inn") { inn = innByRef(parts[1]); if (!inn) throw new Error(`unknown inn "${parts[1]}"`); loc = RYK[inn].loc; n = parseNights(parts[2], 1); }
    else { loc = resolveLoc(parts[0]); n = parseNights(parts[1], isBaseKind(placeOf(loc).kind) ? 2 : 1); }
    return stopOf(loc, n.n, inn, n.r);
  });
}
/* the stop string that rebuilds a plan: `tokyo:4,nikko:2r,…` — printed on every library route so a bend is an edit and a re-run */
const stopString = (stops) => stops.map((s) => (s.inn ? `inn:${slugOf(s.inn)}:${s.nights}` : `${s.loc}:${s.nights}`) + (s.roomOnly ? "r" : "")).join(",");
const runId = (spec, opt) => crypto.createHash("sha1").update(`${spec}|${opt.in || ""}|${opt.out || ""}|${opt.repeat ? "r" : ""}`).digest("hex").slice(0, 6);

/* ───────────── 5. legs: the engine, plus Stage 3's hub composition and airport legs ───────────── */
function pivotOf(leg) { const m = /changes at ([^ (]+(?: [^ (]+)*?) \(/.exec(leg.text || ""); return m ? m[1] : "a hub"; }
const rawLeg = (a, b) => B.LEGS[a + ">" + b] || B.LEGS[b + ">" + a];   // LEGS is authored once per pair, either way round
const isFlight = (l) => !!l && (/flight/i.test(String(l.mode || "")) || !!(l.flags && l.flags.flight));
function researchedDirect(a, b) { const f = B.LEGS[a + ">" + b], r = B.LEGS[b + ">" + a]; const l = f || r; if (!l || l.source === "estimated") return null;
  return { t: l.t, mode: l.mode || "train", text: (f ? "" : "Reverse of: ") + (l.text || ""), flags: l.flags || {}, flight: isFlight(l) }; }
const halfH = (h) => ({ h: h.t[0], x: h.t[1], flightH: h.flight ? h.t[0] : 0 });
const LEG_MEMO = new Map();
function leg(a, b) { const k = a + ">" + b; if (!LEG_MEMO.has(k)) LEG_MEMO.set(k, legRaw(a, b)); return LEG_MEMO.get(k); }
/* a table leg: hours, changes, mode, and how much of it is a domestic flight (for the per-night cap) */
function legRaw(a, b) {
  if (a === b) return { h: 0, x: 0, flightH: 0, mode: "—", source: "table", text: "" };
  const L = B.legBetween(a, b);
  if (L && L.source === "researched" && !L.composed) return { h: L.t[0], x: L.t[1], flightH: isFlight(L) ? L.t[0] : 0, mode: L.mode, source: "table", text: L.text, flags: L.flags };
  if (L && L.composed) return { h: L.t[0], x: L.t[1], flightH: isFlight(L) ? L.t[0] : 0, mode: L.mode, source: "composed via " + pivotOf(L), text: L.text, flags: L.flags };
  const cands = [];
  /* Stage 3: compose through a hub on two researched halves, +1 change for the join */
  HUBS.forEach((c) => { if (c === a || c === b) return; const h1 = researchedDirect(a, c), h2 = researchedDirect(c, b); if (!h1 || !h2) return;
    cands.push({ h: h1.t[0] + h2.t[0], x: h1.t[1] + h2.t[1] + 1, flightH: (h1.flight ? h1.t[0] : 0) + (h2.flight ? h2.t[0] : 0),
      mode: h1.flight ? "flight" : h2.flight ? h1.mode + " + flight" : h1.mode, source: "composed via " + short(c), text: `${h1.text} Then ${h2.text}`, flags: {} }); });
  /* a town with no flight row of its own may fly through its airport: the transfer row to the airport, the
   * airport-to-airport flight row, and the transfer row at the far end — three researched halves, two joins */
  AP_CODES.forEach((A) => { const t1 = researchedDirect(a, apKey(A)); if (!t1 || t1.flight) return;
    AP_CODES.forEach((H) => { if (H === A) return; const fl = researchedDirect(apKey(A), apKey(H)); if (!fl || !fl.flight) return;
      const t2 = researchedDirect(apKey(H), b); if (!t2 || t2.flight) return;
      cands.push({ h: t1.t[0] + fl.t[0] + t2.t[0], x: t1.t[1] + fl.t[1] + t2.t[1] + 2, flightH: fl.t[0], mode: "flight",
        source: `composed via ${AIRPORT[A].label} and ${AIRPORT[H].label}`, text: `${t1.text} Then ${fl.text} Then ${t2.text}`, flags: {}, via: [A, H] }); }); });
  cands.sort((p, q) => p.h - q.h || p.x - q.x);
  if (cands.length) { const best = cands[0]; best.alternatives = cands.slice(1).filter((c) => c.flightH && c.source !== best.source).slice(0, 2); return best; }
  /* nothing joins the pair: no number is printed, and the order that needs it is never recommended */
  return { h: null, x: null, flightH: 0, mode: "—", source: "to confirm", text: (L && L.text) || "", flags: {}, estimated: true };
}
/* the airport leg for a stop: a transfer row, else through the airport's city, else through the nearest
 * domestic airport and its flight to this one (the last stop of a Kyushu or Hokkaido trip out to Haneda) */
function airportLeg(loc, code) {
  const ap = AIRPORT[code]; if (!ap) throw new Error(`unknown airport ${code} (${AP_CODES.join(", ")})`);
  const lc = apKey(code), direct = rawLeg(loc, lc);
  if (direct && direct.source !== "estimated") return { h: direct.t[0], x: direct.t[1], flightH: isFlight(direct) ? direct.t[0] : 0, mode: direct.mode || "train", source: "table", text: direct.text };
  const cands = [];
  ap.hubs.forEach((hub) => { const acc = researchedDirect(hub, lc); if (!acc) return; const to = leg(loc, hub); if (to.estimated) return;
    cands.push({ h: to.h + acc.t[0], x: to.x + acc.t[1] + (loc === hub ? 0 : 1), flightH: to.flightH, mode: to.mode,
      source: to.source === "table" ? "composed via " + short(hub) : to.source, text: `${to.text} Then ${acc.text}` }); });
  AP_CODES.forEach((A) => { if (A === code) return; const t1 = researchedDirect(loc, apKey(A)); if (!t1 || t1.flight) return;
    const fl = researchedDirect(apKey(A), lc); if (!fl || !fl.flight) return;
    cands.push({ h: t1.t[0] + fl.t[0], x: t1.t[1] + fl.t[1] + 1, flightH: fl.t[0], mode: "flight",
      source: `composed via ${AIRPORT[A].label}`, text: `${t1.text} Then ${fl.text}`, halves: [{ h: t1.t[0], x: t1.t[1], mode: t1.mode, what: `${short(loc)} → ${AIRPORT[A].label}` }, { h: fl.t[0], x: fl.t[1], mode: "flight", what: `${AIRPORT[A].label} → ${ap.label}` }] }); });
  /* a composed flight is ranked with 1h30 of airport time on top (check-in, security, the walk out), so a 2h30 hop via
   * Itami does not beat a 3h20 bullet train to Haneda (QA round 7); the printed time stays the researched one */
  const FLIGHT_OVERHEAD_H = 1.5;
  const rank = (c) => c.h + (c.mode === "flight" ? FLIGHT_OVERHEAD_H : 0);
  cands.sort((p, q) => rank(p) - rank(q) || p.x - q.x);
  return cands[0] || { h: null, x: null, flightH: 0, mode: "—", source: "to confirm", text: "no airport leg in the tables", estimated: true };
}
/* "connects to Haneda": the tables hold the airport's own flight to HND */
const hanedaRow = (code) => (code === "HND" || code === "NRT" ? null : researchedDirect(apKey(code), "hnd"));
const airportClass = (code) => (AIRPORT[code].intl ? "long-haul" : hanedaRow(code) ? "connects to Haneda" : "domestic; its Haneda flight is not in the tables");
function airportsRanked(loc, intlOnly) { return AP_CODES.filter((c) => !intlOnly || AIRPORT[c].intl)
  .map((c) => ({ code: c, label: AIRPORT[c].label, intl: !!AIRPORT[c].intl, cls: airportClass(c), leg: airportLeg(loc, c) }))
  .filter((a) => !a.leg.estimated && (a.intl || hanedaRow(a.code) || intlOnly === false))
  .sort((a, b) => (a.leg.h + 0.5 * a.leg.x) - (b.leg.h + 0.5 * b.leg.x) || (b.intl ? 1 : 0) - (a.intl ? 1 : 0) || AP_CODES.indexOf(a.code) - AP_CODES.indexOf(b.code)); }
/* an open ticket: in at the nearest long-haul gateway to the first stop (Tokyo defaults to Haneda), out
 * from the nearest airport to the last that flies long-haul or connects to Haneda */
const defaultIn = (loc) => (airportsRanked(loc, true)[0] || {}).code || null;
const EXIT_INTL_SLACK_H = 0.5;
const defaultOut = (loc) => { const any = airportsRanked(loc)[0], intl = airportsRanked(loc, true)[0];
  return any && intl && intl.leg.h <= any.leg.h + EXIT_INTL_SLACK_H ? intl.code : any ? any.code : null; };

/* ───────────── 6. the plan: legs, totals, checks ───────────── */
const cappedH = (l) => (l.estimated ? 0 : l.h - l.flightH + Math.min(l.flightH, FLIGHT_CAP_H));
function buildPlan(stops, optIn) {
  const opt = Object.assign({}, optIn);
  if (opt.inGiven == null) opt.inGiven = !!optIn.in;
  if (!opt.in) { opt.in = defaultIn(stops[0].loc); opt.inDefault = true; }
  if (!opt.out) { opt.out = defaultOut(stops[stops.length - 1].loc); opt.outDefault = true; }
  const legs = [];
  if (opt.in) legs.push(Object.assign({ kind: "in", code: opt.in }, airportLeg(stops[0].loc, opt.in)));
  for (let i = 1; i < stops.length; i++) legs.push(Object.assign({ kind: "leg", from: stops[i - 1].loc, to: stops[i].loc }, leg(stops[i - 1].loc, stops[i].loc)));
  if (opt.out) legs.push(Object.assign({ kind: "out", code: opt.out }, airportLeg(stops[stops.length - 1].loc, opt.out)));
  const nights = stops.reduce((s, st) => s + st.nights, 0);
  /* a ryokan night is every night that is not a city night: an inn town, an onsen town, a named inn, an
   * island or a day-trip place slept in (Naoshima counted as a city night until 2026-09-13) */
  const isInn = (st) => st.kind !== "city";
  const sourced = legs.filter((l) => !l.estimated);
  const t = { hours: +sourced.reduce((s, l) => s + l.h, 0).toFixed(2), hoursCapped: +sourced.reduce((s, l) => s + cappedH(l), 0).toFixed(2),
    flightHours: +sourced.reduce((s, l) => s + l.flightH, 0).toFixed(2), changes: sourced.reduce((s, l) => s + l.x, 0), checkins: stops.length, nights,
    innNights: stops.filter(isInn).reduce((s, st) => s + st.nights, 0), roomOnlyNights: stops.filter((st) => st.roomOnly).reduce((s, st) => s + st.nights, 0),
    oneNighters: stops.filter((st) => st.nights === 1).length, unsourced: legs.filter((l) => l.estimated).length };
  t.cityNights = nights - t.innNights;
  /* per night: the arrival transfer and the exit leg always in it; each domestic flight leg at min(actual, 3h); half rounds up */
  t.perNight = nights ? roundHalfUp(t.hoursCapped * 60 / nights) : 0;
  t.flightCapped = t.hoursCapped < t.hours - 1e-9;
  return { stops, legs, totals: t, opt, checks: checks(stops, legs, t, opt) };
}
/* the geometric doubling-back test on stop i, given its two predecessors: C lies behind A on the A→B axis AND
 * close to that line (a stop far to the side is a different corridor, not the road back). A researched direct
 * leg that does so is allowed and noted (Nikkō → Kyoto rides back through Tokyo on one ticket; a finale inn
 * after Kyoto is the builder's own pattern); a leg the tables only compose is a violation. `orders` prunes on the
 * violation before pricing. Returns "violation", "note" or false. */
function backtracksAt(stops, i) {
  const a = coord(stops[i - 2].loc), b = coord(stops[i - 1].loc), c = coord(stops[i].loc);
  if (!a || !b || !c || stops[i].loc === stops[i - 2].loc) return false;
  const L = leg(stops[i - 1].loc, stops[i].loc); if (L.flightH || L.mode === "flight") return false;
  const kx = 111 * Math.cos(b[0] * Math.PI / 180), abv = [(b[0] - a[0]) * 111, (b[1] - a[1]) * kx], bcv = [(c[0] - b[0]) * 111, (c[1] - b[1]) * kx];
  const ab = Math.hypot(...abv); if (ab < 30) return false;
  const proj = (bcv[0] * abv[0] + bcv[1] * abv[1]) / ab;             // km of B→C along the A→B direction; < −ab means past A
  const lateral = Math.abs(bcv[0] * abv[1] - bcv[1] * abv[0]) / ab;  // km of C off the A→B line
  if (proj >= -ab || lateral > Math.max(50, 0.75 * ab)) return false;
  return L.source === "table" ? "note" : "violation";
}
function checks(stops, legs, t, opt) {
  const out = [], V = (m) => out.push({ level: "violation", msg: m }), F = (m) => out.push({ level: "flag", msg: m }), N = (m) => out.push({ level: "note", msg: m });
  /* ranges, split visits, the +1 ceiling */
  const byLoc = {}; stops.forEach((st, i) => { (byLoc[st.loc] = byLoc[st.loc] || []).push(Object.assign({ i }, st)); });
  Object.entries(byLoc).forEach(([loc, visits]) => {
    const p = placeOf(loc), total = visits.reduce((s, v) => s + v.nights, 0), range = (opt.repeat && p.repeat) || p.ideal, nm = label(loc);
    if (p.unlisted) N(`${nm}: no Stage 2 night line — treating it as ${p.kind} (ideal ${range[0]}–${range[1]}).`);
    if (p.kind === "day-trip" && total > 0) N(`${nm} is a day-trip place on its card; ${total} night${total > 1 ? "s" : ""} there is the by-exception overnight.`);
    if (total < p.minimum) F(`${nm}: ${total} night${total === 1 ? "" : "s"} is under the card's minimum of ${p.minimum} — allowed because they asked; say once what it costs.`);
    else if (total < range[0]) N(`${nm}: ${total} nights is under the ideal ${range[0] === range[1] ? range[0] : `${range[0]}–${range[1]}`}; it has room to absorb spare nights.`);
    const cap = capOf(loc, { repeat: opt.repeat });
    if (total > cap) V(`${nm}: ${total} nights is over its ceiling of ${cap} (ideal ${range[0]}–${range[1]}) — ${p.max ? "the kit caps it there" : "past the +1 ceiling"} unless they asked.`);
    else if (total > range[1]) N(`${nm}: ${total} nights sits at the +1 ceiling (ideal ${range[0]}–${range[1]}); say so.`);
    if (isBaseKind(p.kind) && visits.length > 1) {
      N(`${nm} is split ${visits.map((v) => v.nights).join(" + ")} = ${total} nights against its range ${range[0]}–${range[1]}; each visit is its own check-in.`);
      visits.forEach((v) => { if (v.nights >= 2) return;
        /* the final visit, with only inn-town nights between it and the airport, is the airport-side night and may stand alone */
        const airportSide = v.i === visits[visits.length - 1].i && stops.slice(v.i + 1).every((s) => !isBaseKind(s.kind));
        if (airportSide) N(`${nm}: the final one-night visit is the airport-side night, which may stand alone.`);
        else V(`${nm}: a split visit of ${v.nights} night — each visit of a city split in two is two nights or more, except a final airport-side night.`); });
    }
    if (isInnKind(p.kind) && visits.some((v) => v.nights > 1 && !v.roomOnly)) N(`${nm}: a second inn night needs a stated reason (slower travel, the only inn stay, or a strong interest in inns).`);
    if (visits.some((v) => v.roomOnly)) N(`${nm}: room only — no inn dinner, so the run of inn dinners resets there.`);
  });
  /* the three-dinner ceiling: consecutive nights whose dinner is at an inn; a city or room-only night resets it */
  let run = 0, worst = 0; stops.forEach((st) => { run = !isInnKind(st.kind) || st.roomOnly ? 0 : run + st.nights; worst = Math.max(worst, run); });
  if (worst > 3) V(`${worst} consecutive inn dinners — the ceiling is three; put a city or room-only night in the run.`);
  /* backtracking, by geography: projected on the A→B axis, C lies behind A — the road to C runs back
     through the place already left. A return to A itself (Tokyo→Nikkō→Tokyo) is the deliberate split, not a backtrack. */
  for (let i = 2; i < stops.length; i++) {
    const L = legs.find((l) => l.kind === "leg" && l.from === stops[i - 1].loc && l.to === stops[i].loc);
    if (L && (L.flightH || L.mode === "flight")) continue;
    const via = L && /composed via (.+)/.exec(L.source); const left = via && stops.slice(0, i - 1).find((s) => short(s.loc) === via[1]);
    if (left) { V(`${label(stops[i].loc)} after ${label(stops[i - 1].loc)} doubles back through ${label(left.loc)}, already left — reorder, or say it does not fit.`); continue; }
    const thru = L && L.source === "table" && stops.slice(0, i - 1).find((s) => isBaseKind(s.kind) && s.loc !== stops[i - 1].loc && s.loc !== stops[i].loc && new RegExp("(?<!than |not |never |no |than back |not back |never back )(?:via|through|change at|changing at|back to|→)\\s*" + short(s.loc) + "\\b", "i").test(L.text || ""));   // a city the leg's own route goes through, not one its prose merely mentions (QA round 9: Snow Country's Echigo-Yuzawa → Kanazawa note names the old Tokyo–Kanazawa train)
    if (thru) N(`${label(stops[i - 1].loc)} → ${label(stops[i].loc)} is a researched leg, but its route runs by way of ${label(thru.loc)}, already left.`);
    const bk = backtracksAt(stops, i);
    if (bk === "violation") V(`${label(stops[i].loc)} after ${label(stops[i - 1].loc)} doubles back past ${label(stops[i - 2].loc)} — reorder, or say it does not fit.`);
    else if (bk === "note" && !thru) N(`${label(stops[i].loc)} after ${label(stops[i - 1].loc)} runs back past ${label(stops[i - 2].loc)} on one researched leg — allowed; say so.`);
  }
  for (let i = 0; i < stops.length; i++) for (let j = 0; j < i - 1; j++) { const d = km(coord(stops[i].loc), coord(stops[j].loc));
    if (d !== null && d < 25 && stops[i].loc !== stops[j].loc) N(`${label(stops[i].loc)} (stop ${i + 1}) is next door to ${label(stops[j].loc)} (stop ${j + 1}) already left — check that is deliberate.`); }
  /* more than seven places on one trip tires most couples whatever the travel figure says (QA round 7: nine places in
   * eighteen nights passed every other check) — a flag, with the steer to merge two */
  if (new Set(stops.map((s) => s.loc)).size > 7) F(`${new Set(stops.map((s) => s.loc)).size} different places on one trip — more than seven is a lot of packing and unpacking; say so, and name the two you would merge.`);
  if (t.unsourced) N(`per night is partial: ${t.unsourced} leg${t.unsourced > 1 ? "s are" : " is"} unsourced, so the figure is a floor.`);
  else if (t.perNight >= DENSITY_MAX) F(`${t.perNight} min of travel per night — ${DENSITY_MAX} minutes or more; say why${t.flightHours ? ` (${hm(t.flightHours)} of it is flying, counted at ${FLIGHT_CAP_H}h a leg)` : ""} and show a lighter order beside it.`);
  /* the arrival-day inn: a violation for a long-haul arrival nobody chose, a flag when they booked the
   * flight themselves — a domestic hop into the region lands with the afternoon to spare (2026-09-13) */
  if (isInnKind(stops[0].kind) && opt.in) {
    if (opt.inGiven) F(`the first night is at ${stops[0].name} — that works only if the flight into ${AIRPORT[opt.in].label} lands by early afternoon; say so.`);
    else V(`the first night is at ${stops[0].name} — an inn on arrival day only works if the flight lands by early afternoon.`);
  }
  if (opt.out && !opt.outDefault) { const chosen = legs[legs.length - 1]; const best = airportsRanked(stops[stops.length - 1].loc, !!AIRPORT[opt.out].intl)[0];
    if (chosen.estimated) V(`no researched leg reaches ${AIRPORT[opt.out].label} from ${label(stops[stops.length - 1].loc)} — look it up on a timetable.`);
    else if (chosen.halves) N(`the ticket home leaves from ${AIRPORT[opt.out].label}: ${label(stops[stops.length - 1].loc)} reaches it by a domestic flight, both halves in the table (${chosen.halves.map((h) => `${h.what} ${hm(h.h)}`).join(", ")}).`);
    else if (best && best.code !== opt.out && best.leg.h + 0.25 < chosen.h) F(`exit via ${AIRPORT[opt.out].label} is ${hm(chosen.h)} from ${label(stops[stops.length - 1].loc)}; ${best.label} (${best.cls}) is nearer at ${hm(best.leg.h)} — a fixed ticket settles it, say what it costs.`); }
  if (opt.in && !opt.inDefault) { const chosen = legs[0]; const best = airportsRanked(stops[0].loc, !!AIRPORT[opt.in].intl)[0];
    if (chosen.estimated) V(`no researched leg reaches ${label(stops[0].loc)} from ${AIRPORT[opt.in].label} — look it up on a timetable.`);
    else if (chosen.halves) N(`the ticket lands at ${AIRPORT[opt.in].label}: ${label(stops[0].loc)} is reached by a domestic flight, both halves in the table (${chosen.halves.slice().reverse().map((h) => `${halfWhat(h, true)} ${hm(h.h)}`).join(", ")}).`);
    else if (best && best.code !== opt.in && best.leg.h + 0.25 < chosen.h) N(`arrival via ${AIRPORT[opt.in].label} is ${hm(chosen.h)} to ${label(stops[0].loc)}; ${best.label} would be ${hm(best.leg.h)}.`); }
  if (opt.inDefault) N(`no arrival airport given — ${AIRPORT[opt.in] ? AIRPORT[opt.in].label : "none"} assumed, the nearest long-haul gateway to ${label(stops[0].loc)}.`);
  if (opt.outDefault) N(`no departure airport given — ${AIRPORT[opt.out] ? AIRPORT[opt.out].label : "none"} assumed, the nearest exit from ${label(stops[stops.length - 1].loc)}${opt.out ? ` (${airportClass(opt.out)})` : ""}.`);
  if (opt.nights && t.nights !== opt.nights) V(`the stops add up to ${t.nights} nights against a trip of ${opt.nights}.`);
  const bases = stops.filter((s) => isBaseKind(s.kind)).length; if (bases > Math.ceil(t.nights / 3)) N(`${bases} city bases in ${t.nights} nights — roughly one base per three nights is the ceiling on stops.`);
  legs.filter((l) => l.estimated).forEach((l) => V(`to confirm: ${l.kind === "leg" ? `${label(l.from)} → ${label(l.to)}` : `airport leg ${l.code}`} has no researched leg, even through a hub — look it up on a timetable.`));
  return out;
}
const isClean = (P) => !P.totals.unsourced && !P.checks.some((c) => c.level === "violation");

/* ───────────── 7. printers ───────────── */
const mark = (c) => (c.level === "violation" ? "**!**" : c.level === "flag" ? "**flag**" : "·");
/* a leg cell reads to the exact minute, as the corridor tables do, so a leg never prints two different times in
 * two places; the Totals line is the sum of those legs, read to five minutes (2026-09-13) */
const legBody = (l) => (l.estimated ? "to confirm" : `${hm(l.h)} · ${l.x ? chg(l.x) : "direct"} · ${l.mode}${l.source === "table" ? "" : ` · ${l.source}`}`);
/* a composed airport leg prints both halves, in the direction travelled (an arrival reads airport → town) */
const halfWhat = (h, back) => (back ? h.what.split(" → ").reverse().join(" → ") : h.what);
const halvesTxt = (l) => (l.halves ? ` (${(l.kind === "in" ? l.halves.slice().reverse() : l.halves).map((h) => `${halfWhat(h, l.kind === "in")} ${hm(h.h)} · ${h.x ? chg(h.x) : "direct"} · ${h.mode}`).join("; ")})` : "");
function legCell(l) { const pre = l.kind === "in" ? `in from ${AIRPORT[l.code].label} · ` : l.kind === "out" ? `out to ${AIRPORT[l.code].label} · ` : "";
  return `↓ ${pre}${legBody(l)}${halvesTxt(l)}`; }
const nightsCell = (st) => `${st.nights}${st.roomOnly ? " · room only" : ""}`;
const perNightTxt = (t) => (t.unsourced ? `≥ ${t.perNight} min per night (partial — ${t.unsourced} unsourced)` : `${t.perNight} min per night`);
const hoursTxt = (t) => (t.unsourced ? `≥ ${hm(t.hours)} (partial — ${t.unsourced} leg${t.unsourced > 1 ? "s" : ""} unsourced)` : hm(t.hours));
const hoursTxt5 = (t) => (t.unsourced ? `≥ ${hm5(t.hours)} (partial — ${t.unsourced} leg${t.unsourced > 1 ? "s" : ""} unsourced)` : hm5(t.hours));
const apLabel = (code) => (code && AIRPORT[code] ? AIRPORT[code].label : "—");
function printPlan(P, opt) {
  const L = [], t = P.totals, o = P.opt || opt;
  L.push(`**Trip plan** · ${t.nights} nights · arrive ${apLabel(o.in)}${o.inDefault ? " (assumed)" : ""}, depart ${apLabel(o.out)}${o.outDefault ? " (nearest)" : ""}`, "");
  L.push("| # | Stop | Nights | Stay | Band | Alternate |", "|---|---|---|---|---|---|");
  let li = 0; if (o.in) L.push(`| | ${legCell(P.legs[li++])} | | | | |`);
  P.stops.forEach((st, i) => { L.push(`| ${i + 1} | ${st.name} | ${nightsCell(st)} | ${st.inn ? `[${RYK[st.inn].name}](https://ryokancatalog.com/inn/${slugOf(st.inn)})` : ""} | | |`);
    if (i < P.stops.length - 1) L.push(`| | ${legCell(P.legs[li++])} | | | | |`); });
  if (o.out) L.push(`| | ${legCell(P.legs[li++])} | | | | |`);
  const capNote = t.flightCapped ? ` Per night counts each flight leg at ${FLIGHT_CAP_H}h at most (${hm5(t.hoursCapped)} counted); the table prints the true time.` : "";
  /* one rounding only (2026-09-13): the legs read exact and the total reads to five minutes, with no
   * arithmetic string printed beside it — two roundings of the same journey never agree */
  L.push("", `**Totals:** ${hoursTxt5(t)} of travel · ${perNightTxt(t)} · ${t.changes} change${t.changes === 1 ? "" : "s"} · ${t.checkins} check-in${t.checkins === 1 ? "" : "s"} · ${t.innNights} inn night${t.innNights === 1 ? "" : "s"} / ${t.cityNights} city night${t.cityNights === 1 ? "" : "s"}${t.roomOnlyNights ? ` (${t.roomOnlyNights} room only)` : ""} · ${t.oneNighters} one-nighter${t.oneNighters === 1 ? "" : "s"}.${capNote}`);
  L.push("", "**Checks**", ""); if (!P.checks.length) L.push("- clean: every stop inside its range, no run over three, no backtrack, under 60 min a night.");
  P.checks.forEach((c) => L.push(`- ${mark(c)} ${c.msg}`));
  const tc = P.legs.filter((l) => l.estimated); if (tc.length) { L.push("", "**To confirm**", ""); tc.forEach((l, i) => L.push(`${i + 1}. ${l.kind === "leg" ? `${label(l.from)} → ${label(l.to)}` : "airport leg " + l.code}: no researched leg, even through a hub.`)); }
  return L.join("\n");
}
function orderRow(P, name, rec) { const t = P.totals;
  const per = t.unsourced ? `≥ ${t.perNight} min (partial — ${t.unsourced} unsourced)` : `${t.perNight} min`;
  return `| ${name}${rec ? " — **Recommended**" : ""} | ${hoursTxt(t)} | ${per} | ${t.changes} | ${t.checkins} | ${t.innNights} / ${t.cityNights} | ${t.oneNighters} |`; }
const ORDER_HEAD = ["| Order | Hours | Per night | Changes | Check-ins | Inn / city nights | One-nighters |", "|---|---|---|---|---|---|---|"];
const chain = (stops) => stops.map((s) => short(s.loc)).join(" → ");
/* Stage 3's shape table — `| Stop | Nights | Onward |` under a header line read off the rows (nights summed, one
 * check-in per stop row), the arrival transfer as a first row so the totals reconcile, the legs in the Onward
 * cells exactly as the plan resolved them. This is the table the agent pastes when it presents an order. */
const onward = (l) => `${l.kind === "out" ? `out to ${AIRPORT[l.code].label} · ` : ""}${legBody(l)}${halvesTxt(l)}`;
function shapeTable(P, opt, name, stamp) {
  const t = P.totals, L = [], o = P.opt || opt;
  L.push(`**${name || chain(P.stops)}** · ${t.nights} nights · ${t.checkins} check-ins · in ${apLabel(o.in)}, out ${apLabel(o.out)}${stamp ? ` · run ${stamp}` : ""}`, "");
  L.push("| Stop | Nights | Onward |", "|---|---|---|");
  let li = 0;
  if (o.in) { const l = P.legs[li++]; L.push(`| in from ${AIRPORT[l.code].label} | — | ${onward(l)} |`); }
  P.stops.forEach((st) => { const l = P.legs[li++]; L.push(`| ${st.name} | ${nightsCell(st)} | ${l ? onward(l) : "—"} |`); });
  return L.join("\n");
}

/* ───────────── 8. commands ───────────── */
function cmdPlan(spec, opt) { const P = buildPlan(parseStops(spec), opt); if (opt.json) return JSON.stringify(P, null, 1);
  if (opt.before) return `\`plan\` prices one stop string and has no Before: for a before-and-after, run \`compare "${opt.before}" "${spec}"\`${opt.in || opt.out ? ` with the same \`--in\`/\`--out\`` : ""}.\n\n` + cmdPlan(spec, Object.assign({}, opt, { before: undefined }));
  /* a heavy route carries its lighter shape, found by the engine, never by hand (2026-09-13) */
  const lt = lighterLine(P, opt); return printPlan(P, opt) + (lt ? `\n\n${lt}` : ""); }
const MAX_ORDER_STOPS = 10, MAX_SEQUENCES = 60000;
function cmdOrders(spec, opt) {
  const stops = parseStops(spec); if (stops.length > MAX_ORDER_STOPS) throw new Error(`orders: at most ${MAX_ORDER_STOPS} stops`);
  const id = runId(stopString(stops), opt);
  /* the first stop stays first when the arrival airport is given; the last stays last only when the departure
   * airport is fixed — otherwise every stop may end the trip and the nearest exit is found for each order */
  const pinFirst = !!opt.in, pinLast = !!opt.out;
  const first = pinFirst ? [stops[0]] : [], last = pinLast ? [stops[stops.length - 1]] : [];
  const pool = stops.slice(pinFirst ? 1 : 0, pinLast ? stops.length - 1 : stops.length);
  const seqs = [], seen = new Set(); let explored = 0, truncated = false;
  /* depth-first over the pool, nearest-first, pruned where a partial order already doubles back or repeats a loc */
  function extend(seq, used) {
    if (seqs.length >= MAX_SEQUENCES) { truncated = true; return; }
    if (used.length === pool.length) { const full = seq.concat(last); if (last.length && last[0].loc === seq[seq.length - 1].loc) return;
      if (full.length >= 3 && backtracksAt(full, full.length - 1) === "violation") return;
      const key = full.map((s) => s.loc + ":" + s.nights + (s.roomOnly ? "r" : "")).join(","); if (seen.has(key)) return; seen.add(key); seqs.push(full); return; }
    const lastStop = seq[seq.length - 1];
    const next = pool.map((s, i) => [s, i]).filter(([, i]) => !used.includes(i))
      .sort(([a], [b]) => (km(coord(lastStop && lastStop.loc), coord(a.loc)) || 0) - (km(coord(lastStop && lastStop.loc), coord(b.loc)) || 0));
    for (const [s, i] of next) { explored++;
      if (lastStop && s.loc === lastStop.loc) continue;
      const cand = seq.concat(s); if (cand.length >= 3 && backtracksAt(cand, cand.length - 1) === "violation") continue;
      extend(cand, used.concat(i)); }
  }
  extend(first, []);
  const cands = seqs.map((seq) => buildPlan(seq, opt));
  cands.forEach((P) => { P.violations = P.checks.filter((c) => c.level === "violation").length; P.flagged = P.checks.some((c) => c.level === "flag"); });
  const rank = (a, b) => (a.totals.unsourced ? 1 : 0) - (b.totals.unsourced ? 1 : 0) || a.violations - b.violations
    || a.totals.hoursCapped - b.totals.hoursCapped || a.totals.changes - b.totals.changes || (stopString(a.stops) < stopString(b.stops) ? -1 : 1);
  cands.sort(rank);
  const clean = cands.filter(isClean), rest = cands.filter((P) => !isClean(P));
  const top = clean.slice(0, 3), notOffered = rest.slice(0, Math.max(3 - top.length, 0) || (clean.length ? 0 : 3));
  const allHeavy = top.length > 0 && top.every((P) => P.flagged);
  if (opt.json) return JSON.stringify({ run: id, stops: stopString(stops), considered: cands.length, clean: clean.length, truncated,
    orders: top.map((P) => ({ order: chain(P.stops), stops: P.stops, totals: P.totals, checks: P.checks, opt: P.opt })),
    notOffered: notOffered.map((P) => ({ order: chain(P.stops), totals: P.totals, checks: P.checks.filter((c) => c.level === "violation") })) }, null, 1);
  const L = [`*Run ${id} · stops \`${stopString(stops)}\`${opt.repeat ? " (repeat visit)" : ""} · ${cands.length} order${cands.length === 1 ? "" : "s"} priced (those that double back were pruned first)${first.length ? `, ${first[0].name} first` : ""}${last.length ? `, ${last[0].name} last` : ""}${truncated ? " (search capped)" : ""} · ${clean.length} without a violation${top.length ? `; the ${top.length === 1 ? "one" : top.length === 2 ? "two" : "three"} lightest by travel per night, shape tables first, then the Order table.` : "."}*`];
  if (top.length < 3) L.push("", `Fewer than three clean orders exist for these stops (${top.length}); the ones below are all there are.${notOffered.length ? " The orders under **Not offered** carry a violation and are never presented." : ""}`);
  if (allHeavy) { const P = top[0]; const fl = P.legs.filter((l) => l.flightH);
    L.push("", `No order of these stops comes under ${DENSITY_MAX} min a night; the lightest is ${chain(P.stops)} at ${P.totals.perNight} min${fl.length ? `, of which ${hm(P.totals.flightHours)} is ${fl.length === 1 ? "a flight" : "flights"} counted at ${FLIGHT_CAP_H}h a leg` : ""}. Say why, and offer to shorten the region or drop a stop.`); }
  top.forEach((P, i) => { L.push("", `#### ${i + 1}${i === 0 ? " · recommended" : ""}`, "", shapeTable(P, opt, null, id), "", `Stop string: \`plan "${stopString(P.stops)}"\``);
    P.checks.forEach((c) => L.push(`- ${mark(c)} ${c.msg}`)); });
  if (top[1]) { const a = top[0].totals, b = top[1].totals, dh = b.hours - a.hours, dx = b.changes - a.changes;
    const diff = [b.oneNighters !== a.oneNighters ? `${b.oneNighters} one-nighter${b.oneNighters === 1 ? "" : "s"} against ${a.oneNighters}` : "", b.innNights !== a.innNights ? `${b.innNights} inn nights against ${a.innNights}` : ""].filter(Boolean).join(", ");
    L.push("", `Runner-up: ${chain(top[1].stops)} costs ${dh > 0 ? "+" : "−"}${hm(Math.abs(dh))}${dx ? ` and ${dx > 0 ? "+" : "−"}${Math.abs(dx)} change${Math.abs(dx) === 1 ? "" : "s"}` : ""}; ${diff || "the same check-ins, inn nights and one-nighters"}.`); }
  if (top.length) { L.push("", `**Order table** · run ${id} · stops \`${stopString(stops)}\``, "", ...ORDER_HEAD); top.forEach((P, i) => L.push(orderRow(P, chain(P.stops), i === 0))); }
  if (notOffered.length) { L.push("", `**Not offered** · run ${id} · stops \`${stopString(stops)}\` — each carries a violation or an unsourced leg`, "", "| Order | Hours | Per night | Why not |", "|---|---|---|---|");
    notOffered.forEach((P) => { const why = P.totals.unsourced ? `contains ${P.totals.unsourced} unsourced leg${P.totals.unsourced > 1 ? "s" : ""}` : P.checks.filter((c) => c.level === "violation").map((c) => c.msg.replace(/ — .*$/, "")).join("; ");
      L.push(`| ${chain(P.stops)} | ${hoursTxt(P.totals)} | ${P.totals.unsourced ? `≥ ${P.totals.perNight} min (partial)` : P.totals.perNight + " min"} | ${why} |`); }); }
  if (cands.length && !clean.length) { const shared = cands[0].checks.filter((c) => c.level === "violation").map((c) => c.msg.replace(/ — .*$/, "")).filter((m) => cands.every((P) => P.checks.some((c) => c.msg.replace(/ — .*$/, "") === m)));
    L.push("", `Every order of these stops carries a violation${shared.length ? `; all of them share: ${shared.join("; ")}` : ""}. Change the stop string — a city split in two (\`sapporo:2,…,sapporo:1\`), a room-only night (\`:1r\`), or a stop dropped — and run again.`); }
  if (!cands.length) L.push("", "No order could be built: every arrangement of these stops doubles back on itself.");
  return L.join("\n");
}
function cmdConnectors(a, b, opt) {
  const A = resolveLoc(a), Bl = resolveLoc(b), direct = leg(A, Bl), rows = [];
  Object.keys(RYK).forEach((k) => { const r = RYK[k]; if (r.hide || !r.loc || r.loc === A || r.loc === Bl) return;
    if (!onShortlist(k)) return;   // the master-table filter: an inn the kit's shortlist omits is never a connector (fixlist 20)
    const li = leg(A, r.loc), lo = leg(r.loc, Bl); if (li.estimated || lo.estimated) return;
    if ([li, lo].some((l) => l.flightH || l.mode === "flight")) return;   // a journey made by air has no connector
    const detour = direct.estimated ? null : li.h + lo.h - direct.h; const sc = SYNTH[k] && typeof SYNTH[k].overall === "number" ? SYNTH[k].overall : -1;
    rows.push({ inn: k, name: r.name, where: r.where, loc: r.loc, key: r.loc, place: placeOf(r.loc), slug: slugOf(k), score: sc, legIn: li, legOut: lo, detour, free: detour !== null && detour <= 1.5 }); });
  rows.sort((x, y) => (x.detour == null ? 99 : x.detour) - (y.detour == null ? 99 : y.detour) || y.score - x.score);
  const perPlace = Object.values(rows.reduce((m, r) => { if (!m[r.loc] || m[r.loc].score < r.score) m[r.loc] = r; return m; }, {})).sort((x, y) => (x.detour == null ? 99 : x.detour) - (y.detour == null ? 99 : y.detour));
  const free = perPlace.filter((r) => r.free);   // the kit's rule: marked rows appear only where a pair has no free connector at all
  const shown = opt.all ? rows : free.length ? free : perPlace.slice(0, 3);
  if (opt.json) return JSON.stringify({ from: A, to: Bl, direct, connectors: shown }, null, 1);
  const dTxt = direct.estimated ? "to confirm" : `${hm(direct.h)}/${direct.x} ${direct.mode}${direct.source !== "table" ? ` (${direct.source})` : ""}`;
  const L = [`*${label(A)} → ${label(Bl)}: direct ${dTxt}. ${shown.length} inn${shown.length === 1 ? "" : "s"} ${opt.all ? "with both legs researched" : free.length ? "within 1h30 of the direct journey, best-scored per place" : "— none free; the three nearest stops"} (--all for every inn). The stop key is what goes in a stop string: \`${shown[0] ? shown[0].key : "<key>"}:1\`.*`, ""];
  L.push("| From → To | Direct | Connector inn | Stop key | Leg in | Leg out | Detour |", "|---|---|---|---|---|---|---|");
  const lg = (l) => `${hm(l.h)}/${l.x} ${l.mode}${l.source === "table" ? "" : " (two researched halves)"}`;
  shown.forEach((r) => L.push(`| ${label(A)} → ${label(Bl)} | ${direct.estimated ? "to confirm" : `${hm(direct.h)}/${direct.x}`} | [${r.name}](https://ryokancatalog.com/inn/${r.slug}) · ${r.where} | \`${r.key}\`${r.place.unlisted ? " (no card line)" : ""} | ${lg(r.legIn)} | ${lg(r.legOut)} | ${r.detour == null ? "—" : r.detour <= 0 ? "none" : "+" + hm(r.detour)}${r.free ? "" : " · a stop, not a free connector"} |`));
  if (!shown.length) L.push("", `No inn has researched legs to both ${label(A)} and ${label(Bl)} — say so rather than placing one silently.`);
  return L.join("\n");
}
function cmdExit(q, opt) { const loc = resolveLoc(q), ranked = airportsRanked(loc);
  if (opt.json) return JSON.stringify({ loc, airports: ranked }, null, 1);
  if (!ranked.length) return `No airport has a researched leg from ${label(loc)} — say so, and look the transfer up on a timetable.`;
  const two = ranked.slice(0, 2).map((a) => `**${a.label}** · ${hm(a.leg.h)} · ${chg(a.leg.x)} · ${a.leg.mode} · ${a.cls}`);
  const L = [`Nearest exits from ${label(loc)}: ${two.join("; then ")}.`, "", "| Airport | Door to door | Changes | Mode | Source | Flights |", "|---|---|---|---|---|---|"];
  ranked.forEach((a) => { const hr = hanedaRow(a.code);
    L.push(`| ${a.label} | ${hm(a.leg.h)} | ${a.leg.x} | ${a.leg.mode} | ${a.leg.source}${halvesTxt(a.leg)} | ${a.cls}${!a.intl && hr ? ` (${hm(hr.t[0])} · ${hr.t[1] ? chg(hr.t[1]) : "direct"})` : ""} |`); });
  L.push("", ranked[0].leg.text); return L.join("\n"); }
function cmdLegs(a, b, opt) {
  if (!a || !b) throw new Error("legs needs two places, e.g. `legs tokyo nikko`");
  const A = resolveLoc(a), Bl = resolveLoc(b), l = leg(A, Bl);
  if (opt.json) return JSON.stringify({ from: A, to: Bl, leg: l }, null, 1);
  if (l.estimated) return `${label(A)} → ${label(Bl)}: **to confirm** — no researched leg, even through a hub. Look it up on a timetable and label it estimated.`;
  const L = [`${label(A)} → ${label(Bl)}: **${hm(l.h)}** · ${chg(l.x)} · ${l.mode} · ${l.source}`, "", l.text];
  (l.alternatives || []).forEach((x) => L.push("", `Alternative: ${hm(x.h)} · ${chg(x.x)} · ${x.mode} · ${x.source} — the shorter leads; this one is printed for a ticket that needs it.`));
  return L.join("\n"); }

/* ───────────── 8b. spines: the nine route spines and their decisions (2026-09-12) ─────────────
 * ./spines.json is the kit's route paradigm as data (see its _about): a spine is an ordered list of major
 * cities with typed decisions inline — CITY, RYOKAN (`inn`), STOP, END — each a small set of options that
 * add places to the route. Nothing here invents a night count or a time: an assembly is a stop string,
 * nights come from places.json (ideal low; a repeated city splits 3/2 for Tokyo, 2/1 otherwise, the later
 * visit at one night only when it is the airport-side night), `--nights loc=N` and `--total N` move them
 * inside the ranges, and every assembly is priced and checked through buildPlan like any pasted plan. */
let SPINES = null;
try { const sj = path.join(DIR, "spines.json"); if (fs.existsSync(sj)) SPINES = JSON.parse(fs.readFileSync(sj, "utf8")).spines; } catch (e) { SPINES = null; }
/* Stage 1's draws, with `onsen` and `craft` first-class (fixlist B3) and the interview's longer phrasings accepted */
const DRAWS = ["food", "temples", "nature", "onsen", "craft", "city", "pop", "art", "snow", "coast", "kyushu", "hokkaido", "kansai", "hokuriku", "tohoku", "setouchi"];
/* a region named as a draw outranks every taste draw (QA round 9: a couple who said Kyushu was offered the Kanazawa Loop first) */
const REGION_DRAWS = ["kyushu", "hokkaido", "kansai", "hokuriku", "tohoku", "setouchi"];
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const monthOf = (v) => { if (v == null || v === "") return null; const n = +v; if (n >= 1 && n <= 12) return n; const i = MONTHS.findIndex((m) => m.startsWith(norm(String(v)).slice(0, 3))); return i >= 0 ? i + 1 : null; };
const DRAW_ALIAS = { "hot springs": "onsen", "hot spring": "onsen", "hotsprings": "onsen", "baths": "onsen", "design": "craft", "crafts": "craft", "craft towns": "craft",
  "islands": "coast", "island": "coast", "cities": "city", "big city": "city", "history": "temples", "gardens": "temples", "skiing": "snow", "ski": "snow", "winter": "snow",
  "pop culture": "pop", "nature and hot springs": "nature", "food and drink": "food", "temples gardens and history": "temples", "art craft and design": "art", "coast and islands": "coast", "big city energy": "city",
  "volcanoes": "nature", "volcano": "nature", "kyoto": "kansai", "osaka": "kansai", "kanazawa": "hokuriku", "the north": "tohoku", "north": "tohoku", "inland sea": "setouchi", "the inland sea": "setouchi", "seto": "setouchi", "snow country": "snow" };
const normDraw = (d) => { const n = norm(d); return DRAW_ALIAS[n] || n; };
const KIND_LABEL = { city: "CITY", inn: "RYOKAN", stop: "STOP", end: "END" };
const defined = (o) => Object.fromEntries(Object.entries(o || {}).filter(([, v]) => v !== undefined && v !== null && v !== false));
const rangeOf = (loc, opt) => { const p = placeOf(loc); return (opt && opt.repeat && p.repeat) || p.ideal; };
/* the most nights a place takes unasked: one over its ideal top, or the place's own `max` where the kit caps it lower
 * (2026-09-12: Kagoshima caps at 3 — four nights there is too many) */
const capOf = (loc, opt) => { const p = placeOf(loc), r = rangeOf(loc, opt); return p.max ? Math.min(p.max, r[1] + 1) : r[1] + 1; };
/* hours to the nearest five minutes with one mode word — the timeline's leg cell (never a transfer count; those stay in the checks) */
const hm5 = (h) => { let m = Math.round((h * 60) / 5) * 5; if (m === 0 && h > 0) m = 5; const H = Math.floor(m / 60), M = m % 60; return H ? `${H}h${M ? String(M).padStart(2, "0") : ""}` : `${M} min`; };
const modeWord = (m) => { const s = String(m || "").toLowerCase(); return /flight|fly|plane/.test(s) ? "flight" : /car|taxi|drive/.test(s) ? "taxi" : /ferry|boat/.test(s) ? "ferry" : /bus|coach/.test(s) ? "bus" : "train"; };
const legWord = (l) => (l.estimated ? "to confirm" : `${hm(l.h)} ${modeWord(l.mode)}`);

function spineOf(ref) {
  if (!SPINES) throw new Error("no spines.json beside route.js — the spine commands need the kit build's copy");
  const q = norm(ref).replace(/ /g, ""), nq = norm(ref).replace(/[^a-z0-9 ]/g, " ").trim();
  /* a spine is asked for by its name — the whole name, or any word of it four letters or longer that only one
   * spine carries ("kanazawa", "classic", "hokkaido") — so the id never has to be shown to anyone (2026-09-12) */
  const words = (s) => norm(s.name).replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length >= 4);
  const qw = nq.split(/\s+/).filter((w) => w.length >= 4);
  const hit = SPINES.find((s) => s.id === q || s.id === "s" + q || s.id === q.replace(/^spine/, "s"))
    || SPINES.find((s) => norm(s.name).replace(/[^a-z0-9 ]/g, " ").trim() === nq)
    || (() => { const m = qw.length ? SPINES.filter((s) => qw.every((w) => words(s).includes(w))) : []; return m.length === 1 ? m[0] : null; })()   // "south east" → Kyushu South & East
    || (() => { const m = SPINES.filter((s) => qw.some((w) => words(s).includes(w))); return m.length === 1 ? m[0] : null; })();
  if (!hit) throw new Error(`unknown spine "${ref}" — one of ${SPINES.map((s) => `"${s.name}"`).join(", ")} (any single word of a name will do)`);
  return hit;
}
/* ── the decision model (v2, 2026-09-13): decisions belong to cities and legs ──
 * spines.json holds `cities` (the spine, in trip order — a fixed loc or a CITY switch), `attach` (a yes/no night
 * that belongs to one city), `legs` (the yes/no slots that sit on the leg between two cities) and `end`. The engine
 * derives ONE flat decision list from that, so everything downstream — `--set`, the fixture, the printers, the
 * explorer — sees the same shape it always did: {kind, key, question, options[], default, on_at?, owner}. An
 * attachment or a slot is two options, Yes and No; `owner` says where it is printed (a city, a leg, the end).
 * Placement is by construction: an attachment sits at its own city, a slot inside its own leg, so nothing can
 * land before Kyoto and two ryokan on two legs are two separate answers. */
const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const legKeyOf = (lg) => lg.key || `${asList(lg.from)[0]}-${asList(lg.to)[0]}`;
const NO_DESC = "Straight through.";
const DEC = new WeakMap();
/* a yes/no decision — an attachment (`at` says how it sits at its city) or a leg slot (inside its leg) */
/* a slot's wording can carry a reversed reading (question_rev / desc_rev / no_rev): "on the way west" is "on the way east"
 * when the trip runs the other way (QA round 9: reversed Classic and Kanazawa Loop read forwards) */
const yesNoDecision = (y, owner) => ({ kind: y.kind || "stop", key: y.key, question: y.question, question_rev: y.question_rev, default: y.default == null ? 1 : y.default,
  on_at: y.on_at, owner, options: [
    defined({ label: "Yes", desc: y.desc, stops: y.stops || [], requires: y.requires, not_with: y.not_with, or_in: y.or_in, why_not: y.why_not,
      in: y.in, out: y.out, needCity: owner.type === "city" ? owner.city : undefined, needLeg: owner.type === "leg" ? { from: owner.from, to: owner.to } : undefined,
      label_rev: y.desc_rev || y.no_rev ? "Yes" : undefined, desc_rev: y.desc_rev }),
    defined({ label: "No", desc: y.no || NO_DESC, stops: [], label_rev: y.desc_rev || y.no_rev ? "No" : undefined, desc_rev: y.no_rev })] });
/* a CITY switch's options carry `cities`; `stops` mirrors them so every reader downstream can treat an option alike */
const cityDecision = (e) => Object.assign({}, e, { owner: { type: "city" },
  options: e.options.map((o) => Object.assign({}, o, { stops: o.cities || [] })) });
function decisionsOf(sp) {
  const cached = DEC.get(sp); if (cached) return cached;
  const out = [], attach = sp.attach || [], legs = sp.legs || [], doneA = new Set(), doneL = new Set();
  const push = (locs) => {
    attach.forEach((a, i) => { if (doneA.has(i) || !asList(a.city).some((c) => locs.includes(c))) return; doneA.add(i);
      out.push(yesNoDecision(a, { type: "city", city: asList(a.city), at: a.at || "after" })); });
    legs.forEach((lg, i) => { if (doneL.has(i) || !asList(lg.from).some((c) => locs.includes(c))) return; doneL.add(i);
      const owner = { type: "leg", key: legKeyOf(lg), from: asList(lg.from), to: asList(lg.to) };
      (lg.slots || []).forEach((s) => out.push(yesNoDecision(Object.assign({}, s, { key: `${legKeyOf(lg)}.${s.key}` }), owner))); });
  };
  const entryLocs = (e) => (typeof e === "string" ? [e] : e.options.flatMap((o) => o.cities || []));
  for (const e of sp.cities || []) { if (typeof e !== "string") out.push(cityDecision(e)); push(entryLocs(e)); }
  /* an attachment or a leg whose city only a later decision can produce is still a decision of the spine */
  push(attach.flatMap((a) => asList(a.city)).concat(legs.flatMap((lg) => asList(lg.from)), legs.flatMap((lg) => asList(lg.to))));
  if (sp.end) out.push(Object.assign({}, sp.end, { owner: { type: "end" } }));
  DEC.set(sp, out); return out;
}
const decisionOf = (sp, key) => decisionsOf(sp).find((d) => d.key === key);
/* every loc a spine can put on a route — its cities, its attachments, its leg slots, its END options */
const spineLocs = (sp) => [...new Set(decisionsOf(sp).flatMap((d) => d.options.flatMap((o) => o.stops || []))
  .concat((sp.cities || []).filter((e) => typeof e === "string")))];
/* the option taken on each decision: an explicit --set, else the stop that switches on at the requested total (`on_at`),
 * else a repeat visitor's straight-in start, else the spine's default */
function choicesOf(sp, sets, total, repeat, apIn, apOut) {
  const ch = {};
  for (const d of decisionsOf(sp)) {
    let i = d.default || 0;
    if (repeat && d.key === "start" && d.options.length > 1) i = 1;
    /* a booked arrival airport picks the START option that declares that same `in` — a Kansai ticket implies straight into Kansai */
    /* …unless the ticket home leaves from somewhere that start would never reach: a KIX-in / HND-home Classic is the
     * Tokyo route run the other way round, not a trip without Tokyo (QA round 8) */
    if (apIn && d.key === "start") { const ok = (o) => o.in === apIn && !(apOut && o.out && o.out !== apOut && ((AIRPORT[apOut] || {}).hubs || []).includes("tokyo"));
      let j = d.options.findIndex((o) => ok(o) && (!apOut || !o.out || o.out === apOut)); if (j < 0) j = d.options.findIndex(ok); if (j >= 0) i = j; }
    /* a booked flight home picks the ending that lands there: the option that declares that `out`, or the one whose last
     * stop is that airport's own city — a Haneda ticket home from Kyushu closes with two Tokyo nights (QA round 8) */
    /* …only an ending that declares that airport: the trip may close anywhere with a same-day hop to the ticket, so a
     * Haneda return does not take the Tokyo close by itself — it is offered (owner, 2026-09-12: "why is Tokyo split?") */
    if (apOut && d.key === "end" && sp.out !== apOut) {
      const j = d.options.findIndex((o) => o.out === apOut);
      if (j >= 0 && !(d.options[j].in && apIn && d.options[j].in !== apIn)) i = j; }
    if (d.on_at && total && total >= d.on_at) i = 0;
    if (sets && sets[d.key] != null) i = sets[d.key];
    ch[d.key] = i;
  }
  return ch;
}
function optionIndex(d, want) {
  const s = String(want).trim();
  if (/^\d+$/.test(s)) { const i = +s - 1; if (!d.options[i]) throw new Error(`${d.key}: option ${s} does not exist — ${d.options.map((o, j) => `${j + 1} ${o.label}`).join(" · ")}`); return i; }
  const n = norm(s);
  let i = d.options.findIndex((o) => norm(o.label) === n);
  if (i < 0 && /^(y|yes|on|true)$/.test(n)) i = d.options.findIndex((o) => norm(o.label) === "yes");
  if (i < 0 && /^(n|no|off|none|false)$/.test(n)) i = d.options.findIndex((o) => norm(o.label) === "no");
  if (i < 0) { const c = d.options.map((o, j) => [o, j]).filter(([o]) => norm(o.label).startsWith(n) || norm(o.label).split(" ").includes(n) || (n.length > 3 && norm(o.label).includes(n)));
    if (c.length === 1) i = c[0][1]; else if (c.length > 1) throw new Error(`${d.key}: "${want}" matches ${c.map(([o]) => o.label).join(" and ")} — say which`); }
  if (i < 0) throw new Error(`${d.key}: no option "${want}" — ${d.options.map((o, j) => `${j + 1} ${o.label}`).join(" · ")}`);
  return i;
}
/* `--set key=option`: a switch by its label or its number, a yes/no by `yes`/`no` or its number. Keys are the decision's
 * own — `start`, `kansai`, `end`, `tokyo.nikko` (a city's attachment), `tokyo-kanazawa.yudanaka` (a leg's slot). */
function parseSets(sp, list) {
  const out = {};
  for (const item of (list || []).flatMap((s) => String(s).split(/,(?=[a-z_][a-z_.\-]*=)/i))) {
    const m = /^\s*([^=]+)=(.+)$/.exec(item); if (!m) throw new Error("--set takes key=option, e.g. --set tokyo.nikko=yes or --set kansai=osaka");
    const key = norm(m[1]).replace(/ /g, ""), d = decisionsOf(sp).find((x) => norm(x.key).replace(/ /g, "") === key);
    if (!d) throw new Error(`spine ${sp.id} has no decision "${m[1].trim()}" — its decisions are ${decisionsOf(sp).map((x) => x.key).join(", ")}`);
    out[d.key] = optionIndex(d, m[2]);
  }
  return out;
}
/* the spine's cities for one set of choices, in trip order. A `reverse` option turns the middle round (a leading or
 * trailing Tokyo stays put, because that is still where the trip lands); --reverse turns the whole trip round, and the
 * two cancel — a spine asked to reverse its own reversal runs its own way. */
function orderedCities(sp, choices, forceReverse) {
  let list = [], order = null;
  const byKey = {};
  let reverse = !!forceReverse;
  for (const e of sp.cities || []) {
    if (typeof e === "string") { list.push(e); continue; }
    const d = decisionOf(sp, e.key), o = d && d.options[choices[e.key]];
    if (!o) throw new Error(`${sp.id}/${e.key}: no option ${choices[e.key]}`);
    if (o.reverse) reverse = !reverse;
    if (o.order) order = o.order;
    byKey[e.key] = o.cities || [];
    (o.cities || []).forEach((c) => list.push(c));
  }
  /* an option with `order` runs the ring from another city: Kyushu opens wherever the ticket lands (NGS, OIT), the
   * cities in the order it names — a city key stands for whatever that decision chose (QA round 9, owner) */
  if (order) list = order.flatMap((k) => (byKey[k] ? byKey[k] : [k]));
  let cl = list;
  if (reverse && forceReverse) cl = cl.slice().reverse();
  else if (reverse) { const head = []; while (cl.length && cl[0] === "tokyo") head.push(cl.shift());
    const tail = []; while (cl.length && cl[cl.length - 1] === "tokyo") tail.unshift(cl.pop()); cl = head.concat(cl.slice().reverse(), tail); }
  return { cities: cl, reversed: reverse };
}
/* is the leg between these two cities the one this slot sits on? A leg reads in the direction spines.json declares it —
 * so a `to` city that also appears earlier on the spine (Kanazawa → Kyoto | Osaka | Tokyo) cannot be mistaken for the
 * leg that arrives — and the other way round on an assembly that runs the middle backwards. */
const legJoins = (owner, a, b, reversed) => (reversed ? owner.from.includes(b) && owner.to.includes(a) : owner.from.includes(a) && owner.to.includes(b));
/* the loc sequence for one set of choices: the cities in trip order, each city's attachments beside it, each leg's
 * chosen slots between its two cities, the END night last. Adjacent repeats merge. */
function assembleOnce(sp, choices, forceReverse) {
  const { cities: cl, reversed } = orderedCities(sp, choices, forceReverse), ds = decisionsOf(sp), missing = [];
  const chosen = (d) => d.options[choices[d.key]];
  const atFor = {};
  for (const d of ds) {
    if (d.owner.type !== "city" || !d.owner.city) continue;
    const o = chosen(d); if (!o || !(o.stops || []).length) continue;
    const loc = d.owner.city.find((c) => cl.includes(c));
    if (loc == null) { missing.push({ key: d.key, needs: d.owner.city[0] }); continue; }
    const i = cl.indexOf(loc); (atFor[i] = atFor[i] || []).push({ d, o, at: d.owner.at });
  }
  const seq = [], usedLeg = new Set();
  /* `before` and `after` read in trip direction: run the other way round, a night "on the way in" to a city is a night
   * on the way out of it (QA round 8: Kirishima, before Kagoshima, was the arrival night of every reversed Kyushu trip) */
  const side = (x) => (reversed && x.at !== "split" ? (x.at === "before" ? "after" : "before") : x.at);
  cl.forEach((c, i) => {
    const at = atFor[i] || [];
    at.filter((x) => side(x) === "before").forEach((x) => x.o.stops.forEach((l) => seq.push(l)));
    seq.push(c);
    at.filter((x) => side(x) !== "before").forEach((x) => { x.o.stops.forEach((l) => seq.push(l)); if (x.at === "split") seq.push(c); });
    if (i === cl.length - 1) return;
    /* every leg whose two cities these are, in the order spines.json declares them, its slots in their declared order;
     * a leg is walked once, even on a route that comes back to the same city */
    for (const d of ds) {
      if (d.owner.type !== "leg" || usedLeg.has(d.owner.key) || !legJoins(d.owner, c, cl[i + 1], reversed)) continue;
      const o = chosen(d); if (o && (o.stops || []).length) o.stops.forEach((l) => seq.push(l));
    }
    for (const d of ds) if (d.owner.type === "leg" && legJoins(d.owner, c, cl[i + 1], reversed)) usedLeg.add(d.owner.key);
  });
  /* the END night is always the last one; its `place: after <loc>|<loc>` says which city it has to follow, not where it sits */
  /* an attachment whose city is a stop another decision put on the route (Amakusa off Kumamoto, itself a leg slot)
   * sits beside that stop once it is there, never beside an END night (QA round 8: it was refused as "not on this route" after Kumamoto was taken) */
  missing.slice().forEach((m) => { const d = ds.find((x) => x.key === m.key), o = chosen(d); const i = seq.findIndex((l) => d.owner.city.includes(l)); if (i < 0) return;
    if (side({ at: d.owner.at }) === "before") seq.splice(i, 0, ...o.stops); else seq.splice(i + 1, 0, ...o.stops); missing.splice(missing.indexOf(m), 1); });
  const endD = ds.find((d) => d.owner.type === "end");
  /* run the other way round, the END night is the FIRST one — the trip starts where it would have ended (QA round 6: a
   * reversed Kyushu route landed its Unzen ending across the country) — unless the END is Tokyo, which stays put */
  if (endD) { const o = chosen(endD); if (o && (o.stops || []).length) { if (reversed && o.stops[0] !== "tokyo") seq.unshift(...o.stops); else o.stops.forEach((l) => seq.push(l)); } }
  const out = []; seq.forEach((l) => { if (out[out.length - 1] !== l) out.push(l); });
  return { locs: out, cities: cl, reversed, missing };
}
/* is this option offered, given what the rest of the assembly is? An attachment needs its city on the route, a slot needs
 * its leg, `requires` must all be there, `not_with` none, an END option's `place` names a city it must follow. Returns
 * null when available, else the reason. */
function whyNot(sp, d, o, choices, opt) {
  /* an option that flies through an airport the ticket does not use is withheld, with the ticket as the reason (QA round 8:
   * Kinosaki "then Itami airport" was offered against a booked Kansai ticket, and a reversed Classic on a Haneda return
   * offered "Arrive at Kansai"); run the other way round, an option's `in` is where the trip leaves and its `out` where it lands */
  if (opt && (opt.in || opt.out)) { const tin = opt.reverse ? o.out : o.in, tout = opt.reverse ? o.in : o.out;
    if (opt.in && tin && tin !== opt.in && AIRPORT[opt.in]) return `the ticket lands at ${AIRPORT[opt.in].label}, not ${AIRPORT[tin] ? AIRPORT[tin].label : tin}`;
    /* a START option's `out` is where its loop happens to finish, not the point of the option: a Kagoshima round trip still
     * starts straight into Kagoshima and the ticket prices the last leg (QA round 9, r02) */
    if (opt.out && tout && tout !== opt.out && AIRPORT[opt.out] && d.key !== "start") return `the ticket home is from ${AIRPORT[opt.out].label}, not ${AIRPORT[tout] ? AIRPORT[tout].label : tout}`;
    /* the plain "fly home from the last city" ending stays offered on a ticket home from elsewhere: a same-day flight to
     * the ticket's airport is a fine close (owner, 2026-09-12); the Tokyo close is the default there, never forced */ }
  /* a booked flight into the region waives the option's `requires` guard (spines.json `or_in`) */
  const waived = !!(o.or_in && opt && opt.in && o.or_in.includes(opt.in));
  const trial = Object.assign({}, choices);
  const empty = d.options.findIndex((x) => !(x.stops || []).length && !x.reverse);
  if (empty >= 0) trial[d.key] = empty;
  /* a CITY switch has no empty option: judge its guards against an option that shares none of its cities, so an option
   * never blocks itself (QA round 8: reversed, "Kyoto and Osaka" put Osaka first and tripped its own `not_with osaka@first`) */
  else if (o.cities && d.options.length > 1) { const overlap = (x) => (x.cities || []).filter((c) => o.cities.includes(c)).length;
    let j = -1; d.options.forEach((x, k) => { if (x === o) return; if (j < 0 || overlap(x) < overlap(d.options[j])) j = k; }); if (j >= 0) trial[d.key] = j; }
  let base; try { base = assembleOnce(sp, trial, opt && opt.reverse); } catch (e) { return e.message; }
  const cl = base.cities, rev = base.reversed, there = new Set(base.locs);
  /* `loc@first` and `loc@last` ask where the place sits, not only whether it is there: a night that would double back
   * can be withheld from a trip that ENDS at a place without being withheld from every trip that includes it */
  const has = (l) => (/@first$/.test(l) ? base.locs[0] === l.replace(/@first$/, "")
    : /@last$/.test(l) ? base.locs[base.locs.length - 1] === l.replace(/@last$/, "") : there.has(l));
  const need = waived ? [] : (o.requires || []).filter((l) => !has(l)), clash = (o.not_with || []).filter((l) => has(l));
  let struct = null;
  const endStops = new Set(((decisionsOf(sp).find((x) => x.owner.type === "end") || {}).options || []).flatMap((x) => x.stops || []));
  if (o.needCity && !o.needCity.some((c) => cl.includes(c) || (there.has(c) && !endStops.has(c)))) struct = `${label(o.needCity[0])} is not on this route`;
  if (o.needLeg && !cl.some((c, i) => i < cl.length - 1 && legJoins(o.needLeg, c, cl[i + 1], rev)))
    struct = `the leg from ${label(o.needLeg.from[0])} to ${label(o.needLeg.to[0])} is not on this route`;
  const anchors = o.place ? String(o.place).split(/\s+/)[1].split("|") : [];
  const anchorMissing = !!anchors.length && !anchors.some((a) => there.has(a));
  if (!need.length && !clash.length && !anchorMissing && !struct) return null;
  const named = (l) => label(l.replace(/@(first|last)$/, "")) + (/@first$/.test(l) ? " first" : /@last$/.test(l) ? " last" : "");
  return o.why_not || struct || (need.length ? `needs ${need.map(named).join(" and ")} on the route`
    : clash.length ? `not with ${clash.map(named).join(" or ")} on the route` : `needs ${label(anchors[0])} on the route`);
}
/* the loc sequence for one set of choices, with unavailable defaults falling back to the decision's no-stop option (or its next
 * option); an unavailable option that was asked for by name is an error. Returns { locs, cities, choices, unavailable[] } */
function assembleLocs(sp, choices, sets, opt) {
  choices = Object.assign({}, choices);
  const unavailable = [], dropped = [];
  for (let pass = 0; pass < 6; pass++) {
    let changed = false;
    for (const d of decisionsOf(sp)) {
      const o = d.options[choices[d.key]], why = whyNot(sp, d, o, choices, opt);
      if (!why) continue;
      /* an answer given for a decision a later answer removed from the route (Amagase, then Beppu instead of Yufuin)
       * is dropped with a note rather than an error, so answers can be given in the order they were asked (QA round 7) */
      if (sets && sets[d.key] != null) { if (!(o.stops || []).length && !o.reverse) throw new Error(`${d.key}=${o.label} is not available here: ${why}`); dropped.push(`${d.key}=${o.label} no longer applies: ${why}`); delete sets[d.key]; }
      const fb = d.options.findIndex((x, j) => j !== choices[d.key] && !(x.stops || []).length && !x.reverse && !whyNot(sp, d, x, choices, opt));
      const next = fb >= 0 ? fb : d.options.findIndex((x, j) => j !== choices[d.key] && !whyNot(sp, d, x, choices, opt));
      if (next < 0) throw new Error(`${sp.id}/${d.key}: no option is available (${why})`);
      choices[d.key] = next; changed = true;
    }
    if (!changed) break;
  }
  for (const d of decisionsOf(sp)) d.options.forEach((o, j) => { if (j === choices[d.key]) return; const why = whyNot(sp, d, o, choices, opt); if (why) unavailable.push({ key: d.key, index: j, label: o.label, why }); });
  const { locs, cities, reversed } = assembleOnce(sp, choices, opt && opt.reverse);
  return { locs, cities, reversed, choices, unavailable, dropped };
}
/* the night defaults: each place at its ideal low (never under one); a repeated city 3 then 2 for Tokyo, its ideal low then
 * one for another city — the later visit at one night only when it is the airport-side night, two otherwise */
function defaultStops(locs, repeat) {
  const count = {}; locs.forEach((l) => { count[l] = (count[l] || 0) + 1; });
  const seen = {};
  return locs.map((loc, i) => {
    const p = placeOf(loc), n = (seen[loc] = (seen[loc] || 0) + 1), range = rangeOf(loc, { repeat });
    let d = Math.max(1, range[0]);
    if (count[loc] > 1 && isBaseKind(p.kind)) {
      const airportSide = n === count[loc] && locs.slice(i + 1).every((l) => !isBaseKind(placeOf(l).kind));
      d = loc === "tokyo" ? (n === 1 ? 3 : 2) : n === 1 ? Math.max(2, range[0]) : airportSide ? 1 : 2;
    }
    return stopOf(loc, d, null, false);
  });
}
/* the band an assembly is read against: the spine's, four nights lower when its Tokyo start was dropped */
function bandOf(sp, locs) {
  const first = (sp.cities || [])[0], startsTokyo = first === "tokyo" || (first && first.options && (first.options[0].cities || [])[0] === "tokyo");
  const drop = startsTokyo && locs[0] !== "tokyo" ? placeOf("tokyo").ideal[0] : 0;
  return [sp.band[0] - drop, sp.band[1] - drop];
}
/* extra nights go to the spine's cities in trip order, one at a time round the list, inside their ranges; fewer nights
 * come off in reverse order down to each place's minimum and the split-visit floor. A total the ranges cannot hold is
 * never refused (2026-09-13): above them the cities fill to the +1 ceiling and the rest is said to be unspent; below
 * them the cities go under their card minimums and that is said. Returns { steps, note } — the record of what moved. */
function fitTotal(stops, N, repeat) {
  const steps = [], total = () => stops.reduce((a, s) => a + s.nights, 0), atLoc = (loc) => stops.filter((s) => s.loc === loc).reduce((a, s) => a + s.nights, 0);
  const bases = stops.map((s, i) => [s, i]).filter(([s]) => isBaseKind(s.kind) && !s.fixedNights);
  let guard = 0;
  while (total() < N && guard++ < 200) {
    let moved = false;
    for (const [s] of bases) { if (total() >= N) break; if (atLoc(s.loc) < rangeOf(s.loc, { repeat })[1]) { s.nights++; moved = true; steps.push(`${label(s.loc)} takes a night (${s.nights - 1} → ${s.nights}, inside its ${rangeOf(s.loc, { repeat }).join("–")})`); } }
    if (!moved) break;
  }
  guard = 0;
  while (total() > N && guard++ < 200) {
    let moved = false;
    for (const [s, i] of bases.slice().reverse()) { if (total() <= N) break;
      const visits = stops.filter((x) => x.loc === s.loc).length, last = stops.map((x) => x.loc).lastIndexOf(s.loc) === i;
      const airportSide = last && stops.slice(i + 1).every((x) => !isBaseKind(x.kind));
      const floor = visits > 1 && !airportSide ? 2 : 1;
      if (s.nights > floor && atLoc(s.loc) > placeOf(s.loc).minimum) { s.nights--; moved = true; steps.push(`${label(s.loc)} gives up a night (${s.nights + 1} → ${s.nights})`); } }
    if (!moved) break;
  }
  /* still short of the count they asked for: the cities take one night each over their usual top, the +1 ceiling */
  guard = 0;
  while (total() < N && guard++ < 200) {
    let moved = false;
    /* in reverse trip order: the last region takes the extra night before the gateway city does */
    for (const [s] of bases.slice().reverse()) { if (total() >= N) break; const top = rangeOf(s.loc, { repeat })[1];
      if (atLoc(s.loc) === top && atLoc(s.loc) < capOf(s.loc, { repeat })) { s.nights++; moved = true; steps.push(`${label(s.loc)} takes one night over its usual ${rangeOf(s.loc, { repeat }).join("–")} (${s.nights - 1} → ${s.nights})`); } }
    if (!moved) break;
  }
  /* asked for fewer than the cities' own minimums: go under them, down to one night a stop, and say so */
  guard = 0;
  while (total() > N && guard++ < 200) {
    let moved = false;
    for (const [s, i] of bases.slice().reverse()) { if (total() <= N) break;
      /* the split-visit floor still holds: a city split in two keeps two nights a visit, unless the second
       * visit is the airport-side night — a one-night half-stay is not a shorter trip, it is a bad one */
      const visits = stops.filter((x) => x.loc === s.loc).length, last = stops.map((x) => x.loc).lastIndexOf(s.loc) === i;
      const airportSide = last && stops.slice(i + 1).every((x) => !isBaseKind(x.kind));
      const floor = visits > 1 && !airportSide ? 2 : 1;
      if (s.nights > floor) { s.nights--; moved = true; steps.push(`${label(s.loc)} gives up a night (${s.nights + 1} → ${s.nights}, under its usual minimum)`); } }
    if (!moved) break;
  }
  const shape = stops.map((s) => `${short(s.loc)} ${s.nights}`).join(", ");
  let note = null;
  if (total() < N) note = { kind: "unspent", n: N - total(), shape };        // every city is full; the rest of the trip is unbooked
  else if (total() > N) note = { kind: "floor", n: total() - N, shape };     // every stop is down to one night and it still holds more
  else if (stops.some((s) => atLoc(s.loc) < placeOf(s.loc).minimum)) note = { kind: "under", shape };
  return { steps, note, shape };
}
/* a total the spine's places cannot hold exactly is assembled anyway and flagged in one plain sentence — the
 * spine's band, what the nights actually are, and the one thing that would fix it (2026-09-13) */
function bandMsg(sp, band, N, note) {
  const runs = `${sp.name} runs ${band[0]}–${band[1]} nights`;
  if (note.kind === "unspent") return `${runs}; at ${N} the places fill to ${N - note.n} (${note.shape}) and ${note.n} night${note.n === 1 ? " is" : "s are"} unspent — add a ryokan or a stop, or give them to a longer trip.`;
  if (note.kind === "floor") return `${runs}; ${N} is shorter than it goes — every stop is down to one night and it still holds ${N + note.n} (${note.shape}). Take a ryokan or a stop off.`;
  return `${runs}; at ${N} it is ${note.shape}, under the city minimums.`;
}
/* one assembly: choices → locs → default nights → --nights overrides → --total → the priced, checked plan */
function assembleSpine(sp, optIn) {
  const opt = Object.assign({}, optIn);
  const sets = parseSets(sp, opt.set);
  const asked = choicesOf(sp, sets, opt.total, opt.repeat, opt.in, opt.out);
  const userSet = Object.assign({}, sets);   // what the user actually asked for by name; the filler below never overrides one
  const droppedSets = [];
  /* the order is fixed (2026-09-13): the chosen options build the route first, then the nights they asked
   * for land on it, then the total — so `--set` and `--nights` on one line always resolve together.
   * One whole assembly for one set of answers: route → default nights → --nights → --total. It is a function
   * because the nights filler below may switch an answer on and ask for the assembly again (2026-09-13). */
  const build = (want) => {
  const A = assembleLocs(sp, want, sets, opt);
  A.dropped.forEach((m) => { if (!droppedSets.includes(m)) droppedSets.push(m); });
  let locs = A.locs, cities = A.cities, reversed = A.reversed, choices = A.choices, unavailable = A.unavailable;
  if (!locs.length) throw new Error(`${sp.id}: the choices leave no stop`);
  let stops = defaultStops(locs, opt.repeat), steps = [];
  /* a city the ENDING adds ("two more Tokyo nights and a Haneda flight home") is a close, not a base: it holds its two
   * nights and the total filler grows the cities before it (owner, 2026-09-12: a 13-night Classic on a Haneda return
   * came back Tokyo 4 · Hakone 1 · Kyoto 5 · Tokyo 3) */
  { const endD = decisionsOf(sp).find((d) => d.owner.type === "end"), eo = endD && endD.options[choices[endD.key]];
    if (eo && (eo.stops || []).length) { const last = eo.stops[eo.stops.length - 1], i = reversed && last !== "tokyo" ? 0 : stops.length - 1;
      if (stops[i] && stops[i].loc === last && isBaseKind(stops[i].kind) && stops.some((s, j) => j !== i && s.loc === last)) { stops[i].nights = 2; stops[i].fixedNights = true; } } }
  const dropped = [];
  for (const ov of opt.nightsAt || []) {
    const m = /^([^=#]+)(?:#(\d+))?=(\d+)(r)?$/.exec(String(ov).trim()); if (!m) throw new Error("--nights takes loc=N (or loc#2=N for a second visit; N r for room only, 0 to drop the stop), e.g. --nights kyoto=5");
    const loc = resolveLoc(m[1]), visits = stops.map((s, i) => [s, i]).filter(([s]) => s.loc === loc);
    if (!visits.length) { if (opt.lenientNights) continue; throw new Error(`${label(loc)} is not a stop of this assembly (${locs.map(short).join(" → ")})`); }
    const v = visits[Math.min((+m[2] || 1) - 1, visits.length - 1)]; const i = v[1];
    /* zero nights is not a stop of no nights, it is no stop (2026-09-13): it leaves the assembly, the
     * legs and the totals, and the trip closes up around it */
    if (+m[3] === 0) { dropped.push(i); steps.push(`${label(loc)} dropped from the route`); continue; }
    stops[i] = stopOf(loc, +m[3], null, !!m[4]); stops[i].fixedNights = true;   // an explicit --nights is never overridden by the total filler (QA round 6)
    steps.push(`${label(loc)} set to ${m[3]} night${+m[3] === 1 ? "" : "s"}${m[4] ? ", room only" : ""}`);
  }
  if (dropped.length) {
    stops = stops.filter((st, i) => !dropped.includes(i));
    if (!stops.length) throw new Error("every stop was dropped — leave at least one place to sleep");
    /* two visits to one city with the stop between them dropped are one visit again */
    const merged = []; stops.forEach((st) => { const prev = merged[merged.length - 1];
      if (prev && prev.loc === st.loc && !prev.inn && !st.inn && prev.roomOnly === st.roomOnly) prev.nights += st.nights; else merged.push(Object.assign({}, st)); });
    stops = merged; locs = stops.map((st) => st.loc);
  }
  /* the default assembly is read at the band's low end at least: extra nights go to the cities in order */
  const band = bandOf(sp, locs), sum = stops.reduce((a, s) => a + s.nights, 0);
  const total = opt.total || (!(opt.nightsAt || []).length && sum < band[0] ? band[0] : null);
  let fitNote = null, fitSteps = [];
  if (total) { const f = fitTotal(stops, total, opt.repeat); fitSteps = f.steps; fitNote = f.note; }
  return { locs, cities, reversed, choices, unavailable, stops, steps, fitSteps, fitNote, total };
  };
  let R = build(asked);
  /* spend the nights asked before handing any back (QA round 10): with every city at its +1 ceiling and nights still
   * over, a knowledgeable friend switches on the ryokan and stop nights this route left off — in trip order, one at a
   * time, re-assembling each time — and then takes an ending that carries nights (the Tokyo close). Only the engine's
   * own defaults move: an answer the user gave by name is never overridden, and nothing is padded past `capOf`. */
  const shortOf = (r) => (r.fitNote && r.fitNote.kind === "unspent" ? r.fitNote.n : 0);
  const switchSteps = [], extra = {};
  if (R.total && shortOf(R)) {
    const take = (d, j, line) => {
      let T; try { T = build(Object.assign({}, asked, extra, { [d.key]: j })); } catch (e) { return null; }
      /* only a switch that spends nights and spends them well: the shortfall has to fall, and the assembly must not
       * end up under the city minimums or over the length asked for */
      if (shortOf(T) >= shortOf(R) || (T.fitNote && T.fitNote.kind !== "unspent")) return null;
      extra[d.key] = j; R = T; switchSteps.push(line); return T;
    };
    const askedAs = (d) => String((R.reversed && d.question_rev) || d.question || "").replace(/\?\s*$/, "").replace(/^./, (c) => c.toLowerCase());
    for (const d of decisionsOf(sp)) {
      if (!shortOf(R)) break;
      if (!(d.kind === "inn" || d.kind === "stop") || userSet[d.key] != null) continue;
      const cur = d.options[R.choices[d.key]]; if (cur && (cur.stops || []).length) continue;   // already on
      const j = d.options.findIndex((o) => (o.stops || []).length);
      if (j < 0 || whyNot(sp, d, d.options[j], R.choices, opt)) continue;
      take(d, j, `${label(d.options[j].stops[0])} switched on to spend the nights asked (${askedAs(d)})`);
    }
    /* still short: the ending that carries nights, the one that spends most of what is left */
    const endD = decisionsOf(sp).find((d) => d.owner.type === "end");
    if (shortOf(R) && endD && userSet[endD.key] == null && !((endD.options[R.choices[endD.key]] || {}).stops || []).length) {
      let best = null;
      endD.options.forEach((o, j) => {
        if (!(o.stops || []).length || whyNot(sp, endD, o, R.choices, opt)) return;
        let T; try { T = build(Object.assign({}, asked, extra, { [endD.key]: j })); } catch (e) { return; }
        if (shortOf(T) >= shortOf(R) || (T.fitNote && T.fitNote.kind !== "unspent")) return;
        /* a repeat visitor who chose a region is not sent to Tokyo while another ending would spend the nights (QA round 10, h02) */
        const tk = opt.repeat && (o.stops || []).includes("tokyo") ? 1 : 0;
        if (!best || tk < best.tk || (tk === best.tk && shortOf(T) < best.short)) best = { j, o, short: shortOf(T), tk };
      });
      if (best) take(endD, best.j, `${best.o.label} taken as the ending to spend the nights asked`);
    }
  }
  const { locs, cities, reversed, choices, unavailable, stops, fitNote, total } = R;
  const steps = R.steps.concat(switchSteps, R.fitSteps);
  /* airports: a ticket given wins; else the option taken (a straight-in start, an END that names its airport), else the
   * spine's own; a leading or trailing Tokyo always reads Haneda (the spine's io line says the same in words) */
  const chosen = decisionsOf(sp).map((d) => d.options[choices[d.key]]);
  const oIn = chosen.map((o) => o.in).filter(Boolean)[0], oOut = chosen.map((o) => o.out).filter(Boolean).pop();
  /* run the other way round and the spine's own two airports swap with it */
  const spIn = opt.reverse ? sp.out : sp.in, spOut = opt.reverse ? sp.in : sp.out;
  /* reversed, the END option's airport is where the trip arrives and the start option's where it leaves */
  const inOpt = opt.reverse ? oOut : oIn, outOpt = opt.reverse ? oIn : oOut;
  const apIn = opt.in || (locs[0] === "tokyo" ? "HND" : inOpt || spIn || undefined);
  /* the spine's own exit holds only while its last city is still the last stop (QA round 6: Hiroshima dropped by a night
   * move left the exit at Hiroshima airport, three hours back from Kyoto); otherwise the nearest airport to the last stop */
  const lastLoc = locs[locs.length - 1];
  const spOutOk = spOut && airportsRanked(lastLoc).slice(0, 2).some((a) => a.code === spOut);
  const apOut = opt.out || (lastLoc === "tokyo" ? "HND" : outOpt || (spOutOk ? spOut : undefined));
  const P = buildPlan(stops, defined({ in: apIn, out: apOut, inGiven: !!opt.in, repeat: opt.repeat, nights: fitNote ? undefined : opt.total }));
  if (!opt.in && P.opt.in) P.opt.inSpine = true; if (!opt.out && P.opt.out) P.opt.outSpine = true;
  if (fitNote) P.checks.unshift({ level: "flag", msg: bandMsg(sp, bandOf(sp, locs), total, fitNote) });
  P.spine = sp; P.choices = choices; P.cities = cities; P.reversed = reversed; P.steps = steps; P.band = bandOf(sp, locs); P.unavailable = unavailable; P.droppedSets = droppedSets; P.fitNote = fitNote;
  P.flights = P.legs.filter((l) => l.flightH || l.mode === "flight").length;
  return P;
}
/* ── printers ── */
/* one band line for the whole print (2026-09-13): the spine's own band, and in brackets the band this
 * assembly is read against when its Tokyo start was dropped. The timeline never repeats it. */
/* the route's shape the way the explorer shows it (owner, 2026-09-12): the cities in order, then every ryokan option
 * and every town option this assembly offers, each marked on or off — so a comparison names Nikkō and Kaga even when
 * they are off, and nothing turns up later as a surprise */
function shapeLines(sp, P) {
  const off = new Set((P.unavailable || []).map((u) => `${u.key}#${u.index}`)), rev = P.reversed;
  /* where an option sits, in trip direction: on the way between two cities, out and back from one, before or after it */
  const where = (d) => { const o = d.owner; if (o.type === "leg") { const f = label(o.from[0]), t = label(o.to[0]); return rev ? `on the way ${t} → ${f}` : `on the way ${f} → ${t}`; }
    const c = label(o.city[0]); if (o.at === "split") return `out and back from ${c}`; const side = rev && o.at !== "split" ? (o.at === "before" ? "after" : "before") : o.at; return `${side} ${c}`; };
  const tag = (d) => { const j = d.options.findIndex((o) => (o.stops || []).length); if (j < 0 || off.has(`${d.key}#${j}`)) return null;
    return `${label(d.options[j].stops[0])} (${where(d)})`; };
  const list = (kind) => decisionsOf(sp).filter((d) => d.kind === kind && d.owner.type !== "end").map(tag).filter(Boolean);
  const cities = (P.cities || []).map(label);
  const endD = decisionsOf(sp).find((d) => d.owner.type === "end");
  const ends = endD ? endD.options.map((o, j) => off.has(`${endD.key}#${j}`) ? null : optWord(o, rev).label).filter(Boolean) : [];
  const ry = list("inn"), tw = list("stop");
  const nights = [...new Set(P.cities || [])].map((c) => `${label(c)} ${[...new Set(rangeOf(c, { repeat: P.opt && P.opt.repeat }))].join("–")}`);
  return [`**Cities:** ${cities.join(" → ")}`, `**Ryokan nights:** ${ry.length ? ry.join(" · ") : "none on this route"}`,
    `**Town stops:** ${tw.length ? tw.join(" · ") : "none on this route"}`, `**Ending:** ${ends.join(" · ")}`, `**Usual nights:** ${nights.join(" · ")}`];
}
function spineHead(sp, band, opt, P) {
  const own = sp.band.join("–"), here = band ? band.join("–") : own;
  const io = (opt && (opt.in || opt.out)) ? `${opt.in ? apLabel(opt.in) : "—"} → ${opt.out ? apLabel(opt.out) : "—"}` : P && P.opt ? `${apLabel(P.opt.in)} → ${apLabel(P.opt.out)}` : sp.io;
  return `**${sp.name}** · runs ${own} nights${here !== own ? ` (${here} without Tokyo)` : ""} · ${io}`;
}
/* the one-liner follows the assembly: an option that changes what the trip is carries its own `line` */
const lineOf = (sp, chosenOpts) => chosenOpts.map((o) => o && o.line).filter(Boolean).pop() || sp.line;
/* a route run the other way round prints the option's reversed wording where the data carries one (label_rev / desc_rev,
 * 2026-09-12, QA round 6: "Tokyo first" and "fly home from Ōita" are mirror images on a reversed trip) */
const optWord = (o, rev) => (rev && o.label_rev ? { label: o.label_rev, desc: o.desc_rev || o.desc } : o);
const optCell = (d, i, chosen, rev, opt) => d.options.map((o, j) => { const w = optWord(o, rev && !d.options.some((x) => x.reverse));   // a "which way round" decision keeps its own wording
  /* an END that names an airport the ticket does not use says so (QA round 7: "Fly home from Kansai" on a Haneda return) */
  const tk = opt && opt.out && o.out && o.out !== opt.out && d.owner && d.owner.type === "end" ? ` (your ticket leaves from ${apLabel(opt.out)}, so the last leg runs there)` : "";
  return `${j === chosen ? `**${j + 1} ${w.label}**` : `${j + 1} ${w.label}`} — ${w.desc}${tk}`; }).join(" · ");
/* the decisions grouped in trip order (v2, 2026-09-13): a city, the attachment that belongs to it, the slots on the leg
 * to the next city, the next city, and the END last. Returns [{ where, kind, items[] }] — `where` is what the table's
 * first column and the explorer's row header print, `items` the decisions shown there. */
function groupsOf(sp, choices, cities, reversed, locs) {
  const own = orderedCities(sp, choices, false), ds = decisionsOf(sp), cl = cities || own.cities;
  const rev = reversed == null ? own.reversed : reversed, groups = [], done = new Set();
  const homed = {};
  for (const d of ds) { if (d.owner.type !== "city" || d.owner.city) continue;
    const o = d.options[choices[d.key]], made = ((o && o.cities) || []).find((c) => cl.includes(c));
    if (made != null) homed[cl.indexOf(made)] = (homed[cl.indexOf(made)] || []).concat([d]); }
  /* a switch that adds no city of its own — the direction, a start that skips Tokyo — is asked at the first city */
  const loose = ds.filter((d) => d.owner.type === "city" && !d.owner.city && !Object.values(homed).some((a) => a.includes(d)));
  cl.forEach((c, i) => {
    /* the switches that settle this city, in the order spines.json declares them — a start before the direction */
    const items = (i === 0 ? loose : []).concat(homed[i] || []).sort((x, y) => ds.indexOf(x) - ds.indexOf(y));
    for (const d of ds) { if (d.owner.type !== "city" || !d.owner.city || done.has(d.key)) continue;
      if (d.owner.city.find((x) => cl.includes(x)) === c) { done.add(d.key); items.push(d); } }
    groups.push({ where: label(c), kind: "city", loc: c, items });
    if (i === cl.length - 1) return;
    for (const d of ds) { if (d.owner.type !== "leg" || done.has(d.owner.key) || !legJoins(d.owner, c, cl[i + 1], rev)) continue;
      const slots = ds.filter((x) => x.owner.type === "leg" && x.owner.key === d.owner.key);
      done.add(d.owner.key); groups.push({ where: `${short(c)} → ${short(cl[i + 1])}`, kind: "leg", leg: d.owner.key, items: slots }); }
  });
  const endD = ds.find((d) => d.owner.type === "end");
  if (endD) groups.push({ where: "The end", kind: "end", items: [endD] });
  /* an attachment whose owner city is not a city of the spine but IS a stop this assembly put on the route
   * (Amakusa hangs off Kumamoto, itself a leg slot) belongs under that stop, beside the decision that put it
   * there — never under "Not on this route" (QA round 8, the mirror of assembleOnce's own `missing` pass) */
  const rest = [], off = [];
  ds.filter((d) => !groups.some((g) => g.items.includes(d))).forEach((d) => rest.push(d));
  for (const d of rest) {
    const home = d.owner.type === "city" && d.owner.city && (locs || []).find((l) => d.owner.city.includes(l));
    if (!home) { off.push(d); continue; }
    const by = ds.find((x) => x !== d && (((x.options[choices[x.key]] || {}).stops) || []).includes(home));
    const at = by ? groups.findIndex((g) => g.items.includes(by)) : -1;
    const g = { where: label(home), kind: "city", loc: home, items: [d] };
    if (at >= 0) groups.splice(at + 1, 0, g);
    else groups.splice(groups.length && groups[groups.length - 1].kind === "end" ? groups.length - 1 : groups.length, 0, g);
  }
  if (off.length) groups.push({ where: "Not on this route", kind: "off", items: off });
  return groups;
}
/* the decisions grouped in trip order, the options as the kit's data prints them, the chosen one in bold; a decision
 * with one option — one this assembly withheld the rest of, or one the spine only ever had one of — is never shown */
/* run the other way round, the START decision settles where the trip ends and the END one where it begins (QA round 9) */
const qWord = (d, reversed) => (!reversed ? d.question : d.key === "end" ? "How does the trip start?" : d.key === "start" ? "Where does the trip end?" : d.question_rev || d.question);
function decisionsTable(sp, choices, unavailable, cities, reversed, opt, locs) {
  const L = ["| Where | Decision | Options (chosen in bold) |", "|---|---|---|"];
  let n = 0;
  for (const g of groupsOf(sp, choices, cities, reversed, locs)) {
    let first = true;
    for (const d of g.items) {
      const na = (unavailable || []).filter((u) => u.key === d.key).map((u) => `${u.label}: not offered here — ${u.why}`);
      /* a decision the assembly withholds is still printed, as one line with its reason, so the reader learns why
       * Kirishima is not there rather than never hearing of it (QA round 7) */
      if (d.options.length - na.length < 2) { if (na.length) L.push(`| ${first ? `**${g.where}**` : ""} | ${d.question} | _${na.join("; ")}_ |`); first = false; continue; } n++;
      /* a stop that switches on by itself at a length says so in the table, so the printed table and the engine agree (D5) */
      const on = d.on_at ? ` — ${d.options[0].label} is on by default from ${d.on_at} nights, and can be chosen on a shorter trip` : "";
      L.push(`| ${first ? `**${g.where}**` : ""} | ${n} · ${KIND_LABEL[d.kind] || d.kind.toUpperCase()} · ${qWord(d, reversed)}${on} \`${d.key}\` | ${optCell(d, 0, choices[d.key], reversed, opt)}${na.length ? ` · _${na.join("; ")}_` : ""} |`);
      first = false; }
  }
  return L.join("\n");
}
/* the timeline: one row per stop, the arrival transfer first, the leg under each stop as time to five minutes and one mode word;
 * the stop string under it is what rebuilds the same plan (`plan "<stop string>"`) and what a click-first user hands over */
function timelineTable(P, name, noBand) {
  const t = P.totals, o = P.opt, L = [];
  const band = P.band && !noBand ? ` · band ${P.band.join("–")}${t.nights < P.band[0] || t.nights > P.band[1] ? " (outside it)" : ""}` : "";
  L.push(`**${name || (P.spine ? P.spine.name : chain(P.stops))}** · ${t.nights} nights · ${t.checkins} check-ins · ${hoursTxt5(t)} of travel · ${perNightTxt(t)}${P.flights ? ` · ${P.flights} flight${P.flights > 1 ? "s" : ""}` : ""} · in ${apLabel(o.in)}, out ${apLabel(o.out)}${band}`, "");
  L.push("| Stop | Nights | Onward |", "|---|---|---|");
  let li = 0;
  if (o.in) { const l = P.legs[li++]; L.push(`| in from ${AIRPORT[l.code].label} | — | ${legWord(l)} |`); }
  P.stops.forEach((st) => { const l = P.legs[li++]; L.push(`| ${st.name} | ${nightsCell(st)} | ${l ? `${legWord(l)}${l.kind === "out" ? ` · out to ${AIRPORT[l.code].label}` : ""}` : "—"} |`); });
  /* ready to paste: the stops inside the quotes, the flags outside them (2026-09-13) */
  L.push("", `Stop string: \`plan "${stopString(P.stops)}" --in ${o.in} --out ${o.out}${o.repeat ? " --repeat" : ""}\``);
  return L.join("\n");
}
const checksLines = (P) => (P.checks.length ? P.checks.map((c) => `- ${mark(c)} ${c.msg}`) : ["- clean: every stop inside its range, no run over three, no backtrack, under 60 min a night."]);
/* ── the lighter shape (2026-09-13) ────────────────────────────────────────────
 * Saying a route is heavy is not advice. So whenever an assembly runs at 60 minutes of travel a night
 * or more, the engine looks for the lighter shape itself and prints it in one line under the checks.
 * The moves it tries, in this order: each RYOKAN and STOP decision's own "No" option, then its other
 * places (which is what un-splits a Tokyo stay — Nikkō out and back becomes Near Mount Fuji on the way
 * west, or no ryokan at all), then an END that drops the last inn night, and finally, with no spine to
 * move, each inn stop lifted off the back of the trip. One move at a time, every candidate assembled at
 * the SAME length and priced through the same buildPlan, none of it estimated. The lightest that stays
 * inside the cities' own minimums and comes under 60 is the answer; when none does, the nearest is
 * named instead, so the reader still learns what the next-lightest trip is. */
const MOVE_ORDER = { inn: 0, stop: 1, end: 2 };
/* every city on the route at or above the minimum its card states — a lighter trip that guts Kyoto is not lighter */
const insideMinimums = (P) => { const by = {}; P.stops.forEach((s) => { by[s.loc] = (by[s.loc] || 0) + s.nights; });
  return !Object.entries(by).some(([loc, n]) => isBaseKind(placeOf(loc).kind) && n < placeOf(loc).minimum); };
const shapeLine = (P) => P.stops.map((s) => `${short(s.loc)} ${s.nights}`).join(" → ");
function lighterCandidates(P, optIn) {
  const opt = optIn || {}, N = P.totals.nights, out = [];
  if (P.spine && P.choices) {
    const sp = P.spine;
    const ds = decisionsOf(sp).filter((d) => MOVE_ORDER[d.kind] != null).sort((a, b) => MOVE_ORDER[a.kind] - MOVE_ORDER[b.kind]);
    for (const d of ds) {
      const cur = P.choices[d.key];
      /* the "No" option first — the option that adds no stop — then the other places on that decision */
      const order = d.options.map((o, j) => j).filter((j) => j !== cur)
        .sort((a, b) => (d.options[a].stops.length ? 1 : 0) - (d.options[b].stops.length ? 1 : 0));
      for (const j of order) {
        let Q; try { Q = assembleSpine(sp, Object.assign({}, opt, { set: (opt.from || []).concat(opt.set || [], [`${d.key}=${j + 1}`]), total: N, lenientNights: true })); }
        catch (e) { continue; }
        out.push({ P: Q, what: `${d.question.replace(/\?$/, "")}: ${d.options[cur].label} → ${d.options[j].label}` });
      }
    }
  }
  /* no spine (a pasted stop string), or its decisions exhausted: lift an inn night off, last first, and give its nights back to the cities */
  for (let i = P.stops.length - 1; i >= 0; i--) {
    const st = P.stops[i];
    if (isBaseKind(st.kind)) continue;
    const kept = P.stops.filter((s, k) => k !== i).map((s) => Object.assign({}, s));
    if (!kept.length) continue;
    const merged = []; kept.forEach((s) => { const prev = merged[merged.length - 1];
      if (prev && prev.loc === s.loc && !prev.inn && !s.inn && prev.roomOnly === s.roomOnly) prev.nights += s.nights; else merged.push(s); });
    /* the freed nights go back to the cities; a shape that cannot hold the length at all is not a candidate,
     * but one that holds it under a city's minimum still is — it is ranked, and the minimums decide later */
    let Q; try { const f = fitTotal(merged, N, opt.repeat); if (f.note && f.note.kind !== "under") continue;
      Q = buildPlan(merged, defined({ in: P.opt.inDefault ? undefined : P.opt.in, out: P.opt.outDefault ? undefined : P.opt.out, repeat: opt.repeat || undefined })); }
    catch (e) { continue; }
    Q.flights = Q.legs.filter((l) => l.flightH || l.mode === "flight").length;
    out.push({ P: Q, what: `${st.name} dropped, its night${st.nights === 1 ? "" : "s"} back to the cities` });
  }
  return out;
}
/* the shape the line names: { kind: "lighter" | "nearest", P, what }, or null when there is nothing to say.
 * The printer and the build's fixture read the same pick, so what is checked is what is printed. */
function lighterPick(P, opt) {
  if (P.totals.unsourced || P.totals.perNight < DENSITY_MAX) return null;
  const N = P.totals.nights, here = stopString(P.stops);
  /* a shape with MORE stops on it is not a lighter one, whatever it prices at: an option that adds a place is not a move down */
  const cands = lighterCandidates(P, opt).filter((c) => isClean(c.P) && !c.P.totals.unsourced && c.P.totals.nights === N
    && c.P.stops.length <= P.stops.length && stopString(c.P.stops) !== here);
  const lightest = (list) => list.slice().sort((a, b) => a.P.totals.perNight - b.P.totals.perNight);
  const inside = lightest(cands.filter((c) => insideMinimums(c.P)));
  const pick = inside.find((c) => c.P.totals.perNight < DENSITY_MAX);
  if (pick) return { kind: "lighter", P: pick.P, what: pick.what };
  const near = inside[0] || lightest(cands)[0];
  return near ? { kind: "nearest", P: near.P, what: near.what } : { kind: "none" };
}
/* the one line printed under the checks, or null when the route is already under the flag */
function lighterLine(P, opt) {
  const pick = lighterPick(P, opt);
  if (!pick) return null;
  if (pick.kind === "lighter") return `Lighter: ${shapeLine(pick.P)} · ${perNightTxt(pick.P.totals)} — ${pick.what}`;
  if (pick.kind === "none") return "No lighter shape at this length; every option on this route weighs as much or more.";
  return `No lighter shape at this length; the next is ${shapeLine(pick.P)} · ${perNightTxt(pick.P.totals)} — ${pick.what}.`;
}
const COMPARE_HEAD = ["| Route | Stops | Nights | Travel | Per night | Check-ins | Ryokan nights | Flights | In / out |", "|---|---|---|---|---|---|---|---|---|"];
const compareRow = (P, name) => { const t = P.totals; return `| ${name} | ${chain(P.stops)} | ${t.nights} | ${hoursTxt5(t)} | ${perNightTxt(t).replace(" per night", "")}${t.perNight >= DENSITY_MAX && !t.unsourced ? " (≥60)" : ""} | ${t.checkins} | ${t.innNights} | ${P.flights != null ? P.flights : P.legs.filter((l) => l.flightH || l.mode === "flight").length} | ${apLabel(P.opt.in)} / ${apLabel(P.opt.out)} |`; };
const legsLine = (P) => P.legs.map((l) => `${l.kind === "in" ? `in from ${AIRPORT[l.code].label}` : l.kind === "out" ? `out to ${AIRPORT[l.code].label}` : `${short(l.from)} → ${short(l.to)}`} ${legWord(l)}`).join(" · ");
/* ── commands ── */
/* the menu (level 1): every spine at its default assembly — at --nights N where given — with the engine's figures */
function cmdSpines(opt) {
  if (!SPINES) throw new Error("no spines.json beside route.js — the kit build writes it");
  const draws = (opt.draws || []).map(normDraw).filter(Boolean), bad = draws.filter((d) => !DRAWS.includes(d));
  /* a draw the menu does not rank on ("cocktails") is ignored and said in the header, never a refusal (QA round 6) */
  const ignored = bad.slice(); for (const b of bad) draws.splice(draws.indexOf(b), 1);
  const overlap = (sp) => draws.filter((d) => (sp.draws || []).includes(d));
  const regionHit = (sp) => draws.filter((d) => REGION_DRAWS.includes(d) && (sp.draws || []).includes(d)).length;
  const month = monthOf(opt.month);
  /* a route written for a season (spines.json `season`, months) sorts under the rest when the trip is outside it, and says so */
  const offSeason = (sp) => (month && Array.isArray(sp.season) && sp.season.length && !sp.season.includes(month) ? 1 : 0);
  const rows = [], broken = [];
  for (const sp of SPINES) {
    const canStraightIn = !!(sp.cities || [])[0] && !!((sp.cities || [])[0].options);
    const lo = opt.repeat && canStraightIn ? sp.band[0] - placeOf("tokyo").ideal[0] : sp.band[0], hi = opt.repeat && canStraightIn ? sp.band[1] - placeOf("tokyo").ideal[0] : sp.band[1];
    /* a night count outside the band never removes a spine from the menu (2026-09-13): the row is
     * assembled anyway and says so in its own words — the reader decides, not the filter */
    const out = !!(opt.nights && (opt.nights < lo || opt.nights > hi));
    const at = out ? (opt.nights < lo ? lo : hi) : opt.nights || undefined;   // a spine the length does not suit is shown at its own nearest length, and says so
    let P; try { P = assembleSpine(sp, { total: at, in: opt.in, out: opt.out, repeat: opt.repeat || undefined }); }
    catch (e) { broken.push(`${sp.id} (${e.message})`); continue; }
    rows.push({ sp, P, hit: overlap(sp), band: [lo, hi], out, at });
  }
  /* the order the agent reads top-down: the spines that hold the asked-for length, then the draws they
   * answer, then who each is for — a first visit and a repeat one want different spines first (D4) */
  const rankOf = (sp) => ((sp.rank && (opt.repeat ? sp.rank.repeat : sp.rank.first)) || 99);
  /* a ticket that would take three flights to honour is not a route, it is an argument with the ticket (2026-09-13):
   * the row says so instead of printing a figure, and it sorts under the spines the ticket does suit */
  const ticket = !!(opt.in || opt.out);
  rows.forEach((r) => { r.noTicket = ticket && r.P.flights >= TICKET_FLIGHT_MAX;
    /* a ticket into the far end (FUK in, HND home) is honoured by the spine run the other way round (2026-09-12, QA round 6):
     * try --reverse before calling it the wrong trip, and say so in the row */
    if (ticket) { try { const R = assembleSpine(r.sp, { total: r.at, in: opt.in, out: opt.out, reverse: true, repeat: opt.repeat || undefined });
      const better = r.noTicket ? R.flights < TICKET_FLIGHT_MAX : (R.flights < r.P.flights || (R.flights === r.P.flights && R.totals.hours <= r.P.totals.hours - 0.5));
      if (better) { r.P = R; r.noTicket = false; r.reversed = true; } } catch (e) { /* stays as it was */ } } });
  /* the For line is a ranking tier, not decoration (2026-09-13): a spine written for someone who has already
   * done Tokyo and Kyoto (`assumes: "repeat"`) sits under every first-trip spine on a first visit */
  const wrongTrip = (sp) => (!opt.repeat && sp.assumes === "repeat" ? 1 : 0);
  /* what the ticket costs at the two ends — a flight, or an hour and a half or more, between an airport and the first or
   * last stop — ranks before the draws (QA round 8: a Fukuoka arrival with Kyushu draws was offered the Kanazawa Loop
   * first): a route that opens where they land and closes where they fly home sits above one reached by a flight or a
   * long transfer; the draws then order each tier */
  rows.forEach((r) => { r.ticketCost = 0; if (ticket) r.P.legs.filter((l) => l.kind === "in" || l.kind === "out").forEach((l) => { r.ticketCost += (l.flightH || l.mode === "flight" ? 10 : 0) + (l.h >= 1.5 ? 1 : 0); }); });
  rows.sort((a, b) => (a.noTicket ? 1 : 0) - (b.noTicket ? 1 : 0) || (a.out ? 1 : 0) - (b.out ? 1 : 0) || wrongTrip(a.sp) - wrongTrip(b.sp) || offSeason(a.sp) - offSeason(b.sp)
    || a.ticketCost - b.ticketCost || regionHit(b.sp) - regionHit(a.sp) || b.hit.length - a.hit.length || rankOf(a.sp) - rankOf(b.sp) || a.sp.id.localeCompare(b.sp.id));
  /* a spine marked `always: "first"` is offered on every first visit (2026-09-12: the Kanazawa Loop, over
   * Snow Country in particular) — it sits in the top three whatever the draws, unless the length or the
   * ticket rule it out */
  if (!opt.repeat && !draws.some((d) => REGION_DRAWS.includes(d))) rows.filter((r) => r.sp.always === "first" && !r.noTicket && !r.out && !r.ticketCost && !offSeason(r.sp)).reverse().forEach((r) => { const i = rows.indexOf(r); if (i > 2) { rows.splice(i, 1); rows.splice(2, 0, r); } });
  if (opt.json) return JSON.stringify(rows.map(({ sp, P, hit, band, out, ticketCost, reversed, noTicket }) => ({ id: sp.id, ticketCost, reversed: !!reversed, noTicket: !!noTicket, name: sp.name, blurb: sp.blurb, for: sp.for, band: sp.band, bandHere: band, outsideBand: out, draws: sp.draws, matched: hit, choices: P.choices, stops: P.stops, totals: P.totals, flights: P.flights, opt: P.opt, checks: P.checks, stopString: stopString(P.stops) })), null, 1);
  const L = [`*The nine routes ${opt.nights ? `at ${opt.nights} nights` : "at their own shortest length (no night count was given \u2014 run `spines --nights N` at the profile\'s nights before showing a menu)"}${draws.length ? `, ranked for ${draws.join(", ")}` : ""}${ignored.length ? ` (${ignored.join(", ")} is not a draw the menu ranks on; the cards carry it)` : ""}${opt.repeat ? ", repeat visit (straight into the region where the route allows it, and the Tokyo nights read 3–4)" : ""}${opt.in || opt.out ? ` · ${opt.in ? `in ${apLabel(opt.in)}` : ""}${opt.in && opt.out ? ", " : ""}${opt.out ? `out ${apLabel(opt.out)}` : ""} (a booked ticket prices the last leg; it never removes a route)` : ""}. Offer the top two or three, by name; the rest is the roll call. Travel counts each flight leg at ${FLIGHT_CAP_H}h at most, and a route over ${DENSITY_MAX} minutes of travel a night says so. \`spine <name>\` walks one — \`spine kanazawa\`, \`spine classic\`.*`, ""];
  L.push("| Route | Who it's for | The trip | Nights | Travel | Ryokan nights | Flights | Fly in / home from |", "|---|---|---|---|---|---|---|---|");
  rows.forEach(({ sp, P, hit, band, out, at, noTicket }) => { const t = P.totals;
    const forCell = `${sp.for || "—"}${out ? ` Runs ${band[0]}–${band[1]} nights, so it is shown at ${at}.` : ""}${rows.find((x) => x.sp === sp).reversed ? " Runs the other way round for this ticket." : ""}${offSeason(sp) ? ` A ${sp.season.includes(1) ? "winter" : "seasonal"} route, out of season in ${MONTHS[month - 1][0].toUpperCase() + MONTHS[month - 1].slice(1)}.` : ""}`;
    const nt = "not with this ticket";
    L.push(`| **${sp.name}** · ${sp.band.join("–")} nights | ${forCell} | ${chain(P.stops)} | ${t.nights} | ${noTicket ? nt : `${hoursTxt5(t)}${t.perNight >= DENSITY_MAX && !t.unsourced ? ` (${perNightTxt(t)})` : ""}`} | ${t.innNights} | ${P.flights} | ${apLabel(P.opt.in)} / ${apLabel(P.opt.out)} |`); });
  if (rows.some((r) => r.noTicket)) L.push("", `*${rows.filter((r) => r.noTicket).map((r) => r.sp.name).join(", ")} would take ${TICKET_FLIGHT_MAX} domestic flights or more to honour that ticket, so no figure is printed for ${rows.filter((r) => r.noTicket).length === 1 ? "it" : "them"}: ${rows.filter((r) => r.noTicket).length === 1 ? "it is" : "they are"} the wrong trip for this ticket, not a dearer version of it.*`);
  const flagged = rows.filter(({ P }) => P.checks.some((c) => c.level === "flag" || c.level === "violation"));
  flagged.forEach(({ sp, P }) => P.checks.filter((c) => c.level !== "note").forEach((c) => L.push("", `- ${sp.name}: ${mark(c)} ${c.msg}`)));
  if (broken.length) L.push("", `Could not be assembled: ${broken.join("; ")}.`);
  return L.join("\n");
}
/* one spine (level 2): its decisions, the assembly, the timeline, the stop string, the checks; with --set, before and after */
/* with a ticket, the spine is run the other way round when that means fewer flights, or the same flights and at least
 * half an hour less travel (2026-09-12, QA round 7: a KIX-in / HND-home Kanazawa Loop was priced forwards with a
 * Kansai→Haneda flight first, 13h, when the reversed trip is the natural one) */
function betterReversed(sp, opt) {
  if (!(opt.in || opt.out) || opt.reverse) return false;
  try {
    /* a ticket that already matches the route's own airports never turns it round (QA round 8: a KIX/KIX straight-in
     * Classic was reversed because the backwards assembly slipped an answer the forwards one had rightly set aside) */
    const N = assembleSpine(sp, Object.assign({}, opt, { in: undefined, out: undefined, set: (opt.from || []).concat(opt.set || []), lenientNights: true }));
    if ((!opt.in || N.opt.in === opt.in) && (!opt.out || N.opt.out === opt.out)) return false;
    const F = assembleSpine(sp, Object.assign({}, opt, { set: (opt.from || []).concat(opt.set || []), lenientNights: true }));
    const st = decisionOf(sp, "start"), so = st && st.options[F.choices.start];
    if (so && so.in && so.in === opt.in) return false;   // a straight-in start the ticket itself picked is the direction
    /* they land where the trip already starts: never turn it round to carry them past it (owner, 2026-09-12: a Haneda
     * round-trip Classic was reversed to Kyoto first once the Tokyo close stopped being forced) */
    if (opt.in && F.cities && F.cities.length && ((AIRPORT[opt.in] || {}).hubs || []).includes(F.cities[0])) return false;
    const R = assembleSpine(sp, Object.assign({}, opt, { set: (opt.from || []).concat(opt.set || []), lenientNights: true, reverse: true }));
    if ((R.droppedSets || []).length > (F.droppedSets || []).length) return false;   // never turn round by losing an answer
    return R.flights < F.flights || (R.flights === F.flights && R.totals.hours <= F.totals.hours - 0.5); } catch (e) { return false; }
}
function cmdSpine(ref, opt) {
  const sp = spineOf(ref);
  const autoRev = betterReversed(sp, opt); if (autoRev) opt = Object.assign({}, opt, { reverse: true });
  /* Before is the route they actually had: `--before "<stop string>"` when they paste the one on screen,
   * otherwise the spine with the answers already given (`--from`), its night moves applied where they
   * still fit. It is never a route they never saw (2026-09-13). */
  const base = Object.assign({}, opt, { set: opt.from || [], lenientNights: true });
  /* a pasted Before inherits the spine's airports when no ticket was given, so it is priced the way the walk priced it
   * (QA round 7: `--before` re-priced Stretched West out through Fukuoka instead of Hiroshima) */
  const base0 = assembleSpine(sp, base);
  /* a pasted Before keeps the spine's airports only where its own ends still sit at them; otherwise each end takes its
   * nearest gateway, the way the walk would price it (QA round 8: a Before ending at Yufuin was priced out through Fukuoka) */
  const bStops = opt.before ? parseStops(opt.before) : [], hubs = (c) => (c && AIRPORT[c] ? AIRPORT[c].hubs : []);
  const bIn = opt.in || (bStops.length && hubs(base0.opt.in).includes(bStops[0].loc) ? base0.opt.in : undefined);
  const bOut = opt.out || (bStops.length && hubs(base0.opt.out).includes(bStops[bStops.length - 1].loc) ? base0.opt.out : undefined);
  const before = opt.before ? buildPlan(bStops, defined({ in: bIn, out: bOut, repeat: opt.repeat })) : base0;
  if (opt.before) { before.flights = before.legs.filter((l) => l.flightH || l.mode === "flight").length; before.steps = []; }
  const changed = (opt.set || []).length;
  const after = changed ? assembleSpine(sp, Object.assign({}, opt, { set: (opt.from || []).concat(opt.set) })) : assembleSpine(sp, Object.assign({}, opt, { set: opt.from || [] }));
  /* a pasted Before, or a --nights/--total on its own, is a change too (QA round 9: `--total 11 --before …` printed no Before) */
  const moved = (changed || opt.before || (opt.nightsAt || []).length || opt.total) && (stopString(before.stops) !== stopString(after.stops) || before.totals.nights !== after.totals.nights || decisionsOf(sp).some((d) => before.choices && before.choices[d.key] !== after.choices[d.key]));
  if (opt.json) return JSON.stringify({ spine: sp.id, before: moved ? before : undefined, after, choices: after.choices, stopString: stopString(after.stops) }, null, 1);
  const chosenOpts = decisionsOf(sp).map((d) => d.options[after.choices[d.key]]);
  const L = [spineHead(sp, after.band, opt, after), "", lineOf(sp, chosenOpts), "",
    `Explorer: \`guides/route-explorer.html#spine=${slugify(sp.name.replace(/[^a-z0-9 ]/gi, " ").replace(/\s+/g, " ").trim())}&nights=${after.totals.nights}${opt.in ? `&in=${opt.in}` : ""}${opt.out ? `&out=${opt.out}` : ""}${opt.repeat ? "&repeat=1" : ""}\` — the page to hand them, prefilled with this route.`, ""];
  L.push(...shapeLines(sp, after), "");
  if (autoRev) L.push(`Run the other way round for your ticket — in at ${apLabel(after.opt.in)}, home from ${apLabel(after.opt.out)}. The engine turns it round by itself whenever the ticket is on every run (\`--in\`/\`--out\`); do not add \`--reverse\` on top, that would turn it back.`, "");
  L.push(`**Decisions in trip order** — options as the kit's data prints them; \`spine "${sp.name}" --set <key>=<number or label>\` takes one, \`--nights <loc>=N\` moves nights (\`=0\` drops the stop), \`--total N\` sets the length, \`--reverse\` runs it the other way round, \`--before "<stop string>"\` names the route they already have.`, "", decisionsTable(sp, after.choices, after.unavailable, after.cities, after.reversed, null, after.stops.map((s) => s.loc)), "");
  /* one of the two, never both (2026-09-13): a run that asked for a change and moved nothing says so, and
   * the night lines the defaults filled in are not dressed up as a change they made */
  const nothingMoved = changed && !moved;
  const stepsAll = (after.steps || []).concat((after.droppedSets || []).map((x) => x));
  if (stepsAll.length && !nothingMoved) { L.push("What moved:", "", ...stepsAll.map((s) => `- ${s}`), ""); }
  if (moved) {
    const what = before.choices ? decisionsOf(sp).filter((d) => before.choices[d.key] !== after.choices[d.key]).map((d) => `${d.key}: ${d.options[before.choices[d.key]].label} → ${d.options[after.choices[d.key]].label}`) : [];
    L.push(`**Before and after** — ${what.length ? what.join("; ") : "the same decisions, a different shape"}.`, "", "### Before", "", timelineTable(before, `${sp.name} before`, true), "", "### After", "", timelineTable(after, `${sp.name} after`, true), "");
    L.push(...COMPARE_HEAD, compareRow(before, "before"), compareRow(after, "after"), "");
  } else { L.push(timelineTable(after, null, true), ""); if (nothingMoved) { const ds = after.droppedSets || []; L.push(ds.length ? `Nothing moved: ${ds.join("; ")} — the route stays as it was.` : "Nothing moved: that is the route it already was.", ""); } }
  L.push("**Checks**", "", ...checksLines(after));
  const lt = lighterLine(after, opt); if (lt) L.push("", lt);
  return L.join("\n");
}
/* two or three full assemblies side by side (level 3): the same columns as the menu, then each route's legs */
function cmdCompare(specs, opt) {
  if (specs.length < 2) throw new Error("compare needs two or three stop strings, e.g. compare \"tokyo:4,hakone:1,kyoto:4\" \"tokyo:4,kanazawa:3,kyoto:4\"");
  const names = ["A", "B", "C", "D"];
  const Ps = specs.map((s) => { const P = buildPlan(parseStops(s), defined({ in: opt.in, out: opt.out, repeat: opt.repeat })); P.flights = P.legs.filter((l) => l.flightH || l.mode === "flight").length; return P; });
  if (opt.json) return JSON.stringify(Ps.map((P, i) => ({ name: names[i], stops: P.stops, totals: P.totals, flights: P.flights, opt: P.opt, checks: P.checks, stopString: stopString(P.stops) })), null, 1);
  const L = [`*${Ps.length} routes compared, each priced leg by leg from the tables. Per night counts each flight leg at ${FLIGHT_CAP_H}h at most; (≥${DENSITY_MAX}) is the flag.*`, "", ...COMPARE_HEAD];
  Ps.forEach((P, i) => L.push(compareRow(P, `**${names[i]}**`)));
  L.push("");
  Ps.forEach((P, i) => { L.push(`**${names[i]}** · \`plan "${stopString(P.stops)}" --in ${P.opt.in} --out ${P.opt.out}\` — ${legsLine(P)}`); P.checks.filter((c) => c.level !== "note").forEach((c) => L.push(`- ${mark(c)} ${c.msg}`)); L.push(""); });
  return L.join("\n").trimEnd();
}
/* the shortlist for a place: three to five rows against the profile, write-ups verbatim, from shortlist.json */
const BUDGET = { inn: { modest: 600, comfortable: 1000 }, hotel: { modest: 300, comfortable: 600 } };
const bandLow = (s) => { const m = /\$?(\d[\d,]*)/.exec(String(s || "")); return m ? +m[1].replace(/,/g, "") : null; };
const bandHigh = (s) => { const m = /\$?(\d[\d,]*)\s*[–-]\s*\$?(\d[\d,]*)/.exec(String(s || "")); return m ? +m[2].replace(/,/g, "") : bandLow(s); };
/* under a modest or comfortable budget the hotels sit in three tiers (2026-09-12, owner: "five within a comfortable
 * budget" led with the dearest rows and dropped K5 and SOIL): a band whose top stays within a quarter above the
 * budget line is squarely inside it; one that starts under the line but runs well past it is a stretch; no band
 * at all is last. Inside a tier the authored order holds. */
const hotelTier = (budget, band) => { if (!budget || budget === "splurge") return 0; const lo = bandLow(band), hi = bandHigh(band); if (lo === null) return 2; return hi <= BUDGET.hotel[budget] * 1.25 ? 0 : 1; };
/* a RYOKAN option on a spine spans towns, so the shortlist answers for the whole option in one table with the
 * town as a column: `stays fuji`, `stays snow`, `stays kaga`, `stays east`, `stays sapporo-onsen` (2026-09-13) */
const GROUP_GATE = { fuji: "tokyo", snow: "tokyo", kaga: "kanazawa", east: "fukuoka", "sapporo-onsen": "sapporo" };
const STAY_GROUPS = {
  fuji: { name: "Near Mount Fuji", locs: ["hakone", "kawaguchiko", "oyama", "izu", "yugashima", "izukogen", "atami", "shimoda", "yugawara"] },
  snow: { name: "Snow country", locs: ["tanigawa", "echigoyuzawa", "yudanaka", "matsunoyama", "yamadaonsen"] },
  kaga: { name: "The Kaga onsen towns", locs: ["yamashiro", "yamanaka", "mikuni"] },
  east: { name: "The hot-spring east", locs: ["hita", "yufuin", "kurokawa", "beppu"] },
  "sapporo-onsen": { name: "The hot-spring inns near Sapporo", locs: ["noboribetsu", "jozankei"] } };
const stayGroup = (q) => STAY_GROUPS[norm(q).replace(/ /g, "-")] || null;
/* every shortlist row carries its own researched reach — `sapporo 1h/0 bus · ...`, the same legs the stays
 * files print — so a gateway the LEGS table never joined to the inn's town (Sapporo → Jōzankei is a city bus,
 * not a rail pair) is still answered from researched data rather than "to confirm" (QA round 8) */
function reachFrom(inn, gate) {
  for (const part of String((inn && inn.reach) || "").split("·")) {
    const m = /^\s*([a-z0-9]+)\s+(?:(in town)|(?:(\d+)h(\d{2})?|(\d+)\s*min)\s*\/\s*(\d+|changes to confirm))\s*([a-z]+)?/.exec(part);
    if (!m || m[1] !== gate) continue;
    const h = m[2] ? 0 : m[3] ? +m[3] + (m[4] ? +m[4] / 60 : 0) : +m[5] / 60;
    return { h, x: /^\d+$/.test(m[6] || "") ? +m[6] : null, mode: m[7] || null };
  }
  return null;
}
/* the time from a city to an inn: the leg table first, the row's own researched reach second */
function innReach(gate, inn) {
  if (!gate) return null;
  if (inn.loc && inn.loc === gate) return { h: 0, x: 0 };
  const l = inn.loc ? leg(gate, inn.loc) : null;
  if (l && !l.estimated && l.h != null) return { h: l.h, x: l.x, mode: l.mode };
  return reachFrom(inn, gate);
}
/* how far "within reach of this city" reaches: two hours is a stay you sleep at from here, not a different stop */
const NEAR_REACH_H = 2;
/* the nearest loc the shortlist actually holds an inn in, for a place it covers nothing at */
function nearestStay(loc, skip) {
  if (!SHORTLIST) return null;
  const here = coord(loc); if (!here) return null;
  const byLoc = {};
  (SHORTLIST.inns || []).forEach((i) => { if (!i.loc || (skip || []).includes(i.loc)) return; (byLoc[i.loc] = byLoc[i.loc] || []).push(i); });
  const cands = Object.keys(byLoc).map((l) => ({ loc: l, km: km(here, coord(l)), inns: byLoc[l] })).filter((c) => c.km != null).sort((a, b) => a.km - b.km);
  return cands[0] || null;
}
function cmdStays(q, opt) {
  if (!SHORTLIST) throw new Error("no shortlist.json beside route.js — the kit build writes it from the master inn table");
  const G0 = stayGroup(q);
  const loc = G0 ? G0.locs[0] : resolveLoc(q), p = placeOf(loc);
  /* a place whose stays are answered across several towns (the snow valleys behind `minakami`) prints the group
   * shape too — the town as a column — never a single-town table with four rows from other valleys (QA round 7) */
  const alias = !G0 && (Object.values(ALIAS).find((g) => g[0] === loc) || null);
  const G = G0 || (alias && alias.length > 1 ? { name: `${label(loc)} and the valleys around it`, locs: alias, alias: true } : null);
  const budget = opt.budget ? norm(opt.budget) : null;
  if (budget && !BUDGET.inn[budget] && budget !== "splurge") throw new Error("--budget is modest, comfortable or splurge");
  const fits = (kind, band) => { if (!budget || budget === "splurge") return true; const lo = bandLow(band); return lo === null || lo <= BUDGET[kind][budget]; };
  const bathOk = (b) => !opt.bath || /^(yes|some)/i.test(String(b || ""));
  /* a place that names a group (Izu, the Kaga towns, the snow valleys, the Tōhoku inn towns) answers for every loc in it */
  const group = G ? G.locs : Object.values(ALIAS).find((g) => g[0] === loc) || [loc], inLoc = (l) => group.includes(l);
  let inns = (SHORTLIST.inns || []).filter((i) => inLoc(i.loc)).map((i) => Object.assign({ kind: "inn" }, i));
  const hotels = (SHORTLIST.hotels || []).filter((h) => inLoc(h.city)).map((h) => Object.assign({ kind: h.kind || "hotel" }, h));
  /* an editor's pick priced above the budget is still shown, last, as the reach (owner, 2026-09-12: "isn't Asaba a
   * required rec for Hakone / Fuji / Izu?"); the bath filter still applies to it */
  const reach = inns.filter((i) => i.pinned && !fits("inn", i.band) && bathOk(i.bath));
  const droppedInns = inns.filter((i) => (!fits("inn", i.band) || !bathOk(i.bath)) && !reach.includes(i)), droppedHotels = hotels.filter((h) => !fits("hotel", h.rate));
  inns = inns.filter((i) => fits("inn", i.band) && bathOk(i.bath)).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.score || 0) - (a.score || 0) || a.name.localeCompare(b.name, "en"));
  const shownHotels = hotels.filter((h) => fits("hotel", h.rate)).map((h, i) => ({ h, i })).sort((a, b) => hotelTier(budget, a.h.rate) - hotelTier(budget, b.h.rate) || a.i - b.i).map((x) => x.h);
  /* inns cap at five (eight across a town group); a city's hotels at six, so the table shows variety (owner, 2026-09-12) */
  const cap = opt.all ? Infinity : G ? 8 : 5;
  const reachRows = reach.map((i) => Object.assign({}, i, { band: `${i.band} · above the budget` }));
  const rowsI = inns.slice(0, cap).concat(reachRows);   // the reach prints LAST, after the hotels (see the print order below)
  const capH = opt.all ? Infinity : Math.max(0, 6 - rowsI.length);   // a city table is six rows in all (owner, 2026-09-12)
  let rowsH = shownHotels.slice(0, capH), topUp = [];
  /* a modest budget in a design-and-luxury list can leave the table empty (QA round 6, Kyoto): top it up to three with the
   * cheapest rows above the line, each marked, so the reader sees what the nearest thing costs rather than nothing */
  if (budget && budget !== "splurge" && rowsH.length < 3 && hotels.length > rowsH.length) {
    const more = hotels.filter((h) => !rowsH.includes(h) && bandLow(h.rate) !== null).sort((a, b) => bandLow(a.rate) - bandLow(b.rate)).slice(0, 3 - rowsH.length)
      .map((h) => Object.assign({}, h, { rate: `${h.rate} · above the budget` }));
    rowsH = rowsH.concat(more); topUp = more; more.forEach((m) => { const i = droppedHotels.findIndex((h) => h.name === m.name); if (i >= 0) droppedHotels.splice(i, 1); }); }
  const where = G ? G.name : label(loc);
  if (opt.json) return JSON.stringify({ loc, group: G ? { name: G.name, locs: G.locs } : null, place: p, inns: rowsI, hotels: rowsH, filtered_out: { inns: droppedInns.map((i) => i.slug), hotels: droppedHotels.map((h) => h.name) } }, null, 1);
  /* the count in the header IS the number of rows under it (2026-09-13): what is shown, then what was held back */
  const nFitH = rowsH.length - topUp.length;
  const held = (inns.length - Math.min(inns.length, cap)) + Math.max(0, shownHotels.length - nFitH) + (budget ? droppedInns.length + droppedHotels.length : 0);
  const nFit = rowsI.length - reach.length;
  const shownTxt = [nFit ? `${nFit} inn${nFit === 1 ? "" : "s"}` : "", nFitH ? `${nFitH} hotel${nFitH === 1 ? "" : "s"}` : ""].filter(Boolean).join(" and ") || "nothing";
  const above = [reach.length ? `${reach.length} inn${reach.length === 1 ? "" : "s"} above it, ${reach.length === 1 ? "an editor's pick" : "editor's picks"}` : "", topUp.length ? `${topUp.length} hotel${topUp.length === 1 ? "" : "s"} above it, the cheapest there ${topUp.length === 1 ? "is" : "are"}` : ""].filter(Boolean);
  const reachTxt = above.length ? `, then ${above.join(" and ")}` : "";
  const L = [`*${where} (${G ? `${G.locs.length} towns, one table` : p.kind + (p.unlisted ? ", no card line" : "")}): ${shownTxt}${budget ? ` at the ${budget} end of the list (${budget === "splurge" ? "no cap" : `inn bands starting under $${BUDGET.inn[budget]}, hotels under $${BUDGET.hotel[budget]}`})` : ""}${opt.bath ? ", in-room bath only" : ""}, best first${reachTxt}${held ? ` — ${held} more on the shortlist here (--all for every one)` : ""}. The Why column is the kit's write-up, your source for a Why in your own words; the band is per night for two, dinner and breakfast included for an inn, room only for a hotel.*`, ""];
  /* the town is a column (2026-09-12): a RYOKAN option spans towns, and choosing the inn fixes the town and the leg */
  /* the table gives its width to Why (owner, 2026-09-12): the kind, the score and an editor's pick ride in the Stay cell,
   * Town is a column only when the option spans towns, a hotel city has no Bath column, and a mixed inn-and-hotel table
   * keeps Bath with a hotel's cell reading `unstated` (an empty cell would read as none) */
  const hotelsOnly = !rowsI.length && rowsH.length > 0;
  const HEAD = hotelsOnly ? "| Stay | Band | Why | Links |" : G ? "| Stay | Town | Band | Bath | Why | Links |" : "| Stay | Band | Bath | Why | Links |";
  L.push(HEAD, HEAD.replace(/[^|]+/g, "---"));
  const innStay = (i) => `${i.name} · inn${i.tier ? ` · ${i.tier}` : ""}${i.pinned ? " · editor's pick" : ""}`;
  /* the Bath cell in the words Stage 4 prescribes, never the shortlist's raw yes/some/no (QA round 8) */
  const bathWord = (b) => ({ yes: "in the room", some: "some rooms", no: "none in the room" })[String(b || "").toLowerCase()] || "unstated";
  const innRow = (i, town) => `| ${innStay(i)} | ${G ? `${town} | ` : ""}${i.band} | ${bathWord(i.bath)} | ${i.writeup} | ${i.map ? `[map](${i.map}) · ` : ""}[full write-up](${i.url}) |`;
  /* the Town cell of a group table carries the time from the group's gateway city (Stage 4: "the leg is visible beside the
   * name"), never a slug (QA round 6) */
  const gate = G ? (GROUP_GATE[norm(q).replace(/ /g, "-")] || Object.keys(STAY_GROUPS).map((k) => [k, STAY_GROUPS[k].locs]).filter(([k, ls]) => ls.includes(loc)).map(([k]) => GROUP_GATE[k])[0] || null) : null;
  const townOf = (i) => { const t = i.area || label(i.loc || loc); if (!gate || !i.loc) return t; const r = innReach(gate, i);
    return r ? `${t} · from ${label(gate)} ${hm(r.h)}${r.x ? `, ${r.x} change${r.x > 1 ? "s" : ""}` : r.x === 0 ? ", direct" : ", changes to confirm"}` : `${t} · from ${label(gate)}: to confirm`; };
  rowsI.filter((i) => !reachRows.includes(i)).forEach((i) => L.push(innRow(i, townOf(i))));
  rowsH.forEach((h) => { const isInn = /^inn\b/.test(String(h.kind || ""));
    const links = [h.map ? `[map](${h.map})` : "map unconfirmed", isInn && h.url ? `[full write-up](${h.url})` : h.site ? `[site](${h.site})` : ""].filter(Boolean).join(" · ");
    /* a hotel's Stay cell is its name and neighbourhood; the points or luxury group is already in its write-up */
    const stay = `${h.name}${isInn ? " · inn" : ""}${h.area ? ` · ${h.area}` : ""}`;
    L.push(`| ${stay} | ${G ? `${label(h.city)} | ` : ""}${h.rate} | ${hotelsOnly ? "" : "unstated | "}${h.why} | ${links} |`); });
  reachRows.forEach((i) => L.push(innRow(i, townOf(i))));
  /* the stop keys behind the names (2026-09-13): a group table's rows span towns, and the stop string is written in
   * locs, so choosing an inn here means looking its loc up somewhere else (QA round 8: shortlist.json was opened to
   * find `oyama`). The line is the assistant's own working note, not something to read out. */
  const keyLine = (rows) => { const seen = [], out = [];
    rows.forEach((i) => { if (!i.loc || seen.includes(i.name)) return; seen.push(i.name); out.push(`${i.name} → \`${i.loc}\``); });
    return out.length ? ["", `*Stop keys for the plan (yours, never shown): ${out.join(" · ")}*`] : []; };
  if (G && rowsI.length) L.push(...keyLine(rowsI));
  /* nothing here: the cell says so plainly — never an instruction to the assistant — and the inns a night away
   * follow it, so the reader still has somewhere to sleep (2026-09-13) */
  if (!rowsI.length && !rowsH.length) {
    L.push(`| — | — | — | no shortlist stay here${droppedInns.length || droppedHotels.length ? " inside that filter" : ""} | — |`);
    /* a city with no inn IN it is rarely a city with no inn to sleep at: every shortlist row carries its own
     * researched reach, so the inns within a couple of hours are listed here exactly as `stays/<city>.md` lists
     * them, best first (QA round 8: Sapporo said "no shortlist stay here" with six inns within reach of it) */
    const near = (SHORTLIST.inns || []).filter((i) => !inLoc(i.loc) && bathOk(i.bath) && fits("inn", i.band))
      .map((i) => Object.assign({ r: innReach(loc, i) }, i)).filter((x) => x.r && x.r.h != null && x.r.h <= NEAR_REACH_H)
      .sort((a, b) => a.r.h - b.r.h || (b.score || 0) - (a.score || 0) || a.name.localeCompare(b.name, "en"));
    if (near.length) {
      const rows = near.slice(0, opt.all ? Infinity : 6);
      L.push("", `No stay is in ${label(loc)} itself. These are the shortlist's inns within reach of it, each with its own researched leg${near.length > rows.length ? ` (${near.length - rows.length} more, --all for every one)` : ""}:`, "",
        `| Stay | From ${label(loc)} | Band | Bath | Why | Links |`, "|---|---|---|---|---|---|");
      rows.forEach((i) => L.push(`| ${innStay(i)} | ${hm(i.r.h)}${i.r.x ? `, ${i.r.x} change${i.r.x > 1 ? "s" : ""}` : i.r.x === 0 ? ", direct" : ", changes to confirm"} | ${i.band} | ${bathWord(i.bath)} | ${i.writeup} | ${i.map ? `[map](${i.map}) · ` : ""}[full write-up](${i.url}) |`));
      L.push(...keyLine(rows));
    } else {
      const nr = nearestStay(loc, group);
      if (nr) { L.push("", `The nearest place the kit covers is ${label(nr.loc)}, ${Math.round(nr.km)} km away:`, "", "| Stay | Band | Bath | Why | Links |", "|---|---|---|---|---|");
        nr.inns.slice(0, 3).forEach((i) => L.push(`| ${innStay(i)} | ${i.band} | ${bathWord(i.bath)} | ${i.writeup} | ${i.map ? `[map](${i.map}) · ` : ""}[full write-up](${i.url}) |`)); }
    }
  }
  if (droppedInns.length || droppedHotels.length) L.push("", `Left out by the filter: ${droppedInns.map((i) => i.name).concat(droppedHotels.map((h) => h.name)).join(", ")}.`);
  /* the catalogue link names the town the rows are actually in, not the group's first loc (QA round 8: a
   * Jōzankei table closed by pointing at Noboribetsu) */
  const linkLoc = (G && rowsI.length ? rowsI[0].loc : null) || loc;
  if (rowsI.length && rowsI.length < 3) L.push("", `Only ${rowsI.length} inn${rowsI.length === 1 ? "" : "s"} here on the shortlist — say so rather than padding; the alternative is a hotel in the nearest city, or the live catalogue at https://ryokancatalog.com/place/${linkLoc}.`);
  return L.join("\n");
}

/* ───────────── 9. main ───────────── */
function main(argv) {
  const opt = { json: false, repeat: false, all: false, bath: false, set: [], from: [], nightsAt: [], draws: [] }, pos = [];
  for (let i = 0; i < argv.length; i++) { const a = argv[i];
    if (a === "--json") opt.json = true; else if (a === "--md") opt.json = false; else if (a === "--repeat") opt.repeat = true; else if (a === "--all") opt.all = true; else if (a === "--bath") opt.bath = true;
    else if (a === "--in") opt.in = String(argv[++i] || "").toUpperCase(); else if (a === "--out") opt.out = String(argv[++i] || "").toUpperCase();
    else if (a === "--nights") { const v = String(argv[++i] || ""); if (/=/.test(v)) opt.nightsAt.push(...v.split(/,(?=[a-z]+(?:#\d)?=)/i)); else { opt.nights = +v; if (!opt.nights || opt.nights < 1) throw new Error("--nights takes a whole number of nights, or loc=N on a spine"); } }
    else if (a === "--total") { opt.total = +argv[++i]; if (!opt.total || opt.total < 1) throw new Error("--total takes a whole number of nights"); }
    else if (a === "--reverse") opt.reverse = true; else if (a === "--before") opt.before = String(argv[++i] || "");
    else if (a === "--set") opt.set.push(String(argv[++i] || "")); else if (a === "--from") opt.from.push(String(argv[++i] || ""));
    else if (a === "--budget") opt.budget = String(argv[++i] || ""); else if (a === "--draws") opt.draws.push(...String(argv[++i] || "").split(",")); else if (a === "--month") opt.month = String(argv[++i] || "");
    else pos.push(a); }
  ["in", "out"].forEach((k) => { if (opt[k] && !AIRPORT[opt[k]]) throw new Error(`unknown airport ${opt[k]} (${AP_CODES.join(", ")})`); });
  const cmd = pos[0];
  if (["plan", "orders"].includes(cmd) && !pos[1]) throw new Error(`${cmd} needs a stop list, e.g. "tokyo:4,nikko:2r,tokyo:2,kyoto:4"`);
  if (cmd === "plan") return cmdPlan(pos[1], opt);
  if (cmd === "orders") return cmdOrders(pos[1], opt);   // internal helper, not in the usage
  if (cmd === "spines") return cmdSpines(opt);
  if (cmd === "spine") { if (!pos[1]) throw new Error("spine needs an id, e.g. `spine s1 --set inn=nikko --total 12`"); return cmdSpine(pos[1], opt); }
  if (cmd === "compare") return cmdCompare(pos.slice(1), opt);
  if (cmd === "stays") { if (!pos[1]) throw new Error("stays needs a place, e.g. `stays kyoto --budget comfortable`"); return cmdStays(pos[1], opt); }
  if (cmd === "connectors") { if (!pos[1] || !pos[2]) throw new Error("connectors needs two places, e.g. `connectors kyoto kanazawa`"); return cmdConnectors(pos[1], pos[2], opt); }
  if (cmd === "exit") { if (!pos[1]) throw new Error("exit needs the last stop, e.g. `exit kyoto`"); return cmdExit(pos[1], opt); }
  if (cmd === "legs") return cmdLegs(pos[1], pos[2], opt);
  if (cmd === "places") return opt.json ? JSON.stringify(Object.values(PLACES), null, 1) : Object.values(PLACES).map((p) => `${p.loc}: ${p.kind} · ideal ${p.ideal[0]}–${p.ideal[1]} · min ${p.minimum}${p.repeat ? ` · repeat ${p.repeat[0]}–${p.repeat[1]}` : ""} · ${p.region || "—"}${p.card ? ` · ${p.card}` : ""}${p.spines && p.spines.length ? ` · on ${p.spines.join(", ")}` : ""}`).join("\n");
  return ["usage: node route.js <command> [--json|--md]",
    "  spines [--nights N] [--draws food,onsen,…] [--repeat] [--in X --out Y]   the menu: the nine spines at their default assembly, with figures",
    "  spine <id> [--set key=option …] [--nights loc=N …] [--total N] [--in X --out Y] [--repeat] [--reverse] [--before \"<stops>\"]   one spine: decisions, timeline, stop string, checks",
    "  compare \"<stops A>\" \"<stops B>\" [\"<stops C>\"] [--in X --out Y]   two or three full routes side by side",
    "  stays <place|fuji|snow|kaga|east|sapporo-onsen> [--budget modest|comfortable|splurge] [--bath] [--all]   the shortlist for one place, or for a whole ryokan option across its towns, write-ups verbatim",
    "  plan \"tokyo:4,nikko:2r,tokyo:2,kyoto:4\" --in HND --out KIX [--repeat] [--nights N]   (2r = two room-only nights)",
    "  connectors <cityA> <cityB> [--all]   (inn:<slug> works for either)", "  exit <lastStop>", "  legs <a> <b>", "  places",
    `places read from ${PLACES_SRC || "nothing (no places.json, no ../stages/2-orientation.md)"}; spines ${SPINES ? SPINES.length : "not found"}; shortlist ${SHORTLIST ? `${(SHORTLIST.inns || []).length} inns, ${(SHORTLIST.hotels || []).length} hotels` : "not found"}; airports: ${AP_CODES.join(" ")}`].join("\n");
}
if (require.main === module) { try { console.log(main(process.argv.slice(2))); } catch (e) { console.error("route.js: " + e.message); process.exit(1); } }
module.exports = { buildPlan, parseStops, stopOf, stopString, leg, airportLeg, airportsRanked, defaultIn, defaultOut, resolveLoc, placeOf, label, short, coord, km, hm, hm5, modeWord,
  printPlan, shapeTable, orderRow, lighterLine, lighterPick, lighterCandidates, ORDER_HEAD, chain, isClean, runId, AIRPORT, AP_CODES, HUBS, PLACES, PLACES_SRC, DENSITY_MAX, FLIGHT_CAP_H, regionOfLoc: (l) => B.regionOfLoc(l),
  SPINES, SHORTLIST, STAY_GROUPS, DRAWS, normDraw, spineOf, decisionsOf, decisionOf, spineLocs, groupsOf, orderedCities, choicesOf, parseSets, assembleLocs, assembleSpine, bandOf, timelineTable, decisionsTable, compareRow, COMPARE_HEAD, legsLine, cmdSpines, cmdSpine, cmdCompare, isInnKind, isBaseKind };
