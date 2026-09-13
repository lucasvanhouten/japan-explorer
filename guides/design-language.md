# The design language

Extracted from the project's own working surfaces — the Five Januaries route console
(`planning/five-januaries/`), One January (`planning/one-january/`), the route builder
(`planning/route-builder.html`) and the ryokan catalog (`deploy/index.html`). A page built for a
traveller must read as a sibling of those, not as a dashboard. `trip-visual-template.html` is that
sibling, and it is the starting point for every trip page — fill it, do not re-invent it.

## Type — three faces, each with one job

```
--sans "Helvetica Neue",Helvetica,Arial,"Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif
--mono ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,monospace
--jp   "Hiragino Mincho ProN","Yu Mincho",serif      (CJK accent glyphs only, never roman)
```

No serif for roman text, no fourth face, no webfont — the stacks above are the whole typography.

- **Sans** carries names, headings and prose. Headings are heavy and tight: `font-weight:800`,
  `letter-spacing:-.015em`. Body prose sits at `.85–.92rem`, line-height `1.55`, in `--prose`
  (a warm near-ink, not gray).
- **Mono** carries every *number and label*: eyebrows, stat cells, strip blocks, leg bars, captions,
  table cells, buttons. This is the rule that makes the surfaces recognisable — a figure is never
  set in sans, a name is never set in mono. Mono runs small (`.56–.78rem`) and always
  `font-variant-numeric:tabular-nums` where figures stack.
- **Labels** are mono, `.6rem`, `font-weight:700–800`, `text-transform:uppercase`,
  `letter-spacing:.09–.12em`, in `--dim` or `--ink2`. Values are larger and darker than their label.
  Numbers live next to their label, never in a right-justified cluster far from it.
- Times read as words with five-minute rounding — `2 hr 45 min`, `45 min`, `3 hr` — never decimal
  hours, never `2.75h`. An approximate figure takes a leading `≈`; an estimated one a leading `~`.

## Colour — warm paper, near-black ink, one vermillion

Light is the base. Every token is defined on bare `:root`, redefined under
`@media (prefers-color-scheme:dark)` and again under `:root[data-theme="dark"]`, with a
`[data-theme="light"]` block so a toggle wins both ways. `body` paints `--paper` explicitly.

| token | light | dark | use |
|---|---|---|---|
| `--paper` | `#ecebe6` | `#1b1b1d` | page ground |
| `--panel` | `#f4f3ef` | `#222225` | cards, panels |
| `--inset` | `#e7e5de` | `#1e1e21` | quoted / recessed blocks |
| `--ink` | `#19191a` | `#e8e6df` | headings, values, the hero band |
| `--prose` | `#3f3d37` | `#cfccc2` | body text |
| `--ink2` | `#56554e` | `#a5a29a` | secondary text |
| `--dim` | `#7a7870` | `#7d7b74` | labels, captions |
| `--hair` / `--hair2` | `#d6d3c9` / `#c4c1b5` | `#333338` / `#45454c` | rules, borders |
| `--verm` / `--vermd` | `#df4327` / `#a82f15` | `#e85535` | the single accent; inn nights |
| `--vermsoft` | `#f7e3dd` | `#39231e` | inn-night block ground |
| `--dc` | `#1a4a80` | `#6f9fd8` | city nights |
| `--dcsoft` | `#dfe7f0` | `#1d2733` | city-night block ground |
| `--warn` | `#8a5a10` | `#d7a54a` | estimated / to-confirm |

Colour is semantic or absent. Two hues do the work: **blue = city night, room only** and
**vermillion = inn night, dinner and breakfast**. Nothing else on the page is coloured for
decoration — no gradients, no shadows, no tints that mean nothing.

## Spacing and shape

Hard edges: borders are 1px `--hair2`, radius 0–3px, never more. Cards are flat panels on paper —
`background:var(--panel); border:1px solid var(--hair)`. Card padding ~`1rem`; sections separate by
`~2.6rem`; the content column is `54–60rem` and centred. Grid tracks are `minmax(0,1fr)`, never bare
`1fr`. Rules are single hairlines; the one heavy rule is the 3px `--ink` or `--verm` under a
masthead or above a totals row.

## The stop strip

One horizontal band over a **day axis**, travel order left to right, wrapped in an `overflow-x:auto`
scroller so a phone scrolls it rather than crushing it. This is how the consoles draw a trip
(`.ttlane` + `.ticks` in One January, the timetable lanes in Five Januaries) and the trip page draws
it the same way.

- Band and axis are **one grid** — `repeat(<nights in the trip>,minmax(0,1fr))` on both. A stop
  spans its nights (`grid-column:span <n>`), so **block length is nights**; the axis prints one tick
  per night, numbered `1…n`.
- The block carries a soft category ground (`--dcsoft` / `--vermsoft`) and a **4px inset bottom
  accent** in the full-strength hue (`box-shadow:inset 0 -4px 0`). That underline is the category
  signal; the legend names both categories in words.
- Inside: **the place, twice** — a 3–4 letter short label in uppercase mono (`TYO`, `NIK`) and the
  full name in sans `700`. The block is a CSS container and prints the full name only when it is
  wide enough to hold it, the short label otherwise. **A name is never cut mid-word, and never
  ellipsised** — narrow means short label, not truncation.
- Nothing else is in a block. The night count is not: the axis below carries the days, and one fact
  lives in one place. The legs live as full-width bars in the itinerary below, with the airport
  journeys as dashed-edge bars at its head and foot, so the trip reads door to door.

## The map

A route drawing, not a pin map, and never a replacement for the strip — the two answer different
questions, *where* and *how long*, and sit side by side. One inline SVG: the Japan outline in
`--land` with a `--landline` hairline, the route a `--verm` polyline through the stops in travel
order, and one **unnumbered** dot per stop, 8px across, carrying the category ground it has in the
strip. A marker carries the place name beside it and nothing else — the polyline gives the order, so
a numeral on a dot is a fact printed twice. Coordinates come from the shipped stop table —
`guides/trip-visual-stops.json`, an `[x, y, side]` per place on that outline — never from a
geocoder and never by eye.

**The crop is fitted to the plan, not picked from a list.** `viewBox` comes from the bounding box of
that plan's own stops plus 9% of clear edge (`W = max(w0, 1.4×h0, 60) ÷ 0.82`), so a trip in one
corner of the country fills the frame instead of sitting in one corner of it. `--k` is then that
viewBox's width ÷ 560, and every size on the map is written in `--k` units — so a dot stays 8px and
a label 11px whether the crop is Kyushu or the whole archipelago. Strokes use
`vector-effect:non-scaling-stroke`, which measures them in screen pixels; dash lengths therefore do
**not** take a `--k` factor, or a close crop's dashes collapse into a solid line.

**Labels are `.7rem` mono, uppercase, `700` in `--mlbl` with a paper-coloured halo**
(`paint-order:stroke`), the same face and weight the consoles label their maps with — and they are
drawn **last**, over the dots, so the halo punches through the route line where the two cross. A
label's `x`/`y` are its stop's own coordinates; a side class (`n e s w ne nw se sw`) does the
offsetting, so no label on the page carries a hand-nudged number. The side comes from the stop
table, chosen so the usual neighbours miss each other, and is overridden only to stop a clip at the
edge of the crop or a collision with another label.

**Stops too close together get an inset, not smaller type.** Under `W ÷ 13` map units apart, two
labels cannot both be drawn — so the main map keeps their dots, loses their labels, and carries a
dashed `.detail` frame naming the region; a second map of that region sits under it and carries the
labels. This is how an atlas handles it, and it costs the reader nothing to read. A key of
three-letter codes is the alternative, and it is worse: it makes the reader look things up.

**The line says the mode**: solid rail, dashed flight, dotted car, bus or ferry — one polyline per
run of legs in the same mode, all of them under the dots.

## The inn photo strip

Three photographs across the head of an inn's card, equal columns, `object-fit:cover`, a hairline
between them — the catalog's own card rhythm, and the one thing on a plan page that is not a number.
No captions: a caption restating a photograph is banned. A stay with no photographs in the catalog
has no strip, and the card is correct without one.

## The stop card head

A stop is identified by **the nights it covers and its place**, in that order — `Nights 1–5 · Tokyo`,
or `Night 7 · Kinosaki` for a single night — the range in mono `.66rem/800` uppercase `--vermd`, the
place in sans. The range is counted off the sequence, not typed from a separate column. **Stops are
never numbered**: a number is a label that has to be looked up, and a night range answers the
question the reader actually has. The meta line on the right of the head then carries the meal only.

## The leg bar

A full-width bar between two stop cards, never inside one — the consoles' move (`KOFUYUDEN → KYOTO ·
SHINKANSEN · 1 HR 45 MIN · 1 TRANSFER`), at a size a reader does not have to lean into. Mono `.78rem`,
uppercase, hairline top and bottom, `--panel` ground, and a **4px mode-coloured left edge**: `--dc`
for rail, `--verm` for road (bus, car, taxi, ferry), `--dim` and dashed for an airport journey.

```
Tokyo → Kyoto · shinkansen · 2 hr 45 min · direct          from the tables — plain
Nikkō → Kyoto · shinkansen · 4 hr 42 min · 2 changes · composed via Tokyo
Kanazawa → Takayama · bus · ~2 hr 24 min · 1 change · estimated    --warn ink and edge
Haneda (HND) → Tokyo · train · 35 min · 1 change           dashed edge, an airport leg
Takayama → Kanazawa · to confirm                           --warn, out of every total
```

Both ends are named, so a bar reads on its own. The time is `<b>` (weight 800, `--ink`); the rest
stays `--ink2`. `direct` is the word for no change. Status is a word, never a dot or an icon. An estimated leg says "estimated" every single time it renders, and a composed one names
the hub it was composed through.

**No standard follow-ups on the page.** There is no `To confirm` block and no checklist: a trip page
is read to understand a trip, not to run its logistics, and cancellation terms, dietary requests,
shuttles and price bands to confirm all belong in the plan and the booking checklist instead. The
single exception is a **watch line** — `.watch`, mono `.62rem` in `--warn`, one sentence set as the
second line inside one leg bar — and only for a major transit flag: an estimated or composed leg, a driving day,
a ferry, a bus that must be reserved, or a pass that closes or runs slow in winter. It reads
**Watch this leg** in a mono uppercase `<b>`, then the hazard in plain words taken from the leg's own
note. Most pages have none.

## The metrics row

A label column plus one column per plan, on one hairline-ruled grid
(`grid-template-columns:15ch repeat(n,minmax(0,1fr))`), labels mono uppercase `.62rem` `--dim` on the
left, values mono `.78rem` right-aligned, the headline figure inside them at `.92rem/800`. Same rows,
same order, same units for every plan — a measure counted against one plan is counted against all.
The standing set: total transit **including both airport legs**, separate stays, one-night
stops, inn nights / city nights, longest run of inn dinners, days needing a car, legs not from the
tables. Derived measures that are arithmetic of each other collapse into one row.

A total containing an unsourced leg stays partial and is coloured `--warn`: `≥ 8 hr 33 min
(2 to confirm)`, never a clean number.

## Deliberately absent

- **No information behind hover** — no `title` tooltips carrying a number, no "hover for the detail".
  A value is visible or it is not promised.
- **No decorative icons or emoji**, no gradients, no drop shadows, no rounded pills, no masthead art.
- **A symbol either explains itself or goes.** Colour is allowed where a legend names it in words.
- **One fact, one place.** A figure in the metrics row is not repeated in the strip; the night count
  is on the axis and in the card head, not also inside a band block; the order is in the polyline,
  not also in a numeral on the dot.
- **No process narration, no editorial voice, no atmosphere.** The page shows the current state of
  the plan; how it got there is not on it.
- **No pin maps, no per-day cards, no invented numbers.**
