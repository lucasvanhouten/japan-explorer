/* route-builder-logic.js — dynamic itinerary builder.
 * Consumes data tables from route-data.js (auto-generated from trip-data.js).
 * Transit engine: ONE LEGS table — every researched loc→loc leg, door-to-door, auto-reversing —
 * plus a region-hub estimate as a clearly-labeled last resort. There is a single source of truth for
 * travel time. Routes carry NO leg times: the builder resolves every leg by loc-pair through LEGS,
 * identically for a loaded route template and a hand-built itinerary.
 * (Until 2026-06-21 leg times lived in two places — route stop times harvested into KNOWN_LEGS, plus
 * RESEARCHED_LEGS — and a stale route time could silently shadow a researched one. Now unified; the
 * routes' inline times are stripped at build time, see build-route-data.js.)
 */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const el=h=>{const t=document.createElement("template");t.innerHTML=h.trim();return t.content.firstElementChild;};
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
const G=window;

/* ===================== trip config (one place) =====================
 * Everything trip-specific that is NOT data: titles, the default arrival date, the localStorage
 * key, the weather label + which months the WX table actually describes, and the home/arrival
 * airport. A generated build (see build-route-data.js --kit) sets g.TRIP in route-data.js to
 * retarget the same HTML+logic at another trip; the fallbacks below ARE this trip's values, so
 * with no g.TRIP present nothing changes.
 * The fallback literal below is delimited by the TRIP-FALLBACK markers: the kit build swaps the
 * whole block for its own defaults when it copies this file, so no private framing ships.
 * NB the `typeof === "object"` gate is load-bearing: the headless harnesses (load-builder.js,
 * build-route-data.js) stub every unknown global with a catch-all Proxy over a function, so a
 * bare `G.TRIP||{…}` would take the truthy stub and silently blank every field. */
const TRIP_DEFAULTS=/*TRIP-FALLBACK*/{
  "docTitle": "Japan Trip · Route Builder",
  "printTitle": "Japan trip itinerary",
  "exportTitle": "Japan trip itinerary",
  "exportFile": "japan-trip-itinerary.md",
  "arrival": "2027-04-15",
  "wxLabel": "Typical January",
  "wxAbbr": "Typical January",
  "wxMonths": [
    1
  ],
  "storeKey": "japan-trip-kit",
  "homeAirport": "HND",
  "arriveAirport": "HND"
}/*END-TRIP-FALLBACK*/;
const TRIP_GIVEN=(G.TRIP&&typeof G.TRIP==="object")?G.TRIP:null;
const T=Object.assign({},TRIP_DEFAULTS,TRIP_GIVEN);
const DEF_ARR=T.arrival;
/* The WX table is a single-month climate snapshot (T.wxMonths). An arrival outside those months
 * would render numbers for the wrong season, so the weather metric + per-stop chip hide instead. */
function wxOn(){
  const ms=T.wxMonths;
  if(!Array.isArray(ms)||!ms.length)return false;
  let arr=DEF_ARR;
  try{if(itin&&itin.arrival)arr=itin.arrival;}catch(e){}   // called only after boot; guard the TDZ anyway
  return ms.indexOf(parseInt(String(arr).slice(5,7),10))>=0;
}
function apLabel(c){return (typeof AIRPORTS!=="undefined"&&AIRPORTS[c]&&AIRPORTS[c].label)||c;}
/* titles live in config, so the shipped HTML is trip-neutral: <title> and the print-only heading
 * are both filled here at boot. The document title is overwritten ONLY where a build explicitly
 * supplied g.TRIP (the kit build, which retargets this same logic at another trip). Hosts that
 * embed the builder under their own HTML <title> — the standalone route-builder.html and the
 * unified app.html — pass no g.TRIP, and their own title must survive boot; before this gate the
 * fallback docTitle above overwrote whatever the host page had set. */
if(TRIP_GIVEN&&TRIP_GIVEN.docTitle){try{document.title=T.docTitle;}catch(e){}}
try{const pt=document.querySelector("#printTitle");if(pt)pt.textContent=T.printTitle;}catch(e){}

/* ===================== data-derived lookups ===================== */
function variantsOf(r){return r.variants?r.variants:[r];}
function segLoc(s){return s.type==="ryokan"?(G.RYOKANS[s.ryk]?G.RYOKANS[s.ryk].loc:s.ryk):s.loc;}

/* city display labels (loc -> name), harvested from the routes */
const CITY_LABEL={};
const RYK_PALETTE=new Set(), CITY_PALETTE=new Set();
function eachSeg(fn){
  G.ROUTES.forEach(r=>variantsOf(r).forEach(v=>{
    (v.segs||[]).forEach(fn);
    (v.dep||r.dep||[]).forEach(d=>(d.final||[]).forEach(fn));
  }));
}
eachSeg(s=>{
  if(s.type==="city"&&s.loc){
    if(!CITY_LABEL[s.loc])CITY_LABEL[s.loc]=(s.base||"").replace(/\s*\(.*?\)\s*/g,"").trim()||cap(s.loc);
    CITY_PALETTE.add(s.loc);
  } else if(s.type==="ryokan"){
    (s.alts||[s.ryk]).forEach(a=>{if(a)RYK_PALETTE.add(a);});
  }
});
/* Every city with a curated hotel is addable, whether or not a current route template visits it —
   same fix as the inn palette (which was once gated on route-referenced inns only). */
Object.keys(G.HOTELS||{}).forEach(l=>{CITY_PALETTE.add(l);if(!CITY_LABEL[l])CITY_LABEL[l]=cap(l);});

/* ===================== regions (the decision tree) ===================== */
/* Each region declares the LOCS it owns; its `ryokans` swap list is DERIVED from
   G.RYOKANS just below (every inn whose loc is in the region, minus BUILDER_HIDE).
   So adding an inn to the selector needs NO edit here unless its loc is brand-new —
   then add that one loc to ONE region's `locs`. planning/validate.js fails loudly
   if any inn's loc has no region. */
/* inns deliberately NOT offered in the builder — data-driven: set `hide:1` on the inn in trip-data.js
   (e.g. guntu, the README-eliminated cruise). Hiding an inn is a data edit, not a code edit. */
const BUILDER_HIDE=new Set(Object.keys(G.RYOKANS).filter(id=>G.RYOKANS[id].hide));
const REGIONS={
  tokyo:{label:"Tokyo",kanji:"東京",hub:"tokyo",cities:["tokyo"],locs:[],leadsTo:["kyushu","north","central"],
    blurb:"Where everything starts.",
    fill:[{kind:"city",ref:"tokyo",nights:2}]},
  kyushu:{label:"Kyushu — onsen sweep",kanji:"九州",hub:"fukuoka",cities:["kagoshima","fukuoka","nagasaki","kumamoto","beppu"],
    locs:["kirishima","yufuin","hita","kurokawa","amakusa","unzen","takachiho","karatsu","takeo","iki","yakushima"],
    leadsTo:["kansai","inlandsea","depart"],blurb:"Warm January, the widest onsen variety. Fly in to Kirishima.",
    fill:[{kind:"ryokan",ref:"myoken",nights:2},{kind:"city",ref:"kagoshima",nights:3},{kind:"ryokan",ref:"enowa",nights:2},{kind:"city",ref:"fukuoka",nights:4}]},
  north:{label:"Gunma & the North Country",kanji:"北国",hub:"sendai",cities:["sendai"],
    locs:["tanigawa","echigoyuzawa","yudanaka","yamadaonsen","matsunoyama","karuizawa","nikko","tsuchiyu","iizaka","bandaiatami","aizuwakamatsu","sukagawa","akayu","kaminoyama","kakunodate","hottoyuda","shizukuishi","matsumoto","kamasaki","kiso","suwa"],
    leadsTo:["hokuriku","kansai"],blurb:"Snow country, forest seclusion, almost entirely on rails.",
    fill:[{kind:"ryokan",ref:"senjuan",nights:2},{kind:"city",ref:"sendai",nights:2},{kind:"ryokan",ref:"satonoyu",nights:2}]},
  central:{label:"Hakone · Fuji · Izu",kanji:"富士",hub:"tokyo",cities:[],
    locs:["oyama","hakone","izu","yugashima","koshu","kawaguchiko","kobuchizawa","izukogen","atami","shimoda","yugawara"],
    leadsTo:["kansai"],blurb:"A near-Tokyo onsen with Fuji in the window, then west.",
    fill:[{kind:"ryokan",ref:"gorakadanfuji",nights:2}]},
  hokuriku:{label:"Kanazawa & the Crab Coast",kanji:"北陸",hub:"kanazawa",cities:["kanazawa"],
    locs:["mikuni","yamashiro","yamanaka","toyama","notojima","eiheiji","takayama","gero","inuyama"],
    leadsTo:["kansai","kyushu"],blurb:"Kenrokuen under snow, gold-leaf crafts, winter crab on the coast.",
    fill:[{kind:"city",ref:"kanazawa",nights:3},{kind:"ryokan",ref:"bouyourou",nights:2}]},
  kansai:{label:"Kyoto & around",kanji:"関西",hub:"kyoto",cities:["kyoto"],
    locs:["nara","katsuragi","amino","kinosaki","arima","ise","yunoyama"],
    leadsTo:["inlandsea","depart"],blurb:"The deep Kyoto base, Nara, and a finale you choose.",
    fill:[{kind:"city",ref:"kyoto",nights:5},{kind:"ryokan",ref:"fufunara",nights:2},{kind:"ryokan",ref:"amanosato",nights:2}]},
  inlandsea:{label:"The Seto Inland Sea",kanji:"瀬戸内",hub:"hiroshima",cities:["hiroshima"],
    locs:["onomichi","tomonoura","setoda","hatsukaichi","miyajima"],
    leadsTo:["depart"],blurb:"Calm sea, ferry-arrival inns, Miyajima — fly out of Hiroshima.",
    fill:[{kind:"ryokan",ref:"migiwatei",nights:2},{kind:"city",ref:"hiroshima",nights:1}]},
};
const REGION_ORDER=["tokyo","kyushu","north","central","hokuriku","kansai","inlandsea"];
/* Each region's nearest logical bookend cities — the one-or-two cities an inn there naturally
   connects to. Single authored copy: validate.js check #7 (coverage invariant) and
   export-transit.js (→ ryokans/transit-derived.json) both read it from here. */
const SENSIBLE={
  north:    ["tokyo","kanazawa"],
  central:  ["tokyo","kyoto"],
  hokuriku: ["kanazawa","tokyo","kyoto"],
  kansai:   ["kyoto"],
  kyushu:   ["fukuoka","kagoshima","nagasaki","kumamoto"],
  inlandsea:["hiroshima","kyoto"],
  tokyo:    [],
};
/* flat poster colours, one per region (used for station numerals, ticks, rules, branches) */
const REGION_COLOR={tokyo:"#19191a",kyushu:"#df4327",north:"#2563a8",central:"#2f7d6b",hokuriku:"#4b4f93",kansai:"#b3801a",inlandsea:"#3a7d4a"};
/* loc -> region key (derived from each region's declared locs + cities) */
const LOC_REGION={};
Object.entries(REGIONS).forEach(([key,rg])=>{
  rg.cities.forEach(loc=>LOC_REGION[loc]=key);
  (rg.locs||[]).forEach(loc=>LOC_REGION[loc]=key);
});
/* CITY_PALETTE is seeded above from the ROUTE TEMPLATES — which means a city could be declared on a
   region, have hotels and a blurb, and still be un-addable in the builder because no curated route
   happened to stop there. That's what kept Beppu invisible (2026-07-26). A city a region declares AND
   that has hotels to stay in is a stop the builder can genuinely stage, so add it here too. Gateways
   the builder can't route (osaka/nagoya/sapporo) are in no region's `cities`, so they stay out. */
Object.values(REGIONS).forEach(rg=>(rg.cities||[]).forEach(loc=>{
  if(!((G.HOTELS||{})[loc]||[]).length)return;
  CITY_PALETTE.add(loc);
  if(!CITY_LABEL[loc])CITY_LABEL[loc]=cap(loc);
}));
/* DERIVE each region's swappable inns from the single RYOKANS source, sorted by
   standing (off-catalog "—" last). This is why adding an inn to the selector makes
   it appear in the builder automatically — no hand-maintained per-region list. */
Object.values(REGIONS).forEach(rg=>rg.ryokans=[]);
Object.keys(G.RYOKANS||{}).forEach(id=>{
  if(BUILDER_HIDE.has(id))return;
  const key=LOC_REGION[(G.RYOKANS[id]||{}).loc];
  if(key&&REGIONS[key])REGIONS[key].ryokans.push(id);
});
/* Standing = the canonical synthesis overall (SYNTH), falling back to the deprecated
   trip-data score only for inns with no synthesis block. (G.SYNTH directly — the SY
   alias is declared further down.) */
const _stand=id=>{const sy=(G.SYNTH||{})[id];if(sy&&typeof sy.overall==="number")return sy.overall;const s=G.RYOKANS[id]&&G.RYOKANS[id].score;return typeof s==="number"?s:-1;};
Object.values(REGIONS).forEach(rg=>rg.ryokans.sort((a,b)=>_stand(b)-_stand(a)));
function regionOfLoc(loc){return LOC_REGION[loc]||null;}
function colorOfLoc(loc){const rg=regionOfLoc(loc);return (rg&&REGION_COLOR[rg])||"#19191a";}

/* ===================== airports ===================== */
const AIRPORTS={
  HND:{label:"Tokyo · Haneda (HND)",hub:"tokyo"},
  KIX:{label:"Osaka · Kansai (KIX)",hub:"kyoto"},
  ITM:{label:"Osaka · Itami (ITM)",hub:"kyoto"},
  FUK:{label:"Fukuoka (FUK)",hub:"fukuoka"},
  NGS:{label:"Nagasaki (NGS)",hub:"nagasaki"},
  HIJ:{label:"Hiroshima (HIJ)",hub:"hiroshima"},
  KOJ:{label:"Kagoshima (KOJ)",hub:"kagoshima"},
  KMJ:{label:"Kumamoto (KMJ)",hub:"kumamoto"},
  OIT:{label:"Oita (OIT)",hub:"oita"},
};
/* HND is home — the international flight out is always from Haneda (see departLeg). Each list is the
   sensible way(s) to REACH HND from a route ending in that region: the near-Tokyo regions go overland
   to HND (the single "HND" option); the far regions catch a domestic flight to HND from whichever
   airport ends the route. So a Kansai finale can rail to HND (default) or fly KIX/ITM→HND; a Kyushu
   finale flies out from FUK/KOJ/KMJ/NGS. (Pre-2026-07 these were "which airport do you leave Japan
   from" — but Haneda is a fixed endpoint, so every option now terminates at HND.) */
const DEPARTS={
  tokyo:["HND"],north:["HND"],central:["HND"],hokuriku:["HND"],
  kansai:["HND","KIX","ITM"],inlandsea:["HIJ","KIX"],kyushu:["FUK","KOJ","KMJ","NGS"],
};
/* A few stops sit nearer an airport than their region's menu offers — add it just for that stop
   (its own gateway, prepended so it leads the menu and wins the nearest-default). */
const DEPART_LOC_EXTRA={ yufuin:["OIT"], beppu:["OIT"] };   // Yufuin's and Beppu's airport is Oita, not in the generic Kyushu menu
/* Nearest-by-time isn't always most-logical: force the reliable gateway where a nominally-faster airport
   is the wrong call. Yakushima → Kagoshima (KOJ): the KOJ↔Yakushima JAC hop is frequent, while FUK↔Yakushima
   is ~1/day and weather-cancels (research/transit-notes.md). Kinosaki/Amino → Itami (ITM): bestDepart's
   "prefer clean rail over flying" bonus (score(HND)-best<1.5h) was tipping these deep-Kansai stops toward
   railing all the way back through Kyoto AND Tokyo to Haneda — never sensible next to the direct regional
   ITM flight — once a 2026-07-08 transfer-count correction on kinosaki/amino>tokyo trimmed HND's composed
   score enough to cross that threshold. */
const HOME_AIRPORT_OVERRIDE={ yakushima:"KOJ", kinosaki:"ITM", amino:"ITM" };
/* The airport menu for a specific last stop = its region's list, plus any per-loc extra, deduped. */
function departsFor(loc){return [...new Set([...(DEPART_LOC_EXTRA[loc]||[]), ...(DEPARTS[regionOfLoc(loc)]||["HND"])])];}

/* ===================== transit engine ===================== */
/* LEGS — the single source of truth for travel time. Keyed by `locA>locB` (region loc, NOT inn name),
 * door-to-door [hours, self-handled transfers]. Auto-reverses in legBetween(), so author each pair once.
 * Every leg a route uses lives here too (the "ex-route legs" block below) — routes themselves carry no
 * times. Sources: JR West / Nankai / Kintetsu, japan-guide, jrailpass, official airport pages,
 * rome2rio/navitime, research/transit-notes.md (Jun 2026). */
const L=(t,x,mode,text,flags)=>({t:[t,x],mode,flags:flags||{},text,source:"researched"});
const LEGS={
  /* ── Gero Onsen + Wakura Onsen (hokuriku) and Suwa (north) — researched 2026-07-26 for the
     catalog→builder promotions (Shogetsu, Kagaya Bettei Matsunomidori, Iwanoyu + Sui Suwako).
     Anchors: the JR Hida timetable (Gero), the inns' own researched catalog transit blocks
     (Kagaya: Kanazawa 1.1h / Tokyo 3.8h), and the Azusa timetable (Suwa). Peer legs are the
     anchor plus the ALREADY-RESEARCHED Kanazawa / Matsumoto pivot legs in this table — summed
     sourced segments, never an estimate. Sourced prose in research/transit-notes.md. ── */
  /* Takayama/Gero ↔ Suwa authored DIRECT (hokuriku↔north): left to COMPOSE_CORRIDORS these
     pivot through Kanazawa at ~5.5h, when the real route is the year-round Nohi/Alpico bus east
     to Matsumoto and one stop down the Azusa. Composition picks a pivot, not a map — so the
     corridor that actually matters for a before/after-Takayama stay is authored by hand. */
  "takayama>suwa":L(3.25,1,"bus","Nohi/Alpico highway bus Takayama Nōhi BC→Matsumoto BT (~2h20, ~7/day, reserved, year-round), cross to Matsumoto Stn, then the Ltd Exp 'Azusa'→Kamisuwa/Shimosuwa (~24–25 min) + the ~5–10-min inn car. One change at Matsumoto — the natural east hop, and far better than the ~5h30 Kanazawa composition it replaces.",{car:1}),
  "gero>oyama":L(4.2,1,"train","Ltd Exp 'Hida' Gero\u2192Nagoya (one seat, ~1h40), 'Hikari' Nagoya\u2192Mishima (~1h14; the Mishima-calling Hikari is ~2-hourly \u2014 pick the Hida that meets it), then a ~40-min taxi/inn car up to Subashiri \u2014 the inn's own published access route. Free alt if timed: T\u014dkaid\u014d local\u2192Numazu + Gotemba Line\u2192Gotemba + the inn's free reserved shuttle (~20 min) \u2014 same clock \u00b1, but 3 self-handled changes instead of 1. \u26a0 The Takayama Line through Gero is a heavy-snow corridor \u2014 January Hida services run late or suspend in heavy snow; build buffer.",{car:1,awkward:1}),
  "gero>suwa":L(4.0,2,"bus","'Hida' Gero→Takayama (~48 min), Nohi/Alpico bus→Matsumoto BT (~2h20), then the 'Azusa'→Kamisuwa/Shimosuwa (~25 min) + inn car. (Via Nagoya — 'Hida'→Nagoya ~1h35, 'Shinano'→Shiojiri, local to Kamisuwa — lands within ~15 min of the same total; take whichever departure fits.)",{car:1,awkward:1}),
  "gero>takayama":L(1.0,0,"train","Direct Ltd Exp 'Hida' Gero→Takayama (~48 min) — the same train you would already be on. JR Ltd Exp 'Hida' — timetabled Nagoya→Gero 1h32–1h41, Gero→Takayama 48–49 min, Gero→Toyama 2h17–2h25 (Hida 3/7/13); only ~5 services run through to Toyama. Shogetsu is a ~5-min drive from Gero Stn.",{car:1}),
  "gero>kyoto":L(3.1,1,"train","'Hida' Gero→Nagoya (~1h35), change ~15 min to a Tōkaidō 'Nozomi'/'Hikari'→Kyoto (~35 min) + the Shōgetsu shuttle and hotel ends (2026-07 audit: same 10-Hida/day correction as takayama>kyoto — hourly only ~11:30–16:30, 2h gaps outside, all-reserved Dec 25–Jan 5, January 大雪 advisories; the old 2.5 was bare rides on an 'hourly' frequency that isn't). One no-change direct: Hida 36 calls at Gero ~16:10 → Kyoto 19:17.",{car:1}),
  "gero>toyama":L(3.0,0,"train","Direct 'Hida' Gero→Toyama (~2h20), then the ~40-min car up the Jinzu gorge to Garaku. No transfer at all — but ⚠ only ~5 Hida run through to Toyama, so the departure sets the day.",{car:1,awkward:1}),
  "gero>kanazawa":L(3.0,1,"train","'Hida' Gero→Toyama (~2h20), change to the Hokuriku Shinkansen Toyama→Kanazawa (~23 min). Beats the Takayama + Nohi-bus chain (~3h25). ⚠ ~5 Toyama through-services/day.",{car:1,awkward:1}),
  "gero>yamashiro":L(3.6,2,"train","As gero→Kanazawa (~3h), then Kanazawa→Kaga-Onsen (~15–30 min) + Beniya Mukayu's free on-demand shuttle (~15 min, call ahead).",{car:1,awkward:1}),
  "gero>mikuni":L(3.7,2,"train","As gero→Kanazawa (~3h), then the 'Tsurugi' Kanazawa→Awara-Onsen (~27 min) + the inn's free ~10-min shuttle (reserve the day before).",{car:1,awkward:1}),
  "gero>tokyo":L(3.7,1,"train","'Hida' Gero→Nagoya (~1h37), change to a Tōkaidō 'Nozomi'→Tokyo (~1h40), plus the ~5-min drive at the Gero end. Shogetsu's own access page gives this chain.",{car:1}),
  "gero>yamanaka":L(3.9,2,"train","As gero→Kanazawa (~3h), then Kanazawa→Kaga-Onsen (~25 min) + a ~25-min taxi up to Yamanaka (the inn can arrange).",{car:1,awkward:1}),
  "gero>notojima":L(4.25,2,"train","As gero→Kanazawa (~3h), then 'Noto Kagaribi'→Wakura-Onsen (~1h08) + the ~10-min taxi across the Notojima bridge.",{car:1,awkward:1}),
  "gero>eiheiji":L(4.0,2,"train","As gero→Kanazawa (~3h), Hokuriku Shinkansen→Fukui (~25 min), then a ~25-min cab straight between Fukui Stn and Eshikoto (Maps 22 min / 13.7 km) — no Echizen Railway, no rail change (2026-08-02: the Echizen Rly + 6-min-taxi chain this leg used to quote costs ~40 min and one extra change; tokyo>eiheiji already preferred the cab, so the inn's access was quoted differently by direction of travel). Two changes — still the longest chain in the region.",{car:1,awkward:1}),
  /* --- inuyama (Akariya Geihanro) — researched 2026-07-26. Two doorsteps, and which one you use
     decides the leg: Shin-Unuma (2 Meitetsu stops, ~5 min) hands you the JR Takayama Line for the
     Hida corridor; Meitetsu-Nagoya (~30 min) hands you the Tōkaidō/Hokuriku網 for everything west.
     Segment library: inn→Inuyama Stn free shuttle ~5 min; Meitetsu Inuyama→Meitetsu-Nagoya ~29–32 min
     (μ-SKY/Ltd Exp, direct); Meitetsu-Nagoya→JR Nagoya ~10-min walk; 'Hida' Nagoya→Unuma ~30 min,
     →Mino-Ōta ~40 min, →Gero ~1h37, →Takayama ~2h25; 'Shirasagi' Nagoya→Tsuruga ~1h40; Hokuriku
     Shinkansen Tsuruga→Fukui ~18 min, →Kanazawa ~43 min. ⚠ only SOME 'Hida' stop at Unuma — if
     yours doesn't, ride a Takayama-Line local one stop on to Mino-Ōta, where every 'Hida' calls
     (~12 min, already in the times below). --- */
  "inuyama>gero":L(1.75,1,"train","The short way north: inn shuttle to Inuyama, Meitetsu two stops to Shin-Unuma (~5 min), cross to JR Unuma and take the Ltd Exp 'Hida' up the Takayama Line to Gero (~1h05), then the inn's ~4-min shuttle. ⚠ only some 'Hida' call at Unuma — otherwise a local one stop on to Mino-Ōta (~12 min), where all of them do. Going back out via Meitetsu-Nagoya and boarding there costs ~40 min more but never misses.",{car:1,awkward:1}),
  "inuyama>takayama":L(2.5,1,"train","As inuyama→Gero, staying on the same 'Hida' up the Takayama Line to Takayama (~1h55 from Unuma), then a 7-min walk from the station. One change, at Unuma (or Mino-Ōta). ⚠ the Unuma stop is partial — see the note above.",{awkward:1}),
  "inuyama>kanazawa":L(3.7,2,"train","Meitetsu Inuyama→Meitetsu-Nagoya (~30 min), a ~10-min walk across to JR Nagoya, the Ltd Exp 'Shirasagi' Nagoya→Tsuruga (~1h40), then the Hokuriku Shinkansen 'Tsurugi' Tsuruga→Kanazawa (~43 min). Two changes, both timetabled connections. (Via Nozomi to Kyoto + 'Thunderbird' to Tsuruga lands within ~15 min of the same total, with one more change — take whichever departure fits.)",{car:1}),
  "inuyama>kyoto":L(1.6,1,"train","Meitetsu Inuyama→Meitetsu-Nagoya (~30 min), a ~10-min walk across to JR Nagoya, then a Tōkaidō 'Nozomi'/'Hikari' Nagoya→Kyoto (~35 min). One change and the shortest hop on the hokuriku board — Inuyama is effectively a Nagoya suburb with a castle.",{car:1}),
  "inuyama>tokyo":L(2.7,1,"train","Meitetsu Inuyama→Meitetsu-Nagoya (~30 min), a ~10-min walk across to JR Nagoya, then a Tōkaidō 'Nozomi' Nagoya→Tokyo (~1h40). One change; both legs run several times an hour.",{car:1}),
  "inuyama>mikuni":L(3.6,2,"train","As inuyama→Kanazawa as far as Tsuruga (~2h30), then the Hokuriku Shinkansen north to Awara-Onsen (~30 min) + the inn's free ~10-min shuttle (reserve the day before). Tsuruga is the gateway from this side, so Fukui-coast inns come in SHORTER than Kanazawa does.",{car:1}),
  "inuyama>eiheiji":L(3.6,2,"train","As inuyama→Kanazawa as far as Tsuruga (~2h30), Hokuriku Shinkansen Tsuruga→Fukui (~18 min), then a ~25-min cab straight between Fukui Stn and Eshikoto (Maps 22 min / 13.7 km) — no Echizen Railway, no rail change (2026-08-02: the Echizen Rly + 6-min-taxi chain this leg used to quote costs ~40 min and one extra change; tokyo>eiheiji already preferred the cab, so the inn's access was quoted differently by direction of travel). Two changes (Nagoya, Tsuruga).",{car:1}),
  "inuyama>yamashiro":L(3.8,2,"train","As inuyama→Kanazawa as far as Tsuruga (~2h30), Hokuriku Shinkansen Tsuruga→Kaga-Onsen (~35 min), then Beniya Mukayu's free on-demand shuttle (~15 min, call your arrival ahead). Two changes, at Nagoya and Tsuruga.",{car:1}),
  "inuyama>yamanaka":L(4.0,2,"train","As inuyama→Kanazawa as far as Tsuruga (~2h30), Hokuriku Shinkansen Tsuruga→Kaga-Onsen (~35 min), then a ~25-min taxi up to Yamanaka Onsen (the inn can arrange). Two changes.",{car:1}),
  "inuyama>toyama":L(4.8,3,"train","As inuyama→Kanazawa (~3h40), change to the Hokuriku Shinkansen Kanazawa→Toyama (~23 min), then the ~40-min car up the Jinzu gorge to Garaku. Longer on paper than the direct 'Hida' (Nagoya→Toyama ~4h) but far more dependable — only ~4–5 'Hida' run through to Toyama, and they don't reliably call at Unuma.",{car:1,awkward:1}),
  "inuyama>notojima":L(5.3,3,"train","As inuyama→Kanazawa (~3h40), change to the JR Ltd Exp 'Noto Kagaribi' Kanazawa→Wakura-Onsen (~1h08, ~5/day), then a ~10-min taxi across the Notojima bridge. Three changes and the Kagaribi's thin frequency sets the day — the long corner of the region from here.",{car:1,awkward:1}),


  "suwa>matsumoto":L(1.25,0,"train","Inn car to Kamisuwa/Shimosuwa (~5–10 min), Ltd Exp 'Azusa'→Matsumoto (~24–25 min), then Myojinkan's shuttle (~35–45 min, reserve). Azusa timetable: Shinjuku→Kamisuwa 2h13–2h22, Kamisuwa→Matsumoto 24–25 min. Kamisuwa (Sui Suwako, ~10-min car) and Shimosuwa (Iwanoyu, ~5-min car) are one stop apart, so they share this loc.",{car:1}),
  "suwa>tokyo":L(2.5,0,"train","Ltd Exp 'Azusa' Kamisuwa/Shimosuwa→Shinjuku (~2h13–2h22, direct), plus the ~5–10-min inn car. Suwa's real advantage: the Azusa reaches it ~25 min before Matsumoto, so it is the closest north inn to Tokyo after the Gunma pair. Azusa timetable: Shinjuku→Kamisuwa 2h13–2h22, Kamisuwa→Matsumoto 24–25 min. Kamisuwa (Sui Suwako, ~10-min car) and Shimosuwa (Iwanoyu, ~5-min car) are one stop apart, so they share this loc.",{car:1}),
  "suwa>kiso":L(1.9,1,"train","Inn car + 'Azusa'/local to Shiojiri (~15 min), the through 'Shinano'→Nagiso (~50 min), then Zenagi's inn car. Suwa sits closer to the Shiojiri junction than Matsumoto does.",{car:1}),
  "suwa>karuizawa":L(2.33,2,"shinkansen","Via Matsumoto: 'Shinano'→Nagano (~50 min), Hokuriku Shinkansen 'Asama'→Karuizawa (~30 min) + a ~15-min taxi. Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1}),
  "suwa>yamadaonsen":L(2.4,1,"train","Via Matsumoto: 'Shinano'→Nagano (~50 min), then the ~30–45-min car up to Yamada Onsen (Fujiiso arranges). Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1}),
  "suwa>yudanaka":L(2.75,2,"train","Via Matsumoto: 'Shinano'→Nagano (~50 min), then the Nagaden Ltd Exp→Yudanaka (~45 min) + ~7 min. Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1}),
  "suwa>kanazawa":L(3.0,2,"shinkansen","Via Matsumoto: 'Shinano'→Nagano (~50 min), change to the Hokuriku Shinkansen→Kanazawa (~65–70 min). Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1,awkward:1}),
  "suwa>tanigawa":L(3.5,3,"shinkansen","Via Matsumoto: 'Shinano'→Nagano, 'Asama'→Takasaki, change to the Jōetsu Shinkansen→Jōmō-Kōgen (~17 min) + the ~20-min taxi. Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1,awkward:1}),
  "suwa>echigoyuzawa":L(3.83,3,"shinkansen","Via Matsumoto: 'Shinano'→Nagano (~50 min), 'Asama'→Takasaki (~53 min), change to the Jōetsu Shinkansen→Echigo-Yuzawa (~30 min) + the ~30-min inn car. No shortcut — Nagano→Echigo-Yuzawa always detours south to Takasaki. Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1,awkward:1}),
  "suwa>kamasaki":L(4.9,3,"shinkansen","Via Matsumoto and the Tōhoku spine to Shiroishi-Zaō + inn shuttle. Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1,awkward:1}),
  "suwa>nikko":L(4.6,4,"shinkansen","Via Matsumoto: 'Shinano'→Nagano, Hokuriku Shinkansen→Ōmiya, Tōhoku Shinkansen→Utsunomiya, then the JR Nikkō-Line local + inn shuttle. ⚠ ends on the hourly, snow-slow Nikkō local. Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1,awkward:1}),
  "suwa>tsuchiyu":L(4.8,3,"shinkansen","Via Matsumoto and Ōmiya to a Tōhoku 'Yamabiko'→Fukushima, then the ~25-min taxi up to Tsuchiyu. Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1,awkward:1}),
  "suwa>iizaka":L(5.1,4,"train","As suwa→Fukushima, then the Fukushima Kōtsū Iizaka line→Iizaka Onsen (~23 min) + a short inn shuttle. Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1,awkward:1}),
  "suwa>sukagawa":L(5.2,4,"shinkansen","Via Matsumoto and Ōmiya, 'Yamabiko'→Kōriyama, then a Tōhoku Main local one hop→Sukagawa + shuttle. Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1,awkward:1}),
  "suwa>bandaiatami":L(5.3,4,"shinkansen","Via Matsumoto and Ōmiya, 'Yamabiko'→Kōriyama, then the Ban'etsu-West local→Bandai-Atami + shuttle. Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1,awkward:1}),
  "suwa>akayu":L(5.5,3,"shinkansen","Via Matsumoto and Ōmiya, then the through Yamagata 'Tsubasa'→Akayu + a short taxi. ⚠ the Itaya-pass Tsubasa is the winter weak link. Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1,awkward:1}),
  "suwa>kaminoyama":L(5.6,3,"shinkansen","Via Matsumoto and Ōmiya, then the through 'Tsubasa'→Kaminoyama-Onsen + a short taxi. Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1,awkward:1}),
  "suwa>shizukuishi":L(5.6,3,"shinkansen","Via Matsumoto and Ōmiya, then the Tōhoku line to Morioka + the free hotel shuttle. Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1,awkward:1}),
  "suwa>kakunodate":L(6.1,3,"shinkansen","Via Matsumoto and Ōmiya, then the through Akita 'Komachi'→Kakunodate + a ~12-min taxi. ⚠ January snow north of Morioka. Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1,awkward:1}),
  "suwa>aizuwakamatsu":L(6.2,4,"train","Via Matsumoto and Ōmiya, 'Yamabiko'→Kōriyama, then the Ban'etsu-West line west→Aizu-Wakamatsu + taxi. Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1,awkward:1}),
  "suwa>hottoyuda":L(7.1,4,"train","Via Matsumoto and Ōmiya, 'Hayabusa'→Kitakami, then the Kitakami-line local→Hottoyuda + shuttle. ⚠ deep-snow branch line; the longest leg in the table from Suwa. Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1,awkward:1}),
  "suwa>matsunoyama":L(5.1,5,"train","Via Matsumoto: 'Shinano'→Nagano, 'Asama'→Takasaki, Jōetsu Shinkansen→Echigo-Yuzawa, JR local→Muikamachi, Hokuhoku→Matsudai + the ~20-min inn shuttle. Four self-handled changes. Getting to Matsumoto from Suwa (inn car + the 24–25-min 'Azusa', then a self-handled change onto the onward train) costs one MORE transfer and ~20 min vs the Matsumoto counterpart — priced in here (2026-07-27 sweep); the onward rail is identical and already researched.",{car:1,awkward:1}),

  /* Kyushu intra-region city legs (the 3 Kyushu hub cities — researched, never estimated) */
  "fukuoka>kagoshima":L(1.4,0,"shinkansen","Kyushu Shinkansen 'Mizuho' Hakata→Kagoshima-Chūō (~1h17; 'Sakura' ~1h35), no change."),
  "kagoshima>nagasaki":L(3.0,2,"shinkansen","Kyushu Shinkansen 'Mizuho'/'Sakura' Kagoshima-Chūō→Shin-Tosu (~1h10–1h25), change to the 'Relay Kamome' Ltd Exp→Takeo-Onsen (~50 min), then cross-platform to the Nishi-Kyushu Shinkansen 'Kamome'→Nagasaki (~30 min). ~3h, 2 changes.",{awkward:1}),
  /* Kyushu / Inland-Sea ↔ Kansai spine */
  "fukuoka>kyoto":L(3.5,0,"shinkansen","Sanyo/Tokaido Shinkansen Nozomi/Mizuho Hakata→Kyoto, no change (~3h)."),
  "kagoshima>kyoto":L(5.25,1,"shinkansen","Kyushu Shinkansen Mizuho Kagoshima-Chūō→Shin-Osaka (~3h45), change to Tokaido→Kyoto."),
  "hiroshima>fukuoka":L(1.1,0,"shinkansen","Sanyo Shinkansen Nozomi direct Hiroshima→Hakata, no change (~1h)."),
  "hiroshima>kyoto":L(1.9,0,"shinkansen","Sanyo+Tokaido Shinkansen Nozomi direct Hiroshima→Kyoto (~1h35)."),
  /* Fukuoka → Seto Inland Sea — the Kyushu→Inland-Sea continuation, eastbound on the Sanyo line
     (Nozomi skips Fukuyama & Mihara, so Sakura/Hikari/Kodama for those two) */
  "fukuoka>tomonoura":L(2.5,0,"shinkansen","Sanyo Shinkansen 'Sakura'/'Hikari' Hakata→Fukuyama (~1h25; Nozomi skips Fukuyama), then a ~30-min inn shuttle/taxi to the Tomonoura waterfront (reserve the shuttle — fixed times).",{car:1}),
  "fukuoka>setoda":L(3.2,1,"train","Sanyo Shinkansen 'Kodama' Hakata→Mihara (~2h10–2h30; Nozomi/Mizuho skip Mihara), then the Habu Shōsen ferry Mihara→Setoda (~25 min) + short walk. Confirm the day's last winter ferry.",{awkward:1}),
  "fukuoka>hatsukaichi":L(2.25,1,"train","Sanyo Shinkansen Nozomi Hakata→Hiroshima (~1h), change to the JR Sanyo Main Line→Ono-ura/Miyahama (~35–45 min), then a ~5-min inn shuttle/taxi (call ahead).",{car:1}),
  "fukuoka>miyajima":L(2.25,2,"train","Sanyo Shinkansen Nozomi Hakata→Hiroshima (~1h), JR Sanyo Main Line→Miyajimaguchi (~25 min), then the ~10-min ferry to Miyajima + short walk."),
  "tokyo>kyoto":L(2.75,0,"shinkansen","Tokaido Shinkansen Nozomi direct Tokyo→Kyoto (~2h15)."),
  "kanazawa>kyoto":L(2.5,1,"train","Hokuriku Shinkansen Kanazawa→Tsuruga (~50 min), change to Thunderbird Ltd Exp→Kyoto (post-2024 routing). Snow-risk in January."),
  /* Tokyo → opener stops placed first (researched door-to-door, realistic connections) */
  "tokyo>tsuchiyu":L(2.25,0,"shinkansen","Tōhoku Shinkansen Tokyo→Fukushima (~90 min direct), then the ~25-min taxi to Tsuchiyu Onsen — the same taxi connector used on every other Fukushima-hub leg (tsuchiyu>akayu, tanigawa>tsuchiyu, etc). Skip the Fukushima Kōtsū public bus: it's sparse (a 2h15 midday gap) and was mistakenly used for this leg only, inflating it to 3.75h."),
  "tokyo>iizaka":L(2.0,1,"train","Tōhoku Shinkansen Tokyo→Fukushima (~90 min), change to the Fukushima Kōtsū Iizaka line→Iizaka Onsen (~20–25 min, runs ~every 30 min)."),
  "tokyo>bandaiatami":L(2.2,1,"shinkansen","Tōhoku Shinkansen Tokyo→Kōriyama (~80 min; 'Yamabiko' stops, most 'Hayabusa' skip Kōriyama), change to the JR Ban'etsu-West line ~15 min to Bandai-Atami + short taxi (reserve the inn car). Inland Fukushima — periodic January snow, but the main line is reliable.",{car:1}),
  "tokyo>akayu":L(2.5,0,"shinkansen","Yamagata Shinkansen 'Tsubasa' direct Tokyo→Akayu (~2h20) — pick a train that stops at Akayu — then a short taxi/inn shuttle."),
  "tokyo>kakunodate":L(3.1,0,"shinkansen","Akita Shinkansen 'Komachi' direct Tokyo→Kakunodate (~3h, one seat). Snow-prone on the single-track stretch past Morioka."),
  /* Shizukuishi / Koiwai Farm (Azuma Farm Koiwai) — researched Jul 2026 (official access page + JR timetables). */
  "tokyo>shizukuishi":L(3.0,0,"shinkansen","Tōhoku Shinkansen 'Hayabusa' Tokyo→Morioka (~2h15), then the free hotel shuttle from Morioka Station (~25–30 min, reserve). The Tōhoku line is famously snow-reliable."),
  "shizukuishi>sendai":L(1.5,0,"shinkansen","Hotel shuttle to Morioka (~25–30 min), Tōhoku Shinkansen 'Hayabusa'→Sendai (~40 min)."),
  "shizukuishi>kakunodate":L(1.7,0,"shinkansen","Hotel shuttle to Morioka (~25–30 min), Akita 'Komachi'→Kakunodate (~50 min), then a ~12-min taxi/inn car — chains the two Tōhoku inns cleanly."),
  "tokyo>hottoyuda":L(4.0,1,"shinkansen","Tōhoku Shinkansen Tokyo→Kitakami (~2h50), change to the JR Kitakami line→Hottoyuda (~50 min, sparse), then a ~6-min inn taxi. ⚠ deep-snow branch line off the main spine — build in a connection buffer.",{awkward:1}),
  "sendai>hottoyuda":L(2,1,"shinkansen","Tōhoku Shinkansen Sendai→Kitakami (~40 min), change to the JR Kitakami line→Hottoyuda (~50 min, sparse), then a ~6-min inn taxi — the region-hub leg."),
  "tokyo>kaminoyama":L(2.75,0,"shinkansen","Yamagata Shinkansen 'Tsubasa' direct Tokyo→Kaminoyama-Onsen (~2h40), then a ~6-min taxi. ⚠ the Itaya-pass Tsubasa is among Japan's most winter-delay-prone segments."),
  /* kaminoyama↔sendai: authored once as "kaminoyama>sendai" (direct expressway bus) in the
     gateway block below. A rival "sendai>kaminoyama" rail version (1.25h/1tx via Fukushima) was
     deleted 2026-07-26 — same city pair, two modes, not a directional asymmetry. */
  "tokyo>aizuwakamatsu":L(3.1,1,"train","Tōhoku Shinkansen Tokyo→Kōriyama (~80 min), change to the JR Ban'etsu-West line→Aizu-Wakamatsu (~65–80 min), then a ~15-min taxi to Higashiyama Onsen. ⚠ the Ban'etsu-West crosses snow country.",{awkward:1}),
  /* aizuwakamatsu↔sendai: authored once as "aizuwakamatsu>sendai" in the gateway block below
     (2.25h). The old 1.9h here undercounted its own segment list (40 + 65–80 + 15 min ≥ 2h). */
  "tokyo>sukagawa":L(1.75,1,"train","Tōhoku Shinkansen Tokyo→Kōriyama (~80 min), change to a JR Tōhoku Main Line local→Sukagawa (~10 min), then the ~10-min inn shuttle (reserve)."),
  /* sukagawa↔sendai: authored once as "sukagawa>sendai" in the gateway block below (1.3h).
     The old 1.0h here was pure riding time with zero Kōriyama connection slack. */
  "tokyo>sendai":L(1.7,0,"shinkansen","Tōhoku Shinkansen 'Hayabusa' direct Tokyo→Sendai (~1h31)."),
  "tokyo>kanazawa":L(2.7,0,"shinkansen","Hokuriku Shinkansen 'Kagayaki' direct Tokyo→Kanazawa (~2h28)."),
  /* ── North country (snow country + Tōhoku) — researched Jun 2026; full matrix in research/transit-notes.md Part C.
     Structural fact: the Jōetsu line (Senjuan=tanigawa, Satoyama Jujo=echigoyuzawa) and the Tōhoku line
     (everything else) share rails only on the Takasaki–Ōmiya–Tokyo trunk, so crossing between them backtracks
     via Ōmiya. Yamagata branch (Tsubasa) splits at Fukushima; Akita branch (Komachi) at Morioka. Legs auto-reverse. */
  // Senjuan ↔ Satoyama Jujo: ~44-min direct drive over the Kan-Etsu tunnel (48 km) — a chartered car,
  // far quicker than backtracking onto the Shinkansen. The cleanest back-to-back anywhere.
  "echigoyuzawa>tanigawa":L(1.4,0,"car","RAIL-primary (2026-07-28 — keeps the leg off the closure-prone road): inn car→Echigo-Yuzawa (~30 min), one-stop Jōetsu Shinkansen→Jōmō-Kōgen (~13 min, ~hourly 'Toki'), ~20-min taxi to Senjuan. No self-handled change. Car alt: ~55 km/~55 min via the Kan-Etsu Expressway — faster on a clear day, but ⚠ chains banned in-tunnel, checkpoints, and NEXCO preventive closures in heavy snow (Dec-2020 precedent). (Minakami-local version: Senjuan shuttle→Minakami + Jōetsu-line local ~40 min, ~6-8/day — similar total.)",{car:1}),
  // Senjuan → the Tōhoku/Yamagata/Akita inns: backtrack south to Ōmiya, then north.
  "tanigawa>tsuchiyu":L(2.9,1,"train","Jōetsu Shinkansen Jōmō-Kōgen→Ōmiya (~53 min, backtrack south), change to Tōhoku 'Yamabiko'→Fukushima (~1h10), then ~25-min taxi up to Tsuchiyu. Both rail legs snow-prone.",{awkward:1}),
  "tanigawa>iizaka":L(3,2,"train","As tanigawa→Fukushima (via Ōmiya), then the Fukushima Kōtsū Iizaka line→Iizaka Onsen (~23 min) + short inn shuttle.",{awkward:1}),
  "tanigawa>akayu":L(3.6,1,"shinkansen","Jōetsu Shinkansen→Ōmiya (backtrack), change to Yamagata 'Tsubasa'→Akayu (~30–35 min past Fukushima) + short taxi/shuttle. ⚠ Tsubasa over the Itaya pass is among the most winter-delay-prone segments.",{awkward:1}),
  "tanigawa>kakunodate":L(4.1,1,"shinkansen","Jōetsu Shinkansen→Ōmiya (backtrack), change to Akita 'Komachi'→Kakunodate (Ōmiya→Kakunodate ~2h35) + ~12-min taxi. ⚠ Komachi on snow-prone conventional track past Morioka.",{awkward:1}),
  // Satoyama Jujo → the Fukushima inns.
  "echigoyuzawa>tsuchiyu":L(3.2,1,"train","Echigo-Yuzawa→Ōmiya (Jōetsu, backtrack), change to Tōhoku 'Yamabiko'→Fukushima, then ~25-min taxi up to Tsuchiyu.",{awkward:1}),
  "echigoyuzawa>iizaka":L(3.2,2,"train","As echigoyuzawa→Fukushima (via Ōmiya), then the Iizaka line→Iizaka Onsen (~23 min) + inn shuttle.",{awkward:1}),
  // Fukushima hub → the branch-line inns (the recommended out-and-back pattern).
  "tsuchiyu>akayu":L(1.6,0,"shinkansen","Down to Fukushima (~25-min taxi), then a direct Yamagata 'Tsubasa'→Akayu (~40 min). ⚠ Itaya-pass Tsubasa is the most snow-fragile leg here."),
  "iizaka>akayu":L(1.6,1,"shinkansen","Iizaka line→Fukushima (~23 min), then a direct Yamagata 'Tsubasa'→Akayu (~40 min). ⚠ snow-fragile."),
  /* Bandai-Atami (Atamiso) — on the JR Ban'etsu-West line, one hop east to the Kōriyama Shinkansen hub.
     Kept real, not Sendai-hub-estimated (Kōriyama sits SOUTH of the Fukushima/Yamagata inns, so an estimate
     via Sendai would overshoot). */
  "bandaiatami>tsuchiyu":L(1.25,1,"train","JR Ban'etsu-West Bandai-Atami→Kōriyama (~15 min), change to the Tōhoku Shinkansen→Fukushima (~13 min), then the ~25-min taxi up to Tsuchiyu — the standard Fukushima-hub connector.",{car:1}),
  "bandaiatami>iizaka":L(1.5,2,"train","JR Ban'etsu-West Bandai-Atami→Kōriyama (~15 min), Tōhoku Shinkansen→Fukushima (~13 min), change to the Fukushima Kōtsū Iizaka line→Iizaka Onsen (~23 min) + short inn shuttle.",{car:1}),
  "bandaiatami>akayu":L(1.75,1,"shinkansen","JR Ban'etsu-West Bandai-Atami→Kōriyama (~18 min), then board a Kōriyama-stopping 'Tsubasa' straight through to Akayu (~60 min — one change, no Fukushima re-change) + short taxi. ⚠ the Itaya-pass Tsubasa is the most snow-fragile leg here.",{awkward:1,car:1}),
  "bandaiatami>kamasaki":L(1.6,1,"shinkansen","JR Ban'etsu-West Bandai-Atami→Kōriyama (~15 min), change to a Tōhoku 'Yamabiko'→Shiroishi-Zaō (~40 min; only Yamabiko stops there), then the inn shuttle. Reliable main line, low January snow risk.",{car:1}),
  "bandaiatami>sendai":L(1.0,1,"shinkansen","JR Ban'etsu-West Bandai-Atami→Kōriyama (~15 min), change to the Tōhoku 'Yamabiko'→Sendai (~30 min) — the region-hub leg, researched rather than estimated.",{car:1}),
  "tsuchiyu>kakunodate":L(3.9,1,"shinkansen","Down to Fukushima, Tōhoku 'Yamabiko'→Morioka, change to Akita 'Komachi'→Kakunodate (~3h53 rail) + ~12-min taxi.",{awkward:1}),
  "iizaka>kakunodate":L(3.9,2,"shinkansen","Iizaka line→Fukushima, Tōhoku 'Yamabiko'→Morioka, change to Akita 'Komachi'→Kakunodate (~3h53 rail) + ~12-min taxi.",{awkward:1}),
  // Akayu ↔ Kakunodate do NOT connect cleanly — route back via Fukushima/Morioka, not the ~7h Ōu locals.
  "akayu>kakunodate":L(4.75,2,"shinkansen","No cross-route: 'Tsubasa' Akayu→Fukushima (~40 min), 'Yamabiko'→Morioka, 'Komachi'→Kakunodate (~4.75h total). The direct Ōu-local route via Shinjō/Ōmagari is a ~7h winter ordeal — don't.",{awkward:1}),
  // North country → Kyoto (all via Tokyo + Tōkaidō; Hokuriku-via-Tsuruga never wins for the Jōetsu inns).
  "echigoyuzawa>kyoto":L(4.5,1,"shinkansen","Echigo-Yuzawa→Jōetsu 'Toki'→Tokyo (same-station change), Tōkaidō 'Nozomi'→Kyoto. The cleanest northern Kyoto exit — one transfer; snow risk is the inn access road, not the rail."),
  "tanigawa>kyoto":L(4.25,1,"shinkansen","Inn car + Jōetsu Shinkansen Jōmō-Kōgen→Tokyo (~1h50 door-to-door), Tōkaidō 'Nozomi'→Kyoto (~2h15)."),
  "iizaka>kyoto":L(4.7,2,"shinkansen","Iizaka line→Fukushima, Tōhoku Shinkansen→Tokyo, Tōkaidō 'Nozomi'→Kyoto."),
  /* tsuchiyu>kyoto, akayu>kyoto, kakunodate>kyoto were once route-stop times (Route 1 Tōhoku→Kyoto)
     that shadowed researched values; now unified into the "ex-route legs" block at the foot of LEGS. */
  // North country → Izu / Hakone / Fuji. The surprise: Izu (Mishima) is the easy one — Tōkaidō out of the
  // SAME Tokyo Station the northern lines hit, so the transfer is platform-to-platform (no Shinjuku drag).
  "tanigawa>izu":L(3.4,2,"shinkansen","Jōetsu Shinkansen→Tokyo (same-station change), Tōkaidō→Mishima (~45 min), then Izu-Hakone line→Shuzenji + taxi (~40 min). ~2h10 to Mishima — the single cleanest north→south hop."),
  "echigoyuzawa>izu":L(3.8,2,"shinkansen","Jōetsu 'Toki'→Tokyo (same-station change), Tōkaidō→Mishima, Izu-Hakone line→Shuzenji + taxi."),
  "tsuchiyu>izu":L(3.9,2,"train","~25-min taxi down to Fukushima, Tōhoku Shinkansen→Tokyo (same-station change), Tōkaidō→Mishima, Izu-Hakone line→Shuzenji + taxi.",{awkward:1}),
  "iizaka>izu":L(3.9,3,"train","Iizaka line→Fukushima, Tōhoku Shinkansen→Tokyo (same-station change), Tōkaidō→Mishima, Izu-Hakone line→Shuzenji + taxi.",{awkward:1}),
  "tanigawa>hakone":L(3,2,"shinkansen","Jōetsu Shinkansen→Tokyo, Tōkaidō→Odawara, Hakone Tozan railway up (avoids the Shinjuku Romancecar drag)."),
  "echigoyuzawa>hakone":L(3.3,2,"shinkansen","Jōetsu 'Toki'→Tokyo, Tōkaidō→Odawara, Hakone Tozan up."),
  "tsuchiyu>hakone":L(3.5,2,"train","~25-min taxi down to Fukushima, Tōhoku Shinkansen→Tokyo, Tōkaidō→Odawara, Hakone Tozan up."),
  "iizaka>hakone":L(3.6,3,"train","Iizaka line→Fukushima, Tōhoku Shinkansen→Tokyo, Tōkaidō→Odawara, Hakone Tozan up."),
  "tanigawa>kawaguchiko":L(4.2,2,"train","Jōetsu Shinkansen→Tokyo, hop to Shinjuku, JR 'Fuji Excursion'→Kawaguchiko. ⚠ the direct Fuji train runs only ~4 morning departures (last ~11:30) — leave early or eat an Ōtsuki transfer.",{awkward:1}),
  "echigoyuzawa>kawaguchiko":L(4.5,2,"train","Jōetsu 'Toki'→Tokyo→Shinjuku, JR 'Fuji Excursion'→Kawaguchiko. ⚠ limited morning Fuji departures.",{awkward:1}),
  "tsuchiyu>kawaguchiko":L(4.6,2,"train","~25-min taxi down to Fukushima, Tōhoku Shinkansen→Tokyo→Shinjuku, 'Fuji Excursion'→Kawaguchiko. ⚠ long; limited Fuji departures.",{awkward:1}),
  "iizaka>kawaguchiko":L(4.7,3,"train","Iizaka line→Fukushima, Tōhoku Shinkansen→Tokyo→Shinjuku, 'Fuji Excursion'→Kawaguchiko. ⚠ limited Fuji departures.",{awkward:1}),
  // Fufu Nikko: geographically closest to the south cluster, but its fast train lands at Asakusa, not Tokyo Stn.
  "nikko>hakone":L(4,3,"train","JR Nikkō line→Utsunomiya (~45 min), Tōhoku Shinkansen→Tokyo (~50 min), Tōkaidō→Odawara (~35 min), then the direct Tozan BUS up to Gōra/Sengokuhara (~45 min — the bus avoids the Hakone-Yumoto rail change). ⚠ The JR–Tobu direct Nikko→Shinjuku ltd exp runs PM-only, and the Romancecar no longer through-runs to Gōra — the old \"direct + Romancecar\" chain doesn't work as a morning move.",{awkward:1}),
  "nikko>izu":L(4.2,3,"train","Tōbu Spacia→Asakusa, cross to Tokyo Stn, Tōkaidō→Mishima, Izu-Hakone line→Shuzenji + taxi.",{awkward:1}),
  "nikko>kawaguchiko":L(4.8,3,"train","JR Nikkō line→Utsunomiya (~45 min), Tōhoku Shinkansen→Tokyo (~50 min), cross to Shinjuku (~15 min), 'Fuji Excursion'→Kawaguchiko (~1h55) + taxi. ⚠ The Fuji Excursion is ~4/day and AM-weighted while the JR–Tobu direct Nikko→Shinjuku runs PM-only — the \"direct + Fuji Excursion\" same-day chain does not exist; leave Nikkō early via Utsunomiya.",{awkward:1}),
  /* Region-hub access for the Fuji/Yamanashi, Ise & Onomichi inns (researched Jun 2026; auto-reverses) */
  "kawaguchiko>tokyo":L(2.0,0,"train","JR 'Fuji Excursion' Ltd Exp Kawaguchiko→Shinjuku direct (~2h, ~4/day). Miss it → Fujikyu→Ōtsuki + Chūō Ltd Exp = ~2h25, 1 change."),
  /* The south-side exit off the lakes, researched 2026-09-10 for the trip kit: the Fujikyu
     'Mishima·Kawaguchiko Liner' limited-express bus puts the Tōkaidō Shinkansen within one change of
     Kawaguchiko without going back through Tokyo, which is what every westbound Fuji leg used to do.
     ~1h30–1h40, roughly hourly, ¥2,700 one way (japan-guide's Mishima–Gotemba–Kawaguchiko timetable,
     as of Oct 2025; Navitime's own liner timetable agrees). Auto-reverses; mishima carries no inn. */
  "kawaguchiko>mishima":L(1.9,0,"bus","Fujikyu 'Mishima·Kawaguchiko Liner' limited-express bus Kawaguchiko Station→Mishima Station, ~1h30–1h40, roughly hourly all day, ¥2,700 (japan-guide Mishima–Gotemba–Kawaguchiko timetable, Oct 2025). No change; allow the inn shuttle down to Kawaguchiko Station and the wait at the stop. Mishima is a Tōkaidō Shinkansen station, so this is the way off the lakes that does not go back through Tokyo."),
  "kobuchizawa>tokyo":L(2.0,0,"train","JR Chūō Ltd Exp 'Azusa' Kobuchizawa→Shinjuku direct (~1h50–2h, ~hourly)."),
  "ise>kyoto":L(2.0,1,"train","Kintetsu Ltd Exp Iseshi/Ujiyamada→Kyoto (~2h); most change at Yamato-Yagi, a few run direct (2/hr)."),
  "onomichi>hiroshima":L(1.0,1,"train","JR Sanyo local Onomichi→Fukuyama (~15 min), Sanyo Shinkansen Fukuyama→Hiroshima (~25 min) — change at Fukuyama (faster than Shin-Onomichi, 3 km out of town)."),
  /* Kansai onsen finales → airports */
  "katsuragi>kix":L(1.5,0,"car","Taxi/inn-arranged car straight down from the Katsuragi foothills to KIX — Amanosato sits about an hour from the airport by road (arrange with the inn) + airport processing on arrival (2026-07 audit: the old 1.0 gave KIX 30 minutes). (Transit: the Nankai chain via Namba runs ~3h with 2 changes — skip it.)",{car:1}),
  "amino>kix":L(4.75,1,"train","Shuttle/taxi to Amino, Ltd Exp 'Hashidate'→Kyoto (~2h40), change to Haruka→KIX (~80 min). Long; snow-risk.",{awkward:1,car:1}),
  "kinosaki>kix":L(3.9,1,"train","Ltd Exp 'Kounotori' Kinosaki Onsen→Shin-Osaka (~2h50), change to Haruka→KIX (~50 min)."),
  "arima>kix":L(2.6,1,"bus","Arima Express bus→Kobe-Sannomiya (~40 min), change to KATE airport limousine→KIX (~70 min)."),
  "arima>itm":L(1.5,0,"bus","Hankyu direct highway bus Arima→Itami (~70 min, sparse — reserve ahead)."),
  "nara>kix":L(1.9,1,"train","JR Yamatoji rapid Nara→Tennoji (~40 min), change to Haruka→KIX (~30 min)."),
  /* Kyoto → Kansai finales directly (when Nara is skipped — a logical move) */
  "kyoto>katsuragi":L(2.5,2,"train","JR to Kaseda via the Wakayama line (~2h15), then a PRE-BOOKED taxi ~15 min (~¥3k; Yuko-Kihoku 0736-22-3333 — Kaseda has no rank taxis) — frees you from Amanosato's 15:00-only shuttle (4-pax cap)."),
  "kyoto>amino":L(2.5,0,"train","Ltd Exp 'Hashidate' Kyoto→Amino direct (~2h30). Snow-risk in January.",{awkward:1}),
  "kyoto>kinosaki":L(2.5,0,"train","Ltd Exp 'Kinosaki' Kyoto→Kinosaki Onsen direct (~2h30)."),
  "kyoto>arima":L(1.75,2,"train","Kyoto→Shin-Osaka, change toward Sannomiya, then Arima Express bus (~1h45)."),
  /* Inland Sea finales → KIX (town last-mile folded in) */
  "tomonoura>kix":L(3.0,1,"shinkansen","Car/shuttle to Fukuyama (~30 min), Sanyo Shinkansen→Shin-Osaka (~62 min), change to Haruka→KIX.",{car:1}),
  "setoda>kix":L(3.6,2,"train","Ferry to Mihara (~30 min), Sanyo Shinkansen→Shin-Osaka, change to Haruka→KIX.",{awkward:1}),
  "onomichi>kix":L(3.0,2,"train","Local to Fukuyama (~20 min), Sanyo Shinkansen→Shin-Osaka, change to Haruka→KIX."),
  "hiroshima>kix":L(3.5,1,"shinkansen","Sanyo Shinkansen Nozomi→Shin-Osaka (~1h20), change to Haruka→KIX (~50 min)."),
  "hiroshima>itm":L(3.0,1,"shinkansen","Sanyo Shinkansen→Shin-Osaka (~1h20), airport limousine bus→Itami (~30 min)."),
  /* Mid-trip flight DOWN to Kyushu + the Fukuoka→south continuation (gaps surfaced Jun 2026).
     The engine is single-hop, so a northern opener that then flies to Kyushu (Senjuan→…→Fukuoka)
     had no leg and fell to a ~7h all-rail estimate via Sendai/Kyoto; and Fukuoka→Myoken collapsed
     to a bogus ~1h because Kirishima and Fukuoka share the Kyushu region hub. Both hand-researched. */
  "tanigawa>fukuoka":L(5.5,3,"flight","Off the mountain and south by air: inn car + Jōetsu Shinkansen Jōmō-Kōgen→Tokyo (~1h50 door-to-door), Tokyo→Haneda (~30 min), then HND→Fukuoka (~2h flight + airport time) and the subway 2 stops into Hakata/Tenjin (~5 min). ~5.5h door-to-door — a normal travel day, not a brutal one.",{flight:1}),
  "fukuoka>kirishima":L(2.75,1,"train","Kyushu Shinkansen 'Mizuho'/'Sakura' Hakata→Kagoshima-Chūō (~1h20), change to the JR Nippō line back up to Hayato (~40 min), then the ~15-min inn shuttle to Myoken Ishiharaso (reserve ahead)."),
  /* Kurokawa ↔ Yufuin pairing (researched 2026-06-21; transit-notes.md). Genuinely not route-encoded —
     no route runs a Kurokawa-inn → Yufuin-inn sequence (they're co-alternatives at one slot), so this
     is a true RESEARCHED-only leg. (kagoshima>yufuin lives in Route 2's enowa stop, not here.) */
  "kurokawa>yufuin":L(1.75,0,"bus","Kyushu Ōdan Bus direct (the Beppu–Yufuin–Kurokawa–Aso–Kumamoto cross-island line), ~1h45, ~¥2,370. ⚠ Only 2 buses/day each way — reserve; the last Kurokawa→Yufuin/Beppu departure is 16:55, so the transfer day must move by early afternoon. By car: 48 km straight over the Yamanami, ~1h05 (budget 1h30) — it crosses Makinoto Pass (1,330 m) itself and shaded stretches hold ice for days; iced over, the low road via Kokonoe IC + R387 (~600 m max) runs ~1h20."),
  /* The no-backtrack alternative to tanigawa>fukuoka: if the trip already runs through Kanazawa
     (north → hokuriku), fly out of Komatsu instead of doubling back to Haneda. ~4 ANA/ORC flights
     daily, ~1h40 (flightconnections, Jan 2026). Every leg stays forward — west, then south. */
  "kanazawa>fukuoka":L(3.75,2,"flight","West then south by air, no Tokyo backtrack: airport bus Kanazawa Station→Komatsu Airport (~40–50 min), a frequent ANA/Oriental Air Bridge hop KMQ→Fukuoka (~1h40, ~4 daily), then the subway 2 stops into Hakata/Tenjin (~5 min). ~3.75h door-to-door.",{flight:1}),
  /* ── Hokuriku (Kanazawa & the Crab Coast) → Kyushu by air (added 2026-07-17, extends kanazawa>fukuoka).
     Komatsu (KMQ) is the gateway for Kanazawa, Yamashiro, Yamanaka and Mikuni/Awara (all ≤~45 min out);
     Toyama flies from its own airport (TOY). Both run ~1h40 ANA/IBEX/ORC into Fukuoka, ~3–4 daily
     (flightconnections/ANA, Jan 2026). Every deep-Kyushu leg = that flight INTO Hakata + the existing
     researched Hakata→destination segment (fukuoka>kagoshima, fukuoka>kirishima, kurokawa>fukuoka, …);
     door-to-door = flight-to-Hakata + onward. The all-rail hub estimate routes via Kyoto (~6–8h) and is
     both slow and wrong for these — hence explicit legs. NB the standing preference is one landmass per trip;
     these exist so a Kanazawa→Kyushu pivot resolves honestly if built, not as an endorsement of the combo. */
  /* gateways: the 4 inn-locs → Fukuoka (kanazawa>fukuoka above is the 5th) */
  "yamashiro>fukuoka":L(3.5,2,"flight","Yamashiro Onsen sits right by Komatsu Airport: ~15-min taxi to KMQ, the KMQ→Fukuoka hop (~1h40, ~4 daily ANA/ORC), then the subway 2 stops into Hakata (~5 min). ~3.5h door-to-door — the shortest Hokuriku→Kyushu run.",{flight:1}),
  "yamanaka>fukuoka":L(3.75,2,"flight","~25-min taxi from Yamanaka Onsen to Komatsu Airport, the KMQ→Fukuoka hop (~1h40, ~4 daily ANA/ORC), then the subway 2 stops into Hakata (~5 min). ~3.75h door-to-door.",{flight:1}),
  "mikuni>fukuoka":L(3.75,2,"flight","~30-min taxi/bus from Mikuni/Awara to Komatsu Airport, the KMQ→Fukuoka hop (~1h40, ~4 daily ANA/ORC), then the subway 2 stops into Hakata (~5 min). ~3.75h door-to-door.",{flight:1}),
  "toyama>fukuoka":L(3.75,2,"flight","Airport bus Toyama Station→Toyama Airport (~25 min), the TOY→Fukuoka hop (~1h40, ~3 daily ANA/IBEX), then the subway 2 stops into Hakata (~5 min). ~3.75h door-to-door.",{flight:1}),

  /* Kanazawa → Kyushu (fly KMQ→Hakata, then the researched onward segment) */
  "kanazawa>kagoshima":L(5.25,3,"flight","Fly to Kyushu then south: airport bus Kanazawa→Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Kyushu Shinkansen 'Mizuho' Hakata→Kagoshima-Chūō (~1h17). ~5.25h door-to-door.",{flight:1}),
  "kanazawa>kumamoto":L(4.5,3,"flight","Airport bus Kanazawa→Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Kyushu Shinkansen Hakata→Kumamoto (~35 min). ~4.5h door-to-door.",{flight:1}),
  "kanazawa>nagasaki":L(5.75,4,"flight","Airport bus Kanazawa→Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then the Nishi-Kyushu Shinkansen relay Hakata→Nagasaki via Takeo-Onsen (~2h). ~5.75h door-to-door.",{flight:1}),
  "kanazawa>kirishima":L(6.5,4,"flight","Airport bus Kanazawa→Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Kyushu Shinkansen Hakata→Kagoshima-Chūō + JR Nippō to Hayato + inn shuttle to Myoken (~2h45). ~6.5h — a full travel day.",{flight:1}),
  "kanazawa>yufuin":L(6.0,3,"flight","Airport bus Kanazawa→Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Ltd Exp 'Yufu'/'Yufuin-no-Mori' Hakata→Yufuin (~2h10). ~6h door-to-door. (Oita is Yufuin's own airport but has no Komatsu flight — Hakata is the gateway.)",{flight:1}),
  "kanazawa>kurokawa":L(6.5,3,"flight","Airport bus Kanazawa→Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then the direct highway bus Hakata→Kurokawa Onsen (~2h30–3h, reserve) + inn pickup. ~6.5h door-to-door.",{flight:1}),
  "kanazawa>unzen":L(6.75,5,"flight","Airport bus Kanazawa→Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Nishi-Kyushu relay Hakata→Isahaya + Shimatetsu bus to Unzen Onsen (~3h). ~6.75h — the longest of these.",{flight:1,awkward:1}),
  "kanazawa>takeo":L(4.75,3,"flight","Airport bus Kanazawa→Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Ltd Exp 'Relay Kamome' Hakata→Takeo-Onsen (~1h). ~4.75h door-to-door.",{flight:1}),
  "kanazawa>karatsu":L(5.0,3,"flight","Airport bus Kanazawa→Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then the subway/JR Chikuhi through-service Hakata→Karatsu (~75 min). ~5h door-to-door.",{flight:1}),
  "kanazawa>hita":L(5.25,3,"flight","Airport bus Kanazawa→Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then the Kyudai-line Ltd Exp Hakata→Amagase for Hita/Tensui (~1h30). ~5.25h door-to-door.",{flight:1}),

  /* Yamashiro → Kyushu (closest to Komatsu; ~3.5h to Hakata + onward) */
  "yamashiro>kagoshima":L(5.0,3,"flight","~15-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Kyushu Shinkansen 'Mizuho'→Kagoshima-Chūō (~1h17). ~5h door-to-door.",{flight:1}),
  "yamashiro>kumamoto":L(4.25,3,"flight","~15-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Kyushu Shinkansen→Kumamoto (~35 min). ~4.25h door-to-door.",{flight:1}),
  "yamashiro>nagasaki":L(5.5,4,"flight","~15-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Nishi-Kyushu relay→Nagasaki via Takeo-Onsen (~2h). ~5.5h door-to-door.",{flight:1}),
  "yamashiro>kirishima":L(6.25,4,"flight","~15-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Kyushu Shinkansen→Kagoshima-Chūō + JR Nippō→Hayato + shuttle to Myoken (~2h45). ~6.25h.",{flight:1}),
  "yamashiro>yufuin":L(5.75,3,"flight","~15-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Ltd Exp 'Yufu'→Yufuin (~2h10). ~5.75h door-to-door.",{flight:1}),
  "yamashiro>kurokawa":L(6.25,3,"flight","~15-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then highway bus Hakata→Kurokawa Onsen (~2h30–3h, reserve). ~6.25h.",{flight:1}),
  "yamashiro>unzen":L(6.5,5,"flight","~15-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Nishi-Kyushu relay→Isahaya + Shimatetsu bus→Unzen (~3h). ~6.5h.",{flight:1,awkward:1}),
  "yamashiro>takeo":L(4.5,3,"flight","~15-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Ltd Exp 'Relay Kamome'→Takeo-Onsen (~1h). ~4.5h door-to-door.",{flight:1}),
  "yamashiro>karatsu":L(4.75,3,"flight","~15-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then subway/JR Chikuhi through-service→Karatsu (~75 min). ~4.75h.",{flight:1}),
  "yamashiro>hita":L(5.0,3,"flight","~15-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Kyudai-line Ltd Exp→Amagase for Hita/Tensui (~1h30). ~5h door-to-door.",{flight:1}),

  /* Yamanaka → Kyushu (~25 min to Komatsu; times track Kanazawa) */
  "yamanaka>kagoshima":L(5.25,3,"flight","~25-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Kyushu Shinkansen 'Mizuho'→Kagoshima-Chūō (~1h17). ~5.25h door-to-door.",{flight:1}),
  "yamanaka>kumamoto":L(4.5,3,"flight","~25-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Kyushu Shinkansen→Kumamoto (~35 min). ~4.5h door-to-door.",{flight:1}),
  "yamanaka>nagasaki":L(5.75,4,"flight","~25-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Nishi-Kyushu relay→Nagasaki via Takeo-Onsen (~2h). ~5.75h door-to-door.",{flight:1}),
  "yamanaka>kirishima":L(6.5,4,"flight","~25-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Kyushu Shinkansen→Kagoshima-Chūō + JR Nippō→Hayato + shuttle to Myoken (~2h45). ~6.5h.",{flight:1}),
  "yamanaka>yufuin":L(6.0,3,"flight","~25-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Ltd Exp 'Yufu'→Yufuin (~2h10). ~6h door-to-door.",{flight:1}),
  "yamanaka>kurokawa":L(6.5,3,"flight","~25-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then highway bus Hakata→Kurokawa Onsen (~2h30–3h, reserve). ~6.5h.",{flight:1}),
  "yamanaka>unzen":L(6.75,5,"flight","~25-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Nishi-Kyushu relay→Isahaya + Shimatetsu bus→Unzen (~3h). ~6.75h.",{flight:1,awkward:1}),
  "yamanaka>takeo":L(4.75,3,"flight","~25-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Ltd Exp 'Relay Kamome'→Takeo-Onsen (~1h). ~4.75h door-to-door.",{flight:1}),
  "yamanaka>karatsu":L(5.0,3,"flight","~25-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then subway/JR Chikuhi through-service→Karatsu (~75 min). ~5h.",{flight:1}),
  "yamanaka>hita":L(5.25,3,"flight","~25-min taxi to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Kyudai-line Ltd Exp→Amagase for Hita/Tensui (~1h30). ~5.25h door-to-door.",{flight:1}),

  /* Mikuni/Awara → Kyushu (~30 min to Komatsu; times track Kanazawa) */
  "mikuni>kagoshima":L(5.25,3,"flight","~30-min taxi/bus to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Kyushu Shinkansen 'Mizuho'→Kagoshima-Chūō (~1h17). ~5.25h door-to-door.",{flight:1}),
  "mikuni>kumamoto":L(4.5,3,"flight","~30-min taxi/bus to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Kyushu Shinkansen→Kumamoto (~35 min). ~4.5h door-to-door.",{flight:1}),
  "mikuni>nagasaki":L(5.75,4,"flight","~30-min taxi/bus to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Nishi-Kyushu relay→Nagasaki via Takeo-Onsen (~2h). ~5.75h door-to-door.",{flight:1}),
  "mikuni>kirishima":L(6.5,4,"flight","~30-min taxi/bus to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Kyushu Shinkansen→Kagoshima-Chūō + JR Nippō→Hayato + shuttle to Myoken (~2h45). ~6.5h.",{flight:1}),
  "mikuni>yufuin":L(6.0,3,"flight","~30-min taxi/bus to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Ltd Exp 'Yufu'→Yufuin (~2h10). ~6h door-to-door.",{flight:1}),
  "mikuni>kurokawa":L(6.5,3,"flight","~30-min taxi/bus to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then highway bus Hakata→Kurokawa Onsen (~2h30–3h, reserve). ~6.5h.",{flight:1}),
  "mikuni>unzen":L(6.75,5,"flight","~30-min taxi/bus to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Nishi-Kyushu relay→Isahaya + Shimatetsu bus→Unzen (~3h). ~6.75h.",{flight:1,awkward:1}),
  "mikuni>takeo":L(4.75,3,"flight","~30-min taxi/bus to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Ltd Exp 'Relay Kamome'→Takeo-Onsen (~1h). ~4.75h door-to-door.",{flight:1}),
  "mikuni>karatsu":L(5.0,3,"flight","~30-min taxi/bus to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then subway/JR Chikuhi through-service→Karatsu (~75 min). ~5h.",{flight:1}),
  "mikuni>hita":L(5.25,3,"flight","~30-min taxi/bus to Komatsu + KMQ→Fukuoka (~1h40) into Hakata, then Kyudai-line Ltd Exp→Amagase for Hita/Tensui (~1h30). ~5.25h door-to-door.",{flight:1}),

  /* Toyama → Kyushu (via Toyama Airport TOY→Fukuoka) */
  "toyama>kagoshima":L(5.25,3,"flight","Airport bus Toyama→TOY + TOY→Fukuoka (~1h40, ANA/IBEX) into Hakata, then Kyushu Shinkansen 'Mizuho'→Kagoshima-Chūō (~1h17). ~5.25h door-to-door.",{flight:1}),
  "toyama>kumamoto":L(4.5,3,"flight","Airport bus Toyama→TOY + TOY→Fukuoka (~1h40) into Hakata, then Kyushu Shinkansen→Kumamoto (~35 min). ~4.5h door-to-door.",{flight:1}),
  "toyama>nagasaki":L(5.75,4,"flight","Airport bus Toyama→TOY + TOY→Fukuoka (~1h40) into Hakata, then Nishi-Kyushu relay→Nagasaki via Takeo-Onsen (~2h). ~5.75h door-to-door.",{flight:1}),
  "toyama>kirishima":L(6.5,4,"flight","Airport bus Toyama→TOY + TOY→Fukuoka (~1h40) into Hakata, then Kyushu Shinkansen→Kagoshima-Chūō + JR Nippō→Hayato + shuttle to Myoken (~2h45). ~6.5h.",{flight:1}),
  "toyama>yufuin":L(6.0,3,"flight","Airport bus Toyama→TOY + TOY→Fukuoka (~1h40) into Hakata, then Ltd Exp 'Yufu'→Yufuin (~2h10). ~6h door-to-door.",{flight:1}),
  "toyama>kurokawa":L(6.5,3,"flight","Airport bus Toyama→TOY + TOY→Fukuoka (~1h40) into Hakata, then highway bus Hakata→Kurokawa Onsen (~2h30–3h, reserve). ~6.5h.",{flight:1}),
  "toyama>unzen":L(6.75,5,"flight","Airport bus Toyama→TOY + TOY→Fukuoka (~1h40) into Hakata, then Nishi-Kyushu relay→Isahaya + Shimatetsu bus→Unzen (~3h). ~6.75h.",{flight:1,awkward:1}),
  "toyama>takeo":L(4.75,3,"flight","Airport bus Toyama→TOY + TOY→Fukuoka (~1h40) into Hakata, then Ltd Exp 'Relay Kamome'→Takeo-Onsen (~1h). ~4.75h door-to-door.",{flight:1}),
  "toyama>karatsu":L(5.0,3,"flight","Airport bus Toyama→TOY + TOY→Fukuoka (~1h40) into Hakata, then subway/JR Chikuhi through-service→Karatsu (~75 min). ~5h.",{flight:1}),
  "toyama>hita":L(5.25,3,"flight","Airport bus Toyama→TOY + TOY→Fukuoka (~1h40) into Hakata, then Kyudai-line Ltd Exp→Amagase for Hita/Tensui (~1h30). ~5.25h door-to-door.",{flight:1}),
  /* ── Tokyo → Kyushu by air (researched 2026-06-21). Nobody trains Tokyo→Kyushu; the all-rail hub
     estimate (Tōkaidō/Sanyo to Hakata ~5h + last-mile) was both unrealistic and slower than a flight.
     Each lands at the airport NEAREST the destination, not always Fukuoka. Door-to-door = Tokyo→Haneda
     (~30 min) + airport time + flight + ground last-mile. fukuoka(city) already resolves via fukuoka>tokyo.
     Sources: skyscanner/flightsfrom (HND flight times), airport bus pages, rome2rio, japan-guide (Jun 2026). */
  "tokyo>yufuin":L(4.0,1,"flight","Fly to Yufuin: Tokyo→Haneda (~30 min), HND→Oita (OIT) ~1h30 nonstop (frequent ANA/JAL/Solaseed; 2026-07 audit vs flightsfrom/sakuratravel timetables), then a pre-booked FIXED-FARE taxi straight to the inn (~55 min, ¥18,320 incl. tolls — Oita Taxi Assoc., say '定額で') — no bus-schedule or shuttle sync. (Budget alt: airport bus→Yufuin Stn ~55 min, 6/day, ¥1,550pp + the inn shuttle — Enowa's needs reserving ≥3 days ahead.) Far saner than the ~5h45 all-rail haul.",{flight:1}),
  "tokyo>kirishima":L(4.0,2,"flight","Fly to Myoken: ~90 min up front (hotel→HND + domestic check-in), HND→Kagoshima ~1h45 (~20+ daily), ~45 min on the back end (bags + the ¥450 Myōken route bus ~23 min or a pre-called taxi ~15 min — ⚠ the inn's shuttle-taxi was DISCONTINUED pre-Mar-2026 and called taxis need ~40-min lead, may be refused). 90+105+45 = ~4h door-to-door.",{flight:1,car:1}),
  "tokyo>hita":L(5.0,3,"flight","Fly via Fukuoka: Tokyo→Haneda (~30 min), HND→Fukuoka (FUK) ~2h, subway 2 stops Fukuoka Airport→Hakata (~5 min), then the Kyudai-line Ltd Exp Hakata→Amagase (~1h30) + free inn pickup. (Oita Airport is on the wrong, eastern side of the prefecture — Hakata is the real gateway to Hita/Amagase.)",{flight:1}),
  "tokyo>kurokawa":L(5.25,2,"flight","Fly via Kumamoto: Tokyo→Haneda (~30 min), HND→Aso-Kumamoto (KMJ) ~2h, then the Sankō bus KMJ→Kurokawa Onsen (~1h50, ~5/day) + inn pickup from the bus stop. Closer than backtracking through Hakata's ~3h highway bus.",{flight:1}),
  "tokyo>amakusa":L(5.0,1,"flight","No Tokyo→Amakusa flight exists. Fly via Kumamoto: Tokyo→Haneda (~30 min), HND→Aso-Kumamoto (KMJ) ~2h, then ~1.5h taxi/arranged car SW across the Amakusa bridges to Matsushima — Tayuta's official access figure; the inns arrange transfers. Rail-purist alt: KMJ limousine bus→Kumamoto Stn (~1h) + Misumi Line (~50 min) + 15–20-min boat/taxi ≈ same door-to-door. (Connecting via Fukuoka to tiny Amakusa Airport works too but isn't faster.)",{flight:1,car:1}),
  "tokyo>unzen":L(5.0,3,"flight","Fly via Nagasaki: Tokyo→Haneda (~30 min), HND→Nagasaki (NGS) ~1h50, then up the Shimabara peninsula by bus — NGS→Isahaya (~35 min) + Shimatetsu bus Isahaya→Unzen Onsen (~1h20), or the infrequent direct airport→Unzen bus (~100 min).",{flight:1}),
  "tokyo>kagoshima":L(4.5,2,"flight","Fly: Tokyo→Haneda (~30 min), HND→Kagoshima (KOJ) ~1h40 (~20+ daily), then the airport limousine bus KOJ→Kagoshima-Chūō (~40–60 min).",{flight:1}),
  "tokyo>nagasaki":L(4.25,2,"flight","Fly: Tokyo→Haneda (~30 min), HND→Nagasaki (NGS) ~1h50, then the airport limousine bus NGS→Nagasaki Station (~45 min).",{flight:1}),
  /* Airport access: hub station → terminal (used to complete any …→airport leg) */
  "kyoto>kix":L(1.5,0,"train","JR Ltd Exp 'Haruka' Kyoto→Kansai Airport (~75 min, direct)."),
  "kyoto>itm":L(1.0,0,"bus","Airport limousine bus Kyoto Station→Osaka-Itami (~55 min)."),
  "tokyo>hnd":L(0.6,1,"train","From Tokyo Stn/trunk: JR→Hamamatsuchō + Monorail, or Shinagawa + Keikyū (~25–30 min ride). ⚠ From a central HOTEL door add ~20–30 min (walk to the trunk) → 55–70 min real; taxi ~40–60 min/0 changes and the hotel-doorstep Airport Limousine (~70 min) are the luggage-friendly versions (2026-07-27 audit). Station-anchored here because via-Tokyo airport compositions reuse this tail."),
  /* Narita, added 2026-09-09 for the trip kit: the second Tokyo airport, and the one most long-haul
     arrivals from Europe and much of Asia land at. Sourced from JR East's Narita Express timetable and
     japan-guide's Narita access page — N'EX Tokyo Station→Airport Terminal 2·3 is 53 min and Terminal 1
     ~56–60 min, direct, roughly 1–2 departures an hour. Station-anchored exactly like tokyo>hnd, with
     the same hotel-door caveat; 1.1 = the 53–60-min ride plus the platform walk and the wait. */
  "tokyo>nrt":L(1.1,0,"train","JR Narita Express (N'EX) Tokyo Station→Narita Airport Terminal 2·3 ~53 min, Terminal 1 ~56–60 min — direct, 1–2 an hour (JR East timetable; japan-guide Narita access). ⚠ From a central HOTEL door add ~20–30 min to reach the trunk → ~1h20 real; the door-to-terminal Airport Limousine bus from the big hotels runs ~85–120 min depending on traffic, and the Keisei Skyliner from Ueno/Nippori is ~41–46 min if you are staying on that side."),
  "fukuoka>fuk":L(0.3,0,"subway","Fukuoka City Subway Hakata→Fukuoka Airport (2 stops, ~5 min)."),
  "nagasaki>ngs":L(1.0,0,"bus","Airport limousine bus Nagasaki Station→Nagasaki Airport (~45 min)."),
  "kumamoto>kmj":L(0.9,0,"bus","Airport limousine bus Kumamoto Stn/Sakuramachi→Kumamoto Airport (KMJ) at Mashiki (~55 min)."),
  "takeo>ngs":L(0.75,1,"train","Nishi-Kyushu Shinkansen Takeo-Onsen→Shin-Ōmura (~12 min), then the airport shuttle to Nagasaki Airport (~15 min) — NGS sits between Takeo and Nagasaki, ~40 min door to door."),
  "kagoshima>koj":L(1.1,0,"bus","Airport limousine bus Kagoshima-Chūō→Kagoshima Airport (~40–60 min)."),
  /* Two nearest-airport ground legs added 2026-09-10 for the trip kit's airport table — both were
     resolving to a region-hub estimate that sent the traveller through the city first. */
  "kirishima>koj":L(0.75,0,"bus","Kagoshima Airport is Myōken's own gateway, ~30 km up the Amori river: the ¥450 Myōken route bus KOJ→Myōken Onsen runs ~25 min (Kirishima City's Myōken bus page; Kagoshima Kōtsū airport-bus timetable, Sep 2026), a pre-called taxi ~15 min. ~45 min door to door with bags. ⚠ Only ~8 airport departures a day on that bus, the inn's own shuttle-taxi was discontinued pre-Mar-2026, and called taxis want ~40 min notice."),
  "kanazawa>kmq":L(0.8,0,"bus","Hokutetsu airport limousine Kanazawa Station→Komatsu Airport (KMQ), ~40–50 min, timed to the departures — the same bus leg the Kanazawa→Kyushu flight legs are built on. KMQ is Kanazawa's own airport; ANA/Oriental Air Bridge fly it to Fukuoka ~4×daily (~1h40)."),
  "hiroshima>hij":L(1.1,0,"bus","Airport limousine bus Hiroshima Station→Hiroshima Airport (~50 min; no rail link)."),
  /* ── Domestic flight HOME: regional airport → Haneda. Haneda is the fixed international departure, so
     any route that exits via another airport still has to fly to HND — departLeg() appends one of these
     onto the ground leg that reaches the terminal. Block times (air + a light pad; the change from
     ground-to-plane is the +1 transfer departLeg adds). Sources: JAL/ANA domestic timetables (Jul 2026):
     FUK ~1h50, KOJ ~2h00, KMJ ~1h45, NGS ~1h55, HIJ ~1h25, KIX ~1h15, ITM ~1h10. */
  "fuk>hnd":L(2.0,0,"flight","then fly Fukuoka (FUK)→Haneda (~1h50, very frequent — ANA/JAL/SKY/SFJ).",{flight:1}),
  "koj>hnd":L(2.25,0,"flight","then fly Kagoshima (KOJ)→Haneda (~2h, ~25 daily — ANA/JAL/SKY/SNA).",{flight:1}),
  "kmj>hnd":L(2.0,0,"flight","then fly Kumamoto (KMJ)→Haneda (~1h45, frequent — ANA/JAL/SNA).",{flight:1}),
  "ngs>hnd":L(2.25,0,"flight","then fly Nagasaki (NGS)→Haneda (~1h55, frequent — ANA/JAL/SKY).",{flight:1}),
  "hij>hnd":L(1.75,0,"flight","then fly Hiroshima (HIJ)→Haneda (~1h25, frequent — ANA/JAL).",{flight:1}),
  "kix>hnd":L(1.75,0,"flight","then fly Kansai (KIX)→Haneda (~1h15). Only worth it for a deep-Kansai finale — from Kyoto the rail-to-HND option is simpler.",{flight:1}),
  "itm>hnd":L(1.5,0,"flight","then fly Osaka-Itami (ITM)→Haneda (~1h10 — the single most frequent HND domestic route).",{flight:1}),
  "oit>hnd":L(2.25,0,"flight","then fly Oita (OIT)→Haneda (~1h40, frequent — ANA/JAL/SNA). Oita is Yufuin's own airport, so this is the shortest Kyushu exit for a Yufuin finale.",{flight:1}),
  /* Two nearest-airport ground legs the generic composition would overshoot: Yufuin exits via Oita (its
     airport, ~55-min bus), and Kurokawa's Kyushu-Ōdan bus STOPS at Kumamoto Airport (~1h50) on the way
     down to the city — so KMJ is a direct hop, not "to Kumamoto city then back out to the airport." */
  "yufuin>oit":L(1.0,0,"bus","Airport bus Yufuin Station→Oita Airport (~55 min; the inn shuttle reaches the station)."),
  "kurokawa>kmj":L(1.75,0,"bus","Kyushu Ōdan bus Kurokawa Onsen→Kumamoto Airport (~1h50; the Kumamoto-bound bus stops at the airport en route) + inn pickup to the bus stop. ⚠ reserve — only ~2–3/day."),
  /* ── Direct final legs to Haneda for the near-Tokyo finales. These BYPASS the region-hub composition
     (departLeg checks LEGS[loc>hnd] first) because Izu/Hakone/Fuji sit BETWEEN Tokyo and Haneda —
     routing them "up to Tokyo Station, then back down to HND" double-backs. Sourced from each inn's
     access page (the Ochiairo diagram: Shuzenji→Mishima 35m, Mishima→Shinagawa Shinkansen ~40m,
     Shinagawa→HND Keikyū ~18m) + JR timetables (Jul 2026). Auto-reverse is harmless — nothing arrives
     from "hnd". */
  "yugashima>hnd":L(2.25,2,"train","Inn courtesy car→Shuzenji (~20 min), Izuhakone Sunzu line→Mishima (~35 min), Tōkaidō Shinkansen Mishima→Shinagawa (~40 min), Keikyū→Haneda (~18 min) — Izu drops straight down to HND, no Tokyo backtrack.",{car:1}),
  "izu>hnd":L(2.0,2,"train","Taxi/shuttle→Shuzenji, Izuhakone Sunzu line→Mishima (~35 min), Tōkaidō Shinkansen Mishima→Shinagawa (~40 min), Keikyū→Haneda (~18 min)."),
  "hakone>hnd":L(2.2,2,"train","Direct Tozan BUS Gōra/Sengokuhara→Odawara (~45 min — one seat; the Tozan rail needs an extra change at Hakone-Yumoto), Tōkaidō Shinkansen Odawara→Shinagawa (~30 min), Keikyū→Haneda (~18 min); or the direct Odawara→HND limousine bus (~85 min)."),
  "oyama>hnd":L(2.25,1,"car","Hotel car→Mishima (~40 min), Tōkaidō Shinkansen Mishima→Shinagawa (~40 min), Keikyū→Haneda (~18 min).",{car:1}),
  "kawaguchiko>hnd":L(3,1,"train","JR 'Fuji Excursion' Kawaguchiko→Shinjuku (~2h, direct), then the airport limousine bus Shinjuku→Haneda (~45 min). ⚠ limited morning Fuji departures.",{awkward:1}),
  "koshu>hnd":L(2.5,1,"train","JR Chūō Ltd Exp 'Azusa'→Shinjuku (~1h30), airport limousine bus Shinjuku→Haneda (~45 min)."),
  "kobuchizawa>hnd":L(3.1,1,"train","JR Chūō Ltd Exp 'Azusa' Kobuchizawa→Shinjuku (~2h), airport limousine bus Shinjuku→Haneda (~45 min)."),
  "yudanaka>hnd":L(3.05,2,"train","Nagaden 'Snow Monkey' Ltd Exp Yudanaka→Nagano (~45 min), Hokuriku Shinkansen Nagano→Tokyo (~1h25) — the inn's own access page cites ~2h30 to Tokyo — then Tokyo→Haneda (~30 min)."),

  /* ── New Kyushu top-50 inns (added 2026-06-28): Shinsen/Takachiho, Yoyokaku/Karatsu, Chikurintei/Takeo-Onsen,
     Iki Retreat/Iki, Sankara/Yakushima. Door-to-door, researched; sources logged in research/transit-notes.md. ── */
  "fukuoka>karatsu":L(1.25,0,"train","Fukuoka City Subway Kūkō Line through-running onto the JR Chikuhi Line, Hakata→Karatsu (~75 min, no change on through services; the subway segment isn't JR-Pass-covered), then a short taxi to Yoyokaku. By car ~55 km / ~1h via the Nishi-Kyushu Expwy free sections — lowland, winter-trivial."),
  "fukuoka>takeo":L(1.0,0,"train","Ltd Exp 'Relay Kamome' Hakata→Takeo-Onsen (~1h, no change), then a short taxi — the Nishi-Kyushu Shinkansen begins at Takeo-Onsen."),
  "takeo>nagasaki":L(0.7,0,"shinkansen","~5-min taxi to Takeo-Onsen Stn (Chikurintei's shuttle is ARRIVAL-only, 14:00–18:30 — don't plan on it at checkout), Nishi-Kyushu Shinkansen 'Kamome'→Nagasaki (23–31 min, ~hourly, 22/day) + ~10 min to the hotel. 0.42 was the bare ride; 0.7 is door-to-door."),
  "fukuoka>takachiho":L(3.5,0,"bus","Direct 'Gokase-go' highway bus Hakata Bus Terminal→Takachiho Bus Center (~3h26, 4/day, reserve). Alternative: Kyushu Shinkansen Hakata→Kumamoto (~50 min) + bus to Takachiho (~3h, 1/day).",{awkward:1}),
  /* Kyushu inn-loc → city completeness sweep — researched Jul 2026 (operator pages + japan-guide + Navitime;
     rule: every Kyushu inn loc resolves researched to Fukuoka, Kagoshima AND Nagasaki). Sourced prose in
     research/transit-notes.md. Note: no Kagoshima→Nagasaki or Yakushima→Nagasaki flights exist — rail it. */
  "kirishima>nagasaki":L(4.5,3,"train","Inn pickup to Hayato (~15 min), JR→Kagoshima-Chūō (~40 min), Kyushu Shinkansen→Shin-Tosu, 'Relay Kamome'→Takeo-Onsen, 'Kamome'→Nagasaki. No KOJ→NGS flight exists — rail is the way.",{awkward:1}),
  "yufuin>nagasaki":L(3.0,0,"car","By car (~210 km, raw ~2h25 per NAVITIME; budget ~3h): Yufuin IC → Oita Expwy → Tosu JCT → Nagasaki Expwy → Nagasaki IC (~¥5,060). Budget 3h+ in January — the Yufuin IC–Hita IC stretch (~45 km) is an official winter-tire-regulation zone (last winter: 7 days of regulation, 2 of closure); past Hita it's plains, and the Nagasaki Expwy has no regulated section at all. (Transit: Ltd Exp 'Yufu'→Hakata ~2h15 + 'Relay Kamome'/'Kamome' via Takeo, ~3.5h total, 2 changes — 2026-07 audit; rare January snow on the Kyudai line's pass.)",{car:1,drive:1}),
  "hita>nagasaki":L(3.2,2,"train","Change at TOSU, not Hakata (the Hakata 'Yufu'↔'Relay Kamome' pairing is a 0-minute connection — impossible): Kyudai Ltd Exp 'Yufu' Amagase↔Tosu (~1h13; ⚠ only 6 Amagase-stopping expresses/day), 'Relay Kamome' Tosu↔Takeo-Onsen (~36 min, every train stops Tosu), 'Kamome'↔Nagasaki (~31 min, same-platform timed change at Takeo). ⚠ Nagasaki→hita direction: only Yufu 3 (Tosu 12:38) lands before 16:09 — leave the hotel by ~10:35; miss it and it's ~4h35 via Yufuin-no-Mori 5.",{car:1}),
  "kurokawa>nagasaki":L(4.6,2,"bus","Direct highway bus Kurokawa→Hakata (~3h, only 2–3/day — reserve), then 'Relay Kamome'→Takeo-Onsen + 'Kamome'→Nagasaki (~1.4h). January snow can detour the Kurokawa road.",{awkward:1}),
  "amakusa>nagasaki":L(3.4,3,"train","Carless via the Misumi corridor: inn-synced 15–20-min boat/taxi to Misumi, Misumi Line→Kumamoto (~50–60 min), then Shinkansen→Shin-Tosu + Relay Kamome→Kamome to Nagasaki (~2h) — all-rail, snow-proof. Drivers' variant (the ferry drive): ~45 min to Oniike Port, Shimatetsu car ferry→Kuchinotsu (30 min, ~every 45), then ~1h45 down the Shimabara peninsula with Sakitsu Church and the Unzen jigoku en route (~3.5h; winter gales occasionally cancel the strait ferry).",{car:1}),
  "unzen>kagoshima":L(3.6,3,"ferry","Bus Unzen→Shimabara Port (~40 min), 'Ocean Arrow' high-speed ferry→Kumamoto Port (30 min, ~every 2h), timed port shuttle→Kumamoto Stn (~25 min), 'Sakura'→Kagoshima-Chūō (~50 min). Gale days: all-rail via Isahaya/Takeo (~4.4h) is the fallback.",{awkward:1}),
  "takachiho>kagoshima":L(4.2,1,"bus","Ltd Exp 'Takachiho-gō' bus→Kumamoto (~2h45, only 2/day — plan the day around it), then 'Sakura'→Kagoshima-Chūō (~50 min). January ice can suspend the Aso-rim road.",{awkward:1}),
  "takachiho>nagasaki":L(5.0,3,"bus","'Takachiho-gō' bus→Kumamoto (~2h45, 2/day), Shinkansen→Shin-Tosu, 'Relay Kamome'→Takeo-Onsen, 'Kamome'→Nagasaki — a full travel day.",{awkward:1}),
  "karatsu>kagoshima":L(3.4,1,"train","Chikuhi-line through-train Karatsu→Hakata (~1h25, ~every 30 min), then 'Sakura'→Kagoshima-Chūō (~1h35; 'Mizuho' 1h16)."),
  "karatsu>nagasaki":L(3.0,2,"train","Chikuhi through-train→Hakata (~1h25), 'Relay Kamome'→Takeo-Onsen + 'Kamome'→Nagasaki (~1.4h). (The Matsuura-railway coastal route is lovely and ~6h — a day out, not a transfer.)"),
  "takeo>kagoshima":L(2.6,1,"train","'Relay Kamome' Takeo-Onsen→Shin-Tosu (~40 min, ~hourly), then 'Sakura'→Kagoshima-Chūō (~1h13)."),
  "takeo>tokyo":L(3.5,2,"flight","'Relay Kamome' Takeo-Onsen→Hakata (~58 min), subway 2 stops to Fukuoka Airport (~5 min), FUK→HND (~2h, very frequent). All-rail is a ~5.5h haul — fly.",{flight:1}),
  "hiroshima>oyama":L(4.3,1,"train","San'yō 'Nozomi' Hiroshima→Nagoya (~2h05), 'Hikari'/'Kodama'→Mishima (~1h–1h15), then the hotel car ~40 min (car-only access — arrange the transfer).",{car:1}),
  "iki>kagoshima":L(3.7,2,"ferry","Jetfoil→Hakata Port (~65–70 min), bus to Hakata Stn (~20 min), 'Sakura'→Kagoshima-Chūō (~1h35). Winter seas suspend jetfoils — the ~2h20 car ferry usually still runs.",{awkward:1}),
  "iki>nagasaki":L(2.7,1,"flight","ORC turboprop Iki→Nagasaki (30 min, 2/day — ORC's only Iki route), then the airport limousine bus→Nagasaki Stn (~45 min). Winter wind can cancel the small plane — fallback: jetfoil→Hakata + rail (~3.5h).",{flight:1,awkward:1}),
  "yakushima>nagasaki":L(4.0,3,"flight","JAC Yakushima→Fukuoka (1/day, ~70 min, weather-prone — keep the Kagoshima fallback), subway→Hakata, 'Relay Kamome'+'Kamome'→Nagasaki (~1.4h). Fallback via KOJ + rail ≈5.3h.",{flight:1,awkward:1}),
  /* Gateway-proximity legs (researched Jul 2026) — an inn's nearest GATEWAY city isn't always in its
     region's SENSIBLE bookends, which left the catalog's "within Xh of gateway" filter blind to it.
     export-transit.js now emits every gateway an inn has a RESEARCHED leg to, so these connect Tohoku
     inns to Sendai and Kansai inns to Osaka/Nagoya. Sourced prose in research/transit-notes.md. */
  /* tsuchiyu↔sendai lives at "sendai>tsuchiyu" (ex-route block below): Shinkansen to Fukushima +
     the ~25-min taxi, 1.5h/0tx. A bus version was authored here in the Jul sweep (1.75h/1tx via the
     Fukushima Kōtsū bus) — deleted 2026-07-26; it re-committed exactly the mistake the tokyo>tsuchiyu
     note warns about (that bus is sparse, a 2h15 midday gap). Every Fukushima-hub Tsuchiyu leg uses
     the taxi connector; this one now does too, in both directions. */
  "iizaka>sendai":L(1.25,1,"train","Fukushima Kōtsū Iizaka Line→Fukushima (~23 min), Tōhoku Shinkansen→Sendai (~25 min), plus the inn's ~10-min courtesy pickup at the Iizaka end."),
  "akayu>sendai":L(1.6,1,"shinkansen","Yamagata Shinkansen 'Tsubasa' Akayu→Fukushima (~35 min — a SE backtrack), transfer to a northbound Tōhoku Shinkansen→Sendai (~25 min), plus a 5-min taxi/inn shuttle at the Akayu end (reserve)."),
  "kaminoyama>sendai":L(1.3,0,"bus","Direct Yamako Kaminoyama–Sendai expressway bus (~1h15, 6–8/day). Chosen over the rail alt (Tōhoku Shinkansen→Fukushima ~13 min + Yamagata 'Tsubasa'→Kaminoyama-Onsen ~50 min + ~6-min taxi, ≈1.25h/1tx): same clock, but no change and it avoids the winter-fragile Itaya-pass 'Tsubasa'."),
  "kakunodate>sendai":L(2.25,0,"shinkansen","Akita Shinkansen 'Komachi' Kakunodate→Morioka→Sendai as one through train (~2h05, no change), then a ~12-min taxi/inn car at the Kakunodate end (reserve).",{awkward:1}),
  "aizuwakamatsu>sendai":L(2.25,1,"train","Ban'etsu West Line Aizu-Wakamatsu→Kōriyama (~65 min), transfer to Tōhoku Shinkansen→Sendai (~40 min), plus the ~15-min Higashiyama Onsen taxi. (Direct Aizu–Sendai highway bus ~2h22 is the no-change alt.)",{awkward:1}),
  "sukagawa>sendai":L(1.3,1,"train","Tōhoku Main Line local Sukagawa→Kōriyama (~10 min), transfer to Tōhoku Shinkansen→Sendai (~40 min), plus the ~10-min inn shuttle (reserve)."),
  "nara>osaka":L(1.0,0,"train","Kintetsu Nara Line Rapid Express Kintetsu-Nara→Osaka-Namba (~36 min, direct, ~every 15 min)."),
  "katsuragi>osaka":L(1.4,1,"train","Kintetsu Gose Line→Shakudo, transfer to the Minami-Osaka Line→Osaka-Abenobashi/Tennoji (~1h5 riding)."),
  "arima>osaka":L(1.1,0,"bus","Direct Hankyu/JR expressway bus Arima Onsen→Osaka-Umeda (~60 min, 1–2/hr)."),
  "ise>nagoya":L(1.6,0,"train","Kintetsu Limited Express Ujiyamada/Iseshi→Kintetsu-Nagoya (~80–85 min, direct)."),
  /* ── Osaka as a GATEWAY city (researched 2026-09-09) ──────────────────────────────────────────
     Osaka is deliberately not a builder region city (it appears in no REGIONS.cities, so none of
     this touches validate #7's peer/bookend invariant), but it is the Kansai base a first-timer
     actually uses, it is already a CORRIDOR_CITY in build-kit.js, and export-transit.js emits any
     researched gateway leg to the catalog. Until now the table held only three Osaka legs
     (nara/katsuragi/arima), so every other Osaka pairing fell to the hub estimate.
     STATION CONVENTION — `osaka` = CENTRAL Osaka (Umeda/Kita; Namba where the private line lands).
     Tōkaidō/San'yō Shinkansen legs are anchored at SHIN-OSAKA, with the ~4-min Midōsuji subway hop
     down to Umeda folded into the door-to-door time and counted as the ONE self-handled change.
     The 'Thunderbird' (Kanazawa), the 'Kōnotori' (Kinosaki), the JR Special Rapid (Kyoto) and the
     airport buses all use OSAKA STATION / UMEDA itself, so they carry no such change.
     Sourced prose + URLs: research/transit-notes.md. ─────────────────────────────────────────── */
  "osaka>kyoto":L(0.75,0,"train","JR Special Rapid Kyoto→Osaka Stn (~29–30 min, ¥580, frequent, no change) — central station to central station, so ~45 min door-to-door with the hotel ends. Alternatives from the Gion/Kawaramachi side: Hankyu Kyoto-Kawaramachi→Osaka-Umeda ~40 min ¥410, Keihan Sanjō→Yodoyabashi ~50 min ¥490."),
  "osaka>tokyo":L(3.25,1,"shinkansen","Tōkaidō 'Nozomi' Tokyo→Shin-Osaka (~2h35, multiple per hour, ¥13,870 non-reserved / ¥14,500 reserved; 'Hikari' ~3h), then the Midōsuji subway Shin-Osaka→Umeda — a ~4-min ride, ~15 min with the walk and wait, and the leg's single self-handled change. ⚠ Tōkaidō services run all-reserved over the New Year peak — book ahead."),
  "osaka>hiroshima":L(2.1,1,"shinkansen","San'yō 'Nozomi' Shin-Osaka→Hiroshima (~1h25; ~80 min on the fastest), plus the Midōsuji hop between Umeda and Shin-Osaka at the Osaka end. 'Sakura'/'Mizuho' run the same corridor a few minutes slower."),
  "osaka>fukuoka":L(3.1,1,"shinkansen","San'yō 'Nozomi'/'Mizuho' Shin-Osaka→Hakata (~2h30, several per hour, one seat), plus the Midōsuji hop between Umeda and Shin-Osaka. Hakata Stn is central Fukuoka, so no last mile at the far end."),
  "osaka>nagoya":L(1.6,1,"shinkansen","Tōkaidō 'Nozomi' Shin-Osaka→Nagoya (~50 min; 'Hikari'/'Kodama' 55–70 min), plus the Midōsuji hop between Umeda and Shin-Osaka. The shortest Shinkansen hop on the board out of Osaka."),
  "osaka>kanazawa":L(2.75,1,"train","Ltd Exp 'Thunderbird' Osaka Stn→Tsuruga (~1h20), ~10-min change at Tsuruga, Hokuriku Shinkansen Tsuruga→Kanazawa (~40 min) — ~2h10–2h30 station to station. Departs central Osaka, so there is no Shin-Osaka hop; the Tsuruga change is the one the Mar 2024 extension imposed (the one-seat Thunderbird to Kanazawa is gone). ⚠ January snow on the Hokuriku coast delays this corridor.",{awkward:1}),
  "osaka>kinosaki":L(2.75,0,"train","Ltd Exp 'Kōnotori' Osaka Stn→Kinosaki Onsen (~2h40, direct, no change; ¥5,940–6,540, seat reservation mandatory). Central Osaka departure — the Kyoto twin ('Kinosaki' Ltd Exp, ~2h30) is barely shorter, so base city doesn't decide this one. (Zentan bus ~3h, ¥4,100, is the cheap alt.)"),
  "osaka>hakone":L(3.4,2,"shinkansen","Midōsuji hop Umeda→Shin-Osaka, Tōkaidō 'Hikari' Shin-Osaka→Odawara (~2h05 — the same ~2-hourly Odawara-calling 'Hikari' the hakone>kyoto leg uses at ~1h50 to Kyoto, plus the ~15-min Kyoto–Shin-Osaka segment; 'Nozomi' skips Odawara and all-'Kodama' is ~2h40), then the direct Tozan BUS Odawara→Gōra/Sengokuhara (~45 min, one seat; the Tozan rail adds a Hakone-Yumoto change)."),
  "osaka>kix":L(1.1,0,"train","JR Ltd Exp 'Haruka' Osaka Stn→Kansai Airport ~45 min (¥2,380 unreserved; Shin-Osaka ~50 min, ¥2,540), or the Nankai 'Rapi:t' Osaka-Namba→KIX 35–40 min (¥1,520–1,670, reserved; the fastest services 34 min). Cheaper: Nankai airport express 45–50 min ¥970, JR Airport Rapid from Osaka Stn ~70 min ¥1,180, airport bus from Umeda ~60 min ¥1,800 / Namba ~45 min ¥1,400. ~1h door-to-door with bags and the terminal walk — airport processing on top."),
  "osaka>itm":L(0.75,0,"bus","Airport limousine bus Osaka Stn/Umeda→Itami (~30 min, ¥730, multiple per hour); Shin-Osaka ~25 min ¥600, Namba/OCAT ~30 min ¥730. Rail alt: Hankyu Takarazuka Line Osaka-Umeda→Hotarugaike (15–20 min, ¥240) + Osaka Monorail one stop to Osaka Airport (2 min, ¥200) ≈ 25 min, ¥440. Itami is the close-in domestic airport — the reason a Kansai finale flies ITM→HND."),
  /* Kumamoto city added Jul 2026 — same completeness rule (every Kyushu inn loc → every Kyushu city),
     plus the Grand-Arc driving legs. Kyushu Ōdan bus through-runs Yufuin→Kurokawa→Aso→Kumamoto 3/day.
     Sourced prose in research/transit-notes.md. */
  "kumamoto>fukuoka":L(0.7,0,"shinkansen","Kyushu Shinkansen Kumamoto→Hakata — 'Mizuho' ~33 min, 'Sakura' ~38; several per hour."),
  "kumamoto>kagoshima":L(0.8,0,"shinkansen","'Mizuho'/'Sakura' Kumamoto→Kagoshima-Chūō (~44–57 min, ~hourly+)."),
  "kumamoto>nagasaki":L(2.0,2,"train","Shinkansen→Shin-Tosu (~25 min), 'Relay Kamome'→Takeo-Onsen (timed cross-platform change), 'Kamome'→Nagasaki — ~2h all told. (The Ocean Arrow ferry + Shimabara Railway route is scenic and ~3.5h.)"),
  "tokyo>kumamoto":L(4.5,2,"flight","Fly: Tokyo→Haneda (~30 min), HND→Kumamoto (KMJ) ~1h50 (~17/day, ANA/JAL/Solaseed), then the airport limousine to Sakuramachi/Kumamoto Stn (~55 min, every ~30 min).",{flight:1}),
  "yufuin>kumamoto":L(2.4,1,"train","Ltd Exp 'Yufu'/'Yufuin-no-Mori' Yufuin→Kurume (~1h40, ~5/day), Shinkansen Kurume→Kumamoto (~25 min). Scenic alt: the Kyushu Ōdan bus through Kurokawa/Aso, one seat, ~4h15, 3/day. By car ~2.5h via the Yamanami Highway."),
  "hita>kumamoto":L(1.7,1,"train","'Yufu' Amagase/Hita→Kurume (~50 min), Shinkansen→Kumamoto (~25 min)."),
  "kurokawa>kumamoto":L(2.6,0,"bus","Kyushu Ōdan bus one-seat Kurokawa→Kumamoto Stn (~2h38; 3/day down, only 2/day back up — reserve). Also stops at Kumamoto Airport (~1h50) en route. By car ~77 km / ~1h50 via Senomoto + R57 (or the Milk Road rim), budget 2h15–2h30 in January — the Aso rim roads can gate-close in ice.",{awkward:1}),
  "takachiho>kumamoto":L(2.0,0,"car","By car ~85 km via R218 + the free E77 Kyushu-Chūō sections (open since Feb 2024): ~1h45 normal, budget 2h in January. R218 stays off the Aso rim (occasional chain regulation on the Kyushu-sanchi crossing; avoid the higher R325/Takamori route in ice). (Transit: 'Takachiho-gō' express bus→Sakuramachi BT ~2h45, only 2/day — reserve.)",{car:1,drive:1}),
  "amakusa>kumamoto":L(1.2,0,"car","By car ~1h10 via the Five Bridges, Misumi and R57 — coastal and effectively snow-proof. Carless parity (~1¼h): 15-min Takarajima-Line boat Matsushima Port⇄Misumi port (+2-min walk to the station) or 20-min taxi, then Misumi Line⇄Kumamoto ~50–60 min — both Tayuta and Amanojyaku sync pickups. ('Amakusa-gō' rapid bus Matsushima→Sakuramachi BT ~1h20, ~9/day, no reservation.)",{car:1,drive:1}),
  "unzen>kumamoto":L(2.2,2,"ferry","Shimatetsu bus Unzen→Shimabara Port (~40 min, ~hourly), 'Ocean Arrow'→Kumamoto Port (30 min, ~5/day), timed free shuttle→Kumamoto Stn (~25 min). Ariake gales → all-rail fallback. With a rental: the Ocean Arrow carries cars (¥5,100 4–5 m class + ¥1,600/passenger; 6 RT/day in Jan; car slots open 1 month out — reserve, walk-ups are first-come); the slower Kyusho ferry (60 min, ¥3,900) is the gale-day fallback; Shimabara Port→Unzen is a 19-km climb to 700 m (~26 min, budget 40) — the most freeze-prone road in Nagasaki Pref.",{awkward:1}),
  "kirishima>kumamoto":L(2.5,1,"train","Inn car to Hayato, Nippō line→Kagoshima-Chūō (~35–50 min), 'Sakura'→Kumamoto (~45–57 min). By car ~155 km / ~2h30 up the Kyushu Expwy — ⚠ but the Yatsushiro JCT–Ebino IC tunnel spine is Kyushu's canonical snow-closure section (1–3 preemptive full closures per Jan/Feb season, hours to a day+); on a cold-wave day don't plan this drive — rail it, or take the sea-level R3/E3A west coast (+~1h)."),
  "karatsu>kumamoto":L(2.6,1,"train","Chikuhi through-train→Hakata (~1h20), 'Sakura'/'Mizuho'→Kumamoto (~38 min)."),
  "takeo>kumamoto":L(1.8,1,"train","'Relay Kamome' Takeo-Onsen→Shin-Tosu (~40 min), Shinkansen south→Kumamoto (~25–30 min)."),
  "iki>kumamoto":L(2.9,2,"ferry","Jetfoil→Hakata Port (~65–70 min), bus→Hakata Stn, 'Sakura'→Kumamoto (~38 min). Winter seas suspend jetfoils — the car ferry runs.",{awkward:1}),
  "yakushima>kumamoto":L(3.3,2,"flight","No Yakushima→KMJ flight — JAC→Kagoshima (~35–40 min, ~5/day, the reliable route), limousine→Kagoshima-Chūō (~40 min), 'Sakura'→Kumamoto (~50 min).",{flight:1,awkward:1}),
  "yufuin>takachiho":L(2.5,0,"car","By car (~105 km): Yamanami Highway over the Makinoto Pass (1,330 m) past Kurokawa and the Aso rim, then R325/R218 — budget 3h in January. ⚠ The pass gets real snow/ice closures: studless tires, check regulations morning-of; low-road fallback via Taketa/R57 (+~30 min). (Transit is a full day, ~6.5h via Kumamoto — this leg is why the car exists.)",{car:1,awkward:1,drive:1,ice:1}),
  "takachiho>amakusa":L(3.2,0,"car","By car (~140 km): R218 west off the highlands (~2h), then R266/R57 via Uto–Misumi and the Five Bridges to Matsushima (~1h10), skirting central Kumamoto. Transit alt: 'Takachiho-gō' + 'Amakusa-gō' buses via Sakuramachi (~4.5–5h, timed around the 2/day constraint). Front-load the mountain half before dusk in January.",{car:1,awkward:1,drive:1}),
  "kurokawa>takachiho":L(1.15,0,"car","~64 km / ~1h9 by car over the Aso highlands — no practical bus link; January snow or ice can slow the mountain road. (Drive-time only — verify before booking.)",{car:1,drive:1}),
  "fukuoka>iki":L(1.6,1,"ferry","Nishitetsu bus #99 Hakata Stn→Hakata Port (~20 min), Kyushu Yusen jetfoil 'Venus'→Iki, Ashibe/Gonoura (~1h05–1h10), then the inn's free shuttle (~15 min, reserve). The car ferry is the slower ~2h20 alternative; winter thins frequency, not duration.",{awkward:1}),
  "karatsu>iki":L(2.0,0,"ferry","Kyushu Yusen car ferry Karatsu East Port→Indoji (~1h45; ferry only, no jetfoil), then the inn's free shuttle (~15 min). Excludes the hop from Karatsu town out to the East Port.",{car:1}),
  "fukuoka>yakushima":L(2.75,1,"flight","Fukuoka City Subway Hakata→Fukuoka Airport (~5 min), JAC direct flight FUK→Yakushima (~1h05, ~1/day — frequently weather-cancelled, keep a backup), then the free hotel shuttle (~40 min, reserve ≥3 days).",{flight:1}),
  "kagoshima>yakushima":L(2.5,1,"flight","Airport limousine bus Kagoshima-Chūō→Kagoshima Airport (~40 min), JAC flight KOJ→Yakushima (~35 min), then the free hotel shuttle (~40 min, reserve ≥3 days). The Toppy/Rocket jetfoil from Kagoshima port (~2h to Miyanoura) is the weather-sensitive sea alternative.",{flight:1}),
  "kirishima>yakushima":L(2.5,2,"flight","Car/taxi Kirishima→Kagoshima Airport (~35 min; the airport sits right by the Kirishima onsen), JAC flight KOJ→Yakushima (~35 min), then the free hotel shuttle (~40 min).",{flight:1}),

  /* ── Kyushu winter driving matrix — researched 2026-07-06 (kosoku.jp, MLIT road timetable & snow
     bulletins, NEXCO West, ferry operators, town/tourism pages; sourced prose in research/transit-notes.md).
     Matrix rule: rental legs assume studless tires (a paid, stock-limited option in Kyushu — request at
     booking) and a morning iHighway check on highland days. ── */
  "kirishima>takachiho":L(3.7,0,"car","By car (~245 km, ~3h40): the winter-safe coastal loop — Mizobe IC → Kyushu Expwy → Ebino JCT → Miyazaki/Higashi-Kyushu Expwy → Nobeoka JCT → free E77/R218 up to Takachiho (~¥5,020). Budget 4–4.5h in January; only the first ~30 km (airport plateau→Ebino JCT) is snow-exposed, and the Nobeoka-side Takachiho approach is almost never chain-regulated. ⚠ Skip the shorter Gokase route (R218 via Matsubase, ~3h) in winter — it stacks Kyushu's two most snow-prone stretches.",{car:1,awkward:1,drive:1}),
  "kirishima>amakusa":L(4.0,0,"car","The southern sea entry, sea-level end-to-end: R504 west to Kuranomoto Port (~2h), Sanwa car ferry→Ushibuka (30 min, ¥3,500 incl. driver, 9/day, drive-up first-come), then R266 up-island to Matsushima (~59 km, ~1h15). Budget ~4.5–5h with port buffer. ⚠ The ferry dry-docks ~Jan 25–Feb 4 every year (2026: Jan 26–Feb 4) — fine mid-January, dead after ~Jan 24; the all-land fallback runs the Ebino snow corridor via Kumamoto.",{car:1,awkward:1,drive:1}),
  "hita>yufuin":L(1.0,0,"train","Ltd Exp 'Yufu' / 'Yufuin no Mori' straight down the JR Kyudai Main Line, Yufuin→Amagase ~42–50 min ride + the Tensui pickup and Enowa-shuttle/taxi ends (2026-07 audit: the old 0.83 was the bare ride), no transfer — Amagase (天ヶ瀬) is a scheduled express stop and Sanso Tensui sits a few minutes from that station (the leg does NOT run to Hita Station proper). ~6 limited expresses/day toward Hakata (Yufu 09:08/14:15/19:27 · Yufuin-no-Mori 12:01/15:56/17:17 from Yufuin, 2026 timetable) — all reserved-seat; the scenic Yufuin-no-Mori sells out, so book ahead. Enowa's shuttle reaches Yufuin Station. Runs year-round, sidestepping the Mizuwake Pass winter-tire regulation that dogs the parallel car route.",{train:1}),
  "takeo>karatsu":L(1.0,0,"car","By car ~38–40 km up the R203 Taku–Kyuragi corridor (parts on free auto-road sections), ~50–60 min. Lowland Saga basin — winter-trivial. Links Chikurintei to Yoyokaku without touching Hakata.",{car:1,drive:1}),
  /* Loc-pair closure (all mainland ryokan-loc ⇄ ryokan-loc pairs) — researched 2026-07-06.
     Kirishima departures all funnel through the Kakuto corridor (Yatsushiro JCT–Ebino IC) in hour one —
     one morning iHighway check gates them all. Yufuin/Hita departures exit the Hita–Hiji zone quickly
     westbound. Everything past Tosu JCT is lowland until the Unzen climb. */
  "kirishima>yufuin":L(3.9,0,"car","The long south–north haul (~310 km, ~3h50): Mizobe IC → Kyushu Expwy → Tosu JCT → Oita Expwy → Yufuin IC (¥6,830). Budget 4¾–5½h in January — it crosses BOTH the Kakuto corridor and the Hita–Hiji winter-tire zone; if Kakuto closes, the Miyazaki-coast loop via Hiji JCT adds ~1¼h. (Carless, rail via Kagoshima-Chūō ≈3.2h is the saner mode — see kagoshima>yufuin.)",{car:1,awkward:1,drive:1}),
  "kirishima>hita":L(3.6,0,"car","~281 km, ~3h40: Kyushu Expwy → Tosu JCT → Oita Expwy → Amase-Takatsuka IC (¥6,200), then ~20 min down to the Amagase valley (set the nav to Amagase post office — Tensui warns of misrouting). Budget 4½–5h (Kakuto + the Hita–Hiji zone).",{car:1,awkward:1,drive:1}),
  "kirishima>kurokawa":L(3.4,0,"car","~197 km, ~3¼–3½h: Kyushu Expwy to Kumamoto IC (1h38, ¥3,650), then R57 → Milk Road → R442 (~1h30). Budget 4–4¾h — Kakuto first, then the Aso-rim hour, the riskiest surface stretch of the southern matrix; if the rim is white, the Hita/R212 valley fallback adds ~30–45 min.",{car:1,awkward:1,drive:1}),
  "kirishima>unzen":L(3.5,0,"car","Ferry-assisted, ~3¼–3¾h door-to-door: Kyushu Expwy → Matsubase IC (1h24, ¥3,170), Kumamoto Port, Ocean Arrow car ferry→Shimabara (30 min, ~¥5,000 + ~¥1,600/passenger — car slots open 1 month out, reserve), then the ~25–30 min R57 climb. Budget 3¾–4½h; take a midday boat so the climb is in daylight. (All-land via Isahaya: ~350 km, ~4½h, ¥7,130 — the no-reservation fallback.)",{car:1,awkward:1,drive:1}),
  "kirishima>karatsu":L(3.75,0,"car","~281 km, ~3¾h: Kyushu Expwy → Tosu JCT → Nagasaki Expwy → Taku IC (¥5,950), then R203 ~30 min. Budget 4¼–4¾h — Kakuto is the only exposure; Saga lowlands after.",{car:1,awkward:1,drive:1}),
  "kirishima>takeo":L(3.5,0,"car","~272 km, ~3½h: Kyushu Expwy → Tosu JCT → Nagasaki Expwy → Takeo-Kitagata IC (¥6,160), then ~10 min to Mifuneyama. Budget 4–4½h — Kakuto only.",{car:1,awkward:1,drive:1}),
  "yufuin>amakusa":L(3.1,0,"car","~222 km, ~3h05: Oita Expwy → Tosu JCT → Kyushu Expwy → Matsubase IC (2h04, ¥4,640), then R266 via Misumi and the Five Bridges to Matsushima (~1h). Budget 3¾–4h — the Hita–Hiji zone at the start only; coastal and snow-free past Tosu. (Carless: Yufuin no Mori→Hakata + Shinkansen→Kumamoto + Misumi Line + boat/taxi ≈ 4.2h, 3 changes — the car saves over an hour here.)",{car:1,drive:1}),
  "yufuin>unzen":L(3.2,0,"car","~230 km, ~3h10: Oita Expwy → Tosu JCT → Nagasaki Expwy → Isahaya IC (2h08, ¥4,740), then R57 via Aino/Obama up to Unzen (~65 min). Budget ~4h — the Hita–Hiji zone at the start, the Unzen R57 climb at the end. (The Kumamoto car-ferry variant is slower and pricier here — skip.)",{car:1,drive:1}),
  "yufuin>karatsu":L(2.25,0,"car","~160 km, ~2h10: Oita Expwy → Tosu JCT → Nagasaki Expwy → Taku IC (1h30, ¥3,470), then R203 + the Kyuragi toll bypass (¥210) ~40 min. Budget ~2¾h.",{car:1,drive:1}),
  "yufuin>takeo":L(1.75,0,"car","~145 km, ~1h45: Oita Expwy → Tosu JCT → Nagasaki Expwy → Takeo-Kitagata IC (1h36, ¥3,700), then 5 min to the onsen street. Budget ~2¼h — the Hita–Hiji zone at the start only. (Carless: 'Yufuin no Mori'/'Yufu'→Hakata ~2h10 + 'Relay Kamome'→Takeo-Onsen ~1h05, ≈3.6h, 1 change — the same trains as the Nagasaki run, stopping one stop short; composes from the researched yufuin>fukuoka + takeo>fukuoka segments.)",{car:1,drive:1}),
  "hita>karatsu":L(2.0,0,"car","~128 km, ~2h: R210 to Hita IC (~20–25 min, valley — prefer it over the plateau Amase-Takatsuka IC in January), Oita→Nagasaki Expwy → Taku IC (53 min, ¥2,420), then R203 ~40 min (+¥210 Kyuragi bypass). Budget ~2½h.",{car:1,drive:1}),
  "hita>takeo":L(1.5,0,"car","~113 km, ~1h25: R210 to Hita IC, expressways → Takeo-Kitagata IC (59 min, ¥2,720), then 5 min in. Budget ~2h.",{car:1,drive:1}),
  "kurokawa>amakusa":L(2.9,0,"car","~115–120 km, ~2h55: off the rim to Kumamoto IC (~1h30), a Kyushu Expwy hop to Matsubase IC (15 min, ¥810 — skips city traffic), then R266 via Misumi and the Five Bridges to Matsushima (~1h10). Budget 3¼–3½h — the Aso-rim descent is the only winter segment; coastal after. (The Takefue→Tayuta hop.)",{car:1,awkward:1,drive:1}),
  "kurokawa>unzen":L(3.75,0,"car","Ferry-assisted, ~3h40–3h50 door-to-door (only ~2h40 of it driving): rim descent to Kumamoto IC (~1h30), port (~40 min), Ocean Arrow→Shimabara (30 min, ~¥5,100 — reserve), then the ~30-min R57 climb. Budget ~4¼h. (All-land via Hita IC + Isahaya: ~225 km, ~3h40, ¥3,790 — the no-reservation fallback.)",{car:1,awkward:1,drive:1}),
  "amakusa>unzen":L(2.5,0,"car","The strait short-cut (~60–65 km driven): Matsushima→Oniike Port ~45 min (¥200 toll road), Shimatetsu drive-up car ferry→Kuchinotsu (30 min, ¥3,900, last 17:45), then ~45 min up R57 to the 700-m resort. ~2h20–2h40 door-to-door; budget 3h — only the final climb is a winter segment.",{car:1,drive:1}),
  "amakusa>karatsu":L(3.3,0,"car","~205 km, ~3h20: R266 via Misumi → Matsubase IC (~1h10), Kyushu→Nagasaki Expwy → Taku IC (1h26, ¥3,700), then R203 ~40 min (+¥210). Budget 3½–3¾h — effectively winter-free.",{car:1,drive:1}),
  "amakusa>takeo":L(3.0,2,"train","Carless via Misumi: inn-synced 15–20-min boat/taxi to Misumi, Misumi Line→Kumamoto (~50–60 min), then Shinkansen→Shin-Tosu + Relay Kamome→Takeo-Onsen (~1.8h) — all-rail, snow-proof. Drive variant: ~190 km, ~2h50 via Matsubase IC → Takeo-Kitagata IC (¥3,920), winter-free.",{car:1}),
  "hita>kurokawa":L(1.25,0,"car","~55 km, ~1h–1h25, toll-free: R210 to Hita, then R212 up the valley → Oguni → R442 east — one of Kurokawa's three official approach roads, low until the final climb and it skips Mizuwake entirely. Budget 1h30–1h45 (the R442/Kurokawa approach is the only winter bit — Shinmeikan's live cams ⑤/⑥ are the morning check). ⚠ The shorter Farm Road WAITA plateau shortcut is untreated 600–900 m municipal road with closure history — not the January move.",{car:1,drive:1}),
  "hita>takachiho":L(3.0,0,"car","~200 km, ~2h50–3h05: Hita IC → Tosu JCT → Kyushu Expwy → Kashima JCT → free E77 → Yamato-Tsujunkyō IC → R218 east (~¥3,750). Budget ~3h15 — only the well-treated R218 corridor is exposed. ⚠ The direct Aso crossing (R212 over Mizuwake → caldera → R325 Takamori) saves ~45 min but stacks three winter zones — dry, above-freezing days only.",{car:1,drive:1}),
  "hita>amakusa":L(2.5,0,"car","~180 km, ~2h30: Hita IC → Tosu JCT → Kyushu Expwy → Matsubase IC (1h27, ¥3,690), then R266 via Misumi and the Five Bridges (~1h). Budget ~2h45 — the least winter-exposed leg in the Hita set; sea-level last mile.",{car:1,drive:1}),
  "hita>unzen":L(2.7,0,"car","~180 km, ~2h30–2h45: Hita IC → Tosu JCT → Nagasaki Expwy → Isahaya IC (1h31, ¥3,790), then R57 via Aino/Obama and the switchback climb to 700 m (~45–65 min). Budget ~3h15 — the climb is the whole winter story (Unzen carries the strictest Nov–Mar tire/chain language of any stop).",{car:1,drive:1}),
  "kurokawa>karatsu":L(2.6,0,"car","~153 km, ~2h35: R442→R212 down the valley to Hita IC (~1h), Oita→Nagasaki Expwy → Taku IC (53 min, ¥2,420), then R203 ~40 min (+¥210 Kyuragi bypass). Budget ~3h — exposure is front-loaded in the first 40 min off the Kurokawa plateau.",{car:1,drive:1}),
  "kurokawa>takeo":L(2.25,0,"car","~145 km, ~2h15: the same R442→R212→Hita IC descent, expressways → Takeo-Kitagata IC (59 min, ¥2,720), then 5–10 min in. Budget ~2h45. (The Takefue→Chikurintei hop.)",{car:1,drive:1}),
  "unzen>takeo":L(1.75,0,"car","~88 km, ~1h45: R57 descent to Isahaya IC (~55 min), Nagasaki Expwy → Takeo-Kitagata IC (33 min, ¥1,550), then 5–10 min in. Budget ~2h15 — all the winter risk is the first 30 min of hairpins; leave mid-morning after the sun has worked on them.",{car:1,drive:1}),
  "unzen>karatsu":L(2.25,0,"car","~127 km, ~2h15: R57 descent to Isahaya IC, Nagasaki Expwy → Taku IC (39 min, ¥1,850), then R203 ~40 min (+¥210 Kyuragi bypass). Budget 2¾–3h — Unzen descent only.",{car:1,drive:1}),
  "unzen>takachiho":L(4.0,0,"car","Ferry-assisted (~105 km driven, ~3h50–4h door-to-door): down to Shimabara Port (~25–30 min), Ocean Arrow→Kumamoto (30 min, ~¥4,400–5,200 — reserve), across south Kumamoto to Kashima JCT (~50 min), free E77 → R218 east (~50 min). Tolls ¥0. Budget 4½–5h — Unzen descent at the start, R218 Gokase at the end. (All-land via Isahaya/Tosu/Kumamoto: ~282 km, ~4½h, ¥4,480, and it crosses the chain-listed Takamori Pass — ferry wins on every axis.)",{car:1,awkward:1,drive:1}),
  "takachiho>karatsu":L(3.4,0,"car","~224 km, ~3h15–3h30: R218 west over the Gokase highlands (~50 min — the only exposed segment), free E77 → Kashima JCT → Kyushu→Nagasaki Expwy → Taku IC (~¥3,460), then R203 ~40 min (+¥210). Budget 4–4½h. The E77 bypasses the chain-listed Tsuhana Pass entirely; in a real snow event both parallels close at once — wait it out in Takachiho rather than force the pass.",{car:1,drive:1}),
  "takachiho>takeo":L(3.0,0,"car","~207 km, ~3h: the same R218-west + free-E77 spine, exit Takeo-Kitagata IC (~¥3,680), then 5–10 min in. Budget 3¾–4¼h — R218 Gokase for the first ~40 km, low expressway after. (The Shinsen→Chikurintei hop.)",{car:1,drive:1}),

  /* ── Kanazawa→Tokyo return-corridor onsen stops — researched 2026-07-07 (Snow Monkey Resorts access,
     Nagaden/Hokuhoku/Hokuriku timetables, NAVITIME, inn access pages; sourced prose in transit-notes.md).
     Added for the loop-finale inns Fujiiso/Shoraiso (Nagano), Tamakiya (Matsunoyama), Garaku (Toyama);
     Ryugon resolves via the existing echigoyuzawa legs. ── */
  "tokyo>yudanaka":L(2.6,1,"train","Hokuriku Shinkansen 'Kagayaki' Tokyo→Nagano (~1h20–1h30), change to the Nagaden Ltd Exp 'Snow Monkey'/'Yukemuri'→Yudanaka (~45 min), then ~7 min to the inn — snow-monkey country. ~2h35 door-to-door. ⚠ Nagaden halved ltd-exp service to ~10/day (Sep 2024) — plan the Nagano connection; local fallback ~70–80 min."),
  "kanazawa>yudanaka":L(2.2,1,"train","Hokuriku Shinkansen 'Kagayaki' Kanazawa→Nagano (~65 min), Nagaden Ltd Exp→Yudanaka (~45 min) + ~7 min (inn pickup 15:00–18:30, or walk). ⚠ Nagaden halved ltd-exp service to ~10/day (Sep 2024) — the Nagano connection is roughly hourly; local fallback ~70–80 min. Nagano is a straight shot on the mainline return."),
  "tokyo>yamadaonsen":L(2.3,0,"train","Hokuriku Shinkansen Tokyo→Nagano (~1h20–1h30), then a ~30–45-min car up to Yamada Onsen (Fujiiso arranges transport; no rail last mile — nearest is Suzaka Stn + taxi). ~2h20 door-to-door.",{car:1}),
  "kanazawa>yamadaonsen":L(2.0,0,"train","Hokuriku Shinkansen Kanazawa→Nagano (~65 min), then a ~30–45-min car to Yamada Onsen. ~2h door-to-door.",{car:1}),
  "tokyo>matsunoyama":L(2.5,2,"train","Jōetsu Shinkansen Tokyo→Echigo-Yuzawa (~75 min), JR Jōetsu line→Muikamachi (~22 min), Hokuhoku line→Matsudai (~24 min), then the ~20-min inn shuttle. ⚠ The Hokuhoku locals run ~hourly (all-stops since 2023) — budget 3h if a connection slips.",{awkward:1}),
  "kanazawa>matsunoyama":L(3.3,2,"train","Hokuriku Shinkansen Kanazawa→Jōetsumyōkō (~64 min), Hokuhoku line toward Matsudai (~55–65 min, one change, sparse), then the ~20-min inn shuttle. Confirm the day's Jōetsumyōkō→Matsudai connection at booking — frequency is the binding constraint.",{awkward:1}),
  "tokyo>toyama":L(2.9,0,"train","Hokuriku Shinkansen 'Kagayaki' Tokyo→Toyama (~2h06), then a ~40-min taxi/inn car to River Retreat Garaku in the Jinzu gorge (free shuttle from Sasazu Stn, 3 min, if timed).",{car:1}),
  "kanazawa>toyama":L(1.1,0,"train","Hokuriku Shinkansen Kanazawa→Toyama (~23 min), then a ~40-min taxi/inn car to Garaku.",{car:1}),
  "tokyo>karuizawa":L(1.6,0,"train","Hokuriku Shinkansen 'Asama' Tokyo→Karuizawa (~1h06–1h16), then ~15 min by taxi (free hotel pickup) — the easiest access on the whole corridor. For the Hiramatsu (Miyota), ride one stop on to Sakudaira + a ~20-min taxi (~1.9h total)."),
  "kanazawa>karuizawa":L(2.2,1,"train","Hokuriku Shinkansen 'Hakutaka' Kanazawa→Karuizawa direct (~1h50; the faster 'Kagayaki' skips Karuizawa), then ~15 min by taxi. The Hiramatsu adds ~15–20 min to Miyota via Sakudaira (~2.4h)."),

  /* ── Gunma–Niigata–Nagano inter-inn cluster — researched 2026-07-09 (Snow Monkey Resorts access
     pages, rome2rio, japan-guide, kanazawastation.com; sourced prose in research/transit-notes.md).
     Fixes the "flat ~1.5h" region-hub estimate (north's hub is Sendai — geographically wrong for these
     Jōetsu/Nagano inns). Structural fact: Nagano is the hub for Yudanaka (Nagaden), Yamada Onsen (car)
     and Matsumoto (Shinano ~50 min); the Jōetsu inns (Tanigawa=Jōmō-Kōgen, Echigo-Yuzawa) join the
     Hokuriku line only at Takasaki, so Nagano↔Jōetsu always backtracks south via Takasaki. Chauffeured
     last miles (inn car/shuttle/taxi) are not self-handled transfers. Legs auto-reverse. ── */
  "karuizawa>yudanaka":L(1.75,1,"train","Hokuriku Shinkansen Karuizawa→Nagano (~30 min), change at Nagano to the Nagaden Ltd Exp 'Snow Monkey'/'Yukemuri'→Yudanaka (~45 min), then ~7-min inn car. Nagaden runs reliably in snow (local ~70–80 min is the fallback)."),
  "karuizawa>yamadaonsen":L(1.5,0,"shinkansen","Hokuriku Shinkansen Karuizawa→Nagano (~30 min), then the inn's arranged car ~30–45 min up to Yamada Onsen — no self-handled transfer. ⚠ the mountain road can be snowbound in January; confirm the pickup ahead.",{car:1}),
  "karuizawa>matsumoto":L(2.33,1,"train","Hokuriku Shinkansen Karuizawa→Nagano (~30 min), change to JR Ltd Exp 'Shinano' Nagano→Matsumoto (~50 min, ~hourly), then ~35–45-min inn shuttle.",{car:1}),
  "yudanaka>yamadaonsen":L(1.75,0,"train","Nagaden Yudanaka→Nagano (~45 min), then the inn's arranged car ~30–45 min out to Yamada Onsen — both sit in Nagano's hinterland, routed via the Nagano hub; no self-handled transfer. Snowy mountain roads in January.",{car:1}),
  "yudanaka>matsumoto":L(2.75,1,"train","Nagaden Yudanaka→Nagano (~45 min, incl. the ~7-min inn hop), change to JR Ltd Exp 'Shinano' Nagano→Matsumoto (~50 min), then ~35–45-min inn shuttle.",{car:1}),
  "yudanaka>echigoyuzawa":L(3.5,2,"shinkansen","Nagaden Yudanaka→Nagano (~45 min), Hokuriku Shinkansen 'Asama' Nagano→Takasaki (~53 min), change to Jōetsu Shinkansen Takasaki→Echigo-Yuzawa (~36 min), then ~30-min inn car. Backtracks south to Takasaki to swing north — two self-handled changes; heavy Jōetsu snow but the shinkansen is reliable.",{awkward:1,car:1}),
  "yamadaonsen>matsumoto":L(2.4,0,"train","Inn's arranged car Yamada Onsen→Nagano (~30–45 min), JR Ltd Exp 'Shinano' Nagano→Matsumoto (~50 min), then ~35–45-min inn shuttle — one rail change at Nagano, both ends chauffeured.",{car:1}),
  "tanigawa>karuizawa":L(1.5,1,"shinkansen","~20-min taxi to Jōmō-Kōgen (or free inn pickup to Minakami), Jōetsu Shinkansen→Takasaki (~20 min), change to Hokuriku Shinkansen Takasaki→Karuizawa (~16 min), then ~15-min taxi/hotel pickup. No direct rail — Takasaki is the shinkansen split point.",{car:1}),
  "tanigawa>yudanaka":L(3.0,2,"shinkansen","~20-min taxi to Jōmō-Kōgen, Jōetsu Shinkansen→Takasaki (~20 min), change to Hokuriku Shinkansen Takasaki→Nagano (~50 min), change to the Nagaden Ltd Exp Nagano→Yudanaka (~45 min), then ~7-min inn car. Two self-handled changes — plan the Nagaden connection at Nagano.",{awkward:1,car:1}),
  "echigoyuzawa>karuizawa":L(1.83,1,"shinkansen","~30-min inn car to Echigo-Yuzawa, Jōetsu Shinkansen→Takasaki (~30–36 min), change to Hokuriku Shinkansen Takasaki→Karuizawa (~16 min), then ~15-min taxi/hotel pickup. One rail change at Takasaki.",{car:1}),
  "echigoyuzawa>matsunoyama":L(2.0,1,"train","~30-min inn car to Echigo-Yuzawa, JR Jōetsu local→Muikamachi (~22 min), change to the Hokuhoku Line Muikamachi→Matsudai (~27 min), then ~20-min inn shuttle. ⚠ Hokuhoku runs ~hourly and ~half terminate at Muikamachi — mind the connection.",{car:1}),
  "matsunoyama>tanigawa":L(2.5,2,"train","~20-min inn shuttle to Matsudai, Hokuhoku Line→Muikamachi (~27 min), JR Jōetsu local Muikamachi→Echigo-Yuzawa (~22 min), Jōetsu Shinkansen→Jōmō-Kōgen (~15 min), then ~20-min taxi (or inn pickup at Minakami). Two self-handled changes; the Muikamachi change can carry a wait.",{awkward:1,car:1}),
  "matsunoyama>yudanaka":L(4.9,3,"train","The board's most awkward hop: ~20-min shuttle to Matsudai, Hokuhoku Line west to Naoetsu (~30 min), Myōkō Haneuma Line→Jōetsumyōkō (~14 min), Hokuriku Shinkansen→Nagano (~20 min), Nagaden Ltd Exp→Yudanaka (~45 min), then ~7-min inn car. ⚠ Three self-handled changes on sparse Hokuhoku/Myōkō-Haneuma services — miss a connection and it runs past 5h. Verify each before committing.",{awkward:1,car:1}),
  "matsumoto>echigoyuzawa":L(3.83,2,"shinkansen","~35–45-min inn shuttle to Matsumoto, JR Ltd Exp 'Shinano'→Nagano (~50 min), Hokuriku Shinkansen 'Asama' Nagano→Takasaki (~53 min), change to Jōetsu Shinkansen Takasaki→Echigo-Yuzawa (~36 min), then ~30-min inn car. No shortcut — Nagano→Echigo-Yuzawa always detours south to Takasaki.",{awkward:1,car:1}),
  "matsumoto>kanazawa":L(3.0,1,"shinkansen","~35–45-min inn shuttle to Matsumoto, JR Ltd Exp 'Shinano'→Nagano (~50 min), change to Hokuriku Shinkansen 'Kagayaki'/'Hakutaka' Nagano→Kanazawa (~65–70 min). One change at Nagano — cleaner than the Shinano→Nagoya→Kanazawa alternative.",{car:1}),

  /* ── Tōhoku inter-inn + Kanazawa cluster — researched 2026-07-09 (rome2rio, NAVITIME, uenostation.com,
     JR East / Yamagata / Akita Shinkansen timetables; sourced prose in research/transit-notes.md). Fills
     the Kamasaki/Shizukuishi/Nikkō cross-links and every Tōhoku-inn↔Kanazawa leg (was a flat ~6.75h/4tx
     via-Sendai estimate). Structural fact: Kanazawa reaches Tōhoku via ŌMIYA — both the Hokuriku and
     Tōhoku Shinkansen stop there, avoiding central Tokyo. Fukushima = the Yamagata (Tsubasa) split;
     Morioka/Sendai = the Akita (Komachi) split. The Tsubasa (Itaya pass) and Komachi (past Morioka) are
     the fragile winter branches. Chauffeured last miles aren't self-handled transfers; legs auto-reverse. ── */
  "kamasaki>tsuchiyu":L(1.5,0,"shinkansen","Inn shuttle to Shiroishi-Zaō (~18 min), Yamabiko south to Fukushima (~11 min), then ~25-min taxi up to Tsuchiyu — ~55 min in motion; the rest is connection slack, because only roughly-hourly Yamabiko serve Shiroishi-Zaō (Hayabusa skips it) so the shuttle banks a cushion at the station. Single train, no self-handled change — reliable Tōhoku main line, minimal January snow risk.",{car:1}),
  "kamasaki>iizaka":L(1.5,1,"train","Inn shuttle to Shiroishi-Zaō, Yamabiko→Fukushima (~11 min), change to the Fukushima Kōtsū Iizaka tram (~23 min, ~every 30 min) + short inn shuttle. The tram is the one self-handled transfer; low winter risk on the main line."),
  "kamasaki>akayu":L(2.0,1,"shinkansen","Inn shuttle to Shiroishi-Zaō, Yamabiko south to Fukushima (~11 min), change to the Yamagata 'Tsubasa' over the Itaya pass→Akayu (~52 min) + short taxi. One change at Fukushima. ⚠ the Tsubasa is among Japan's most winter-delay-prone segments.",{awkward:1,car:1}),
  "kamasaki>kakunodate":L(2.75,1,"shinkansen","Inn shuttle to Shiroishi-Zaō, Yamabiko north to Sendai (~15 min), change to a through 'Komachi' Sendai→Kakunodate (~1h24, no further change) + ~12-min taxi. One change at Sendai. ⚠ Komachi runs snow-prone single track past Morioka.",{awkward:1,car:1}),
  "shizukuishi>akayu":L(3.5,1,"shinkansen","Hotel shuttle Koiwai→Morioka (~28 min), direct 'Yamabiko' Morioka→Fukushima (~1h39), change to the 'Tsubasa' over the Itaya pass→Akayu (~52 min) + short taxi. One change at Fukushima. ⚠ long haul ending on the fragile winter Tsubasa branch.",{awkward:1,car:1}),
  "shizukuishi>tsuchiyu":L(2.9,0,"shinkansen","Hotel shuttle Koiwai→Morioka (~28 min), direct 'Yamabiko' Morioka→Fukushima (~1h39), then ~25-min taxi up to Tsuchiyu. Single train, no self-handled change — the Tōhoku main line is snow-reliable.",{car:1}),
  "nikko>tsuchiyu":L(2.75,1,"shinkansen","Inn shuttle to JR Nikkō, JR Nikkō Line local→Utsunomiya (~45 min, ~hourly), change to a Tōhoku 'Yamabiko' Utsunomiya→Fukushima (~44 min), ~25-min taxi to Tsuchiyu. One change at Utsunomiya — the JR/Utsunomiya routing, NOT the Asakusa-bound Tōbu. ⚠ the snowy Nikkō local is infrequent.",{awkward:1,car:1}),
  "nikko>iizaka":L(2.9,2,"train","Inn shuttle to JR Nikkō, JR Nikkō Line→Utsunomiya (~45 min), 'Yamabiko'→Fukushima (~44 min), then the Iizaka tram (~23 min) + short shuttle. Two self-handled changes (Utsunomiya, then the Fukushima tram) — wait-prone in January.",{awkward:1}),
  "nikko>akayu":L(2.8,1,"shinkansen","Inn shuttle to JR Nikkō, JR Nikkō Line→Utsunomiya (~45 min), then board the through 'Tsubasa' at Utsunomiya→Akayu (~93 min — it runs coupled through, no Fukushima change) + short taxi. One change. ⚠ compounded winter risk — the Nikkō local plus the Itaya-pass Tsubasa.",{awkward:1,car:1}),
  "kanazawa>tsuchiyu":L(3.9,1,"shinkansen","Hokuriku Shinkansen Kanazawa→Ōmiya (~2h01 'Kagayaki', avoiding central Tokyo), cross to the Tōhoku 'Yamabiko' Ōmiya→Fukushima (~1h07), then ~25-min taxi to Tsuchiyu. Single clean change at Ōmiya on reliable lines.",{car:1}),
  "kanazawa>iizaka":L(4.2,2,"shinkansen","Hokuriku Shinkansen Kanazawa→Ōmiya (~2h01), Tōhoku 'Yamabiko' Ōmiya→Fukushima (~1h07), then the Iizaka tram (~23 min) + shuttle. Two changes (Ōmiya, Fukushima→tram); the Tōhoku trunk is snow-reliable.",{awkward:1}),
  "kanazawa>akayu":L(4.6,2,"shinkansen","Hokuriku Shinkansen Kanazawa→Ōmiya (~2h01), Tōhoku 'Yamabiko' Ōmiya→Fukushima (~1h07), change to the 'Tsubasa' over the Itaya pass→Akayu (~52 min) + short taxi. Two changes (Ōmiya, Fukushima). ⚠ heavy January delay exposure on the final Tsubasa leg.",{awkward:1,car:1}),
  "kanazawa>kakunodate":L(5.1,1,"shinkansen","Hokuriku Shinkansen Kanazawa→Ōmiya (~2h01), cross to a through 'Komachi' Ōmiya→Kakunodate (~2h36; Ōmiya→Morioka ~1h51 + Morioka→Kakunodate ~45 min, one train) + ~12-min taxi. Just one change at Ōmiya despite the length. ⚠ Komachi on snow-prone single track past Morioka.",{awkward:1,car:1}),
  "kanazawa>shizukuishi":L(4.75,1,"shinkansen","Hokuriku Shinkansen Kanazawa→Ōmiya (~2h01), cross to a 'Hayabusa'/'Komachi' Ōmiya→Morioka (~1h51), then the free hotel shuttle to Koiwai (~28 min, reserve). Single change at Ōmiya on the snow-reliable Tōhoku main line; length is the only real cost.",{awkward:1,car:1}),
  "kanazawa>kamasaki":L(4.4,1,"shinkansen","Hokuriku Shinkansen Kanazawa→Ōmiya (~2h01), cross to a Shiroishi-Zaō-calling 'Yamabiko' (~12–13/day, roughly hourly; Ōmiya→Shiroishi-Zaō ~1h23) + inn shuttle (~18 min). One change at Ōmiya — the 4.4h prices the wait for the select Yamabiko; off-peak an added Fukushima/Sendai change can beat waiting (→2 changes).",{awkward:1,car:1}),
  "kanazawa>nikko":L(4.0,2,"shinkansen","Hokuriku Shinkansen Kanazawa→Ōmiya (~2h01), Tōhoku 'Yamabiko'/'Nasuno' Ōmiya→Utsunomiya (~25 min), change to the JR Nikkō Line local→Nikkō (~45 min, ~hourly) + inn shuttle. Two changes (Ōmiya, Utsunomiya) — reaches Fufu via the JR side, not the Asakusa Tōbu.",{awkward:1,car:1}),
  /* ── Tōkaidō gateways → Nikkō (researched 2026-09-09) ────────────────────────────────────────
     kyoto/osaka/nagoya→nikko fell to the hub estimate; all three ride the SAME two tails as
     kanazawa>nikko, so they're authored as one family. CHAIN CHOSEN: Tōkaidō Shinkansen→Tokyo Stn,
     cross to the Tōhoku Shinkansen ('Yamabiko'/'Nasuno', Tokyo→Utsunomiya ~50 min, several per hour),
     then the JR Nikkō Line local (~45 min, ~1–2/hr) + inn shuttle — the JR side, into JR Nikkō.
     The Asakusa Tōbu alternative LOSES: the direct 'Spacia'/'Revaty' Asakusa→Tōbu-Nikkō is itself
     ~1h50 (2/hr, all-reserved), the same as the whole Tokyo→Utsunomiya→Nikkō JR chain, but reaching
     Asakusa from the Tōkaidō arrival platform is a ~20–25-min crosstown with bags and its own change
     — so it is +1 transfer for no time saved. STATION CONVENTION as elsewhere: `kyoto`/`nagoya` are
     the central Shinkansen stations; `osaka` = central Osaka (Umeda), so the Tōkaidō leg is anchored
     at SHIN-OSAKA and the ~4-min Midōsuji hop (~15 min with walk and wait) is folded in and counted
     as one change — which is the whole of the osaka−kyoto gap here. Sources in transit-notes.md. */
  "kyoto>nikko":L(4.7,2,"shinkansen","Tōkaidō 'Nozomi' Kyoto→Tokyo (~2h15, ~4/hr), cross the Tokyo Stn Shinkansen concourse to a Tōhoku 'Yamabiko'/'Nasuno'→Utsunomiya (~50 min), change to the JR Nikkō Line local→Nikkō (~45 min, ~1–2/hr) + inn shuttle. Two self-handled changes (Tokyo, Utsunomiya). Chosen over the Asakusa Tōbu 'Spacia' (same ~1h50 tail, but a ~20–25-min crosstown from Tokyo Stn on top = +1 change). ⚠ ends on the hourly, snow-slow Nikkō local; ⚠ Tōkaidō services run all-reserved over the New Year peak.",{awkward:1,car:1}),
  "osaka>nikko":L(5.2,3,"shinkansen","Midōsuji hop Umeda→Shin-Osaka, Tōkaidō 'Nozomi' Shin-Osaka→Tokyo (~2h35, ~4/hr), cross to a Tōhoku 'Yamabiko'/'Nasuno'→Utsunomiya (~50 min), then the JR Nikkō Line local→Nikkō (~45 min, ~1–2/hr) + inn shuttle. Three self-handled changes (Shin-Osaka, Tokyo, Utsunomiya) — the extra half-hour over the Kyoto twin is the further Nozomi run plus the Midōsuji hop. ⚠ the hourly Nikkō local is the fragile end; ⚠ all-reserved Tōkaidō over New Year.",{awkward:1,car:1}),
  "nagoya>nikko":L(4.1,2,"shinkansen","Tōkaidō 'Nozomi' Nagoya→Tokyo (~1h34–1h40, ~4/hr), cross the Tokyo Stn concourse to a Tōhoku 'Yamabiko'/'Nasuno'→Utsunomiya (~50 min), change to the JR Nikkō Line local→Nikkō (~45 min, ~1–2/hr) + inn shuttle. Two self-handled changes (Tokyo, Utsunomiya); the shortest of the Tōkaidō-gateway Nikkō links. ⚠ the snow-slow Nikkō local still sets the floor.",{awkward:1,car:1}),

  /* ── Cross-cluster closure: every Tōhoku inn ↔ every Nagano/Jōetsu inn, + Nikkō ↔ both, + the last
     within-cluster gaps. Composed 2026-07-09 by summing the sourced segment library (Parts C/D). The two
     north sub-clusters meet only on the Tōhoku↔Hokuriku/Jōetsu trunk at ŌMIYA (Nagaden/Jōetsu inns join
     via Nagano or Takasaki), so every cross move interchanges there; Nikkō joins via Utsunomiya→Ōmiya.
     x = self-handled changes only (chauffeured last-miles excluded); through Tsubasa/Komachi reach Ōmiya
     as one ride. Times fold in ~15 min/change buffer. The long/low-confidence chains (Matsunoyama's
     Hokuhoku start, Nikkō's hourly local, the deep-Akita hauls) are flagged inline. ── */
  // Tōhoku inn → Nagano/Jōetsu inn (via Ōmiya)
  "tsuchiyu>yamadaonsen":L(3.5,1,"shinkansen","~25-min taxi down to Fukushima, Tōhoku Shinkansen Fukushima→Ōmiya (~1h07), change to the Hokuriku Shinkansen Ōmiya→Nagano (~1h), then the inn's arranged car ~30–45 min up to Yamada Onsen. One change at Ōmiya (the clean Tōhoku↔Hokuriku interchange). ⚠ the mountain road to Yamada Onsen can be snowbound in January.",{car:1}),
  "tanigawa>shizukuishi":L(3.6,1,"shinkansen","Jōetsu from Jōmō-Kōgen straight to Ōmiya, change to the Tōhoku line for Morioka + free hotel shuttle; both last-miles chauffeured, so the only transfer is at Ōmiya.",{awkward:1,car:1}),
  "tanigawa>kamasaki":L(3.3,1,"shinkansen","Jōetsu Jōmō-Kōgen→Ōmiya (~48 min), change to a Shiroishi-Zaō-calling 'Yamabiko' (~12–13/day, roughly hourly; Ōmiya→Shiroishi-Zaō 82–101 min) + inn shuttle. One change, at Ōmiya — the wait for the select Yamabiko is priced in (2026-07-27 timetable check; was 2.9h).",{car:1}),
  "echigoyuzawa>akayu":L(3.9,1,"shinkansen","Jōetsu Echigo-Yuzawa→Ōmiya, then the through Yamagata 'Tsubasa' all the way to Akayu — one ride, so the only change is at Ōmiya. ⚠ in January the Tsubasa's Fukushima–Yamagata mountain crossing is the snow-fragile link.",{awkward:1,car:1}),
  "echigoyuzawa>kakunodate":L(4.3,1,"shinkansen","Jōetsu Echigo-Yuzawa→Ōmiya, change to the through Akita 'Komachi' to Kakunodate + taxi. Single change at Ōmiya; ⚠ January snow can slow the Komachi north of Morioka.",{awkward:1,car:1}),
  "echigoyuzawa>shizukuishi":L(3.8,1,"shinkansen","Jōetsu Echigo-Yuzawa→Ōmiya, change to the Tōhoku line for Morioka + free hotel shuttle. One change, at Ōmiya.",{awkward:1,car:1}),
  "echigoyuzawa>kamasaki":L(3.4,1,"shinkansen","Jōetsu Echigo-Yuzawa→Ōmiya, change to a Yamabiko for Shiroishi-Zaō + inn shuttle. Only the Ōmiya change is self-handled.",{car:1}),
  "yudanaka>tsuchiyu":L(3.9,2,"shinkansen","Nagaden Ltd Exp down to Nagano, Hokuriku to Ōmiya, change to the Tōhoku line for Fukushima, taxi to Tsuchiyu. Two changes (Nagano, Ōmiya); ⚠ the mountain taxi is a January snow leg.",{awkward:1,car:1}),
  "yudanaka>iizaka":L(4.1,3,"shinkansen","Nagaden to Nagano, Hokuriku to Ōmiya, Tōhoku to Fukushima, then the Iizaka tram. Three self-handled changes: Nagano, Ōmiya, and the tram at Fukushima.",{awkward:1,car:1}),
  "yudanaka>akayu":L(4.5,2,"shinkansen","Nagaden to Nagano, Hokuriku to Ōmiya, then the through 'Tsubasa' to Akayu. Changes at Nagano and Ōmiya; ⚠ January snow bites on the Nagaden mountain run and the Tsubasa crossing.",{awkward:1,car:1}),
  "yudanaka>kakunodate":L(5.2,2,"shinkansen","Nagaden to Nagano, Hokuriku to Ōmiya, then the through 'Komachi' to Kakunodate. Two changes (Nagano, Ōmiya); ⚠ long, and the Komachi north of Morioka is snow-exposed in January.",{awkward:1,car:1}),
  "yudanaka>shizukuishi":L(4.7,2,"shinkansen","Nagaden to Nagano, Hokuriku to Ōmiya, Tōhoku to Morioka + hotel shuttle. Changes at Nagano and Ōmiya.",{awkward:1,car:1}),
  "yudanaka>kamasaki":L(4.0,2,"shinkansen","Nagaden to Nagano, Hokuriku to Ōmiya, change to a Yamabiko for Shiroishi-Zaō + inn shuttle. Two changes, Nagano and Ōmiya.",{awkward:1,car:1}),
  "yamadaonsen>iizaka":L(3.95,2,"shinkansen","Inn car to Nagano, Hokuriku to Ōmiya, Tōhoku to Fukushima, then the Iizaka tram. Two self-handled changes: Ōmiya and the tram.",{awkward:1,car:1}),
  "yamadaonsen>akayu":L(4.3,1,"shinkansen","Inn car to Nagano, Hokuriku to Ōmiya, then the through 'Tsubasa' to Akayu — one change, at Ōmiya. ⚠ the Tsubasa's January mountain crossing is the fragile stretch.",{awkward:1,car:1}),
  "yamadaonsen>kakunodate":L(5.1,1,"shinkansen","Inn car to Nagano, Hokuriku to Ōmiya, then the through 'Komachi' to Kakunodate. Single change at Ōmiya; ⚠ the Komachi runs snow-country north of Morioka in January.",{awkward:1,car:1}),
  "yamadaonsen>shizukuishi":L(4.55,1,"shinkansen","Inn car to Nagano, Hokuriku to Ōmiya, Tōhoku to Morioka + hotel shuttle. Only the Ōmiya change is self-handled.",{awkward:1,car:1}),
  "yamadaonsen>kamasaki":L(3.85,1,"shinkansen","Inn car to Nagano, Hokuriku to Ōmiya, change to a Yamabiko for Shiroishi-Zaō + inn shuttle. One change, at Ōmiya.",{car:1}),
  "matsunoyama>tsuchiyu":L(4.4,3,"train","Inn shuttle from Matsudai, Hokuhoku to Muikamachi, JR local to Echigo-Yuzawa, Jōetsu to Ōmiya, Tōhoku to Fukushima, taxi to Tsuchiyu. Three self-handled changes (Muikamachi, Echigo-Yuzawa, Ōmiya); ⚠ the Hokuhoku local and the mountain taxi are both January-snow weak links.",{awkward:1,car:1}),
  "matsunoyama>iizaka":L(4.7,4,"train","Inn shuttle, Hokuhoku to Muikamachi, JR local to Echigo-Yuzawa, Jōetsu to Ōmiya, Tōhoku to Fukushima, then the Iizaka tram. Four self-handled changes; ⚠ the snowbound Hokuhoku Line is the fragile January segment.",{awkward:1,car:1}),
  "matsunoyama>akayu":L(5.1,3,"train","Inn shuttle, Hokuhoku to Muikamachi, JR local to Echigo-Yuzawa, Jōetsu to Ōmiya, then the through 'Tsubasa' to Akayu. Three changes; ⚠ two January-fragile rail links (Hokuhoku, Tsubasa).",{awkward:1,car:1}),
  "matsunoyama>kakunodate":L(5.7,3,"train","Inn shuttle, Hokuhoku to Muikamachi, JR local to Echigo-Yuzawa, Jōetsu to Ōmiya, then the through 'Komachi' to Kakunodate. ⚠ Long and change-heavy; Hokuhoku and the Komachi north of Morioka both snow-exposed in January.",{awkward:1,car:1}),
  "matsunoyama>shizukuishi":L(5.2,3,"train","Inn shuttle, Hokuhoku to Muikamachi, JR local to Echigo-Yuzawa, Jōetsu to Ōmiya, Tōhoku to Morioka + hotel shuttle. Three self-handled changes; ⚠ the Hokuhoku local is the January weak link.",{awkward:1,car:1}),
  "matsunoyama>kamasaki":L(4.9,3,"train","Inn shuttle, Hokuhoku to Muikamachi, JR local to Echigo-Yuzawa, Jōetsu to Ōmiya, change to a Yamabiko for Shiroishi-Zaō + inn shuttle. Three changes; ⚠ snow-fragile Hokuhoku up front.",{awkward:1,car:1}),
  "karuizawa>tsuchiyu":L(2.7,1,"shinkansen","Hokuriku Karuizawa→Ōmiya, change to the Tōhoku line for Fukushima, taxi up to Tsuchiyu. One change at Ōmiya; ⚠ the mountain taxi is the January-snow bit.",{car:1}),
  "karuizawa>iizaka":L(2.9,2,"shinkansen","Hokuriku Karuizawa→Ōmiya, Tōhoku to Fukushima, then the Iizaka tram. Two self-handled changes: Ōmiya and the tram.",{awkward:1,car:1}),
  "karuizawa>akayu":L(3.3,1,"shinkansen","Hokuriku Karuizawa→Ōmiya, then the through 'Tsubasa' to Akayu — one change, at Ōmiya. ⚠ the Tsubasa's January mountain crossing is the fragile stretch.",{awkward:1,car:1}),
  "karuizawa>kakunodate":L(4.4,1,"shinkansen","Hokuriku Karuizawa→Ōmiya, then the through 'Komachi' to Kakunodate. Single change at Ōmiya; ⚠ snow can slow the Komachi north of Morioka in January.",{awkward:1,car:1}),
  "karuizawa>shizukuishi":L(3.8,1,"shinkansen","Hokuriku Karuizawa→Ōmiya, change to the Tōhoku line for Morioka + hotel shuttle. Only the Ōmiya change is self-handled.",{awkward:1,car:1}),
  "karuizawa>kamasaki":L(2.8,1,"shinkansen","Hokuriku Karuizawa→Ōmiya, change to a Yamabiko for Shiroishi-Zaō + inn shuttle. One change, at Ōmiya.",{car:1}),
  "tsuchiyu>matsumoto":L(4.5,2,"shinkansen","Taxi to Fukushima, Tōhoku to Ōmiya, Hokuriku to Nagano, change to the JR 'Shinano' Ltd Exp for Matsumoto + inn shuttle. Two changes: Ōmiya and Nagano.",{awkward:1,car:1}),
  "iizaka>matsumoto":L(4.8,3,"shinkansen","Iizaka tram to Fukushima, Tōhoku to Ōmiya, Hokuriku to Nagano, JR 'Shinano' to Matsumoto + inn shuttle. Three self-handled changes: tram, Ōmiya, Nagano.",{awkward:1,car:1}),
  "akayu>matsumoto":L(5.2,2,"shinkansen","Through 'Tsubasa' from Akayu to Ōmiya (one ride), Hokuriku to Nagano, JR 'Shinano' to Matsumoto + inn shuttle. Changes at Ōmiya and Nagano; ⚠ the Tsubasa's January crossing is the fragile link.",{awkward:1,car:1}),
  "kakunodate>matsumoto":L(5.8,2,"shinkansen","Through 'Komachi' from Kakunodate to Ōmiya (one ride), Hokuriku to Nagano, JR 'Shinano' to Matsumoto + inn shuttle. Two changes (Ōmiya, Nagano); ⚠ the Komachi north of Morioka is January-snow-exposed.",{awkward:1,car:1}),
  "shizukuishi>matsumoto":L(5.3,2,"shinkansen","Hotel shuttle to Morioka, Tōhoku to Ōmiya, Hokuriku to Nagano, JR 'Shinano' to Matsumoto + inn shuttle. Two self-handled changes: Ōmiya and Nagano.",{awkward:1,car:1}),
  "matsumoto>kamasaki":L(4.6,2,"shinkansen","JR 'Shinano' from Matsumoto to Nagano, Hokuriku to Ōmiya, change to a Yamabiko (the only train stopping at Shiroishi-Zaō) + inn shuttle. Two changes: Nagano and Ōmiya.",{awkward:1,car:1}),
  // Within-cluster gaps — Nagano/Jōetsu internal
  "tanigawa>yamadaonsen":L(2.4,1,"shinkansen","Taxi from Tanigawa to Jōmō-Kōgen, Jōetsu Shinkansen to Takasaki, change to Hokuriku 'Asama' for Nagano, then inn car up to Yamada Onsen. ⚠ Winter: the taxi down from Tanigawa and the mountain inn-car leg are the snow-sensitive parts.",{car:1}),
  "tanigawa>matsumoto":L(3.5,2,"shinkansen","Taxi to Jōmō-Kōgen, Jōetsu Shinkansen to Takasaki, 'Asama' to Nagano, change again for the 'Shinano' to Matsumoto + inn shuttle. Two self-changes (Takasaki, Nagano); allow slack at both in January.",{awkward:1,car:1}),
  "echigoyuzawa>yamadaonsen":L(2.8,1,"shinkansen","Inn car down to Echigo-Yuzawa, Jōetsu Shinkansen to Takasaki, change to the Hokuriku 'Asama' for Nagano, then inn car to Yamada Onsen. Single rail change at Takasaki; both car legs are snow-country roads.",{car:1}),
  "yamadaonsen>matsunoyama":L(4.0,3,"shinkansen","Inn car to Nagano, 'Asama' to Takasaki, Jōetsu Shinkansen to Echigo-Yuzawa, JR Jōetsu local to Muikamachi, then Hokuhoku to Matsudai + inn shuttle. Three self-changes ending on the single-track Hokuhoku — ⚠ fragile and slow in deep January snow.",{awkward:1,car:1}),
  "matsunoyama>karuizawa":L(3.0,3,"shinkansen","Inn shuttle to Matsudai, Hokuhoku to Muikamachi, JR Jōetsu local to Echigo-Yuzawa, Jōetsu Shinkansen to Takasaki, then Hokuriku one stop to Karuizawa + taxi. ⚠ the Hokuhoku/local start is the weak link in snow.",{awkward:1,car:1}),
  "matsunoyama>matsumoto":L(5.1,4,"shinkansen","Inn shuttle to Matsudai, Hokuhoku to Muikamachi, JR local to Echigo-Yuzawa, Jōetsu Shinkansen to Takasaki, 'Asama' to Nagano, then 'Shinano' to Matsumoto. Four self-changes across two fragile branches — ⚠ a long, snow-exposed haul; budget generously in January.",{awkward:1,car:1}),
  // Within-cluster gaps — Tōhoku internal
  "tsuchiyu>iizaka":L(1.1,1,"train","Taxi down from Tsuchiyu into Fukushima, then the Iizaka tram out to Iizaka Onsen — two spa towns bracketing the same city. Only the tram change is self-handled; short, but ⚠ the mountain taxi is snow-sensitive.",{car:1}),
  "iizaka>shizukuishi":L(2.8,1,"shinkansen","Iizaka tram back to Fukushima, change to the northbound Tōhoku Shinkansen ('Yamabiko'/'Hayabusa') to Morioka, then the free inn shuttle to Shizukuishi. One self-change at Fukushima.",{car:1}),
  "shizukuishi>kamasaki":L(2.9,1,"shinkansen","Inn shuttle to Morioka, Tōhoku Shinkansen south with a change at Fukushima onto a 'Yamabiko' that stops at Shiroishi-Zaō, then inn shuttle to Kamasaki. Shiroishi-Zaō is Yamabiko-only, hence the Fukushima change.",{car:1}),
  // Nikkō ↔ Nagano/Jōetsu (via Utsunomiya→Ōmiya) and ↔ deep Tōhoku (via Utsunomiya north)
  "tanigawa>nikko":L(2.8,2,"shinkansen","Taxi to Jōmō-Kōgen, Jōetsu Shinkansen through to Ōmiya, change to the Tōhoku Shinkansen for Utsunomiya, then the JR Nikkō Line local up to Nikkō + inn shuttle. ⚠ ends on the hourly Nikkō-Line local — snow-slow.",{awkward:1,car:1}),
  "echigoyuzawa>nikko":L(3.2,2,"shinkansen","Inn car to Echigo-Yuzawa, Jōetsu Shinkansen through to Ōmiya, change to the Tōhoku Shinkansen for Utsunomiya, then JR Nikkō Line local to Nikkō. Two changes (Ōmiya, Utsunomiya); ⚠ the Nikkō-Line finish is the fragile bit in January.",{awkward:1,car:1}),
  "yudanaka>nikko":L(3.8,3,"shinkansen","Inn car to Yudanaka, Nagaden Ltd Exp to Nagano, Hokuriku Shinkansen to Ōmiya, Tōhoku Shinkansen to Utsunomiya, then JR Nikkō Line local to Nikkō. Three self-changes (Nagano, Ōmiya, Utsunomiya) plus the snow-slow Nikkō local — ⚠ a long day.",{awkward:1,car:1}),
  "yamadaonsen>nikko":L(3.3,2,"shinkansen","Inn car down to Nagano, Hokuriku Shinkansen to Ōmiya, change to the Tōhoku Shinkansen for Utsunomiya, then JR Nikkō Line local to Nikkō. Two changes; ⚠ the mountain inn-car and the Nikkō local are the snow-sensitive ends.",{awkward:1,car:1}),
  "matsunoyama>nikko":L(4.3,4,"shinkansen","Inn shuttle to Matsudai, Hokuhoku to Muikamachi, JR local to Echigo-Yuzawa, Jōetsu Shinkansen through to Ōmiya, Tōhoku Shinkansen to Utsunomiya, then Nikkō-Line local to Nikkō. Four changes spanning the Hokuhoku and Nikkō locals — ⚠ the most weather-exposed of the Nikkō links.",{awkward:1,car:1}),
  "karuizawa>nikko":L(2.6,2,"shinkansen","Taxi to Karuizawa, Hokuriku Shinkansen through to Ōmiya, change to the Tōhoku Shinkansen for Utsunomiya, then JR Nikkō Line local to Nikkō. Two changes; shortest of the Nagano-side Nikkō links, but ⚠ the Nikkō local still crawls in snow.",{awkward:1,car:1}),
  "nikko>matsumoto":L(4.4,3,"shinkansen","JR Nikkō Line local to Utsunomiya, Tōhoku Shinkansen to Ōmiya, Hokuriku 'Asama' to Nagano, then 'Shinano' to Matsumoto + inn shuttle. Three self-changes (Utsunomiya, Ōmiya, Nagano) bracketing the snow-slow Nikkō local.",{awkward:1,car:1}),
  "nikko>kakunodate":L(4.6,2,"shinkansen","JR Nikkō Line local to Utsunomiya, a 'Yamabiko' up to Morioka, then change to the 'Komachi' onto the Akita branch for Kakunodate + taxi. The fast Hayabusa/Komachi skip Utsunomiya, so you ride the slower Yamabiko north; ⚠ long and on the fragile single-track Komachi branch in snow. (If no through Morioka Yamabiko lines up, add a Sendai change.)",{awkward:1,car:1}),
  "nikko>shizukuishi":L(3.9,1,"shinkansen","JR Nikkō Line local to Utsunomiya, then a 'Yamabiko' straight through to Morioka + free inn shuttle. One self-change at Utsunomiya if you catch a Morioka-bound Yamabiko (else add a Sendai change); ⚠ the Nikkō local is the snow risk.",{awkward:1,car:1}),
  "nikko>kamasaki":L(2.2,1,"shinkansen","JR Nikkō Line local to Utsunomiya, then a 'Yamabiko' through Fukushima to Shiroishi-Zaō (one train, Yamabiko-only stop) + inn shuttle. Single self-change at Utsunomiya; ⚠ the hourly Nikkō local is the fragile, snow-slow leg.",{awkward:1,car:1}),

  /* ── New Tōhoku inns (Bandai-Atami/Atamiso, Sukagawa/Yoneya, Aizu-Wakamatsu/Higashiyama,
     Kaminoyama/Meigetsuso, Hottoyuda/Yamado) → the Fukushima/Yamagata/Iwate cluster. Researched
     2026-07-09. Kōriyama is the local hub for Bandai-Atami (Ban'etsu-West) & Sukagawa (Tōhoku-Main
     local); Aizu-Wakamatsu is ~65 min west on the Ban'etsu-West; Kaminoyama is on the Yamagata
     'Tsubasa' (~30 min past Akayu); Hottoyuda is off Kitakami on the deep-snow Kitakami-line. x = self-
     handled changes only (a chauffeured last-mile and the FIRST boarding are free — cf. iizaka>akayu). ── */
  "tsuchiyu>aizuwakamatsu":L(2.5,1,"train","Taxi to Fukushima, Tōhoku Shinkansen one stop to Kōriyama, change to the Ban'etsu-West local west across the Aizu basin to Aizu-Wakamatsu + taxi. One change at Kōriyama. ⚠ the Ban'etsu-West run is snow-delay-prone in January.",{car:1}),
  "tsuchiyu>sukagawa":L(1.4,1,"train","Taxi to Fukushima, Shinkansen to Kōriyama, change to the Tōhoku Main Line local down to Sukagawa + inn shuttle. Short and snow-mild.",{car:1}),
  "tsuchiyu>kaminoyama":L(1.5,0,"shinkansen","Taxi to Fukushima, then a direct Yamagata 'Tsubasa' over the pass to Kaminoyama-Onsen (one train) + short taxi. ⚠ the Tsubasa is the winter weak point.",{car:1}),
  "tsuchiyu>hottoyuda":L(3.0,1,"shinkansen","Taxi to Fukushima, Tōhoku Shinkansen north to Kitakami, change to the Kitakami-line local up the Waga valley to Hottoyuda + inn shuttle. One change at Kitakami. ⚠ deep-snow country; the Kitakami-line thins out in January.",{car:1}),
  "iizaka>aizuwakamatsu":L(2.25,2,"train","Iizaka tram to Fukushima, Shinkansen to Kōriyama, change to the Ban'etsu-West local to Aizu-Wakamatsu + taxi. Two changes (Fukushima, Kōriyama). ⚠ tram + Ban'etsu both snow-fragile.",{car:1}),
  "iizaka>sukagawa":L(1.75,1,"train","Iizaka tram to Fukushima, then a Tōhoku Main Line local straight down through Kōriyama to Sukagawa + inn shuttle. One change at Fukushima.",{car:1}),
  "iizaka>kaminoyama":L(1.75,1,"shinkansen","Iizaka tram to Fukushima, change to a 'Tsubasa' over the Yamagata branch to Kaminoyama-Onsen + short taxi. One change at Fukushima. ⚠ the Tsubasa mountain crossing is the winter-fragile leg.",{car:1}),
  "iizaka>hottoyuda":L(3.25,2,"shinkansen","Iizaka tram to Fukushima, Shinkansen north to Kitakami, change to the Kitakami-line local to Hottoyuda + inn shuttle. Two changes. ⚠ deep-snow final branch.",{car:1}),
  "bandaiatami>aizuwakamatsu":L(1.25,0,"train","Both inns are on the Ban'etsu-West Line — one local train west from Bandai-Atami through Inawashiro to Aizu-Wakamatsu (no Kōriyama backtrack) + taxi. ⚠ January snow can slow the Ban'etsu run.",{car:1}),
  "bandaiatami>sukagawa":L(1.0,1,"train","Shuttle to Bandai-Atami, Ban'etsu-West local into Kōriyama, change to the Tōhoku Main local down to Sukagawa + inn shuttle. One change at Kōriyama.",{car:1}),
  "bandaiatami>kaminoyama":L(2.0,1,"shinkansen","Ban'etsu-West local into Kōriyama, change onto a Kōriyama-stopping 'Tsubasa' over the Yamagata branch to Kaminoyama-Onsen + short taxi. One change. ⚠ two fragile branches (Ban'etsu + Tsubasa).",{car:1}),
  "bandaiatami>kakunodate":L(4.3,2,"shinkansen","Ban'etsu-West into Kōriyama, 'Yamabiko' north to Morioka, change to a 'Komachi' out the Akita branch to Kakunodate + taxi. Two changes. ⚠ snow-exposed on the Komachi branch.",{car:1}),
  "bandaiatami>hottoyuda":L(3.4,2,"shinkansen","Ban'etsu-West into Kōriyama, Shinkansen north to Kitakami, change to the Kitakami-line local to Hottoyuda + inn shuttle. Two changes. ⚠ deep-snow branch territory.",{car:1}),
  "bandaiatami>shizukuishi":L(3,1,"shinkansen","Ban'etsu-West into Kōriyama, then a 'Yamabiko' straight to Morioka + hotel shuttle. One change at Kōriyama.",{car:1}),
  "aizuwakamatsu>sukagawa":L(2.0,1,"train","Taxi to Aizu-Wakamatsu, Ban'etsu-West local east to Kōriyama, change to the Tōhoku Main local down to Sukagawa + inn shuttle. One change at Kōriyama. ⚠ the long Ban'etsu run is the winter-fragile leg.",{car:1}),
  "aizuwakamatsu>akayu":L(2.75,1,"shinkansen","Taxi to Aizu-Wakamatsu, Ban'etsu-West into Kōriyama, change to a 'Tsubasa' up the Yamagata branch to Akayu + short taxi. One change. ⚠ Ban'etsu then Tsubasa — heavy winter exposure.",{car:1}),
  "aizuwakamatsu>kaminoyama":L(3.0,1,"shinkansen","Taxi to Aizu-Wakamatsu, Ban'etsu-West into Kōriyama, 'Tsubasa' over the Yamagata branch past Akayu to Kaminoyama-Onsen + short taxi. One change. ⚠ both rail legs are snow-fragile branches.",{car:1}),
  "aizuwakamatsu>kakunodate":L(5.4,2,"shinkansen","Taxi to Aizu-Wakamatsu, Ban'etsu-West into Kōriyama, 'Yamabiko' north to Morioka, change to a 'Komachi' to Kakunodate + taxi. Two changes. ⚠ crosses the Ban'etsu and Komachi branches — the worst winter chain here.",{awkward:1,car:1}),
  "aizuwakamatsu>hottoyuda":L(4.5,2,"shinkansen","Taxi to Aizu-Wakamatsu, Ban'etsu-West into Kōriyama, Shinkansen to Kitakami, change to the Kitakami-line local to Hottoyuda + inn shuttle. Two changes. ⚠ a full transit day into deep snow.",{awkward:1,car:1}),
  "aizuwakamatsu>shizukuishi":L(4.1,1,"shinkansen","Taxi to Aizu-Wakamatsu, Ban'etsu-West into Kōriyama, one 'Yamabiko' all the way to Morioka + hotel shuttle. One change; ⚠ the Aizu Ban'etsu opening leg keeps it snow-fragile.",{awkward:1,car:1}),
  "aizuwakamatsu>kamasaki":L(2.5,1,"shinkansen","Taxi to Aizu-Wakamatsu, Ban'etsu-West into Kōriyama, 'Yamabiko' north to the Yamabiko-only Shiroishi-Zaō stop + inn shuttle. One change. ⚠ the Aizu Ban'etsu leg is the snow-fragile part.",{car:1}),
  "sukagawa>akayu":L(1.75,1,"shinkansen","Inn shuttle to Sukagawa, Tōhoku Main local up to Kōriyama, change to a 'Tsubasa' over the Yamagata branch to Akayu + short taxi. One change at Kōriyama. ⚠ the Tsubasa crossing is winter-fragile.",{car:1}),
  "sukagawa>kaminoyama":L(2.0,1,"shinkansen","Inn shuttle to Sukagawa, local up to Kōriyama, 'Tsubasa' over the Yamagata branch past Akayu to Kaminoyama-Onsen + short taxi. One change. ⚠ Tsubasa is the snow-fragile leg.",{car:1}),
  "sukagawa>kakunodate":L(4.4,2,"shinkansen","Local up to Kōriyama, 'Yamabiko' north to Morioka, change to a 'Komachi' to Kakunodate + taxi. Two changes. ⚠ the Komachi Akita branch is winter-fragile.",{car:1}),
  "sukagawa>hottoyuda":L(3.0,2,"shinkansen","Local to Kōriyama, Shinkansen to Kitakami, change to the Kitakami-line local to Hottoyuda + inn shuttle. Two changes into deep-snow branch country.",{car:1}),
  "sukagawa>shizukuishi":L(3.1,1,"shinkansen","Inn shuttle to Sukagawa, local to Kōriyama, one 'Yamabiko' straight to Morioka + hotel shuttle. One change on the snow-reliable Tōhoku trunk.",{car:1}),
  "sukagawa>kamasaki":L(1.75,1,"shinkansen","Local to Kōriyama, 'Yamabiko' north to the Yamabiko-only Shiroishi-Zaō stop + inn shuttle. One change; low winter risk on the trunk.",{car:1}),
  "akayu>kaminoyama":L(0.75,0,"shinkansen","Short taxi to Akayu, one 'Tsubasa' two stops up to Kaminoyama-Onsen + short taxi — no change. ⚠ the fragile Yamagata branch, so a snow hold hits it directly.",{car:1}),
  "akayu>hottoyuda":L(3.75,2,"shinkansen","Taxi to Akayu, 'Tsubasa' down to Fukushima, 'Yamabiko' north to Kitakami, change to the Kitakami-line local to Hottoyuda + inn shuttle. Two changes. ⚠ both the Tsubasa and Kitakami-line branches are snow-fragile.",{awkward:1,car:1}),
  "kaminoyama>kakunodate":L(5,2,"shinkansen","Taxi to Kaminoyama-Onsen, 'Tsubasa' down to Fukushima, 'Yamabiko' north to Morioka, change to a 'Komachi' to Kakunodate + taxi. Two changes. ⚠ a double-branch traverse (Tsubasa + Komachi).",{awkward:1,car:1}),
  "kaminoyama>hottoyuda":L(4.1,2,"shinkansen","Taxi to Kaminoyama-Onsen, 'Tsubasa' down to Fukushima, 'Yamabiko' north to Kitakami, Kitakami-line local to Hottoyuda + inn shuttle. Two changes; ⚠ two fragile branches + a deep-snow finish.",{awkward:1,car:1}),
  "kaminoyama>shizukuishi":L(3.7,1,"shinkansen","Taxi to Kaminoyama-Onsen, 'Tsubasa' down to Fukushima, then one 'Yamabiko' straight to Morioka + hotel shuttle. One change; ⚠ the Tsubasa backtrack over the pass is the snow-fragile leg.",{car:1}),
  "kaminoyama>kamasaki":L(2.1,1,"shinkansen","Taxi to Kaminoyama-Onsen, 'Tsubasa' down to Fukushima, change to a northbound 'Yamabiko' one stop to Shiroishi-Zaō + inn shuttle. One change; ⚠ the Tsubasa pass leg is the fragile part.",{car:1}),
  "kakunodate>hottoyuda":L(2.8,2,"shinkansen","Taxi to Kakunodate, 'Komachi' in to Morioka, Shinkansen one stop to Kitakami, change to the Kitakami-line local to Hottoyuda + inn shuttle. Two changes; ⚠ both branches winter-fragile.",{car:1}),
  "hottoyuda>shizukuishi":L(1.8,1,"train","Inn shuttle to Hottoyuda, Kitakami-line local down to Kitakami, change to the Shinkansen one stop up to Morioka + hotel shuttle. One change at Kitakami. ⚠ the Kitakami-line is the deep-snow fragile leg.",{car:1}),
  "hottoyuda>kamasaki":L(2.6,1,"train","Inn shuttle to Hottoyuda, Kitakami-line local to Kitakami, southbound 'Yamabiko' to the Yamabiko-only Shiroishi-Zaō stop + inn shuttle. One change; ⚠ the Kitakami-line is the fragile leg.",{car:1}),

  /* ── New Tōhoku inns → the Nagano/Jōetsu/Nikkō cluster + Kanazawa (via Ōmiya). Researched 2026-07-09.
     Cross-cluster: Tōhoku node ↔ Hokuriku/Jōetsu node meet only at ŌMIYA (Nikkō→Fukushima-cluster stays
     on the Tōhoku line via Utsunomiya — no Ōmiya backtrack). x = self-handled rail rides − 1 (through
     Tsubasa reaches Ōmiya as one ride). Every one is long/multi-change → nearly all awkward. ── */
  "tanigawa>bandaiatami":L(2.9,2,"shinkansen","Taxi to Jōmō-Kōgen, Jōetsu Shinkansen→Ōmiya, cross to a Tōhoku 'Yamabiko'→Kōriyama, then the Ban'etsu-West local→Bandai-Atami + shuttle. Changes at Ōmiya and Kōriyama.",{car:1}),
  "tanigawa>aizuwakamatsu":L(4.2,2,"train","Taxi to Jōmō-Kōgen, Jōetsu Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then the Ban'etsu-West line west→Aizu-Wakamatsu + taxi. ⚠ Jōetsu snow up front, the Ban'etsu-West across the Aizu basin at the end.",{awkward:1,car:1}),
  "tanigawa>sukagawa":L(2.9,2,"shinkansen","Taxi to Jōmō-Kōgen, Jōetsu Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then a Tōhoku Main local one hop→Sukagawa + shuttle. Changes at Ōmiya and Kōriyama.",{car:1}),
  "tanigawa>kaminoyama":L(3.7,1,"shinkansen","Taxi to Jōmō-Kōgen, Jōetsu Shinkansen→Ōmiya, then the through Yamagata 'Tsubasa'→Kaminoyama-Onsen (one ride) + short taxi. Single change at Ōmiya. ⚠ the Itaya-pass Tsubasa is winter-fragile.",{awkward:1,car:1}),
  "tanigawa>hottoyuda":L(5.1,2,"train","Taxi to Jōmō-Kōgen, Jōetsu Shinkansen→Ōmiya, 'Hayabusa'→Kitakami, then the Kitakami-line local→Hottoyuda + shuttle. ⚠ deep-snow branch line — buffer the Kitakami connection.",{awkward:1,car:1}),
  "echigoyuzawa>bandaiatami":L(3.1,2,"shinkansen","Inn car to Echigo-Yuzawa, Jōetsu Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then the Ban'etsu-West local→Bandai-Atami + shuttle. Changes at Ōmiya and Kōriyama.",{awkward:1,car:1}),
  "echigoyuzawa>aizuwakamatsu":L(4.7,2,"train","Inn car to Echigo-Yuzawa, Jōetsu Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then the Ban'etsu-West line→Aizu-Wakamatsu + taxi. ⚠ two snow-country rail legs bracketing the Ōmiya change.",{awkward:1,car:1}),
  "echigoyuzawa>sukagawa":L(3.1,2,"shinkansen","Inn car to Echigo-Yuzawa, Jōetsu Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then a Tōhoku local→Sukagawa + shuttle. Heavy Jōetsu snow, reliable Tōhoku spine after Ōmiya.",{awkward:1,car:1}),
  "echigoyuzawa>kaminoyama":L(4.1,1,"shinkansen","Inn car to Echigo-Yuzawa, Jōetsu Shinkansen→Ōmiya, then the through 'Tsubasa'→Kaminoyama-Onsen + short taxi. Single change at Ōmiya. ⚠ the Itaya-pass Tsubasa is the January weak link.",{awkward:1,car:1}),
  "echigoyuzawa>hottoyuda":L(5.5,2,"train","Inn car to Echigo-Yuzawa, Jōetsu Shinkansen→Ōmiya, 'Hayabusa'→Kitakami, then the Kitakami-line local→Hottoyuda + shuttle. ⚠ long, ending on a deep-snow single-track branch.",{awkward:1,car:1}),
  "yudanaka>bandaiatami":L(4.4,3,"shinkansen","Nagaden Ltd Exp to Nagano, Hokuriku Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then the Ban'etsu-West local→Bandai-Atami + shuttle. Changes at Nagano, Ōmiya, Kōriyama.",{awkward:1,car:1}),
  "yudanaka>aizuwakamatsu":L(5.3,3,"train","Nagaden to Nagano, Hokuriku Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then the Ban'etsu-West line→Aizu-Wakamatsu + taxi. ⚠ the Nagaden mountain run and the Ban'etsu-West are both January snow legs.",{awkward:1,car:1}),
  "yudanaka>sukagawa":L(4.3,3,"shinkansen","Nagaden to Nagano, Hokuriku Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then a Tōhoku local→Sukagawa + shuttle. Changes at Nagano, Ōmiya, Kōriyama.",{awkward:1,car:1}),
  "yudanaka>kaminoyama":L(4.7,2,"shinkansen","Nagaden to Nagano, Hokuriku Shinkansen→Ōmiya, then the through 'Tsubasa'→Kaminoyama-Onsen + short taxi. Changes at Nagano and Ōmiya. ⚠ Nagaden + Itaya-pass Tsubasa both snow-fragile.",{awkward:1,car:1}),
  "yudanaka>hottoyuda":L(6.1,3,"train","Nagaden to Nagano, Hokuriku Shinkansen→Ōmiya, 'Hayabusa'→Kitakami, then the Kitakami-line local→Hottoyuda + shuttle. ⚠ mountain Nagaden at one end, deep-snow Kitakami branch at the other.",{awkward:1,car:1}),
  "yamadaonsen>bandaiatami":L(4.3,2,"shinkansen","Inn car to Nagano, Hokuriku Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then the Ban'etsu-West local→Bandai-Atami + shuttle. Changes at Ōmiya and Kōriyama.",{awkward:1,car:1}),
  "yamadaonsen>aizuwakamatsu":L(5.2,2,"train","Inn car to Nagano, Hokuriku Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then the Ban'etsu-West line→Aizu-Wakamatsu + taxi. ⚠ the Ban'etsu-West crosses snow country.",{awkward:1,car:1}),
  "yamadaonsen>sukagawa":L(4.2,2,"shinkansen","Inn car to Nagano, Hokuriku Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then a Tōhoku local→Sukagawa + shuttle. Clean Shinkansen spine either side of Ōmiya.",{awkward:1,car:1}),
  "yamadaonsen>kaminoyama":L(4.5,1,"shinkansen","Inn car to Nagano, Hokuriku Shinkansen→Ōmiya, then the through 'Tsubasa'→Kaminoyama-Onsen + short taxi. Single change at Ōmiya. ⚠ the Itaya-pass Tsubasa is the fragile stretch.",{awkward:1,car:1}),
  "yamadaonsen>hottoyuda":L(5.6,2,"train","Inn car to Nagano, Hokuriku Shinkansen→Ōmiya, 'Hayabusa'→Kitakami, then the Kitakami-line local→Hottoyuda + shuttle. ⚠ the deep-snow Kitakami branch is the January weak link.",{awkward:1,car:1}),
  "matsunoyama>bandaiatami":L(4.5,4,"train","Inn shuttle to Matsudai, Hokuhoku→Muikamachi, JR local→Echigo-Yuzawa, Jōetsu Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then the Ban'etsu-West local→Bandai-Atami + shuttle. ⚠ the sparse Hokuhoku is the fragile snow start.",{awkward:1,car:1}),
  "matsunoyama>aizuwakamatsu":L(5.8,4,"train","Inn shuttle to Matsudai, Hokuhoku→Muikamachi, JR local→Echigo-Yuzawa, Jōetsu Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then the Ban'etsu-West line→Aizu-Wakamatsu + taxi. ⚠ two snow-fragile branches (Hokuhoku, Ban'etsu-West).",{awkward:1,car:1}),
  "matsunoyama>sukagawa":L(4.5,4,"train","Inn shuttle to Matsudai, Hokuhoku→Muikamachi, JR local→Echigo-Yuzawa, Jōetsu Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then a Tōhoku local→Sukagawa + shuttle. ⚠ the Hokuhoku local up front is the January choke point.",{awkward:1,car:1}),
  "matsunoyama>kaminoyama":L(5.2,3,"train","Inn shuttle to Matsudai, Hokuhoku→Muikamachi, JR local→Echigo-Yuzawa, Jōetsu Shinkansen→Ōmiya, then the through 'Tsubasa'→Kaminoyama-Onsen + short taxi. ⚠ Hokuhoku start and Itaya-pass Tsubasa — two fragile links.",{awkward:1,car:1}),
  "matsunoyama>hottoyuda":L(6.7,4,"train","Inn shuttle to Matsudai, Hokuhoku→Muikamachi, JR local→Echigo-Yuzawa, Jōetsu Shinkansen→Ōmiya, 'Hayabusa'→Kitakami, then the Kitakami-line local→Hottoyuda + shuttle. ⚠ the single longest hop — Hokuhoku at one end, deep-snow Kitakami branch at the other.",{awkward:1,car:1}),
  "karuizawa>bandaiatami":L(3.2,2,"shinkansen","Taxi to Karuizawa, Hokuriku Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then the Ban'etsu-West local→Bandai-Atami + shuttle. The easiest Nagano-side crossing — changes at Ōmiya and Kōriyama.",{car:1}),
  "karuizawa>aizuwakamatsu":L(4.1,2,"train","Taxi to Karuizawa, Hokuriku Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then the Ban'etsu-West line→Aizu-Wakamatsu + taxi. ⚠ the Ban'etsu-West crosses January snow country.",{awkward:1,car:1}),
  "karuizawa>sukagawa":L(3.1,2,"shinkansen","Taxi to Karuizawa, Hokuriku Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then a Tōhoku local→Sukagawa + shuttle. Snow-reliable Shinkansen either side of Ōmiya.",{car:1}),
  "karuizawa>kaminoyama":L(3.5,1,"shinkansen","Taxi to Karuizawa, Hokuriku Shinkansen→Ōmiya, then the through 'Tsubasa'→Kaminoyama-Onsen + short taxi. Single change at Ōmiya. ⚠ the Itaya-pass Tsubasa is the fragile January leg.",{awkward:1,car:1}),
  "karuizawa>hottoyuda":L(4.9,2,"train","Taxi to Karuizawa, Hokuriku Shinkansen→Ōmiya, 'Hayabusa'→Kitakami, then the Kitakami-line local→Hottoyuda + shuttle. ⚠ ends on a deep-snow single-track branch.",{awkward:1,car:1}),
  "nikko>bandaiatami":L(2.8,2,"shinkansen","Inn shuttle to JR Nikkō, JR Nikkō Line local→Utsunomiya, 'Yamabiko'→Kōriyama (Utsunomiya sits on the Tōhoku line — no Ōmiya backtrack), then the Ban'etsu-West local→Bandai-Atami + shuttle. ⚠ the hourly Nikkō local is snow-slow.",{car:1}),
  "nikko>aizuwakamatsu":L(3.8,2,"train","Inn shuttle to JR Nikkō, JR Nikkō Line local→Utsunomiya, 'Yamabiko'→Kōriyama, then the Ban'etsu-West line→Aizu-Wakamatsu + taxi. Tōhoku-line routing, no Ōmiya detour. ⚠ Nikkō local + Ban'etsu-West.",{awkward:1,car:1}),
  "nikko>sukagawa":L(2.8,2,"shinkansen","Inn shuttle to JR Nikkō, JR Nikkō Line local→Utsunomiya, 'Yamabiko'→Kōriyama, then a Tōhoku local→Sukagawa + shuttle. Straight up the Tōhoku line. ⚠ the Nikkō local is the January weak link.",{car:1}),
  "nikko>kaminoyama":L(3.1,1,"shinkansen","Inn shuttle to JR Nikkō, JR Nikkō Line local→Utsunomiya (~45 min), then board the through 'Tsubasa' at Utsunomiya→Kaminoyama-Onsen (~1h55 — no Ōmiya backtrack; the coupled train calls at Utsunomiya) + short taxi. One change. ⚠ Nikkō local + Itaya-pass Tsubasa, two snow-fragile legs.",{awkward:1,car:1}),
  "nikko>hottoyuda":L(4.1,2,"train","Inn shuttle to JR Nikkō, JR Nikkō Line local→Utsunomiya, 'Yamabiko' straight to Kitakami (~2h09 — Kitakami is a regular Yamabiko stop; no Ōmiya backtrack needed), then the Kitakami-line local→Hotto-Yuda (~44 min, ~8/day) + shuttle. ⚠ Nikkō local and Kitakami branch both deep-snow.",{awkward:1,car:1}),
  "bandaiatami>matsumoto":L(5.0,3,"shinkansen","Ban'etsu-West Bandai-Atami→Kōriyama, 'Yamabiko'→Ōmiya, cross to the Hokuriku Shinkansen→Nagano, then the JR Ltd Exp 'Shinano'→Matsumoto + inn shuttle. Changes at Kōriyama, Ōmiya, Nagano.",{awkward:1,car:1}),
  "aizuwakamatsu>matsumoto":L(5.9,3,"train","Ban'etsu-West Aizu-Wakamatsu→Kōriyama, 'Yamabiko'→Ōmiya, Hokuriku Shinkansen→Nagano, then 'Shinano'→Matsumoto + inn shuttle. ⚠ the Ban'etsu-West opener runs deep snow country.",{awkward:1,car:1}),
  "sukagawa>matsumoto":L(4.9,3,"shinkansen","Tōhoku local Sukagawa→Kōriyama, 'Yamabiko'→Ōmiya, Hokuriku Shinkansen→Nagano, then 'Shinano'→Matsumoto + inn shuttle. Changes at Kōriyama, Ōmiya, Nagano.",{awkward:1,car:1}),
  "kaminoyama>matsumoto":L(5.3,2,"shinkansen","Through 'Tsubasa' Kaminoyama-Onsen→Ōmiya (one ride), cross to the Hokuriku Shinkansen→Nagano, then 'Shinano'→Matsumoto + inn shuttle. Changes at Ōmiya and Nagano. ⚠ the Itaya-pass Tsubasa is the risk.",{awkward:1,car:1}),
  "hottoyuda>matsumoto":L(6.8,3,"train","Kitakami-line local Hottoyuda→Kitakami, 'Hayabusa'→Ōmiya, Hokuriku Shinkansen→Nagano, then 'Shinano'→Matsumoto + inn shuttle. ⚠ the longest Matsumoto link — deep-snow Kitakami branch at the start.",{awkward:1,car:1}),
  /* Kiso Valley (Zenagi, Nagiso) — added 2026-07-20 with the KI-NRT Zenagi review (post #804).
     Keystone: the through-Shinano Nagiso→Nagano (~2h00, no change) makes every eastern leg
     matsumoto>X + ~0.7h at identical change counts. Only ~4 Shinano/day stop at Nagiso —
     the resilient fallback is the free inn car to Nakatsugawa (all Shinano stop). */
  "kiso>tokyo":L(3.2,1,"shinkansen","Inn car to Nagiso (~10 min), JR Ltd Exp 'Shinano'→Nagoya (~60 min), then Tōkaidō Shinkansen 'Nozomi'→Tokyo (~1h40). One change at Nagoya. ⚠ Only ~4 Shinano/day stop at Nagiso — otherwise ~25–30-min inn car to Nakatsugawa, where every Shinano stops (~50 min to Nagoya, same total).",{car:1}),
  "kiso>kanazawa":L(3.7,1,"shinkansen","Inn car to Nagiso (~10 min), through 'Shinano' Nagiso→Nagano (~2h00, one seat past Matsumoto), change to Hokuriku Shinkansen 'Kagayaki'/'Hakutaka'→Kanazawa (~65–70 min). One change at Nagano — beats the Nagoya→'Shirasagi'→Tsuruga alternative (~4h, 2 changes). Sparse Nagiso stops: Nakatsugawa fallback adds ~15 min.",{car:1}),
  "kiso>matsumoto":L(2.0,0,"train","Inn car to Nagiso (~10 min), 'Shinano'→Matsumoto (~65 min up the Kiso valley), then Myōjinkan's shuttle (~35–45 min, reserve). No rail change — but ⚠ only ~4 Shinano/day stop at Nagiso; otherwise ~25–30-min car to Nakatsugawa (~80-min ride, same total).",{car:1}),
  "kiso>karuizawa":L(3.0,1,"train","Inn car to Nagiso, through 'Shinano'→Nagano (~2h00), change to Hokuriku Shinkansen 'Asama'→Karuizawa (~30 min). One change at Nagano.",{car:1}),
  "kiso>yudanaka":L(3.4,1,"train","Inn car to Nagiso, through 'Shinano'→Nagano (~2h00), change to the Nagaden local→Yudanaka (~45 min incl. the ~7-min inn hop). One change at Nagano.",{car:1}),
  "kiso>yamadaonsen":L(3.1,0,"train","Inn car to Nagiso, through 'Shinano'→Nagano (~2h00), then the inn's arranged car up to Yamada Onsen (~30–45 min). One station interchange at Nagano, chauffeured at both ends.",{car:1}),
  "kiso>tanigawa":L(4.2,2,"shinkansen","Inn car to Nagiso, through 'Shinano'→Nagano (~2h00), 'Asama'→Takasaki (~53 min), change to the Jōetsu Shinkansen→Jōmō-Kōgen (~15 min) + taxi to the inn. Two changes (Nagano, Takasaki); allow slack at both in January.",{awkward:1,car:1}),
  "kiso>echigoyuzawa":L(4.5,2,"shinkansen","Inn car to Nagiso, through 'Shinano'→Nagano (~2h00), 'Asama'→Takasaki (~53 min), change to the Jōetsu Shinkansen→Echigo-Yuzawa (~36 min), then the ~30-min inn car. No shortcut — Nagano→Echigo-Yuzawa always detours south to Takasaki.",{awkward:1,car:1}),
  "kiso>matsunoyama":L(5.8,4,"shinkansen","Inn car to Nagiso, through 'Shinano'→Nagano (~2h00), 'Asama'→Takasaki, Jōetsu Shinkansen→Echigo-Yuzawa, JR local→Muikamachi, Hokuhoku line→Matsudai + inn shuttle. Four self-changes across two fragile branches — ⚠ a long, snow-exposed haul; budget generously in January.",{awkward:1,car:1}),
  "kiso>nikko":L(5.1,3,"shinkansen","Inn car to Nagiso, through 'Shinano'→Nagano (~2h00), Hokuriku Shinkansen→Ōmiya, Tōhoku 'Yamabiko'→Utsunomiya, then the JR Nikkō Line local (~45 min). Three self-changes (Nagano, Ōmiya, Utsunomiya) ending on the snow-slow Nikkō local.",{awkward:1,car:1}),
  "kiso>tsuchiyu":L(5.2,2,"shinkansen","Inn car to Nagiso, through 'Shinano'→Nagano (~2h00), Hokuriku Shinkansen→Ōmiya, cross to a Tōhoku 'Yamabiko'→Fukushima, then the ~25-min taxi up to Tsuchiyu. Two changes: Nagano and Ōmiya.",{awkward:1,car:1}),
  "kiso>iizaka":L(5.5,3,"shinkansen","Inn car to Nagiso, through 'Shinano'→Nagano (~2h00), Hokuriku Shinkansen→Ōmiya, Tōhoku 'Yamabiko'→Fukushima, then the Iizaka tram (~23 min). Three self-handled changes: Nagano, Ōmiya, the tram.",{awkward:1,car:1}),
  "kiso>bandaiatami":L(5.7,3,"shinkansen","Inn car to Nagiso, through 'Shinano'→Nagano (~2h00), Hokuriku Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then the Ban'etsu-West local→Bandai-Atami (~15 min). Changes at Nagano, Ōmiya, Kōriyama.",{awkward:1,car:1}),
  "kiso>aizuwakamatsu":L(6.6,3,"train","Inn car to Nagiso, through 'Shinano'→Nagano (~2h00), Hokuriku Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then the Ban'etsu-West→Aizu-Wakamatsu (~65 min) + taxi. ⚠ the Ban'etsu-West closer runs deep snow country.",{awkward:1,car:1}),
  "kiso>sukagawa":L(5.6,3,"shinkansen","Inn car to Nagiso, through 'Shinano'→Nagano (~2h00), Hokuriku Shinkansen→Ōmiya, 'Yamabiko'→Kōriyama, then the Tōhoku local→Sukagawa (~10 min). Changes at Nagano, Ōmiya, Kōriyama.",{awkward:1,car:1}),
  "kiso>akayu":L(5.9,2,"shinkansen","Inn car to Nagiso, through 'Shinano'→Nagano (~2h00), Hokuriku Shinkansen→Ōmiya, cross to a through 'Tsubasa'→Akayu (~52 min past Fukushima, one ride). Changes at Nagano and Ōmiya; ⚠ the Tsubasa's Itaya-pass January crossing is the fragile link.",{awkward:1,car:1}),
  "kiso>kaminoyama":L(6.0,2,"shinkansen","Inn car to Nagiso, through 'Shinano'→Nagano (~2h00), Hokuriku Shinkansen→Ōmiya, through 'Tsubasa'→Kaminoyama-Onsen (one ride) + taxi. Changes at Nagano and Ōmiya. ⚠ the Itaya-pass Tsubasa is the risk.",{awkward:1,car:1}),
  "kiso>kakunodate":L(6.5,2,"shinkansen","Inn car to Nagiso, through 'Shinano'→Nagano (~2h00), Hokuriku Shinkansen→Ōmiya, through 'Komachi'→Kakunodate (one ride via Sendai/Morioka) + 12-min taxi. Two changes (Nagano, Ōmiya); ⚠ the Komachi north of Morioka is January-snow-exposed.",{awkward:1,car:1}),
  "kiso>hottoyuda":L(7.5,3,"train","Inn car to Nagiso, through 'Shinano'→Nagano (~2h00), Hokuriku Shinkansen→Ōmiya, 'Hayabusa'/'Yamabiko'→Kitakami, then the Kitakami-line local→Hottoyuda + shuttle. ⚠ the longest link from the valley — deep-snow Kitakami branch at the finish.",{awkward:1,car:1}),
  "kiso>shizukuishi":L(6.0,2,"shinkansen","Inn car to Nagiso, through 'Shinano'→Nagano (~2h00), Hokuriku Shinkansen→Ōmiya, Tōhoku 'Hayabusa'/'Komachi'→Morioka, then the hotel shuttle. Two self-handled changes: Nagano and Ōmiya.",{awkward:1,car:1}),
  "kiso>kamasaki":L(5.3,2,"shinkansen","Inn car to Nagiso, through 'Shinano'→Nagano (~2h00), Hokuriku Shinkansen→Ōmiya, change to a 'Yamabiko' (the only train stopping at Shiroishi-Zaō) + ~15–20-min inn shuttle. Two changes: Nagano and Ōmiya.",{awkward:1,car:1}),
  "kiso>kyoto":L(2.1,1,"shinkansen","Inn car to Nagiso (~10 min), JR Ltd Exp 'Shinano'→Nagoya (~60 min), then Tōkaidō Shinkansen 'Nozomi'→Kyoto (~35 min). One change at Nagoya — the Kiso Valley sits on the natural pivot west. Sparse Nagiso stops: Nakatsugawa fallback, same total.",{car:1}),
  "kanazawa>bandaiatami":L(3.9,2,"shinkansen","Hokuriku Shinkansen 'Kagayaki' Kanazawa→Ōmiya (~2h, avoiding central Tokyo), cross to a 'Yamabiko'→Kōriyama, then the Ban'etsu-West local→Bandai-Atami + shuttle. Ōmiya + Kōriyama changes.",{awkward:1,car:1}),
  "kanazawa>aizuwakamatsu":L(4.8,2,"train","Hokuriku Shinkansen Kanazawa→Ōmiya, cross to a 'Yamabiko'→Kōriyama, then the Ban'etsu-West line→Aizu-Wakamatsu + taxi. ⚠ the Ban'etsu-West crosses snow country.",{awkward:1,car:1}),
  "kanazawa>sukagawa":L(3.7,2,"shinkansen","Hokuriku Shinkansen Kanazawa→Ōmiya, cross to a 'Yamabiko'→Kōriyama, then a Tōhoku local→Sukagawa + shuttle. Reliable Shinkansen the whole way to the branch.",{awkward:1,car:1}),
  "kanazawa>kaminoyama":L(4.6,1,"shinkansen","Hokuriku Shinkansen Kanazawa→Ōmiya, then the through 'Tsubasa'→Kaminoyama-Onsen (one ride from Ōmiya) + short taxi. Single change at Ōmiya. ⚠ the Itaya-pass Tsubasa is the fragile leg.",{awkward:1,car:1}),
  "kanazawa>hottoyuda":L(6.0,2,"train","Hokuriku Shinkansen Kanazawa→Ōmiya, cross to a 'Hayabusa'→Kitakami, then the Kitakami-line local→Hottoyuda + shuttle. ⚠ long, ending on a deep-snow single-track branch.",{awkward:1,car:1}),

  /* ── Central (Izu / Hakone / Fuji-east) intra-region cluster — researched 2026-07-09. These inns share
     the Tōkaidō trunk (Atami/Mishima/Odawara ~10–20 min apart); the Izukyū branch (Izu-Kōgen/Shimoda)
     joins it only at Atami, and Shuzenji (Izu/Yugashima) hangs off Mishima on the Sunzu line. The three
     self-changes — Sunzu@Mishima, Izukyū@Atami, Tozan@Odawara — drive the transfer counts; last-miles are
     chauffeured. All low/coastal = snow-mild in January (unlike the north). ── */
  "atami>izu":L(1.4,1,"train","Sekaie shuttle to Atami, one Kodama stop to Mishima, then self-change onto the Izuhakone Sunzu line down to Shuzenji + taxi. Low, coastal Izu — snow-mild in January.",{car:1}),
  "atami>izukogen":L(1.3,0,"train","Straight down the Izukyū line from Atami to Izu-Kōgen (no change — Izukyū boards at Atami) + inn shuttle. Sea-level east Izu coast, snow-free.",{car:1}),
  "atami>shimoda":L(1.6,0,"train","One-seat Izukyū ride from Atami to the line's terminus at Izukyū-Shimoda + shuttle. Balmy southern Izu tip, no snow.",{car:1}),
  "atami>yugashima":L(1.8,1,"train","Kodama hop Atami→Mishima, self-change to the Sunzu line to Shuzenji, then the Ochiairo/Arcana inn shuttle up the valley. Shuzenji valley is snow-mild.",{car:1}),
  "atami>hakone":L(1.3,1,"train","Kodama/Tōkaidō Atami→Odawara, self-change onto the Hakone Tozan railway climbing to Kōwakudani. Hakone gets occasional dustings but the railway runs; mostly snow-mild.",{car:1}),
  "atami>oyama":L(0.9,0,"train","One Kodama stop Atami→Mishima, then the Subashiri hotel car up Fuji's Gotemba flank (car-only access). East Fuji foothills sit low enough to stay largely snow-mild.",{car:1}),
  "izu>izukogen":L(2.4,2,"train","Taxi to Shuzenji, Sunzu line to Mishima with a self-change to the Tōkaidō, one stop to Atami, then a second self-change onto the Izukyū to Izu-Kōgen. All low Izu — snow-mild.",{car:1}),
  "izu>shimoda":L(2.6,2,"train","Sunzu back to Mishima (self-change), Tōkaidō to Atami, then a second self-change onto the Izukyū the length of the peninsula to Shimoda. Coastal Izu, no snow.",{car:1}),
  "izu>yugashima":L(0.5,0,"car","Both inns sit in the same Shuzenji valley — a direct inn-to-inn taxi, no trains. Snow-mild river gorge.",{car:1}),
  "izu>hakone":L(1.8,2,"train","Sunzu to Mishima (self-change to Tōkaidō), short trunk hop to Odawara, second self-change onto the Tozan railway to Kōwakudani. Low-elevation, snow-mild.",{car:1}),
  "izu>oyama":L(1.4,1,"train","Sunzu line to Mishima, self-change, then the Subashiri hotel car around to Fuji's east flank. Valley-to-foothill, snow-mild.",{car:1}),
  "izukogen>shimoda":L(0.7,0,"train","Straight down the Izukyū line, Izu-Kōgen to the Shimoda terminus + shuttle — no change. Warm southern coast, snow-free.",{car:1}),
  "izukogen>yugashima":L(2.3,2,"train","Izukyū up to Atami (self-change to Tōkaidō), one stop to Mishima, second self-change onto the Sunzu line to Shuzenji + inn shuttle. Crosses the peninsula's base; snow-mild.",{car:1}),
  "izukogen>hakone":L(2.3,2,"train","Izukyū to Atami (self-change), Tōkaidō to Odawara, second self-change onto the Tozan railway to Kōwakudani. East Izu coast up to Hakone; largely snow-mild.",{car:1}),
  "izukogen>oyama":L(1.8,1,"train","Izukyū up to Atami (single self-change to the Tōkaidō), on to Mishima, then the Subashiri hotel car to Fuji's east flank. Coast to foothill, snow-mild.",{car:1}),
  "shimoda>yugashima":L(2.7,2,"train","Izukyū the full peninsula up to Atami (self-change), one stop to Mishima, second self-change onto the Sunzu line to Shuzenji + inn shuttle. Long but low and snow-mild.",{car:1}),
  "shimoda>hakone":L(2.7,2,"train","Izukyū up to Atami (self-change), Tōkaidō to Odawara, second self-change onto the Tozan railway up to Kōwakudani. Southern tip to Hakone; snow-mild.",{car:1}),
  "shimoda>oyama":L(2.2,1,"train","Izukyū up to Atami (single self-change to the Tōkaidō), on to Mishima, then the Subashiri hotel car to Fuji's east flank. Coast to foothill, snow-mild.",{car:1}),
  "yugashima>hakone":L(2.4,2,"train","Inn shuttle down the valley, Sunzu to Mishima (self-change to Tōkaidō), trunk hop to Odawara, second self-change onto the Tozan railway to Kōwakudani. Low elevations, snow-mild.",{car:1}),
  "yugashima>oyama":L(1.8,1,"train","Inn shuttle down to the Sunzu line, up to Mishima (self-change), then the Subashiri hotel car around to Fuji's east flank. Valley to foothill, snow-mild.",{car:1}),
  "hakone>oyama":L(1.9,1,"train","Tozan railway down to Odawara (self-change to the Tōkaidō), trunk to Mishima, then the Subashiri hotel car to Fuji's east flank. Both sit low around Fuji's base; snow-mild.",{car:1}),

  /* ── Hokuriku (Kanazawa / crab-coast) intra-region + bookends — researched 2026-07-09. Since the
     March-2024 Hokuriku Shinkansen extension to Tsuruga, Kaga-Onsen & Awara-Onsen are Shinkansen stops,
     so Tokyo→these is a direct through-train and the coastal inns are minutes apart on the trunk.
     Yamanaka & Yamashiro share Kaga-Onsen Stn (a shared-station taxi apart). ── */
  "mikuni>toyama":L(2.25,0,"shinkansen","Chauffeured car from Bouyourou to Awara-Onsen (~20 min), Hokuriku Shinkansen Awara-Onsen→Toyama via Kanazawa (~45 min; a through 'Hakutaka' means no self-change), then inn car up the Jinzu gorge to Garaku (~40 min).",{car:1}),
  "mikuni>yamanaka":L(0.75,0,"car","Direct road, ~30 km / ~45 min by car via the Minami-Kaga road (Pref. Rte 142) — a chartered taxi or inn car (Google Maps). Mikuni/Awara and Yamanaka Onsen are a short cross-Kaga hop; far quicker than routing via Kaga-Onsen Stn. (Rail-ish alt, ~1h: car Bouyourou→Awara-Onsen ~20 min, one adjacent Shinkansen stop→Kaga-Onsen ~10 min, then a ~25-min taxi up to Yamanaka.)",{car:1}),
  "mikuni>yamashiro":L(0.72,0,"car","Direct road, ~28 km / ~43 min by car via the Minami-Kaga road (Pref. Rte 142) — a chartered taxi or inn car (Google Maps). (Rail-ish alt, same ~45 min: car Bouyourou→Awara-Onsen ~20 min, one adjacent Shinkansen stop→Kaga-Onsen ~10 min, then the Beniya Mukayu shuttle ~15 min.)",{car:1}),
  "toyama>yamanaka":L(1.75,0,"shinkansen","Inn car down from Garaku to Toyama Stn (~40 min), Hokuriku Shinkansen Toyama→Kaga-Onsen (~40 min; a through 'Hakutaka' runs it with no self-change, else one change at Kanazawa), then taxi to Yamanaka Onsen (~25 min).",{car:1}),
  "toyama>yamashiro":L(1.5,0,"shinkansen","Inn car from Garaku to Toyama Stn (~40 min), Shinkansen Toyama→Kaga-Onsen (~40 min, through 'Hakutaka' = no self-change; else change at Kanazawa), then the Beniya shuttle (~15 min).",{car:1}),
  "yamanaka>yamashiro":L(0.5,0,"car","Trivial shared-station pairing — both inns hang off Kaga-Onsen Stn, so it's a single direct taxi between the two onsen towns (~20–30 min), no rail at all.",{car:1}),
  "tokyo>mikuni":L(3.25,0,"shinkansen","Hokuriku Shinkansen 'Hakutaka' direct Tokyo→Awara-Onsen (~2h55, a through service since the 2024 Tsuruga extension), then chauffeured car to Bouyourou on the Mikuni coast (~20 min).",{car:1}),
  "tokyo>yamanaka":L(3.25,0,"shinkansen","Hokuriku Shinkansen direct Tokyo→Kaga-Onsen (~2h50, 'Kagayaki'/'Hakutaka' since 2024), then taxi up to Yamanaka Onsen (~25 min). No self-change.",{car:1}),
  "tokyo>yamashiro":L(3.0,0,"shinkansen","Hokuriku Shinkansen direct Tokyo→Kaga-Onsen — 2h48 on the best pairing (Maps 2026-08-02, single line, no self-change), then the Beniya shuttle ~15 min (call ahead; inbound window 14:20–18:00). ⚠ Kagayaki skips Kaga-Onsen since the 2024 Tsuruga extension, so it is the through-Hakutaka you want; earlier departures that miss it run 3h06–3h47 with a change at Kanazawa or Tsuruga. (2026-08-02: was authored 3.5h off a ~3h15 Hakutaka figure — the real 2h45 was flagged; re-checked and the direct service is 2h48.)",{car:1}),
  "kyoto>toyama":L(3.25,1,"train","'Thunderbird' Ltd Exp Kyoto→Tsuruga (~50 min), self-change at Tsuruga onto the Hokuriku Shinkansen→Toyama (~1h), then inn car up to Garaku (~40 min). The Tsuruga change is the one transfer.",{car:1}),

  /* ── Central — Fuji/Yamanashi (Kawaguchiko / Koshu / Kobuchizawa) ↔ each other & the Izu/Hakone cluster,
     + Kyoto bookends. Researched 2026-07-09. These inns are on the JR CHŪŌ line (Shinjuku-facing), so they
     reach the Tōkaidō-side Izu/Hakone inns via Tokyo (the seasonal Kawaguchiko→Gotemba bus is January-
     dormant). Kawaguchiko rides the direct but ~4/day Fuji Excursion to Shinjuku; Koshu/Kobuchizawa ride a
     single Chūō Ltd Exp with no Fujikyu change. ── */
  "kawaguchiko>koshu":L(1.75,1,"train","Kawaguchiko→Ōtsuki on the Fujikyu (self-change at Ōtsuki), then Chūō to Enzan + inn car ~10 min. Single trunk change; both inns hang off the same Ōtsuki spur.",{car:1}),
  "kawaguchiko>kobuchizawa":L(2.25,1,"train","Fujikyu Kawaguchiko→Ōtsuki (self-change), then Chūō west through Kōfu/Enzan to Kobuchizawa + shuttle. One change at Ōtsuki if a through Chūō train aligns.",{car:1}),
  "koshu>kobuchizawa":L(1.0,0,"train","Inn car to Enzan, one Chūō Ltd Exp ('Azusa') straight through to Kobuchizawa, then shuttle — both stations are on the same line, served by the same train.",{car:1}),
  "kawaguchiko>atami":L(3.25,2,"train","Fuji Excursion Kawaguchiko→Shinjuku (~2h, direct but only ~4/day), cross-town self-change to Tokyo, Tōkaidō to Atami + shuttle. ⚠ reliant on the limited Fuji Excursion.",{awkward:1,car:1}),
  "kawaguchiko>izu":L(3.75,3,"train","Fuji Excursion to Shinjuku (~4/day), cross to Tokyo, Tōkaidō to Mishima, then Izuhakone Sunzu to Shuzenji (self-change at Mishima) + taxi. ⚠ three changes plus the sparse Fuji Excursion.",{awkward:1,car:1}),
  "kawaguchiko>izukogen":L(3.9,3,"train","Fuji Excursion Kawaguchiko→Shinjuku (limited departures), cross to Tokyo, Tōkaidō to Atami, then Izukyū to Izu-Kōgen (self-change at Atami) + inn shuttle.",{awkward:1,car:1}),
  "kawaguchiko>shimoda":L(4.25,3,"train","Fuji Excursion to Shinjuku (~4/day), cross to Tokyo, Tōkaidō to Atami, Izukyū all the way down to Shimoda (self-change at Atami) + shuttle. ⚠ long haul off the peninsula tip.",{awkward:1,car:1}),
  "kawaguchiko>yugashima":L(3.9,3,"train","Fuji Excursion to Shinjuku (limited), cross to Tokyo, Tōkaidō to Mishima, Izuhakone Sunzu to Shuzenji (self-change at Mishima), then taxi up to Yugashima.",{awkward:1,car:1}),
  "kawaguchiko>hakone":L(3.75,3,"train","Fuji Excursion Kawaguchiko→Shinjuku (~4/day), cross to Tokyo, Tōkaidō to Odawara, Hakone Tozan up to Yumoto (self-change at Odawara) + inn shuttle. The seasonal Gotemba bus would cut a change but is January-unreliable.",{awkward:1,car:1}),
  "kawaguchiko>oyama":L(3.9,2,"train","Fuji Excursion to Shinjuku (limited), cross to Tokyo, Tōkaidō to Mishima, then hotel car ~40 min. ⚠ only two rail changes but long.",{awkward:1,car:1}),
  "koshu>atami":L(2.75,2,"train","Inn car to Enzan, Chūō Ltd Exp ('Kaiji'/'Azusa') direct to Shinjuku, cross-town to Tokyo, Tōkaidō to Atami + shuttle. No Fujikyu leg keeps this clean.",{car:1}),
  "koshu>izu":L(3.9,3,"train","Enzan→Shinjuku (Chūō Ltd Exp), cross to Tokyo, Tōkaidō to Mishima, Izuhakone Sunzu to Shuzenji (self-change at Mishima) + taxi.",{awkward:1,car:1}),
  "koshu>izukogen":L(4.2,3,"train","Enzan→Shinjuku (Chūō Ltd Exp), cross to Tokyo, Tōkaidō to Atami, Izukyū to Izu-Kōgen (self-change at Atami) + shuttle.",{awkward:1,car:1}),
  "koshu>shimoda":L(4.5,3,"train","Enzan→Shinjuku (Chūō Ltd Exp), cross to Tokyo, Tōkaidō to Atami, Izukyū down to Shimoda (self-change at Atami) + shuttle.",{awkward:1,car:1}),
  "koshu>yugashima":L(4.2,3,"train","Enzan→Shinjuku (Chūō Ltd Exp), cross to Tokyo, Tōkaidō to Mishima, Izuhakone Sunzu to Shuzenji (self-change at Mishima), then taxi up to Yugashima.",{awkward:1,car:1}),
  "koshu>hakone":L(3.25,3,"train","Enzan→Shinjuku (Chūō Ltd Exp), cross to Tokyo, Tōkaidō to Odawara, Hakone Tozan to Yumoto (self-change at Odawara) + inn shuttle.",{awkward:1,car:1}),
  "koshu>oyama":L(3.4,2,"train","Inn car to Enzan, Chūō Ltd Exp to Shinjuku, cross to Tokyo, Tōkaidō to Mishima, then hotel car ~40 min. Only two rail changes.",{car:1}),
  "kobuchizawa>atami":L(3.1,2,"train","Shuttle to Kobuchizawa, 'Azusa' Ltd Exp direct to Shinjuku (~2h), cross to Tokyo, Tōkaidō to Atami + shuttle.",{car:1}),
  "kobuchizawa>izu":L(4.4,3,"train","'Azusa' Kobuchizawa→Shinjuku, cross to Tokyo, Tōkaidō to Mishima, Izuhakone Sunzu to Shuzenji (self-change at Mishima) + taxi.",{awkward:1,car:1}),
  "kobuchizawa>izukogen":L(4.7,3,"train","'Azusa' to Shinjuku, cross to Tokyo, Tōkaidō to Atami, Izukyū to Izu-Kōgen (self-change at Atami) + shuttle.",{awkward:1,car:1}),
  "kobuchizawa>shimoda":L(5,3,"train","'Azusa' to Shinjuku, cross to Tokyo, Tōkaidō to Atami, Izukyū down to Shimoda (self-change at Atami) + shuttle. ⚠ the longest of the Fuji→Izu set.",{awkward:1,car:1}),
  "kobuchizawa>yugashima":L(4.7,3,"train","'Azusa' to Shinjuku, cross to Tokyo, Tōkaidō to Mishima, Izuhakone Sunzu to Shuzenji (self-change at Mishima), then taxi up to Yugashima.",{awkward:1,car:1}),
  "kobuchizawa>hakone":L(3.75,3,"train","'Azusa' to Shinjuku, cross to Tokyo, Tōkaidō to Odawara, Hakone Tozan to Yumoto (self-change at Odawara) + inn shuttle.",{awkward:1,car:1}),
  "kobuchizawa>oyama":L(3.9,2,"train","'Azusa' to Shinjuku, cross to Tokyo, Tōkaidō to Mishima, then hotel car ~40 min. Two rail changes but long.",{awkward:1,car:1}),
  /* Re-researched 2026-09-10: the westbound leg goes round the SOUTH side of Fuji, not back through
     Tokyo. Liner bus Kawaguchiko→Mishima ~1h30–1h40 (japan-guide, Oct 2025) + Tōkaidō Shinkansen
     Mishima→Kyoto — ~1h51 on the few Hikari that call at Mishima, ~2h27 on the all-stations Kodama
     (ekitan) — plus the change at Mishima. Budget 4h15; the old via-Tokyo chain was 4h30 and two
     changes, on a Fuji Excursion that runs ~4 times a day. */
  "kyoto>kawaguchiko":L(4.25,1,"shinkansen","Round the south side of Fuji rather than back through Tokyo: Fujikyu 'Mishima·Kawaguchiko Liner' bus Kawaguchiko→Mishima (~1h30–1h40, roughly hourly, ¥2,700 — japan-guide, Oct 2025), one change at Mishima, then the Tōkaidō Shinkansen Mishima→Kyoto (~1h51 on a Hikari that calls at Mishima, ~2h27 on the all-stations Kodama — ekitan). ~4h15 door-to-door with the inn shuttle and the change. (Via Tokyo — 'Fuji Excursion'→Shinjuku, cross to Tokyo Station, 'Nozomi'→Kyoto — is ~4h30 and two changes, and the Fuji Excursion runs only ~4/day.)",{awkward:1,car:1}),
  "kyoto>kobuchizawa":L(3.5,2,"shinkansen","Tōkaidō Shinkansen Kyoto→Nagoya (~35 min), Chūō 'Shinano' Ltd Exp Nagoya→Shiojiri, then Chūō (Azusa/local) to Kobuchizawa + shuttle — the Nagoya cross-country beats routing back through Tokyo.",{awkward:1,car:1}),

  /* ── Kansai onsen inns — inter-inn pairs (researched 2026-07-09). Mostly hub-routed via Osaka/Kyoto:
     amino=Tango north coast, kinosaki=San'in north coast (the one close pair, ~1.5h via Toyooka), arima=
     Kobe, ise=Mie (Kintetsu east), katsuragi=Kōya/Wakayama south, nara=Nara. The north-coast KTR/San'in
     lines carry January snow risk. Cross-Kansai transfer counts assume typical hub connections. ── */
  "amino>arima":L(4.25,2,"train","Amino→Kyoto on the Ltd Exp 'Hashidate' (~2h30, via Fukuchiyama), change at Kyoto to the JR Kobe-line special rapid to Sannomiya (~50 min), then the Arima Express bus over the hills to Arima (~40 min). ⚠ the north-coast KTR/San'in approach is snow-prone in January.",{awkward:1}),
  "amino>ise":L(4.75,2,"train","Amino→Kyoto on the 'Hashidate' (~2h30), then Kyoto→Ise on the Kintetsu Ltd Exp (~2h, change at Yamato-Yagi) to Ujiyamada/Iseshi + short taxi. ⚠ the Tango/San'in leg out of Amino carries January snow risk.",{awkward:1,car:1}),
  "amino>katsuragi":L(4.75,3,"train","Amino→Fukuchiyama on the KTR (~1h), Ltd Exp 'Kounotori' Fukuchiyama→Osaka (~1h15), then JR south to Kaseda on the Wakayama line (~1h30, change at Tennoji/Wakayama) + pre-booked taxi up to Amanosato. ⚠ snow-prone north-coast start.",{awkward:1,car:1}),
  "amino>kinosaki":L(1.5,1,"train","The one genuinely-close intra-Kansai hop: inn shuttle to Amino, KTR down the coast to Toyooka, one change, then the JR San'in local two stops to Kinosaki-Onsen (~10 min) + 5-min walk. ⚠ entirely on the snow-prone north-coast lines — watch January disruptions.",{awkward:1}),
  "arima>ise":L(3.75,2,"train","Arima Express bus down to Sannomiya (~40 min), Hanshin through to Osaka-Namba (~40 min), then the Kintetsu Ltd Exp Namba→Ise (~1h45) + short taxi. Two self-handled changes across Kansai.",{awkward:1,car:1}),
  "arima>katsuragi":L(3,3,"train","Arima Express bus to Sannomiya (~40 min), across to Osaka (~20 min), then JR south to Kaseda on the Wakayama line (~1h30, change at Tennoji/Wakayama) + pre-booked taxi up to Amanosato — short in time but three changes north-to-south through the hub.",{awkward:1,car:1}),
  "arima>kinosaki":L(4,2,"train","Arima Express bus to Sannomiya (~40 min), across to Osaka (~20 min), then the Ltd Exp 'Kounotori' Osaka→Kinosaki-Onsen (~2h40) + 5-min walk. ⚠ the San'in approach is snow-prone in January.",{awkward:1}),
  "ise>katsuragi":L(3.75,3,"train","Short taxi to the station, Kintetsu Ltd Exp Ise→Osaka-Namba (~1h45), then JR south to Kaseda on the Wakayama line (~1h30, change at Tennoji/Wakayama) + pre-booked taxi to Amanosato — east-side to south-side via the Osaka hub.",{awkward:1,car:1}),
  "ise>kinosaki":L(5,3,"train","Short taxi, Kintetsu Ltd Exp Ise→Osaka (~1h45), change through to Osaka Stn, then the Ltd Exp 'Kounotori' Osaka→Kinosaki-Onsen (~2h40) — ⚠ the long east-to-north-coast diagonal across Kansai, with January snow risk on the San'in leg.",{awkward:1,car:1}),
  "ise>nara":L(2,2,"train","Short taxi, Kintetsu Ltd Exp Ise→Yamato-Yagi (~1h), change to the Kashihara/Nara line up to Kintetsu-Nara (~50 min), then a 5-min taxi. Stays on Kintetsu the whole way — the cleanest of the Ise legs.",{car:1}),
  "katsuragi>kinosaki":L(4.75,3,"train","Pre-booked taxi down to Kaseda, JR north to Osaka on the Wakayama line (~1h30, change at Wakayama/Tennoji), then the Ltd Exp 'Kounotori' Osaka→Kinosaki-Onsen (~2h40) — ⚠ the worst diagonal, south-tip to snow-prone north coast across the whole hub.",{awkward:1,car:1}),

  /* ── Seto Inland Sea inns — intra-region + Kyoto bookend (researched 2026-07-09). All strung along the
     Sanyo corridor (Hiroshima–Miyajimaguchi west; Mihara–Onomichi–Fukuyama east) + Setouchi ferries;
     Mihara↔Setoda is the regular ferry, the Onomichi→Setoda cruise runs limited winter sailings. Transfer
     counts verified against the existing onomichi>hiroshima / miyajima>hiroshima legs (first boarding
     isn't a transfer). Coastal = snow-mild. ── */
  "hatsukaichi>miyajima":L(0.7,1,"ferry","Both sit on Hiroshima's western Sanyo edge: inn shuttle to Ōno-ura, one stop up the JR Sanyo Main Line to Miyajimaguchi, then the ferry across to the island + short walk.",{}),
  "hatsukaichi>onomichi":L(2.0,2,"train","East up the Sanyo corridor past Hiroshima: shuttle to Ōno-ura, JR local into Hiroshima, 'Kodama' Shinkansen Hiroshima→Mihara, then local Mihara→Onomichi.",{}),
  "hatsukaichi>setoda":L(2.4,2,"ferry","Up the corridor then out to Ikuchijima: shuttle to Ōno-ura, JR local to Hiroshima, 'Kodama' to Mihara, then the Mihara→Setoda ferry (~25–30 min, regular year-round) to the port.",{}),
  "hatsukaichi>tomonoura":L(2.0,1,"shinkansen","Straight east on the Sanyo Shinkansen: shuttle to Ōno-ura, JR local into Hiroshima, 'Sakura'/'Nozomi' Hiroshima→Fukuyama, then chauffeured car ~30 min out to the Tomonoura waterfront.",{car:1}),
  "miyajima>onomichi":L(2.3,3,"ferry","The full west-to-east haul: ferry off the island to Miyajimaguchi, JR local into Hiroshima, 'Kodama' Shinkansen to Mihara, then local Mihara→Onomichi.",{awkward:1}),
  "miyajima>setoda":L(2.6,3,"ferry","Island to island across the whole corridor: ferry to Miyajimaguchi, JR local to Hiroshima, 'Kodama' to Mihara, then the Mihara→Setoda ferry (~25–30 min) to Ikuchijima.",{awkward:1}),
  "miyajima>tomonoura":L(2.2,2,"shinkansen","Off the island then straight east: ferry to Miyajimaguchi, JR local to Hiroshima, 'Sakura'/'Nozomi' Hiroshima→Fukuyama, then chauffeured car ~30 min to Tomonoura.",{car:1}),
  "onomichi>setoda":L(1.0,1,"ferry","Short hop out to Ikuchijima: JR local Onomichi→Mihara, then the Mihara→Setoda ferry (~25–30 min, regular). The direct Onomichi→Setoda Setouchi cruise ferry (~40 min) is prettier but runs limited winter sailings — check the timetable.",{}),
  "onomichi>tomonoura":L(1.0,0,"train","Quick east along the Sanyo local: JR Onomichi→Fukuyama, then chauffeured car ~30 min out to the Tomonoura waterfront.",{car:1}),
  "setoda>tomonoura":L(1.5,1,"ferry","Back off Ikuchijima and east: the Setoda→Mihara ferry (~25–30 min), Shinkansen (or local) Mihara→Fukuyama, then chauffeured car ~30 min to Tomonoura.",{car:1}),
  "kyoto>onomichi":L(2.3,1,"shinkansen","Bookend down the Sanyo Shinkansen: 'Nozomi'/'Sakura' Kyoto→Fukuyama (~1h40), then JR local Fukuyama→Onomichi into town. (Shin-Onomichi is direct but sits ~3 km out, so Fukuyama-and-local lands you at the station.)",{}),

  /* ── ex-route legs: every adjacency the curated route templates use, migrated here 2026-06-21 so
     routes carry no times. Generated from the old route-stop harvest; reconcile here, never in a route. ── */
  "akayu>kyoto":L(5.4,1,"train","'Tsubasa' Akayu→Tokyo (~2h19), Tōkaidō 'Nozomi'→Kyoto (~2h15) — one clean change, but the 'Tsubasa' has a winter-suspension history."),
  "amakusa>fukuoka":L(1.9,1,"train","Inn-arranged car Tayuta→JR Kumamoto ~1h (per Tayuta's own access chart) via the Five Bridges + Misumi — coastal, snow-proof — then Kyushu Shinkansen 'Sakura'/'Mizuho' Kumamoto→Hakata (~33 min, every 20-30 min). Rail alt: 20-min taxi/boat→Misumi + JR Misumi line 50 min→Kumamoto (+1 change).",{car:1}),
  "amino>tokyo":L(5,1,"train","Amino→Kyoto (~2h30) + Shinkansen→Tokyo (~2h15) — a full travel day.",{awkward:1}),
  "echigoyuzawa>kanazawa":L(3.5,1,"shinkansen","⚠ This leg used to encode 2.5h via the Hokuhoku line — that was the HAKUTAKA LIMITED EXPRESS, whose last run was 13 March 2015 (replaced by the Hokuriku Shinkansen; the name moved to a Tokyo–Kanazawa shinkansen). The Hokuhoku's own Snow Rabbit rapid then went in March 2023, leaving all-stops locals. Modern route is all-Shinkansen with ONE change: ~25-min inn car/flat-¥5,000 taxi to Echigo-Yuzawa, Jōetsu 'Toki'→Takasaki (~22 min), cross to the Hokuriku 'Hakutaka'→Kanazawa (~2h05, timetabled; timed pairings run the station chain in 2h55–3h00 — 2026-07-29 re-check against the live timetable, was priced 2h15–18 + 30) . ~3h30 door-to-door. (Hokuhoku alt via Jōetsumyōkō is ~3h40–4h over 2–3 changes on a sparse line where half the trains terminate at Muikamachi and no IC cards are accepted — no faster, far less robust.)",{car:1,awkward:1}),
  "echigoyuzawa>sendai":L(3,1,"train","Echigo-Yuzawa→Ōmiya (~50 min), change to Tōhoku Shinkansen 'Hayabusa'→Sendai (~1h20) — all Shinkansen, one change."),
  "fukuoka>nagasaki":L(2,1,"train","Nishi-Kyushu Shinkansen + Ltd Exp Hakata→Nagasaki via Takeo-Onsen (~2h)."),
  /* Corrected 2026-07-26: this was L(2,2) — the bare flight block time, a leftover from the 2026-06-21
     route-harvest, with no ground legs at all. Now door-to-door like its siblings (tokyo>kirishima,
     tokyo>nagasaki): Hakata hotel → FUK (0.3, the researched fukuoka>fuk) + ~1h airport processing
     + 1h40 flight + HND → central Tokyo (0.6, the researched tokyo>hnd) ≈ 3.5h. */
  "fukuoka>tokyo":L(3.5,2,"flight","Fly FUK→HND: Fukuoka City Subway Hakata→Fukuoka Airport (2 stops, ~5 min — the domestic terminal is the one on the subway), then FUK→Haneda ~1h40 scheduled (~47 departures a day on ANA/JAL/Skymark/StarFlyer, 331/week as of Jul 2026), then Haneda→central Tokyo (~25–30 min by monorail or Keikyū). ~3.5h door-to-door including ~1h at FUK — Japan's busiest single-runway domestic terminal; JAL/ANA close security 20 min before departure, so bag-drop wants ~60 min. (All-rail alt: 'Nozomi' Hakata→Tokyo ~4h55, no change — an hour and a half slower.)",{flight:1}),
  "fukuoka>unzen":L(3,2,"bus","Nishi-Kyushu Shinkansen relay Hakata→Isahaya (~1h40 via Takeo-Onsen), then Shimatetsu bus Isahaya→Unzen Onsen (~1h20). One night only — the private-onsen special rooms make a second night pricey."),
  "hakone>kyoto":L(3,1,"train","Direct Tozan BUS Gōra/Sengokuhara→Odawara (~45 min — one seat; Tozan rail adds a Hakone-Yumoto change), then Tōkaidō Shinkansen→Kyoto (~1h50 on the ~2-hourly Odawara-calling 'Hikari'; 'Kodama'+change or ~2h40 all-Kodama otherwise)."),
  "hatsukaichi>hiroshima":L(0.7,1,"train","JR back to Hiroshima (~30 min)."),
  "hita>fukuoka":L(1.75,0,"train","Kyudai-line Ltd Exp 'Yufu'/'Yufuin no Mori' Amagase→Hakata, 1h35 ride + the Tensui pickup to Amagase Station (2026-07 audit: the old 1.5 was below the bare ride; ⚠ ~5–6 Amagase stops/day — the 12:14 is the checkout-friendly one)."),
  "izu>kyoto":L(2.7,0,"train","The inn-bookable flat-rate cab Shuzenji valley→Mishima (~40-50 min; Asaba ¥12-15k, book with the room — Asaba runs NO shuttle), then the direct Mishima-calling 'Hikari'→Kyoto (1h50, ~2-hourly, dep Mishima :58 — reserve; hourly 'Kodama'+change fallback). No self-handled change. Rail alt: Sunzu line→Mishima (~35 min), +1 change.",{car:1}),
  "kagoshima>amakusa":L(2.3,1,"train","Kyushu Shinkansen 'Sakura' Kagoshima-Chūō→Kumamoto (~48 min), change to the JR Misumi line (~50 min — ⚠ 14-18/day, plan the connection), then the 20-min taxi/boat Misumi→Tayuta (the inn's own access chart; inn-synced Takarajima boat where sailing — Iruka 1/2 suspended Dec–Mar, 3-5 sailings remain). Carless, coastal, snow-proof.",{car:1}),
  "kagoshima>hita":L(2.67,1,"scenic","Kyushu Shinkansen Kagoshima-Chūō→Kurume (~45 min), change to the JR 'Yufu' Ltd Exp toward Hita/Amagase (~1h25), free pickup from JR Amagase. ~2h40 door-to-door — the Yufu passes through Kurume, so you change there rather than riding on to Hakata and doubling back."),
  "kagoshima>kurokawa":L(3.3,1,"train","Kyushu Shinkansen Kagoshima-Chūō→Kumamoto (~50 min), then ~2.5h bus/taxi up to Kurokawa Onsen (inn pickup from the bus stop).",{car:1}),
  "kagoshima>yufuin":L(3.2,1,"scenic","Kyushu Shinkansen Kagoshima-Chūō→Hakata (~1h20), ~4-min platform transfer, then the JR 'Yufu' Ltd Exp Hakata→Yufuin (~2h15). ~3h11 total, all-rail."),
  "kakunodate>kyoto":L(6.1,1,"train","The price of Akita: 'Komachi' Kakunodate→Tokyo (~3h04), Tōkaidō 'Nozomi'→Kyoto (~2h15) — the longest leg of any route, on the deep-snow Akita branch; a full travel day.",{awkward:1}),
  "kanazawa>mikuni":L(0.7,0,"train","Hokuriku Shinkansen 'Tsurugi' Kanazawa→Awara-Onsen (~27 min), then the inn's free ~10-min shuttle (reserve by the day before; pickup 14:30–18:00) — Kofuyuden Beniya is in central Awara Onsen town, not out on the Mikuni coast (awara.co.jp/access; 2026-07 audit)."),
  "kanazawa>yamanaka":L(0.9,0,"train","Kanazawa→Kaga-Onsen (~25 min), then ~25-min taxi up to Yamanaka (inn can arrange)."),
  "kanazawa>yamashiro":L(0.6,0,"train","Kanazawa→Kaga-Onsen (~15–30 min), then Beniya Mukayu's free on-demand shuttle (~15 min; runs 14:20–18:00, call your arrival time ahead; returns every 30 min 8:45–11:15) — or a ~¥3k taxi."),
  "katsuragi>oyama":L(5.7,5,"train","The west corridor: JR Wakayama Line Kaseda\u2192Hashimoto (~20 min, same train), Nankai K\u014dya Line Ltd Exp Hashimoto\u2192Namba (~45\u201360 min), Midosuji subway Namba\u2192Shin-Osaka (~20 min), T\u014dkaid\u014d Shinkansen 'Hikari' Shin-Osaka\u2192Mishima (~2h05\u20132h15), local Mishima\u2192Numazu (~5 min), JR Gotemba Line Numazu\u2192Gotemba (~35\u201340 min) + inn shuttle. \u26a0 The Wakayama Line runs ~hourly, so a mistimed Hashimoto connection adds 20\u201340 min. A no-Shinkansen all-conventional path exists at 8\u201310.5h \u2014 never use it. Driving is ~the same 5\u20136h. Researched 2026-07-26 (was falling to a 5.0h/3tx hub estimate \u2014 the estimate was optimistic by 0.7h and TWO transfers).",{car:1,awkward:1}),
  "katsuragi>tokyo":L(3.25,1,"train","Shinkansen back to Tokyo (~3–3.5h from Kansai)."),
  "kinosaki>kanazawa":L(4.75,2,"train","Ltd Exp 'Kinosaki'/'Hashidate' Kinosaki-Onsen→Kyoto (~2h30, direct), change to the 'Thunderbird' Kyoto→Tsuruga (~53 min), cross-platform to the Hokuriku Shinkansen 'Tsurugi' Tsuruga→Kanazawa (~43 min). ~4h06 of riding plus two connection buffers. ⚠ Since the 2024-03-16 Hokuriku Shinkansen extension the Thunderbird terminates at Tsuruga, so the Tsuruga change is mandatory — there is no through service. ⚠ The San'in approach is snow-prone in January. Researched 2026-07-26 (was falling to a 5.0/2 hub estimate; the estimate was within 15 min).",{awkward:1}),
  "kinosaki>tokyo":L(5,1,"train","Kinosaki→Kyoto (~2h30) + Shinkansen→Tokyo (~2h15) — a full travel day.",{awkward:1}),
  "kirishima>kagoshima":L(0.9,0,"train","~15-min shuttle to Hayato Stn + JR Nippō to Kagoshima-Chūō (~38 min). By car ~50 min via the Kyushu Expwy (Mizobe IC→Kagoshima IC, ¥1,090) — sea-level, winter-trivial."),
  "koshu>kyoto":L(3.75,2,"train","The long way round: Ltd Exp 'Shinano' route west via Kōfu to Nagoya (~2.5h), Tōkaidō Shinkansen→Kyoto (~1h) — a genuine transit day.",{awkward:1}),
  "kurokawa>fukuoka":L(2.7,0,"bus","Direct highway bus Kurokawa→Hakata/Fukuoka (~2.5–3h, reserve) — no train changes at all."),
  /* ── Researched 2026-09-11 for the trip kit: the Seto art islands and Nyūtō Onsen ──
     Two places the kit's cards name but its tables could not price. Sourced door-to-door, same
     convention as the rest of LEGS; prose ledger in research/transit-notes.md. */
  "okayama>uno":L(1.25,1,"train","JR Uno Line Okayama→Uno, 50-57 min on the direct through-trains or 47-51 min changing cross-platform at Chayamachi (¥590). Directs run roughly hourly and thin out 08:00-14:00, when you ride a Marine Liner to Chayamachi every ~20 min instead. First 05:49, last 23:43."),
  "okayama>naoshima":L(2.0,2,"ferry","Uno Line to Uno (~50 min, ¥590), a flat 5-min walk to Uno Port, then the Shikoku Kisen car ferry to Miyanoura: 20-min crossing, 13 sailings a day each way, ¥300, no reservations. ⚠ The LAST Uno→Miyanoura sailing is 20:25 (arr 20:45) — the binding constraint on a late start — and winter wind can suspend crossings."),
  "kyoto>okayama":L(1.5,0,"shinkansen","Tōkaidō/Sanyō Shinkansen Kyoto→Okayama, ~60 min on a 'Nozomi' (several an hour) or ~90 min on the hourly 'Hikari', no change; 1.5h is door to door with platform access."),
  "hiroshima>okayama":L(0.9,0,"shinkansen","Sanyō Shinkansen Hiroshima→Okayama, 34-35 min on a 'Nozomi' (3+ an hour) or 39 min on a 'Sakura'/'Hikari', no change."),
  "hiroshima>naoshima":L(2.75,3,"ferry","'Nozomi' Hiroshima→Okayama (~35 min), Uno Line to Uno (~50 min, usually a change at Chayamachi), then the 20-min Shikoku Kisen ferry to Miyanoura. Work backwards from the 20:25 last sailing — leave Hiroshima by about 17:30.",{awkward:1}),
  "tokyo>nyuto":L(4.0,1,"shinkansen","Akita Shinkansen 'Komachi' Tokyo→Tazawako ~2h50 (slower runs to 3h12), then the Ugo Kōtsū Nyūtō-line bus from Tazawako Station bay 1, 45-50 min to the Nyūtō Onsen-kyō stops, ~9-10 departures a day (¥800). The hourly headway means a 15-30 min wait, which is what makes it four hours door to door; a taxi is ~30 min / ~¥7,000. ⚠ January: the Komachi runs snow-prone single track past Morioka and the bus climbs a snow-walled mountain road. Tsuru-no-yu meets guests at the Alpa Komakusa stop by arrangement; Taenoyu runs no station shuttle."),
  "sendai>nyuto":L(2.5,1,"shinkansen","The 'Komachi' is a through train at Sendai, so Sendai→Tazawako is 1h19 with no change, then the same 45-50 min hourly Nyūtō-line bus. ⚠ Same January exposure on the Morioka-Tazawako section and the mountain bus road."),
  "kakunodate>nyuto":L(1.6,1,"train","Kakunodate→Tazawako is a single 'Komachi' stop, 13-16 min (Tazawako-line locals fill the gaps), then the Nyūtō bus, 45-50 min. The hourly bus, not the ride, is what makes this leg an hour and a half."),
  /* ── Researched 2026-09-11 for the trip kit: Hokkaido and the Nagoya gateway ──
     PSEUDO-LOCS, modelled the way osaka/nagoya/nrt/kmq already are: `sapporo`, `cts` (New Chitose),
     `niseko`, `furano`, `noboribetsu`, `otaru`, `akan`, `ngo` (Centrair) sit in NO region and carry no
     GEO/WX row — no builder inn stays there (Chalet Ivy is hidden), so validate #7 asks nothing of
     them and the builder never routes through them. They exist so legBetween can price the kit's
     Sapporo hub and the Hokkaido/Nagoya corridors from sourced timetables instead of an estimate.
     Door-to-door hours, self-handled changes; prose ledger in research/transit-notes.md. */
  "cts>hnd":L(1.9,0,"flight","then fly New Chitose (CTS)→Haneda, ~1h35–1h40 nonstop — the busiest domestic route in Japan (ANA/JAL/SKY/ADO, 40+ a day, first ~06:15, last ~21:30).",{flight:1}),
  "tokyo>sapporo":L(4.0,2,"flight","Fly: Tokyo Stn→Haneda (~30 min), HND→New Chitose (CTS) ~1h35–1h40 (40+ daily), then the JR 'Rapid Airport' from the terminal's own station into Sapporo, 37–40 min, up to 3 an hour. ~4h door to door with airport time; the rail alternative (Hayabusa to Shin-Hakodate-Hokuto + Hokuto) is ~7.5–8h and only makes sense as a deliberate slow day.",{flight:1}),
  "cts>sapporo":L(0.75,0,"train","JR 'Rapid Airport' New Chitose Airport→Sapporo, 37–40 min, 3 an hour through the day (fewer early/late), from the station under the domestic terminal; ~¥1,150. The one Hokkaido leg nobody has to think about."),
  "sapporo>otaru":L(0.6,0,"train","JR Hakodate Line Sapporo→Otaru: 'Rapid Airport' 32–35 min, locals ~45 min, several an hour, ¥800. Kuramure (Asarigawa Onsen) and Ginrinsō are then a ~15-min car from Otaru or Otaru-Chikkō — reserve the hotel shuttle or take a taxi.",{car:1}),
  "cts>otaru":L(1.3,0,"train","Some 'Rapid Airport' trains run through from New Chitose Airport to Otaru with no change — 72–73 min, roughly 2 an hour, ¥2,040; otherwise change at Sapporo (37 min + 32 min)."),
  "sapporo>niseko":L(3.0,0,"bus","Hokkaidō Chūō Bus 'Kōsoku Niseko-gō' Sapporo (Kita 3-jō, 5 min from the station)→Niseko Hirafu, ~3h, reserved, only ~2 morning departures (07:50, 09:20) in winter, ~¥6,000 in the 2025–26 season. Rail alt, 2 changes: 'Rapid Airport' Sapporo→Otaru (32 min), Hakodate-Line local Otaru→Kutchan (~1h–1h20, sparse), then a 15-min taxi (~¥2,500) to Hirafu — ~2h45 if the Otaru connection lines up. Zaborin/Shiguchi both quote ~2.5h by car from Sapporo; a private transfer is the comfortable answer here.",{awkward:1,car:1}),
  "cts>niseko":L(2.75,0,"bus","Chūō Bus/Niseko Bus New Chitose Airport→Niseko Hirafu, ~2h33, reserved, 4 a day in winter (10:00, 13:40, 14:40, 15:30), ~¥6,000; the reserved winter shuttles (Hokkaidō Resort Liner, White Liner, Sky Express) run the same ~2.5h with hotel drop-offs. Rail alt, 2 changes: 'Rapid Airport' through to Otaru (~72 min) + Hakodate-Line local to Kutchan (~1h–1h20) + 15-min taxi, ~3h+. The inns quote ~2h by car/private transfer straight from the airport — no Sapporo detour.",{car:1}),
  "sapporo>furano":L(2.75,0,"bus","Hokkaidō Chūō Bus 'Kōsoku Furano-gō' Sapporo Stn bus terminal→Furano Stn, ~2h30, roughly every 1–2 hours, ~¥2,300–2,700, reserved. Rail alt, 1 change: Ltd Exp 'Lilac'/'Kamui' Sapporo→Takikawa (~50 min) then the Nemuro-Line local Takikawa→Furano (~66 min, sparse) — 2.5–3.5h depending on the Takikawa wait; the summer-only 'Furano Lavender Express' is the direct train and does not run in January."),
  "cts>furano":L(2.25,0,"bus","Furano Bus airport liner New Chitose Airport (stop 23)→Furano, ~2h, 4 a day year-round (10:30, 11:45, 14:30, 17:30); in winter (Dec 1–Mar 30) the reserved Hokkaidō Resort Liner runs the same corridor in 2h15–2h30 with ski-hotel drop-offs (book ≥9 days ahead). Nothing on rail beats these — the train goes back through Sapporo and Takikawa."),
  "sapporo>noboribetsu":L(1.75,1,"train","Ltd Exp 'Hokuto'/'Suzuran' Sapporo→Noboribetsu Stn, 1h05–1h14, all seats reserved, roughly hourly between the two services (¥3,250–4,890), then the Dōnan Bus up to Noboribetsu Onsen, 15 min, ¥450, 1–2 an hour (taxi ~¥3,000). One change at the station. Alt with no change: the reserved 'Kōsoku Onsen-gō' highway bus Sapporo→Noboribetsu Onsen, ~1h50–2h20, ~¥2,800–3,800."),
  "cts>noboribetsu":L(1.3,0,"bus","Dōnan Bus 'Noboribetsu Onsen Airport Express' New Chitose Airport→Noboribetsu Onsen direct, ~1h10, reserved, ~4 a day, ~¥2,200. Rail alt (2 changes): local one stop to Minami-Chitose, 'Hokuto' to Noboribetsu Stn, then the 15-min onsen bus."),
  "sapporo>akan":L(6.75,1,"train","Ltd Exp 'Ōzora' Sapporo→Kushiro, 4h08, 6 a day, ¥10,320 reserved, then the Akan Bus route bus Kushiro Stn→Akanko Onsen, ~110 min, ¥2,570, only 3 round trips a day — the connection wait, not the ride, makes it a full travel day. ⚠ The sensible way to Lake Akan is to fly: HND→Kushiro (KUH) 1h35–1h45, then the 'Akan Airport Liner' Kushiro Airport→Akanko Onsen, ~65 min, ¥2,190, 3 a day (reserve).",{awkward:1}),
  "tokyo>nagoya":L(2.1,0,"shinkansen","Tōkaidō 'Nozomi' Tokyo→Nagoya, ~1h35–1h40, every ~10 min ('Hikari' ~1h50; 'Kodama' ~2h50). Station-anchored like tokyo>kyoto — from a central hotel door add the walk to the trunk."),
  "kyoto>nagoya":L(0.9,0,"shinkansen","Tōkaidō 'Nozomi' Kyoto→Nagoya ~35 min (several an hour; 'Hikari'/'Kodama' 40–60 min), ¥5,170 unreserved / ~¥6,000 reserved. The shortest Shinkansen hop on the board."),
  "takayama>nagoya":L(2.75,0,"train","JR Ltd Exp 'Hida' Takayama→Nagoya, ~2h25 direct, 10 a day (hourly only ~11:30–16:30, 2h gaps outside), ¥5,610 unreserved / ¥6,140 reserved, + the 7-min walk from the inn/old town. ⚠ Snow-exposed — JR Central posts 大雪 advisories most Januaries, all-reserved Dec 25–Jan 5. Equal-time alternative when the line is under an advisory: the Nohi highway bus Takayama Nōhi BC→Meitetsu BC Nagoya, ~2h45, reserved."),
  "nikko>hnd":L(2.8,1,"train","Taxi to Tōbu-Nikkō (~5 min), Tōbu Ltd Exp 'Spacia X'/'Kegon' Tōbu-Nikkō→Asakusa (~1h50, 6–7 a day, all reserved), walk to the Toei Asakusa-line platforms (~5 min), then the through train Asakusa→Haneda Airport Terminal 1·2 (37 min, no change on the Keikyū through services — check the destination board, otherwise change at Sengakuji). One change, at Asakusa; no Tokyo Station detour."),
  "nagoya>ngo":L(0.7,0,"train","Meitetsu 'μSKY' Meitetsu-Nagoya→Central Japan Airport (Centrair, NGO), 28 min, all-reserved, ¥1,430 (¥980 fare + ¥450 μ-ticket), ~2 an hour; the ordinary Meitetsu Ltd Exp ~38 min for the plain ¥980. Meitetsu-Nagoya is under the JR station's west side — allow 10 min to cross."),
  "kyoto>hatsukaichi":L(2.4,1,"train","Shinkansen Kyoto→Hiroshima (~1h40), JR ~25 min toward Miyajimaguchi + short taxi."),
  "kyoto>miyajima":L(2.7,2,"train","Shinkansen Kyoto→Hiroshima (~1h40), JR to Miyajimaguchi + ferry (~40 min), then ~3-min walk."),
  "kyoto>nara":L(0.75,0,"train","Kintetsu Kyoto→Kintetsu-Nara (~45 min), ~5-min taxi."),
  "kyoto>setoda":L(2.5,1,"train","Shinkansen Kyoto→Mihara (~1h50), then ~30-min ferry to Setoda Port + 5-min walk — arriving by sea is the point."),
  "kyoto>tomonoura":L(2.2,1,"train","Shinkansen Kyoto→Fukuyama (~1h40), then ~30-min car/shuttle to the Tomonoura waterfront.",{car:1}),
  "mikuni>kyoto":L(1.75,1,"train","Hokuriku Shinkansen 'Tsurugi' Awara-Onsen→Tsuruga (~30 min), cross-platform change (~10 min), 'Thunderbird' Ltd Exp→Kyoto (~55 min) — segments re-timed 2026-07 audit; total holds."),
  "miyajima>hiroshima":L(1,1,"train","Ferry + JR back to Hiroshima (~50 min)."),
  "nara>amino":L(3.25,1,"train","Back through Kyoto: Kintetsu→Kyoto (~45 min), Ltd Exp 'Hashidate'→Amino (~2h30), free shuttle (reserve) — doubles back after Nara.",{awkward:1}),
  "nara>arima":L(1.6,2,"train","Nara→Ōsaka→Sannomiya→Arima (~1.5h), then ~5-min taxi — Japan's oldest hot-spring town, behind Kobe."),
  "nara>katsuragi":L(2.25,2,"train","South toward Kōya: JR Wakayama Line to Kaseda (~2h), then a pre-booked taxi ~15 min (~¥3k — beats waiting for the 15:00-only inn shuttle) — the clean default finale."),
  "nara>kinosaki":L(3.3,1,"train","Back through Kyoto: Kintetsu→Kyoto (~45 min), Ltd Exp 'Kinosaki'→Kinosaki-Onsen (~2h30), ~5-min walk — doubles back after Nara.",{awkward:1}),
  "nikko>sendai":L(2.3,1,"train","Nikkō→Utsunomiya (~45 min), change to a Tōhoku 'Yamabiko'→Sendai (~75–80 min; the 'Hayabusa' skips Utsunomiya) — the cleanest version of this leg."),
  "oyama>kyoto":L(2.6,0,"train","Hotel car back to Mishima (~40 min), Tōkaidō Shinkansen→Kyoto (~2h)."),
  /* akayu / iizaka / kakunodate ↔ sendai: authored once in the gateway block above, as
     "<inn>>sendai". The route-harvested "sendai><inn>" versions that used to sit here (2.0 / 1.5 /
     2.0h) were deleted 2026-07-26 — they were an unreconciled second research pass, and the
     kakunodate one contradicted its own note (~2h ride + ~20-min car ≠ 2.0h door-to-door). */
  "sendai>tsuchiyu":L(1,0,"train","Tōhoku Shinkansen Sendai→Fukushima (~25 min), then the ~25-min taxi up to Tsuchiyu Onsen (Satonoyu runs NO station shuttle — ¥5,440 fixed-fare taxi from the west exit; it will meet the ¥840 Tsuchiyu bus stop if told ahead). Same connector as every Fukushima-hub Tsuchiyu leg."),
  "setoda>hiroshima":L(1.6,2,"train","Ferry back to Mihara (~30 min), then JR/Shinkansen to Hiroshima."),
  "setoda>tokyo":L(4.2,1,"train","Ferry to Mihara (~30 min), Shinkansen Mihara→Tokyo (~4h)."),
  "tanigawa>kanazawa":L(3.25,1,"shinkansen","~20-min taxi to Jōmō-Kōgen, Jōetsu Shinkansen→Takasaki (~15 min), cross to the Hokuriku 'Hakutaka'→Kanazawa (2h15–2h18, timetabled). One change, at Takasaki. Sibling of echigoyuzawa>kanazawa and ~30 min shorter for the same reasons Senjuan is always nearer: Jōmō-Kōgen is closer to Takasaki and the last mile is a shorter taxi.",{car:1}),
  "tanigawa>sendai":L(2.5,1,"train","Inn shuttle to Jōmō-Kōgen, Jōetsu Shinkansen→Ōmiya (~45 min), change to Tōhoku Shinkansen 'Hayabusa'→Sendai (~1h20) — all Shinkansen, one change."),
  "tokyo>echigoyuzawa":L(1.75,0,"train","Jōetsu Shinkansen Tokyo→Echigo-Yuzawa (~75 min), then ~30 min by car (inn can arrange)."),
  "tokyo>hakone":L(2.2,1,"train","Odakyu Romancecar Shinjuku→Hakone-Yumoto (~85 min), Tozan railway→Kōwakudani (~35 min), 5-min inn shuttle (reserve)."),
  "tokyo>izu":L(1.75,0,"train","'Kodama'/'Hikari' Tokyo→Mishima (~45-55 min, every ~30 min), then the flat-rate cab into the Shuzenji valley (~40-50 min, book with the room). No self-handled change. Rail alt: Izuhakone Sunzu line→Shuzenji (~35 min) + short taxi, +1 change.",{car:1}),
  /* Yugashima (Ochiairo / Arcana Izu) — researched Jul 2026 (inn access pages + Sunzu-line timetable); valley route, snow-immune. */
  "tokyo>yugashima":L(2.2,1,"train","Shinkansen Tokyo→Mishima (~50 min), Izuhakone Sunzu line→Shuzenji (~35 min), then the free inn shuttle ~25 min (Ochiairo includes it — reserve; Arcana is a sparse Tokai bus or ~20-min taxi)."),
  "yugashima>kyoto":L(3.05,1,"train","Inn shuttle back to Shuzenji (~25 min), then Izuhakone Sunzu line + Tōkaidō Shinkansen Shuzenji→Kyoto door-to-door ~2h38 (Google Maps live routing, confirms the Mishima change)."),
  /* tokyo>kirishima moved up into the "Tokyo → Kyushu by air" block (was a bare 2.25h stub with no text). */
  "tokyo>koshu":L(1.5,0,"train","Ltd Exp 'Kaiji' Shinjuku→Enzan (~1h30), then ~10-min drive — inn pickup from Enzan Station (reserve)."),
  "tokyo>nikko":L(2,0,"train","Tōbu Ltd Exp Asakusa→Tōbu-Nikkō (~2h), then ~5-min taxi."),
  "tokyo>oyama":L(1.8,0,"train","Shinkansen Tokyo→Mishima (~50 min 'Kodama'/'Hikari'), then a SELF-BOOKED taxi ~40 min (the inn's published route — it is not a hotel car; pre-book, Mishima's rank is shallow). Free alt: the inn's call-on-arrival shuttle from Gotemba Stn (~20 min, per the inn FAQ; limited vehicles) via the Odakyu 'Fujisan'/hourly Shinjuku highway bus. Direct HND private transfer ~1h30 on arrival day.",{car:1}),
  "tokyo>tanigawa":L(1.67,0,"train","Jōetsu Shinkansen Tokyo→Jōmō-Kōgen (~66–70 min), then a ~20-min taxi (¥5,500 on a 2024 guest report; rank taxis wait at the station). Senjuan's own access page gives this exact chain as 約100分 door-to-door from Tokyo Stn — that's the figure used here. Its free pickup runs from MINAKAMI Stn (Jōetsu-line local), not Jōmō-Kōgen, and the inn quotes that relay-bus-to-Minakami chain at 約110分 — so the taxi wins by ~10 min and a great deal of hassle."),
  "tomonoura>hiroshima":L(1.2,1,"train","From the Inland Sea finale to Hiroshima (~1h)."),
  "tomonoura>tokyo":L(3.75,1,"train","San'yō/Tōkaidō Shinkansen Fukuyama→Tokyo (~3.5–4h)."),
  "tsuchiyu>kyoto":L(4.7,1,"train","~25-min taxi down to Fukushima, Tōhoku Shinkansen Fukushima→Tokyo (~95 min, same-station change), Tōkaidō 'Nozomi'→Kyoto (~2h15)."),
  "unzen>nagasaki":L(1.7,0,"bus","Ken-ei bus Unzen→Nagasaki (~1h40), or back to Isahaya and Ltd Exp on. By car ~47 km / ~1h15 (R57 down the mountain → Chijiwa → Isahaya) — only the top ~10 km of the descent carries ice risk."),
  "yamanaka>kyoto":L(1.6,1,"train","Kaga-Onsen→Tsuruga (~30 min), 'Thunderbird' Ltd Exp→Kyoto (~1h25)."),
  "yamashiro>kyoto":L(2,1,"train","Beniya Mukayu shuttle→Kaga-Onsen (~15 min), 'Tsurugi'→Tsuruga (~37 min), cross-platform change (~10 min), 'Thunderbird' Ltd Exp→Kyoto (~55 min) — 2026-07 audit; the old ~1h30 used a stale pre-extension Thunderbird time."),
  /* ── Hokuriku additions (Jul 2026): Hitotsu Notojima (Noto Peninsula) + Kanshuku-en Eshikoto (Eiheiji, Fukui).
     Notojima hangs off the JR Nanao Line (Ltd Exp 'Noto Kagaribi' Kanazawa↔Wakura-Onsen ~1h08, ~5/day + a
     ~10-min taxi across the Notojima bridge) — everything composes through Kanazawa. Eiheiji sits on the
     Echizen Railway ~25 min + ~6-min taxi past Fukui, so it composes through Fukui (a Hokuriku-Shinkansen stop
     since the Mar-2024 Tsuruga extension). Segment sources: JR West / kanazawastation.com / japan-guide,
     research/transit-notes.md. Legs auto-reverse. */
  "notojima>kanazawa":L(1.25,0,"train","A ~10-min taxi across the Notojima bridge to Wakura-Onsen, then the JR Ltd Exp 'Noto Kagaribi' Wakura-Onsen→Kanazawa (~1h08, ~5/day, direct) — about 1h20 door-to-door.",{car:1}),
  "tokyo>notojima":L(4.0,1,"shinkansen","Hokuriku Shinkansen 'Kagayaki' Tokyo→Kanazawa (~2h28), change to the JR Ltd Exp 'Noto Kagaribi' Kanazawa→Wakura-Onsen (~1h08, ~5/day — confirm the connection), then a ~10-min taxi across the Notojima bridge. One change at Kanazawa.",{car:1}),
  "kyoto>notojima":L(3.75,2,"train","'Thunderbird' Ltd Exp Kyoto→Tsuruga (~45 min), Hokuriku Shinkansen Tsuruga→Kanazawa (~50 min), change to the JR Ltd Exp 'Noto Kagaribi'→Wakura-Onsen (~1h08), then a ~10-min taxi across the Notojima bridge. Two changes (Tsuruga, Kanazawa).",{car:1,awkward:1}),
  "notojima>mikuni":L(2.5,1,"train","Ltd Exp 'Noto Kagaribi' Wakura-Onsen→Kanazawa (~1h08; +10-min inn taxi), change to the Hokuriku Shinkansen→Awara-Onsen (~25 min), then a ~20-min car to the Mikuni coast. One rail change at Kanazawa.",{car:1}),
  "notojima>yamashiro":L(2.25,1,"train","Ltd Exp 'Noto Kagaribi'→Kanazawa (~1h08; +10-min inn taxi), change to the Hokuriku Shinkansen→Kaga-Onsen (~20 min), then the Beniya Mukayu shuttle (~15 min). One change at Kanazawa.",{car:1}),
  "notojima>yamanaka":L(2.5,1,"train","Ltd Exp 'Noto Kagaribi'→Kanazawa (~1h08; +10-min inn taxi), change to the Hokuriku Shinkansen→Kaga-Onsen (~20 min), then a ~25-min taxi up to Yamanaka Onsen. One change at Kanazawa.",{car:1}),
  "notojima>toyama":L(2.5,1,"train","Ltd Exp 'Noto Kagaribi'→Kanazawa (~1h08; +10-min inn taxi), change to the Hokuriku Shinkansen→Toyama (~23 min), then a ~40-min car up the Jinzu gorge to Garaku. One change at Kanazawa.",{car:1}),
  "notojima>eiheiji":L(2.5,1,"train","Ltd Exp 'Noto Kagaribi'→Kanazawa (~1h08; +10-min inn taxi), Hokuriku Shinkansen Kanazawa→Fukui (~25 min), then a ~25-min cab straight between Fukui Stn and Eshikoto (Maps 22 min / 13.7 km) — no Echizen Railway, no rail change (2026-08-02: the Echizen Rly + 6-min-taxi chain this leg used to quote costs ~40 min and one extra change; tokyo>eiheiji already preferred the cab, so the inn's access was quoted differently by direction of travel). One change, at Kanazawa.",{car:1}),
  "eiheiji>kanazawa":L(1.0,0,"train","A ~25-min cab straight between Eshikoto and Fukui Stn (Maps 22 min / 13.7 km), then the Hokuriku Shinkansen Fukui→Kanazawa (23–28 min, Maps). No rail change at all — no Echizen Railway (2026-08-02: was 1.25h/1tx off the Echizen Rly + 6-min-taxi chain, which costs ~40 min and one extra change; tokyo>eiheiji already preferred the cab, so the inn's access was quoted differently depending on direction of travel — which quietly skewed exactly the reorder comparisons this leg turns up in).",{car:1}),
  /* ── north (Jōetsu/Hokuriku spine) → Fukui & Toyama, authored 2026-08-02. These 7 pairs were falling
     to COMPOSE_CORRIDORS' Kanazawa pivot, which is wrong here in two specific ways — see decision-log.
     (a) TOYAMA SITS BEFORE KANAZAWA on the Hokuriku Shinkansen, so pivoting at Kanazawa rides past the
         destination and doubles back (~+45 min of pure artifact).
     (b) FUKUI IS A THROUGH-STOP — the Hakutaka/Kagayaki runs straight on from Kanazawa, so the pivot's
         change never happens; and composing through `eiheiji>kanazawa` also inherited its Echizen-Railway
         last mile (+1 change) when tokyo>eiheiji already documents a ~25-min cab straight from Fukui.
         (2026-08-02: that Echizen-vs-cab inconsistency was then fixed across ALL eiheiji legs — see log.)
     Kaga-Onsen / Awara / Wakura are deliberately NOT authored here: their Kanazawa change is REAL (sparse
     stopping pattern — Kagayaki skips Kaga-Onsen), so the composed values there are already right.
     Segment library (Maps, 2026-08-02): Echigo-Yuzawa→Takasaki 23–27 min (several/hr) · Jōmō-Kōgen→Takasaki
     14–15 min · Takasaki→Toyama 1h51 direct (~hourly) · Takasaki→Fukui 2h25 · Karuizawa→Toyama 1h19–1h38 ·
     Karuizawa→Fukui 2h04–2h36 · Nagano→Toyama 45 min · Nagano→Fukui 1h29–1h34. Validated end-to-end against
     Maps: Echigo-Yuzawa→Fukui 3h21, Echigo-Yuzawa→Toyama 2h26–2h58. Legs auto-reverse. */
  "echigoyuzawa>eiheiji":L(4.25,1,"shinkansen","~25-min inn car/flat-¥5,000 taxi to Echigo-Yuzawa, Jōetsu 'Toki'→Takasaki (~25 min), cross to the Hokuriku 'Hakutaka'→Fukui — Maps times the station chain at 3h21 — then a ~25-min cab straight to Eshikoto (Maps 22 min / 13.7 km). ONE rail change, at Takasaki: the Hakutaka runs straight through Kanazawa, so there is no Kanazawa change and no Echizen Railway. (Was composed at 4.75h/3 changes through the Kanazawa pivot — 2026-08-02 audit.)",{car:1}),
  "tanigawa>eiheiji":L(3.9,1,"shinkansen","~20-min taxi to Jōmō-Kōgen, Jōetsu Shinkansen→Takasaki (~15 min), cross to the Hokuriku 'Hakutaka'→Fukui (~2h25), then a ~25-min cab straight to Eshikoto (Maps 22 min / 13.7 km). One change, at Takasaki. Sibling of echigoyuzawa>eiheiji and ~20 min shorter for the same reason as the Kanazawa pair — Jōmō-Kōgen is closer to Takasaki and the last mile is a shorter taxi.",{car:1}),
  "karuizawa>eiheiji":L(3.1,1,"shinkansen","~15-min taxi to Karuizawa Stn, then the Hokuriku Shinkansen straight down the line to Fukui (Maps 2h04–2h36; one change to a faster service, typically at Nagano or Kanazawa), then a ~25-min cab to Eshikoto (Maps 22 min / 13.7 km). Karuizawa is already ON the Hokuriku Shinkansen — the old 3.5h composition pivoted at Kanazawa on a line the train never leaves.",{car:1}),
  "yudanaka>eiheiji":L(3.1,2,"shinkansen","~7-min inn pickup + Nagaden Ltd Exp Yudanaka→Nagano (~45 min), cross to the Hokuriku Shinkansen Nagano→Fukui (~1h30), then a ~25-min cab to Eshikoto (Maps 22 min / 13.7 km). Two changes (Nagano, and the Nagaden platform). ⚠ Nagaden runs ~10 ltd exp/day — the Nagano connection sets the departure.",{car:1,awkward:1}),
  "echigoyuzawa>toyama":L(3.75,1,"shinkansen","~25-min inn car to Echigo-Yuzawa, Jōetsu 'Toki'→Takasaki (~25 min), cross to the Hokuriku Shinkansen→Toyama (~1h51 direct, ~hourly; Maps times the station chain at 2h26–2h58), then the ~40-min car up the Jinzu gorge to Garaku. One change, at Takasaki. ⚠ Toyama sits BEFORE Kanazawa on the line — the old 4.5h composition rode past it to Kanazawa and doubled back.",{car:1}),
  "tanigawa>toyama":L(3.5,1,"shinkansen","~20-min taxi to Jōmō-Kōgen, Jōetsu Shinkansen→Takasaki (~15 min), cross to the Hokuriku Shinkansen→Toyama (~1h51 direct, ~hourly), then the ~40-min car to Garaku. One change, at Takasaki — same correction as echigoyuzawa>toyama, ~15 min nearer.",{car:1}),
  "karuizawa>toyama":L(2.4,0,"shinkansen","~15-min taxi to Karuizawa Stn, then the Hokuriku Shinkansen straight to Toyama (Maps 1h19–1h38), then the ~40-min car up the Jinzu gorge to Garaku. NO rail change at all — Karuizawa and Toyama are on the same line, which the old 3.25h/2-change Kanazawa composition could not see.",{car:1}),
  "yudanaka>toyama":L(2.9,2,"shinkansen","~7-min inn pickup + Nagaden Ltd Exp Yudanaka→Nagano (~45 min), cross to the Hokuriku Shinkansen Nagano→Toyama (~45 min), then the ~40-min car up the Jinzu gorge to Garaku. Two changes (Nagano, and the Nagaden platform). ⚠ Nagaden runs ~10 ltd exp/day — the Nagano connection sets the departure.",{car:1,awkward:1}),
  "tokyo>eiheiji":L(3.25,0,"shinkansen","Hokuriku Shinkansen 'Kagayaki' Tokyo→Fukui (2h49–2h58, Maps 2026-08-02; all 9 daily stop Fukui), then a ~25-min cab straight to Eshikoto (Maps 22 min / 13.7 km) — no rail change at all. Rail alt: Echizen Railway→Eiheijiguchi (~25 min, clockface :25/:55) + the inn pickup (request at booking — Eiheijiguchi is unmanned, no taxi rank) ≈ 3.6–3.8h with 1 change. (Was 3.5h off a ~2h51 + 30-min-cab pairing; re-timed 2026-08-02.)",{car:1}),
  "kyoto>eiheiji":L(1.75,1,"train","'Thunderbird' Ltd Exp Kyoto→Tsuruga (~45 min), Hokuriku Shinkansen Tsuruga→Fukui (~18 min), then a ~25-min cab straight between Fukui Stn and Eshikoto (Maps 22 min / 13.7 km) — no Echizen Railway, no rail change (2026-08-02: the Echizen Rly + 6-min-taxi chain this leg used to quote costs ~40 min and one extra change; tokyo>eiheiji already preferred the cab, so the inn's access was quoted differently by direction of travel). One change, at Tsuruga.",{car:1}),
  "eiheiji>mikuni":L(0.75,0,"car","Direct road, ~28 km / ~43 min by car via Pref. Rte 9 to the Mikuni coast (Bouyourou); Awara Onsen (Kofuyuden Beniya) is a touch closer — a chartered taxi or inn car (Google Maps). Far quicker than backtracking to Fukui for one Shinkansen stop. (Rail alt: ~6-min taxi to Eiheijiguchi, Echizen Railway→Fukui ~25 min, one Shinkansen stop Fukui→Awara-Onsen ~10 min, then a ~20-min car to the coast — ~1h15, 1 change.)",{car:1}),
  "eiheiji>yamashiro":L(0.67,0,"car","Direct road, ~28 km / ~39 min by car via R364 (or ~36 km on the Hokuriku Expressway) — a chartered taxi or inn car (Google Maps). Yamashiro Onsen and Eiheiji are neighbors across the Ishikawa–Fukui line; far quicker than backtracking to Fukui for one Shinkansen stop. (Rail alt: ~6-min taxi to Eiheijiguchi, Echizen Railway→Fukui ~25 min, Hokuriku Shinkansen Fukui→Kaga-Onsen ~15 min, then the Beniya Mukayu shuttle ~15 min — ~1h30, 1 change.)",{car:1}),
  "eiheiji>yamanaka":L(0.5,0,"car","Direct road, ~22 km / ~28 min by car via R364 — a chartered taxi or inn car (Google Maps). Yamanaka Onsen sits just over the Ishikawa–Fukui hills from Eiheiji (closer than Yamashiro); far quicker than backtracking to Fukui for the Shinkansen. (Rail alt: ~6-min taxi to Eiheijiguchi, Echizen Railway→Fukui ~25 min, Hokuriku Shinkansen Fukui→Kaga-Onsen ~15 min, then a ~25-min taxi up to Yamanaka — ~1h30, 1 change.)",{car:1}),
  "eiheiji>toyama":L(2.0,0,"train","A ~25-min cab straight between Fukui Stn and Eshikoto (Maps 22 min / 13.7 km) — no Echizen Railway, no rail change (2026-08-02: the Echizen Rly + 6-min-taxi chain this leg used to quote costs ~40 min and one extra change; tokyo>eiheiji already preferred the cab, so the inn's access was quoted differently by direction of travel), Hokuriku Shinkansen Fukui→Toyama (~50 min; a through 'Tsurugi'/'Hakutaka' via Kanazawa means no self-change), then a ~40-min car up the Jinzu gorge to Garaku.",{car:1}),
  "yufuin>fukuoka":L(2.17,0,"train","Ltd Exp back toward Hakata (~2h10)."),
  /* ── Beppu (city stop, added 2026-07-26). Beppu was half-wired: three researched HOTELS, WX and
     CITYINFO, but in NO region and ZERO legs — so no route could reach it. It's the mildest, most
     weather-proof stop on the Kyushu route (12°/4°C, "mild, steaming, sea-warmed"): the jigoku, the
     1879 Takegawara sand bath, Myōban's yunohana huts, Kannawa steam-cooking, and a real sauna scene.
     Two spines: the JR Nippō line north to Kokura (the Sonic, ~2/hr — Kokura is the pivot for the
     Kyushu Shinkansen AND for Hakata), and the Ōita/Kyūdai side west to Yufuin and the Yamanami.
     Ōita Airport (OIT) is Beppu's own gateway — see DEPART_LOC_EXTRA. Legs auto-reverse.
     Sources: JR Kyushu / jrpass.com Sonic timings, japan-guide e4750 (Beppu↔Yufuin), Ōita Kōtsū
     'Air Liner', Kyushu Sanko Ōdan-bus timetable, kurokawaonsen.or.jp access page. */
  "beppu>fukuoka":L(2.0,0,"train","Ltd Exp 'Sonic' Beppu→Hakata, ~1h51–2h05, NO change — and it leaves about every 30 minutes from early morning to late evening (JR Kyushu; jrpass.com). ~¥6,380 unreserved / ¥6,910 reserved. The single easiest leg in Kyushu: one seat, turn-up-and-go frequency, up the Nippō line along Beppu Bay via Kokura."),
  "beppu>kumamoto":L(2.5,1,"train","Ltd Exp 'Sonic' Beppu→Kokura (~1h25, ~2/hr), change inside Kokura to the Kyushu Shinkansen 'Mizuho'/'Sakura'→Kumamoto (~50 min). ~2h30 door-to-door, one change at a single station. (The DIRECT cross-island option — the Hōhi-line Ltd Exp over the Aso caldera — is the scenic one but takes ~3h–3h30 and runs only 2/day, departing Kumamoto just after 09:00 and 15:00; treat it as a sightseeing choice, not the transfer.)"),
  "beppu>kagoshima":L(3.2,1,"train","Ltd Exp 'Sonic' Beppu→Kokura (~1h25, ~2/hr), change at Kokura to a through 'Mizuho' down the Kyushu Shinkansen→Kagoshima-Chūō (~1h35; Kokura is a Mizuho stop, so this is one change for the whole island). ~3h10–3h20. (Doubling back via Hakata — Sonic ~1h51 + 'Mizuho' ~1h17 — comes out the same or slightly worse; Kokura is the cleaner pivot. The Nippō line straight down the east coast is a half-day — don't.)"),
  "beppu>nagasaki":L(4.0,2,"train","The long diagonal: Ltd Exp 'Sonic' Beppu→Hakata (~1h55–2h05), 'Relay Kamome'→Takeo-Onsen, timed cross-platform change to the Nishi-Kyushu Shinkansen 'Kamome'→Nagasaki (~2h Hakata→Nagasaki all told). ~4h, two changes, both high-frequency. By car ~245 km / ~3h15 (Ōita Expwy → Tosu JCT → Nagasaki Expwy) — the Nagasaki Expwy has no winter-regulated section, but the Hita–Hiji stretch at the Beppu end is an official winter-tire zone in January.",{awkward:1}),
  "beppu>yufuin":L(1.0,0,"bus","Kamenoi bus Beppu Station→Yufuin Station, ~50 min, 1–2 per hour, ¥1,100 (japan-guide) — the turn-up-and-go option, and the reason Beppu and Yufuin pair so easily. ~1h05 by the Kurokawa association's reckoning; allow the inn shuttle at the Yufuin end. Scenic alt: the Ltd Exp 'Yufu'/'Yufuin-no-Mori' runs Beppu–Ōita–Yufuin direct in ~55 min, but only ~2–3/day and every seat is reserved (no unreserved cars at all) — book it as an experience, not a connection. Plain JR is ~80 min with a change at Ōita. By car ~1h over the top of the Yamanami."),
  "beppu>oit":L(0.9,0,"bus","Ōita Kōtsū 'Air Liner' airport bus Beppu Kitahama / Beppu Station→Ōita Airport (OIT), ~47–50 min, hourly, every day. ⚠ Take the 'Air Liner' — the separate 'Airport Express' for Ōita city does NOT stop in Beppu. OIT is Beppu's own gateway (OIT→Haneda ~1h40, frequent ANA/JAL/SNA — see oit>hnd), so a Beppu finale exits without crossing back to Fukuoka."),
  "beppu>kurokawa":L(2.4,0,"bus","Kyushu Ōdan Bus direct, one seat over the Yamanami: Beppu Station 08:09 → Kurokawa Onsen 10:35 (~2h26; it's the same Beppu–Yufuin–Kurokawa–Aso–Kumamoto cross-island line). ⚠ Only 2 buses/day each way and the Beppu departure is the morning one — reserve (tickets are not sold at the stop machines), and the last Kurokawa→Yufuin/Beppu return is 16:55, so a transfer day must move early. By car it's the better call here: ~66 km / ~1h10 via Beppu IC → Hiji JCT → Kuju IC and the Yamanami Highway, but budget ~1h45 in January — the road crosses the Kuju highlands above 1,000 m and shaded stretches hold ice for days (low-road fallback via Kokonoe IC + R387).",{awkward:1}),
  /* ── Yunoyama Onsen (Sosuikyo, Jul 2026). Northern Mie, at the foot of the Suzuka range: the villa is a
     5-min walk from Kintetsu Yunoyama-Onsen, so every leg starts on the Kintetsu **Yunoyama Line** local to
     Kintetsu-Yokkaichi (~25–30 min, ~2/hr) — the single mandatory first hop. From Yokkaichi there are two
     spines: the Kintetsu Ltd Exp north to Nagoya (~30 min), which is the fast way to everything west via
     Shinkansen, and the Kintetsu Nagoya-line Ltd Exp south to Ise/Yamato-Yagi. Kansai legs therefore run
     Yokkaichi→Nagoya→Shinkansen; only Ise stays on Kintetsu the whole way. Legs auto-reverse. */
  "yunoyama>nagoya":L(1.1,1,"train","Kintetsu Yunoyama Line local Yunoyama-Onsen→Kintetsu-Yokkaichi (~25–30 min, ~2/hr), change to a Kintetsu Ltd Exp→Kintetsu-Nagoya (~30 min). One change at Yokkaichi; the inn's free shuttle covers the 5-min walk if you ask."),
  "yunoyama>kyoto":L(2.0,2,"train","Yunoyama Line→Kintetsu-Yokkaichi (~25–30 min), Kintetsu Ltd Exp→Nagoya (~30 min), then the Tōkaidō Shinkansen 'Nozomi'/'Hikari' Nagoya→Kyoto (~35 min). Two changes, all high-frequency."),
  "yunoyama>ise":L(1.75,1,"train","Yunoyama Line→Kintetsu-Yokkaichi (~25–30 min), then the Kintetsu Nagoya-line Ltd Exp south to Ujiyamada/Iseshi (~1h05; most run through, a few change at Ise-Nakagawa) + short taxi. The one Kansai leg that never leaves Kintetsu.",{car:1}),
  "yunoyama>nara":L(2.75,2,"train","Yunoyama Line→Kintetsu-Yokkaichi (~25–30 min), Kintetsu Ltd Exp south to Yamato-Yagi (~1h30, via Ise-Nakagawa), change to the Kashihara/Nara line up to Kintetsu-Nara (~50 min) + 5-min taxi. (Via Nagoya + Shinkansen to Kyoto + the JR Miyakoji rapid runs about the same, with one more change.)",{car:1,awkward:1}),
  "yunoyama>arima":L(2.9,3,"train","Yunoyama Line→Kintetsu-Yokkaichi (~25–30 min), Ltd Exp→Nagoya (~30 min), Shinkansen 'Nozomi' Nagoya→Shin-Kobe (~1h10), then the Hokushin/Shintetsu line via Tanigami→Arima-Onsen (~30 min). Three changes but every one is a mainline hub.",{awkward:1}),
  "yunoyama>kinosaki":L(4.6,3,"train","Yunoyama Line→Kintetsu-Yokkaichi (~25–30 min), Ltd Exp→Nagoya (~30 min), Shinkansen→Shin-Osaka (~50 min), then the Ltd Exp 'Kounotori' Osaka→Kinosaki-Onsen (~2h40) + 5-min walk. ⚠ the San'in leg is snow-prone in January.",{awkward:1}),
  "yunoyama>amino":L(4.6,3,"train","Yunoyama Line→Kintetsu-Yokkaichi (~25–30 min), Ltd Exp→Nagoya (~30 min), Shinkansen→Kyoto (~35 min), then the Ltd Exp 'Hashidate' Kyoto→Amino (~2h30) + inn shuttle. ⚠ the Tango north-coast leg carries January snow risk.",{awkward:1,car:1}),
  "yunoyama>katsuragi":L(4.3,4,"train","Yunoyama Line→Kintetsu-Yokkaichi (~25–30 min), Ltd Exp→Nagoya (~30 min), Shinkansen→Shin-Osaka (~50 min), then JR south to Kaseda on the Wakayama line (~1h30, change at Tennoji/Wakayama) + a PRE-BOOKED taxi up to Amanosato (~15 min). The full north-east-to-south-tip diagonal.",{awkward:1,car:1}),
  "yunoyama>tokyo":L(2.9,2,"train","Yunoyama Line→Kintetsu-Yokkaichi (~25–30 min), Kintetsu Ltd Exp→Nagoya (~30 min), then the Tōkaidō Shinkansen 'Nozomi' Nagoya→Tokyo (~1h40). Two changes; Nagoya is the pivot for everything from here."),
  /* ── Takayama (Machiyado Ichiryu, Jul 2026). The inn is a 7-min walk from Takayama Stn, which is also the
     Nohi bus centre, so every leg starts at the station. Two spines: the JR Ltd Exp 'Hida' (Nagoya ~2h20,
     hourly; Toyama ~1h30 but only ~4 round trips/day — the Sugihara–Inotani bridge closure ended 2026-05-30,
     so Toyama through-running is back to normal) and the Nohi/Hokutetsu highway bus to Kanazawa via
     Shirakawa-gō (~2h15, direct, reserved). Everything in Hokuriku therefore composes off the Kanazawa bus
     plus the existing researched kanazawa> tails; Tokyo/Kyoto go via Nagoya on the Hida. Legs auto-reverse. */
  "takayama>kanazawa":L(2.4,0,"bus","Nohi/Hokutetsu highway bus Takayama Nohi Bus Center→Kanazawa Stn west exit via Shirakawa-gō (~2h15, direct, reserve — the bus centre is at Takayama Stn, a 7-min walk from the inn). No rail link exists; the bus is the fast way."),
  "takayama>toyama":L(2.4,0,"train","JR Ltd Exp 'Hida' Takayama→Toyama (~1h30, direct up the Takayama Main Line), then a ~40-min car up the Jinzu gorge to Garaku. ⚠ only ~4 round trips/day run through to Toyama — pin the departure before booking.",{car:1,awkward:1}),
  "takayama>yamashiro":L(2.6,1,"train","JR Ltd Exp 'Hida' Takayama→Toyama (~1h30), cross to the Hokuriku Shinkansen down to Kaga-Onsen — Maps times the pair at 2h21 station-to-station (11:03→13:24, ¥8,710) — then Beniya Mukayu's free on-demand shuttle (~15 min; call your arrival ahead). One change at Toyama. ⚠ only ~4 Hida round trips/day run through to Toyama — pin the departure before booking. Fallback, and the more forgiving option if the morning doesn't line up: Nohi bus Takayama→Kanazawa (~2h15, direct, reserved) + Hokuriku Shinkansen Kanazawa→Kaga-Onsen (~20 min), which Maps times at 3h07 station-to-station → ~3.4h door-to-door (2026-08-01 audit: the leg was authored at 3.1 on the bus chain alone, which both understated the bus and missed the northern rail route entirely).",{car:1}),
  "takayama>yamanaka":L(2.8,1,"train","JR Ltd Exp 'Hida' Takayama 11:03→Toyama 12:32 (1h29), cross to a through Hokuriku Shinkansen→Kaga-Onsen (43 min, hourly) — Maps times the pair at 2h21 station-to-station — then a ~25-min taxi up to Yamanaka Onsen (the inn can arrange). One change at Toyama. ⚠ hangs on the 11:03 Hida: only ~4 through-trains/day reach Toyama, and every other departure is the Takayama Line local (2h16–2h25 to Toyama alone). Miss it and the fallback is the Nohi bus Takayama→Kanazawa (~2h15) + the southbound leg, ~3.3h — which is what this leg used to be authored at (2026-08-01 audit).",{car:1}),
  "takayama>mikuni":L(2.75,1,"train","JR Ltd Exp 'Hida' Takayama 11:03→Toyama 12:32 (1h29), cross to a through Hokuriku Shinkansen→Awara-Onsen (51 min, hourly) — ~2h28 station-to-station — then the ~10-min Kofuyuden Beniya shuttle (or a ~20-min car out to Bouyourou on the Mikuni coast). One change at Toyama. ⚠ hangs on the 11:03 Hida: only ~4 through-trains/day reach Toyama, and every other departure is the Takayama Line local (2h16–2h25 to Toyama alone). Miss it and the fallback is the Nohi bus Takayama→Kanazawa (~2h15) + Shinkansen 'Tsurugi' Kanazawa→Awara-Onsen (~27 min), ~3.25h — the old authored value (2026-08-01 audit).",{car:1}),
  "takayama>notojima":L(3.75,1,"bus","Nohi bus Takayama→Kanazawa (~2h15), change to the JR Ltd Exp 'Noto Kagaribi' Kanazawa→Wakura-Onsen (~1h08, ~5/day), then a ~10-min taxi across the Notojima bridge. One change at Kanazawa, but the Kagaribi's thin frequency sets the day. (2026-08-01 audit: checked against the Toyama rail spine that corrected the other four Takayama→Hokuriku legs and CONFIRMED unchanged — Wakura is reached via Kanazawa either way, Kanazawa→Wakura is ~58 min, and the ~5/day Kagaribi wait dominates the total, so the faster Takayama→Kanazawa half buys nothing. Don't re-open.)",{car:1,awkward:1}),
  "takayama>eiheiji":L(2.9,1,"train","JR Ltd Exp 'Hida' Takayama 11:03→Toyama 12:32 (1h29), cross to a through Hokuriku Shinkansen→Fukui (~50 min, frequent) — ~2h27 station-to-station — then a ~25-min cab straight to Eshikoto (Maps 22 min / 13.7 km). One change, at Toyama — no Echizen Railway. ⚠ hangs on the 11:03 Hida: only ~4 through-trains/day reach Toyama, and every other departure is the Takayama Line local (2h16–2h25 to Toyama alone). Miss it and the fallback is the Nohi bus Takayama→Kanazawa (~2h15) + Shinkansen Kanazawa→Fukui (~25 min), ~3.75h — the old authored value (2026-08-01 audit).",{car:1}),
  "takayama>tokyo":L(4.9,1,"train","JR Ltd Exp 'Hida' Takayama→Nagoya (~2h30), change ~15 min to a Tōkaidō 'Nozomi'→Tokyo (~1h42) + hotel/station ends (2026-07-29 re-price: same 10-Hida/day correction as takayama>kyoto — hourly only ~11:30–16:30, all-reserved Dec 25–Jan 5, January 大雪 advisories; best timed pairing runs the stations in 4h16, the old 4.1 was bare rides on that one pairing). (Via Toyama is nominally quicker — 'Hida' ~1h30 + Hokuriku Shinkansen ~2h06 — but only ~4 Toyama through-trains run per day.)"),
  "takayama>osaka":L(3.9,2,"train","JR Ltd Exp 'Hida' Takayama→Nagoya (~2h25; 10/day, hourly only ~11:30–16:30, 2h gaps outside), ~20-min cross-platform transfer to a Tōkaidō Shinkansen 'Nozomi' Nagoya→Shin-Osaka (~50 min, frequent), then the Midōsuji subway Shin-Osaka→Umeda/Namba (~5–10 min) + the walk to the hotel. Two changes, at Nagoya and Shin-Osaka. ⚠ the Takayama Line is snow-exposed — JR Central posts 大雪 advisories most Januaries, and Dec 25–Jan 5 is all-reserved; keep same-day slack. Equal-time alternative that dodges the exposure: the Nohi highway bus Takayama→Nagoya + the same Nozomi. Sources: japan-guide Takayama access; JR Central Tōkaidō/Takayama Line timetables."),
  "takayama>kyoto":L(3.8,1,"train","JR Ltd Exp 'Hida' Takayama→Nagoya (~2h30; 10/day — hourly only ~11:30–16:30, with 2h gaps outside), ~15-min transfer to a Tōkaidō Shinkansen 'Nozomi'→Kyoto (34 min). Alt with NO change: Hida 36 departs Takayama 15:33 direct to Kyoto, arr 19:17. ⚠ The Takayama line is snow-exposed — JR Central posts 大雪 advisories most Januaries; keep same-day slack. (All-reserved Dec 25–Jan 5; mixed seating otherwise.) Equal-time alternative that dodges that exposure: the Nohi highway bus Takayama→Nagoya + the same Nozomi — Maps returns this chain, not the Hida, as its three fastest (3h25–3h33 station-to-station), so take whichever the weather favours (2026-08-01 audit; total unchanged)."),
  /* ── Takayama → central (Hakone·Fuji·Izu) and north (Gunma & the North Country), researched 2026-07-25
     on request — these are cross-region pairs that would otherwise fall to the hub estimate.
     Three spines out of Takayama, and which one wins is purely geographic:
       A · Ltd Exp 'Hida'→NAGOYA (~2h20, hourly) + Tōkaidō Shinkansen — the whole Izu/Hakone/Gotemba coast.
       B · Ltd Exp 'Hida'→TOYAMA (~1h30) + Hokuriku Shinkansen east (Toyama→Nagano ~50 min, →Karuizawa ~1h20,
           →Takasaki ~1h40, →Ōmiya ~1h55) — everything Nagano/Gunma/Niigata and, via Ōmiya, all of Tōhoku.
           ⚠ only ~4 'Hida' round trips/day run through to Toyama, so this spine is departure-pinned.
       C · Nohi/Alpico highway bus→MATSUMOTO (~2h20, ~7/day, reserved, YEAR-ROUND — only the Sawando/Nakanoyu
           stops relocate 11/16–4/16) + the Chūō-line 'Azusa' — the Yamanashi/Yatsugatake side and Tobira.
     The Tōhoku legs are calibrated off the existing researched kanazawa>X set: Takayama→Ōmiya (~3h30 via
     Toyama) runs ~1h25 longer than Kanazawa→Ōmiya (~2h01) with one extra change, so each = kanazawa>X + 1.4h,
     +1 change. Legs auto-reverse. */
  "takayama>atami":L(4.6,1,"shinkansen","'Hida'→Nagoya (~2h20), then a Tōkaidō 'Kodama' Nagoya→Atami (~1h55 all-stops; 'Hikari'/'Nozomi' skip Atami) + Sekaie's 5-min shuttle. One change at Nagoya — going via Tokyo instead costs ~50 min more."),
  "takayama>yugawara":L(4.4,2,"shinkansen","'Hida'→Nagoya (~2h20), 'Hikari' Nagoya→Odawara (~1h30), then the Tōkaidō line down to Yugawara (~20 min) + a short taxi up Mt. Wakakusa.",{car:1}),
  "takayama>hakone":L(4.6,2,"shinkansen","'Hida'→Nagoya (~2h20), 'Hikari' Nagoya→Odawara (~1h30), then the Hakone Tozan railway/bus up to Gōra–Sengokuhara (~40 min) or the inn shuttle.",{car:1}),
  "takayama>izu":L(4.9,2,"shinkansen","'Hida'→Nagoya (~2h20), 'Hikari' Nagoya→Mishima (~1h15), then the Izuhakone Sunzu line→Shuzenji (~35 min) + a short taxi. Mishima, not Atami, is the gateway for central Izu.",{car:1}),
  "takayama>yugashima":L(5.2,2,"shinkansen","'Hida'→Nagoya (~2h20), 'Hikari' Nagoya→Mishima (~1h15), then the Sunzu line + bus/taxi up the Amagi valley to Yugashima (~50 min).",{car:1}),
  "takayama>izukogen":L(5.7,2,"shinkansen","'Hida'→Nagoya (~2h20), 'Kodama' Nagoya→Atami (~1h55), then the Izukyū line down the east coast→Izu-Kōgen (~45 min) + the free inn shuttle (~20 min, reserve).",{car:1}),
  "takayama>shimoda":L(6.2,2,"shinkansen","'Hida'→Nagoya (~2h20), 'Kodama' Nagoya→Atami (~1h55), then the Izukyū all the way down to Izukyū-Shimoda (~1h20–1h30 local; the ~72-min 'Odoriko' if timed). ⚠ the far-south Izu tip — a full ~6h travel day from the Hida mountains.",{awkward:1}),
  "takayama>oyama":L(5.0,1,"shinkansen","Timetabled end-to-end, NOT a sum of ride times: 'Hida'→Nagoya (~2h22), then ~45 min for a Mishima-calling service — the Mishima 'Hikari' runs only ~every 2h ('Kodama' ~1h50 otherwise) — e.g. Takayama 9:36 → Mishima 13:57 (4h21 rail), + the ~40-min taxi/inn car up to Subashiri (the inn's own published access route) ≈ 5h door-to-door. (The Gotemba Line doesn't serve Mishima — it branches at Numazu; the Gotemba-side approach adds two rail changes for no time gain.)",{car:1}),
  "takayama>koshu":L(3.8,1,"bus","Nohi/Alpico bus Takayama→Matsumoto (~2h20, reserve), then the Chūō-line Ltd Exp 'Azusa' Matsumoto→Enzan/Kōfu (~1h05) + a short taxi into the vineyards. One change at Matsumoto — the Chūō spine is much shorter than looping via Nagoya.",{car:1}),
  "takayama>kobuchizawa":L(3.6,1,"bus","Nohi/Alpico bus Takayama→Matsumoto (~2h20, reserve), then the 'Azusa' Matsumoto→Kobuchizawa (~50 min) + a short taxi or the resort shuttle. One change at Matsumoto.",{car:1}),
  "takayama>kawaguchiko":L(5.5,2,"bus","Nohi/Alpico bus Takayama→Matsumoto (~2h20), 'Azusa'→Kōfu (~1h05), then the Fujikyū bus Kōfu→Kawaguchiko (~1h30, ~hourly). ⚠ the Kōfu–Fuji-Five-Lakes hop is bus-only; via Nagoya + Tokyo + 'Fuji Excursion' is ~1h15 longer with fewer changes.",{awkward:1}),
  "takayama>matsumoto":L(3.2,1,"bus","Nohi/Alpico highway bus Takayama Nōhi BC→Matsumoto BT (~2h20, ~7/day, reserved — runs year-round; the Sawando/Nakanoyu stops relocate 11/16–4/16), then Myojinkan's shuttle up to Tobira Onsen (~35–45 min). The one genuinely short Takayama→east hop.",{car:1}),
  "takayama>kiso":L(3.6,2,"train","'Hida'→Nagoya (~2h20), change to the JR Ltd Exp 'Shinano' Nagoya→Nagiso (~60 min; only ~4/day stop, otherwise Nakatsugawa) + Zenagi's pickup (~10 min). Nagoya is the pivot — both trains are hourly.",{car:1}),
  "takayama>karuizawa":L(3.3,2,"shinkansen","'Hida'→Toyama (~1h30), Hokuriku Shinkansen 'Hakutaka' Toyama→Karuizawa (~1h20; 'Kagayaki' skips it) + a ~15-min taxi. ⚠ only ~4 'Hida' run through to Toyama — pin the departure.",{car:1,awkward:1}),
  "takayama>yudanaka":L(3.4,2,"shinkansen","'Hida'→Toyama (~1h30), Hokuriku Shinkansen Toyama→Nagano (~50 min), then the Nagaden Ltd Exp→Yudanaka (~45 min) + 7 min. ⚠ the Toyama 'Hida' runs ~4/day.",{awkward:1}),
  "takayama>yamadaonsen":L(3.1,1,"shinkansen","'Hida'→Toyama (~1h30), Hokuriku Shinkansen Toyama→Nagano (~50 min), then a ~30–45-min car up to Yamada Onsen. One rail change; ⚠ the Toyama 'Hida' runs ~4/day.",{car:1,awkward:1}),
  "takayama>echigoyuzawa":L(5.4,2,"shinkansen","Timetabled end-to-end, NOT a sum of ride times: Takayama 11:03 → Toyama 12:32 ('Hida' 3), wait 49 min → 'Hakutaka' 13:21 → Takasaki 15:02, wait 26 min → Toki 15:28 → Echigo-Yuzawa 15:57, then the ~30-min inn car — 16:27, so ~5h25. The ride time is only 3h45; the other 1h40 is the two connections, because only ~5 Hida run through to Toyama and the Kagayaki skips Takasaki. ⚠ A hired car is ~4h30 (Google) and beats transit outright on this crossing — worth pricing in January against the mountain-road risk.",{car:1,awkward:1}),
  "takayama>tanigawa":L(5.0,2,"shinkansen","Timetabled end-to-end: Takayama 11:03 → Toyama 12:32 ('Hida' 3), wait 49 min → 'Hakutaka' 13:21 → Takasaki 15:02, wait 26 min → Toki 15:28 → Jōmō-Kōgen 15:44, then the ~20-min taxi — 16:04, so ~5h. Still ~25 min shorter than the Echigo-Yuzawa version (Jōmō-Kōgen is two stops earlier, and Senjuan's last mile is the shorter one). ⚠ Same caveat: ~5 Hida/day to Toyama sets the whole day, and a hired car is faster.",{car:1,awkward:1}),
  "takayama>matsunoyama":L(3.8,3,"shinkansen","'Hida'→Toyama (~1h30), Hokuriku Shinkansen Toyama→Jōetsumyōkō (~50 min), the Hokuhoku line toward Matsudai (~55–65 min, one change, sparse), then the ~20-min inn shuttle. Confirm the Matsudai connection at booking — frequency binds here, and the Toyama 'Hida' runs ~4/day.",{awkward:1,car:1}),
  "takayama>nikko":L(5.4,3,"shinkansen","'Hida'→Toyama (~1h30), Hokuriku Shinkansen Toyama→Ōmiya (~1h55, skirting central Tokyo), Tōhoku 'Yamabiko'/'Nasuno'→Utsunomiya (~25 min), then the JR Nikkō line local (~45 min) + inn shuttle.",{awkward:1,car:1}),
  "takayama>tsuchiyu":L(5.3,2,"shinkansen","'Hida'→Toyama (~1h30), Hokuriku Shinkansen Toyama→Ōmiya (~1h55), cross to a Tōhoku 'Yamabiko'→Fukushima (~1h07), then a ~25-min taxi to Tsuchiyu. Ōmiya is the single clean cross-over point out of Hokuriku.",{car:1,awkward:1}),
  "takayama>iizaka":L(5.6,3,"shinkansen","'Hida'→Toyama (~1h30), Hokuriku Shinkansen→Ōmiya (~1h55), 'Yamabiko'→Fukushima (~1h07), then the Iizaka tram (~23 min) + shuttle.",{awkward:1}),
  "takayama>bandaiatami":L(5.7,3,"shinkansen","'Hida'→Toyama (~1h30), Hokuriku Shinkansen→Ōmiya (~1h55), 'Yamabiko'→Kōriyama (~1h20), then the Ban'etsu-West local→Bandai-Atami + shuttle.",{awkward:1,car:1}),
  "takayama>sukagawa":L(5.6,3,"shinkansen","'Hida'→Toyama (~1h30), Hokuriku Shinkansen→Ōmiya (~1h55), 'Yamabiko'→Kōriyama (~1h20), then a Tōhoku local→Sukagawa + shuttle.",{awkward:1,car:1}),
  "takayama>aizuwakamatsu":L(6.6,3,"train","'Hida'→Toyama (~1h30), Hokuriku Shinkansen→Ōmiya (~1h55), 'Yamabiko'→Kōriyama (~1h20), then the Ban'etsu-West line→Aizu-Wakamatsu (~65 min) + taxi. ⚠ the Ban'etsu-West crosses deep snow country.",{awkward:1,car:1}),
  "takayama>akayu":L(6.0,3,"shinkansen","'Hida'→Toyama (~1h30), Hokuriku Shinkansen→Ōmiya (~1h55), 'Yamabiko'→Fukushima (~1h07), change to a 'Tsubasa' over the Itaya pass→Akayu (~52 min) + short taxi. ⚠ heavy January delay exposure on the Tsubasa.",{awkward:1,car:1}),
  "takayama>kaminoyama":L(6.0,2,"shinkansen","'Hida'→Toyama (~1h30), Hokuriku Shinkansen→Ōmiya (~1h55), then a through 'Tsubasa' Ōmiya→Kaminoyama-Onsen (one ride) + short taxi. ⚠ the Itaya-pass Tsubasa is the fragile leg in January.",{awkward:1,car:1}),
  "takayama>kamasaki":L(5.5,2,"shinkansen","'Hida'→Toyama (~1h30), Hokuriku Shinkansen→Ōmiya (~1h55), then a Tōhoku 'Yamabiko' that halts at Shiroishi-Zaō (~1h20) + inn shuttle (~18 min). ⚠ only some Yamabiko stop there — off-peak you add a Fukushima/Sendai change.",{awkward:1,car:1}),
  "takayama>shizukuishi":L(6.2,2,"shinkansen","'Hida'→Toyama (~1h30), Hokuriku Shinkansen→Ōmiya (~1h55), cross to a 'Hayabusa'/'Komachi' Ōmiya→Morioka (~1h51), then the free Koiwai shuttle (~28 min, reserve).",{awkward:1,car:1}),
  "takayama>kakunodate":L(6.5,2,"shinkansen","'Hida'→Toyama (~1h30), Hokuriku Shinkansen→Ōmiya (~1h55), then a through 'Komachi' Ōmiya→Kakunodate (~2h36) + ~12-min taxi. ⚠ the Komachi runs snow-prone single track past Morioka.",{awkward:1,car:1}),
  "takayama>hottoyuda":L(7.4,3,"shinkansen","'Hida'→Toyama (~1h30), Hokuriku Shinkansen→Ōmiya (~1h55), Tōhoku Shinkansen→Kitakami (~2h15), then the Kitakami line local→Hotto-Yuda (~1h, sparse) + short walk. ⚠ the longest pair on the board — a full travel day and then some.",{awkward:1,car:1}),
  /* ── Ryokan Collection additions (off-catalog inns; researched entry + westbound legs) ── */
  "tokyo>atami":L(0.9,0,"shinkansen","Tōkaidō Shinkansen 'Kodama' Tokyo→Atami (~43–45 min; a few 'Hikari' ~35 min, 'Nozomi' skips Atami), then Sekaie's free shuttle (~5 min). The first Shinkansen stop out of Tokyo — the shortest Izu-area entry.",{car:1}),
  "atami>kyoto":L(2.3,0,"shinkansen","Inn shuttle to Atami, direct 'Hikari' Atami→Kyoto (~1h57, one seat — but only ~3 Atami-calling Hikari/day; 'Nozomi' skips Atami), else 'Kodama' + change at Mishima/Nagoya (+1 tx)."),
  /* ── Yugawara additions (Jul 2026): Sekiyo, on Mt. Wakakusa above Yugawara Onsen (Kanagawa). Yugawara sits
     on the Tōkaidō line one stop west of Atami, so everything composes through Atami/Odawara; the Chūō-line
     Fuji/Yatsugatake inns (koshu/kawaguchiko/kobuchizawa) only meet the Tōkaidō coast at Tokyo (flagged awkward).
     Sources: JR East 'Odoriko' (~70 min Tokyo→Yugawara) + the existing central-region segments. Legs auto-reverse. */
  "yugawara>tokyo":L(1.25,0,"train","JR Ltd Exp 'Odoriko' Tokyo→Yugawara (~70 min, one seat), then a short taxi up Mt. Wakakusa to the inn.",{car:1}),
  "yugawara>kyoto":L(2.3,1,"shinkansen","Tōkaidō line Yugawara→Atami (~7 min, one stop), then 'Hikari' Atami→Kyoto (~1h57; 'Nozomi' skips Atami). ~2h20, one change at Atami.",{car:1}),
  "atami>yugawara":L(0.4,0,"train","One Tōkaidō-line stop Atami↔Yugawara (~7 min) plus the short taxis at each end — effectively neighbours.",{car:1}),
  "hakone>yugawara":L(1.5,1,"train","Hakone Tozan railway/bus down to Odawara (~35–40 min), then the Tōkaidō line Odawara→Yugawara (~20 min) + a short taxi. One change at Odawara.",{car:1}),
  "yugawara>izu":L(1.5,2,"train","Tōkaidō Yugawara→Atami (~7 min) + Shinkansen Atami→Mishima (~10 min), change to the Izu-Hakone Sunzu line→Shuzenji (~35 min) + taxi to Asaba. Two changes (Atami, Mishima).",{car:1}),
  "yugawara>yugashima":L(2.0,2,"train","As Yugawara→Shuzenji (via Atami + Mishima), then a ~30-min bus/taxi up the valley to Yugashima. Two changes.",{car:1,awkward:1}),
  "yugawara>izukogen":L(1.3,1,"train","Tōkaidō Yugawara→Atami (~7 min), change to the Izukyū line/'Odoriko'→Izu-Kōgen (~50 min) + inn shuttle. One change at Atami.",{car:1}),
  "yugawara>shimoda":L(1.9,1,"train","Tōkaidō Yugawara→Atami (~7 min), change to the Izukyū 'Odoriko'→Izukyū-Shimoda (~72 min; locals ~1h30) + shuttle. One change at Atami.",{car:1}),
  "yugawara>oyama":L(1.75,1,"train","Tōkaidō Yugawara→Mishima (~30 min via Atami), then the hotel car ~40 min to Subashiri on Fuji's east flank — car-only last mile.",{car:1}),
  "yugawara>koshu":L(3,2,"train","Ltd Exp 'Odoriko' Yugawara→Tokyo (~70 min), cross to Shinjuku, Chūō Ltd Exp 'Kaiji/Azusa'→Isawa-onsen/Enzan (~90 min) + taxi. Two changes via Tokyo — the Tōkaidō coast and the Chūō line only meet there. (A few Chūō ltd exps originate at Tokyo Stn itself — one change if timed.)",{car:1,awkward:1}),
  "yugawara>kawaguchiko":L(3.5,2,"train","'Odoriko'→Tokyo (~70 min), Chūō line→Ōtsuki (~75 min), Fujikyū→Kawaguchiko (~50 min) + taxi. Two changes. (The 'Fuji Excursion' departs Shinjuku only — using it from here means a third change crossing town; the seasonal Gotemba shortcut is January-dormant.)",{car:1,awkward:1}),
  "yugawara>kobuchizawa":L(3.5,2,"train","'Odoriko'→Tokyo (~70 min), cross to Shinjuku, 'Azusa'→Kobuchizawa (~2h) + taxi. Two changes — the Tōkaidō coast reaches Yatsugatake only through Tokyo. (A few 'Azusa' originate at Tokyo Stn — one change if timed.)",{awkward:1}),
  "tokyo>izukogen":L(2.3,0,"train","JR Ltd Exp 'Odoriko' Tokyo→Izu-Kōgen (~2h, one seat) — or Shinkansen Tokyo→Atami (~40 min) + Izukyū Line — then the inn's free shuttle (~6–15 min, reserve).",{car:1}),
  "izukogen>kyoto":L(3.75,1,"train","Izukyū Izu-Kōgen→Atami (~50 min), then 'Hikari' Atami→Kyoto (~2h; 'Nozomi' skips Atami).",{awkward:1}),
  "tokyo>shimoda":L(3.25,0,"train","JR Ltd Exp 'Odoriko'/'Saphir Odoriko' Tokyo→Izukyū-Shimoda (~2h45, one seat), then Seiryuso's free shuttle (~10 min, reserve the prior day).",{car:1}),
  "shimoda>kyoto":L(4.5,1,"train","Inn shuttle + Odoriko LEX Izukyū-Shimoda→Atami (~70 min), then 'Hikari' Atami→Kyoto (~2h; 'Nozomi' skips Atami). Far-south Izu — a backtrack to go anywhere.",{awkward:1}),
  "tokyo>matsumoto":L(3.4,0,"train","JR Ltd Exp 'Azusa' Shinjuku→Matsumoto (~2h35), then Myōjinkan's shuttle (~35–45 min, reserve) or a taxi (~30 min). A Chūō-line spur off the north loop.",{car:1}),
  "matsumoto>kyoto":L(4.0,1,"train","Inn shuttle to Matsumoto, JR Ltd Exp 'Shinano' Matsumoto→Nagoya (~2h05, through the Kiso valley), then Tōkaidō Shinkansen Nagoya→Kyoto (~35 min) — the natural pivot west."),
  "tokyo>kamasaki":L(2.25,0,"shinkansen","Tōhoku Shinkansen 'Yamabiko' Tokyo→Shiroishi-Zaō (~1h50; the fast 'Hayabusa' does NOT stop there), then the inn's free shuttle (~15–20 min).",{car:1}),
  "kamasaki>sendai":L(0.6,0,"shinkansen","Inn shuttle to Shiroishi-Zaō (~15 min), Tōhoku Shinkansen 'Yamabiko'→Sendai (~13 min)."),
};

/* Layer 3 — region-hub estimate (last resort only) */
const HUB_LABEL={tokyo:"Tokyo",sendai:"Sendai",kanazawa:"Kanazawa",kyoto:"Kyoto/Osaka",hiroshima:"Hiroshima",fukuoka:"Hakata",kagoshima:"Kagoshima",nagasaki:"Nagasaki"};
/* Note (2026-07-26): "tokyo>fukuoka":[5,0] is the ALL-RAIL figure ('Nozomi' Hakata→Tokyo ~4h52–4h57,
 * no change) and is deliberately left ~1.5h above the flying LEGS["fukuoka>tokyo"] (3.5h). It is never
 * consulted for the fukuoka↔tokyo city pair (LEGS wins in legBetween) — only by the last-resort
 * estimate, and only for the 121 Kyushu-inn↔Kanto-inn pairs, i.e. exactly the mixed-landmass moves the
 * one-landmass rule forbids. Erring pessimistic there is the point; don't "fix" it to 3.5. */
const INTERHUB={
  "tokyo>kyoto":[2.25,0],"tokyo>sendai":[1.6,0],"tokyo>kanazawa":[2.5,0],"tokyo>hiroshima":[4,0],"tokyo>fukuoka":[5,0],
  "kyoto>kanazawa":[2.5,1],"kyoto>hiroshima":[1.8,0],"kyoto>fukuoka":[2.75,0],"kyoto>kagoshima":[4,1],
  "hiroshima>fukuoka":[1.1,0],"fukuoka>kagoshima":[1.4,0],"fukuoka>nagasaki":[1.4,1],
};
function interhub(a,b){
  if(a===b)return[0,0];
  const d=INTERHUB[a+">"+b]||INTERHUB[b+">"+a];
  if(d)return d;
  /* spine fallback: route via Kyoto */
  if(a!=="kyoto"&&b!=="kyoto"){const x=interhub(a,"kyoto"),y=interhub("kyoto",b);return[x[0]+y[0],x[1]+y[1]+1];}
  return[3.5,1];
}
function hubOf(loc){const rg=regionOfLoc(loc);return rg?REGIONS[rg].hub:"tokyo";}
/* towns that sit a long way off their region hub — keeps the last-resort estimate honest */
const LASTMILE_OVERRIDE={katsuragi:[2.0,2],amino:[2.5,1],kinosaki:[2.5,1],arima:[1.0,2],takayamaso:[1.0,2],
  setoda:[1.0,1],tomonoura:[1.0,1],unzen:[1.5,1],amakusa:[2.0,1],kakunodate:[2.0,1],wabizakura:[2.0,1],kirishima:[1.0,1],
  takachiho:[3.5,0],karatsu:[1.25,0],takeo:[1.0,0],iki:[1.6,1],yakushima:[2.5,2]};
function lastMile(loc){const h=hubOf(loc);if(loc===h)return[0,0];return LASTMILE_OVERRIDE[loc]||[0.7,1];}
function estimate(a,b){
  const ha=hubOf(a),hb=hubOf(b),lma=lastMile(a),lmb=lastMile(b),ih=interhub(ha,hb);
  const t=[Math.round((lma[0]+ih[0]+lmb[0])*4)/4, lma[1]+ih[1]+lmb[1]];
  const via=ha===hb?HUB_LABEL[ha]:`${HUB_LABEL[ha]}→${HUB_LABEL[hb]}`;
  return {t,mode:"train",flags:t[0]>5?{awkward:1}:{},text:`Estimated ≈${fmtH(t[0])} via ${via} — no researched leg for this pairing; verify before booking.`,source:"estimated"};
}
function norm(leg){return {t:leg.t||[1,0],mode:leg.mode||"train",flags:leg.flags||{},text:leg.text||"",source:leg.source||"researched",rev:false};}
function reversed(leg){const n=norm(leg);n.rev=true;n.text="Reverse of: "+n.text;return n;}
/* Cross-region corridors composed through a SHARED RESEARCHED PIVOT city instead of the crude hub
   `estimate`. When two inns sit in different regions there is rarely a single through-service, but if
   both the origin→pivot and pivot→destination legs are already researched, the real door-to-door time
   is their sum (+1 change at the pivot) — real sourced times, not a guess. Only the "you change here"
   is inferred. This is SCOPED on purpose: a general compose-through-any-shared-pivot rule would
   de-estimate ~1,100 pairs across all 14 corridors and silently overturn the deliberate "cross-region =
   estimated" model. north↔hokuriku is the one corridor asked for and the cleanest case — kanazawa is
   BOTH hokuriku's hub AND a north bookend, so every north-inn→kanazawa and kanazawa→hokuriku-inn leg is
   already researched (validate #7 guarantees the north side). Add a corridor + its pivots here to extend.
   Pivots are tried in listed order; the fastest valid composition (both halves researched) wins. */
const COMPOSE_CORRIDORS={ "hokuriku|north":["kanazawa","tokyo"] };
function _researchedHalf(a,b){                             // researched leg a→b (forward or auto-reversed), else null
  if(LEGS[a+">"+b]){const n=norm(LEGS[a+">"+b]);return n.source==="estimated"?null:n;}
  if(LEGS[b+">"+a]){const n=reversed(LEGS[b+">"+a]);return n.source==="estimated"?null:n;}
  return null;
}
function tryCompose(a,b){
  const ra=regionOfLoc(a),rb=regionOfLoc(b);
  if(!ra||!rb||ra===rb)return null;
  const pivots=COMPOSE_CORRIDORS[[ra,rb].sort().join("|")];
  if(!pivots)return null;
  let best=null;
  for(const c of pivots){
    if(c===a||c===b)continue;
    const h1=_researchedHalf(a,c),h2=_researchedHalf(c,b);
    if(!h1||!h2)continue;
    const t=[Math.round((h1.t[0]+h2.t[0])*4)/4, h1.t[1]+h2.t[1]+1];
    if(!best||t[0]<best.t[0])best={t,c};
  }
  if(!best)return null;
  const cl=HUB_LABEL[best.c]||CITY_LABEL[best.c]||cap(best.c);
  return {t:best.t,mode:"train",flags:best.t[0]>5?{awkward:1}:{},
    text:`No single through-service — the real route changes at ${cl} (≈${fmtH(best.t[0])} door-to-door). Times composed from the researched legs to and from ${cl}.`,
    source:"researched",composed:true,rev:false};
}
function legBetween(a,b){
  if(!a||!b||a===b)return {t:[0,0],mode:"train",flags:{},text:"",source:"researched",rev:false};
  if(LEGS[a+">"+b])return norm(LEGS[a+">"+b]);            // one table, forward
  if(LEGS[b+">"+a])return reversed(LEGS[b+">"+a]);        // same table, auto-reversed
  const comp=tryCompose(a,b);if(comp)return comp;         // scoped two-leg composition (real sourced times)
  return estimate(a,b);                                   // computed last resort
}
/* last stop -> airport TERMINAL (direct researched leg, or compose via the region hub). */
function airportLeg(lastLoc,code){
  const ap=AIRPORTS[code];if(!ap)return null;
  const ac=String(code).toLowerCase();   // LEGS airport keys are lowercase (e.g. "fukuoka>fuk"); code is "FUK"
  const direct=LEGS[lastLoc+">"+ac];
  if(direct)return norm(direct);
  const access=LEGS[ap.hub+">"+ac];
  if(lastLoc===ap.hub)return access?norm(access):{t:[0.8,0],mode:"bus",flags:{},text:"Airport transfer.",source:"estimated",rev:false};
  const toHub=legBetween(lastLoc,ap.hub);
  if(!access)return toHub;
  const t=[Math.round((toHub.t[0]+access.t[0])*4)/4, toHub.t[1]+access.t[1]+1];
  return {t,mode:toHub.mode,flags:Object.assign({},toHub.flags,access.flags),
    text:`${toHub.text} Then ${access.text}`,source:toHub.source==="estimated"?"estimated":"researched",rev:toHub.rev};
}
/* departure leg: last stop -> HOME at Haneda. Haneda is the fixed international departure. If the route
 * exits via another airport (Kyushu/Inland-Sea/deep-Kansai), reach that terminal, then fly the domestic
 * hop to HND. A direct LEGS[loc>hnd] (the near-Tokyo finales) short-circuits the whole thing; the +1 is
 * the ground→plane change. So every route's final leg — and the transit metric — ends at Haneda. */
function departLeg(lastLoc,code){
  const ap=AIRPORTS[code];if(!ap)return null;
  const base=airportLeg(lastLoc,code);
  if(!base||code===T.homeAirport)return base;                           // already home overland at Haneda
  const hop=LEGS[String(code).toLowerCase()+">"+T.homeAirport.toLowerCase()];
  if(!hop)return base;                                          // no modeled flight — treat airport as the end
  const h=norm(hop);
  return {t:[Math.round((base.t[0]+h.t[0])*4)/4, base.t[1]+h.t[1]+1],
    mode:"flight",flags:Object.assign({},base.flags,h.flags,{flight:1}),
    text:`${base.text} — ${h.text}`,
    source:base.source==="estimated"?"estimated":base.source,rev:base.rev};
}

/* ===================== stop helpers ===================== */
function locOf(st){return st.kind==="ryokan"?(G.RYOKANS[st.ref]?G.RYOKANS[st.ref].loc:st.ref):st.ref;}
function nameOf(st){return st.kind==="ryokan"?(G.RYOKANS[st.ref]?G.RYOKANS[st.ref].name:st.ref):(CITY_LABEL[st.ref]||cap(st.ref));}
/* short place for the stop row's sub-line: the first two comma-segments of r.where
   (e.g. "Shuzenji, Izu" from "Shuzenji, Izu, Shizuoka") — routing info only, no price */
function shortWhere(id){const r=G.RYOKANS[id];return r&&r.where?r.where.split(",").slice(0,2).map(s=>s.trim()).join(", "):"";}
function defaultNights(kind,ref){if(kind==="city"){if(ref==="kyoto")return 5;if(ref==="tokyo")return 4;if(ref==="hiroshima")return 1;return 3;}return 2;}
/* THE one place a stop is created: build it, splice it in at `at`, keep the departure airport +
   open-state consistent, persist, and re-render everything. Funnels the palette insert and the map
   detail-card "add to route" button (and was the nearby-insert's body) so no site duplicates it. */
function addStop(kind,ref,at){const ns={kind,ref,nights:defaultNights(kind,ref)};itin.stops.splice(at,0,ns);autoDepart();save();openStops.add(ns);renderAll();return ns;}

/* ===================== state ===================== */
const KEY=T.storeKey;
let itin=load();
function load(){try{const s=JSON.parse(localStorage.getItem(KEY)||"{}");s.stops=s.stops||[];s.hotels=s.hotels||{};s.saved=s.saved||{};s.archived=s.archived||{};s.routeMem=s.routeMem||{};s.arrival=s.arrival||DEF_ARR;reconcileRouteMem(s);return s;}catch(e){return {stops:[],hotels:{},saved:{},archived:{},routeMem:{},arrival:DEF_ARR};}}
/* routeMem entries are customizations OF a specific template, so each is stamped with that
   template's default signature (`base`). If the template under an id changes (e.g. the 2026-07-27
   Five Januaries swap reused ids 1–7), an unstamped or mismatched entry would silently load the
   OLD route's stops over the new template — drop it, and unlink currentRoute if its memory went
   (the live stops themselves are kept; they're the user's work, just no longer tied to a card). */
function tplSig(r){return JSON.stringify(flattenRoute(r));}
function reconcileRouteMem(s){
  const sig={};(G.ROUTES||[]).forEach(r=>{sig[r.id]=tplSig(r);});
  Object.keys(s.routeMem).forEach(id=>{const m=s.routeMem[id];if(!m||m.base!==sig[id])delete s.routeMem[id];});
  if(s.currentRoute!=null&&!s.routeMem[s.currentRoute])s.currentRoute=null;
}
function save(){try{if(itin.currentRoute!=null){itin.routeMem=itin.routeMem||{};const cr=G.ROUTES.find(x=>x.id===itin.currentRoute);itin.routeMem[itin.currentRoute]={stops:JSON.parse(JSON.stringify(itin.stops)),depart:itin.depart,base:cr?tplSig(cr):null};}localStorage.setItem(KEY,JSON.stringify(itin));}catch(e){}syncUrl();}
function isArchived(id){return !!(itin.archived&&itin.archived[id]);}
const openStops=new WeakSet();

/* ===================== format helpers ===================== */
function fmtH(h){const m=Math.round(h*12)*5;const H=Math.floor(m/60),M=m%60;return H?(M?`${H} hr ${M} min`:`${H} hr`):`${M} min`;}
function cToF(c){return Math.round(c*9/5+32);}
function fmt$(n){return "$"+(Math.round(n/50)*50).toLocaleString();}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x;}
function fmtD(d){return d.toLocaleDateString("en-US",{month:"short",day:"numeric"});}
function arrivalDate(){return new Date(itin.arrival+"T12:00:00");}

/* ===================== roll-ups ===================== */
function legsOf(stops){ // array aligned to gaps between stops (length = stops.length-1)
  const out=[];
  for(let i=1;i<stops.length;i++)out.push(legBetween(locOf(stops[i-1]),locOf(stops[i])));
  return out;
}
function legsOfTrip(){return legsOf(itin.stops);}
function depLeg(){
  if(!itin.stops.length||!itin.depart)return null;
  return departLeg(locOf(itin.stops[itin.stops.length-1]),itin.depart);
}
function allLegs(){const a=legsOfTrip();const d=depLeg();if(d)a.push(d);return a;}
function totals(){
  let h=0,x=0,aw=0,fl=0,cr=0,dr=0,ice=0;
  allLegs().forEach(L=>{if(L.t){h+=L.t[0];x+=L.t[1];}const f=L.flags||{};aw+=f.awkward||0;fl+=f.flight||0;cr+=f.car||0;dr+=f.drive||0;ice+=f.ice||0;});
  return {h:Math.round(h*2)/2,x,aw,fl,cr,dr,ice};
}
function nights(){return itin.stops.reduce((a,s)=>a+(s.nights||0),0);}
/* THE single headline-metric + transit-difficulty roll-up. Pure over (stops, depart) so a route
   template card and the live itinerary score identically — same discipline as legBetween being the
   one leg source. Consumed by transitRating(), renderSummary(), the route cards, and exportMd().
   Transit difficulty — recalibrated 2026-07 to the six Jan-4/16n baseline routes:
   score = travel-hours + 1.5·transfers (flat: a high transfer count is genuine schlepping)
           + 2·self-DRIVE days + 1·domestic flight.
   `car` (arranged taxi / hotel car / inn-shuttle last-mile) is NOT penalised — only self-drive
   rental days (LEGS `drive` flag) count. `awkward` is retired from the score (its cost already
   rides in hours+transfers). Ice-check mornings are surfaced inline per-leg, not scored.
   The departure leg always ends at Haneda (the fixed international departure): near-Tokyo finales rail
   there, far finales fly the domestic hop to HND — so the three Kyushu routes now carry a flight IN and
   a flight OUT, which is what makes them the Involved trio.
   Baseline spread (16-night routes, HND-home departure leg):
   Sun&Sea 19.5 · Deep Kyoto 23 · Loop 24 · Northwest 27.5 · Sea Line 28 · Interior 31.
   The label thresholds are set for the 16-night baseline and NORMALIZE for trip length (each ×nights/16),
   so the label reads per-day intensity: Easy ≤20 · Moderate ≤27 · Involved ≤30 · Very Involved >30.
   At 16n → Sun&Sea Easy · Deep Kyoto/Loop Moderate · Northwest/Sea Line Involved · Interior Very Involved.
   builder_test.js pins each baseline to its bucket. */
function routeMetrics(stops,depart){
  stops=stops||[];
  const legs=legsOf(stops);
  const dl=(stops.length&&depart)?departLeg(locOf(stops[stops.length-1]),depart):null;
  const all=dl?legs.concat([dl]):legs;
  let h=0,x=0,dr=0,fl=0,ice=0;
  all.forEach(L=>{if(L.t){h+=L.t[0];x+=L.t[1];}const f=L.flags||{};dr+=f.drive||0;fl+=f.flight||0;ice+=f.ice||0;});
  h=Math.round(h*2)/2;
  const n=stops.reduce((a,s)=>a+(s.nights||0),0);
  const stays=stops.length;
  const one=stops.filter(s=>(s.nights||0)===1).length;
  const rykN=stops.filter(s=>s.kind==="ryokan").reduce((a,s)=>a+(s.nights||0),0);
  const cityN=stops.filter(s=>s.kind==="city").reduce((a,s)=>a+(s.nights||0),0);
  const score=h+1.5*x+2*dr+1*fl;
  /* Label normalizes for trip length: the thresholds are set for the 16-night baseline and scale by
     nights/16, so the label reads per-DAY intensity (a longer trip dilutes the same travel; a short one
     concentrates it) rather than an absolute total. Empty/degenerate itineraries fall back to the 16n scale. */
  const Tn=(n||16)/16;
  const label=score<=20*Tn?"Easy":score<=27*Tn?"Moderate":score<=30*Tn?"Involved":"Very Involved";
  const cls=score<=20*Tn?"easy":score<=27*Tn?"mod":score<=30*Tn?"high":"vhigh";
  return {n,h,x,dr,fl,ice,stays,one,rykN,cityN,score,label,cls};
}
function transitRating(){
  const m=routeMetrics(itin.stops,itin.depart);
  const extra=[];if(m.dr)extra.push(m.dr+" drive day"+(m.dr>1?"s":""));if(m.fl)extra.push(m.fl+" flight"+(m.fl>1?"s":""));if(m.ice)extra.push(m.ice+" ice-check");
  return {label:m.label,cls:m.cls,score:m.score,breakdown:`≈${fmtH(m.h)} · ${m.x} transfers${extra.length?" · "+extra.join(" · "):""}`};
}
function selHotel(loc){const hs=G.HOTELS[loc];if(!hs)return null;return hs.find(h=>h.id===itin.hotels[loc])||hs[0];}
function stopCost(st){
  if(st.kind==="ryokan"){const p=G.PRICE[st.ref];return p?[p[0]*st.nights,p[1]*st.nights]:null;}
  const h=selHotel(st.ref);const p=h?h.rate:G.GENERIC_HOTEL;return [p[0]*st.nights,p[1]*st.nights];
}
function tripCost(){let lo=0,hi=0,miss=0;itin.stops.forEach(s=>{const c=stopCost(s);if(c){lo+=c[0];hi+=c[1];}else miss++;});return {lo,hi,miss};}
function weatherSummary(){
  if(!wxOn())return null;
  const ws=itin.stops.map(s=>G.WX[locOf(s)]).filter(Boolean);
  if(!ws.length)return null;
  const his=ws.map(w=>w[0]),los=ws.map(w=>w[1]),types=ws.map(w=>w[3]);
  const snowy=types.filter(t=>t==="snowy").length,mild=types.filter(t=>t==="mild").length;
  const ch=snowy>=ws.length/2?"cold & snowy":(mild>=ws.length/2?"mild & largely dry":"cold with snowy stretches");
  return {range:`${cToF(Math.min(...his))}–${cToF(Math.max(...his))}°F`,lo:cToF(Math.min(...los)),ch};
}
/* check-in/out per stop, computed once per (arrival, nights[]) and cached — was O(n²) (each
   stopDates(i) re-summed nights 0..i, called per stop per render). tripDates() is also the
   array the calendar/print views consume. */
let _datesCache=null,_datesKey="";
function tripDates(){
  const key=itin.arrival+"|"+(itin.stops||[]).map(s=>s.nights||0).join(",");
  if(key===_datesKey&&_datesCache)return _datesCache;
  const out=[],a=arrivalDate();let off=0;
  for(let i=0;i<(itin.stops||[]).length;i++){const ci=addDays(a,off);off+=itin.stops[i].nights||0;out.push({ci,co:addDays(a,off)});}
  _datesKey=key;_datesCache=out;return out;
}
function stopDates(i){return tripDates()[i]||{ci:arrivalDate(),co:arrivalDate()};}

/* awkwardness warning across the whole trip — banner only for genuinely burdensome legs.
   Short awkward legs (e.g. Kyoto→Kōyasan, 2.5h with a cable car) keep their inline ⚠ chip
   but don't shout at the top: banner = ≥4.5h any leg, or ≥3.5h AND flagged indirect. */
function frictionWarnings(){
  const out=[];
  legsOfTrip().forEach((L,i)=>{
    const a=itin.stops[i],b=itin.stops[i+1];
    if(L.source==="estimated")out.push(`No researched leg ${nameOf(a)} → ${nameOf(b)} — using an estimate.`);
    else if(L.t[0]>=4.5)out.push(`${nameOf(a)} → ${nameOf(b)} is a long leg (${fmtH(L.t[0])}) — plan it as a travel day.`);
    else if((L.flags&&L.flags.awkward)&&L.t[0]>=3.5)out.push(`${nameOf(a)} → ${nameOf(b)} is an indirect leg (${fmtH(L.t[0])}) — check the routing notes.`);
  });
  return out;
}

/* ===================== rendering ===================== */
const listEl=$("#list"),sumEl=$("#summary");
function renderAll(){renderSummary();renderList();renderTemplates();renderSaved();if(curView==="cal")renderCalendar();$("#notes").value=itin.notes||"";$("#arrival").value=itin.arrival;}

function renderSummary(){
  if(!itin.stops.length){sumEl.innerHTML=`<span class="note">Empty itinerary — load a template or add a stop to begin.</span>`;return;}
  const m=routeMetrics(itin.stops,itin.depart),w=weatherSummary();
  const end=addDays(arrivalDate(),m.n);
  sumEl.innerHTML=`
    <div class="metric"><span class="k">Nights</span><span class="v">${m.n}</span></div>
    <div class="metric"><span class="k">Dates</span><span class="v">${fmtD(arrivalDate())}–${fmtD(end)}</span></div>
    <div class="metric"><span class="k">Travel</span><span class="v">≈${fmtH(m.h)} <small>· ${m.x} tx${m.dr?` · ${m.dr} drive`:""}${m.fl?` · ${m.fl} flight`:""}</small></span></div>
    <div class="metric"><span class="k">Transit</span><span class="v"><span class="hass ${m.cls}">${m.label}</span></span></div>
    <div class="metric"><span class="k">Stays</span><span class="v">${m.stays} <small>${m.one?"· "+m.one+" one-night":""}</small></span></div>
    <div class="metric"><span class="k">Inn / city</span><span class="v">${m.rykN} / ${m.cityN} <small>nights</small></span></div>
    ${w?`<div class="metric"><span class="k">${T.wxLabel}</span><span class="v" style="font-size:13px">${w.range} <small>${w.ch}</small></span></div>`:""}`;
}

/* Decision-tree branch panel (renderTree/branchRow/pickBranch) archived 2026-07-05 →
   planning/archive/decision-tree-panel.js. REGIONS.leadsTo/.fill were its data and are
   kept in REGIONS as documentation of each region's default block. */

/* researched is the norm — only the exception (a computed estimate) gets a tag */
function srcChip(L){
  return L.source==="estimated"?`<span class="src estimated" title="Computed via region hubs — verify">estimated</span>`:"";
}
/* per-leg flag chips — awkward + ice-check (winter weather-risk corridor), shared by the between-stop
   connector and the departure-leg pill so both surface identically. Ice is surfaced HERE, inline on the
   specific leg, rather than as a route-level headline count. */
function legFlagsChips(L){
  const f=L.flags||{};
  const awk=f.awkward?`<span class="awk">⚠ indirect</span>`:"";
  const ice=f.ice?`<span class="ice" title="Crosses a winter weather-risk corridor (highland pass or wind-sensitive ferry) — check iHighway / ferry status the morning you travel">❄ ice-check</span>`:"";
  return `${srcChip(L)} ${awk} ${ice}`;
}
function connector(L,i){
  const a=itin.stops[i],b=itin.stops[i+1];
  const ga=G.GEO[locOf(a)],gb=G.GEO[locOf(b)];
  const maps=ga&&gb?`<a href="https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(ga)}&destination=${encodeURIComponent(gb)}" target="_blank" rel="noopener" style="font-size:11px">map ↗</a>`:"";
  return `<div class="conn" data-gap="${i}" style="--rc:${colorOfLoc(locOf(b))}">
    <button class="insert" data-ins="${i+1}" title="Insert a stop here">+</button>
    <div class="pill" title="Show / hide the routing notes">
      <span class="mode">${G.MODE[L.mode]||L.mode}</span>
      <b>≈${fmtH(L.t[0])}</b> · ${L.t[1]} transfer${L.t[1]===1?"":"s"} ${legFlagsChips(L)} ${maps}
      <span class="prose">${L.text||""}</span>
    </div></div>`;
}
/* ---- decision-aid helpers (ported from the selector) ---- */
/* OP TOP 10 / TOP 20 chip — only where the OP explicitly ranked the inn (SYNTH.op_rank).
   Hover shows his exact words. Generic "OP-reviewed" carries no chip: the review links say it. */
function opChip(id){
  const opr=id&&SY[id]&&SY[id].op_rank;if(!opr)return "";
  const q=(opr.quote||"").replace(/"/g,"&quot;");
  return `<span class="opchip" title="KI-NRT: &ldquo;${q}&rdquo;">OP top ${opr.claim==="top10"?"10":"20"}</span>`;
}
function tierBadge(r,id){
  if(!r)return "";
  /* prefer the SYNTH re-score (per-aspect synthesis layer) over the legacy thread score when present */
  const sy=(id&&SY[id])||{};
  const tier=sy.tier||r.tier,score=sy.overall!=null?sy.overall:r.score;
  const sc=tier!=="—"?`${tier} · ${score}`:"off-catalog";
  const tc=(tier==="—"||!tier)?"N":tier;   /* tier colour class — match build_catalog_html.py badge */
  return `<span class="tbadge t-${tc}">${sc}</span>${opChip(id)}`;
}
/* ---- synthesis layer (SYNTH in route-data.js): per-aspect scores+texts, summary, crowd data ---- */
const SY=G.SYNTH||{};
const ASPECTS=[["cuisine","食","Food","🍽"],["onsen","湯","Bath","♨"],["service","接","Service","🛎"],["room","室","Room","🛏"],["setting","景","Place","⛰"]];
/* onsen-access note, folded into the Bath aspect's expanded text (it used to crowd the headline) */
function onsenNote(id){const r=G.RYOKANS[id]||{},o=r.otag||r.onsen||"";return o?` <span class="onote">— Onsen access: ${o}</span>`:"";}
/* five-cell aspect strip (click a cell → that aspect's text; "expand all" → all five stacked).
   Expansion is DOM-toggled by wireAspects — ephemeral, like rykSort.
   Cells render for any aspect with a score OR real text — 36 inns carry unscored-but-written
   aspects (e.g. Gora Kadan Fuji's onsen); those show a muted — in place of the score and stay
   tappable. No score AND no text → hidden. Sorting ignores null scores. */
function astripHTML(id){
  const sy=SY[id];if(!sy||!sy.aspects)return "";
  const cells=ASPECTS.map(([k,jp,en])=>{const a=sy.aspects[k];if(!a||(a.score==null&&!a.text))return "";
    const n=a.score!=null?`<span class="an">${a.score}</span>`:`<span class="an none">—</span>`;
    return `<div class="acell" data-asp="${id}" data-k="${k}" role="button" tabindex="0"><span class="ac1"><span class="aj">${jp}</span>${n}</span><span class="al">${en}</span></div>`;}).join("");
  if(!cells)return "";
  return `<div class="asynth" data-syn="${id}">
    <div class="astriphd"><button class="aall" data-aspall="${id}">expand all ▾</button></div>
    <div class="astrip">${cells}</div>
    <div class="aexpand"></div></div>`;
}
/* one bottom line: crowd signals + review links merged (hairline above, single wrap).
   e.g.  Ikyu 4.77 (56) · TA 4.67 (3 stays, Nov 2021) · reviews: hl888 · OP  */
const shortMon=s=>String(s).replace(/([A-Z][a-z]{2})[a-z]*/,"$1");
function footLine(id){
  const sy=SY[id]||{},bits=[];
  if(sy.jp_site){const s=`${sy.jp_site.source} <b>${sy.jp_site.score}</b>${sy.jp_site.n?` (${sy.jp_site.n})`:""}`;
    bits.push(sy.jp_site.url?`<a href="${sy.jp_site.url}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${s}</a>`:s);}
  if(sy.ta&&sy.ta.mean)bits.push(`TA <b>${sy.ta.mean}</b> (${sy.ta.n} stay${sy.ta.n>1?"s":""}${sy.ta.last_stay?", "+shortMon(sy.ta.last_stay):""})`);
  const ft=ftLinks(id);
  if(ft)bits.push(ft);
  return bits.length?`<div class="rdfoot">${bits.join(" · ")}</div>`:"";
}
/* wire the aspect strips under `root` — called from wireList (stop cards) */
function wireAspects(root){
  $$("[data-asp]",root).forEach(c=>c.onclick=e=>{e.stopPropagation();
    const wrap=c.closest(".asynth"),box=$(".aexpand",wrap),sy=SY[c.dataset.asp],k=c.dataset.k;
    const was=c.classList.contains("open");
    $$(".acell",wrap).forEach(x=>x.classList.remove("open"));
    box.dataset.all="";$(".aall",wrap).textContent="expand all ▾";
    if(was){box.classList.remove("show");return;}
    c.classList.add("open");box.classList.add("show");
    /* text only — the highlighted cell above already names the aspect + score */
    box.innerHTML=`${sy.aspects[k].text||""}${k==="onsen"?onsenNote(c.dataset.asp):""}`;});
  $$("[data-aspall]",root).forEach(b=>b.onclick=e=>{e.stopPropagation();
    const wrap=b.closest(".asynth"),box=$(".aexpand",wrap),sy=SY[b.dataset.aspall];
    const open=box.classList.contains("show")&&box.dataset.all==="1";
    $$(".acell",wrap).forEach(x=>x.classList.remove("open"));
    if(open){box.classList.remove("show");box.dataset.all="";b.textContent="expand all ▾";return;}
    box.dataset.all="1";box.classList.add("show");b.textContent="collapse ▴";
    box.innerHTML=ASPECTS.map(([k,,en])=>{const a=sy.aspects[k];return a&&(a.score!=null||a.text)?`<div class="aone"><b>${en}</b> — ${a.text||""}${k==="onsen"?onsenNote(b.dataset.aspall):""}</div>`:"";}).join("");});
}
function hcatChip(c){
  if(!c)return "";
  const lab=c.stand!=null?`${c.tier} · ${c.stand.toFixed(1)}`:"opening";
  return `<span class="fchip" title="City-hotel forum standing — ${c.src}">${lab}</span>`;
}
/* FlyerTalk links. Every review link is a DIRECT-POST URL from FTPOST = [[postId,postNo],…]
   (forum/{postId}-post{postNo}.html, jumps straight to the post), labeled with the review's
   author. FT_AUTHOR maps postId→author for non-OP reviews (OP is the default; primer = post #1).
   Authors are keyed by postId, not postNo, because post numbers collide across the thread's
   different-author reviews (e.g. #133 is both KI-NRT's Iki Kairi post and Nagasaki Joe's Hanzuiryo
   post). Every catalog inn with reviews is now in FTPOST — the old FTREVIEWS page-level fallback
   is gone, so no link ever resolves to a thread page. FTREVIEWS survives only as the audit ledger
   (ryokans/audit.py cross-checks its per-inn review counts against ryokan_data.json). Sourced from
   KI-NRT's index post #512 (flyertalk.com/forum/36986165-post512.html). */
const FT_AUTHOR=G.FTAUTHOR||{};
function ftPostUrl(pid,pn){return `https://www.flyertalk.com/forum/${pid}-post${pn}.html`;}
function ftLinks(id,max){
  const lim=max||6, a=(href,lab,title)=>`<a href="${href}" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="${title}">${lab}</a>`;
  const posts=G.FTPOST&&G.FTPOST[id];
  if(posts&&posts.length){
    const shown=posts.slice(0,lim);
    return `review${posts.length>1?"s":""}: `+shown.map(([pid,pn])=>{
      const au=pn===1?"primer":(FT_AUTHOR[pid]||"OP");
      return a(ftPostUrl(pid,pn),au,`${pn===1?"OP · primer":au} — FlyerTalk post #${pn}`);
    }).join(" · ")+(posts.length>lim?` <span class="note">+${posts.length-lim} more</span>`:"");
  }
  return "";
}
/* Hotel/inn name suffix marks, authored in trip-data.js: "⤷ …" (ryokan stay /
   half board) = ryokan-style stay. Data keeps the mark; every RENDERED name strips
   it and shows a small "ryokan" chip instead. */
function nameMarks(n){n=String(n||"");return {name:n.replace(/\s*[⤴⤷].*$/,"").trim(),ryk:n.includes("⤷")};}
const rykChip=m=>m.ryk?' <span class="hmark">ryokan</span>':'';
/* Google Hotels link with the dates encoded in its protobuf ts= param (ported from the selector) */
function gmapLink(name,cityBase,ci,co){
  const gd=(tag,x)=>{const y=x.getFullYear();return [tag,7,8,(y&0x7f)|0x80,y>>7,0x10,x.getMonth()+1,0x18,x.getDate()];};
  const ds=[...gd(0x0a,ci),...gd(0x12,co)],f2=[0x12,ds.length,...ds,0x32,2,8,2],f3=[0x12,f2.length,...f2];
  const ts=btoa(String.fromCharCode.apply(null,[8,0,0x1a,f3.length,...f3,0x2a,7,0x0a,5,0x3a,3,85,83,68]));
  return `https://www.google.com/travel/search?q=${encodeURIComponent(name.replace(/ ⤴| ⤷.*$/,"")+" "+cityBase)}&ts=${encodeURIComponent(ts)}`;
}

/* ---- inn presentation: ONE renderer, compact only ----
   Tap an aspect cell to expand its text; "expand all" stacks all five. (The FULL
   always-open variant + its cardMode toggle were removed 2026-07-11 — compact won.) */
/* Photos: G.IMG carries EITHER plain URL strings (standalone page — remote IMG) or
   {src,tag} objects (the app shell's shim, sourced from the catalog's embedded store).
   Normalize to {src,tag}: tag = the manifest tag (capitalized) or the legacy positional
   Setting/Room/Bath tags for plain arrays — used only as the img alt now (no captions). */
function imgList(id){
  const im=G.IMG[id];
  const arr=Array.isArray(im)?im:(im?[im]:[]);
  const caps=["Setting","Room","Bath"];
  return arr.map((u,i)=>typeof u==="string"?{src:u,tag:caps[i]||""}:{src:u.src,tag:cap(u.tag||"")});
}
function firstThumb(id){const a=imgList(id);return a.length?a[0].src:null;}
function photoRibbon(id){
  const imgs=imgList(id);
  return imgs.length?`<div class="rphotos">${imgs.map(p=>`<figure><img src="${p.src}" alt="${p.tag}" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('figure').classList.add('failed')"></figure>`).join("")}</div>`:"";
}
/* Google-Maps link for an inn. Prefer the inn's REAL place (…/maps?cid=…), resolved from the
   inn's own site and carried in SYNTH.maps_url (source: ryokan_data.json). Only an inn with no
   catalog row falls back to a name search, which lands on the town as often as the inn. */
function innMapLink(id){
  const sy=SY[id];
  if(sy&&sy.maps_url)return sy.maps_url;
  const r=G.RYOKANS[id]||{};const seg=(r.where||"").split(",")[0].trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((r.name||"")+(seg?" "+seg:""))}`;
}
/* THE inn card — the inline stop card (the stop row already names the place). Strict order:
   header (+site·map) · meta line · photo ribbon · summary · aspects · one bottom line. */
function innCard(id){
  const r=G.RYOKANS[id];if(!r)return "";
  const price=G.PRICE[id],pn=G.PRICENOTE&&G.PRICENOTE[id];
  const sy=SY[id]||{};
  const onsen=r.onsen||r.otag||"";
  const oa=sy.aspects&&sy.aspects.onsen;
  const hasBath=!!(oa&&(oa.score!=null||oa.text));   // any rendered Bath cell carries the onsen-access tail
  const meta=[sy.rooms?`${sy.rooms} rooms`:"",price?`<b>${fmt$(price[0])}–${fmt$(price[1])}</b>/n half board`:""].filter(Boolean).join(" · ");
  const hlinks=[r.web?`<a href="${r.web}" target="_blank" rel="noopener" onclick="event.stopPropagation()">site ↗</a>`:"",
                `<a href="${innMapLink(id)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">map ↗</a>`].filter(Boolean).join(" · ");
  return `<div class="rykdetail">
    <div class="rdhead"><span class="rdname">${nameMarks(r.name).name}${rykChip(nameMarks(r.name))}</span> ${tierBadge(r,id)}<span class="rdsite">${hlinks}</span></div>
    <div class="rdmeta">${meta}${pn?` · ${pn}`:""}${!hasBath&&onsen?` <span class="rdonsen">· Onsen access: ${onsen}</span>`:""}</div>
    ${photoRibbon(id)}
    <div class="rdblurb">${sy.summary||r.blurb||""}</div>
    ${astripHTML(id)}
    ${footLine(id)}
  </div>`;
}
/* shortlist bridge: builder_keys starred in the catalog (localStorage "shortlist", written by the
   catalog page / app Catalog tab). Read fresh per render; absent/garbled key → empty set. */
function shortlistSet(){try{const a=JSON.parse(localStorage.getItem("shortlist")||"[]");return new Set(Array.isArray(a)?a:[]);}catch(e){return new Set();}}
let rykSort="score";      // "score" | "transit" — picker ordering (ephemeral)
let rykDetour=0;          // swap-grid detour filter, hours of round-trip Σ (0 = any; ephemeral, like rykSort)
let tplCollapsed=null;    // templates drawer override (ephemeral); null = derive from itin.stops
/* (The side-by-side compare modal — cmpSel/compareInns/detailDlg — was removed 2026-07-11:
   redundant next to the app's Catalog tab.) */
/* swap grid of every inn in this stop's region (click to swap; sort + detour filter in the header) */
function rykCompare(st,idx){
  const region=regionOfLoc(locOf(st));if(!region)return "";
  const rg=REGIONS[region];
  const ids=rg.ryokans.filter(id=>G.RYOKANS[id]);
  /* transit to the neighbouring stops — computed once per distinct loc (all inns at a loc share it).
     Boundaries: first stop shows the leg from Haneda (✈, display-only); last stop uses the departLeg,
     so its number matches the departure pill below. */
  const prevSt=itin.stops[idx-1], nextSt=itin.stops[idx+1];
  const prevLoc=prevSt?locOf(prevSt):null, nextLoc=nextSt?locOf(nextSt):null;
  const trMemo={};
  const trOf=l=>trMemo[l]||(trMemo[l]={
    in:  prevLoc?legBetween(prevLoc,l):airportLeg(l,T.arriveAirport),
    out: nextLoc?legBetween(l,nextLoc):(itin.depart?departLeg(l,itin.depart):null),
  });
  const trTotal=l=>{const x=trOf(l);return (x.in?x.in.t[0]:0)+(x.out?x.out.t[0]:0);};
  const trLine=l=>{
    const x=trOf(l);
    const seg=(L,pre)=>L?`${pre} ${L.source==="estimated"?"~":""}${fmtH(L.t[0])}`:"";
    const parts=[seg(x.in,prevLoc?"←":"✈"),seg(x.out,nextLoc?"→":"→✈")].filter(Boolean);
    if(!parts.length)return "";
    if(x.in&&x.out){const est=x.in.source==="estimated"||x.out.source==="estimated";const r1=v=>Math.round(v*10)/10;parts.push(`<b>Σ ${est?"~":""}${fmtH(r1(x.in.t[0])+r1(x.out.t[0]))}</b>`);}  // sum the displayed (rounded) legs so the line adds up
    const tip=[x.in?`from ${prevSt?nameOf(prevSt):"Haneda"}: ${x.in.t[1]} transfer${x.in.t[1]===1?"":"s"}`:"",
               x.out?`to ${nextSt?nameOf(nextSt):"Haneda"}: ${x.out.t[1]} transfer${x.out.t[1]===1?"":"s"}`:""].filter(Boolean).join(" · ");
    return `<span class="otr" title="${tip}">${parts.join(" · ")}</span>`;
  };
  /* grouped: under an area header, the per-card location line is redundant — drop it */
  const SL=shortlistSet();   // catalog ★ picks — pinned to the top of their area group
  /* selector card: thumb | name + tier·score (+OP chip) / aspect glyph row / muted JP·where·transit.
     Price, onsen tag and the generic OP star deliberately absent — they live in the detail card. */
  const card=(id,grouped)=>{
    const o=G.RYOKANS[id],sel=id===st.ref,arch=isArchived(id)&&!sel;
    const thumb=firstThumb(id);   // first image's src, either IMG shape
    const trInline=grouped?'':trLine(o.loc);
    const sy=SY[id]||{},t=sy.tier||o.tier,s=sy.overall!=null?sy.overall:o.score;
    const gspans=sy.aspects?ASPECTS.map(([k,,en,ico])=>{const a=sy.aspects[k];
      return a&&a.score!=null?`<span title="${en} — ${k}">${ico} ${a.score}</span>`:"";}).filter(Boolean):[];
    const glyphs=gspans.length?`<div class="aglyphs">${gspans.join("<i>·</i>")}</div>`:"";
    /* ONE rating line: scored inns show the aspect icon row; only the off-catalog inns
       (no scored aspects) fall back to the bare JP crowd score. */
    const sub=[(!gspans.length&&sy.jp_site)?`<span class="agjp">JP ${sy.jp_site.score}</span>`:"",(!grouped&&o.where)?o.where:"",trInline].filter(Boolean).join(" · ");
    return `<div class="opt ${sel?'sel':''} ${arch?'archived':''}" data-swap="${id}" data-idx="${idx}" role="button" tabindex="0">
      <button class="archbtn" data-arch="${id}" title="${isArchived(id)?'Restore':'Set aside — minimise &amp; move to bottom'}">${isArchived(id)?'↑':'↓'}</button>
      <div class="othumb"${thumb?` style="background-image:url('${thumb}')"`:""}></div>
      <div class="oinfo">
        <div class="oh"><span class="on">${SL.has(id)?'<span class="slstar" title="Shortlisted in the catalog">★</span> ':''}${nameMarks(o.name).name}${rykChip(nameMarks(o.name))}</span><span class="osc">${t!=="—"?t+'·'+s:'—'}</span>${opChip(id)}</div>
        ${glyphs}
        ${sub?`<div class="osub">${sub}</div>`:""}
      </div></div>`;
  };
  let active=ids.filter(id=>!isArchived(id)||id===st.ref);
  const archived=ids.filter(id=>isArchived(id)&&id!==st.ref);
  /* detour filter — the SAME per-loc round-trip Σ the area headers show (trTotal). The
     selected/current inn always stays visible; area groups that empty out vanish with it. */
  const preN=active.length;
  if(rykDetour>0)active=active.filter(id=>id===st.ref||trTotal(G.RYOKANS[id].loc)<=rykDetour);
  const fltLine=rykDetour>0?`<div class="fltnote">${active.length} of ${preN} inns · detour ≤ ${fmtH(rykDetour)}</div>`:"";
  /* sort BEFORE grouping so the per-area lists reflect the chosen order too. Array.sort is stable,
     so ties keep the score order the ids already carry.
     - transit: ascending by in+out hours (all inns at a loc share it)
     - aspect/jp (SYNTH): descending by that aspect's synthesized score / the JP crowd score; missing → bottom */
  const sval=id=>{const sy=SY[id]||{};
    if(rykSort==="jp")return sy.jp_site?sy.jp_site.score:-1;
    const a=sy.aspects&&sy.aspects[rykSort];return a&&a.score!=null?a.score:-1;};
  if(rykSort==="transit")active.sort((a,b)=>trTotal(G.RYOKANS[a].loc)-trTotal(G.RYOKANS[b].loc));
  else if(rykSort!=="score")active.sort((a,b)=>sval(b)-sval(a));
  /* pin shortlisted inns first — a stable partition BEFORE grouping, so within every area group
     (and in flat regions) the ★ inns lead while the chosen sort order holds inside each half */
  if(SL.size){const p=active.filter(id=>SL.has(id));if(p.length&&p.length<active.length)active.splice(0,active.length,...p,...active.filter(id=>!SL.has(id)));}
  /* group active inns by onsen area, ordered geographically by the region's declared locs;
     only show area headers when an area actually clusters (≥2 inns) — sparse regions stay flat */
  const byArea={};active.forEach(id=>{const l=G.RYOKANS[id].loc;(byArea[l]=byArea[l]||[]).push(id);});
  const areas=[...(rg.locs||[]),...Object.keys(byArea)].filter((l,i,a)=>byArea[l]&&a.indexOf(l)===i);
  /* Decide grouped from the region's FULL inn set, not the post-archive `active` one — otherwise setting
     aside a member of the last remaining 2-inn cluster collapses the whole region from grouped→flat. */
  const clusterN={};ids.forEach(id=>{const l=G.RYOKANS[id].loc;clusterN[l]=(clusterN[l]||0)+1;});
  const grouped=Object.values(clusterN).some(n=>n>=2);
  if(rykSort==="transit")areas.sort((a,b)=>trTotal(a)-trTotal(b));
  else if(rykSort!=="score")areas.sort((a,b)=>Math.max(...byArea[b].map(sval))-Math.max(...byArea[a].map(sval)));
  let body=grouped
    ? areas.map(l=>{const tr=trLine(l);/* transit cluster sits inline next to the name — no push-right */
        return `<div class="areahd">${cap(l)} · ${byArea[l].length} inn${byArea[l].length>1?'s':''}${tr?` — ${tr}`:''}</div>`+byArea[l].map(id=>card(id,true)).join("");}).join("")
    : active.map(id=>card(id,false)).join("");
  body+=archived.length?`<div class="setaside">Set aside · ${archived.length}</div>`+archived.map(id=>card(id,false)).join(""):"";
  const SORTKEYS=[["score","score"],["transit","transit"],["cuisine","food"],["onsen","bath"],["service","service"],["room","room"],["setting","place"],["jp","JP crowd"]];
  const sortTog=`<span class="sortctl">sort <select data-rsort>${SORTKEYS.map(([k,l])=>`<option value="${k}"${rykSort===k?" selected":""}>${l}</option>`).join("")}</select></span>`;
  const DETOURS=[[0,"any detour"],[3,"≤ 3h"],[4,"≤ 4h"],[6,"≤ 6h"]];
  const detTog=`<span class="sortctl">detour <select data-rdetour>${DETOURS.map(([v,l])=>`<option value="${v}"${rykDetour===v?" selected":""}>${l}</option>`).join("")}</select></span>`;
  return `<div class="cmplabel">${sortTog}${detTog}Compare &amp; swap — ${rg.ryokans.length} inns in ${rg.label} <span class="note">(transit recomputes)</span></div><div class="opts">${fltLine}${body}</div>`;
}
/* city stops: optional city swap (if the region has >1 city) + rich hotel picker */
function citySwap(st,idx){
  const region=regionOfLoc(locOf(st));if(!region)return "";
  const rg=REGIONS[region];if(rg.cities.length<=1)return "";
  const opts=rg.cities.map(loc=>`<button class="swapopt cty ${loc===st.ref?"on":""}" data-swapcity="${loc}" data-idx="${idx}">${CITY_LABEL[loc]||cap(loc)}</button>`).join("");
  return `<div class="cmplabel">Swap city — ${rg.label}</div><div class="swaprow">${opts}</div>`;
}
function hotelPicker(st,i){
  const loc=st.ref,hs=G.HOTELS[loc];
  const cityBlurb=(G.CITYINFO&&G.CITYINFO[loc])?`<div class="cityblurb">${G.CITYINFO[loc]}</div>`:"";
  if(!hs||!hs.length)return cityBlurb+`<div class="note" style="margin-top:6px">Hotel TBD — budgeted ${fmt$(G.GENERIC_HOTEL[0])}–${fmt$(G.GENERIC_HOTEL[1])}/n.</div>`;
  const d=stopDates(i),cur=selHotel(loc),cityBase=(CITY_LABEL[loc]||loc).split(" ")[0];
  const sorted=[...hs].sort((a,b)=>(a.rate[0]+a.rate[1])-(b.rate[0]+b.rate[1]));
  /* labeled-row hotel card, mirroring the catalog's hrow treatment: header (name + standing
     chip + rate/n + area), then The draw / The catch / Standing rows, a stayed quote, links. */
  const SAVED_RE=/\s*\([^)]*saved list ✓\)\s*$/;   // authored suffix — stripped at render, no chip
  /* o.map = the hotel's real Google place, read off its own site; the name+city search is the
     fallback for the chains whose sites embed no map (accurate enough for a branded hotel). */
  const hMap=o=>o.map||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.name.replace(/\s*[⤴⤷].*$/,"").trim()+" "+cityBase)}`;
  const hlrow=(lab,body)=>`<div class="hlrow"><span class="hlab">${lab}</span><p class="hlval">${body}</p></div>`;
  const card=(o)=>{
    const sel=cur&&o.id===cur.id,arch=isArchived(o.id)&&!sel;
    const why=(o.why||"").replace(SAVED_RE,"");
    const rows=[
      why?hlrow("The draw",why):"",
      o.insight?hlrow("The catch",`${o.insight}${o.isrc?` <span class="isrc">${o.isrc}</span>`:""}`):"",
      o.cat&&o.cat.note?hlrow("Standing",`${o.cat.note}${o.cat.src?` <span class="isrc">${o.cat.src}</span>`:""}`):"",
    ].filter(Boolean).join("");
    const links=[
      o.url?`<a href="${o.url}" target="_blank" rel="noopener" onclick="event.stopPropagation()">site ↗</a>`:"",
      `<a href="${hMap(o)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">map ↗</a>`,
      `<a href="${gmapLink(o.name,cityBase,d.ci,d.co)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="Google Hotels, these dates">rates ↗</a>`,
    ].filter(Boolean).join(" · ");
    return `<div class="opt hotel ${sel?'sel':''} ${arch?'archived':''}" data-hotel="${o.id}" data-loc="${loc}" role="button" tabindex="0">
      <button class="archbtn" data-arch="${o.id}" title="${isArchived(o.id)?'Restore':'Set aside — minimise &amp; move to bottom'}">${isArchived(o.id)?'↑':'↓'}</button>
      <div class="oh"><span class="on">${nameMarks(o.name).name}${rykChip(nameMarks(o.name))}${hcatChip(o.cat)}</span><span class="osc">${fmt$(o.rate[0])}–${fmt$(o.rate[1])}/n</span></div>
      ${o.area?`<div class="om">${o.area}</div>`:""}
      ${rows?`<div class="hlrows">${rows}</div>`:""}
      ${o.taquote?`<blockquote class="hquote">${o.taquote} <span class="isrc">TripAdvisor · stayed</span></blockquote>`:""}
      <div class="oa links">${links}</div></div>`;
  };
  const active=sorted.filter(o=>!isArchived(o.id)||(cur&&o.id===cur.id));
  const archived=sorted.filter(o=>isArchived(o.id)&&!(cur&&o.id===cur.id));
  const body=active.map(card).join("")+(archived.length?`<div class="setaside">Set aside · ${archived.length}</div>`+archived.map(card).join(""):"");
  return `${cityBlurb}<div class="cmplabel">Hotels — ${sorted.length} picks for ${CITY_LABEL[loc]||cap(loc)}, by price <span class="note">(forum standing where known)</span></div><div class="opts hotels">${body}</div>`;
}
function stopCard(st,i){
  const isR=st.kind==="ryokan";
  const w=wxOn()?G.WX[locOf(st)]:null;
  const wc=w?`<span class="wchip ${w[3]}" title="${w[2]}">${cToF(w[0])}°/${cToF(w[1])}°F</span>`:"";
  const d=stopDates(i);
  const open=openStops.has(st);
  /* sub-line is routing only — dates + short place (city: dates + the selected hotel);
     cost never rides on a stop row */
  const cityHotel=isR?null:selHotel(st.ref);
  const sub=isR?`${fmtD(d.ci)}–${fmtD(d.co)}${shortWhere(st.ref)?` · ${shortWhere(st.ref)}`:""}`
             :`${fmtD(d.ci)}–${fmtD(d.co)} · ${cityHotel?nameMarks(cityHotel.name).name:"pick a hotel"}`;
  return `<div class="stop ${open?"open":""}" draggable="true" data-idx="${i}" style="--rc:${colorOfLoc(locOf(st))}">
    <div class="shead">
      <span class="grip" title="Drag to reorder">⠿</span>
      <span class="ix">${String(i+1).padStart(2,"0")}</span>
      <span class="nm">${nameOf(st)}<small>${sub}</small></span>
      <span class="kindtag ${isR?"r":"c"}">${isR?"ryokan":"city"}</span>
      ${wc}
      <button class="tgl" data-toggle="${i}" title="Details / swap">${open?"close ▴":"details ▾"}</button>
      <span class="nctl">
        <button class="nstep" data-act="dec" data-idx="${i}" ${st.nights<=1?"disabled":""}>−</button>
        <span class="nval">${st.nights}<span class="nu">n</span></span>
        <button class="nstep" data-act="inc" data-idx="${i}" ${st.nights>=14?"disabled":""}>+</button>
      </span>
      <button class="iconbtn x" data-del="${i}" title="Remove stop">×</button>
    </div>
    <div class="sbody">
      ${isR?innCard(st.ref)+rykCompare(st,i):citySwap(st,i)+hotelPicker(st,i)}
    </div>
  </div>`;
}
function endRow(){
  if(!itin.stops.length)return "";
  const codes=departsFor(locOf(itin.stops[itin.stops.length-1]));   // per-stop menu (incl. per-loc extras, e.g. Yufuin→OIT)
  const dl=depLeg();
  const btns=codes.map(c=>`<button class="depopt ${itin.depart===c?"on":""}" data-dep="${c}" title="${c===T.homeAirport?`Overland to ${apLabel(T.homeAirport)}`:`Fly ${c}→${T.homeAirport}`}">${c===T.homeAirport?`Rail to ${T.homeAirport}`:AIRPORTS[c].label+" ✈"}</button>`).join("");
  /* The leg home renders as a full pill — same mode/hours/transfers/prose/chips as any between-stop
     connector — because its time is counted like any other leg (routeMetrics includes it). Every option
     terminates at Haneda (the fixed international departure); a non-HND choice appends the domestic flight. */
  const pill=(dl&&itin.depart)?`<div class="conn dep" style="--rc:var(--ink)">
    <div class="pill" title="Show / hide the routing notes">
      <span class="mode">${G.MODE[dl.mode]||dl.mode}</span>
      <b>≈${fmtH(dl.t[0])}</b> · ${dl.t[1]} transfer${dl.t[1]===1?"":"s"} ${legFlagsChips(dl)}
      <span class="prose">${dl.text||""} <b>🏠 Home — international flight departs ${apLabel(T.homeAirport)}.</b></span>
    </div></div>`:"";
  return `<div class="endrow"><span class="lbl">Home to ${apLabel(T.homeAirport)} via:</span><div class="depbtns">${btns}</div></div>${pill}`;
}
function renderList(){
  if(!itin.stops.length){listEl.innerHTML=`<div class="empty">No stops yet. Load a template, or <button class="btn ghost sm" id="addFirst">+ add a stop</button>.</div>`;const af=$("#addFirst");if(af)af.onclick=()=>openPalette(0);if(curView==="map")renderMapView();return;}
  /* warnings */
  const warns=frictionWarnings();const wb=$("#warnbox");
  if(warns.length){wb.classList.add("show");wb.innerHTML="⚠ "+warns.join("<br>⚠ ");}else wb.classList.remove("show");
  const legs=legsOfTrip();
  let html='<div class="stoplist">';
  itin.stops.forEach((st,i)=>{
    if(i>0)html+=connector(legs[i-1],i-1);
    html+=stopCard(st,i);
  });
  html+='</div>';
  html+=endRow();
  html+=`<div class="addbar"><button class="btn ghost sm" data-ins="${itin.stops.length}">+ add a stop at the end</button></div>`;
  listEl.innerHTML=html;
  wireList();
  if(curView==="map")renderMapView();   // the Map view tracks every list re-render
}
function wireList(){
  $$("[data-toggle]",listEl).forEach(b=>b.onclick=()=>{const st=itin.stops[+b.dataset.toggle];if(openStops.has(st))openStops.delete(st);else openStops.add(st);renderList();});
  $$(".nstep",listEl).forEach(b=>b.onclick=()=>{const i=+b.dataset.idx;itin.stops[i].nights=Math.max(1,Math.min(14,itin.stops[i].nights+(b.dataset.act==="inc"?1:-1)));save();renderSummary();renderList();renderTemplates();});
  $$("[data-del]",listEl).forEach(b=>b.onclick=()=>{itin.stops.splice(+b.dataset.del,1);autoDepart();save();renderAll();});
  $$("[data-swap]",listEl).forEach(b=>b.onclick=()=>{const st=itin.stops[+b.dataset.idx];st.ref=b.dataset.swap;delete itin.archived[b.dataset.swap];openStops.add(st);save();renderAll();});
  $$("[data-swapcity]",listEl).forEach(b=>b.onclick=()=>{const st=itin.stops[+b.dataset.idx];st.ref=b.dataset.swapcity;openStops.add(st);save();renderAll();});
  $$("[data-hotel]",listEl).forEach(b=>b.onclick=()=>{delete itin.archived[b.dataset.hotel];itin.hotels[b.dataset.loc]=b.dataset.hotel;save();renderList();renderSummary();});
  $$("[data-arch]",listEl).forEach(b=>b.onclick=(e)=>{e.stopPropagation();const id=b.dataset.arch;itin.archived=itin.archived||{};if(itin.archived[id])delete itin.archived[id];else itin.archived[id]=true;save();renderList();});
  /* C3: compare controls inside the swap grid (stop clicks bubbling into a swap) */
  $$("select[data-rsort]",listEl).forEach(s=>{s.onclick=e=>e.stopPropagation();s.onchange=e=>{e.stopPropagation();rykSort=s.value;renderList();};});
  $$("select[data-rdetour]",listEl).forEach(s=>{s.onclick=e=>e.stopPropagation();s.onchange=e=>{e.stopPropagation();rykDetour=+s.value||0;renderList();};});
  wireAspects(listEl);
  $$("[data-ins]",listEl).forEach(b=>b.onclick=()=>openPalette(+b.dataset.ins));
  $$(".conn .pill",listEl).forEach(p=>p.onclick=e=>{if(e.target.tagName==="A"||e.target.classList.contains("insert"))return;p.closest(".conn").classList.toggle("show");});
  $$("[data-dep]",listEl).forEach(b=>b.onclick=()=>{itin.depart=b.dataset.dep;itin._depLoc=locOf(itin.stops[itin.stops.length-1]);save();renderSummary();renderList();renderTemplates();});
  wireDrag(listEl,".stop");
}
/* Shared drag-reorder wiring for a container of index-carrying rows (data-idx). Reorders itin.stops
   by moving the dragged index to the drop index, then autoDepart/save/renderAll — the same re-render
   that redraws the map. Used by the List (.stop rows) and the Map view's stops rail (.maprow-stop). */
function wireDrag(container,rowSel){
  if(!container)return;
  let dragIdx=null;
  $$(rowSel,container).forEach(card=>{
    card.addEventListener("dragstart",e=>{dragIdx=+card.dataset.idx;card.classList.add("dragging");e.dataTransfer.effectAllowed="move";});
    card.addEventListener("dragend",()=>{dragIdx=null;$$(rowSel,container).forEach(c=>c.classList.remove("dragging","dragover"));});
    card.addEventListener("dragover",e=>{e.preventDefault();card.classList.add("dragover");});
    card.addEventListener("dragleave",()=>card.classList.remove("dragover"));
    card.addEventListener("drop",e=>{e.preventDefault();const to=+card.dataset.idx;if(dragIdx==null||dragIdx===to)return;const[m]=itin.stops.splice(dragIdx,1);itin.stops.splice(to,0,m);autoDepart();save();renderAll();});
  });
}

/* keep departure valid for the current last stop's region */
/* The nearest / most-logical departure airport for a SPECIFIC last stop. Ranks by hassle-hours
   (door-to-HND hours + ½·transfers, so a nearer airport with fewer changes wins a tie — e.g. Kumamoto
   defaults to its own KMJ, not FUK; Unzen to NGS, not KMJ). Two temperings: a per-loc override wins
   outright (Yakushima→KOJ); and overland rail-to-HND is kept unless a flight clearly wins (saves ≥1.5
   hassle-hours), so a clean-Shinkansen finale like Kyoto rails home while a remote one (Kinosaki) or any
   Kyushu inn flies from its nearest airport. */
function bestDepart(loc){
  const codes=departsFor(loc);
  const ov=HOME_AIRPORT_OVERRIDE[loc];
  if(ov&&codes.includes(ov))return ov;
  const score=c=>{const d=departLeg(loc,c);return d?d.t[0]+0.5*d.t[1]:Infinity;};
  let best=codes[0],bs=Infinity;
  codes.forEach(c=>{const s=score(c);if(s<bs){bs=s;best=c;}});
  if(codes.includes(T.homeAirport)&&best!==T.homeAirport&&score(T.homeAirport)-bs<1.5)best=T.homeAirport;   // prefer clean rail unless flying clearly wins
  return best;
}
/* Keep the departure airport tracking the current LAST stop. Recompute the nearest default whenever the
   finishing stop changes (or the current pick is invalid there); an explicit airport choice for the SAME
   finale is preserved — the [data-dep] click stamps itin._depLoc so this guard honours it. */
function autoDepart(){
  if(!itin.stops.length){itin.depart=null;itin._depLoc=null;return;}
  const last=locOf(itin.stops[itin.stops.length-1]);
  if(itin.depart&&departsFor(last).includes(itin.depart)&&itin._depLoc===last)return;
  itin.depart=bestDepart(last);
  itin._depLoc=last;
}

/* ===================== palette ===================== */
const palDlg=$("#palDlg");
function openPalette(insertAt){
  palDlg.dataset.at=insertAt;
  $("#palTitle").textContent=insertAt>=itin.stops.length?"Add a stop at the end":"Insert a stop";
  let html="";
  REGION_ORDER.forEach(key=>{
    const rg=REGIONS[key];
    const cityOpts=rg.cities.filter(l=>CITY_PALETTE.has(l)).map(loc=>`<button class="palopt" data-kind="city" data-ref="${loc}"><span class="pk" style="background:#19191a"></span>${CITY_LABEL[loc]||cap(loc)}</button>`).join("");
    /* Show every swappable inn in the region (derived rg.ryokans, already minus BUILDER_HIDE, sorted by
       standing) — same source as the in-stop swap grid, so an inn added to RYOKANS appears here too. (Was
       gated on RYK_PALETTE = route-referenced inns only, which hid newly added catalog inns from the palette.) */
    const rykOpts=rg.ryokans.filter(id=>G.RYOKANS[id]).map(id=>{const r=G.RYOKANS[id],sy=(G.SYNTH||{})[id]||{},t=sy.tier||r.tier,s=sy.overall!=null?sy.overall:r.score;return `<button class="palopt" data-kind="ryokan" data-ref="${id}"><span class="pk" style="background:var(--rc)"></span>${r.name}<small>${t&&t!=="—"?t+"·"+s:r.where}</small></button>`;}).join("");
    if(cityOpts||rykOpts)html+=`<div class="palgroup" style="--rc:${REGION_COLOR[key]||'#19191a'}"><h4><span class="jp">${rg.kanji}</span>${rg.label}</h4><div class="palopts">${cityOpts}${rykOpts}</div></div>`;
  });
  $("#palBody").innerHTML=html;
  $$(".palopt",$("#palBody")).forEach(b=>b.onclick=()=>{
    const at=+palDlg.dataset.at,kind=b.dataset.kind,ref=b.dataset.ref;
    addStop(kind,ref,at);palDlg.close();
  });
  palDlg.showModal();
}
$("#palClose").onclick=()=>palDlg.close();

/* ===================== templates & saved ===================== */
function flattenRoute(r){
  const v=variantsOf(r)[0];
  const stops=v.segs.map(s=>s.type==="city"?{kind:"city",ref:s.loc,nights:s.nights}:{kind:"ryokan",ref:s.ryk,nights:s.nights});
  const dep=(v.dep||r.dep||[])[0];
  let code=dep&&AIRPORTS[dep.code]?dep.code:null;
  return {stops,code};
}
function routeCustomized(r){const m=itin.routeMem&&itin.routeMem[r.id];if(!m)return false;return JSON.stringify(m.stops)!==JSON.stringify(flattenRoute(r).stops);}
function loadRouteDefaults(r){const f=flattenRoute(r);itin.stops=f.stops;if(f.code){itin.depart=f.code;itin._depLoc=f.stops.length?locOf(f.stops[f.stops.length-1]):null;}}
/* compact headline-metric strip on each route card — the settled comparison frame, so routes are
   comparable before loading. Same routeMetrics() the summary bar uses; driving days ride with transit. */
function routeChips(r){
  /* Reflect what this card represents RIGHT NOW: the ACTIVE route mirrors the live itinerary (identical
     inputs to renderSummary, so its chip always matches the headline even after edits); a customized-but-
     inactive route shows its saved memory; a pristine route shows its defaults. */
  let stops,code;
  if(itin.currentRoute===r.id){stops=itin.stops;code=itin.depart;}
  else{const mem=itin.routeMem&&itin.routeMem[r.id],f=flattenRoute(r);stops=mem?mem.stops:f.stops;code=(mem&&mem.depart)||f.code;}
  const m=routeMetrics(stops,code);
  return `${m.n}n · ≈${fmtH(m.h)}/${m.x}tx${m.dr?` · ${m.dr} drive`:""}${m.fl?` · ${m.fl} flight`:""} · ${m.stays} stays · ${m.rykN}/${m.cityN} inn·city · <span class="hass ${m.cls}" style="font-size:10px;padding:1px 5px">${m.label}</span>`;
}
function renderTemplates(){
  /* Templates drawer: once an itinerary exists the card collapses to a one-line
     "Templates ▾" bar (auto-expanded while empty; a click toggles, ephemeral).
     The freed sidebar space is reserved for the upcoming map panel. */
  const collapsed=tplCollapsed==null?itin.stops.length>0:tplCollapsed;
  const tplCard=$("#tplCard"),tplBody=$("#tplBody"),tplTg=$("#tplToggle");
  if(tplCard&&tplBody&&tplTg){
    tplCard.classList.toggle("tplclosed",collapsed);
    tplBody.style.display=collapsed?"none":"";
    const caret=$(".tplcaret",tplTg);if(caret)caret.textContent=collapsed?"▾":"▴";
    tplTg.onclick=()=>{tplCollapsed=!collapsed;renderTemplates();};
  }
  const box=$("#templates");
  let html=`<button class="tpl" data-tpl="blank"><b>Blank · just Tokyo</b><small>start from scratch</small></button>`;
  G.ROUTES.forEach(r=>{const cz=routeCustomized(r);html+=`<button class="tpl" data-tpl="${r.id}"><b>${r.title}</b><small>${variantsOf(r)[0].tagline||r.tagline||""}</small><span class="tplmeta">${routeChips(r)}</span>${cz?`<span class="tplreset" data-reset="${r.id}" title="Discard your changes and restore this route's default inns">↺ reset to defaults</span>`:""}</button>`;});
  box.innerHTML=html;
  $$("[data-reset]",box).forEach(s=>s.onclick=e=>{e.stopPropagation();const id=+s.dataset.reset;if(itin.routeMem)delete itin.routeMem[id];const r=G.ROUTES.find(x=>x.id===id);if(itin.currentRoute===id){loadRouteDefaults(r);autoDepart();}save();renderAll();});
  $$(".tpl",box).forEach(b=>b.onclick=()=>{
    if(b.dataset.tpl==="blank"){itin.stops=[{kind:"city",ref:"tokyo",nights:4}];itin.hotels={};itin.currentRoute=null;}
    else{const id=+b.dataset.tpl,r=G.ROUTES.find(x=>x.id===id),m=itin.routeMem&&itin.routeMem[id];
      if(m){itin.stops=JSON.parse(JSON.stringify(m.stops));if(m.depart){itin.depart=m.depart;itin._depLoc=m.stops.length?locOf(m.stops[m.stops.length-1]):null;}}
      else loadRouteDefaults(r);
      itin.currentRoute=id;}
    openStops.clear?null:0;autoDepart();save();renderAll();
  });
}
function renderSaved(){
  const box=$("#saved");const names=Object.keys(itin.saved||{});
  box.innerHTML=names.length?names.map(n=>`<span class="swapopt" style="cursor:default">${n} <a href="#" data-load="${n}">load</a> · <a href="#" data-rm="${n}" title="Delete this saved itinerary">×</a></span>`).join(""):`<span class="note">No saved itineraries yet.</span>`;
  $$("[data-load]",box).forEach(a=>a.onclick=e=>{e.preventDefault();const s=itin.saved[a.dataset.load];itin.stops=JSON.parse(JSON.stringify(s.stops));itin.depart=s.depart;itin._depLoc=s.stops.length?locOf(s.stops[s.stops.length-1]):null;itin.hotels=s.hotels||{};itin.currentRoute=null;save();renderAll();});
  $$("[data-rm]",box).forEach(a=>a.onclick=e=>{e.preventDefault();delete itin.saved[a.dataset.rm];save();renderSaved();});
}
$("#saveBtn").onclick=()=>{const n=prompt("Name this itinerary:");if(!n)return;itin.saved[n]={stops:JSON.parse(JSON.stringify(itin.stops)),depart:itin.depart,hotels:Object.assign({},itin.hotels)};save();renderSaved();};

/* ===================== export ===================== */
function exportMd(){
  if(!itin.stops.length)return "Empty itinerary.";
  const m=routeMetrics(itin.stops,itin.depart),w=weatherSummary();
  let md=`# ${T.exportTitle}\n\n`;
  md+=`**${m.n} nights** · ${fmtD(arrivalDate())} → ${fmtD(addDays(arrivalDate(),m.n))} · ≈${fmtH(m.h)} travel, ${m.x} transfers${m.dr?`, ${m.dr} drive day${m.dr>1?"s":""}`:""}${m.fl?`, ${m.fl} flight${m.fl>1?"s":""}`:""} · transit **${m.label}** · ${m.stays} stays · ${m.rykN}/${m.cityN} inn·city nights${w?` · ${T.wxAbbr} ${w.range}, ${w.ch}`:""}\n\n`;
  const legs=legsOfTrip();
  itin.stops.forEach((st,i)=>{
    if(i>0){const Lg=legs[i-1];md+=`   ↓ _${G.MODE[Lg.mode]||Lg.mode}, ≈${fmtH(Lg.t[0])}, ${Lg.t[1]} transfer${Lg.t[1]===1?"":"s"}${Lg.source==="estimated"?" (estimated)":""}_ — ${Lg.text}\n`;}
    const d=stopDates(i);
    md+=`${i+1}. **${nameOf(st)}** (${st.kind}) — ${st.nights}n · ${fmtD(d.ci)}–${fmtD(d.co)}\n`;
    if(st.kind==="city"){const h=selHotel(st.ref);if(h)md+=`     hotel: ${nameMarks(h.name).name}\n`;}
  });
  const dl=depLeg();
  if(dl&&itin.depart)md+=`   ↓ _${G.MODE[dl.mode]||dl.mode}, ≈${fmtH(dl.t[0])}, ${dl.t[1]} transfer${dl.t[1]===1?"":"s"}${dl.source==="estimated"?" (estimated)":""}_ — ${dl.text}\n🏠 **Home — international flight departs ${apLabel(T.homeAirport)}**${itin.depart!==T.homeAirport?` (via ${AIRPORTS[itin.depart].label})`:""}\n`;
  if(itin.notes)md+=`\n## Notes\n${itin.notes}\n`;
  return md;
}
const expDlg=$("#expDlg");
$("#exportBtn").onclick=()=>{$("#expText").value=exportMd();expDlg.showModal();};
$("#expClose").onclick=()=>expDlg.close();
$("#expCopy").onclick=()=>{$("#expText").select();document.execCommand("copy");};
$("#expDl").onclick=()=>{const b=new Blob([exportMd()],{type:"text/markdown"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=T.exportFile;a.click();};

/* ===================== header controls ===================== */
$("#arrival").onchange=e=>{itin.arrival=e.target.value||DEF_ARR;save();renderAll();};
$("#notes").oninput=e=>{itin.notes=e.target.value;save();};
$("#resetBtn").onclick=()=>{if(confirm("Clear the current itinerary?")){itin.stops=[];itin.depart=null;itin._depLoc=null;itin.hotels={};save();renderAll();}};

/* ===================== shareable URL state (C1) =====================
   In a real browser location.search is a string; in the headless test stub every unknown global
   is a catch-all Proxy whose typeof is "function". Gate all URL work on that so load-builder never
   touches URLSearchParams/history/location. encode/decodeItin are pure but only CALLED here. */
const SHARE = (typeof location !== "undefined" && typeof location.search === "string");
function encodeItin(){
  const p=new URLSearchParams();
  p.set("i",(itin.stops||[]).map(s=>`${s.ref}:${s.nights||0}`).join(","));
  if(itin.depart)p.set("dep",itin.depart);
  if(itin.arrival&&itin.arrival!==DEF_ARR)p.set("arr",itin.arrival);
  const hk=Object.keys(itin.hotels||{}).filter(k=>itin.hotels[k]);
  if(hk.length)p.set("h",hk.map(k=>`${k}:${itin.hotels[k]}`).join(","));
  return p.toString();
}
function decodeItin(qs){
  const p=new URLSearchParams(qs||"");if(!p.get("i"))return null;
  const valid=ref=>!!(G.RYOKANS[ref]||CITY_PALETTE.has(ref));
  const stops=p.get("i").split(",").filter(Boolean).map(tok=>{
    const [ref,n]=tok.split(":");if(!valid(ref))return null;
    return {kind:G.RYOKANS[ref]?"ryokan":"city",ref,nights:Math.max(1,Math.min(14,parseInt(n,10)||2))};
  }).filter(Boolean);
  if(!stops.length)return null;
  const hotels={};if(p.get("h"))p.get("h").split(",").forEach(t=>{const [loc,hid]=t.split(":");if(loc&&hid)hotels[loc]=hid;});
  return {stops,depart:p.get("dep")||null,arrival:p.get("arr")||DEF_ARR,hotels};
}
function shareUrl(){const qs=encodeItin();return location.origin+location.pathname+(qs?"?"+qs:"");}
let _urlT;
function syncUrl(){if(!SHARE)return;clearTimeout(_urlT);_urlT=setTimeout(()=>{try{const qs=encodeItin();history.replaceState(null,"",location.pathname+(qs?"?"+qs:""));}catch(e){}},300);}
function flashBtn(sel,msg){const b=$(sel);if(!b)return;const o=b.dataset.lbl||b.textContent;b.dataset.lbl=o;b.textContent=msg;setTimeout(()=>{b.textContent=o;},1500);}
function copyShare(){
  if(!(itin.stops&&itin.stops.length)){flashBtn("#shareBtn","Add stops first");return;}
  const url=shareUrl(),done=()=>flashBtn("#shareBtn","Link copied ✓");
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(done,()=>fallbackCopy(url,done));
  else fallbackCopy(url,done);
}
function fallbackCopy(text,cb){const t=document.createElement("textarea");t.value=text;document.body.appendChild(t);t.select();try{document.execCommand("copy");}catch(e){}document.body.removeChild(t);if(cb)cb();}
if($("#shareBtn"))$("#shareBtn").onclick=copyShare;
if($("#printBtn"))$("#printBtn").onclick=()=>{try{window.print();}catch(e){}};

/* ===================== calendar / timeline view (C4) ===================== */
let curView="list";   // "list" | "cal" | "map" (ephemeral; the three-way View toggle)
function renderCalendar(){
  const el=$("#calendar");if(!el)return;
  const stops=itin.stops||[];
  if(!stops.length){el.innerHTML='<div class="empty">No stops yet — build an itinerary to see it laid out on the calendar.</div>';return;}
  const dates=tripDates(),start=arrivalDate(),end=dates[dates.length-1].co;
  const key=d=>d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
  const cover={};
  stops.forEach((st,i)=>{const ci=dates[i].ci,n=st.nights||0;for(let k=0;k<n;k++)cover[key(addDays(ci,k))]={idx:i,first:k===0};});
  const lastNight=addDays(end,-1);
  const gridStart=addDays(start,-start.getDay()),gridEnd=addDays(lastNight,6-lastNight.getDay());
  const glyph={flight:"✈",train:"🚆",scenic:"🚆",bus:"🚌",car:"🚗",ferry:"⛴"};
  let cells=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(w=>`<div class="cal-wd">${w}</div>`).join("");
  for(let d=new Date(gridStart);d<=gridEnd;d=addDays(d,1)){
    const c=cover[key(d)],st=c?stops[c.idx]:null,col=st?colorOfLoc(locOf(st)):"";
    const lbl=(c&&c.first&&st)?`<span class="cal-lbl">${nameOf(st)}</span>`:"";
    const nN=(c&&c.first&&st)?`<span class="cal-nights">${st.nights}n</span>`:"";
    /* the first day of each stay is the changeover/arrival day — surface the inbound leg */
    let tr="";
    if(c&&c.first&&st){
      if(c.idx>0){const L=legBetween(locOf(stops[c.idx-1]),locOf(st));tr=`<span class="cal-transit" title="${(L.text||'').replace(/"/g,'&quot;')}">${glyph[L.mode]||"🚆"} ≈${fmtH(L.t[0])}</span>`;}
      else if(itin.arrival){tr=`<span class="cal-transit" title="Arrive Japan">✈ arrive</span>`;}
    }
    cells+=`<div class="cal-day${c?' on':' out'}"${col?` style="--cc:${col}"`:""}><span class="cal-n">${d.getDate()===1?d.toLocaleDateString("en-US",{month:"short"})+" 1":d.getDate()}</span>${tr}${lbl}${nN}</div>`;
  }
  /* dynamic month label — a Dec 31 arrival spans Dec 2026 → Jan 2027 */
  const mFmt=d=>d.toLocaleDateString("en-US",{month:"long",year:"numeric"});
  const mLabel=mFmt(start)===mFmt(lastNight)?mFmt(start):`${mFmt(start)} – ${mFmt(lastNight)}`;
  el.innerHTML=`<div class="cal-month" style="font-weight:600;font-size:12px;letter-spacing:.04em;margin:2px 0 6px">${mLabel}</div><div class="cal-grid">${cells}</div>`;
}
function setView(mode){
  curView=mode;
  const L=$("#list"),C=$("#calendar"),M=$("#mapview");
  if(L)L.style.display=mode==="list"?"":"none";
  if(C)C.style.display=mode==="cal"?"":"none";
  if(M)M.style.display=mode==="map"?"":"none";
  const bt={list:$("#vtList"),cal:$("#vtCal"),map:$("#vtMap")};
  Object.keys(bt).forEach(k=>{if(bt[k])bt[k].classList.toggle("on",k===mode);});
  /* in Map view the sticky stats band would overlap the top of the map and eat pointer events
     over dots up there — make it static while mapping (the rail + map carry the context). */
  if(document.body)document.body.classList.toggle("mapmode",mode==="map");
  if(mode==="cal")renderCalendar();
  else if(mode==="map")renderMapView();
}
if($("#vtList"))$("#vtList").onclick=()=>setView("list");
if($("#vtCal"))$("#vtCal").onclick=()=>setView("cal");
if($("#vtMap"))$("#vtMap").onclick=()=>setView("map");

/* ===================== Map view (third itinerary view; app context only) =====================
   In planning/app.html the Catalog tab's map SVG lives under #cat-root with the contract
   selectors: inn dots [data-bk], hotel diamonds [data-city], gateway marks [data-gw].
   initMap() records that source SVG; renderMapView() deep-clones it into #mapview (ids stripped
   so the document keeps unique ids; catalog hover <title>s dropped — the overlay carries its own),
   dims every mark via the `bmap` class, draws mode-coloured leg segments + numbered stops, and
   surfaces nearby inns. Standalone route-builder.html has no #cat-root, so the Map tab hides
   itself and the headless harness exits on the empty stub DOM. */
/* Leg-segment presentation (STYLING only — the trip data lives in trip-data.js/LEGS). One signal:
   segment colour = travel mode. Rail solid; car/flight/ferry dashed. Drives both the map segments
   and the dynamic legend, so they never disagree. */
const LEGSTYLE={
  shinkansen:{color:"var(--indigo)",label:"Shinkansen"},
  train:{color:"var(--frost)",label:"Train"},
  car:{color:"var(--gold)",dash:1,label:"Car"},
  flight:{color:"var(--verm)",dash:1,label:"Flight"},
  ferry:{color:"var(--cool)",dash:1,label:"Ferry"},
  bus:{color:"var(--ink2)",label:"Bus"},
  scenic:{color:"var(--mild)",label:"Scenic"},
  subway:{color:"var(--frost)",label:"Subway"},
};
const legStyle=m=>LEGSTYLE[m]||LEGSTYLE.train;
const SVGNS="http://www.w3.org/2000/svg";
let mapSvg=null;    // the clone inside #mapview, or null until the Map view is first shown
let mapSrc=null;    // the Catalog tab's source <svg> (cloned once into #mapview)
let mapFit="route"; // ephemeral fit mode: "route" (auto-zoom to itinerary bbox) | "japan"
let mapNear=0;      // ephemeral nearby-inn threshold, door-to-door hours (0 = off)
let mapTiers=new Set();   // ephemeral tier filter (empty = show all) — mirrors the Catalog map's tier chips
let mapDotOrder=null;     // the clone's dots in rank order (best painted last) — captured once for restore
let mapDotsLifted=false;  // whether tier-matched dots are currently raised above the dimmed layer
const TIER_ORDER=["S","A","B","C","D","—"];   // chip order (catalog vocabulary; "—" = unscored)
let _tierCounts=null;     // {S:6,A:59,…} counted once off the clone (static across the session)
function tierCounts(){
  if(_tierCounts)return _tierCounts;
  const c={};TIER_ORDER.forEach(t=>c[t]=0);
  if(mapSvg)mapSvg.querySelectorAll("circle.dot").forEach(d=>{
    const t=([...d.classList].find(x=>x.startsWith("t-"))||"t-—").slice(2);
    if(t in c)c[t]++;
  });
  _tierCounts=c;return c;
}
const MAP_VB={w:564,h:638};   // full-Japan viewBox — re-read from the source SVG in initMap
function cloneMapSvg(){
  const cl=mapSrc.cloneNode(true);
  cl.removeAttribute("id");
  [...cl.querySelectorAll("[id]")].forEach(e=>e.removeAttribute("id"));
  [...cl.querySelectorAll("title")].forEach(e=>e.remove());   // catalog hover titles — the overlay carries its own
  cl.classList.add("bmap");
  cl.removeAttribute("width");cl.removeAttribute("height");   // CSS sizes it to its container
  return cl;
}
/* Plain-text rating for an inn (tooltip fallback + detail lookups): the SYNTH re-score when present,
   else the legacy tier·score — same "S · 9.5" shape the catalog stamps into a dot's data-m. */
function mapRating(id){const r=G.RYOKANS[id];if(!r)return "";const sy=SY[id]||{};const tier=sy.tier||r.tier,score=sy.overall!=null?sy.overall:r.score;return tier!=="—"?`${tier} · ${score}`:"off-catalog";}
/* Render an inn's card into #mapdetail below the map, with an action row: a muted "✓ in your route"
   when it's already a stop, else a "＋ add to route" button (appends at the end via addStop, staying
   on the Map view). Called by an inn-dot click, a ryokan stop-number click, and a rail inn-row click. */
function showMapDetail(id,scroll){
  const box=$("#mapdetail");if(!box||!G.RYOKANS[id])return;
  const inRoute=(itin.stops||[]).some(s=>s.kind==="ryokan"&&s.ref===id);
  const action=inRoute
    ?`<div class="mapdact"><span class="mapdin">✓ in your route</span></div>`
    :`<div class="mapdact"><button class="btn accent sm" data-mapadd="${id}">＋ add to route</button></div>`;
  box.innerHTML=innCard(id)+action;
  wireAspects(box);
  const add=box.querySelector("[data-mapadd]");
  if(add)add.onclick=()=>{addStop("ryokan",id,itin.stops.length);showMapDetail(id);};   // stay on the Map; addStop's renderAll refreshes rail+overlay, then re-show flips the button to ✓
  if(scroll&&box.scrollIntoView)box.scrollIntoView({block:"nearest",behavior:"smooth"});
}
/* the map's city-add path — clicking an addable city mark (a gateway square/hotel diamond) shows a
   compact city card below the map with ＋ add to route (hotels are chosen later, in the List). Only
   CITY_PALETTE cities are addable; gateways the builder can't route (osaka/nagoya/sapporo) → no card. */
function showCityDetail(key,scroll){
  const box=$("#mapdetail");if(!box||!CITY_PALETTE.has(key))return;
  const label=CITY_LABEL[key]||cap(key),blurb=(G.CITYINFO&&G.CITYINFO[key])||"";
  const inRoute=(itin.stops||[]).some(s=>s.kind==="city"&&s.ref===key);
  const action=inRoute
    ?`<div class="mapdact"><span class="mapdin">✓ in your route</span></div>`
    :`<div class="mapdact"><button class="btn accent sm" data-cityadd="${key}">＋ add to route</button></div>`;
  box.innerHTML=`<div class="rykdetail"><div class="rdhead"><span class="rdname">${label}</span> <span class="kindtag c">city</span></div>${blurb?`<div class="rdblurb">${blurb}</div>`:""}${action}</div>`;
  const add=box.querySelector("[data-cityadd]");
  if(add)add.onclick=()=>{addStop("city",key,itin.stops.length);showCityDetail(key);};
  if(scroll&&box.scrollIntoView)box.scrollIntoView({block:"nearest",behavior:"smooth"});
}
/* one click handler on the clone (wired once). The overlay is pointer-events:none, so a click always
   lands on the base inn dot beneath ([data-bk]) — including a ryokan route stop, whose marker sits
   over its own dot — and shows that inn's card in #mapdetail (add-to-route lives on the card; no
   silent insert). City stops sit over a gateway/hotel mark (no data-bk) → nothing (the rail handles
   list navigation). */
function wireMapClicks(svg){
  svg.addEventListener("click",e=>{
    if(!e.target||!e.target.closest)return;
    const dot=e.target.closest("[data-bk]");
    if(dot){const id=dot.getAttribute("data-bk");if(G.RYOKANS[id])showMapDetail(id,true);return;}
    const cm=e.target.closest("[data-gw],[data-city]");   // a city mark → add-a-city card
    if(cm){const key=cm.getAttribute("data-gw")||cm.getAttribute("data-city");if(CITY_PALETTE.has(key))showCityDetail(key,true);}
  });
}
/* hover tooltip on inn dots (delegated on the svg so the nearby hit circles — which also carry
   data-bk but no data-n/data-m — resolve too). Mirrors the catalog #tip: name in bold, rating in
   the mono .tm line; positioned at cursor+14px, clamped to the wrapper's right edge; hidden off-dot. */
function wireMapTip(svg,wrap,tip){
  svg.addEventListener("mousemove",e=>{
    /* every dot tooltips (name + rating), exactly like the catalog map — not just the 87 routable
       ones. All dots carry data-n/data-m; only [data-bk] dots are clickable (see wireMapClicks). */
    const d=e.target&&e.target.closest?e.target.closest(".dot,[data-bk]"):null;
    if(!d||!d.getAttribute("data-n")){tip.hidden=true;return;}
    const id=d.getAttribute("data-bk");
    tip.innerHTML='<b></b><br><span class="tm"></span>';
    tip.firstChild.textContent=d.getAttribute("data-n")||(id&&G.RYOKANS[id]?G.RYOKANS[id].name:id);
    tip.lastChild.textContent=d.getAttribute("data-m")||(id?mapRating(id):"");
    const rect=wrap.getBoundingClientRect();
    tip.hidden=false;
    tip.style.left=Math.min(e.clientX-rect.left+14, rect.width-tip.offsetWidth-4)+"px";
    tip.style.top=(e.clientY-rect.top+14)+"px";
  });
  svg.addEventListener("mouseleave",()=>{tip.hidden=true;});
}
/* the Map view's stops rail — one compact draggable row per itin.stops entry (number · name · kind),
   region-color left accent. An inn row click shows that inn's card below; drag reorders (wireDrag,
   shared with the List) → autoDepart/save/renderAll redraws the map's numbers+segments live. */
function renderMapRail(rail){
  if(!rail)return;
  const stops=itin.stops||[];
  if(!stops.length){rail.innerHTML=`<div class="note">Add stops to build your route.</div>`;return;}
  let html="";
  stops.forEach((st,i)=>{
    const isR=st.kind==="ryokan";
    html+=`<div class="maprow-stop" draggable="true" data-idx="${i}" style="--rc:${colorOfLoc(locOf(st))}">
      <span class="grip" title="Drag to reorder">⠿</span>
      <span class="rnum">${i+1}</span>
      <span class="rnm">${nameOf(st)}</span>
      <span class="kindtag ${isR?"r":"c"}">${isR?"ryokan":"city"}</span>
    </div>`;
    /* between consecutive stops: a plain-language transit line — MODE · time · transfers (no colour
       code). ~ marks an estimated time; "direct" = no transfers. Not draggable → reordering unaffected. */
    if(i<stops.length-1){
      const leg=legBetween(locOf(st),locOf(stops[i+1])),style=legStyle(leg.mode),tx=leg.t[1];
      const xfer=tx===0?"direct":tx+" transfer"+(tx===1?"":"s");
      html+=`<div class="maprleg"><span class="mlmode">${style.label}</span> · ${leg.source==="estimated"?"~":""}${fmtH(leg.t[0])} · ${xfer}</div>`;
    }
  });
  rail.innerHTML=html;
  $$(".maprow-stop",rail).forEach(row=>row.addEventListener("click",e=>{
    if(e.target.closest(".grip"))return;
    const st=itin.stops[+row.dataset.idx];if(!st)return;
    if(st.kind==="ryokan")showMapDetail(st.ref,true);else showCityDetail(st.ref,true);
  }));
  wireDrag(rail,".maprow-stop");
}
function initMap(){
  try{
    const root=document.getElementById("cat-root");
    const src=root&&[...root.querySelectorAll("svg")].find(s=>s.querySelector("[data-bk]"));
    if(!src){const vm=$("#vtMap");if(vm)vm.style.display="none";return;}   // no catalog SVG → the Map view can't render
    mapSrc=src;
    const vb=(src.getAttribute("viewBox")||"").split(/[\s,]+/).map(Number);
    if(vb.length===4&&vb[2]>0&&vb[3]>0){MAP_VB.w=vb[2];MAP_VB.h=vb[3];}
  }catch(e){}
}
/* auto-fit: bbox of the itinerary's anchor points, ~14% padding each side, a minimum
   span so a two-stop route isn't microscopic, and a loose aspect clamp so the sidebar
   card never becomes an extreme strip. Returns the viewBox actually set. */
function fitViewBox(svg,pts){
  const full={x:0,y:0,w:MAP_VB.w,h:MAP_VB.h};
  let box=full;
  if(mapFit==="route"&&pts.length){
    let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
    pts.forEach(o=>{x0=Math.min(x0,o.p[0]);y0=Math.min(y0,o.p[1]);x1=Math.max(x1,o.p[0]);y1=Math.max(y1,o.p[1]);});
    const cx=(x0+x1)/2,cy=(y0+y1)/2;
    let w=(x1-x0)*1.28,h=(y1-y0)*1.28;                    // ≈14% padding per side
    w=Math.max(w,MAP_VB.w*0.26);h=Math.max(h,MAP_VB.h*0.26);   // minimum sensible span
    if(h/w>1.5)w=h/1.5;else if(h/w<0.66)h=w*0.66;         // aspect clamp
    box={x:cx-w/2,y:cy-h/2,w,h};
  }
  svg.setAttribute("viewBox",box.x+" "+box.y+" "+box.w+" "+box.h);
  return box;
}
/* Draw the overlay (mode-coloured legs + numbered stops + nearby-inn highlights) onto the clone.
   Returns the Set of leg modes actually drawn, so renderMapView builds a legend that matches. */
function renderMapInto(svg){
  const old=svg.querySelector("g.bmap-ovl");if(old)old.remove();
  const SL=shortlistSet();
  const dots=[...svg.querySelectorAll("[data-bk]")];
  const stopLocs=(itin.stops||[]).map(locOf);
  const routeInns=new Set((itin.stops||[]).filter(s=>s.kind==="ryokan").map(s=>s.ref));
  /* classify every inn dot: shortlist (gold), and — when nearby-mode is on — near (un-dim + ring,
     clickable to add) vs far (hard-dim). Route inns are left to the numbered circles below. */
  const nearIds=new Set();
  dots.forEach(d=>{
    const id=d.getAttribute("data-bk");
    d.classList.remove("near","far");
    d.classList.toggle("sl",SL.has(id));
    if(!mapNear||routeInns.has(id))return;
    const loc=G.RYOKANS[id]?G.RYOKANS[id].loc:null;
    const near=!!(loc&&stopLocs.length&&Math.min(...stopLocs.map(sl=>legBetween(loc,sl).t[0]))<=mapNear);
    d.classList.toggle("near",near);d.classList.toggle("far",!near);
    if(near)nearIds.add(id);
  });
  /* tier filter (mirrors the Catalog map): when any tier chip is on, hard-dim every inn dot whose tier
     isn't selected — across ALL dots (routable + catalog-only context), like the catalog. Route inns are
     never dimmed (their numbered marker sits on that dot). Composes with the distance filter above.
     Matched dots also get .tpick (ink ring) so a pale (unscored) match stays findable. */
  const allDots=[...svg.querySelectorAll("circle.dot")];
  if(!mapDotOrder){
    // Rank order (worst first → best painted last/on top), keyed off data-c="c<rank>" — authoritative and
    // independent of the clone's incoming DOM order (the catalog may have been mid-filter when cloned).
    const rankOf=d=>{const c=d.getAttribute("data-c");return c?parseInt(c.slice(1))||999:999;};
    mapDotOrder=allDots.slice().sort((a,b)=>rankOf(b)-rankOf(a));
    const layer0=allDots[0]&&allDots[0].parentNode;
    if(layer0)mapDotOrder.forEach(d=>layer0.appendChild(d));   // normalise the clone to true rank order once
  }
  allDots.forEach(d=>{
    const bk=d.getAttribute("data-bk"),isRoute=bk&&routeInns.has(bk);
    const t=([...d.classList].find(x=>x.startsWith("t-"))||"t-—").slice(2);
    const dim=mapTiers.size>0&&!mapTiers.has(t)&&!isRoute;
    d.classList.toggle("tdim",dim);
    d.classList.toggle("tpick",mapTiers.size>0&&!dim);
  });
  /* lift matched dots above the dimmed layer so pale unscored dots aren't buried in dense clusters;
     restore best-on-top rank order once the filter clears. */
  const layer=allDots.length?allDots[0].parentNode:null;
  if(layer){
    if(mapTiers.size){allDots.forEach(d=>{if(!d.classList.contains("tdim"))layer.appendChild(d);});mapDotsLifted=true;}
    else if(mapDotsLifted){mapDotOrder.forEach(d=>layer.appendChild(d));mapDotsLifted=false;}
  }
  const xy=el=>{
    if(!el)return null;
    const cx=el.getAttribute("cx"),cy=el.getAttribute("cy");
    if(cx!=null&&cy!=null)return [parseFloat(cx),parseFloat(cy)];   // inn dots (circle)
    /* gateway square / hotel diamond (rect): geometric centre straight off x/y/w/h — exact,
       and independent of getBBox timing OR the diamond's rotate() (which pivots on that centre). */
    const x=el.getAttribute("x"),y=el.getAttribute("y"),w=el.getAttribute("width"),h=el.getAttribute("height");
    if(x!=null&&y!=null&&w!=null&&h!=null)return [parseFloat(x)+parseFloat(w)/2,parseFloat(y)+parseFloat(h)/2];
    try{const b=el.getBBox();return [b.x+b.width/2,b.y+b.height/2];}catch(e){return null;}
  };
  /* data-gw (gateways) and data-city (hotel cities) now live directly on their <rect> markers — the
     gateway label was split out to a separate text.citylbl — so both resolve straight to the square,
     no group-bbox drift toward the label. */
  const anchor=st=>st.kind==="ryokan"
    ?svg.querySelector('[data-bk="'+st.ref+'"]')
    :(svg.querySelector('[data-gw="'+st.ref+'"]')||svg.querySelector('[data-city="'+st.ref+'"]'));
  const pts=[];
  (itin.stops||[]).forEach((st,idx)=>{const a=anchor(st);if(!a)return;const p=xy(a);if(p)pts.push({p,st,idx});});   // no anchor → skip in overlay
  const box=fitViewBox(svg,pts);
  /* marker legibility under zoom: overlay sizes are authored for the full-Japan view,
     then scaled by the viewBox ratio so their ON-SCREEN size stays constant in either
     fit mode (clamped so a tight route never yields absurd hairlines). */
  const k=Math.max(0.34,Math.min(1,box.w/MAP_VB.w));
  const g=document.createElementNS(SVGNS,"g");
  g.setAttribute("class","bmap-ovl");
  /* the overlay is PURELY VISUAL — pointer-events:none, so leg lines + numbered markers never
     intercept; every hover/click falls THROUGH to the base inn dots beneath (which carry
     data-bk/data-n/data-m). That's why there are no transparent hit circles anymore — they used to
     swallow events for any inn dot sitting near a stop or a leg (the "only greyed-out dots work"
     bug). A ryokan route stop's marker sits directly over its OWN base dot, so a click there still
     shows that inn's card; a city stop's marker sits over a gateway/hotel mark (no data-bk) → no
     card, which is the intended behaviour. */
  g.setAttribute("pointer-events","none");
  /* ONE line per consecutive-stop leg — a single uniform route colour (mode is NOT colour-coded: the
     rail lists mode + time + transfers in words). Sequence reads off the numbered stops on top. */
  for(let i=1;i<pts.length;i++){
    const a=pts[i-1],b=pts[i];
    const ln=document.createElementNS(SVGNS,"line");
    ln.setAttribute("x1",a.p[0]);ln.setAttribute("y1",a.p[1]);ln.setAttribute("x2",b.p[0]);ln.setAttribute("y2",b.p[1]);
    ln.setAttribute("stroke","#df4327");ln.setAttribute("stroke-width",String(2.2*k));ln.setAttribute("stroke-linecap","round");
    ln.setAttribute("stroke-dasharray",(5*k)+" "+(4*k));ln.setAttribute("opacity",".85");
    g.appendChild(ln);
  }
  pts.forEach(o=>{
    const c=document.createElementNS(SVGNS,"circle");
    c.setAttribute("cx",o.p[0]);c.setAttribute("cy",o.p[1]);c.setAttribute("r",String(9*k));
    c.setAttribute("fill","#df4327");c.setAttribute("stroke","#fff");c.setAttribute("stroke-width",String(1.5*k));
    const t=document.createElementNS(SVGNS,"text");
    t.setAttribute("x",o.p[0]);t.setAttribute("y",o.p[1]);
    t.setAttribute("text-anchor","middle");t.setAttribute("dominant-baseline","central");
    t.setAttribute("font-size",String(10*k));t.setAttribute("font-weight","bold");t.setAttribute("fill","#fff");
    t.textContent=String(o.idx+1);
    g.appendChild(c);g.appendChild(t);
  });
  /* (city names now come from the cloned map itself — build_catalog_html.py labels every city mark,
     gateways + hotel diamonds — so no overlay labelling here.) */
  svg.appendChild(g);
}
function mapHeaderHTML(){
  const fit=`<span class="viewtoggle mapctl"><button class="vt${mapFit==="route"?" on":""}" data-fit="route" title="Zoom to the itinerary">Route</button><button class="vt${mapFit==="japan"?" on":""}" data-fit="japan" title="Show all of Japan">Japan</button></span>`;
  const NEAR=[[0,"off"],[2,"≤ 2h"],[3,"≤ 3h"]];
  const near=`<label class="mapnear">inns near route <select data-near title="Highlight catalog inns within this door-to-door time of a route stop — click one to see its card and add it">${NEAR.map(([v,l])=>`<option value="${v}"${mapNear===v?" selected":""}>${l}</option>`).join("")}</select></label>`;
  /* tier chips — same vocabulary + toggle behaviour as the Catalog map (dot colour = tier). Empty = all. */
  const c=tierCounts();
  const chips=TIER_ORDER.map(t=>`<button class="tchip${mapTiers.has(t)?" on":""}" data-tchip="${t}"${t==="—"?' title="unscored — no first-hand stays"':""}>${t} <span>${c[t]||0}</span></button>`).join("");
  const tiers=`<span class="maptiers"><span class="mtlbl">tier</span>${chips}</span>`;
  return `<div class="maphd-ctl">${fit}${near}${tiers}</div>`;   /* no colour legend — the route line is one colour; the rail states each leg's mode/time/transfers */
}
function wireMapHeader(bar){
  $$("[data-fit]",bar).forEach(b=>b.onclick=()=>{mapFit=b.dataset.fit;renderMapView();});
  const ns=$("select[data-near]",bar);
  if(ns)ns.onchange=()=>{mapNear=+ns.value||0;renderMapView();};
  $$("[data-tchip]",bar).forEach(b=>b.onclick=()=>{const t=b.dataset.tchip;mapTiers.has(t)?mapTiers.delete(t):mapTiers.add(t);renderMapView();});
}
/* Map view: clone the Catalog map once into #mapview, laid out as [.maphd] · [.maprow: map+tooltip |
   stops rail] · [#mapdetail], then (re)draw the overlay + header + rail on each render. Standalone
   (no mapSrc) is a no-op; the Map tab is hidden there. */
function renderMapView(){
  try{
    const host=$("#mapview");if(!host||!mapSrc)return;
    let svg=host.querySelector("svg.bmap"),bar=host.querySelector(".maphd");
    if(!svg){
      host.innerHTML="";
      bar=el('<div class="maphd"></div>');host.appendChild(bar);
      const row=el('<div class="maprow"></div>');
      const wrap=el('<div class="mapwrap"></div>');
      svg=cloneMapSvg();wrap.appendChild(svg);
      const tip=el('<div class="maptip" hidden></div>');wrap.appendChild(tip);
      row.appendChild(wrap);
      row.appendChild(el('<aside class="maprail"></aside>'));
      host.appendChild(row);
      host.appendChild(el('<div id="mapdetail"></div>'));
      mapSvg=svg;
      wireMapClicks(svg);            // wired once — the clone persists across renders
      wireMapTip(svg,wrap,tip);      // hover tooltip, same lifetime as the clone
    }
    renderMapInto(svg);
    bar.innerHTML=mapHeaderHTML();
    wireMapHeader(bar);
    renderMapRail(host.querySelector(".maprail"));   // rebuilt each render → numbers + order track the itinerary
  }catch(e){}
}

/* ===================== boot ===================== */
/* hydrate from a shared link (?i=…) before the first render; never breaks the headless harness */
if(SHARE){try{
  const us=decodeItin(location.search);
  if(us){
    const hasDraft=itin.stops&&itin.stops.length;
    if(!hasDraft||confirm("This link contains a shared itinerary. Load it? Your current draft will be replaced.")){
      itin.stops=us.stops;itin.depart=us.depart;itin._depLoc=us.stops&&us.stops.length?locOf(us.stops[us.stops.length-1]):null;itin.arrival=us.arrival;itin.hotels=us.hotels;itin.currentRoute=null;save();
    }
  }
}catch(e){}}
autoDepart();
initMap();   // app.html only — clones the Catalog map into the sidebar before the first render
renderAll();
/* app shell (planning/app.html) dispatches "tabshown" on tab switches; if the Catalog tab's
   ★ shortlist changed while we were hidden, re-render so the swap grids re-pin. No-op standalone. */
let _slSnap=null;
try{
  _slSnap=JSON.stringify([...shortlistSet()].sort());
  document.addEventListener("tabshown",e=>{
    if(e&&e.detail&&e.detail!=="builder")return;
    const s=JSON.stringify([...shortlistSet()].sort());
    if(s!==_slSnap){_slSnap=s;renderList();}
  });
}catch(e){}
/* expose for tests */
G.__BUILDER__={legBetween,departLeg,departsFor,bestDepart,autoDepart,DEPARTS,LEGS,REGIONS,SENSIBLE,LOC_REGION,COMPOSE_CORRIDORS,BUILDER_HIDE,RYK_PALETTE:[...RYK_PALETTE],CITY_PALETTE:[...CITY_PALETTE],totals,nights,routeMetrics,transitRating,legsOf,flattenRoute,tripDates,encodeItin,decodeItin,shareUrl,renderCalendar,setView,get itin(){return itin;},set itin(v){itin=v;},renderAll,locOf,regionOfLoc};
})();
