# route.js — the kit's route engine

A dependency-free Node CLI shipped at `kit/builder/route.js`, run from that folder. It loads the builder's `route-builder-logic.js` + `route-data.js` headlessly, so every hour printed is a `LEGS` lookup through `legBetween()` — never typed or guessed from distance. Beside it sit three data files the kit build writes: `places.json` (every place the kit names, its kind and night range, and the spines that carry it), `spines.json` (the nine route spines and their decisions) and `shortlist.json` (the master inn table and the hotel tables as data).

## Use

```
cd builder
node route.js spines [--nights N] [--draws food,onsen,…] [--repeat] [--in HND --out KIX]
node route.js spine s1 [--set inn=nikko --set end=2 …] [--nights kyoto=5 …] [--total 12] [--in HND --out KIX] [--repeat]
node route.js compare "tokyo:4,hakone:1,kyoto:4" "tokyo:4,kanazawa:3,kyoto:4" [--in HND --out KIX]
node route.js stays kyoto [--budget modest|comfortable|splurge] [--bath] [--all]
node route.js plan "tokyo:4,nikko:1,tokyo:2,kyoto:4" --in HND --out KIX [--repeat] [--nights N]
node route.js connectors kyoto kanazawa [--all]
node route.js exit kyoto
node route.js legs tokyo nikko
node route.js places
```

- **`spines`** is the menu (level 1): the nine spines, each at its default assembly — stops, nights, travel, per night, check-ins, ryokan nights, flights, airports. `--nights N` assembles each at N nights (a spine whose band does not hold N is listed under the table, not hidden); `--draws` ranks by overlap with Stage 1's draws (`food temples nature onsen craft city pop art snow coast`, the interview's longer phrasings accepted); `--repeat` starts straight into the region where the spine allows it and reads Tokyo at its repeat range; `--in`/`--out` price the last leg to a booked ticket and never remove a spine.
- **`spine <name>`** (level 2; `spine kanazawa`, `spine classic` — any word of the route's name, or its id) prints one spine: its decisions in trip order as a table — every option with its description exactly as `spines.json` holds it, the one taken in bold, an option not offered with these choices saying why — then the timeline (`| Stop | Nights | Onward |`, the arrival transfer first, each leg as time to five minutes and one mode word), the stop string, and the checks. `--set <decision>=<option>` takes an option by its number as printed or by its label, and prints **Before** and **After** with one comparison row each; `--from` carries an earlier state so a later `--set` is compared against it. `--nights <loc>=N` moves one stop's nights (`loc#2=N` for a second visit, `=Nr` room only); `--total N` sets the trip length and the engine gives the extra nights to the spine's cities in trip order, one at a time inside their ranges (fewer nights come off in reverse order down to each minimum); a stop with `on_at` switches on by itself at that total. A decision with one option is never printed.
- **`compare`** (level 3) sets two or three full stop strings side by side — the menu's columns, then each route's legs and its flags.
- **`stays <place>`** prints Stage 4's `| Stay | Kind | Town | Band | Bath | Why | Links |` table for one place from the shortlist: inns whose town it is (a place that names a group — Izu, the Kaga towns, the snow valleys — answers for every town in it) and the city's hotels, the best five (pinned first, then score), write-ups verbatim. `--budget modest|comfortable|splurge` filters on the low end of the band (inns, dinner and breakfast for two: modest ≤ $600, comfortable ≤ $1,000; hotels, room only: ≤ $300, ≤ $600); `--bath` keeps in-room baths (yes or some); `--all` lifts the cap. A thin place says so rather than padding.
- **`plan`** prices any stop string — `place:nights`, comma-separated: a loc key (`kawaguchiko`), a name (`"Lake Kawaguchi"`, `Kaga`), or `inn:<catalog slug or name>:nights`, resolved to the inn's town; `nikko:2r` is two room-only nights (no inn dinner, so the run of inn dinners resets there). Without `--in` the nearest long-haul gateway to the first stop is assumed (Haneda for Tokyo); without `--out`, the nearest exit from the last stop. It prints the itinerary table, the **Totals** line with its arithmetic, and **Checks** — `**!**` a violation, `**flag**` a flag, `·` a note. The route explorer's "give this to your assistant" line is a stop string for this command.
- **`connectors A B`** prints the inns on the road between two places with each inn's **stop key** — only inns on the kit's shortlist, never one the master table omits. Free rows (detour ≤ 1h30), or where none is free the three nearest marked `a stop, not a free connector`; `--all` lists every shortlisted inn with both legs researched. Air legs never connect.
- **`exit <stop>`** ranks every airport with a researched leg, names the two nearest, and labels each **long-haul** or **connects to Haneda**. **`legs A B`** prints one leg. **`places`** lists every place with its kind, range and the spines that carry it.
- `--json` on any command returns the same data. `orders` (every order of a stop list, ranked) remains as an internal helper and is not part of the agent-facing surface.

## What it checks

The five kinds: `city`, `inn-town`, `onsen-town`, `day-trip`, `island`. An inn town's or onsen town's lodging is an inn dinner; a city, a day-trip overnight or an island night resets the run and counts as a city night. Every stop inside its card range, one over at most (a repeat visitor's Tokyo at its repeat range); each visit of a split city at two nights or more, except a final airport-side night; no run of inn dinners over three (a room-only night resets it); no doubling back — a leg composed through a city already left, or geometry that runs back past one; an inn on arrival day flagged; the exit airport against the nearest; `--nights` against the sum. Hours are door to door; a composed leg adds one change for the join. **Per night** counts each domestic flight leg at three hours at most and rounds half up to the minute; the tables print the true time. A pair no hub joins prints `to confirm` with no number: the total reads `≥ X (partial — N unsourced)` and the route is never recommended. The hubs are every corridor city plus Nagoya, Okayama and Sapporo.

## How a spine assembles

`spines.json` is the source (its `_about` is the schema). Fixed places and the taken options' stops go in trip order; an option with `place: "after <loc>"` goes right after that stop (several after one anchor keep decision order; `before a|b` takes the first present); `reverse` turns the middle of the route round with a leading or trailing Tokyo left in place; an option whose `requires` (`tokyo@first` = Tokyo opens the trip), `not_with` or anchor rule fails is not offered, and a default that fails falls back to the decision's no-stop option. Nights: each place at its ideal low (never under one); a repeated city 3 then 2 for Tokyo, its ideal low then one for another city, the later visit at one night only when it is the airport-side night. Airports: a ticket given wins; else the option taken, else the spine's own; a leading or trailing Tokyo reads Haneda. The band reads four nights lower when a START option drops Tokyo. Every assembly then goes through the same `buildPlan` as a pasted plan.

## Emitter lines (build-kit.js)

The kit build writes `builder/places.json` (from `kit-src/places.json`, plus a `spines` list per place), `builder/shortlist.json` (from the master inn table and the hotel tables) and `builder/spines.json` (a copy of `kit-src/tools/spines.json`) in both builds, loads this engine against that folder (`KIT_BUILDER_DIR`), and runs the fixture through it (`kit-src/tools/build-spines.js`): every spine × every option of every decision, and every offered combination, must price clean, or the build fails. The same pass prints the Stage 2 menu, the Stage 3 spines block and the route explorer's data. Only the tool-shipping build copies `route.js` and this file into `builder/`.

`places.json` record: `loc` · `name` · `kind` · `base` · `ideal [min, max]` · `minimum` · `repeat [min, max]` (optional) · `region` · `card` · `primary` · `label` (optional) · `lat`, `lng` (optional) · `spines` (the ids of the spines that carry the place).

## Limits

- Backtracking is geometric (C behind A on the A→B axis, close to the line) plus the composed-pivot rule; a researched leg that skirts a city already left is only a note.
- Long-haul gateways: HND, NRT, KIX, FUK, KOJ, CTS, NGO (Stage 1's list); every other airport is an exit when the tables hold its flight to Haneda.
- Exported for scripts: `buildPlan`, `parseStops`, `stopOf`, `stopString`, `leg`, `airportLeg`, `airportsRanked`, `defaultIn`, `defaultOut`, `resolveLoc`, `placeOf`, `label`, `short`, `hm`, `hm5`, `modeWord`, `printPlan`, `shapeTable`, `orderRow`, `ORDER_HEAD`, `chain`, `isClean`, `runId`, `AIRPORT`, `AP_CODES`, `HUBS`, `PLACES`, `SPINES`, `SHORTLIST`, `DRAWS`, `spineOf`, `decisionsOf`, `choicesOf`, `assembleSpine`, `bandOf`, `timelineTable`, `decisionsTable`, `compareRow`, `COMPARE_HEAD`, `legsLine`, `cmdSpines`, `cmdSpine`, `cmdCompare`, `DENSITY_MAX`, `FLIGHT_CAP_H`.
