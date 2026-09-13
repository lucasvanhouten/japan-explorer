# Showing the trip on one page

A single HTML page that draws the finished plan: the route on a map of Japan, the nights in each
stop as a proportional band, the journeys between them, the inns with their photographs, and the
numbers that separate one version of the trip from another. Two plans stacked on one page is the
comparison, in one frame.

**The template is `guides/trip-visual-template.html`, and it is the starting point — always.**

## The one rule that governs the file: it is static

Every word, number, coordinate and image URL is **typed into the HTML**. There is no data block,
no `PLANS` array, no rendering script. The page must read completely with JavaScript switched off,
because most of the places it gets read do not run it:

- a chat **file card or preview** renders the file and runs nothing — a page that draws itself in
  JavaScript shows up **blank**, which is exactly how the previous version of this template failed;
- an emailed or AirDropped file, a page saved to disk, a printout, a strict corporate browser.

So: fill the HTML itself. The only script allowed on the page is the light/dark button at the foot,
which changes nothing structural — delete it and the page is unharmed. **No JavaScript may create,
order, measure or hide content.**

## Filling it

Open the template. It ships **already filled with the kit's worked example**
(`examples/sample-plan.md`), so you can see the target before you touch it; edit it in place. The
`EDIT` markers name the five things to change, in the order they appear:

| | what | from the plan |
|---|---|---|
| 1 | hero band | the trip's name, its dates and airports, one kanji as a mark |
| 2 | the map, per plan | `viewBox`, `--k`, the route polyline, a named dot per stop |
| 3 | the night band, per plan | `--d` = the trip's nights, one block per stop at `--n` nights, a short label and the full name, a day tick per night |
| 4 | the itinerary, per plan | a card per stop headed by its night range, a full-width leg bar between two cards |
| 5 | the comparison matrix | one column per plan — one column, kept, for a single plan |

Everything on the page is a cell of the finished itinerary table. Read the table across and type it
in; re-derive nothing, invent nothing — not a travel time, not a price, not a sentence of
atmosphere. Change nothing inside `<style>`.

**The map.** `guides/trip-visual-stops.json` holds, for about 120 Japanese places, an
`[x, y, "side"]` on the outline the template draws — the point, and the side its label sits on.
Copy the pair for each stop into the route `polyline` and into that stop's dot. Markers carry **no
number** — the place name beside the dot is all a marker says, and the line through them gives the
order. A place that is not listed: use the nearest one that is — at this scale Kinosaki and Toyooka
are one dot — and if nothing is near, delete that plan's `<figure class="mapbox">` block rather
than guessing a coordinate. Four things then decide whether the map reads; all four are spelled out
with their arithmetic in the template's own header comment (sections A–D), and the template ships
two worked examples of them.

- **Fit the crop to the plan** (A). There is no preset to pick: take the bounding box of *this
  plan's* stops and compute `W = max(w0, 1.4×h0, 60) ÷ 0.82`, `H = max(h0 ÷ 0.82, W ÷ 2.4)`,
  centred on the box — so a Kyushu-plus-Tokyo trip zooms to Kyushu–Tokyo and a Kansai trip to
  Honshū's middle, instead of showing the whole country with the trip in one corner. Then set
  `--k` to `W ÷ 560`: that is what holds a label at 11px and a dot at 8px **whatever the crop**,
  so it is re-derived every time the viewBox changes. Then walk the four edges — a label runs
  `0.020×W` units per character — and grow any edge a label crosses.
- **Give each label a side** (B). `n e s w ne nw se sw` as a class on the `<text>`; the class does
  the offsetting, so the label's `x`/`y` are the stop's own coordinates and **no map label carries
  a hand-nudged number**. The JSON's third entry is the default, picked so the usual neighbours
  miss each other (Takeo `w`, Fukuoka `n`, Amagase `e`, Kurokawa `s`, Yufuin `e`, Nagasaki `sw`).
  Override it only to stop a clip — a stop at the edge of the crop points its label inward — or a
  collision. A label crossing the route line is not a reason: labels are drawn last and their halo
  punches through.
- **Inset a cluster** (C). Stops closer than `W ÷ 13` units cannot both be labelled, and half a
  trip in one region trips this every time. Draw the atlas answer: a `<rect class="detail">` on the
  main map with the region's name on it, the clustered stops keeping their dots but losing their
  labels, and a second `<svg class="jm">` under it in `<div class="inset">`, fitted to the cluster
  by the same arithmetic, carrying those labels. Not smaller type, and not a key of abbreviations —
  a reader should not have to look anything up.
- **Colour the line by mode** (D). Solid rail, dashed flight (`class="rline fly"`), dotted car, bus
  or ferry (`class="rline road"`), drawn under the dots. A route that changes mode is several
  polylines meeting at the stop they share.

**The night band.** `--d` on `.bandgrid` is the number of nights in the whole trip; the band and
the day axis under it are that one grid, so a block's **length is its nights** and the ticks below
read `1 … n`, one per night. Each block carries two labels — `<b class="ab">` a **3–4 letter short
label** in uppercase mono (`TYO`, `KYO`, `NIK`), and `<b class="fl">` the full name, which takes
over by itself the moment the block is wide enough to hold it. Nothing is ever cut mid-word, on any
screen. Keep the full name to the place's short common form (about twelve characters — `Kanazawa`,
`Echigo-Yuzawa`), and do not put the night count inside a block: the axis carries the days, and a
fact appears in one place only. **Whenever any block may show its short label** — a stop of one or
two nights on a trip of ten or more, or more than five stops, and on a phone almost always — print
the key line the template carries under the axis (`<p class="bandkey">`), one entry per block in
travel order: `TYO Tokyo · KIR Kirishima · …`. It is one line and costs nothing; leave it out only
when every block is wide enough to print its name at phone width.

**The night ranges.** A stop card is headed by the nights it covers — `Nights 1–5`, and `Night 7`
where a stop is a single night — counted straight off the sequence: the first stop starts at night
1, and each later stop starts the night after the one before it ends (5 + 5 + 2 nights → 1–5, 6–10,
11–12). The card's meta line then carries the **meal only**. Stops are never numbered, on the card
or on the map.

**The leg bars.** One full-width bar between two cards, reading in this order and in these words:

```
Kanazawa → Takayama · bus · 2 hr 24 min · direct
Nikkō → Kyoto · shinkansen · 4 hr 42 min · 2 changes
Haneda (HND) → Tokyo · train · 35 min · 1 change
```

Uppercase mono, hairline above and below, and a **mode-coloured left edge** set by the class after
`leg`: `rail` (train, shinkansen, metro), `road` (bus, car, taxi, ferry), `air` for an airport
journey, which dashes the edge. `direct` is the word for no change; otherwise `1 change`,
`2 changes`. Status words follow the same line — `· composed via Tokyo`, `· estimated` with class
`est`, or `to confirm` with class `open`. A watch line, where a leg has earned one, is the bar's
**second line, inside it**.

**The photos.** Three per inn, read from `guides/trip-visual-photos.json` — one entry per catalogue
slug, three full URLs each, already ordered so the building, the bath or the room leads and food
never does. Copy the three; never open `catalog/catalog.json` for them. City hotels have no photographs in the
kit: their cards simply have no strip, and that is how they are meant to look. The images are the
one thing on the page loaded from the network, so the page has to read without them: the strip
collapses and nothing else moves.

**The numbers.** You add them up yourself, and you show your arithmetic to the traveller in the
chat, not on the page. Travel totals include the journey in from the arrival airport and out to the
departure airport. A leg marked **to confirm** is left out of every total, and the total then reads
`≥ 5 hr 15 min` with a note saying how many legs are missing — never a clean number. Times read as
words, as the plan prints them (to five minutes), in the template's own form: `35 min`, `2 hr 45 min`, `4 hr 40 min`, `3 hr`.
**One plan on the page keeps the matrix**, with one value column: put `single` on the section
(`<section class="mx single">`), which sizes that column to its content beside the labels.

## When to offer it

- **After the itinerary table is finished**, and not before. The page is a picture of that table. If
  a stop, a stay or a leg is still open, the plan is what needs finishing.
- **When two candidate plans are still alive, this is the main use.** Two orderings, or the same
  route with a different finale, are hard to compare in prose and easy to compare in one frame.
  Offer it at the point where you would otherwise write a comparison table.
- Offer it in one line — "I can draw this as a page you can open in a browser" — then build it if
  they say yes. Never build it unasked, and never in place of the plan block.

## What it must show

Everything below comes from the plan. Nothing else goes on the page.

- **The route on the map**, drawn as a line through the stops in travel order, with each stop a
  named dot coloured for inn or city — the name, never a number. It is a route drawing, not a pin map, and it never replaces
  the night band — the two sit side by side and answer different questions: *where* and *how long*.
- **The night band**, travel order left to right, each stop's length proportional to its nights, on
  the same grid as a **day axis numbered 1…n** below it. Five nights is five times the length of
  one. This is how the shape of a trip becomes visible: a long block, a short block, a long block.
  A narrow block prints its short label and a wide one its full name, so nothing is ever cut, and a
  key line under the axis spells the short labels out wherever one may appear.
- **Every leg as a full-width bar between the two stops it joins**, naming both ends and carrying
  the mode, the time, the changes and its source status — the same things the table's leg row
  carries. Three statuses, the same three the plan allows: from the tables (plain — including a leg
  composed out of two researched halves, whose bar ends `composed via <city>`), `estimated`
  (labelled, every time), `to confirm` (labelled, excluded from the totals, and written only where
  no researched path exists even through a hub city). The airport journeys bracket the list as
  dashed-edge bars, so the trip reads door to door.
- **Every stay named, with its link, its price band and its earmarks.** The link is the one the
  table carries — a hotel's Google Maps pin, an inn's `ryokancatalog.com` page. The band is a band,
  not a rate; the meal is stated once, in the card's meta line.
- **Three photographs of each inn**, which is the one piece of the page that is not a number and the
  reason it feels like a trip rather than a spreadsheet.
- **Inn nights and city nights visually distinct**, both named in a legend. An inn night includes
  dinner and breakfast; a city night does not, and that changes what the evening is.
- **The comparison metrics, one row per measure, one column per plan** — total transit including both
  airport legs, separate stays, one-night stops, inn/city nights, the longest run of inn dinners,
  days needing a car, legs not from the tables. Same measures for every plan, no blank cells; a single
  plan keeps the matrix with its one column.
- **A watch line under a leg, where that leg carries a major transit flag** — and nowhere else. See
  the section below; most plans have none.

## No follow-ups on the page — one exception

**The page has no `To confirm` list.** It is not a logistics sheet. Its job is that somebody looks
at it and understands the trip they are about to take: how long they sit in each place, how far
apart the places are, what the journeys cost in hours. Cancellation terms, dietary requests, shuttle
arrangements, confirming a price band, "check this once the flight is booked" — every standard
follow-up belongs in the plan and in the booking checklist, and none of it goes here. A reader who
has to work through a chore list to read a picture of their holiday has been handed the wrong
document.

**The one exception is a watch line**, and it is rare. It sits as the second line *inside* a single
leg bar, one sentence, in warning ink:

```html
<p class="leg rail">Nikkō → Kyoto · shinkansen · <b>4 hr 42 min</b> · 2 changes
  <span class="watch"><b>Watch this leg</b> — it starts on an hourly local line out of Nikkō
    that runs slow in snow.</span></p>
```

A leg earns one only for a **major transit flag** — something that can cost a day:

- the leg is **estimated**, or **composed** out of two researched halves;
- the day needs a **car**;
- the leg is a **ferry**;
- the leg uses a **bus that has to be reserved**;
- the leg crosses a **pass, line or ropeway that closes or runs slow in winter**.

Nothing else qualifies. Not a cancellation term, not a dietary request, not a shuttle to arrange,
not a price band to confirm — those are the kinds of thing the old `To confirm` block collected, and
they are exactly what this page is not for. The sentence comes from the leg's own note in the
tables, in plain words; it never invents a hazard. Most plans carry no watch line at all, and a page
with three of them has misread the rule.

## Delivering it — match the environment

Work out where the page will actually be read, and hand it over in the form that opens there.
**Never hand over something that needs a server**, and never hand over a link to a local path.

**(a) Claude Code, Cowork, claude.ai — anywhere with an Artifact or artifact-like tool.** Publish
the filled page as a native artifact and give them the link. It is self-contained already: one file,
inline `<style>`, no external scripts, no fonts to fetch. The inn photographs on
`ryokancatalog.com` are the one external resource, and **some artifact sandboxes block external
images** — if they come back blank, say so plainly and republish without the `<div class="strip">`
blocks; the page is designed to read without them. Do not add a CDN script, a webfont or a data
fetch to an artifact: they are blocked, silently.

**In the Claude Code desktop app, also show it in the browser pane**: write it as `japan-trip-plan.html` in the kit root, start the `kit-explorer` server from the kit's `.claude/launch.json` (it serves the whole kit) and open `http://localhost:8790/japan-trip-plan.html` — never the file path, which renders blank — then read the page's text and confirm the first stop's name is on it before saying it is showing.

**(b) ChatGPT, Codex, or any assistant with a canvas or a file workspace.** Put the whole file in
the canvas (or write it into the workspace as `japan-trip-plan.html`) and tell them to download it
and open it. A canvas that renders HTML shows it directly; one that does not still holds the file
they need.

**(c) Anywhere else — a plain chat, an email, a terminal.** Write the file as
`japan-trip-plan.html` next to the plan, and say one line: *"open it in a browser — it works as a
plain file, nothing to install."* If the chat shows a preview card for the attachment and the card
looks thin, that is the preview, not the page: it may not run scripts or load remote images, which
is precisely why the page is static.

In every case, say what the file is in **one line**, then stop. No tour of its features.

## Design rules

These are the rules the project's own comparison consoles are built to; `guides/design-language.md`
carries them in full, with the tokens. The template already obeys every one — the list is here so
you can tell when an edit would break one.

1. **One frame for every plan on the page.** Same rows, same order, same units. A measure counted
   against one plan is counted against all of them.
2. **A symbol either explains itself or goes.** Colour is allowed where a legend names it. The kanji
   in the hero is a mark beside a labelled title, never a label itself.
3. **Subtract, don't accrete.** Every element earns its place by displacing another. A number in the
   metrics row does not also appear in the band.
4. **No information behind hover, and none behind a toggle.**
5. **Nothing on the page that is not in the plan block.** No atmosphere, no scene-setting, no
   invented notes about jet lag or the view.
6. **Readable on a phone.** The map goes full width, the band keeps its proportions, the matrix
   scrolls rather than wrapping into columns that cannot be lined up.
7. **Light and dark both**, through `prefers-color-scheme`, with the background painted explicitly.
8. **Three typefaces, each with one job.** Sans for names and prose, mono for every number and
   label, mincho for CJK accent glyphs only — never for roman text. No webfont.
9. **Colour is semantic or absent.** Two hues carry meaning — blue for city nights, vermillion for
   inn nights and the route line. Nothing else is coloured to look nice.
10. **Times read as words** — `2 hr 45 min`, `45 min` — never `2.75h`.

## What not to do

- **A pin map instead of the plan.** A map of pins shows where the places are, which they already
  know. The map here draws the *route*, sits beside the night band, and never replaces it.
- **Decorative icons, gradients, drop shadows and masthead art.** The page is a working document.
- **Invented numbers.** No travel time, price, distance or coordinate appears here that did not
  appear in the plan or in the kit's own tables. Filling a gap so a comparison looks tidy is the
  worst version of this, because it reads as arithmetic.
- **Per-day cards.** Days come later, if the trip reaches the booking stage.
- **A single plan drawn as if there were no alternative** when two are still open.
- **Editorial voice anywhere** — no "the coldest and clearest month", no grading of their choices.
- **Restyling the template**, importing a look from elsewhere, or writing a page of your own.

## Before you hand it over

- [ ] Opened in a browser: it renders, at desktop width and at phone width, in light and in dark.
- [ ] **Opened with JavaScript disabled: identical, except the theme button is not there.**
- [ ] Every stop, night count, stay, link, band, earmark and leg matches the itinerary table,
      character for character where it is a name or a link.
- [ ] Every leg bar names both ends and carries its mode, and the mode is the word the corridor and
      airport tables print.
- [ ] Every stop card is headed by its night range, counted off the sequence; no stop is numbered.
- [ ] No place name in the band is cut: a narrow block shows its 3–4 letter short label instead, and
      the key line under the axis spells every short label out wherever one may appear.
- [ ] Every estimated leg says "estimated"; every unsourced leg says "to confirm" and is out of the
      totals, which then read `≥`.
- [ ] The totals include the journey in from the arrival airport and out to the departure airport.
- [ ] The map's dots carry place names and no numbers, and the polyline runs in travel order.
- [ ] The viewBox is fitted to this plan's own stops, not a preset of the whole country, and `--k`
      is that viewBox's width ÷ 560.
- [ ] No label overlaps another and none is clipped by the edge of its map — at desktop width and
      at phone width, in both themes.
- [ ] Every pair of stops closer than a label's width is in an inset, and the inset's frame is drawn
      on the main map with the region named.
- [ ] Flights are dashed, car and bus legs dotted, rail solid — and the mode matches the leg bar.
- [ ] The day axis runs 1…n under the band, and no block repeats a night count.
- [ ] Each inn has three photographs and they load; the page still reads with images blocked.
- [ ] The metrics row is complete for every plan, with no blank cells; a single plan keeps the matrix
      with one column, `single` on the section.
- [ ] Every time on the page is in the template's form — `35 min`, `4 hr 40 min` — as the plan prints it, to five minutes.
- [ ] There is no `To confirm` block, and no standard follow-up anywhere on the page.
- [ ] Any watch line sits inside its own leg bar, names a major transit flag, and comes from the
      leg's note in the tables — and there are at most one or two on the whole page.
- [ ] Nothing on the page is invented, and no sentence exists for rhythm.
- [ ] It still looks like the template — you filled it, you did not restyle it.
- [ ] You delivered it in the form that opens where they are, and said so in one line.
