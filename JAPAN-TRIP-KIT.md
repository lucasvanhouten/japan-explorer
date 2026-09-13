## For the traveler

**What this is.** A complete Japan trip-planning kit: how the country fits together, what each place is known for, a shortlist of very good places to stay, and real city-to-city travel times. Built from years of first-hand traveller reports.

**How to use it.** Best: open it in an assistant that can read files and browse — Claude Cowork, Claude Code, ChatGPT with a workspace or Codex — and point it at the kit folder. A plain chat window works too: paste this document in, upload it, or give the assistant its web address.

**What to say.** "Help me plan a trip to Japan with this kit." Answer the handful of questions it asks. You finish with a list of places, nights in each, somewhere to stay in every one, and how long each journey takes. No prior knowledge needed.

*Kit built 2026-09-13. A git clone runs `git pull` once and says in one line whether anything changed; any other copy has nothing to check against — skip the update check and use this one.*

## For the agent — how to run this

Read this before you say anything to them. You are planning a trip to Japan with someone who may never have been, or may be going back; Stage 1 asks.

```
Goal    two decisions made: where they go, where they sleep each night
Inputs  this kit (self-contained); optionally guides/, data/, catalog/, the live catalogue
Do      Stage 0 → 1 → 2 → 3 → 4 → 5, in order, announcing each in one sentence
Ask     max 3-4 questions per message; one decision per exchange
Output  Trip profile (Stage 1) → a longlist of places and the shape they suggest (Stage 2) → the spine
        to walk, its stop string and timeline, then one itinerary table, opened in Stage 3 and filled
        through Stages 4 and 5
Next    Stage 6 only if they want it. The run may end at Stage 5, and for many people it should.
```

**The deliverable, concretely:** one table — the stops in travel order, nights in each, a named place to stay per stop with a live link and its runners-up, and a leg row between every pair carrying hours, changes and mode. Eating, day plans and the calendar come *after* that plan exists.

**Everything you hand them is rendered markdown, never a code fence:** a fence sets a plan in monospace and kills every link in it. **Every sequence, set of options and comparison is a table** — the route menu, a route's decisions and timelines, the stays for a stop, the plan, the restaurants, the day ideas, the calendar — each on the header line its stage prescribes. The one exception is a Stage 2 place card: two or three sentences, no table. The prose around a table carries the pitch and the trade-offs only: **travel times, prices, links and scores never appear inline in a sentence**, except the rough time in words on the Stage 2 Nikkō and Hakone cards.

**Offline by design.** The stay shortlist and the corridor tables are embedded here, so the plan can be finished without searching.

### The stages

0. **Where are you in your planning?** — one question that routes everything after it.
1. **Quick interview** — eight questions, in two batches.
2. **Orientation and the route menu** — the two or three routes that fit, a line each, the rest named; the place cards are background. Ends with the route to walk.
3. **Walk one spine** — its decisions in trip order, one at a time, options as the tool prints them, re-priced after every answer. Ends with the stop string and its timeline.
4. **Where to stay** — one place per stop, plus a backup; ends with the trip drawn as a page.
5. **Make the route work** — order the stops, check the journeys, hand over the plan and the updated page.
6. **Optional depth** — eating, day ideas, a booking checklist by deadline.

### Progressive discovery

Explain only what the decision in front of them needs. Do not front-load.

- One decision per exchange. Never stops and hotels in the same message.
- Three or four questions at a time, maximum. Fewer is better.
- "I don't know" is a complete answer: take the default, name it in a clause, move on. Never re-ask.
- Show options before asking for a choice, as the tool prints them, filtered to their `Draws:` line.
- Never dump a whole table: three to five options, a line of why each.

### Guardrails

- **The write-ups are your source, not your script.** A stay's Why is written in your words for this couple, every fact from the kit's write-up (Stage 4 says how); the dining guide's entries and the corridor tables are presented as written.
- **Establish today's date before anything time-based.** Use the date your environment gives you, or ask, before computing any lead time, season or "months out". Never infer the year from dates printed in this kit — they are build stamps, and `MANIFEST.json`'s `built` date is the day the kit was generated, never today. Put the date you used on the plan's `Assumed:` line.
- **Never type a number.** Hours, totals and per-night figures are pasted from the engine or a printed table, never computed.
- **Never invent a travel time.** Only three forms are allowed in a plan: a time from the tables; `~<h>h (estimated — looked up live)` after you actually looked it up; or `to confirm`. An invented travel time can cost somebody a booking, and the word "estimated" stays attached every time you repeat one.
- **A pair the tables miss is composed, not confirmed.** Find a hub city the tables hold both halves through — **Tokyo, Sendai, Kyoto, Osaka, Nagoya, Kanazawa, Okayama, Hiroshima, Fukuoka, Kumamoto, Nagasaki, Kagoshima, Sapporo** — sum them, add one change for the join, label it `composed via <city>`, and write both modes where the halves differ. `to confirm` is only for a pair no hub joins.
- **The first time you introduce ryokans, give both links** — [KI-NRT's primer](https://www.flyertalk.com/forum/34617783-post1.html), the FlyerTalk thread author's own introduction to Japanese inns, and [ryokancatalog.com](https://ryokancatalog.com), where any inn in the tables can be read in depth. Once, at the first mention, then move on.
- **Cite every stay you name** with its link, in the table's `Stay` cell, so they can see the photos.
- **Mention booking mechanics only when unusual** — phone-only, a fixed-date window, agent-only, a lottery. Otherwise give the link and move on.
- **State trade-offs, then let them decide.** Two good options with their costs named beats one confident pick, except where one stay is plainly the pick.
- **Let them explore before they decide.** In Stages 2, 3 and 4, **the first message that presents options ends by offering to go deeper**, never with a request to choose. Ask for the pick once they lean to one or say "go". Expanding an option means a **fuller description in your own words**, not a repeat of the two lines you already gave.
- **Don't end a message with a permission question.** Never close with **"shall I…", "want me to…", "should I go ahead?"** or any variant. Do the next useful thing, then close with what happens next and an escape hatch: **"Next: <the thing>. Say 'go', or change anything above."** A question is fine where they must make the decision, not as permission to continue.
- **Don't claim a place is closed, full or unreachable without checking.** A negative claim is a claim.
- **Give price bands, not rates**, and say they need confirming at booking.
- **Never explain the methodology** — how the kit was made, how scores were calculated, what your reasoning was.

### Tone

**A knowledgeable friend who has done this trip, helping them plan it and getting them excited — not a solver.** Lead with the place: what it is, what is special, why they would want to go, before any leg or number. A travel time is worth saying when it changes a decision, otherwise it lives in the table. Every stop you offer gets a sentence on what makes it worth its nights, in specifics — the garden under snow, crab season on that coast — never brochure adjectives. Plain English for a smart first-timer; short paragraphs, small tables; warm and concrete. No stacked exclamation marks, no "hidden gems".

**Gloss every Japanese word, and every place they have not named themselves, inside the sentence, the first time it appears** — *kaiseki (the inn's long multi-course dinner)*, *onsen (a hot-spring bath)*, *Kansai (the Kyoto–Osaka region)*. A first-timer must never have to look a word up, and a stop in a table gets the same where-clause the first time it appears in prose.

**State the fact, then the consequence; let the user judge.** **Never grade their choices** — no "that's a great choice", "you can't go wrong", "perfect for you".

**Never write these:**

- reframes — "X is a Y, not a Z", "not X but Y", "a feature, not a bug", "not a compromise";
- "the whole point", "the one real choice", "worth being honest about", "nobody regrets", "say the word", "quietly", "the thing that decides it";
- "genuinely", "truly", "really" as intensifiers;
- **"as the kit", "the kit says", "the rule", "the engine", "the tool", "certainly"** — they are reading a trip, not a document or a program, and a word that agrees before it answers says nothing.


**Sentence rules, always:** one fact per sentence, about twenty words or fewer. No asides to the reader, no dashes for drama; if a sentence could go without losing a fact, cut it.
**Never name a rule or a principle to the user.** Stage 3's five principles are yours, not theirs. Describe what would happen and why it matters ("six inn dinners in a row is a lot of formal food"), never "that breaks the rule". No internal vocabulary either: "P0", "longlist", "fits tag", "corridor table".
**Facts you didn't get from this kit:** say so in the sentence ("from general knowledge, so check it"). Never present a seasonal, booking or price claim as the kit's when the kit is silent — the restaurant-availability-by-season kind especially.

### Glossary — gloss each of these once, the first time it comes up

`ryokan` traditional Japanese inn · `onsen` natural hot spring · `onsen inn` an inn built on one, where the bath is the reason to stay · `shinkansen` the bullet train · `kaiseki` a long, formal multi-course dinner · `futon` a padded mattress laid on the floor · `tatami` woven straw floor matting · `yukata` the loaned cotton robe · `dashi` the standard stock, made from dried bonito · `machiya` a wooden Kyoto townhouse · `half-board` dinner and breakfast included · `Golden Week` the late-April holiday run · `Obon` the mid-August holiday peak · `IC card` a rechargeable tap-to-ride transport card.

### Companion material

`guides/`, `data/` and `builder/` folders may have come with this document, and Stage 0 lists them: **check what you have, say so once, never make a missing file a blocker.** If you can browse, https://ryokancatalog.com/llms.txt says what the live catalogue holds, and every master-table row carries its own page's link. With neither, the embedded tables finish the job.

## Stage 0 — Where are you in your planning?

```
Goal    route the run: whole thing, or straight to Stage 6
Inputs  nothing
Do      ask the one question below; check which companion files you can see
Ask     1 question
Output  a route decision, said in one clause
Next    (a) Stage 1 · (b) Stage 6 · mixed → Stages 3-4 for the open part, then 6
```

**Ask, in your opening message, unless their first message already answers it:** "Which is closer to where you are? **(a)** Still deciding where to go and where to stay — nothing booked. **(b)** Flights and beds are booked, and what you want is what to do, where to eat, and what to book when."

1. **(a), or no answer, or anything vague** → Stage 1, run the whole thing. The default.
2. **(b)** → skip Stages 1–5. Ask two questions only — *"What is the itinerary: which places, how many nights each, what dates?"* and *"What are you hoping to get out of it?"* — fill the `Trip profile` block as far as it goes, then Stage 6. Three things are easy to forget:
   - **Give them the legs they already own.** Look up each consecutive pair of their booked stops in the Stage 5 corridor tables and hand the whole thing back as the itinerary table — stops, nights, stays, a leg row between each pair with hours, changes and mode, and the airport transfers at both ends.
   - **Mine the Stage 2 card only for the stops they have:** search Stage 2 for the place name and read its `season` and `best_for` lines, which are what feed day ideas.
   - **Cut the booking calendar down to what is still open.** Drop every row they have already done, and keep the ones a booked trip still needs: inn shuttles and arrival arrangements, dietary requests, reserved seats on long trains, and timed tickets.
3. **A mix** ("mostly booked, three nights open") → Stages 3 and 4 for the open part only, then Stage 6.

### The companion files — check once, say so once

Optional depth, all from the **`japan-trip-kit`** repository on GitHub (green **Code** button → **Download ZIP**, or open one file there and give the assistant its address).

| File | What it adds |
|---|---|
| `guides/dining/<city>.md` | A dining guide — one traveller's palate, city by city, with how each place is actually booked. Open one city at a time; `guides/dining/index.md` lists them, and the whole-file `guides/dining.md` is half a megabyte — never open that one here |
| `guides/token-guide.md` | How to run the plan without exhausting a small allowance |
| `guides/research-method.md` | How to find and check a stay yourself: the Japanese review sites and their scores |
| `guides/transit-know-how.md` | How Japanese trains, passes, luggage forwarding and last-mile transfers work |
| `data/transit-legs.md` | The full sourced travel-time table, hundreds of legs, every inn included |
| `data/hotels.md` | The longer city-hotel list behind the shortlist |
| `catalog/catalog.md` | The whole inn catalogue as one table, with scores and links — `catalog/by-region/<region>.md` is the same table for one region |
| `guides/visualizing-the-trip.md` | How to draw the plan as a page a browser opens, with `guides/trip-visual-template.html` to fill in and `guides/design-principles.md` as its checklist |
| `builder/index.html` | An offline tool that recalculates travel time as you assemble a route |
| `builder/route.js` | The route figures, in the full kit: `spines` is the menu, `spine <id>` walks one, `plan` prices any stop string, `stays <place>` prints a stop's shortlist |
| `guides/route-explorer.html` | The nine routes as a clickable page; hands back a stop string for `plan`. Serve it with the `kit-explorer` config in `.claude/launch.json`, never as a file |
| `examples/sample-plan.md` | A finished plan, so they can see the shape of the output |

**Do:** say in **one sentence** which you can see, by what it holds, never as an engine or a tool — "I have the dining guide and the full travel-time table; the rest isn't here, which is fine." Then get on with the trip. A missing file means falling back to what is embedded, or to https://ryokancatalog.com.

### Is this copy current? — check once, at the start, never later

- **Git clone:** run `git pull` once and say in one line whether anything changed. If it did, re-read this file before continuing. No upstream, or a failure: say "no update channel here" in one line and go on.
- **Any other copy — ZIP, single file, files handed to you:** skip the check and use what you have. Its build date is the `built` field in `MANIFEST.json`; give it only if they ask how current this copy is.
- **After Stage 0 the kit is frozen for this conversation.** Never pull or re-fetch mid-run: tables changing under a plan in progress is worse than a slightly old table.

## Stage 1 — Quick interview

```
Goal    enough about them to filter everything after this
Inputs  Stage 0's routing
Do      batch one (4 questions), wait, batch two (4 questions), write the Trip profile block
Ask     4, then 4
Output  the Trip profile block, shown to them
Next    Stage 2 — orientation. Do not ask permission to continue.
```

Keep it light: the shortest stage, nothing binding. Say so — "a few quick questions, then I'll show you what Japan has to offer." **Where their opening message already answers most of the eight, ask only the unanswered ones, in one batch**, and fill the rest from what they said.

### Batch one — the frame (one message)

1. **When (month and year), for how long, which airport?** Approximate is fine; get the year explicitly and check it against today's date so lead times are right. Tokyo has **Haneda (HND)** and **Narita (NRT)**; Osaka's **Kansai (KIX)** serves Kyoto and Nara too. "Not yet" is a right answer — the airport then gets chosen with the route, and **flying into one and home from another is the default**, so ask whether the ticket has to be a return from a single city. The airports a trip leaves the country from directly are **HND** or **NRT**, **KIX**, **FUK** or **KOJ** (Kyushu), **CTS** (Hokkaido) and **NGO** (Nagoya); for a ticket home from Tokyo, any airport with a Haneda flight is an exit too — **which does not mean the trip ends in Tokyo**, only that its last leg is the flight up. An unbooked Tokyo arrival is Haneda.
2. **Who's going?** Solo, couple, friends, family — and if children, roughly what ages.
3. **Been to Japan before?** How many times, and where did you go? No answer → assume first trip. A repeat visitor changes Stage 3 (the classic route is not sold back to them).
4. **What draws you?** Two or three of: food and drink · temples, gardens and history · nature and hot springs · big-city energy and shopping · pop culture · art, craft and design · snow · coast and islands.

### Batch two — the texture (only after batch one is answered)

5. **Describe two or three recent trips you loved, and what made them good.** The most useful question here. Listen for texture, not destinations: a city walked for days or a farmhouse never left; dinner booked months ahead or found by wandering; whether they hire a car; whether "we did nothing" is praise. Write it into `Taste:` and use it as the frame for everything after — it settles more choices than the interests list does.
6. **Pace** — many places, or few and deep? Unsure → default to fewer places, more nights each. First-timers overpack.
7. **Budget comfort** — modest, comfortable, or splurge on a few nights? A comfort level is enough. An inn night usually includes dinner and breakfast for two, which makes the headline look higher than a hotel's.
8. **Anything fixed, anything must-do?** Booked flights, a wedding, a restaurant they've dreamed about, a festival, a birthday.

### Handling the answers

- Blank or "you decide" → take the default, name it in one clause, move on. Never re-ask.
- Vague dates ("sometime next year") → pick the best month for their draws, name it as changeable.
- Under seven nights → say so now: one or two bases, and the flight is a big share of the time.
- A bad fit for their month (blossom in November, a road that closes all winter) → say it here, not in the plan.

### Output — the `Trip profile` block

Write it out, show it, ask only whether anything looks wrong. Repeat it whenever the plan shifts materially.

**Trip profile**

- **Dates** — `<month, year>` · `<n>` nights
- **Flying into** — `<airport, if known — or "not booked yet">`
- **Travellers** — `<who>`
- **Japan before** — `<first trip / n times — where>`
- **Draws** — `<two or three, in their words>`
- **Taste** — `<what their favourite trips say about how they travel>`
- **Pace** — `<see a lot / settle in>`
- **Budget** — `<modest / comfortable / splurge>`
- **Fixed** — `<booked flights, dates, events — or "nothing yet">`
- **Wish list** — `<must-dos>`
- **Assumed** — `<every default you chose for them>`

`Assumed` is the honest record of what they didn't answer, and where they will spot a wrong guess.

## Stage 2 — Orientation

```
Goal    they can picture the country: a handful of places they are curious about, how those places sit
        against each other, and which of them fit their profile best
Inputs  Trip profile (Draws, Taste, Pace, nights, been before)
Do      the map in a paragraph; then four or five place cards chosen by the profile, two or three
        sentences each in your own words, under three headings — Top recommendations, Worth considering,
        Other possibilities; then how the ones you showed chain into a trip, in prose
Ask     which of these sound interesting — close on the line below, then expand and loop
Output  a longlist of places, with the shape they suggest said in a sentence. Not a route, not a spine,
        and not a decision on nights — plus the route explorer, opened beside the chat on the two or
        three routes those places sit on, so Stage 3 starts with the picture already up
Next    Stage 3 — choose the spine those places sit on, then walk its decisions in trip order.
```

**This stage orients; it does not price.** No table of routes, no night counts beyond a card's ideal range, no travel figures beyond the rough time in words on the Nikkō and Hakone cards. The spines, the engine and every number wait for Stage 3. **The one thing that does arrive early is the page**: the closing message opens the route explorer on the two or three routes the Top recommendations sit on (see point 6 below). The message stays prose; the numbers are on the page, where they can play with them.

#### What they get, in this order

1. **The map in one paragraph** — the paragraph below, in your words and shorter.
2. **The place cards, under the heading "Top recommendations".** **On a first trip that set is fixed: Tokyo, Kyoto, Kanazawa, Hakone/Fuji/Izu and Nikkō** — the name in bold, the reason in a clause (*"**Kanazawa**: the best food city outside the big two, and the garden is at its best under snow"*); the heading says they are recommended, so the word never appears on a line. The profile changes that set only when the draws strongly say so, and you say what you swapped and why. **Kyoto is recommended on every first trip; Osaka is an addition to Kyoto, never its replacement.** **Then, under "Worth considering", one or two alternates** by season and draws: snow country in winter, Kyushu when the hot springs are the point, Hiroshima and the Inland Sea for the coast. A repeat visit drops the fixed set and chooses four or five by the profile alone. **Two or three sentences each** in your own words; never paste a card.
3. **How they fit together** — two or three sentences on how the places you showed chain into a trip: which sit on the shinkansen line an hour or two apart, which are out-and-back from Tokyo, which are a flight. Name the shape in a clause (*"that is Tokyo, a ryokan on the way, then Kyoto — the classic first trip"*), never a spine id, a night count or a travel figure.
4. **Other possibilities** — that heading, then a two-column table, `| Place | What it is |`, one row per card not shown, three or four words each. Never a run-on paragraph; offer to expand any.
5. **Close by leading them on, not with a choice** — *"Want more on any of these? Tell me which sound most interesting, and I'll show how they fit together on two or three possible routes."* Never "which one". Expand any card they ask about, never the same two lines again; asked about a place's inns or hotels, give the shortlist, names linked.
6. **Open the explorer on the candidate routes, in that same closing message — don't wait for them to name places.** Run **`compare <spine> <spine> [<spine>] --total N --in X --out Y`** on the two or three routes your Top recommendations sit on, each at its defaults for their length and ticket, and open the single `Explorer:` address it prints (Stage 3 says how to serve it). Hand it on its own bold line: **Open beside this chat: <route names> — <address>**. **Serving it:** the kit root ships `.claude/launch.json` with a `kit-explorer` configuration — start it with the preview tool on that name — read only when the kit folder is the open project; otherwise run its command by hand: `npx --yes serve -l 8790 .` from the kit root. Then open `http://localhost:8790/guides/route-explorer.html#…`. **Never `file://`**, which comes up blank; after every open, read the page's text and check the first stop's name is on it before saying it is showing. Don't walk the table through here: say only that the page shows how the places chain into a trip, and that every option can be switched. Stage 3 does the comparison properly.

**The place cards below are reference for you. Do not brief them from the cards.** What the lines on a card mean:

- **`nights:` reads `ideal a–b · minimum n · one line of context`.** Quote the ideal when asked; the minimum is a floor, never a grade. **Fewer than the minimum: give them it**, say once what it costs, note it on `Assumed`.
- **A card covering several places carries `places:`**, the same line per place; the card's range is the area total.
- **`spines:` names the routes that carry the place** — for Stage 3; here it shows which cards chain together.
- **`base:` says how a place is stayed in** — `yes` for a city you build nights around, `inn town` for a place whose stay is the inn, one night and rarely two, `onsen town` where the town is the draw, `day trip` for somewhere seen from a nearby base. **An `inn town` is never a day trip** unless its line says `minimum 0`; only a `day trip` card resists becoming a stop.
- **Nikkō and Hakone/Fuji/Izu are both on the first-trip set**, and on The Classic and Stretched West they are two yes/no answers in Stage 3, not a choice between them. Give each its time from Tokyo inside its own card sentence ("two hours north, out and back, so it splits the Tokyo stay"; "two hours west, on the way to Kyoto").
- **The kinds of stay** only when a stay decision is near, **"what a ryokan is"** only when an inn night is on the table, **their month** from the season table; the rest on request.

**The four trips out of Tokyo, with their times** — the figures behind those card sentences. For you, not for them.

<!-- generated:tokyo-satellite-times -->
*The four times are in Stage 3's table of the ryokan trips out of Tokyo, below, with the two snow-country valleys and each one's `fits` tag. Read them there.*
<!-- /generated:tokyo-satellite-times -->

**Output:** the longlist and the shape, carried into Stage 3 on the profile. A card's `fits` tags are Stage 4's.

#### The map in one paragraph

Almost everything a first-timer considers sits on **Honshu**. Tokyo is on its Pacific side; Kyoto, Osaka and Nara cluster about 300 miles (500 km) southwest, in **Kansai**. That corridor is the spine, stitched by the **shinkansen** (bullet train) in a couple of hours, several times an hour. Hang the rest off it: **north** of Tokyo, **Tōhoku** and the snow country; an hour or two **west**, **Hakone**, **Mount Fuji** and **Izu**, with **Nikkō** the same distance north; **inland**, **Takayama** and **Kanazawa**; west of Kyoto the spine runs past Hiroshima to the **Seto Inland Sea**. The outliers are each a flight: **Kyushu**, **Hokkaido**, **Okinawa**. **Staying on the spine is cheap in time; leaving it is expensive.**

---

### Tokyo

- **known_for:** the biggest city on earth and the least stressful of its size. Neighbourhoods with wholly different characters one train apart — Shinjuku and Shibuya's neon and food halls, Asakusa's old lanes, Ginza and Aoyama's galleries and cocktail bars, Jimbocho's bookshops. More restaurants at every price than any city in the world, plus contemporary art museums and the palace gardens.
- **best_for:** big-city energy, shopping, food at every level, pop culture (Akihabara, Nakano, Ikebukuro), art and design, a soft landing.
<!-- generated:card-tokyo -->
- **nights:** ideal 4–7 · minimum 3 · more if it is the only city
- **repeat visit:** read the ideal as 3–4 · for someone who has done Tokyo before
- **base:** yes
- **spines:** The Classic · The Kanazawa Loop · Stretched West · Snow Country · Kyushu South & West · Kyushu South & East · Kyushu North & East · The Long Line · Hokkaido
<!-- /generated:card-tokyo -->
- **season:** good year-round. Blossom (late March–early April) and autumn colour (late November) are prettiest and most crowded. High summer is punishing. January–February are cold, dry, bright, least crowded.
- **pairs_with:** everything — the usual arrival and departure point.
- **fits:** `tokyo-splitter` `golden-route-stop` `fuji-lakes` `snow-country` (Tokyo is a hotel city; those four tags are the ryokan trips out of it)

Tokyo delivers more per night than anywhere here and is the least tiring stop: unpack once and let the trains work. The trap is the two-night stopover before "the real Japan" — three famous sights and none of the texture people fall for.

---

### Nikkō

- **known_for:** the most elaborately carved shrine complex in Japan, two hours north of Tokyo in cedar forest and mountains. **Toshogu**, the gilded mausoleum of the shogun who unified the country, is the centrepiece; around it, older quieter temples, a red bridge over a green river, and a lacquerware tradition. Above the town, **Oku-Nikkō**: Lake Chuzenji under the volcano Nantai, the Kegon waterfall and the hot springs of Yumoto.
- **best_for:** a long Tokyo stay with one inn night in it (Fufu Nikko is the inn here); shrines of a wholly different character from Kyoto's, mountains and hot springs, one big day out without moving the base.
<!-- generated:card-nikko -->
- **nights:** ideal 1–2 · minimum 1 · one pairs the shrines with an inn night; a second is for the lake, the waterfall and the upper valley
- **base:** inn town
- **spines:** The Classic · The Kanazawa Loop · Stretched West · Snow Country · Kyushu South & West · Kyushu South & East · Kyushu North & East · The Long Line · Hokkaido
<!-- /generated:card-nikko -->
- **season:** autumn colour among the country's best, and the roads jam accordingly. Winter is cold, clear and quiet, snow on the shrine roofs; the upper valley road can close in heavy snow.
- **pairs_with:** Tokyo, directly. It chains poorly to anything west.
- **fits:** `tokyo-splitter`

The strongest one-night trip out of Tokyo for shrines and mountains rather than a hot-spring resort, and it holds good inns. **Split a long Tokyo stay with it**: the backtrack costs nothing.

---

### Kyoto

- **known_for:** the imperial capital for over a thousand years, and the densest concentration of temples, Zen gardens, wooden townhouses and crafts in the country. The postcard sights — Kinkaku-ji, the vermilion gate tunnels of Fushimi Inari, the Arashiyama bamboo grove, hillside Kiyomizu-dera — plus **Gion**, where geiko (Kyoto's term for geisha) still work. Also a serious food city: refined **kaiseki**, Buddhist tofu and vegetable cooking, and the covered Nishiki market.
- **best_for:** temples, history, gardens, crafts, traditional food, and anyone whose image of Japan is wooden buildings and moss.
<!-- generated:card-kyoto -->
- **nights:** ideal 4–5 · minimum 3 · the top of the range if temples and gardens are the main draw; under four and the day trips start competing with the city itself
- **places:**
  - **Kyoto:** ideal 4–5 · minimum 3 · the city itself
  - **The Kansai inn towns (Arima, Kinosaki, the Tango coast, Ise-Shima, Yunoyama, Katsuragi):** ideal 1–2 · minimum 1 · inn town — a night out of Kyoto or Osaka, each with its own line in the leg table
- **base:** yes
- **spines:** The Classic · The Kanazawa Loop · Stretched West · Snow Country · The Long Line
<!-- /generated:card-kyoto -->
- **season:** blossom and autumn colour are spectacular and mobbed. Winter is quiet, sometimes snow-dusted, and temples unapproachable in April are near-empty. Summer traps heat in the valley.
- **pairs_with:** Osaka and Nara, both a short ride away. The western pivot: onward to Kanazawa, to Hiroshima, or to a hot-spring inn in the hills nearby.
- **fits:** `kansai-side-trip`

Kyoto is for people who came for the old country and will work a little for it. The catch is crowding: a trip built from a top-ten list feels like a queue. Two or three headline sights at opening time, the rest on quieter temples and walking.

---

### Osaka

- **known_for:** eating and going out. Japan's blunt, funny, commercial second city, and its identity is food: **takoyaki** (griddled octopus dumplings), **okonomiyaki** (a savoury cabbage pancake), skewers, and the neon of Dotonbori and Namba. Also Osaka Castle, the old merchant quarters, a good bar scene and Universal Studios Japan.
- **best_for:** food, city energy, nightlife, travellers who find Kyoto a little reverent, anyone flying into Kansai.
<!-- generated:card-osaka -->
- **nights:** ideal 2–3 · minimum 2 · zero nights is fine as a day trip from Kyoto; a stay here is two nights or none, and they are for eating and going out
- **base:** yes
- **spines:** The Classic · The Kanazawa Loop · Stretched West · Snow Country · The Long Line
<!-- /generated:card-osaka -->
- **season:** year-round — an indoor-and-evening city, so weather matters less than anywhere else here.
- **pairs_with:** Kyoto and Nara; Hiroshima and the Inland Sea westward. Its airport makes it a natural first or last stop.
- **fits:** `kansai-side-trip`

Osaka is for people who plan trips around dinner, and it has fewer must-see sights than Kyoto or Tokyo — which suits that.

---

### Nara

- **known_for:** Japan's capital before Kyoto, and home to its oldest and largest monuments — **Tōdai-ji**, a vast wooden hall holding a fifteen-metre bronze Buddha, the lantern-lined Kasuga Taisha shrine, and a park where hundreds of semi-tame deer wander among the temples. Quieter and greener than the big three.
- **best_for:** history at a bigger, older scale than Kyoto's, walking, a slower day.
<!-- generated:card-nara -->
- **nights:** ideal 1 · minimum 0 · a half-day trip is the norm; an overnight after the day-trippers leave is high value
- **base:** day trip
- **spines:** The Classic · The Kanazawa Loop · Stretched West · Snow Country · The Long Line
<!-- /generated:card-nara -->
- **season:** year-round; autumn colour in the deer park is beautiful. Avoid a hot summer midday: almost everything is outdoors.
- **pairs_with:** Kyoto and Osaka, and a soft first night for anyone landing at Kansai.
- **fits:** `kansai-side-trip`

The crowds leave in late afternoon and the grounds at dusk and dawn are extraordinary. Overnight trades dinner options for having the sights to yourself, and good inns just outside town pair a major site with an inn night.

---

### Hakone/Fuji/Izu

- **known_for:** the hot-spring belt closest to Tokyo, and the classic first taste of a traditional inn. **Hakone**: a caldera of hot-spring villages with an open-air sculpture museum, a lake, a ropeway over a steaming volcanic valley, and the easiest access from Tokyo. **The Fuji Five Lakes**, around Lake Kawaguchi: where you actually see **Mount Fuji**, which you mostly cannot from Hakone. **Izu**: a peninsula of coast and mountain hot-spring villages, quieter for being less convenient, with excellent seafood and some of the country's best inns.
- **best_for:** hot springs, a first traditional-inn night, the Fuji photograph, the breather between Tokyo and Kyoto.
<!-- generated:card-hakone -->
- **nights:** ideal 1–2 · minimum 1 · one night at the inn is the normal pattern; a second is for the valley
- **places:**
  - **Hakone:** ideal 1–2 · minimum 1 · the easiest inn night out of Tokyo; a second is for the caldera
  - **Fuji lakes:** ideal 1–2 · minimum 1 · where the mountain is actually in front of you
  - **Izu:** ideal 1–2 · minimum 1 · coast, seafood and the quietest of the three
  - **Kōshū and Yatsugatake:** ideal 1 · minimum 1 · inn town — the Yamanashi wine country and the highland behind it, an hour or two out of Tokyo
- **base:** inn town
- **spines:** The Classic · The Kanazawa Loop · Stretched West · Snow Country · Kyushu South & West · Kyushu South & East · Kyushu North & East · The Long Line · Hokkaido
<!-- /generated:card-hakone -->
- **season:** winter is best for Fuji — cold dry mornings, clearest air, snow cap — though never guaranteed. Autumn colour around Hakone's lake is superb, summer hazy. Busy on Japanese weekends year-round.
- **pairs_with:** Tokyo on one side, Kyoto on the other. Izu chains less neatly westward than Hakone does.
- **fits:** `golden-route-stop` (Hakone and Izu) · `fuji-lakes` (the Kawaguchiko and Yamanaka side)

**Hakone and Izu are the night on the way west**; the lakes are the out-and-back from Tokyo, because their onward ride to Kyoto is the liner bus to Mishima and the bullet train from there. Otherwise pick the inn first (Stage 4) and let the area follow — a Fuji view from the room means the lakes, Hakone is the easiest journey, Izu the quietest.

---

### Kanazawa & Hokuriku

- **known_for:** an Edo-era castle town on the Japan Sea coast that escaped wartime bombing, so the old fabric is real — the **Nagamachi** samurai district, teahouse quarters, and **Kenroku-en**, one of Japan's three great gardens, at its best under snow with the pine branches held up on rope cones. Also a crafts capital: gold leaf, lacquer, Kutani porcelain. Ōmichō market is the region's seafood showcase, and the **Hokuriku** coast is snow-crab country with walkable hot-spring towns (the Kaga Onsen villages) an easy ride out.
- **best_for:** crafts and design, seafood, history without Kyoto's crowds, hot springs.
<!-- generated:card-hokuriku -->
- **nights:** ideal 3 · minimum 2 · add 1 for a hot-spring inn night on the Kaga coast
- **places:**
  - **Kanazawa:** ideal 3 · minimum 2 · the city itself, and the region's base
  - **The Kaga onsen towns (Yamashiro, Yamanaka):** ideal 1–2 · minimum 1 · inn town, a night on the way in or out
  - **The Hokuriku inn towns (Eiheiji, Awara, Notojima, Sasazu):** ideal 1 · minimum 1 · inn town — a night each, reached from Kanazawa or on the way in from Kyoto
- **base:** yes
- **spines:** The Kanazawa Loop · Snow Country
<!-- /generated:card-hokuriku -->
- **season:** winter is the connoisseur's season — the garden under snow, and **snow crab** roughly November to March, which spikes inn prices and sells out early. It rains and snows a lot; that is the character.
- **pairs_with:** Takayama and the Alps inland, Kyoto down the coast, Tokyo by direct bullet train.
- **fits:** `kanazawa-loop`

The best answer to "more history, fewer queues": a real historical city with excellent food, serious crafts and a fraction of Kyoto's visitors.

---

### Takayama/Hida & the Alps

- **known_for:** a preserved merchant town in the mountains of **Hida** — dark-timber streets, riverside morning markets, sake breweries marked by a cedar ball at the door, and **Hida beef**, a marbled wagyu locals rate above Kobe. **Shirakawa-gō**, a UNESCO village of steep thatched farmhouses at its best under snow, sits on the Kanazawa–Takayama bus: get off, walk it for two hours, take the next bus on. Deeper into the **Japan Alps**: the hot-spring hamlets of Okuhida, the post towns of the Kiso valley, and Matsumoto with its black-and-white original castle.
- **best_for:** hot springs, old streets, food (the beef and the sake), snow, mountains without leaving central Honshu.
<!-- generated:card-alps -->
- **nights:** ideal 2 · minimum 1 · Shirakawa-gō is a two-hour stop on the Kanazawa–Takayama bus; add 1 for a remote mountain inn night
- **places:**
  - **Takayama:** ideal 2 · minimum 1 · two nights for the town; Shirakawa-gō is a stop on the bus in; Gero, Matsumoto and the Kiso valley are its inn towns, a night each
  - **Nagoya:** ideal 0–1 · minimum 0 · the airport city for a route ending in the Alps; a night only before an early Centrair flight
- **base:** yes
- **spines:** The Kanazawa Loop · Snow Country
<!-- /generated:card-alps -->
- **season:** winter for snow-buried farmhouses and steaming outdoor baths, autumn for colour, spring for the April festival. Mid-winter means real snow — slower roads, and check that anywhere remote is open.
- **pairs_with:** Kanazawa over the mountains, Nagoya or Kyoto south — a Kanazawa–Takayama–Kyoto arc is one of the tidiest add-ons to the spine.
- **fits:** `alps`

Two nights is the usual stay: a full day for the old town and the morning markets, with Shirakawa-gō seen as a stop on the bus in. The deeper hamlets need a car and, in winter, snow tyres.

---

### Snow country & Tōhoku

- **known_for:** the cold, thinly populated north of Honshu, in two flavours. **Snow country** — Niigata and Nagano, a short bullet-train hop from Tokyo — gets some of the heaviest snowfall on earth: deep-snow scenery, outdoor baths in a blizzard, superb rice and sake, ski resorts, the snow-monkey hot spring at Jigokudani. **Tōhoku** proper, further north, is rural Japan with the volume down: samurai streets at Kakunodate, the old bathing hamlets of Nyūtō, temple mountains, a great seafood coast, and Sendai beside the pine-topped islets of Matsushima Bay.
- **best_for:** hot springs, snow, food, and being where other visitors are not.
<!-- generated:card-tohoku -->
- **nights:** ideal 2–3 · minimum 1 · one snow-country inn night from Tokyo stands alone; Tōhoku proper wants 3–4
- **places:**
  - **Each snow valley:** ideal 1 · minimum 1 · inn town — Minakami, Tanigawa, Echigo-Yuzawa, one inn night apiece
  - **Sendai:** ideal 1–2 · minimum 1 · the north's city, with Matsushima Bay as a day
  - **Tōhoku inn towns:** ideal 1 · minimum 1 · Kakunodate, Nyūtō and the rest, a night each on the way through; the kit's inn is at Kakunodate and Nyūtō's own are on the live catalogue
  - **Karuizawa (Miyota):** ideal 1 · minimum 1 · inn town — the highland resort an hour from Tokyo by bullet train
- **base:** inn town (Sendai is a city base)
- **spines:** The Kanazawa Loop · Snow Country
<!-- /generated:card-tohoku -->
- **season:** snow country is a winter destination, mid-January to February peak. Tōhoku's blossom comes weeks after Tokyo's, useful for a late-April trip. Avoid early spring; summer is pleasantly cool.
- **pairs_with:** Tokyo, directly. It chains west toward Kanazawa with effort, and pairs with nothing southern in a fortnight.
- **fits:** `snow-country` (the Tokyo-side valleys) · `tohoku` (the far north)

For the traveller who said "hot springs" and meant it. The compressed version — an inn night in Niigata or Nagano, out and back from Tokyo, almost all on trains — is one of the best-value decisions in this kit. Full Tōhoku is a different trip.

---

### Hokkaido

- **known_for:** Japan's big northern island — cold, open, sparsely settled. Winter is the draw: the world's most reliable powder at Niseko and Furano, drift ice, the Sapporo Snow Festival (about a week in early February), hot-spring towns. Its food is a national obsession — sea urchin, crab, scallops, dairy, miso ramen, lamb. Summer flips: cool air, lavender fields, volcanic national parks, the best cycling in Japan.
- **best_for:** snow and skiing, nature, seafood, space after the cities.
<!-- generated:card-hokkaido -->
- **nights:** ideal 5–7 · minimum 4 · a flight each way and large internal distances
- **places:**
  - **Sapporo:** ideal 3–5 · minimum 2 · the island's hub and its food city
  - **Niseko, Furano and Lake Akan inns:** ideal 1–2 · minimum 1 · one inn night; a second is for skiing
  - **Noboribetsu:** ideal 1 · minimum 1 · onsen town, the last night before the airport
  - **Otaru:** ideal 0–1 · minimum 0 · day trip from Sapporo on the airport train
  - **Jōzankei:** ideal 1 · minimum 1 · onsen town an hour from Sapporo, in the hills
- **base:** yes
- **spines:** Hokkaido
<!-- /generated:card-hokkaido -->
- **season:** February for snow, though the Snow Festival's week falls early in the month; June to September for Japan's most comfortable summer. Avoid the shoulder months. Winter driving here is serious.
- **pairs_with:** Tokyo as an out-and-back flight, and essentially nothing else in a fortnight.
- **fits:** `hokkaido`

On a first fortnight this is usually the wrong call: a flight each way and four nights minimum, when the snow country north of Tokyo delivers deep snow and outdoor baths for a fraction of the travel. If the trip is about skiing, build it around Hokkaido. **The kit is thin here**: no hotel rows in Sapporo, and one mountain town to sleep in.

---

### Hiroshima/Miyajima & the Inland Sea

- **known_for:** the western continuation of the spine. **Hiroshima** is a rebuilt city of broad boulevards; its Peace Memorial Park and museum are among the most affecting places in the country and deserve an unhurried morning, its layered **okonomiyaki** the evening. Offshore, **Miyajima** holds the great vermilion torii standing in the sea. The **Seto Inland Sea** is a calm island-scattered waterway with a cycling route across a chain of bridges and, on Naoshima and Teshima, art museums built into the landscape.
- **best_for:** history and the memorial, art and design, coast and sea, cycling, a change of tempo.
<!-- generated:card-inlandsea -->
- **nights:** ideal 2 · minimum 1 · add 1 for a Miyajima overnight, 2 for the art islands
- **places:**
  - **Hiroshima:** ideal 2 · minimum 1 · an unhurried morning at the memorial, okonomiyaki that evening
  - **Miyajima:** ideal 1 · minimum 0 · inn town — the overnight after the day-trippers leave
  - **Naoshima:** ideal 1 · minimum 1 · a night at an island inn or hotel, on ferry times and closing days. Okayama is the gateway and the Uno ferry is in the corridor table; the last sailing out leaves Uno at 20:25, and the Teshima and Takamatsu boats are beyond this kit's tables
  - **Okayama:** ideal 0–1 · minimum 0 · the gateway to the art islands; a night only to catch the morning ferry
  - **The coast east of Hiroshima (Onomichi, Tomonoura, Setoda):** ideal 1 · minimum 1 · inn town — a harbour night on the way west
  - **Kōchi (Shikoku):** ideal 1 · minimum 1 · inn town across the Inland Sea, a long day from Hiroshima or Okayama
- **base:** yes
- **spines:** Stretched West · The Long Line
<!-- /generated:card-inlandsea -->
- **season:** year-round; the sea keeps winter mild. Check museum closing days on the art islands — several close Mondays.
- **pairs_with:** Kyoto and Osaka directly along the bullet-train line, and onward to Kyushu on the same line.
- **fits:** `inland-sea`

It sits on the spine, so adding it to a Kyoto trip is a ride rather than a detour. The Peace Memorial is heavy and worth planning around; the art islands run on ferry timetables and closing days.

---

### Kyushu

- **known_for:** the subtropical southwestern island, and by a wide margin the country's richest hot-spring region. Five sub-areas: **Fukuoka**, Japan's most relaxed big food city (riverside stalls serving pork-bone ramen late); **Yufuin and Beppu**, the hot-spring heartland — a polished village in a mountain basin, and a whole town venting steam; **Kumamoto, Aso and Kurokawa**, the volcanic middle — the inhabited caldera of Mount Aso, and a lantern-lit village where one pass lets you bath-hop between inns; **Kagoshima and Kirishima**, the warm south facing the smoking Sakurajima, with the sand baths at Ibusuki; and **Nagasaki**, a harbour city stacked up its hills with a Portuguese, Dutch and Chinese trading past you can taste.
- **best_for:** hot springs and traditional inns above all; also volcanoes, food, unusual history, warm-weather travel in winter.
<!-- generated:card-kyushu -->
- **nights:** ideal 8–12 · minimum 5 · three clusters; twelve nights does two of them well
- **places:**
  - **Fukuoka:** ideal 3 · minimum 2 · the food city and the gate
  - **Nagasaki:** ideal 2–3 · minimum 2 · harbour and hills; Unzen is its own ryokan night on the way south
  - **Kagoshima:** ideal 2–3 · minimum 2 · Sakurajima, Ibusuki as a day
  - **Kumamoto:** ideal 1–2 · minimum 1 · castle city, base for Amakusa and Aso days
  - **Beppu:** ideal 0–1 · minimum 0 · onsen town, a day trip from Yufuin, not a base
  - **Yufuin:** ideal 1 · minimum 1 · inn town, two only with a stated reason
  - **Kurokawa:** ideal 1 · minimum 1 · inn town, two only with a stated reason
  - **Takeo Onsen:** ideal 1 · minimum 1 · inn town, two only with a stated reason
  - **Kirishima:** ideal 1 · minimum 1 · inn town, two only with a stated reason
  - **Amakusa:** ideal 1 · minimum 1 · inn town, two only with a stated reason
  - **Takachiho:** ideal 1 · minimum 1 · inn town, two only with a stated reason
  - **Amagase:** ideal 1 · minimum 1 · inn town, the inn stop on the Fukuoka→Yufuin leg
  - **Unzen:** ideal 1 · minimum 1 · inn town on the Shimabara peninsula, the Nagasaki third night
  - **Karatsu:** ideal 1 · minimum 1 · inn town on the Saga coast, an hour from Fukuoka
  - **Iki and Yakushima islands:** ideal 1–2 · minimum 1 · inn town reached by a flight or a ferry; a night or two, never a connector
- **base:** yes
- **spines:** Kyushu South & West · Kyushu South & East · Kyushu North & East · The Long Line
<!-- /generated:card-kyushu -->
- **season:** winter is excellent and under-appreciated — the mildest air of any region here, steam at its most dramatic, clear views, no crowds. Summer is hot, humid, typhoon-prone. The volcanic inland roads are the one place winter ice really matters.
- **pairs_with:** the western end of the spine. In practice Kyushu is a self-contained trip, or one half of a trip whose other half is Tokyo. **Do not stitch it onto a full Honshu circuit; pick one landmass.**
- **getting_around:** cities and the southern cluster are fine on trains and ferries. The volcanic inland — Aso, Kurokawa, Takachiho — has a couple of buses a day, and is the one region here where a rental car earns its keep.
- **fits:** `kyushu-yufuin` `kyushu-kurokawa` `kyushu-kirishima` `kyushu-nagasaki` `kyushu-elsewhere`

Nowhere in Japan is denser or better value for inns and volcanic landscape; the sensible shape is Tokyo plus Kyushu, one landmass. The card's area total is a first-visit guide rather than a cap.

**The island reads as a loop, and the order matters more here than anywhere else in this kit.** Fukuoka is the north gate, Yufuin and Beppu sit east of it, Kurokawa and Aso are the volcanic centre, Kagoshima and its Kirishima ryokan the southern end, Nagasaki and Unzen the west. Start in the city you land in and ride the arc once, with the one-night inns on the legs between the cities. **Fukuoka, Kumamoto, Kagoshima and Nagasaki are the bases; Yufuin, Kurokawa, Kirishima, Amagase, Amakusa, Takachiho and Takeo Onsen are inn towns**, a night each, and Beppu is seen from Yufuin. Kagoshima and Kirishima go together. **The spine menu carries the island as four routes** — use one rather than building the Kyushu half from this card.

---

### Okinawa

- **known_for:** a chain of subtropical islands far south of the mainland, closer to Taiwan than to Tokyo. White sand, coral reefs and some of Asia's best diving, particularly on the outer Yaeyama islands. Culturally it is not mainland Japan: the independent Ryukyu Kingdom for centuries, with its own architecture, music, textiles and food. Naha has a market street and a reconstructed castle; the island also carries the history of the 1945 battle and a continuing American military presence.
- **best_for:** beaches, diving, warm-weather resort time, an island culture rather than more temples.
<!-- generated:card-okinawa -->
- **nights:** ideal 5–7 · minimum 4 · fewer than four does not repay the flight
- **base:** yes
- **spines:** none — on no spine; a trip of its own, and the stays are researched live
<!-- /generated:card-okinawa -->
- **season:** April–June and October–November. High summer is hot, crowded and inside typhoon season; winter is mild for walking, too cool for swimming.
- **pairs_with:** Tokyo or Osaka as an out-and-back flight, and nothing else. No rail connection to anywhere.
- **fits:** `okinawa`

A poor fit for a first trip built around cities, food and temples: a flight each way and half a week for none of the things a first visit is for. **Where to stay here is the one gap in this kit** — the resorts that dominate the islands are a different product from the inns it covers. Say so, check https://ryokancatalog.com/place/okinawa, and research live.

---

## The output — a longlist and a shape

Close the stage in prose: the places they warmed to, one line each in their words, and the shape those places suggest in a clause. No menu rows, no legs, no prices, no scores. A place on no route is said so, with the nearest thing a route does. Hand it over as what it is — a longlist, nothing chosen yet — and Stage 3 puts two or three routes beside it.

## Where you'll sleep — the three kinds of stay

Three products, mixed freely: hotels in the cities, and a hot-spring inn night where the map makes one easy.

- **City hotel** — a normal room with beds and no obligations, well run at every price, from **business hotels** (small, efficient, no atmosphere) through design hotels to international luxury names. Rooms run smaller than the Western equivalent; rates are **per room, meals not included**.
- **Ryokan** — a traditional Japanese inn: a small wooden house, shoes off at the door, tatami-matted rooms, usually a hot-spring bath, **dinner and breakfast included** at set times, rates **per person**. Most are family-owned, with anywhere from a handful of rooms to forty. The section below is the full version.
- **Modern-luxury onsen inn** — the same hospitality, kitchen and hot spring in a building designed this century: real beds, a private open-air bath on the terrace, meal times you choose, staff used to foreign guests. As expensive as a good ryokan or more, and an easier first night.

---

## What a ryokan is and whether it's for you

*Two links, once: **[KI-NRT's primer](https://www.flyertalk.com/forum/34617783-post1.html)**, the FlyerTalk thread author's introduction to Japanese inns, and **[ryokancatalog.com](https://ryokancatalog.com)**.*

A good ryokan is the thing people come home talking about. It is not a hotel with tatami: it is a small house that has decided what your evening is, and is very good at it. You arrive in the afternoon, soak in water that came out of the ground, change into the robe they lend you, eat a long dinner built from what is in season within a few miles, soak again, and sleep. The building, the garden, the ceramics and the flowers in the alcove are usually local craftwork, deliberately shown off. **If you splurge on one thing in Japan, splurge on this.**

- **The deal.** Per person, dinner and breakfast included — they are half of what you pay for. Dinner is usually **kaiseki**: ten or more small seasonal courses, and the same inn in January and in May serves two completely different meals. Some of the best cook Japanese ingredients in a French or Italian register instead, which is every bit as good. Breakfast is grilled fish, rice, miso soup, pickles, egg; a Western one is usually available and usually the worse choice.
- **The clock runs the day, and that is the point.** Dinner starts in a window you pick at booking, usually between 17:30 and 19:30, breakfast between 08:00 and 10:00; the kitchen cooks to that clock for a dozen rooms, so arriving late costs you courses. One night is the usual stay — sights before check-in and again after checkout.
- **Two kinds of inn, both worth a night.** A **classic ryokan** is traditional throughout: tatami underfoot, futon on the floor, meals often served in your room by the person looking after it, and a hush to the place. A **modern-luxury onsen inn** — Fufu is the best-known chain — keeps the kitchen, the hot spring and the hospitality and drops the frictions: beds, sofas, shoes sometimes kept on to the room, meal times you choose, a restaurant rather than your own table. The classic is the deeper experience, the modern the easier one, and nobody is disappointed by either.
- **Rooms can vary widely within one building**, more than at a hotel, and the price tells you which you are getting. A basic room is one tatami space that is living room, dining room and bedroom in turn, with **futon** laid out while you are at dinner; better categories add a sitting area, a garden view, beds, or a private hot-spring bath on your terrace. Three styles, named on every booking page: **Japanese** (tatami, futon), **Japanese-Western** (a tatami living room, a separate bedroom with real beds), **Western** (beds and chairs throughout). If you would rather not sleep on the floor, ask for Japanese-Western or Western and almost any inn has it. **Where the room category is what makes an inn worth staying at, this kit says so when it is time to book.**
- **In-room baths are the norm on this kit's shortlist.** Most of the inns it recommends have a private hot-spring bath in the room or on its terrace, so you can get in at midnight in your own company; the best run continuously from the source rather than filling from a tap. The communal baths are still worth using — bigger, and looking out at something. They are gender-segregated and taken **nude** (a small towel walks you there and stays out of the water); **rinse off at the seated showers first**, keep hair and towel clear, and that is the whole etiquette. The loaned **yukata** is correct dress for the baths, dinner and the corridors.
- **Tattoos.** Many rural communal baths still turn away visible tattoos, unevenly and inn by inn; a few towns, Kinosaki among them, have dropped the rule. A **room with its own bath** or a **private bath rented by the hour** settles it.
- **Dietary needs go in the booking.** The menu is bought and planned days ahead, so say it when you reserve and it is handled gracefully. Be specific — **dashi**, a stock made with fish, is in many dishes that read as vegetable ones — and ask for smaller portions if you want them, which is a normal request.
- **What a ryokan does not have**: a gym, a pool, a laundry, room service, a late dinner; outside the tourist towns, staff English can be thin. None of it matters for a night.
- **Is it for you?** Yes, if being looked after appeals, if a long dinner is a highlight rather than an obligation, and if sitting outdoors in hot water in winter sounds like the best part of a day. Think twice if you eat on your own schedule, dislike fish, or want everything tailored on request. **Long formal dinners do not stack** — this kit spaces the inn nights for that reason.

---

## Seasons in one table

| Season | Weather | What it's for | The catch |
|---|---|---|---|
| **March–April (spring)** | Cool to mild, brightening | Cherry blossom; the most beautiful and most popular time | Timing swings two weeks either way; school holidays and late-April **Golden Week** fill the country |
| **May–June (early summer)** | Warm, fresh green, then wet | The best-value beautiful season, after the blossom crowds leave | June brings the rainy season everywhere but Hokkaido |
| **July–mid September (summer)** | Hot and very humid, 90°F/32°C up; early and mid September are still summer, with the typhoon risk at its highest | Summer festivals; the cool mountains and Hokkaido; Okinawa's beaches | Oppressive in the cities. Mid-August **Obon** is a travel peak; September is the month a typhoon most often cancels a train day |
| **Late Sept–November (autumn)** | Cooling, dry, clear, though late September still carries the tail of the typhoon season | Autumn colour, Hokkaido in October to central Japan by late November; the best weather of the year, and Kyushu stays mild through early November | The colour peak is as crowded as blossom in Kyoto |
| **December–February (winter)** | Cold and bright on the Pacific side, snowy in the north and on the Japan Sea side | The quietest, cheapest, clearest season: temples without queues, clear Fuji, outdoor baths in snow, snow crab. Kyushu and the Inland Sea stay mild | Short days, and snow slows mountain roads. The New Year days are a national shutdown |

Every season works for something, and winter is badly underrated. Blossom, autumn colour, Golden Week, Obon and New Year all mean booking earlier.

---

## Getting around, money, etiquette — on request, or later

**Getting around.** The **shinkansen** covers the spine and ordinary trains and subways the rest, so a trip built on cities and main corridors needs no car. Get a rechargeable **IC card** (Suica, Pasmo, Icoca). The **rail pass is a maths question** — add up the actual long legs first. **Forward your luggage** between hotels and inns. `guides/transit-know-how.md` has the rest.

**Money.** Cards are widely accepted, but **carry cash** for small restaurants, market stalls, temple entries and rural businesses. The **convenience store is your bank**: 7-Eleven, Family Mart and Japan Post ATMs take foreign cards around the clock, which many bank ATMs do not. **Tipping is not a thing, anywhere.** **Tax-free shopping** above a threshold, with a passport, at the till.

**Etiquette.** **Shoes off** at the entrance of homes, inns, many restaurants and temple buildings, where a step or a change of flooring marks the line — slippers are provided, a separate pair for the toilet stays there, never tatami in shoes. **Quiet in shared space**: trains are near-silent, no phone calls, don't eat while walking, let people off before you get on. **Rubbish comes home with you.** **The small courtesies**: money onto the tray, a slight bow, no chopsticks upright in rice, no pouring your own drink. **"No" is rarely said directly** — listen for a drawn-out "that would be difficult", push once politely, then let it go. Requests made **in advance** are met with startling generosity.

## Stage 3 — Choose a spine and walk it

```
Goal    one route, assembled from a spine by its decisions: the stops, the nights in each, every leg
Inputs  Trip profile; the longlist and the shape Stage 2 closed on; builder/route.js where it ships, else
        the spines printed below
Do      first the spine: run the menu at the profile's nights and offer the two or three that carry the
        places they warmed to, a line each; then present that spine's decisions one at a time, in trip
        order, with their options as the tool prints them; give the reason for the default in a clause; after each
        answer re-price, show the timeline and re-open the explorer on the route as it now stands
Ask     one decision per message, each message closing on that decision's question; the first folds the offer to open any option into its question
Output  the stop string and its timeline; then the itinerary table, opened. Every message in this
        stage carries the line **Open beside this chat: <route> — <address>**, on its own
Next    Stage 4 — where to stay.
```

### Choose the spine

A **spine** is an order of major cities with decisions hanging off each city and leg. Nine cover the country; theirs sit on two or three. **Lead with the comparison**:

1. **Each route under its name in bold, in four short labelled parts**, in your own words: **The route** — what the trip is about, in two sentences. **The cities it is built around** — each in trip order, its usual nights from the run's *Usual nights* line, then two or three sentences as vivid as the Stage 2 cards. **Optional ryokan nights** — say once that each is a yes/no added, not on by default, then every one the *Ryokan nights* line prints: what the place is, what a night there is like, where it sits. **Optional town stops** — the *Town stops* line the same way. No defaults or travel figures here. **Every place and range comes from one run per route** — `spine <name> --total N --in X --out Y`.
2. **Which one, and why** — a paragraph as you would say it across a table: the one you would take for this couple, what they would miss, and the case for the other. Then one "pick A if… pick B if…" paragraph tying each route to their profile. Never a list of contrasts.
3. **The route explorer is opened with the comparison, not offered.** One command: **`compare <spine> <spine> [<spine> …] --total N --in X --out Y`** — spine names, not stop strings, as many as you are showing — which assembles each **at its defaults** for that ticket and length, prints the comparison table and **one `Explorer:` address** whose sections are the spines themselves, every decision still switchable. Hand it on its own bold line: **Open beside this chat: <route names> — <address>**. Never turn every optional night on, and never hand a `plan=` address for a route that has a spine — a frozen section, nothing left to try. Once they have chosen, the address carries that route alone. Then the closing line: *"want more on any of them, a different mix, or to play with one of them on the page?"*

   **A second visit to a city is written `@2`** — `tokyo@2` — everywhere: the address, a `plan` stop string, `--nights tokyo@2=N`. Never `#2` (see the appendix).

4. **A different order is priced, not refused.** When they ask for another order, or the spine cannot assemble one, price it with `plan "<stops>"` and open the `Explorer:` line it prints — any stop string draws as its own tab. Never say a route cannot be shown.

5. **Serving the explorer** — the `kit-explorer` server, never `file://`; read the page before saying it is showing. Stage 2 carries the steps.

**Where a region carries more than one route, show them all before any pick.** Kyushu has four, The Long Line included, and they are different trips: roll each out in the four parts above, in one message, then close on the question that separates them — inns first or cities first, the coast or the volcano. **Its two southern routes open at an inn**, Kirishima beside Kagoshima airport; the north-east opens at Nagasaki. Fukuoka sits in the middle or is left out, never straight after Tokyo. **Where a place sits in the order is the spine's** — Unzen after Nagasaki on South & West, before it on North & East. **A note under a route's header is said when you offer it** — Hokkaido's thin research, and the rental car Kurokawa, Takachiho and Unzen bring.

**Run the menu, never quote it.** `cd builder && node route.js spines --nights N --draws food,onsen` prints the nine ranked for the profile — offer them in that order. **A repeat visitor** gets `--repeat` on every run: routes starting straight in the region come first, and Tokyo holds to two or three nights. **The Kanazawa Loop is offered on every first trip**, ahead of Snow Country. Then **the roll call**: the other routes, a line each.

<!-- generated:spines-menu -->
*The nine routes at their own shortest length (no night count was given — run `spines --nights N` at the profile's nights before showing a menu). Offer the top two or three, by name; the rest is the roll call. Travel counts each flight leg at 3h at most, and a route over 60 minutes of travel a night says so. `spine <name>` walks one — `spine kanazawa`, `spine classic`.*

| Route | Who it's for | The trip | Nights | Travel | Ryokan nights | Flights | Fly in / home from |
|---|---|---|---|---|---|---|---|
| **The Classic** · 7–15 nights | A first trip. | Tokyo → Nikkō → Tokyo → Hakone → Kyoto | 12 | 11h20 | 2 | 0 | Haneda (HND) / Kansai (KIX) |
| **The Kanazawa Loop** · 9–16 nights | A first trip that wants mountains, crafts and the best small food city; or a second trip. | Tokyo → Yudanaka → Kanazawa → Kyoto | 12 | 9h25 | 1 | 0 | Haneda (HND) / Kansai (KIX) |
| **Stretched West** · 12–18 nights | A first trip with two weeks or more. | Tokyo → Hakone → Kyoto → Hiroshima | 12 | 8h50 | 1 | 0 | Haneda (HND) / Hiroshima (HIJ) |
| **Snow Country** · 9–16 nights | Winter: snow country and the northern hot-spring towns. | Tokyo → Minakami / Tanigawa → Echigo-Yuzawa → Kanazawa → Kyoto | 13 | 11h10 | 2 | 0 | Haneda (HND) / Kansai (KIX) |
| **The Long Line** · 11–18 nights | Kyushu without a flight: one train line the whole way. | Tokyo → Hakone → Kyoto → Hiroshima → Fukuoka | 14 | 9h05 | 1 | 0 | Haneda (HND) / Fukuoka (FUK) |
| **Hokkaido** · 8–12 nights | The northern island in snow. The kit is thin here. | Tokyo → Sapporo → Niseko → Sapporo | 9 | 11h20 (69 min per night) | 1 | 1 | Haneda (HND) / New Chitose (CTS) |
| **Kyushu South & East** · 9–15 nights | Kyushu when the hot springs are the point. | Tokyo → Kirishima → Kagoshima → Yufuin | 9 | 9h40 | 2 | 1 | Haneda (HND) / Ōita (OIT) |
| **Kyushu North & East** · 10–17 nights | Kyushu on a shorter trip, either way round. | Tokyo → Nagasaki → Takeo Onsen → Fukuoka → Kurokawa Onsen → Takachiho → Kumamoto | 13 | 13h05 | 3 | 1 | Haneda (HND) / Kumamoto (KMJ) |
| **Kyushu South & West** · 11–20 nights | Kyushu for people who have done Tokyo and Kyoto. | Tokyo → Kirishima → Kagoshima → Fukuoka → Takeo Onsen → Nagasaki | 13 | 9h35 | 2 | 1 | Haneda (HND) / Nagasaki (NGS) |

- Hokkaido: **flag** 69 min of travel per night — 60 minutes or more; say why (4h of it is flying, counted at 3h a leg) and show a lighter order beside it.

*Hokkaido — read this first: The kit's thinnest route — the least research behind it, fewer inns and fewer researched journey times. Say so, and help them research the island (the appendix has the method) rather than treating these defaults as settled.*
<!-- /generated:spines-menu -->

### Walk the spine

**A spine is walked, not built.** Every option is a place or a yes/no, never a night.

### Five principles

1. **Explore first.** Once the spine is picked, the first message shows its default timeline and the first decision, closing on that question: *"Tokyo first, or straight into Kansai?"*
2. **The default is the recommendation.** One option arrives taken, and you say why. Never volunteer a place to sleep before they have chosen the area (Stage 4), but **a direct question about a town's inns gets its shortlist there and then**: `stays <place>`, names linked, your pick first.
3. **Re-price after every answer, and re-open the page.** Each answer is a `--set`; the timeline that comes back is what they see next, and **every run prints an `Explorer:` address carrying the answers so far.** Hand it on its own bold line — **Open beside this chat: <route name> — <address>** — in every message. Never ask whether they want it.
4. **Say what the spine can't do.** An option marked *not offered here*: name the nearest thing this spine does; a place it never reaches gets one no with its reason. **An ending is never withheld for the airport**: the ride to the ticketed airport is priced and said (Kōyasan to Haneda: 3h10 via Kansai).
5. **Never type a number.** Every figure comes from the engine.

**Never name a principle to the user.**

### Where the decisions live

A **city** carries its **CITY** switch and at most one **attachment** (an extra night, yes or no); each **leg** carries **slots**, the **RYOKAN** and **STOP** towns on it. **END** closes the trip. Nara never precedes Kyoto.

### Walk it

The engine is `builder/route.js`: `spine <name>` — any word of the route's name — prints the decisions, the timeline, the stop string and the checks. **What it prints is for you; what they see is a decision in plain words**:

1. **Name the decision** in one sentence a first-timer follows: *"Next: a hot-spring ryokan near Mount Fuji, on the way west?"*
2. **The place**, two or three sentences from its card.
3. **Why yes, why no** — a line each, the default first with its reason: *"Hakone is the default: it sits on the line to Kyoto, so the night costs no travel."*
4. **The options as a short table**, `| Option | What it means |`, the default marked *(default)*. Never the key, number or tag.
5. **The ask, on its own line**: the question it answers — *"Nikkō, the Fuji lakes, or neither?"* One message per decision.
6. **Where inn or stop decisions depend on each other, present them at once, not one at a time** — every alternative with its reason, the default first, "none" last.

Each answer is another `--set <key>=<option>` (`tokyo.nikko=yes`), earlier answers carried along; paste the timeline returned:

| Stop | Nights | Onward |
|---|---|---|
| Tokyo | 5 | 2h10 train |

Before and after get a row each:

| Route | Stops | Nights | Total transit | Separate stays | Ryokan nights | Flights | In / out |
|---|---|---|---|---|---|---|---|
| before | Tokyo → Hakone → Kyoto | 10 | 7h18 | 44 min | 3 | 1 | 0 | Haneda (HND) / Kansai (KIX) |

Then the next decision. `--nights <place>=N` moves a stop (`=0` drops it), `--total N` the length, both fine beside a `--set`; an explicit `--nights` holds against the total. **A total outside the band still assembles**, and so does a place under its range; say once what that costs. At 60 minutes of travel a night or more the engine prints a **`Lighter:`** line, a real assembly at the same length: **paste it beside the route they asked for and say which you would take**. `--nights <place>=1r` is a room-only night, so the dinner run resets. **When the nights asked cannot all be spent**, the engine switches on the ryokan and stop nights it left off, says so under What moved, then names the nights left over: offer another city night or a shorter trip. **It never fills by adding nights in Tokyo at the end, and neither do you** — a ticket home out of Haneda is no reason to close in Tokyo; the last leg is the ride back to the airport, priced like any other, and Tokyo at the end is offered only if they ask.

A booked ticket rides on every run as `--in <code> --out <code>`, which prices the last leg. The engine opens in the city they land in and closes where they fly home when the route offers it; **a ticket into the far end** turns the spine round and says so; `--repeat` starts a second visit. Mid-walk, `--before "<the stop string on screen>"` makes Before the route they actually have. It checks ranges, the dinner run, doubling back, the exit airport and every leg; an unresearched pair prints *to confirm*.

**Without the engine**, walk the decisions from the tables below, price legs from the corridor tables, and label the result **unvalidated**.

### Tokyo's satellites

**One out-and-back splits Tokyo, and only one: Nikkō, or the Fuji lakes** (**Fufu Kawaguchiko**, a lakeside inn with Mount Fuji in the window). Offer one or the other, never both, and split Tokyo's nights as evenly as they go: six 3 and 3, five 3 then 2, seven 4 then 3. **The on-the-way Fuji slot is a different decision** — a hot-spring inn on the line west to Kyoto, costing almost no travel — and it is **Hakone or Izu** (`stays fuji`), not the lakes, whose onward ride to Kyoto is long; the lakes are `stays fujilakes`.

<!-- generated:tokyo-satellites -->
*The five ryokan trips out of Tokyo, with the researched leg from Tokyo on each. Every one is out and back except Hakone and Izu, which sit on the way west; that and the hours below are the difference between them. `fits` is the tag to filter the master inn table by in Stage 4.*

| From Tokyo to | Door to door | Changes | `fits` tag | What it is |
|---|---|---|---|---|
| Nikkō | 2h | 0 | `tokyo-splitter` | carved shrines in cedar forest, a lake and a waterfall above them; out and back, so it splits a long Tokyo stay |
| Hakone | 2h10 | 1 | `golden-route-stop` | the hot-spring belt on the way to Kyoto, so the night costs nothing in travel; no view of Mt Fuji |
| Izu peninsula (Shuzenji) | 1h45 | 0 | `golden-route-stop` | a warmer coastal peninsula of hot-spring villages; quieter than Hakone and a little further off the line west |
| Lake Kawaguchi (Mt Fuji) | 2h | 0 | `fuji-lakes` | where the mountain is actually in the window, clearest on a cold winter morning and never guaranteed |
| Echigo-Yuzawa (snow country) | 1h45 | 0 | `snow-country` | snow country on the bullet train with no changes — villages buried to the first floor, winter only |
| Minakami / Tanigawa (snow country) | 1h40 | 0 | `snow-country` | the other snow-country valley, Minakami; same journey, more remote once you arrive |

Times are door to door and run both ways. Nothing here needs Stage 5 open: these are the same rows, printed where the choice is made. (Single file: the inns for each of these are rows of the master inn table in Stage 4 — filter it by the `fits` tag in the fourth column.)
<!-- /generated:tokyo-satellites -->

### The nine spines

<!-- generated:spines -->
*The nine spines, each at its default assembly. A spine is an order of cities, and every decision belongs to a city or to the leg between two cities: a CITY switch (which cities, which way round, where the trip starts), an attachment — one city's own extra night, a yes or a no — the yes/no slots that sit on one leg, and END. Nights are never part of a decision: each place starts at its usual count and moves inside its range. Every timeline below was priced leg by leg through the kit's route engine; a leg reads as time to five minutes and one mode word. With the engine, `spine <id> --set <decision>=<option>` re-prices any change and prints before and after; without it, the stop string under each timeline is what a chat window re-prices by hand from the corridor tables, labelled unvalidated until run.*

#### The Classic

Tokyo, Kyoto or Osaka, a ryokan or two. The first trip. Tokyo, a ryokan on the road west, then Kansai. Band 7–15 nights · HND → KIX.

| Where | Decision | Options (chosen in bold) |
|---|---|---|
| **Tokyo** | 1 · CITY · Where does the trip start? `start` | **1 Tokyo first** — Tokyo, then the road west into Kansai. · 2 Straight into Kansai — No Tokyo: fly into Kansai airport, Osaka first, and give the whole trip to Osaka and Kyoto. |
|  | 2 · RYOKAN · One night out of Tokyo: Nikkō, Lake Kawaguchi (Mt Fuji) or none — which? `tokyo.choice` | **1 Nikkō** — Carved shrines in cedar forest north of Tokyo; out and back from the city. · 2 Lake Kawaguchi (Mt Fuji) — A lakeside ryokan under Mount Fuji, two hours from Tokyo, out and back, so it splits the Tokyo stay. · 3 None — No Nikkō; the Tokyo stay runs unbroken. |
| **Tokyo → Kyoto** | 3 · RYOKAN · A ryokan near Mount Fuji on the way west? `tokyo-kansai.fuji` | **1 Yes** — Hakone, the Fuji lakes or Izu: two hours from Tokyo, on the way west. · 2 No — Straight through to Kansai. |
| **Kyoto** | 4 · CITY · Which Kansai city? `kansai` | **1 Kyoto** — Temples, gardens and the old capital. · 2 Osaka — Osaka only; Kyoto as a day out or skipped. · 3 Kyoto and Osaka — Kyoto first, then Osaka for eating and going out. |
|  | 5 · STOP · A night at Nara? — Yes is on by default from 13 nights, and can be chosen on a shorter trip `kyoto.nara` | 1 Yes — A night among the temples and the deer park, after Kyoto. · **2 No** — Nara as a day trip instead. |
| **The end** | 6 · END · How does the trip end? `end` | **1 Fly home from Kansai** — Out through Kansai airport. · 2 Sansō Amanosato, below Kōyasan — An eight-room auberge in the Wakayama hills below Kōyasan, booked for its French-Japanese dinner — the FlyerTalk author left calling it one of the best culinary destinations anywhere, and stays through 2025 say the kitchen is still there. A last night built around one dinner, then home. · 3 Kinosaki — The Japan Sea hot-spring town of old inns and public baths. · 4 Back to Tokyo — Two more Tokyo nights, then Haneda. |

**The Classic** · 12 nights · 5 separate stays · 11h20 total transit · in Haneda (HND), out Kansai (KIX) · band 7–15

| Stop | Nights | Onward |
|---|---|---|
| in from Haneda (HND) | — | 35 min train |
| Tokyo | 3 | 2h train |
| Nikkō | 1 | 2h train |
| Tokyo | 3 | 2h10 train |
| Hakone | 1 | 3h train |
| Kyoto | 4 | 1h30 train · out to Kansai (KIX) |

Stop string: `plan "tokyo:3,nikko:1,tokyo:3,hakone:1,kyoto:4" --in HND --out KIX`

#### The Kanazawa Loop

Tokyo, Kanazawa, a ryokan or two, then onward or back. Over the mountains instead of the shuttle. After Kanazawa, on to Kansai or back to Tokyo. Band 9–16 nights · HND → KIX, or HND → HND / NGO.

| Where | Decision | Options (chosen in bold) |
|---|---|---|
| **Tokyo** | 1 · RYOKAN · One night out of Tokyo: Yudanaka (Shibu Onsen), Lake Kawaguchi (Mt Fuji), Nikkō or none — which? `tokyo.choice` | **1 Yudanaka (Shibu Onsen)** — A hot-spring valley in Nagano where the snow monkeys bathe, on the way over the mountains. · 2 Lake Kawaguchi (Mt Fuji) — A lakeside ryokan under Mount Fuji, two hours from Tokyo, out and back, so it splits the Tokyo stay. · 3 Nikkō — Carved shrines in cedar forest north of Tokyo; the Kanazawa train is caught at Ōmiya. · 4 None — Straight through to Kanazawa. |
| **Kanazawa → Kyoto** | 2 · RYOKAN · A ryokan in the Kaga towns after Kanazawa? — Yes is on by default from 13 nights, and can be chosen on a shorter trip `kanazawa-onward.kaga` | 1 Yes — The hot-spring towns an hour down the coast from Kanazawa. · **2 No** — Straight on from Kanazawa. |
|  | 3 · STOP · A stop at Takayama on the way? `kanazawa-onward.takayama` | 1 Yes — A preserved timber merchant town in the mountains, on the way; the bus from Kanazawa stops at the Shirakawa-gō farmhouses. · **2 No** — Direct to the next city. |
| **Kyoto** | 4 · CITY · Which city next? `next` | **1 Kyoto** — On to Kyoto, then Kansai airport. · 2 Osaka — Straight to Osaka for eating and going out, then Kansai airport. · 3 Kyoto and Osaka — Kyoto, then Osaka, then Kansai airport. · 4 Back to Tokyo — Loop back over the mountains for a Haneda flight. |
|  | 5 · STOP · A night at Nara? `kyoto.nara` | 1 Yes — A night among the temples and the deer park, after Kyoto. · **2 No** — Nara as a day trip instead. |
| **The end** | 6 · END · How does the trip end? `end` | **1 Fly home from the last city** — Out through its own airport. · 2 Sansō Amanosato, below Kōyasan — An eight-room auberge in the Wakayama hills below Kōyasan, booked for its French-Japanese dinner — the FlyerTalk author left calling it one of the best culinary destinations anywhere, and stays through 2025 say the kitchen is still there. A last night built around one dinner, then home. · 3 Kinosaki — The Japan Sea hot-spring town of old inns and public baths. · 4 Back to Tokyo, a Fuji ryokan on the way — Hakone, the Fuji lakes or Izu on the road back, then the last nights in Tokyo. · 5 A Fuji ryokan, then fly home from Haneda — Hakone, the Fuji lakes or Izu as the last night, then the airport; no more Tokyo. · 6 Back to Tokyo — Two more Tokyo nights, then Haneda. |

**The Kanazawa Loop** · 12 nights · 4 separate stays · 9h25 total transit · in Haneda (HND), out Kansai (KIX) · band 9–16

| Stop | Nights | Onward |
|---|---|---|
| in from Haneda (HND) | — | 35 min train |
| Tokyo | 4 | 2h35 train |
| Yudanaka (Shibu Onsen) | 1 | 2h10 train |
| Kanazawa | 3 | 2h30 train |
| Kyoto | 4 | 1h30 train · out to Kansai (KIX) |

Stop string: `plan "tokyo:4,yudanaka:1,kanazawa:3,kyoto:4" --in HND --out KIX`

#### Stretched West

Tokyo, Kyoto or Osaka, Hiroshima, one to three ryokan. The first trip stretched west to the inland sea. Band 12–18 nights · HND → HIJ.

| Where | Decision | Options (chosen in bold) |
|---|---|---|
| **Tokyo** | 1 · RYOKAN · One night out of Tokyo: Nikkō, Lake Kawaguchi (Mt Fuji) or none — which? `tokyo.choice` | 1 Nikkō — Carved shrines in cedar forest north of Tokyo; out and back from the city. · 2 Lake Kawaguchi (Mt Fuji) — A lakeside ryokan under Mount Fuji, two hours from Tokyo, out and back, so it splits the Tokyo stay. · **3 None** — No Nikkō; the Tokyo stay runs unbroken. |
| **Tokyo → Kyoto** | 2 · RYOKAN · A ryokan near Mount Fuji on the way west? `tokyo-kansai.fuji` | **1 Yes** — Hakone, the Fuji lakes or Izu: two hours from Tokyo, on the way west. · 2 No — Straight through to Kansai. |
| **Kyoto** | 3 · CITY · Which Kansai city? `kansai` | **1 Kyoto** — Temples, gardens and the old capital. · 2 Osaka — Osaka only; Kyoto as a day out or skipped. · 3 Kyoto and Osaka — Kyoto first, then Osaka for eating and going out. |
|  | A night at Nara? | _Yes: not offered here — this trip carries on west, so Nara only fits between Kyoto and Osaka — a day trip otherwise_ |
| **Kyoto → Hiroshima** | 4 · RYOKAN · A ryokan at Tomonoura on the inland sea? `kansai-hiroshima.tomonoura` | 1 Yes — A small harbour town on the inland sea, an hour short of Hiroshima. · **2 No** — Straight through to Hiroshima. |
|  | 5 · RYOKAN · A night on Naoshima, the art island? `kansai-hiroshima.naoshima` | 1 Yes — The art island, reached by ferry from Okayama (no kit write-up — book Benesse House direct). · **2 No** — Straight through to Hiroshima. |
| **Hiroshima** | 6 · RYOKAN · A night on Miyajima? — Yes is on by default from 12 nights, and can be chosen on a shorter trip `hiroshima.miyajima` | 1 Yes — A night on the shrine island, under the torii that stands in the sea. · **2 No** — Miyajima as a day trip from Hiroshima. |
| **The end** | 7 · END · How does the trip end? `end` | **1 Fly home from Hiroshima** — Out through Hiroshima airport. · 2 Back to Tokyo — Two more Tokyo nights, then Haneda. |

**Stretched West** · 12 nights · 4 separate stays · 8h50 total transit · in Haneda (HND), out Hiroshima (HIJ) · band 12–18

| Stop | Nights | Onward |
|---|---|---|
| in from Haneda (HND) | — | 35 min train |
| Tokyo | 5 | 2h10 train |
| Hakone | 1 | 3h train |
| Kyoto | 4 | 1h55 train |
| Hiroshima | 2 | 1h05 bus · out to Hiroshima (HIJ) |

Stop string: `plan "tokyo:5,hakone:1,kyoto:4,hiroshima:2" --in HND --out HIJ`

#### Snow Country

Tokyo and the north, then Kanazawa and onward. Tokyo, then north into the snow, then Kanazawa and on to Kyoto or back to Tokyo. Band 9–16 nights · HND → KIX / ITM, or HND → HND.

| Where | Decision | Options (chosen in bold) |
|---|---|---|
| **Tokyo** | 1 · RYOKAN · One night out of Tokyo: Nikkō, Lake Kawaguchi (Mt Fuji) or none — which? `tokyo.choice` | 1 Nikkō — Carved shrines in cedar forest north of Tokyo; out and back from the city. · 2 Lake Kawaguchi (Mt Fuji) — A lakeside ryokan under Mount Fuji, two hours from Tokyo, out and back, so it splits the Tokyo stay. · **3 None** — No Nikkō; the Tokyo stay runs unbroken. |
| **Tokyo → Kanazawa** | 2 · RYOKAN · Two nights in snow country on the way? `tokyo-kanazawa.snow` | **1 Yes** — Two valley ryokan on the bullet train north of Tokyo. · 2 No — No snow-country nights. |
|  | 3 · RYOKAN · The Sendai loop and the Tōhoku hot-spring towns? `tokyo-kanazawa.tohoku` | 1 Yes — Sendai, then the north's hot-spring towns: a mountain ryokan and a samurai town. · **2 No** — No Tōhoku leg. |
| **Kanazawa → Kyoto** | 4 · STOP · A stop at Takayama on the way? `kanazawa-onward.takayama` | 1 Yes — A preserved timber merchant town in the mountains, on the way; the bus from Kanazawa stops at the Shirakawa-gō farmhouses. · **2 No** — Direct to the next city. |
| **Kyoto** | 5 · CITY · Which city next? `next` | **1 Kyoto** — On to Kyoto, then Kansai airport. · 2 Osaka — Straight to Osaka, then Kansai airport. · 3 Kyoto and Osaka — Kyoto, then Osaka, then Kansai airport. · 4 Back to Tokyo — Loop back over the mountains for a Haneda flight. |
|  | 6 · STOP · A night at Nara? `kyoto.nara` | 1 Yes — A night among the temples and the deer park, after Kyoto. · **2 No** — Nara as a day trip instead. |
| **The end** | 7 · END · How does the trip end? `end` | **1 Fly home from the last city** — Out through its own airport. · 2 Sansō Amanosato, below Kōyasan — An eight-room auberge in the Wakayama hills below Kōyasan, booked for its French-Japanese dinner — the FlyerTalk author left calling it one of the best culinary destinations anywhere, and stays through 2025 say the kitchen is still there. A last night built around one dinner, then home. · 3 Kinosaki — The Japan Sea hot-spring town of old inns and public baths. |

**Snow Country** · 13 nights · 5 separate stays · 11h10 total transit · in Haneda (HND), out Kansai (KIX) · band 9–16

| Stop | Nights | Onward |
|---|---|---|
| in from Haneda (HND) | — | 35 min train |
| Tokyo | 4 | 1h40 train |
| Minakami / Tanigawa (snow country) | 1 | 1h25 car (rental or taxi) |
| Echigo-Yuzawa (snow country) | 1 | 3h30 train |
| Kanazawa | 3 | 2h30 train |
| Kyoto | 4 | 1h30 train · out to Kansai (KIX) |

Stop string: `plan "tokyo:4,tanigawa:1,echigoyuzawa:1,kanazawa:3,kyoto:4" --in HND --out KIX`

#### Kyushu South & West

Tokyo and Kyushu, south to west. Kirishima and Kagoshima first, then north and west through Fukuoka to Takeo and Nagasaki. Band 11–20 nights · HND → NGS.

| Where | Decision | Options (chosen in bold) |
|---|---|---|
| **Tokyo** | 1 · CITY · Where does the trip start? `start` | **1 Tokyo first** — Tokyo, then a flight to Kagoshima and up to the Kirishima inn. · 2 Straight into Kagoshima — No Tokyo: land at Kagoshima, the Kirishima inn an hour up the road. · 3 Straight into Nagasaki — No Tokyo: land at Nagasaki, hire a car, and run the route the other way round. |
|  | 2 · RYOKAN · One night out of Tokyo: Nikkō, Lake Kawaguchi (Mt Fuji) or none — which? `tokyo.choice` | 1 Nikkō — Carved shrines in cedar forest north of Tokyo; out and back from the city. · 2 Lake Kawaguchi (Mt Fuji) — A lakeside ryokan under Mount Fuji, two hours from Tokyo, out and back, so it splits the Tokyo stay. · **3 None** — No Nikkō; the Tokyo stay runs unbroken. |
| **Kagoshima** | 3 · RYOKAN · A ryokan at Kirishima, straight from the airport? `kagoshima.kirishima` | **1 Yes** — A riverside hot-spring ryokan an hour above Kagoshima, the airport beside it. · 2 No — Kagoshima on its own. |
| **Kagoshima → Fukuoka** | 4 · STOP · A stop at Kumamoto on the way north? `kagoshima-fukuoka.kumamoto` | 1 Yes — The castle city under the Aso caldera, on the way north. · **2 No** — Straight on. |
|  | 5 · RYOKAN · A ryokan night on the Amakusa islands? `kagoshima-fukuoka.amakusa` | 1 Yes — A night on the Amakusa islands, the bridged fishing chain west of Kumamoto. · **2 No** — Straight on. |
| **Fukuoka → Nagasaki** | 6 · RYOKAN · A ryokan at Takeo, between Fukuoka and Nagasaki? `fukuoka-nagasaki.takeo` | **1 Yes** — A small hot-spring town on the line, an hour from Fukuoka, forty minutes from Nagasaki. · 2 No — Straight on to Nagasaki. |
| **Nagasaki** | 7 · RYOKAN · A ryokan at Unzen after Nagasaki? `nagasaki.unzen` | 1 Yes — The volcano town east of Nagasaki: a hire car at the airport, an hour out. · **2 No** — Nagasaki, then home. |
| **The end** | 8 · END · How does the trip end? `end` | **1 Fly home from the last stop** — Out through its own airport. · 2 Back to Tokyo — Two more Tokyo nights, then Haneda. |

**Kyushu South & West** · 13 nights · 6 separate stays · 9h35 total transit · 1 flight · in Haneda (HND), out Nagasaki (NGS) · band 11–20

| Stop | Nights | Onward |
|---|---|---|
| in from Haneda (HND) | — | 35 min train |
| Tokyo | 4 | 4h flight |
| Kirishima (Myōken Onsen) | 1 | 55 min train |
| Kagoshima | 2 | 1h25 train |
| Fukuoka (Hakata) | 3 | 1h train |
| Takeo Onsen | 1 | 40 min train |
| Nagasaki | 2 | 1h bus · out to Nagasaki (NGS) |

Stop string: `plan "tokyo:4,kirishima:1,kagoshima:2,fukuoka:3,takeo:1,nagasaki:2" --in HND --out NGS`

#### Kyushu South & East

Tokyo and Kyushu, south to the hot-spring east. Kagoshima and its Kirishima ryokan, then up to the hot-spring east. Band 9–15 nights · HND → OIT.

| Where | Decision | Options (chosen in bold) |
|---|---|---|
| **Tokyo** | 1 · CITY · Where does the trip start? `start` | **1 Tokyo first** — Tokyo, then a flight to Kagoshima and up to the Kirishima inn. · 2 Straight into Kagoshima — No Tokyo: land at Kagoshima, the Kirishima inn an hour up the road. · 3 Straight into Ōita — No Tokyo: land at Ōita for the east, Kirishima last by the airport home. |
|  | 2 · RYOKAN · One night out of Tokyo: Nikkō, Lake Kawaguchi (Mt Fuji) or none — which? `tokyo.choice` | 1 Nikkō — Carved shrines in cedar forest north of Tokyo; out and back from the city. · 2 Lake Kawaguchi (Mt Fuji) — A lakeside ryokan under Mount Fuji, two hours from Tokyo, out and back, so it splits the Tokyo stay. · **3 None** — No Nikkō; the Tokyo stay runs unbroken. |
| **Kagoshima** | 3 · RYOKAN · A ryokan at Kirishima, straight from the airport? `kagoshima.kirishima` | **1 Yes** — A riverside hot-spring ryokan an hour above Kagoshima, the airport beside it. · 2 No — Kagoshima on its own. |
| **Kagoshima → Yufuin** | 4 · RYOKAN · A ryokan night on the Amakusa islands? `kagoshima-east.amakusa` | 1 Yes — A night on the Amakusa islands, the bridged fishing chain west of Kumamoto. · **2 No** — Straight on. |
|  | 5 · STOP · A stop at Kumamoto on the way north? `kagoshima-east.kumamoto` | 1 Yes — The castle city under the Aso caldera, on the way north. · **2 No** — Straight on. |
| **Kagoshima → Yufuin** | 6 · RYOKAN · A gorge ryokan at Amagase on the way to the east? `kagoshima-yufuin.hita` | 1 Yes — A night in the river gorge on the way, so the east is two nights. · **2 No** — Straight on to the east. |
| **Yufuin** | 7 · CITY · Which hot-spring town in the east? `east` | **1 Yufuin** — The valley town under Mount Yufu, small ryokans and a mountain skyline. · 2 Beppu — The big steaming hot-spring city on the east coast. · 3 Yufuin and Beppu — The valley town, then the steaming coast an hour down the hill. |
| **The end** | 8 · END · How does the trip end? `end` | **1 Fly home from the last stop** — Out through its own airport. · 2 Back to Tokyo — Two more Tokyo nights, then Haneda. |

**Kyushu South & East** · 9 nights · 4 separate stays · 9h40 total transit · 1 flight · in Haneda (HND), out Ōita (OIT) · band 9–15

| Stop | Nights | Onward |
|---|---|---|
| in from Haneda (HND) | — | 35 min train |
| Tokyo | 5 | 4h flight |
| Kirishima (Myōken Onsen) | 1 | 55 min train |
| Kagoshima | 2 | 3h10 train |
| Yufuin | 1 | 1h bus · out to Ōita (OIT) |

Stop string: `plan "tokyo:5,kirishima:1,kagoshima:2,yufuin:1" --in HND --out OIT`

#### Kyushu North & East

Tokyo and Kyushu, the west coast and the volcanic middle. Nagasaki and the Takeo inn, then Fukuoka, then inland — or east to the hot springs. Band 10–17 nights · HND → KMJ, or HND → OIT.

| Where | Decision | Options (chosen in bold) |
|---|---|---|
| **Tokyo** | 1 · CITY · Where does the trip start? `start` | **1 Tokyo first** — Tokyo, then a flight to Nagasaki. · 2 Straight into Nagasaki — No Tokyo: land at Nagasaki, or drive out to the Unzen inn. |
|  | 2 · CITY · Which way round? `order` | **1 Nagasaki first** — Land at Nagasaki for the city and the Takeo inn, finish inland or east. · 2 The east first — Start inland or east, finish at the Takeo inn and Nagasaki. |
|  | 3 · RYOKAN · One night out of Tokyo: Nikkō, Lake Kawaguchi (Mt Fuji) or none — which? `tokyo.choice` | 1 Nikkō — Carved shrines in cedar forest north of Tokyo; out and back from the city. · 2 Lake Kawaguchi (Mt Fuji) — A lakeside ryokan under Mount Fuji, two hours from Tokyo, out and back, so it splits the Tokyo stay. · **3 None** — No Nikkō; the Tokyo stay runs unbroken. |
| **Nagasaki** | 4 · RYOKAN · A ryokan at Unzen before Nagasaki? `nagasaki.unzen` | 1 Yes — The volcano town east of Nagasaki: fly in, hire a car, an hour out. · **2 No** — Straight to Nagasaki. |
| **Nagasaki → Fukuoka** | 5 · RYOKAN · A ryokan at Takeo, between Fukuoka and Nagasaki? `nagasaki-fukuoka.takeo` | **1 Yes** — A small hot-spring town on the line, an hour from Fukuoka, forty minutes from Nagasaki. · 2 No — Straight on to Nagasaki. |
| **Fukuoka → Kumamoto** | 6 · RYOKAN · A ryokan at Kurokawa in the caldera country? `fukuoka-kumamoto.kurokawa` | **1 Yes** — The wooden hot-spring village inland, black-roofed and lantern-lit. · 2 No — Straight on. |
|  | 7 · STOP · A night at the Takachiho gorge? `fukuoka-kumamoto.takachiho` | **1 Yes** — The gorge and its night-time shrine dance; two hours by car to Kumamoto airport. · 2 No — Straight on to Kumamoto. |
| **Kumamoto** | 8 · CITY · Where does the second half go? `east` | **1 The volcanic middle** — Inland: the hot-spring village at Kurokawa, the Takachiho gorge, out through Kumamoto. · 2 Yufuin — The valley town under Mount Yufu, small ryokans and a mountain skyline. · 3 Beppu — The big steaming hot-spring city on the east coast. · 4 Yufuin and Beppu — The valley town, then the steaming coast an hour down the hill. |
|  | 9 · RYOKAN · A ryokan night on the Amakusa islands? `kumamoto.amakusa` | 1 Yes — A night on the Amakusa islands, the bridged fishing chain west of Kumamoto. · **2 No** — Kumamoto on its own. |
| **The end** | 10 · END · How does the trip end? `end` | **1 Fly home from the last stop** — Out through its own airport. · 2 Back to Tokyo — Two more Tokyo nights, then Haneda. |
| **Not on this route** | A gorge ryokan at Amagase before the east? | _Yes: not offered here — the leg from Fukuoka (Hakata) to Yufuin is not on this route_ |

**Kyushu North & East** · 13 nights · 7 separate stays · 13h05 total transit · 1 flight · in Haneda (HND), out Kumamoto (KMJ) · band 10–17

| Stop | Nights | Onward |
|---|---|---|
| in from Haneda (HND) | — | 35 min train |
| Tokyo | 4 | 4h15 flight |
| Nagasaki | 2 | 40 min train |
| Takeo Onsen | 1 | 1h train |
| Fukuoka (Hakata) | 3 | 2h30 drive |
| Kurokawa Onsen | 1 | 1h10 drive |
| Takachiho | 1 | 2h drive |
| Kumamoto | 1 | 55 min bus · out to Kumamoto (KMJ) |

Stop string: `plan "tokyo:4,nagasaki:2,takeo:1,fukuoka:3,kurokawa:1,takachiho:1,kumamoto:1" --in HND --out KMJ`

#### The Long Line

West to east: Kyoto or Osaka, Hiroshima, Fukuoka. One bullet-train line from Kansai into Kyushu, ryokan along it. Band 11–18 nights · HND or KIX → FUK / OIT / NGS.

| Where | Decision | Options (chosen in bold) |
|---|---|---|
| **Tokyo** | 1 · CITY · Where does the trip start? `start` | **1 Tokyo first** — Tokyo, then the train west. · 2 Straight into Kansai — No Tokyo; fly into Kansai airport. |
|  | 2 · RYOKAN · One night out of Tokyo: Nikkō, Lake Kawaguchi (Mt Fuji) or none — which? `tokyo.choice` | 1 Nikkō — Carved shrines in cedar forest north of Tokyo; out and back from the city. · 2 Lake Kawaguchi (Mt Fuji) — A lakeside ryokan under Mount Fuji, two hours from Tokyo, out and back, so it splits the Tokyo stay. · **3 None** — No Nikkō; the Tokyo stay runs unbroken. |
| **Tokyo → Kyoto** | 3 · RYOKAN · A ryokan near Mount Fuji on the way west? `tokyo-kansai.fuji` | **1 Yes** — Hakone, the Fuji lakes or Izu: two hours from Tokyo, on the way west. · 2 No — Straight through to Kansai. |
| **Kyoto** | 4 · CITY · Which Kansai city? `kansai` | **1 Kyoto** — Temples, gardens and the old capital. · 2 Osaka — Osaka only; Kyoto as a day out or skipped. · 3 Kyoto and Osaka — Kyoto first, then Osaka for eating and going out. |
|  | A night at Nara? | _Yes: not offered here — this trip carries on west, so Nara only fits between Kyoto and Osaka — a day trip otherwise_ |
| **Kyoto → Hiroshima** | 5 · RYOKAN · A ryokan at Tomonoura on the inland sea? `kansai-hiroshima.tomonoura` | 1 Yes — A small harbour town on the inland sea, an hour short of Hiroshima. · **2 No** — Straight through to Hiroshima. |
|  | 6 · RYOKAN · A night on Naoshima, the art island? `kansai-hiroshima.naoshima` | 1 Yes — The art island, reached by ferry from Okayama (no kit write-up — book Benesse House direct). · **2 No** — Straight through to Hiroshima. |
| **Hiroshima** | 7 · RYOKAN · A night on Miyajima? `hiroshima.miyajima` | 1 Yes — A night on the shrine island, under the torii that stands in the sea. · **2 No** — Miyajima as a day trip from Hiroshima. |
| **The end** | 8 · END · How does the trip end? `end` | **1 Fly home from Fukuoka** — Out through Fukuoka airport. · 2 The hot-spring east — Two ryokan nights, Amagase then Yufuin, out through Ōita. · 3 Takeo and Nagasaki — A ryokan night, then Nagasaki, out through Nagasaki. · 4 Back to Tokyo — Two more Tokyo nights, then Haneda. |

**The Long Line** · 14 nights · 5 separate stays · 9h05 total transit · in Haneda (HND), out Fukuoka (FUK) · band 11–18

| Stop | Nights | Onward |
|---|---|---|
| in from Haneda (HND) | — | 35 min train |
| Tokyo | 4 | 2h10 train |
| Hakone | 1 | 3h train |
| Kyoto | 4 | 1h55 train |
| Hiroshima | 2 | 1h05 train |
| Fukuoka (Hakata) | 3 | 20 min train · out to Fukuoka (FUK) |

Stop string: `plan "tokyo:4,hakone:1,kyoto:4,hiroshima:2,fukuoka:3" --in HND --out FUK`

#### Hokkaido

The northern island in snow, a flight each way. A flight each way, the island's snow and food. Band 8–12 nights · HND → CTS.

| Where | Decision | Options (chosen in bold) |
|---|---|---|
| **Tokyo** | 1 · CITY · Where does the trip start? `start` | **1 Tokyo first** — Tokyo, then a flight to Sapporo. · 2 Straight into Sapporo — No Tokyo. |
|  | 2 · RYOKAN · One night out of Tokyo: Nikkō, Lake Kawaguchi (Mt Fuji) or none — which? `tokyo.choice` | 1 Nikkō — Carved shrines in cedar forest north of Tokyo; out and back from the city. · 2 Lake Kawaguchi (Mt Fuji) — A lakeside ryokan under Mount Fuji, two hours from Tokyo, out and back, so it splits the Tokyo stay. · **3 None** — No Nikkō; the Tokyo stay runs unbroken. |
| **Sapporo** | 3 · RYOKAN · A hot-spring night at Noboribetsu straight off the plane? `sapporo.noboribetsu` | 1 Yes — The island's big sulphur hot-spring town, an hour and a quarter from the airport. · **2 No** — Straight into Sapporo. |
| **Niseko (Hirafu)** | 4 · CITY · A mountain night at Niseko? `mountain` | **1 Niseko** — The ski resort's inn night, two hours from Sapporo. · 2 No Niseko — Sapporo unbroken; a hot-spring night near the airport at the end instead. |
| **The end** | 5 · END · How does the trip end? `end` | **1 Fly home from New Chitose** — Out through Sapporo's airport. · 2 A hot-spring ryokan — A last night at Noboribetsu or Jōzankei, near the airport. · 3 Back to Tokyo — Two more Tokyo nights, then Haneda. |

**Hokkaido** · 9 nights · 4 separate stays · 11h20 total transit · 1 flight · in Haneda (HND), out New Chitose (CTS) · band 8–12

| Stop | Nights | Onward |
|---|---|---|
| in from Haneda (HND) | — | 35 min train |
| Tokyo | 4 | 4h flight |
| Sapporo | 2 | 3h bus |
| Niseko (Hirafu) | 1 | 3h bus |
| Sapporo | 2 | 45 min train · out to New Chitose (CTS) |

Stop string: `plan "tokyo:4,sapporo:2,niseko:1,sapporo:2" --in HND --out CTS`

- **flag** 69 min of travel per night — 60 minutes or more; say why (4h of it is flying, counted at 3h a leg) and show a lighter order beside it.
<!-- /generated:spines -->

### The corridor and airport tables

**Every leg above is researched**; inn legs are in `data/transit-legs.md`.

Both are printed in full in Stage 5 below, under *The corridor cheat-sheet*. Read them there, with the rules that go with them.


### The decision

Open the itinerary table once they have settled: fill `#`, `Stop` — the name and the kind word, **city**, **town** or **ryokan** — `Nights` and every leg row from `plan`. `Dates` waits for a start date, `Stay options` for Stage 4.

**Trip plan** · `<dates>` · `<n>` nights · arrive `<airport>`, depart `<airport>`

| # | Stop | Dates | Nights | Stay options |
|---|---|---|---|---|
| | ↓ in from `<airport>` · `<h>h` · `<n>` changes · `<mode>` | | | |
| 1 | `<stop>` · `<city / town / ryokan>` | `<dates>` | `<n>` | [`<name>`](`<link>`) (chosen) · [`<name>`](`<link>`) |
| | ↓ `<h>h` · `<n>` changes · `<mode>` | | | |
| 2 | `<stop>` · `<city / town / ryokan>` | `<dates>` | `<n>` | [`<name>`](`<link>`) (chosen) · [`<name>`](`<link>`) |
| | ↓ `<h>h` · `<n>` changes · `<mode>` | | | |
| 3 | `<stop>` · `<city / town / ryokan>` | `<dates>` | `<n>` | [`<name>`](`<link>`) (chosen) · [`<name>`](`<link>`) |
| | ↓ out to `<airport>` · `<h>h` · `<n>` changes · `<mode>` | | | |

**Totals:** `<n>` total transit · `<n>` separate stays · `<n>` inn nights / `<n>` city nights · `<n>` one-nighters. Every figure here comes from `plan`, never typed; the transit total sums the leg rows above, both airport legs in it, rounded to five minutes.

**Notes:** `<shuttle window, last-mile detail>`, one per stop that needs one. **Assumed:** `<every default you chose for them>`.

**To confirm**

1. `<unsourced leg, unverified opening, shuttle to arrange>`

If the total overshoots, say which nights you would give up; never trim silently.

## Stage 4 — Where to stay

```
Goal    two or three stays earmarked at every stop, never one pick forced
Inputs  the itinerary table from Stage 3; Taste and Budget from the Trip profile
Do      one stop per message, in trip order: the shortlist only, three to five options chosen against the
        profile in one `| Stay | Price | Why |` table, best fit first, Why in your words from the write-ups
        verbatim; where one is plainly the pick, say so
Ask     first: whether they want any of them opened up — then which two or three they would keep in the running. Max 2 follow-ups, only where the options differ on it
Output  the itinerary table's `Stay options` cell for that stop — the earmarked names, the lean
        marked `(chosen)`; a stop with none stays open. Closing the stage: the trip drawn as a page,
        built and opened without being asked — guides/visualizing-the-trip.md
Next    Stage 5 — make the route work
```

**Close the stage by drawing the trip.** Once the last stop has its earmarks, build the trip page from the itinerary table as it stands and open it beside the chat — `guides/trip-visual-template.html`, filled as `guides/visualizing-the-trip.md` says, published as an artifact where that tool exists. **Do it; never offer it**: this is the first time they see the trip whole. Stage 5 updates the same page.

**Earmark, don't pick.** Nobody settles a hotel mid-chat — they compare prices and check points first. So ask which **two or three to keep in the running**, never which one. The good inns sell out, so the second name earns its place; one earmark is fine, none leaves the stop open. **The user chooses**, unless one stay is plainly the pick.

**A ryokan slot expands here.** Stage 3's ryokan slots are areas, not inns, and each is **one call, one table**: `stays fuji` (Hakone, Izu) · `stays fujilakes` (Kawaguchiko) · `stays snow` (Minakami, Minamiuonuma, Yudanaka, Yamada Onsen) · `stays kaga` (Yamashiro, Yamanaka) · `stays east` (Amagase, Yufuin, Kurokawa) · `stays sapporo-onsen`. One table, **the town as a column**, so the choice of inn fixes the town and the leg at once; then re-price the stop string with it. **Hokkaido's mountain night is Niseko.**

### How to work the table

1. **Filter the master inn table** by the stop — its `Area`, then the `Reach` column for the gateway city; the Stage 2 card's `fits` tag where the stop is a choice between areas. With the engine, `cd builder && node route.js stays <place> [--budget modest|comfortable|splurge] [--bath]` prints the same rows, filtered against the profile.
2. **Order best-fit-first for this traveller**, the `Taste:` line as the frame, not best-scored-first. A quiet inn up a valley is the wrong recommendation for someone with a six-year-old, whatever its score.
3. **Show three to six as one table, best fit first** — the table `stays` prints, up to six rows, inns and hotels together. Never sub-tables, never the whole filtered set, never bullets. If the tool prints a second table — the nearest place it covers, when this one has nothing — print that too, and no more. One row each, this header:

   | Stay | Price | Why |
   |---|---|---|
   | `<name · inn / hotel · tier score · editor's pick where it is one · [map](<link>) · [write-up](<link>) · [book on Ikyu](<link>)>` | `<price>` | `<why it is special for them, its key features and its reservations — from the write-up>` |

   **Keep the line the tool prints under a ryokan table** — the pointer to [ryokancatalog.com](https://ryokancatalog.com) for the inns this table left out. It is part of the table, read out every time, never dropped as boilerplate: five or six rows here, the rest of the country there, and it is how somebody who wants a different inn finds one.

   **Why gets the width**: the name, the neighbourhood or kind, the score, the editor's pick and every link ride together in the `Stay` cell, so there is no Links column. Two variants, as `stays` prints them: a ryokan option spanning towns adds `Town` — `| Stay | Town | Price | Why |`; the inns within reach of a city add where they are reached from — `| Stay | From <city> | Price | Why |`.

4. **What goes in the cells.** **`Why` is yours** — the section below says how. **`Price`** says what it includes — per night for two, dinner and breakfast for an inn, room only for a hotel — once, in that cell. **Where a room can be paid for with points, the scheme is named in `Price` too** (`$375–700 · or Hyatt / Chase points`), never in `Why`: points are a way of paying, not a reason to stay. The links live in the `Stay` cell — the Google Maps pin first, then the homepage or the inn's `ryokancatalog.com` write-up, then Ikyu. The bath — in the room, some rooms, none — and anything else that changes the choice goes in `Why`, in a clause.

   **Ikyu, said once.** The first time an inn row carries one: *"[ikyu.com](https://www.ikyu.com/en-us/) is a Japanese booking site with an English version, and the easiest place to book most of these inns; where a row has no Ikyu link, book on the inn's own page or by email."* Then move on.

   **When one is plainly the pick, say so.** Where the tool prints its one-clear-choice line, or an S-tier editor's pick sits beside a B, say it in a sentence — *"Myoken Ishiharaso is the one here; the others are fallbacks if it is full"* ; the rest stand as backups.
5. **Under the table: the held-back count, then the closing line.** When the tool's header says more are on the list, one line says so — *"four more on the kit's list — ask and I'll show them"*. Otherwise the order of the rows is the recommendation. Close the first message on the line Stage 3 prescribes, not on *"which one?"*; later ask which two or three to keep in the running, and the first they name is the lean.

**Opening up a stay means reading its [ryokancatalog.com](https://ryokancatalog.com) page** — rooms, bath, kitchen, setting, weaknesses — plus the distance from the gateway, the room with the private bath, and how to book.

**How many, by kind of stop:**

- **A hotel group named after a loyalty scheme is offered only when they raised points.** Where the table groups a city's hotels, the Japanese-run houses and the boutiques lead; the points group goes last as one line unless their profile mentions points or that chain. A hotel whose case is the address and the points is a fine answer to *"we have Hyatt points"* and a poor one to *"where should we stay in Tokyo"*.
- **A city stop** (Tokyo, Kyoto, Osaka, Fukuoka) — **up to six hotels for Tokyo, Kyoto or Osaka, so the list shows variety; one or two for a minor city**, each chosen against their `Budget:` and `Taste:` lines. **Where the table has fewer, say so and say how many**; a city with none offers the live catalogue or the nearest city the kit covers, never a padded list. Up to two notable inns actually in the city belong in the same table, the word *inn* in their `Stay` cell and a clause in `Why` saying they are a different product on a different price basis. Tokyo is a hotel city: the inns near it are countryside places an hour out, a separate stop.
- **An inn stop** (a hot-spring valley, a mountain town, a coast) — five where the table has five, fewer where it doesn't. In a thin area, one inn plus a hotel in the nearest town is a legitimate answer.
- **A stop that is a ryokan option spanning towns** — **one table, the town as a column**, the travel time from the gateway city in the Town cell, never in the prose: that difference usually decides it. Choosing the inn fixes the town, so re-price the stop string with the place key `route.js places` prints. Where a slot is a single town, only its rows can be taken without leaving the route.

**Rules for this stage:**

- **Don't lead with the most expensive option** unless they asked for the splurge. Lead with the best fit; name the dearest as the reach if there is a reason. **An editor's pick above their budget still prints, last, marked "above the budget"** — say in a clause what the extra buys.
- **Prefer inns with a bath in the room**, and say why in half a sentence: it settles tattoos, privacy and bathing at once. **"Some rooms" is fine**, often the better buy — but **"some" always means a specific, dearer category**, never a room the inn might give you on the night: price that category, not the entry room. Where a group has none, say so and ask whether the inn has a private bath bookable by the hour.
- **Getting around is a fact, not a warning.** Say the station distance plainly; Tokyo taxis are cheap.
- **Mention booking mechanics only when unusual** — no online booking, a window that opens on a fixed date months ahead, agent-or-Japanese-site only, a lottery. Say plainly when you don't know.
- **Give the Google Maps link first, the rest after it**, in the order the tool prints them, all inside the `Stay` cell. The map link is the property's own Google place; where a row has none, say the map is unconfirmed and give the site alone. Never build a maps search link out of a hotel's name — it lands on the town, not the building.
- **When the budget doesn't land.** A price reading *rate not researched — check live* still prints, with that note, and goes on **To confirm**. Where every row is above their budget, show the nearest rows and say the kit has nothing at that price here. Convert a yen budget once, at a round rate you state — ¥150 to the dollar unless they give one — the one number you may type.
- **Say what a price band is when you quote one.** Hotel bands are three-night checks for two, taxes included, across February, May and October; Japanese holidays run well above them.

### The Why cell is yours; the facts are the kit's

Every inn and hotel carries a hand-researched write-up, printed in full by the tool: your source, not the cell. **Write `Why` in your own words for this couple** — two-thirds what makes it special and why they would pick it, a reservation or two at the end — — two or three sentences on what would make the night special for *them*, tied to their `Taste:` and `Draws:` lines; the key features (the bath and whether it is in the room, the kitchen, the setting, the size); and its real reservations — a noisy dining room, a blocked view, a bath only in the top rooms — said plainly. **Every fact comes from the write-up or the inn's page; nothing is invented.**

Gora Kadan Fuji, for a couple on their first ryokan night: *"The gentlest way in: a hotel-ryokan hybrid with Fuji in front of you, a pool, three dining rooms and nothing about the form to be nervous about. Book an Open-air Bath Suite or above for spring water in the room, and the sushi or teppanyaki counter over the kaiseki."*

**Explain the score once, the first time a table shows one:** *"A-tier · 8.8 / 10 means tier A, 8.8 out of 10 — the catalogue's reading of the FlyerTalk thread and the Japanese review sites; S is the top tier, and a dash means unscored: a Japanese-guest favourite nobody has written up in English."* Introduce the catalogue once: *"every inn links to its page on ryokancatalog.com — the long read: rooms, bath, food, how to book."*

### Two things to say out loud once

- **A ryokan night is a fixed schedule, so shape the day around it.** Where there are sights (Nikkō, Takayama), take an early train, see them through the late morning, check in mid-afternoon, and fit two more hours in after checkout. A late arrival can cost the dinner you paid for.
- **The price isn't like-for-like.** A ryokan's rate covers two substantial meals for two; a hotel's covers the room, so the gap is smaller than it looks.

<!-- generated:catalog-howto -->
- Every inn has an **overall score from 1 to 10** and a **tier**: S ≥ 9 (build the trip around it), A ≥ 8 (anchor a leg), B ≥ 7 (right inn, right place), C ≥ 6 (situational), D (the evidence warns). Current spread: S 5 · A 50 · B 49 · C 33 · D 10 · unscored 52.
- Scores are **evidence-adjusted**: the reading of the forum text minus a small confidence discount when only one or two stays are on record, so a thinly-reviewed inn reads slightly below an equally praised, well-corroborated one.
- Five **aspect scores, 1 to 5**: Food (cuisine) · Bath (onsen) · Service · Room · Place (setting). Each carries a paragraph of prose explaining it.
- 52 inns are **unscored** — nobody has written one up first-hand in the thread. Where a Japanese crowd rating exists it is given instead, out of 5, and named by its source.

Reading a listing, in four lines:

1. **Tier and score** answer "is this worth building a leg around?" — S and A yes, B is the right inn in the right place, C is situational.
2. **The five aspect scores** (Food · Bath · Service · Room · Place, each out of 5) say *why* — a 5 for food and a 3 for the bath is a very different night from the reverse.
3. **The prose under each aspect** is the actual evidence. Read the one aspect you care most about before you book.
4. **Unscored** means nobody has written it up first-hand; where a Japanese booking-site rating exists it is shown instead, out of 5, and named.

The whole catalog is fetchable as data: https://ryokancatalog.com/catalog.md (one table, all inns) · https://ryokancatalog.com/api/inn/<slug>.json (one inn in full) · https://ryokancatalog.com/place/<place> (a ranked page per town, prefecture and region) · https://ryokancatalog.com/llms.txt (how the data is laid out). The kit ships a snapshot of the first three in `catalog/`; the live site is always the primary.
<!-- /generated:catalog-howto -->

**Before showing inns to a family:** most are adult-oriented. The `family-ok` tag marks the few whose write-up says they take children; its absence means *not stated*. Check the inn's page for its child policy and a room for three or four, and price it **per person**.

### The master inn table

<!-- generated:inns -->
**80 inns, one row each.** Drawn from a 199-inn catalogue re-scored from the FlyerTalk forum thread written by a traveller who posts as **KI-NRT**. This is the only place an inn is listed; everything else in the kit points here.

**Two links to give them the first time you introduce ryokans** — the FlyerTalk thread author KI-NRT's primer, https://www.flyertalk.com/forum/34617783-post1.html, which is the plain-English introduction to what an inn night is, and https://ryokancatalog.com, where every inn below can be read in depth. Both, once, at the first mention.

**Columns.** `Inn` name · `Link` its full page, fetchable · `Area` the town or valley it is in · `Tier score` **S** ≥ 9 · **A** ≥ 8 · **B** ≥ 7, `—` means nobody has written it up in English, so treat the score as unknown · `In-room bath` **yes** every room, **some** certain rooms or the top room only, **no**, **unstated** the catalogue carries no answer — ask the inn · `Price band` US dollars a night for two **with dinner and breakfast**, `ask` means the inn quotes on request · `Reach` the gateway cities whose leg to this inn was **looked up in a real timetable**, nearest first, written `kyoto 3h/1 train` — three hours, one change, by train: the same three things Stage 5's plan asks for on every leg, so a Reach tag can be quoted straight into a leg row (`changes to confirm` = the hours were researched and the changes were not; `in town` = the inn is in that city, so there is no journey and no mode); a city that is not listed is a leg nobody researched, not a long one, and `see <town>` means the town has researched legs but this inn's own last mile does not — look the town up in the corridor table and ask the inn how you are meant to arrive · `Fits` which trips this inn belongs to, from the closed list below · `Editor's pick` yes for an inn kept whatever the sort would do with it · `Hook` one line of why · `Ikyu` the inn's page on ikyu.com, the Japanese booking site with an English front and the easiest place to book most of these; `—` means the kit has no Ikyu page for it, so book on the inn's own site or by email.

**The `fits` tags.** The same vocabulary is used by the place cards in Stage 2 and the trip shapes in Stage 3, so "which inns fit this shape?" is answered by matching a tag. Every inn carries exactly one **place** tag, with one deliberate addition — a Fuji-lakes or Nikkō inn within two and a half hours of Tokyo also carries `golden-route-stop`, because those are the same decision. The last two tags are **features** and may be absent.

- `golden-route-stop` — the standard inn night out of Tokyo, two and a half hours or less away: the Hakone and Izu hot-spring belt, and the Fuji-lakes and Nikkō inns close enough to be the same decision
- `fuji-lakes` — the Fuji Five Lakes (Kawaguchiko, Yamanaka) — where you actually see the mountain; out and back from Tokyo
- `tokyo-splitter` — Nikkō and northern Tochigi: two hours out and back, so it splits a long Tokyo stay instead of interrupting the run west
- `kansai-side-trip` — Kyoto, Nara and Osaka and the country around them — reached from a Kansai base
- `kanazawa-loop` — Ishikawa, Toyama and Fukui: the Kaga onsen towns and the Japan Sea coast around Kanazawa
- `alps` — Gifu, Nagano and the Hida valleys — mountain inns behind Takayama
- `snow-country` — the deep-snow valleys of Niigata, Gunma and the Nagano ski country: Echigo-Yuzawa, Minakami, Yudanaka
- `tohoku` — the northern third of the main island above the snow country — Fukushima to Aomori
- `hokkaido` — the northern island: a flight, and its own trip
- `inland-sea` — Hiroshima, the Seto Inland Sea, Shikoku and the San-in coast
- `kyushu-yufuin` — Kyushu's hot-spring heartland: Yufuin, Beppu, Hita
- `kyushu-kurokawa` — Kyushu's volcanic middle: Kurokawa, Aso, Minamioguni
- `kyushu-kirishima` — Kyushu's warm south: Kirishima, Kagoshima, Ibusuki
- `kyushu-nagasaki` — Kyushu's west: Nagasaki, Unzen and the Saga onsen towns
- `kyushu-elsewhere` — the rest of Kyushu — Amakusa, Miyazaki, the islands
- `okinawa` — the southern islands; a beach trip, and the one gap in this kit
- `family-ok` — the inn's own write-up says it takes children — most here do not
- `bed-not-futon` — beds rather than a mattress laid on the floor, at least in some rooms

**Every band here needs confirming for your dates.** Inn rates were researched for January; hotel rates are three-night stays for two, taxes included, checked across February, May and October. Japanese holidays run well above them: **11 February** (National Foundation Day), **Golden Week**, **Obon** and the **autumn-colour weekends**. One room can differ by a third between a Tuesday and a Saturday. **Off those months, read an inn band as a floor:** blossom and autumn colour run a third higher, high summer and the rainy season lower, and the property's own page for the actual dates is the only quote.

**What is deliberately not here.** Anything scored below **7.5** (the middle of the B band), anything unscored that is not an editor's pick or on the short allowlist, anything the catalogue's own prose advises against, and anything whose cheapest rate for two is over about **¥200,000 (\$1400)** a night. Editor's picks override all four. The live catalogue at https://ryokancatalog.com carries every inn, including these.

| Inn | Link | Area | Tier score | In-room bath | Price band | Reach | Fits | Editor's pick | Hook | Ikyu |
|---|---|---|---|---|---|---|---|---|---|---|
| Aizu Tsuruga Higashiyama Sohonzan | https://ryokancatalog.com/inn/aizu-tsuruga-higashiyama-sohonzan | Aizuwakamatsu | A 8.4 | unstated | $1000–1400 | sendai 2h15/1 train · tokyo 3h05/1 train · nikko 3h50/2 train | tohoku |  | A one-party-per-day private-house ryokan in Higashiyama Onsen, converted in 2022 from the owner's grandfather's architect-built home, funded by the family's horsemeat restaurants and holding nothing back on the room, the minibar or the table. | https://www.ikyu.com/en-us/00003014/ |
| Yamagata The Takinami | https://ryokancatalog.com/inn/yamagata-the-takinami | Akayu Onsen (Nanyō) | A 8.3 | some | $600–900 | sendai 1h35/1 shinkansen · tokyo 2h30/0 shinkansen · nikko 2h50/1 shinkansen | tohoku |  | A 19-room, street-facing ryokan in Akayu Onsen, remade in 2017 under a magazine editor's direction, with a spring-fed bath in every room and counter-seated kaiseki built on obscure Yamagata mountain ingredients, cuisine the thread author ranks top-10, possibly top-5, of every ryokan he has tried. | https://www.ikyu.com/en-us/00002496/ |
| Osteria Sincerità | https://ryokancatalog.com/inn/osteria-sincerita | Akayu Onsen (Nanyō) | B 7.8 | unstated | $850–1100 | sendai 1h35/1 shinkansen · tokyo 2h30/0 shinkansen · nikko 2h50/1 shinkansen | tohoku bed-not-futon |  | Osteria Sincerità is a three-room auberge ryokan on a town-centre lot in Akayu Onsen, built around chef Makoto Harada's Italian-Japanese counter cuisine and an undiluted source-fed cypress bath in every villa, 50 meters from its sister inn Yamagata The Takinami. | https://www.ikyu.com/en-us/00003078/ |
| Sanso Tensui | https://ryokancatalog.com/inn/sanso-tensui | Amagase Onsen, Hita | A 8.6 | yes | $420–600 | kumamoto 1h40/1 train · fukuoka 1h45/0 train · kagoshima 2h40/1 scenic | kyushu-yufuin | yes | A 19-room onsen ryokan in a moss forest outside Hita, built around giant boulders beside a river and waterfall, with bathing the thread author calls second to none at a place he argues is easily among Japan's 20 best. | https://www.ikyu.com/en-us/00002020/ |
| Tayuta | https://ryokancatalog.com/inn/tayuta | Amakusa | S 9.4 | yes | $1200–2700 | kumamoto 1h10/0 car/train · fukuoka 1h55/1 train · kagoshima 2h20/1 train | kyushu-elsewhere | yes | A 12-villa Amakusa newcomer, opened in September 2024 by a Kumamoto wedding company with no previous ryokan experience, where every suite runs 86–119 m² with a source-fed golden Kinsen onsen bath and island-dotted sea views, and chef Yuuki Nakano's 16-course dinner left the thread author stunned. | https://www.ikyu.com/en-us/00003246/ |
| Nakanobo Zuien | https://ryokancatalog.com/inn/nakanobo-zuien | Arima Onsen | B 7.9 | some | ask | osaka 1h05/0 bus · nara 1h35/2 train · kyoto 1h45/2 train | kansai-side-trip bed-not-futon |  | A 47-room adults-only inn from 1868 in the heart of Arima Onsen, run as a polished hybrid hotel with carpeted halls, a public cafe and a gift shop, and nothing like an intimate ryokan. | — |
| Atamiso | https://ryokancatalog.com/inn/atamiso | Bandai-Atami Onsen | A 8.3 | some | $450–800 | sendai 1h/1 shinkansen · tokyo 2h10/1 shinkansen · nikko 2h50/2 shinkansen | tohoku |  | An eleven-room ryokan above the Gohyakugawa River near Koriyama that ran effectively private when the thread author stayed in May 2022, taking just two parties at a time, with chef Asano serving and explaining every course himself. | https://www.ikyu.com/en-us/00002188/ |
| Auberge Suzukane | https://ryokancatalog.com/inn/auberge-suzukane | Bandai-Atami Onsen | A 8.0 | unstated | ask | sendai 1h/1 shinkansen · tokyo 2h10/1 shinkansen · nikko 2h50/2 shinkansen | tohoku bed-not-futon |  | Suzukane is a corporate-owned ryokan in the center of Bandai Atami run by a former wedding coordinator, with a full suit of knight's armor at the entrance, and the reasons to stay are the food, the warmth of the staff and the big renovated rooms with source-fed in-room onsen. | — |
| Bettei Oborozukiyo | https://ryokancatalog.com/inn/bettei-oborozukiyo | Dogo Onsen, Matsuyama | B 7.8 | yes | ask | see Hiroshima (town) — inn's own leg not sourced | inland-sea bed-not-futon |  | A 19-room inn five minutes' walk from Dogo Onsen Honkan, built in 2015 with a classic look but a fresh, modern feel, and the thread author calls it far and away the top luxury option in the town. | — |
| Kanshuku-en Eshikoto | https://ryokancatalog.com/inn/kanshuku-en-eshikoto | Eiheiji | — | unstated | $750–1150 | kanazawa 1h/0 train · kyoto 1h45/1 train · takayama 2h55/1 train | kanazawa-loop | yes | Kanshuku-en Eshikoto is an eight-villa auberge opened in November 2024 by the Kokuryu sake brewery beside its ESHIKOTO complex near Eiheiji, the Soto Zen head temple, and each is a whole-villa rental of about 103 square meters with a semi-open-air onsen bath and Echizen-craft art. | https://www.ikyu.com/en-us/00003286/ |
| Shogetsu | https://ryokancatalog.com/inn/shogetsu | Gero Onsen | A 8.8 | yes | $600–950 | takayama 1h/0 train · kanazawa 3h/1 train · kyoto 3h05/1 train | alps |  | A 21-room hilltop ryokan overlooking the Gero Onsen valley, a tall, nondescript building outside but inside all rock gardens, artsy lounges, a spectacular creative-kaiseki kitchen, amazing Gero spring water and valley views from room, lounge and communal bath alike. | — |
| Hakone Suishoen | https://ryokancatalog.com/inn/hakone-suishoen | Hakone | A 8.2 | yes | $550–800 | hakone in town · tokyo 2h10/1 train · kyoto 3h/1 train | golden-route-stop bed-not-futon |  | A 23-room Fufu-group ryokan in Hakone that does not use the Fufu name, because it is more traditional in architecture and aesthetics and caters to a slightly more mature crowd, and its dining rooms are set in a Taisho-era Mitsui villa. | https://www.ikyu.com/en-us/00001359/ |
| Yamado | https://ryokancatalog.com/inn/yamado | Hottoyuda Onsen | A 8.2 | unstated | $600–850 | sendai 2h/1 shinkansen · tokyo 4h/1 shinkansen · nikko 4h05/2 train | tohoku bed-not-futon |  | A 12-room hot-spring retreat in the Iwate mountains with free-flowing source onsen in every room, a private bath suspended over the stream that is worth the trip on its own, and Iwate-proud staff whose hospitality stood out most for the thread author. | https://www.ikyu.com/en-us/00001634/ |
| Bettei Amafuru Oka | https://ryokancatalog.com/inn/bettei-amafuru-oka | Ibusuki | B 7.9 | some | ask | see Fukuoka (town) — inn's own leg not sourced | kyushu-kirishima |  | Bettei Amafuru Oka is a 15-room annex on a hill over Kagoshima Bay, the most upscale stay in Ibusuki, taking just four groups a day and grafted onto a half-dormant resort complex, but it has onsen in every room, the sunaburo-and-ceramic-spa circuit, warm Nepali-staffed hospitality and chef Kanemasa Matsumoto's serious French cooking. | — |
| Onyado Kawasemi | https://ryokancatalog.com/inn/onyado-kawasemi | Iizaka Onsen | A 8.3 | no | $850–1150 | sendai 1h15/1 train · tokyo 2h/1 train · nikko 2h55/2 train | tohoku |  | A twelve-room Iizaka Onsen ryokan where every room has an open-air onsen bath and meals served in the room, set around a pond garden, with a kitchen whose Japanese reputation drew the thread author there. | https://www.ikyu.com/en-us/00000292/ |
| Auberge Yusura | https://ryokancatalog.com/inn/auberge-yusura | Ise area | B 7.6 | yes | $870–1200 | kyoto 2h/1 train · nara 2h/2 train | kansai-side-trip |  | Yusura is a five-villa auberge near Ise Jingu, opened in 2018, with standalone rooms around a saltwater pond, each with an open-air bath of Sakakibara spring water trucked in from 45 minutes away, and a kaiseki kitchen led by a Kitcho-trained chef. | https://www.ikyu.com/en-us/00002538/ |
| Chalet Ivy Jozankei | https://ryokancatalog.com/inn/chalet-ivy-jozankei | Jozankei | A 8.2 | yes | $900–1400 | sapporo 1h/0 bus | hokkaido bed-not-futon |  | A 2019 all-suite riverside ryokan that the thread author calls Jozankei's premier luxury stay, with Aman-grade design, an involved okami and memorable Hokkaido kaiseki, an easy hop from Sapporo. | https://www.ikyu.com/en-us/00002679/ |
| Wabizakura | https://ryokancatalog.com/inn/wabizakura | Kakunodate, Semboku | A 8.9 | yes | $620–780 | sendai 2h15/0 shinkansen · tokyo 3h05/0 shinkansen · nikko 4h35/2 shinkansen | tohoku |  | A ten-room destination ryokan in the quiet Akita countryside near Kakunodate's samurai district, where the owner drilled 1,000 meters to give a town with no onsen its own hot spring, piped to every room. | https://www.ikyu.com/en-us/00001740/ |
| Kyo Yunohana Resort Suisen | https://ryokancatalog.com/inn/kyo-yunohana-resort-suisen | Kameoka | B 7.6 | yes | ask | kyoto 45 min/1 train · osaka 1h30/2 train | kansai-side-trip |  | Suisen is a real, source-fed hot-spring ryokan in the Yunohana Onsen area of Kameoka, 30 minutes from Kyoto by direct train, with an open-air onsen bath on the balcony of every one of its 13 rooms and a kitchen good enough that breakfast matched dinner. | — |
| Yoyokaku | https://ryokancatalog.com/inn/yoyokaku | Karatsu | B 7.9 | no | $300–550 | fukuoka 1h15/0 train · kumamoto 2h35/1 train · nagasaki 3h/2 train | kyushu-nagasaki |  | A 19-room inn in Karatsu, Saga, formed in 1893, with museum-grade Meiji-era architecture, a magnificent old-pine garden, a Karatsu pottery gallery and excellent in-room kaiseki from the local catch, at prices near the very bottom of the high-end range. | https://www.ikyu.com/en-us/00001186/ |
| Sanso Amanosato | https://ryokancatalog.com/inn/sanso-amanosato | Katsuragi | A 8.6 | no | $650–1000 | osaka 1h25/1 train · nara 2h15/2 train · kyoto 2h30/2 train | kansai-side-trip | yes | A modern eight-room auberge in deep Wakayama countryside that people book for its French-Japanese dinner. | https://www.ikyu.com/en-us/00002284/ |
| Kumano Bettei Nakanoshima | https://ryokancatalog.com/inn/kumano-bettei-nakanoshima | Katsuura | B 7.5 | some | ask | see Nara (town) — inn's own leg not sourced | kansai-side-trip bed-not-futon |  | Kumano Bettei Nakanoshima is an island ryokan off Nachikatsuura, a five-minute boat ride from shore and the only luxury option near Kumano Nachi Taisha and Nachi Falls, built around a seaside onsen that the thread author calls really nice and, at its best, spectacular and mystical. | — |
| Fufu Kawaguchiko | https://ryokancatalog.com/inn/fufu-kawaguchiko | Kawaguchiko | B 7.9 | yes | $930–1300 | tokyo 2h/0 train · hakone 3h45/3 train · kyoto 4h15/1 shinkansen | fuji-lakes golden-route-stop bed-not-futon | yes | Fufu Kawaguchiko is the Fufu group's flagship, a modern, youthful hotel-ryokan hybrid that the thread author calls the only choice for luxury travelers in the Fuji Five Lakes, though a slight notch below Fufu Nikko in most aspects. | https://www.ikyu.com/en-us/00002583/ |
| Nishimuraya Honkan | https://ryokancatalog.com/inn/nishimuraya-honkan | Kinosaki Onsen | A 8.8 | no | $700–1000 | kyoto 2h30/0 train · osaka 2h45/0 train · nara 3h20/1 train | kansai-side-trip |  | The 150-year-old flagship of Kinosaki Onsen and the thread author's annual crab pilgrimage: four stays in, he still names its Matsuba-gani kaiseki the best crab cuisine he has ever had and doubts anywhere ever will compare, served in your room in a traditional house built around a garden. | https://www.ikyu.com/en-us/00000476/ |
| Kinugawa Kanaya Hotel | https://ryokancatalog.com/inn/kinugawa-kanaya-hotel | Kinugawa Onsen, Nikkō | B 7.8 | no | ask | see Nikkō (town) — inn's own leg not sourced | tokyo-splitter |  | Kinugawa Kanaya is a 41-room hotel billed as Japan's first Western-style luxury establishment, with shoes-on hotel formality, optional meals and a photogenic garden in Kinugawa Onsen near Nikko. | — |
| Myoken Ishiharaso | https://ryokancatalog.com/inn/myoken-ishiharaso | Kirishima | S 9.5 | yes | $550–900 | kagoshima 55 min/0 train · kumamoto 2h30/1 train · fukuoka 2h45/1 train | kyushu-kirishima | yes | A 19-room inn on the Amori River at the edge of Kirishima National Park, with hot springs gushing from the rocks and mallards paddling past the baths, which two “otherworldly” stays made a permanent fixture of the thread author's personal top ten. | https://www.ikyu.com/en-us/00000305/ |
| Isshin | https://ryokancatalog.com/inn/isshin | Kirishima | B 7.7 | yes | ask | kagoshima 55 min/0 train · kumamoto 2h30/1 train · fukuoka 2h45/1 train | kyushu-kirishima bed-not-futon |  | An eight-villa contemporary onsen ryokan (2008) at the foot of the Kirishima mountains that delivered almost everything the thread author hoped for: standalone villas, private dining rooms and slick source-fed water that he singled out for special mention. | — |
| Soneka | https://ryokancatalog.com/inn/soneka | Kitahiroshima | A 8.6 | yes | ask | sapporo 35 min/0 train | hokkaido bed-not-futon |  | A four-villa private retreat opened in 2024 on 77,000m2 of forest and meadow near Kitahiroshima, 30 minutes from New Chitose Airport, where check-in, every chef-cooked meal and two baths of rare amber moor onsen all happen inside your own villa. | https://www.ikyu.com/en-us/00003285/ |
| Fuefukigawa Onsen Zabou | https://ryokancatalog.com/inn/fuefukigawa-onsen-zabou | Koshu | B 7.5 | yes | $450–650 | tokyo 1h30/0 train · hakone 3h15/3 train · kyoto 3h45/2 train | fuji-lakes golden-route-stop |  | A winery-owned Koshu ryokan that gave the thread author a "fairy tale-like" stay, with mesmerizing pond-and-garden grounds and glorious bathing, let down by middling cha-kaiseki, the one flaw he wished away. | https://www.ikyu.com/en-us/00001645/ |
| Takefue | https://ryokancatalog.com/inn/takefue | Kurokawa Onsen | S 9.3 | yes | $1300–1800 | kumamoto 1h50/0 car · beppu 2h25/0 bus · fukuoka 2h30/0 car | kyushu-kurokawa bed-not-futon | yes | A vast, lamp-lit bamboo-forest estate near Kurokawa and the thread author's favorite ryokan in Japan across three visits, the rare property that is itself the destination, where a butler of a nakai-san runs everything and every bath is private, though the fully exposed ones can shut in deep-winter snow. | https://www.ikyu.com/en-us/00001491/ |
| Gosho Gekkoju | https://ryokancatalog.com/inn/gosho-gekkoju | Kurokawa Onsen | A 8.5 | yes | $900–1400 | kumamoto 1h50/0 car · beppu 2h25/0 bus · fukuoka 2h30/0 car | kyushu-kurokawa |  | An eight-room hillside ryokan behind a massive gate in Kurokawa Onsen (renamed Gekkoju Kurokawa), with an onsen bath in every room plus private rental baths, including a man-made cave bath and the exposed hilltop Tenku (go after sundown). | https://www.ikyu.com/en-us/00002369/ |
| Taiza Onsen Sumihei | https://ryokancatalog.com/inn/taiza-onsen-sumihei | Kyotango | A 8.1 | some | $600–900 | kyoto 2h30/0 train · nara 3h15/1 train · tokyo 5h/1 train | kansai-side-trip family-ok bed-not-futon |  | A 23-room inn from 1868 on the Tango Peninsula that exists for Taiza-gani, the 'phantom crab' that only five local boats bring in. | https://www.ikyu.com/en-us/00001465/ |
| Hiiragiya | https://ryokancatalog.com/inn/hiiragiya | Kyoto | A 8.7 | no | ask | kyoto in town · osaka 45 min/0 train · nara 45 min/0 train | kansai-side-trip | yes | One of Kyoto's original big three, an 1818 inn facing Tawaraya, and the thread author's third stay was his best yet, because the appeal lies in depth, in layers of craftsmanship and in service that anticipates what you need, and nothing about it shouts for attention. | — |
| Akan Tsuruga Besso Hinanoza | https://ryokancatalog.com/inn/akan-tsuruga-besso-hinanoza | Lake Akan | B 7.8 | yes | ask | see Sapporo (town) — inn's own leg not sourced | hokkaido bed-not-futon |  | A 25-room ryokan that is the top (and probably only) luxury option on Lake Akan, with terrific Hokkaido kaiseki, a free-flowing onsen bath in every room and an interesting corner of eastern Hokkaido with Ainu culture and marimo on the doorstep. | — |
| Sui Suwako | https://ryokancatalog.com/inn/sui-suwako | Lake Suwa | A 8.1 | yes | $450–750 | tokyo 2h30/0 train · kanazawa 3h/2 shinkansen · takayama 3h15/1 bus | alps |  | A new-ish, modern 8-room ryokan on Lake Suwa that the thread author has now stayed at three times and calls his go-to in the area, definitely the top luxury inn near Matsumoto, with excellent local-smelt kaiseki and a rooftop mixed-gender bath looking across the lake to the Alps. | — |
| Gora Kadan Fuji | https://ryokancatalog.com/inn/gora-kadan-fuji | Lake Yamanaka area | A 8.0 | some | $900–1800 | tokyo 1h50/0 train · hakone 1h55/1 train · kyoto 2h35/0 train | fuji-lakes golden-route-stop bed-not-futon | yes | Gora Kadan opened its second-ever property in July 2025, a 42-room ryokan-hotel hybrid facing Fuji and big enough for a gym, a pool and three dining rooms. | https://www.ikyu.com/en-us/00003331/ |
| Minamikan | https://ryokancatalog.com/inn/minamikan | Matsue | A 8.3 | yes | ask | see Hiroshima (town) — inn's own leg not sourced | inland-sea bed-not-futon |  | A renowned but still underrated 16-room Matsue ryokan that the thread author calls by far the top in all of Shimane, where he loved a full 3-night stay in Mizu no Oto, the 121-square-metre suite with its own excellent onsen bath. | — |
| Bettei Senjuan | https://ryokancatalog.com/inn/bettei-senjuan | Minakami (Tanigawa Onsen) | A 8.7 | some | $550–750 | tokyo 1h40/0 train · sendai 2h30/1 train · nikko 2h50/2 shinkansen | snow-country bed-not-futon | yes | Established in 1997 as the upscale annex of Ryokan Tanigawa, Senjuan is an artistic showpiece in the shadow of Mt. Tanigawa, with carvings on every beam, a glass-walled corridor onto the Alps and source-fed baths in all 18 rooms. | https://www.ikyu.com/en-us/00000604/ |
| ryugon | https://ryokancatalog.com/inn/ryugon | Minamiuonuma | A 8.8 | some | $520–970 | tokyo 1h45/0 train · sendai 3h/1 train · nikko 3h10/2 shinkansen | snow-country |  | A rebuilt samurai residence in Minamiuonuma snow country, feudal Japan from the grounds and artsy and avant-garde inside, that the thread author says nails it on all counts: innovative local cooking crowned by Japan's best rice, private terrace onsen and polished, unintrusive service. | https://www.ikyu.com/en-us/00000631/ |
| Satoyama Jujo | https://ryokancatalog.com/inn/satoyama-jujo | Minamiuonuma | A 8.3 | some | $500–800 | tokyo 1h45/0 train · sendai 3h/1 train · nikko 3h10/2 shinkansen | snow-country |  | A 14-room design ryokan in Niigata snow country built around Keiko Kuwakino's foraged, vegetable-driven cooking at Sanaburi, which the thread author says gets no better anywhere than here and at Enowa. | — |
| Kinsuikan | https://ryokancatalog.com/inn/kinsuikan | Miyajima | A 8.1 | no | $470–830 | hiroshima 1h/1 train · fukuoka 2h15/2 train · kyoto 2h40/2 train | inland-sea |  | A 39-room Miyajima ryokan that won the thread author back to the island after a disappointing stay at Iwaso, provided you book one of the six renovated special rooms, because the regional kaiseki served there (conger eel, fugu, Hiroshima oysters) is the reason to stay. | https://www.ikyu.com/en-us/00001261/ |
| Hotel Iyaonsen | https://ryokancatalog.com/inn/hotel-iyaonsen | Miyoshi (Iya Valley) | B 7.9 | some | ask | see Hiroshima (town) — inn's own leg not sourced | inland-sea |  | A 20-room hotel perched over Shikoku's remote Iya Valley that the thread author calls a great experience even though, as luxury ryokans go, it is on the lower end of the scale: the incredible gorge setting (astonishingly gorgeous in fall foliage season) and the cable-car ride down to the riverside baths on the valley floor more than make up for the minor shortcomings, and both the service and the kitchen impressed him more than he expected. | — |
| Kohanyu | https://ryokancatalog.com/inn/kohanyu | Monobe River | A 8.3 | yes | $800–1700 | see Hiroshima (town) — inn's own leg not sourced | inland-sea |  | A four-room adults-only hideaway on Shikoku, built by a retired couple around a lucky spring strike and the owner's world-class vintage audio collection, where the thread author came expecting the river and the food and left most moved by the sound. | https://www.ikyu.com/en-us/00002663/ |
| Kansuiro | https://ryokancatalog.com/inn/kansuiro | Murasugi Onsen, Agano | A 8.5 | unstated | ask | tokyo 3h10/2 train | snow-country |  | A nine-room historic ryokan at Murasugi Onsen outside Niigata, chosen by the thread author over its renowned neighbors for the architecture and radium springs, and he came away calling the charm off the charts, a rare classic property he prefers to his usual wa-modern taste. | — |
| Tsukihitei | https://ryokancatalog.com/inn/tsukihitei | Nara | A 8.1 | unstated | $750–950 | nara in town · kyoto 45 min/0 train · osaka 1h/0 train | kansai-side-trip | yes | Tsukihitei is a five-room 1902 hideaway inside Nara's primeval forest, rescued from datedness by the Miyako Hotel Group's 2023–25 renovations, and it is now the thread author's clear answer to where luxury travelers should sleep in Nara, with first-rate creative kaiseki and a superb rebuilt villa in a setting nothing nearby matches. | https://www.ikyu.com/en-us/00001181/ |
| Fufu Nara | https://ryokancatalog.com/inn/fufu-nara | Nara | B 7.7 | yes | $780–1200 | nara in town · kyoto 45 min/0 train · osaka 1h/0 train | kansai-side-trip |  | A sleek modern Fufu resort in Nara with in-room open-air onsen even in the base rooms, and a restaurant set in a historic tea-house garden a shuttled five-minute walk downhill. | https://www.ikyu.com/en-us/00002739/ |
| Hotel Ridge | https://ryokancatalog.com/inn/hotel-ridge | Naruto | A 8.3 | no | ask | see Hiroshima (town) — inn's own leg not sourced | inland-sea |  | An intimate nine-room Otsuka-owned property on a ridge above the Naruto Strait, and the thread author's default refined stop for anyone entering Shikoku from Osaka or Kobe. | https://www.ikyu.com/en-us/00001682/ |
| Yunohanaso | https://ryokancatalog.com/inn/yunohanaso | Nasushiobara | B 7.7 | yes | ask | see Nikkō (town) — inn's own leg not sourced | tokyo-splitter bed-not-futon |  | A modern rural-Japanese onsen ryokan perched over the Hokigawa River in Nasushiobara, remote enough that most guests come purely for the springs, the food and the hospitality. | — |
| Fufu Nikko | https://ryokancatalog.com/inn/fufu-nikko | Nikkō | A 8.8 | yes | $850–1200 | nikko in town · tokyo 2h/0 train · sendai 2h20/1 train | tokyo-splitter golden-route-stop | yes | Fufu's 24-room Nikko property, opened in 2020 on the old grounds of the Tamozawa imperial villa, gave the town its first true luxury inn, modern and hotel-like where most ryokans are traditional, with an onsen bath in every room and a short walk to Tosho-gu. | https://www.ikyu.com/en-us/00002740/ |
| Shiguchi | https://ryokancatalog.com/inn/shiguchi | Niseko | A 8.8 | yes | ask | sapporo 3h/0 bus | hokkaido bed-not-futon |  | Shiguchi is Zaborin founder Shouya Grigg's five-villa kominka retreat, the ryokan he says he always wanted to make, with massive restored farmhouses filled with his art and two private source-fed baths in each. | — |
| Zaborin | https://ryokancatalog.com/inn/zaborin | Niseko | B 7.9 | yes | ask | sapporo 3h/0 bus | hokkaido |  | Zaborin has been Niseko's established luxury ryokan since 2015, with fantastic hardware, two onsen baths in every room and a loyal following, and the three guests who reviewed it here enjoyed it, one calling it a contender for the thread author's top ten. | https://www.ikyu.com/en-us/00002195/ |
| Ryokan Nishiyama | https://ryokancatalog.com/inn/ryokan-nishiyama | Onomichi | B 7.6 | unstated | $540–650 | hiroshima 1h/1 train · kyoto 2h20/1 shinkansen | inland-sea |  | A design-forward ryokan in suburban Onomichi, with standalone-house rooms up to 81 square metres, an all-day lounge of complimentary sake, beer and whisky, and a Japanese-French dinner with a wine pairing. | https://www.ikyu.com/en-us/00003049/ |
| Kuramure | https://ryokancatalog.com/inn/kuramure | Otaru | B 7.8 | yes | ask | sapporo 35 min/0 train | hokkaido |  | A 19-room modern retreat in Asarigawa Onsen, Otaru's only hot-spring village, five linked buildings along the Asarigawa river with a private onsen in every room. | https://www.ikyu.com/en-us/00001350/ |
| Iwanoyu | https://ryokancatalog.com/inn/iwanoyu | Shimosuwa | A 8.3 | some | $400–750 | tokyo 2h30/0 train · kanazawa 3h/2 shinkansen · takayama 3h15/1 bus | alps bed-not-futon |  | An 18-room Taisho-era onsen ryokan in the Nagano mountains that is a fixture on the stay-before-you-die lists, and at roughly 40,000 yen a head it is a screaming bargain by top-ryokan standards, which is exactly why the thread author braced for gotchas and found them, all in the lower room categories. | — |
| Shiki no Yado Michinokuan | https://ryokancatalog.com/inn/shiki-no-yado-michinokuan | Shiroishi | B 7.7 | unstated | ask | see Sendai (town) — inn's own leg not sourced | tohoku bed-not-futon |  | A nine-room ryokan from 1985 near Shiroishi Castle that doesn't scream opulent luxury and doesn't need to, because it is wrapped in forest, serves both meals in the room, cooks delectable local food and is elegantly staffed. | — |
| Asaba | https://ryokancatalog.com/inn/asaba | Shuzenji | S 9.4 | some | $1100–1600 | tokyo 1h45/0 train · hakone 1h50/2 train · kyoto 2h40/0 train | golden-route-stop | yes | A 500-year-old Shuzenji inn that the thread author keeps permanently on his list of top ryokans and calls the pinnacle of Japanese architecture, hospitality and cuisine near Tokyo, arranged around a koi pond, a night-lit bamboo grove and a working Meiji-era Noh stage where Living National Treasures still perform. | https://www.ikyu.com/en-us/00002155/ |
| Otogi no Yado Yoneya | https://ryokancatalog.com/inn/otogi-no-yado-yoneya | Sukagawa | A 8.1 | unstated | $350–650 | sendai 1h20/1 train · tokyo 1h45/1 train · nikko 2h50/2 shinkansen | tohoku |  | Otogi no Yado Yoneya is a 17-room fairy-tale-themed onsen ryokan deep in rural Fukushima near Sukagawa, its rooms and seasonal 'Otogi Kaiseki' dinner built on a playful (but not gimmicky) storytelling concept, with a six-room Hanare 88 annex added in 2021. | https://www.ikyu.com/en-us/00001344/ |
| Lamp no Yado | https://ryokancatalog.com/inn/lamp-no-yado | Suzu, Noto Peninsula | B 7.7 | no | ask | see Kanazawa (town) — inn's own leg not sourced | kanazawa-loop |  | A 14-room ryokan of old Japanese buildings in a cliffside alcove at the very tip of the Noto Peninsula, built around a long pool that runs between the buildings and the sea. | — |
| Shinsen | https://ryokancatalog.com/inn/shinsen | Takachiho | A 8.9 | some | $600–1100 | kumamoto 2h/0 car · fukuoka 3h30/0 bus · kagoshima 4h10/1 bus | kyushu-kurokawa bed-not-futon |  | A family-run 15-room gourmet inn in central Takachiho, spread across three distinct garden areas, where every meal is served in a rotating series of private dining rooms and the caviar comes from its own locally raised sturgeon. | https://www.ikyu.com/en-us/00001608/ |
| Wanosato | https://ryokancatalog.com/inn/wanosato | Takayama | A 8.3 | no | $550–850 | takayama in town · kanazawa 2h25/0 bus · kyoto 3h50/1 train | alps bed-not-futon |  | An eight-room farmhouse ryokan on an idyllic river in the forest outside Takayama, with cooking that fans and detractors alike call superb; the thread author found the dining far superior to the equally renowned Honjin Hiranoya Kachoan in town. | — |
| Machiyado Ichiryu | https://ryokancatalog.com/inn/machiyado-ichiryu | Takayama | — | unstated | $600–950 | takayama in town · kanazawa 2h25/0 bus · kyoto 3h50/1 train | alps |  | An adults-only town inn of eleven rooms a few minutes' walk from Takayama's morning market and old streets, opened in November 2024 in place of the 53-year-old Ryokan Seiryu, whose 25 rooms were rebuilt as 11, six of them suites, each with a semi-open-air bath. | https://www.ikyu.com/en-us/00003312/ |
| Onyado Chikurintei | https://ryokancatalog.com/inn/onyado-chikurintei | Takeo Onsen | A 8.2 | yes | $550–1400 | nagasaki 40 min/0 shinkansen · fukuoka 1h/0 train · kumamoto 1h50/1 train | kyushu-nagasaki |  | Chikurintei is the only bona-fide luxury ryokan in Takeo Onsen, with 11 secluded rooms at the foot of Mt. Mifuneyama, every one with a private onsen bath, both meals served in your room, and service the thread author ranked above Aman's. | https://www.ikyu.com/en-us/00000735/ |
| Miyakowasure | https://ryokancatalog.com/inn/miyakowasure | Tohoku | A 8.4 | yes | $600–850 | sendai 2h15/0 shinkansen · tokyo 3h05/0 shinkansen · nikko 4h35/2 shinkansen | tohoku bed-not-futon |  | A ten-room hideaway in remotest Akita with a source-fed open-air onsen in every room, memorable regional cooking and total silence. | https://www.ikyu.com/en-us/00001102/ |
| Migiwatei Ochi Kochi | https://ryokancatalog.com/inn/migiwatei-ochi-kochi | Tomocho, Fukuyama | A 8.5 | yes | $470–800 | hiroshima 1h10/1 train · kyoto 2h10/1 train · fukuoka 2h30/0 shinkansen | inland-sea |  | A modern 17-room adults-only ryokan on the water's edge in Tomonoura, every room facing the Seto Inland Sea with its own deck onsen bath, where the first night's dinner ranked among the best of the thread author's ryokan-going life. | https://www.ikyu.com/en-us/00001673/ |
| Yunotani Senkei | https://ryokancatalog.com/inn/yunotani-senkei | Totsukawa, Yoshino | B 7.6 | no | ask | see Nara (town) — inn's own leg not sourced | kansai-side-trip |  | A nine-room cottage ryokan in remote Totsukawa, the highest-end base the thread author found within reach of Kumano Hongu Taisha, with fresh 2017 log cabins and a private open-air onsen he calls pure bliss, run by a loud, energetic and warm-spirited attendant. | — |
| Tsuchiyu Bettei Satonoyu | https://ryokancatalog.com/inn/tsuchiyu-bettei-satonoyu | Tsuchiyu Onsen | A 8.3 | some | $570–800 | sendai 1h/0 train · tokyo 2h15/0 shinkansen · nikko 2h45/1 shinkansen | tohoku bed-not-futon | yes | A seven-room hideaway deep in the Fukushima mountains, built around Shinpeki, a two-level private rotenburo beside a forest stream that the thread author ranks with Takefue's best bath. | https://www.ikyu.com/en-us/00001149/ |
| Mt.Resort Unzen Kyushu Hotel | https://ryokancatalog.com/inn/mt-resort-unzen-kyushu-hotel | Unzen | A 8.4 | yes | ask | nagasaki 1h15/0 car · kumamoto 2h10/2 ferry · fukuoka 3h/2 bus | kyushu-nagasaki bed-not-futon |  | A luxury hotel rebuilt from scratch as a modern boutique property, right next to Unzen Jigoku, the steaming sulphur hells, with front-row views of them from most rooms and the lounge, and after a posh 2018 renovation it has a rooftop lounge over the hellscape and the feel of an all-inclusive. | https://www.ikyu.com/en-us/00001108/ |
| Kagaya Bettei Matsunomidori | https://ryokancatalog.com/inn/kagaya-bettei-matsunomidori | Wakura Onsen | B 7.9 | yes | ask | see Kanazawa (town) — inn's own leg not sourced | kanazawa-loop bed-not-futon |  | The 31-room luxury annex of the giant Kagaya, which the thread author calls the top ryokan in Wakura Onsen hands down, with museum-grade art in the public areas, gracious staff and fine Noto seafood. | — |
| Sankara Hotel & Spa Yakushima | https://ryokancatalog.com/inn/sankara-hotel-spa-yakushima | Yakushima | A 8.9 | no | $750–1500 | kagoshima 2h30/1 flight · fukuoka 2h45/1 flight · kumamoto 3h20/2 flight | kyushu-kirishima |  | A 29-room auberge resort in the foothills of UNESCO-listed Yakushima, with an ocean-view pool and French-inspired cooking, which the thread author calls as close to an Aman as a Japan property can get, except that the food is better than at most Amans. | https://www.ikyu.com/en-us/00001577/ |
| Fujiiso | https://ryokancatalog.com/inn/fujiiso | Yamada Onsen | B 7.7 | yes | $480–900 | kanazawa 2h/0 train · tokyo 2h20/0 train · takayama 3h05/1 shinkansen | alps bed-not-futon |  | A historic Nagano inn with 240 years of pedigree and many repeat guests, which added two fresh, spacious suites in 2022 with source-fed onsen baths, so you can stay at a famous old ryokan without giving up comfort. | https://www.ikyu.com/en-us/00001534/ |
| Hanamurasaki | https://ryokancatalog.com/inn/hanamurasaki | Yamanaka Onsen | A 8.1 | no | $600–1000 | kanazawa 55 min/0 train · kyoto 1h35/1 train · takayama 2h50/1 train | kanazawa-loop bed-not-futon |  | A large, modern luxury ryokan above the Kakusenkei gorge, and the food (spectacular winter snow crab above all) is the main reason anyone comes; source-fed bathing reaches only its top suites. | https://www.ikyu.com/en-us/00001325/ |
| Kayotei | https://ryokancatalog.com/inn/kayotei | Yamanaka Onsen | B 7.6 | some | $700–1100 | kanazawa 55 min/0 train · kyoto 1h35/1 train · takayama 2h50/1 train | kanazawa-loop |  | A ten-room, family-run classic that delivers the traditional ryokan feeling in spades (riverside seclusion, antiques in the hallways, dinner in a private room), and the thread author still calls it a tad overrated, because across repeat stays it never excelled at any one thing: the food is good but not great, the rooms decent and minimalist, and the service not quite as personalized as you would expect from so small a family-run house. | — |
| Beniya Mukayu | https://ryokancatalog.com/inn/beniya-mukayu | Yamashiro Onsen | A 8.4 | some | $800–1200 | kanazawa 35 min/0 train · kyoto 2h/1 train · takayama 2h35/1 train | kanazawa-loop bed-not-futon | yes | A stylish Japanese-modern ryokan in Yamashiro Onsen that does almost everything right (a top suite the thread author called perfect, in-room onsen, gorgeous grounds, an excellent crab-season kitchen), and then serves dinner in one shared, echoing dining hall with no private or in-room option. | https://www.ikyu.com/en-us/00001145/ |
| Yado Shiontei | https://ryokancatalog.com/inn/yado-shiontei | Yonago | A 8.0 | yes | ask | see Hiroshima (town) — inn's own leg not sourced | inland-sea |  | A 10-room crab ryokan that opened in 2021 in Kaike Onsen, with modern hardware built to a very high quality, all-suite rooms on the area's saltwater spring and service Fc912 called pretty perfect, but the crab itself ranked below Nishimuraya and Bouyourou for the two parties who tried it, at roughly double Nishimuraya's per-person rate. | — |
| NEOLD Private House | https://ryokancatalog.com/inn/neold-private-house | Yoshino | B 7.7 | unstated | $560–660 | nara in town · kyoto 45 min/0 train · osaka 1h/0 train | kansai-side-trip bed-not-futon |  | A one-party kominka retreat in sacred Yoshino that offers the widest range of traditional Japanese activities the thread author has seen anywhere: Noh, geisha, tea ceremony, calligraphy, river fishing, and a full Shogun experience with an Osaka action cast. | — |
| Shoraiso | https://ryokancatalog.com/inn/shoraiso | Yudanaka Onsen, Yamanouchi | — | yes | $730–1100 | kanazawa 2h10/1 train · tokyo 2h35/1 train · takayama 3h25/2 shinkansen | snow-country | yes | A five-room inn re-opened in 2024 a five-minute drive from the Jigokudani snow-monkey park, with large in-room onsen baths (bigger than Takinami's, by the thread author's research) and dinner served in-room or in private rooms. | https://www.ikyu.com/en-us/00003198/ |
| Sanso Murata | https://ryokancatalog.com/inn/sanso-murata | Yufuin | S 9.0 | yes | $1000–1400 | beppu 1h/0 bus · fukuoka 2h10/0 train · kumamoto 2h25/1 train | kyushu-yufuin bed-not-futon | yes | A 12-room Yufuin inn whose plain grounds hide the best service the thread author has encountered anywhere in Japan (four staff rushing out with umbrellas in a storm, a butler dedicated exclusively to your room for every meal) and a spectacular kaiseki kitchen that shows off Kyushu's meat, fish and produce. | https://www.ikyu.com/en-us/00003248/ |
| Enowa Yufuin | https://ryokancatalog.com/inn/enowa-yufuin | Yufuin | A 8.4 | yes | $950–2000 | beppu 1h/0 bus · fukuoka 2h10/0 train · kumamoto 2h25/1 train | kyushu-yufuin | yes | An ultra-modern 18-room newcomer (June 2023) on a hilltop farm above the Yufuin valley, built around Tashi Gyamtso's vegetable-driven cooking, which the thread author found eclipsed even SingleThread and called reason alone to stay. | https://www.ikyu.com/en-us/00002995/ |
| Kamenoi Besso | https://ryokancatalog.com/inn/kamenoi-besso | Yufuin | — | unstated | $760–1500 | beppu 1h/0 bus · fukuoka 2h10/0 train · kumamoto 2h25/1 train | kyushu-yufuin bed-not-futon | yes | A 1921 lakeside estate on Lake Kinrin at the foot of Mt. Yufu, with seventeen rooms all built differently, garden-source kakenagashi in every tub and public rooms (a teahouse, a bar, a gramophone lounge) that guests keep writing about. | https://www.ikyu.com/en-us/00002470/ |
| Arcana Izu | https://ryokancatalog.com/inn/arcana-izu | Yugashima, Izu Peninsula | B 7.8 | some | $520–1100 | tokyo 2h10/1 train · hakone 2h25/2 train · kyoto 3h05/1 train | golden-route-stop |  | A 16-suite auberge above the Kano River whose French-Japanese kitchen the thread author ranks with the best restaurants of Tokyo and Paris. | https://www.ikyu.com/en-us/00001289/ |

_Left off on price: **Bouyourou** (Mikuni, from $1450), **Fuji Seiran** (Cape Osezaki, Izu, from $2400) and **THE YUKAWA Ichijoh Branch** (Kamasaki Onsen, Shiroishi, from $2200). On the live catalogue if the budget is not the constraint._
<!-- /generated:inns -->

### City hotels

<!-- generated:hotels -->
**51 city hotels in 13 cities** — at least three wherever a trip sleeps several nights, one or two in the smaller places, up to five where the city earns it. That is as deep as this list goes, and every pick shown to a traveller is chosen against their budget and taste, never off the top. Where you want more than it holds, the research method below is how to find it.

*One row per hotel. The `Stay` cell carries the name, the neighbourhood and two links: **the map link is the property's own Google place** — open it before the site, and give it first when you name the hotel to someone. `Group` is the question that actually decides the booking in the three cities a first trip sleeps in — whether you are spending points, spending money on a Japanese-run house, or spending less on something with more character than either; `—` where the city's list is too short to group. `Price` is US dollars **per night for two, room only, no meals** unless the row says otherwise, and where a room can be paid for with points the scheme is named there too. A band is the rounded low-to-high of three-night checks in February, May and October. **rate not researched — check live** = no usable rate was found, so read one off the property's own page rather than quoting a number. A band is a sighting, never a quote.*

*One line per hotel here; the full write-ups are in the kit's stays files.*

| City | Stay | Group | Price | Why |
|---|---|---|---|---|
| Tokyo | Palace Hotel Tokyo · Marunouchi, on the Imperial Palace moat · [map](https://www.google.com/maps?cid=1748987416538389436) · [site](https://en.palacehoteltokyo.com/) | Japanese-run luxury | $600–1250 | Tokyo's best Japanese-run luxury hotel, and the one FlyerTalk's regulars pick first: grand but not stiff, with the most polished service in the city. |
| Tokyo | The Okura Tokyo · Toranomon, on the Okura hill · [map](https://www.google.com/maps?cid=3528441622244778882) · [site](https://theokuratokyo.jp/en/the-okura-heritage-wing/) | Japanese-run luxury | $360–640 Prestige Tower · $650–950 Heritage Wing | Two buildings on the Okura hill, rebuilt in 2019 around the famous 1962 lobby and the Orchid Bar. |
| Tokyo | Hoshinoya Tokyo · Ōtemachi · [map](https://www.google.com/maps?cid=452005950262881873) · [site](https://hoshinoresorts.com/en/hotels/hoshinoyatokyo/) | Japanese-run luxury | $450–950 | Tokyo's one real ryokan: a seventeen-storey tower in Ōtemachi run like a country inn — shoes off at the door, tatami corridors, six rooms to a floor and a lounge on each with tea, sake and snacks. |
| Tokyo | K5 · Kabutochō / Nihonbashi · [map](https://www.google.com/maps?cid=10906498574121315795) · [site](https://k5-tokyo.com/) | Funky boutique | $275–650 | A design hotel in a converted pre-war bank in Kabutocho, Tokyo's old stock-exchange quarter, and the building is the reason to book it. |
| Tokyo | SOIL Nihonbashi · Bakurochō, Nihonbashi · [map](https://www.google.com/maps?cid=11886533522893997146) · [site](https://soilis.co/nihonbashi/) | Funky boutique | $200–225 | A small design-led hotel over its own cafe and sake bar in Bakurocho, the old textile-wholesale district. |
| Tokyo | Park Hyatt Tokyo · Nishi-Shinjuku, top of the Shinjuku Park Tower · [map](https://www.google.com/maps?cid=3231512592087154070) · [site](https://www.hyatt.com/park-hyatt/tyoph-park-hyatt-tokyo) | If you hold Hyatt or Chase points | $850–1050 · or Hyatt points | Tokyo's most famous luxury hotel, and for thirty years the one the others are measured against: hushed, spacious and high above the city on the top fourteen floors of a Shinjuku tower, the hotel Lost in Translation made known around the world. |
| Tokyo | Hotel Toranomon Hills · Toranomon (Unbound Collection by Hyatt) · [map](https://www.google.com/maps?cid=12819761384697507953) · [site](https://www.hyatt.com/hotel-toranomon-hills) | If you hold Hyatt or Chase points | $375–700 · or Hyatt / Chase points | An upmarket hotel on floors 11 to 14 of the Toranomon Hills Station Tower, and the one FlyerTalk regulars book over the Andaz next door. |
| Tokyo | Hyatt Centric Ginza Tokyo · Namiki-dōri, Ginza · [map](https://www.google.com/maps?cid=13498144464031270753) · [site](https://www.hyatt.com/hyatt-centric/en-US/tyoct-hyatt-centric-ginza-tokyo) | If you hold Hyatt or Chase points | $400–750 · or Hyatt / Chase points | A competent mid-range chain hotel whose case is its address and its points. |
| Kyoto | Hotel The Mitsui Kyoto · Facing Nijō Castle · [map](https://www.google.com/maps?cid=9260278570712509021) · [site](https://www.hotelthemitsui.com/en/kyoto/) | — | $700–1000 | The Mitsui family's 300-year-old gate is the entrance, and the hotel behind it faces Nijo Castle: the grandest address in the city. |
| Kyoto | Ace Hotel Kyoto · Karasuma-Oike, downtown · [map](https://www.google.com/maps?cid=8371560588874030601) · [site](https://acehotel.com/kyoto/) | — | $350–425 | A design hotel built into a 1920s telephone exchange at Karasuma-Oike, in the middle of the central grid. |
| Kyoto | Genji Kyoto · Kamo riverside at Gojō · [map](https://www.google.com/maps?cid=2448773851659491001) · [site](https://genjikyoto.com/) | — | $325–700 | A small design hotel on the Kamo river at Gojo, and the water is the point: nineteen rooms, nine of them with balconies over it. |
| Kyoto | Kyokoyado Muromachi Yutone · Muromachi, by Nishiki market · [map](https://www.google.com/maps?cid=10380402357816233814) · [site](https://www.m-yutone.com/) | — | $350–500 | A seven-room townhouse inn in Muromachi, the old silk-trading district, with its own Kyoto-cuisine kitchen, which is rare inside the central grid. |
| Kyoto | Higashiyama Shikikaboku · Higashiyama · [map](https://www.google.com/maps?cid=14720741155553756667) · [site](https://www.shikikaboku.jp/) | — | $475–1600 | An all-suite hotel on a Higashiyama canal, where each of the eight suites has its own front door and kitchen. |
| Kyoto | Sowaka · Gion, in the Yasaka side streets · [map](https://www.google.com/maps?cid=3046628050993449764) · [site](https://sowaka.com) | — | $900–1650 | A hundred-year-old Gion house that was a high-end ryotei restaurant before it was a hotel, in the side streets below Yasaka Shrine. |
| Kyoto | nol kyoto sanjo · Sanjo, central grid · [map](https://www.google.com/maps?cid=13547248684663816125) · [site](https://www.nolhotels.com/kyoto-sanjo/en/) | — | $375–650 | A century-old machiya on Sanjo that was the Kyoto shop of the Kinshi Masamune sake brewery, and the old sign is still over the door. |
| Osaka | Conrad Osaka · Nakanoshima, floors 33–40 of Festival Tower West · [map](https://www.google.com/maps?cid=10561270487337634692) · [site](https://www.hilton.com/en/hotels/osakaci-conrad-osaka/) | The big luxury names | $600–650 | A luxury hotel on the top floors of a Nakanoshima tower, and the one FlyerTalk picks among Osaka's big names: a member chose it over the Waldorf and called it stunning. |
| Osaka | Four Seasons Hotel Osaka · Dōjima, floors 1–2 and 28–37 of a tower · [map](https://www.google.com/maps?cid=4720923803230290434) · [site](https://www.fourseasons.com/osaka/) | The big luxury names | $475–750 | The 28th floor, Gensui, is what sets it apart: 21 tatami rooms with futons and a tea lounge of their own, inside a Dojima tower that opened in 2024. |
| Osaka | Waldorf Astoria Osaka · Umekita / Grand Green Osaka, floors 28–38 · [map](https://www.google.com/maps?cid=10203554227316915614) · [site](https://www.hilton.com/en/hotels/osawawa-waldorf-astoria-osaka/) | The big luxury names | $550–800 | Japan's first Waldorf Astoria, on the top floors of the Grand Green Osaka complex above Umeda station, opened recently. |
| Osaka | Patina Osaka · Banbacho, by Osaka Castle Park · [map](https://www.google.com/maps?cid=1397153970431032509) · [site](https://patinahotels.com/osaka/) | The big luxury names | $650–700 | A luxury hotel one minute from Osaka Castle Park, with the lobby, the bar and an open rooftop on the 20th floor facing the castle. |
| Osaka | Zentis Osaka · Dōjimahama, between Umeda and Nakanoshima · [map](https://www.google.com/maps?cid=3268535993116507316) · [site](https://zentishotels.com/en/osaka/) | Boutique and mid-range | $100–175 | A boutique hotel in Dojimahama where the entry room is a 25-square-metre studio with a kitchenette counter, so a stay works like a small flat. |
| Osaka | Hotel Noum OSAKA · Tenmabashi, on the Ōkawa river · [map](https://www.google.com/maps?cid=14769462904248915675) · [site](https://www.no-um.jp/en) | Boutique and mid-range | $75–150 | A design hotel at Tenmabashi facing the Okawa river, with a cafe and bar downstairs that stay open late. |
| Nikkō | NIKKO KANAYA HOTEL · Kami-Hatsuishi hillside, above the Daiya river · [map](https://www.google.com/maps?cid=7188186438001169666) · [site](https://www.kanayahotel.co.jp/en/nkh/) | — | rate not researched — check live | Japan's oldest surviving Western-style resort hotel, and the building is the reason to stay: carved woodwork through the halls and a main dining room from the old wings. |
| Nikkō | The Ritz-Carlton, Nikko · Oku-Nikkō, on the Lake Chuzenji shore · [map](https://www.google.com/maps?cid=14083782700276744005) · [site](https://www.ritzcarlton.com/en/hotels/tyonz-the-ritz-carlton-nikko/overview/) | — | rate not researched — check live | A lakeside resort on Lake Chuzenji with Mount Nantai across the water, and the first Ritz-Carlton anywhere built on a hot spring, piped down from the Yumoto source. |
| Kanazawa | Hyatt Centric Kanazawa · At Kanazawa Station · [map](https://www.google.com/maps?cid=18163347810694806014) · [site](https://www.hyatt.com/hyatt-centric/kmqct-hyatt-centric-kanazawa) | — | $170–260 | A mid-range Hyatt two minutes from the west exit of the shinkansen station, with newer hardware than the local competition and more than a hundred works by Kanazawa artists and craftspeople through the house. |
| Kanazawa | Sōki Kanazawa · Opposite Ōmichō Market · [map](https://www.google.com/maps?cid=8660080219350320087) · [site](https://www.uds-hotels.com/soki/kanazawa/) | — | $100–180 | A design hotel opposite Omicho market, so the fish market is across the street and breakfast can be a rice bowl at a stall. |
| Kanazawa | The Hotel Sanraku · Castle ↔ Ōmichō · [map](https://www.google.com/maps?cid=3210540274978094631) · [site](https://sanraku.kenhotels.com/kanazawa/en/) | — | $180–280 | A small luxury hotel between the castle and Omicho market, opened recently, with large stone-and-wood bathrooms and a breakfast reviewers single out. |
| Takayama | Hotel Wood Takayama · Historic district · [map](https://www.google.com/maps?cid=4068755749003767876) · [site](https://www.hotel-wood.com/en/) | — | $150–250 | A modern-timber hotel steps from the historic district, with rooms lined in local cedar and evening sake tastings in the lounge. |
| Takayama | Cup of Tea Ensemble · Hida Takayama Onsen, walk to old town · [map](https://www.google.com/maps?cid=4281950464834715407) · [site](https://cupoftea-takayama.net/ensemble/en/stay/) | — | $130–250 | A small hotel by Hida Takayama Onsen finished in thinned local timber and persimmon-tannin dye, so the town's woodwork is in the room itself. |
| Takayama | IORI Stay (whole machiya) · Old town · [map](https://www.google.com/maps?cid=8786461207275239765) · [site](https://iori-stay.com/stays/iori-takayama/) | — | $450–650 | A restored hundred-year-old machiya let whole to one party a night, with cypress baths in some houses and no lobby, no neighbours and no front desk. |
| Sendai | The Westin Sendai · Sendai Trust Tower, ~9-min walk from the station · [map](https://www.google.com/maps?cid=100035522374560294) · [site](https://www.marriott.com/en-us/hotels/sdjwi-the-westin-sendai/overview/) | — | $220–340 | The city's luxury pick by default, on the top floors of Sendai's tallest tower: rooms from the 28th floor look to the Pacific and the Zao range. |
| Sendai | Hotel Metropolitan Sendai East · On JR Sendai Station · [map](https://www.google.com/maps?cid=11881308586790047385) · [site](https://sendai-e.metropolitan.jp/) | — | $150–240 | A mid-range JR hotel built over Sendai station, so the shinkansen and the Matsushima trains are downstairs and a short stop costs no transit time. |
| Sendai | Mitsui Garden Hotel Sendai · Honchō, off Hirose-dōri · [map](https://www.google.com/maps?cid=15896202216254183646) · [site](https://www.gardenhotels.co.jp/sendai/) | — | rate not researched — check live | A business hotel off Jozenji-dori, the zelkova avenue, with an 18th-floor bath house that has an open-air pool looking over the city. |
| Hiroshima | KIRO Hiroshima by THE SHARE HOTELS · Mikawa-chō, downtown (walk to Peace Park) · [map](https://www.google.com/maps?cid=11574391172115413747) · [site](https://www.thesharehotels.com/kiro/) | — | $130–200 | A design hotel in a converted downtown hospital, where the old indoor pool is now the lounge, with a coffee counter beside it and Seto-region art and furniture through the rooms. |
| Hiroshima | THE KNOT HIROSHIMA · Directly opposite Peace Memorial Park · [map](https://www.google.com/maps?cid=3852773620326198519) · [site](https://hotel-the-knot.jp/hiroshima/en/) | — | $120–200 | A mid-range design hotel directly opposite the Peace Memorial Park, which makes it the best-placed bed in town for the memorial morning. |
| Hiroshima | RIHGA Royal Hotel Hiroshima · Motomachi, by the castle (5–10 min walk to Peace Park) · [map](https://www.google.com/maps?cid=2793274772327511974) · [site](https://www.rihga.com/hiroshima) | — | $160–280 | The city's grande dame, a tower by the castle in Motomachi, and the easy central choice for a one-night stop. |
| Fukuoka | The Ritz-Carlton, Fukuoka · Daimyō Garden City, Tenjin · [map](https://www.google.com/maps?cid=4019100722797758021) · [site](https://www.ritzcarlton.com/en/hotels/fukrz-the-ritz-carlton-fukuoka/overview/) | — | $650–900 | The luxury answer in Fukuoka, on the top floors of a Tenjin complex, and this or nothing here according to FlyerTalk's Japan regulars. |
| Fukuoka | Miyako Hotel Hakata · On Hakata Station · [map](https://www.google.com/maps?cid=8104812217387566281) · [site](https://en.miyakohotels.ne.jp/hakata/) | — | $140–220 | A comfortable mid-range hotel over Hakata station whose rooftop spa has indoor and open-air hot-spring pools, which a city hotel rarely offers. |
| Fukuoka | Hotel Il Palazzo · Haruyoshi, by the Naka river · [map](https://www.google.com/maps?cid=5157776137633665476) · [site](https://ilpalazzo.jp/en/) | — | rate not researched — check live | Japan's first designer hotel, and the red travertine facade and colonnade on the Naka river in Haruyoshi are the original ones. |
| Beppu | GALLERIA MIDOBARU · Mido-baru hillside, above Beppu Bay · [map](https://www.google.com/maps?cid=14563146951819742333) · [site](https://beppu-galleria-midobaru.jp/en/) | — | $250–400 | A design hotel on the steaming Mido-baru hillside where every room has its own hot-spring bath and a balcony over Beppu Bay. |
| Beppu | ANA InterContinental Beppu Resort · Horita highlands, above the city · [map](https://www.google.com/maps?cid=7041916728449616995) · [site](https://anaicbeppu.com/en/top/) | — | $450–700 | A polished onsen resort in the Horita highlands above the city: hot-spring baths, an infinity pool over the bay, and terrace suites with their own outdoor tubs. |
| Beppu | Suginoi Hotel · Kankaiji hillside, above the bay · [map](https://www.google.com/maps?cid=305412547823068297) · [site](https://suginoi.orixhotelsandresorts.com/) | — | rate not researched — check live | The Tanayu is the reason to come: five open-air pools terraced down the Kankaiji hillside, all of them facing Beppu Bay. |
| Kumamoto | THE BLOSSOM KUMAMOTO · Atop JR Kumamoto Station (Amu Plaza, floors 9–12) · [map](https://www.google.com/maps?cid=8047630828801114402) · [site](https://www.jrk-hotels.co.jp/en/Kumamoto/) | — | $130–220 | A mid-range hotel on top of Kumamoto station: the lift runs from the shinkansen to a 27-square-metre modern Japanese room, which makes it the frictionless night between ryokan legs. |
| Kumamoto | OMO5 Kumamoto by Hoshino Resorts · Downtown — 5-min walk to the castle, on the arcades · [map](https://www.google.com/maps?cid=12670613550056070621) · [site](https://hoshinoresorts.com/en/hotels/omo5kumamoto/) | — | $135–240 | A design hotel downtown on the covered arcades, with a rooftop terrace facing the illuminated castle keep five minutes' walk away. |
| Kumamoto | Onyado Nono Kumamoto · By Sakuramachi Bus Terminal, ~5 min to the arcades · [map](https://www.google.com/maps?cid=11053085772317450474) · [site](https://dormy-hotels.com/dormyinn/hotels/nono_kumamoto/) | — | $110–165 | A ryokan-style hotel by the Sakuramachi bus terminal: shoes off at the door, tatami throughout, and a top-floor hot-spring bath with an outdoor pool and a sauna. |
| Nagasaki | Hotel Indigo Nagasaki Glover Street · Minami-Yamate — on Glover Street itself · [map](https://www.google.com/maps?cid=12436252807261624389) · [site](https://nagasaki.hotelindigo.com/en/) | — | $135–250 | A restored 19th-century redbrick on Glover Street itself, inside the old foreign-settlement district, and the pick for a first visit. |
| Nagasaki | Nagasaki Marriott Hotel · Over JR Nagasaki Station (AMU Plaza) · [map](https://www.google.com/maps?cid=6279844900961491106) · [site](https://www.marriott.com/en-us/hotels/ngsmc-nagasaki-marriott-hotel/overview/) | — | $240–420 | A chain hotel built over Nagasaki station, opened recently, where guests name the staff as the best part of the stay. |
| Nagasaki | Garden Terrace Nagasaki · Akasako hillside, ~10 min from centre by taxi · [map](https://www.google.com/maps?cid=4667065101170157487) · [site](https://www.gardenterrace-nagasaki.co.jp/) | — | $220–380 | A design resort on the Akasako hillside that frames the city's night panorama from the room and from the bath, which is the reason people book it. |
| Nagasaki | Setre Glover's House · Minami-Yamate, by Glover Garden & Ōura · [map](https://www.google.com/maps?cid=4554416796099264006) · [site](https://www.setre-glover.com/) | — | $180–300 | A small hotel in the Minami-Yamate harbour quarter whose kitchen cooks creatively from Nagasaki produce, and dinner in the house is the reason to stay. |
| Kagoshima | Sheraton Kagoshima · Near Tenmonkan · [map](https://www.google.com/maps?cid=11738508066768117692) · [site](https://www.marriott.com/en-us/hotels/kojsi-sheraton-kagoshima/overview/) | — | $130–220 | A full-service chain hotel by the Tenmonkan arcades, opened recently, with floor-to-ceiling Sakurajima views and a hot-spring floor drawing real onsen water. |
| Kagoshima | Shiroyama Hotel · Hilltop above the city · [map](https://www.google.com/maps?cid=14457951521788314209) · [site](https://www.shiroyama-g.co.jp/en/) | — | $170–280 | The hilltop hotel above town, where the open-air onsen faces Sakurajima across the bay. |
| Kagoshima | Good Fellows Resort U/Q · Iso Beach, by Sengan-en (~10 min from centre) · [map](https://www.google.com/maps?cid=8482090062344223048) · [site](https://www.ikyu.com/00052534/) | — | $155–225 | A two-room villa on Iso Beach next to Sengan-en, where Sakurajima fills the window and one room has a private ocean-view sauna. |

**A ryokan in the city itself.** Where a city has an inn rated **8** or better — or in the top half of the B band, 7.5 and up — it is named here. Extra to the hotels above; the full row for each is in the master inn table.

- **Kyoto** — Hiiragiya (A 8.7)
- **Nara** — Tsukihitei (A 8.1) · Fufu Nara (B 7.7)
- **Hakone** — Hakone Suishoen (A 8.2)
- **Nikkō** — Fufu Nikko (A 8.8)
- **Takayama** — Wanosato (A 8.3)
<!-- /generated:hotels -->

**Osaka and Nara — the neighbourhood is the decision.** Both are a short train from Kyoto with shorter lists. **Osaka**: **Namba or Shinsaibashi** to walk home from dinner, **Umeda / Kita** to move on by train next morning — the cheapest big city for a good room, and a fair base when Kyoto is booked out. **Nara**: small, everything between the station and the park, and a night buys the temples at eight in the morning.

Where a band says *check live*, read one off the property's page for the actual dates.

### When the stop or the budget is outside these tables

The tables are a **design-and-luxury list** and do not cover every town. Say so plainly — "Japan is not expensive, this particular list is" — and use the research method in the appendix; a find is a row of the same table, band marked "unverified — check live".

**Satellite stops have their own file.** A stop with beds of its own — **Nikkō**, **Gero**, **Kinugawa**, the Kaga towns, the Hakone–Izu–Fuji belt — is answered by its region's file, not the city you reach it from:

<!-- generated:satellites -->
**Which gateway answers which town.** A stop that is not a city but has beds of its own is reached from the gateway city nearest it, which is rarely the one it is named after. Find the town below — these are the `Area` column of the master inn table — and read that gateway's leg. A town is listed once: the gateway named here is the one whose journey to it is shortest. (Single file: see the master inn table in Stage 4 for the full row of every inn in these towns.)

| Reached from | The towns and valleys it answers |
|---|---|
| **Tokyo** | Kawaguchiko · Koshu · Lake Suwa · Lake Yamanaka area · Minakami · Minamiuonuma · Murasugi Onsen · Shimosuwa · Shuzenji · Yugashima |
| **Nikkō** | Kinugawa Onsen · Nasushiobara |
| **Kyoto** | Ise area · Ise-Shima · Kameoka · Kinosaki Onsen · Kyotango · Taiza · Yunoyama Onsen |
| **Osaka** | Arima Onsen · Katsuragi |
| **Nara** | Katsuura · Totsukawa · Yoshino |
| **Hakone · Izu · Fuji** | Atami · Izu peninsula · Izu-Kōgen · Kobuchizawa · Lake Kawaguchi · Oyama · Shimoda · Yugawara |
| **Kanazawa** | Eiheiji · Mikuni / Awara · Notojima · Suzu · Toyama · Wakura Onsen · Yamada Onsen · Yamanaka Onsen · Yamashiro Onsen · Yudanaka Onsen |
| **Takayama** | Gero Onsen · Inuyama · Kiso valley · Matsumoto · Nagoya · Suwa |
| **Sendai** | Aizuwakamatsu · Akayu Onsen · Bandai-Atami Onsen · Echigo-Yuzawa · Hottoyuda Onsen · Iizaka Onsen · Kakunodate · Kamasaki Onsen · Kaminoyama Onsen · Karuizawa · Matsunoyama Onsen · Minakami / Tanigawa · Nyūtō Onsen · Shiroishi · Shizukuishi · Sukagawa · Tohoku · Tsuchiyu Onsen |
| **Hiroshima** | Dogo Onsen · Hatsukaichi · Kōchi · Matsue · Miyajima · Miyoshi · Monobe River · Naoshima · Naruto · Okayama · Onomichi · Setoda · Tomocho · Tomonoura · Yonago |
| **Sapporo** | Furano · Jozankei · Kitahiroshima · Lake Akan · Niseko · Noboribetsu Onsen · Otaru |
| **Kyushu** | Amagase Onsen · Amakusa · Ibusuki · Iki island · Karatsu · Kirishima · Kurokawa Onsen · Takachiho · Takeo Onsen · Unzen · Yakushima · Yufuin |
<!-- /generated:satellites -->

**Where a `fits` tag holds fewer than five inns, say so** and offer the nearest tag rather than padding.

### The follow-up questions — ask only when they change the pick

**Ask one of these only when the options in front of them differ on it** — if all five have a private bath, tattoos are moot — and at most two at a time.

- **A private bath?** Ask if anyone has **tattoos**, is shy about communal bathing, or wants the bath to themselves. A **bath in the room** or a **bookable private bath** settles it. Check the property's page for **overnight guests**; a day-visitor rule is a different rule.
- **A sauna?** Common at newer inns, usually gender-separated like the baths. Two people saunaing together need a **private or rental sauna**, or a mixed facility with swimwear.
- **How heavy do you want dinner?** Some kitchens serve a long formal *kaiseki*; others something lighter — French, wood-fired, farm produce, temple cooking. Two ryokan nights close together go on different kitchens.
- **Floor mattress or bed?** The `bed-not-futon` tag marks inns whose write-up mentions beds.
- **How formal?** Traditional: meals in your room, staff kneeling at the door. Modern-luxury: a dining room, wear what you like. People have strong preferences and rarely volunteer them.
- **Children, and how many of you?** Ask **before** showing inns to a family. Policies vary, the best inns are strictest, and the rule is often only in Japanese: check the page, then confirm by email.
- **Dietary needs?** Inn menus are fixed weeks ahead; vegetarian, no fish, an allergy are usually possible if stated at booking, never on arrival.

### The decision — earmark, don't pick

Fill a stop's row once they have earmarked, not in the message that first showed the options. **`Stay options` holds the two or three names they kept, each linked, the lean marked `(chosen)`**; a stop they have not leaned on lists its earmarks unmarked, and a stop with no earmark reads *open*. **After each stop, re-show only that stop's row**; the whole table is shown once, at the end.

**Close the stage by listing the stops still open.** Name each with its earmarks and the single line that will decide it — points at that chain, a bath in the room, the price on their dates. A pick can come back in this chat or a later one: *"Tokyo: the Okura"* is enough.

**Trip plan** · `<dates>` · `<n>` nights · arrive `<airport>`, depart `<airport>`

| # | Stop | Dates | Nights | Stay options |
|---|---|---|---|---|
| | ↓ in from `<airport>` · `<h>h` · `<n>` changes · `<mode>` | | | |
| 1 | `<stop>` · `<city / town / ryokan>` | `<dates>` | `<n>` | [`<name>`](`<link>`) (chosen) · [`<name>`](`<link>`) |
| | ↓ `<h>h` · `<n>` changes · `<mode>` | | | |
| 2 | `<stop>` · `<city / town / ryokan>` | `<dates>` | `<n>` | [`<name>`](`<link>`) (chosen) · [`<name>`](`<link>`) |
| | ↓ `<h>h` · `<n>` changes · `<mode>` | | | |
| 3 | `<stop>` · `<city / town / ryokan>` | `<dates>` | `<n>` | [`<name>`](`<link>`) (chosen) · [`<name>`](`<link>`) |
| | ↓ out to `<airport>` · `<h>h` · `<n>` changes · `<mode>` | | | |

**Totals:** `<n>` total transit · `<n>` separate stays · `<n>` inn nights / `<n>` city nights · `<n>` one-nighters. Every figure here comes from `plan`, never typed; the transit total sums the leg rows above, both airport legs in it, rounded to five minutes.

**Notes:** `<shuttle window, last-mile detail>`, one per stop that needs one. **Assumed:** `<every default you chose for them>`.

**To confirm**

1. `<unsourced leg, unverified opening, shuttle to arrange>`

**Every stay is a link, and the link is the real place**: a hotel to its own Google Maps pin (the link the hotel table prints, never a maps search on the name), an inn to its `ryokancatalog.com` page, its `Ikyu` link beside it. **Every earmark in `Stay options` is a link too** — an unlinked name is no use when the first choice is full.

## Stage 5 — Make the route work

```
Goal    the stops in an order that doesn't waste days, with every journey sourced
Inputs  the itinerary table as Stage 4 left it; the corridor tables below
Do      the eight steps, in order — most of it is arithmetic, and doing it in your head is how mistakes get in;
        the two orders are compared in a `| Order | Total transit | Separate stays | Inn / city nights | One-nighters |` table
Ask     1 question — which of the two orderings, once you have priced both
Output  the itinerary table finished, with totals. This is the deliverable. Then the trip page,
        updated from the finished table and re-opened — see guides/visualizing-the-trip.md, and
        fill guides/trip-visual-template.html
Next    offer Stage 6 in a single line. If they don't want it, they have what they came for.
```

**With the engine, this stage is one command.** `cd builder && node route.js plan "<stop string>" --in <airport> --out <airport>` prints the itinerary table, the totals with their arithmetic and the checks; paste it, fill the stays from Stage 4, and go to the page. The steps below are the chat-only version.

### The process

1. **List the stops** in the order they currently sit, with their nights.
2. **Look up every consecutive pair** in the corridor tables below — the tables the Stage 3 menu was priced from. Write the hours, the changes and the mode exactly as given.
3. **Reverse the list and price the reverse.** **Check both orders for backtracking first:** a stop reached only by passing back through one already left is in the wrong place — resequence, then price; the airport at the end is the one exception. A pair the tables do not hold and no hub composes (step 4) is `to confirm`, and a total containing one is **not a number**: write `≥ 6h20 (partial — 2 legs unsourced)`. Never fill a gap to make totals comparable.
4. **Compose any pair the tables don't hold through a hub city** — Tokyo, Sendai, Kyoto, Osaka, Nagoya, Kanazawa, Okayama, Hiroshima, Fukuoka, Kumamoto, Nagasaki, Kagoshima, Sapporo — per the composed-leg bullet below. Only a pair no hub joins is `to confirm`; look it up live if you can browse, and label it an estimate.
   - **4a. Before any live lookup, grep the full leg table.** `data/transit-legs.md` holds every sourced leg, including the inn legs the corridor table leaves out: search it for both place names, in both directions, first.
5. **Add both orderings up** — hours and changes — and show the two totals side by side, as the comparison table, one row per order:

   | Order | Total transit | Separate stays | Inn / city nights | One-nighters |
   |---|---|---|---|---|
   | `<as travelled, named by its first and last stop>` | `<h>h`⁠`<mm>` | `<n>` | `<n>` / `<n>` | `<n>` |
   | `<reversed>` | `<h>h`⁠`<mm>` | `<n>` | `<n>` / `<n>` | `<n>` |

   Total transit is every leg added up, both airport legs in it. The numbers live in the table and nowhere else; the prose under it names the trade-off and nothing more. A partial total keeps its `≥ X (partial — N legs unsourced)` form into the verdict, and settles the comparison anyway where the sourced part is already the larger.
6. **Check the defaults survive the order you chose:** every city at or above its card's minimum, each visit of a split city two nights or more bar a final airport-side night · one night at each inn unless the plan argued for two · no more than three inn dinners in a row · no zig-zags · an exit airport that suits the last stop.
7. **Add the totals up in writing, including the journey out to the departure airport** — the leg people forget; the airport table has it. Show the sum rather than the answer — `2h + 4h42 + 45min + 1h06 (to the airport) = 8h33` — so a reader can check the arithmetic.
8. **Present the winner with the trade-off against the runner-up** in a sentence — "an hour longer, but it drops a change and ends near the airport" — then finish the itinerary table. **Re-add the totals against the finished table before you send it**: the order changes last, and the totals go stale first.


### The corridor cheat-sheet

The main city-to-city journeys, the stops the Stage 3 routes pass through, and the airport transfers, each with **door-to-door hours** and the **number of changes** — station access and connections included, not the time the train is moving.

**Use this table. Never invent a number.** If a pair isn't here — check both directions first — say plainly that you have no sourced time and that they should check it before locking the order in.

<!-- generated:corridors -->
*176 journeys, door to door — station or hotel at one end to the other, including the walk and the wait, not just the train's timetable. "Changes" is how many times you get off and on again. Every line was looked up in a real timetable; nothing here is calculated. **Every journey runs the same both ways**, and each row is printed in the direction its sourced description was written — read From/To as a pair, not as an order.*

| From | To | Door to door | Changes | Mode | Route |
|---|---|---|---|---|---|
| Tokyo | Sendai | 1h40 | 0 | shinkansen | Tōhoku Shinkansen 'Hayabusa' direct Tokyo→Sendai (~1h31). |
| Tokyo | Kanazawa | 2h40 | 0 | shinkansen | Hokuriku Shinkansen 'Kagayaki' direct Tokyo→Kanazawa (~2h28). |
| Takayama | Tokyo | 4h55 | 1 | train | JR Ltd Exp 'Hida' Takayama→Nagoya (~2h30), change ~15 min to a Tōkaidō 'Nozomi'→Tokyo (~1h42) + hotel/station ends. (Via Toyama is nominally quicker — 'Hida' ~1h30 + Hokuriku Shinkansen ~2h06 — but only ~4 Toyama through-trains run per day.) |
| Tokyo | Kyoto | 2h45 | 0 | shinkansen | Tokaido Shinkansen Nozomi direct Tokyo→Kyoto (~2h15). |
| Osaka | Tokyo | 3h15 | 1 | shinkansen | Tōkaidō 'Nozomi' Tokyo→Shin-Osaka (~2h35, multiple per hour, ¥13,870 non-reserved / ¥14,500 reserved; 'Hikari' ~3h), then the Midōsuji subway Shin-Osaka→Umeda — a ~4-min ride, ~15 min with the walk and wait, and the leg's single self-handled change. ⚠ Tōkaidō services run all-reserved over the New Year peak — book ahead. |
| Tokyo | Hakone | 2h10 | 1 | train | Odakyu Romancecar Shinjuku→Hakone-Yumoto (~85 min), Tozan railway→Kōwakudani (~35 min), 5-min inn shuttle (reserve). |
| Tokyo | Nikkō | 2h | 0 | train | Tōbu Ltd Exp Asakusa→Tōbu-Nikkō (~2h), then ~5-min taxi. |
| Tokyo | Izu peninsula (Shuzenji) | 1h45 | 0 | train | 'Kodama'/'Hikari' Tokyo→Mishima (~45-55 min, every ~30 min), then the flat-rate cab into the Shuzenji valley (~40-50 min, book with the room). No self-handled change. Rail alt: Izuhakone Sunzu line→Shuzenji (~35 min) + short taxi, +1 change. |
| Tokyo | Echigo-Yuzawa (snow country) | 1h45 | 0 | train | Jōetsu Shinkansen Tokyo→Echigo-Yuzawa (~75 min), then ~30 min by car (inn can arrange). |
| Tokyo | Minakami / Tanigawa (snow country) | 1h40 | 0 | train | Jōetsu Shinkansen Tokyo→Jōmō-Kōgen (~66–70 min), then a ~20-min taxi (¥5,500 on a 2024 guest report; rank taxis wait at the station). Senjuan's own access page gives this exact chain as 約100分 door-to-door from Tokyo Stn — that's the figure used here. Its free pickup runs from MINAKAMI Stn (Jōetsu-line local), not Jōmō-Kōgen, and the inn quotes that relay-bus-to-Minakami chain at 約110分 — so the taxi wins by ~10 min and a great deal of hassle. |
| Lake Kawaguchi (Mt Fuji) | Tokyo | 2h | 0 | train | JR 'Fuji Excursion' Ltd Exp Kawaguchiko→Shinjuku direct (~2h, ~4/day). Miss it → Fujikyu→Ōtsuki + Chūō Ltd Exp = ~2h25, 1 change. |
| Tokyo | Kakunodate | 3h05 | 0 | shinkansen | Akita Shinkansen 'Komachi' direct Tokyo→Kakunodate (~3h, one seat). Snow-prone on the single-track stretch past Morioka. |
| Tokyo | Nyūtō Onsen | 4h | 1 | shinkansen | Akita Shinkansen 'Komachi' Tokyo→Tazawako ~2h50 (slower runs to 3h12), then the Ugo Kōtsū Nyūtō-line bus from Tazawako Station bay 1, 45-50 min to the Nyūtō Onsen-kyō stops, ~9-10 departures a day (¥800). The hourly headway means a 15-30 min wait, which is what makes it four hours door to door; a taxi is ~30 min / ~¥7,000. ⚠ January: the Komachi runs snow-prone single track past Morioka and the bus climbs a snow-walled mountain road. Tsuru-no-yu meets guests at the Alpa Komakusa stop by arrangement; Taenoyu runs no station shuttle. |
| Tokyo | Nagoya | 2h05 | 0 | shinkansen | Tōkaidō 'Nozomi' Tokyo→Nagoya, ~1h35–1h40, every ~10 min ('Hikari' ~1h50; 'Kodama' ~2h50). Station-anchored like tokyo>kyoto — from a central hotel door add the walk to the trunk. |
| Sendai | Kanazawa | 4h30 | 1 | train (two researched halves) | No single through-service — the real route changes at Tokyo (≈4 hr 30 min door-to-door). Times composed from the researched legs to and from Tokyo. |
| Sendai | Takayama | 6h30 | 2 | train (two researched halves) | No single through-service — the real route changes at Tokyo (≈6 hr 30 min door-to-door). Times composed from the researched legs to and from Tokyo. |
| Minakami / Tanigawa (snow country) | Sendai | 2h30 | 1 | train | Inn shuttle to Jōmō-Kōgen, Jōetsu Shinkansen→Ōmiya (~45 min), change to Tōhoku Shinkansen 'Hayabusa'→Sendai (~1h20) — all Shinkansen, one change. |
| Kakunodate | Sendai | 2h15 | 0 | shinkansen | Akita Shinkansen 'Komachi' Kakunodate→Morioka→Sendai as one through train (~2h05, no change), then a ~12-min taxi/inn car at the Kakunodate end (reserve). |
| Sendai | Nyūtō Onsen | 2h30 | 1 | shinkansen | The 'Komachi' is a through train at Sendai, so Sendai→Tazawako is 1h19 with no change, then the same 45-50 min hourly Nyūtō-line bus. ⚠ Same January exposure on the Morioka-Tazawako section and the mountain bus road. |
| Takayama | Kanazawa | 2h25 | 0 | bus | Nohi/Hokutetsu highway bus Takayama Nohi Bus Center→Kanazawa Stn west exit via Shirakawa-gō (~2h15, direct, reserve — the bus centre is at Takayama Stn, a 7-min walk from the inn). No rail link exists; the bus is the fast way. |
| Kanazawa | Kyoto | 2h30 | 1 | train | Hokuriku Shinkansen Kanazawa→Tsuruga (~50 min), change to Thunderbird Ltd Exp→Kyoto (post-2024 routing). Snow-risk in January. |
| Osaka | Kanazawa | 2h45 | 1 | train | Ltd Exp 'Thunderbird' Osaka Stn→Tsuruga (~1h20), ~10-min change at Tsuruga, Hokuriku Shinkansen Tsuruga→Kanazawa (~40 min) — ~2h10–2h30 station to station. Departs central Osaka, so there is no Shin-Osaka hop; the Tsuruga change is the one the Mar 2024 extension imposed (the one-seat Thunderbird to Kanazawa is gone). ⚠ January snow on the Hokuriku coast delays this corridor. |
| Kanazawa | Nikkō | 4h | 2 | shinkansen | Hokuriku Shinkansen Kanazawa→Ōmiya (~2h01), Tōhoku 'Yamabiko'/'Nasuno' Ōmiya→Utsunomiya (~25 min), change to the JR Nikkō Line local→Nikkō (~45 min, ~hourly) + inn shuttle. Two changes (Ōmiya, Utsunomiya) — reaches Fufu via the JR side, not the Asakusa Tōbu. |
| Echigo-Yuzawa (snow country) | Kanazawa | 3h30 | 1 | shinkansen | Modern route is all-Shinkansen with ONE change: ~25-min inn car/flat-¥5,000 taxi to Echigo-Yuzawa, Jōetsu 'Toki'→Takasaki (~22 min), cross to the Hokuriku 'Hakutaka'→Kanazawa (~2h05, timetabled; timed pairings run the station chain in 2h55–3h00). ~3h30 door-to-door. (Hokuhoku alt via Jōetsumyōkō is ~3h40–4h over 2–3 changes on a sparse line where half the trains terminate at Muikamachi and no IC cards are accepted — no faster, far less robust.) |
| Kanazawa | Yamashiro Onsen (Kaga) | 35 min | 0 | train | Kanazawa→Kaga-Onsen (~15–30 min), then Beniya Mukayu's free on-demand shuttle (~15 min; runs 14:20–18:00, call your arrival time ahead; returns every 30 min 8:45–11:15) — or a ~¥3k taxi. |
| Kanazawa | Yamanaka Onsen (Kaga) | 55 min | 0 | train | Kanazawa→Kaga-Onsen (~25 min), then ~25-min taxi up to Yamanaka (inn can arrange). |
| Minakami / Tanigawa (snow country) | Kanazawa | 3h15 | 1 | shinkansen | ~20-min taxi to Jōmō-Kōgen, Jōetsu Shinkansen→Takasaki (~15 min), cross to the Hokuriku 'Hakutaka'→Kanazawa (2h15–2h18, timetabled). One change, at Takasaki. Sibling of echigoyuzawa>kanazawa and ~30 min shorter for the same reasons Senjuan is always nearer: Jōmō-Kōgen is closer to Takasaki and the last mile is a shorter taxi. |
| Takayama | Kyoto | 3h50 | 1 | train | JR Ltd Exp 'Hida' Takayama→Nagoya (~2h30; 10/day — hourly only ~11:30–16:30, with 2h gaps outside), ~15-min transfer to a Tōkaidō Shinkansen 'Nozomi'→Kyoto (34 min). Alt with NO change: Hida 36 departs Takayama 15:33 direct to Kyoto, arr 19:17. ⚠ The Takayama line is snow-exposed — JR Central posts 大雪 advisories most Januaries; keep same-day slack. (All-reserved Dec 25–Jan 5; mixed seating otherwise.) Equal-time alternative that dodges that exposure: the Nohi highway bus Takayama→Nagoya + the same Nozomi — Maps returns this chain, not the Hida, as its three fastest (3h25–3h33 station-to-station), so take whichever the weather favours. |
| Takayama | Osaka | 3h55 | 2 | train | JR Ltd Exp 'Hida' Takayama→Nagoya (~2h25; 10/day, hourly only ~11:30–16:30, 2h gaps outside), ~20-min cross-platform transfer to a Tōkaidō Shinkansen 'Nozomi' Nagoya→Shin-Osaka (~50 min, frequent), then the Midōsuji subway Shin-Osaka→Umeda/Namba (~5–10 min) + the walk to the hotel. Two changes, at Nagoya and Shin-Osaka. ⚠ the Takayama Line is snow-exposed — JR Central posts 大雪 advisories most Januaries, and Dec 25–Jan 5 is all-reserved; keep same-day slack. Equal-time alternative that dodges the exposure: the Nohi highway bus Takayama→Nagoya + the same Nozomi. Sources: japan-guide Takayama access; JR Central Tōkaidō/Takayama Line timetables. |
| Takayama | Yamashiro Onsen (Kaga) | 2h35 | 1 | train | JR Ltd Exp 'Hida' Takayama→Toyama (~1h30), cross to the Hokuriku Shinkansen down to Kaga-Onsen — Maps times the pair at 2h21 station-to-station (11:03→13:24, ¥8,710) — then Beniya Mukayu's free on-demand shuttle (~15 min; call your arrival ahead). One change at Toyama. ⚠ only ~4 Hida round trips/day run through to Toyama — pin the departure before booking. Fallback, and the more forgiving option if the morning doesn't line up: Nohi bus Takayama→Kanazawa (~2h15, direct, reserved) + Hokuriku Shinkansen Kanazawa→Kaga-Onsen (~20 min), which Maps times at 3h07 station-to-station → ~3.4h door-to-door. |
| Takayama | Yamanaka Onsen (Kaga) | 2h50 | 1 | train | JR Ltd Exp 'Hida' Takayama 11:03→Toyama 12:32 (1h29), cross to a through Hokuriku Shinkansen→Kaga-Onsen (43 min, hourly) — Maps times the pair at 2h21 station-to-station — then a ~25-min taxi up to Yamanaka Onsen (the inn can arrange). One change at Toyama. ⚠ hangs on the 11:03 Hida: only ~4 through-trains/day reach Toyama, and every other departure is the Takayama Line local (2h16–2h25 to Toyama alone). Miss it and the fallback is the Nohi bus Takayama→Kanazawa (~2h15) + the southbound leg, ~3.3h — which is what |
| Takayama | Nagoya | 2h45 | 0 | train | JR Ltd Exp 'Hida' Takayama→Nagoya, ~2h25 direct, 10 a day (hourly only ~11:30–16:30, 2h gaps outside), ¥5,610 unreserved / ¥6,140 reserved, + the 7-min walk from the inn/old town. ⚠ Snow-exposed — JR Central posts 大雪 advisories most Januaries, all-reserved Dec 25–Jan 5. Equal-time alternative when the line is under an advisory: the Nohi highway bus Takayama Nōhi BC→Meitetsu BC Nagoya, ~2h45, reserved. |
| Kyoto | Nara | 45 min | 0 | train | Kintetsu Kyoto→Kintetsu-Nara (~45 min), ~5-min taxi. |
| Osaka | Kyoto | 45 min | 0 | train | JR Special Rapid Kyoto→Osaka Stn (~29–30 min, ¥580, frequent, no change) — central station to central station, so ~45 min door-to-door with the hotel ends. Alternatives from the Gion/Kawaramachi side: Hankyu Kyoto-Kawaramachi→Osaka-Umeda ~40 min ¥410, Keihan Sanjō→Yodoyabashi ~50 min ¥490. |
| Hiroshima | Kyoto | 1h55 | 0 | shinkansen | Sanyo+Tokaido Shinkansen Nozomi direct Hiroshima→Kyoto (~1h35). |
| Fukuoka (Hakata) | Kyoto | 3h30 | 0 | shinkansen | Sanyo/Tokaido Shinkansen Nozomi/Mizuho Hakata→Kyoto, no change (~3h). |
| Kagoshima | Kyoto | 5h15 | 1 | shinkansen | Kyushu Shinkansen Mizuho Kagoshima-Chūō→Shin-Osaka (~3h45), change to Tokaido→Kyoto. |
| Hakone | Kyoto | 3h | 1 | train | Direct Tozan BUS Gōra/Sengokuhara→Odawara (~45 min — one seat; Tozan rail adds a Hakone-Yumoto change), then Tōkaidō Shinkansen→Kyoto (~1h50 on the ~2-hourly Odawara-calling 'Hikari'; 'Kodama'+change or ~2h40 all-Kodama otherwise). |
| Kyoto | Nikkō | 4h40 | 2 | shinkansen | Tōkaidō 'Nozomi' Kyoto→Tokyo (~2h15, ~4/hr), cross the Tokyo Stn Shinkansen concourse to a Tōhoku 'Yamabiko'/'Nasuno'→Utsunomiya (~50 min), change to the JR Nikkō Line local→Nikkō (~45 min, ~1–2/hr) + inn shuttle. Two self-handled changes (Tokyo, Utsunomiya). Chosen over the Asakusa Tōbu 'Spacia' (same ~1h50 tail, but a ~20–25-min crosstown from Tokyo Stn on top = +1 change). ⚠ ends on the hourly, snow-slow Nikkō local; ⚠ Tōkaidō services run all-reserved over the New Year peak. |
| Izu peninsula (Shuzenji) | Kyoto | 2h40 | 0 | train | The inn-bookable flat-rate cab Shuzenji valley→Mishima (~40-50 min; Asaba ¥12-15k, book with the room — Asaba runs NO shuttle), then the direct Mishima-calling 'Hikari'→Kyoto (1h50, ~2-hourly, dep Mishima :58 — reserve; hourly 'Kodama'+change fallback). No self-handled change. Rail alt: Sunzu line→Mishima (~35 min), +1 change. |
| Yamashiro Onsen (Kaga) | Kyoto | 2h | 1 | train | Beniya Mukayu shuttle→Kaga-Onsen (~15 min), 'Tsurugi'→Tsuruga (~37 min), cross-platform change (~10 min), 'Thunderbird' Ltd Exp→Kyoto (~55 min) the old ~1h30 used a stale pre-extension Thunderbird time. |
| Yamanaka Onsen (Kaga) | Kyoto | 1h35 | 1 | train | Kaga-Onsen→Tsuruga (~30 min), 'Thunderbird' Ltd Exp→Kyoto (~1h25). |
| Kyoto | Lake Kawaguchi (Mt Fuji) | 4h15 | 1 | shinkansen | Round the south side of Fuji rather than back through Tokyo: Fujikyu 'Mishima·Kawaguchiko Liner' bus Kawaguchiko→Mishima (~1h30–1h40, roughly hourly, ¥2,700 — japan-guide, Oct 2025), one change at Mishima, then the Tōkaidō Shinkansen Mishima→Kyoto (~1h51 on a Hikari that calls at Mishima, ~2h27 on the all-stations Kodama — ekitan). ~4h15 door-to-door with the inn shuttle and the change. (Via Tokyo — 'Fuji Excursion'→Shinjuku, cross to Tokyo Station, 'Nozomi'→Kyoto — is ~4h30 and two changes, and the Fuji Excursion runs only ~4/day.) |
| Kyoto | Miyajima | 2h40 | 2 | train | Shinkansen Kyoto→Hiroshima (~1h40), JR to Miyajimaguchi + ferry (~40 min), then ~3-min walk. |
| Kyoto | Okayama | 1h30 | 0 | shinkansen | Tōkaidō/Sanyō Shinkansen Kyoto→Okayama, ~60 min on a 'Nozomi' (several an hour) or ~90 min on the hourly 'Hikari', no change; 1.5h is door to door with platform access. |
| Kyoto | Nagoya | 55 min | 0 | shinkansen | Tōkaidō 'Nozomi' Kyoto→Nagoya ~35 min (several an hour; 'Hikari'/'Kodama' 40–60 min), ¥5,170 unreserved / ~¥6,000 reserved. The shortest Shinkansen hop on the board. |
| Nara | Osaka | 1h | 0 | train | Kintetsu Nara Line Rapid Express Kintetsu-Nara→Osaka-Namba (~36 min, direct, ~every 15 min). |
| Osaka | Hiroshima | 2h05 | 1 | shinkansen | San'yō 'Nozomi' Shin-Osaka→Hiroshima (~1h25; ~80 min on the fastest), plus the Midōsuji hop between Umeda and Shin-Osaka at the Osaka end. 'Sakura'/'Mizuho' run the same corridor a few minutes slower. |
| Osaka | Fukuoka (Hakata) | 3h05 | 1 | shinkansen | San'yō 'Nozomi'/'Mizuho' Shin-Osaka→Hakata (~2h30, several per hour, one seat), plus the Midōsuji hop between Umeda and Shin-Osaka. Hakata Stn is central Fukuoka, so no last mile at the far end. |
| Osaka | Hakone | 3h25 | 2 | shinkansen | Midōsuji hop Umeda→Shin-Osaka, Tōkaidō 'Hikari' Shin-Osaka→Odawara (~2h05 — the same ~2-hourly Odawara-calling 'Hikari' the hakone>kyoto leg uses at ~1h50 to Kyoto, plus the ~15-min Kyoto–Shin-Osaka segment; 'Nozomi' skips Odawara and all-'Kodama' is ~2h40), then the direct Tozan BUS Odawara→Gōra/Sengokuhara (~45 min, one seat; the Tozan rail adds a Hakone-Yumoto change). |
| Osaka | Nikkō | 5h10 | 3 | shinkansen | Midōsuji hop Umeda→Shin-Osaka, Tōkaidō 'Nozomi' Shin-Osaka→Tokyo (~2h35, ~4/hr), cross to a Tōhoku 'Yamabiko'/'Nasuno'→Utsunomiya (~50 min), then the JR Nikkō Line local→Nikkō (~45 min, ~1–2/hr) + inn shuttle. Three self-handled changes (Shin-Osaka, Tokyo, Utsunomiya) — the extra half-hour over the Kyoto twin is the further Nozomi run plus the Midōsuji hop. ⚠ the hourly Nikkō local is the fragile end; ⚠ all-reserved Tōkaidō over New Year. |
| Osaka | Nagoya | 1h35 | 1 | shinkansen | Tōkaidō 'Nozomi' Shin-Osaka→Nagoya (~50 min; 'Hikari'/'Kodama' 55–70 min), plus the Midōsuji hop between Umeda and Shin-Osaka. The shortest Shinkansen hop on the board out of Osaka. |
| Hiroshima | Fukuoka (Hakata) | 1h05 | 0 | shinkansen | Sanyo Shinkansen Nozomi direct Hiroshima→Hakata, no change (~1h). |
| Miyajima | Hiroshima | 1h | 1 | train | Ferry + JR back to Hiroshima (~50 min). |
| Hiroshima | Okayama | 55 min | 0 | shinkansen | Sanyō Shinkansen Hiroshima→Okayama, 34-35 min on a 'Nozomi' (3+ an hour) or 39 min on a 'Sakura'/'Hikari', no change. |
| Hiroshima | Naoshima (Miyanoura) | 2h45 | 3 | ferry | 'Nozomi' Hiroshima→Okayama (~35 min), Uno Line to Uno (~50 min, usually a change at Chayamachi), then the 20-min Shikoku Kisen ferry to Miyanoura. Work backwards from the 20:25 last sailing — leave Hiroshima by about 17:30. |
| Beppu | Fukuoka (Hakata) | 2h | 0 | train | Ltd Exp 'Sonic' Beppu→Hakata, ~1h51–2h05, NO change — and it leaves about every 30 minutes from early morning to late evening (JR Kyushu; jrpass.com). ~¥6,380 unreserved / ¥6,910 reserved. The single easiest leg in Kyushu: one seat, turn-up-and-go frequency, up the Nippō line along Beppu Bay via Kokura. |
| Kumamoto | Fukuoka (Hakata) | 40 min | 0 | shinkansen | Kyushu Shinkansen Kumamoto→Hakata — 'Mizuho' ~33 min, 'Sakura' ~38; several per hour. |
| Fukuoka (Hakata) | Nagasaki | 2h | 1 | train | Nishi-Kyushu Shinkansen + Ltd Exp Hakata→Nagasaki via Takeo-Onsen (~2h). |
| Fukuoka (Hakata) | Kagoshima | 1h25 | 0 | shinkansen | Kyushu Shinkansen 'Mizuho' Hakata→Kagoshima-Chūō (~1h17; 'Sakura' ~1h35), no change. |
| Fukuoka (Hakata) | Miyajima | 2h15 | 2 | train | Sanyo Shinkansen Nozomi Hakata→Hiroshima (~1h), JR Sanyo Main Line→Miyajimaguchi (~25 min), then the ~10-min ferry to Miyajima + short walk. |
| Yufuin | Fukuoka (Hakata) | 2h10 | 0 | train | Ltd Exp back toward Hakata (~2h10). |
| Amakusa (Matsushima) | Fukuoka (Hakata) | 1h55 | 1 | train | Inn-arranged car Tayuta→JR Kumamoto ~1h (per Tayuta's own access chart) via the Five Bridges + Misumi — coastal, snow-proof — then Kyushu Shinkansen 'Sakura'/'Mizuho' Kumamoto→Hakata (~33 min, every 20-30 min). Rail alt: 20-min taxi/boat→Misumi + JR Misumi line 50 min→Kumamoto (+1 change). |
| Kurokawa Onsen | Fukuoka (Hakata) | 2h30 | 0 | car | Rental car ~117 km / ~2h30: R212 to Hita IC, Ōita Expwy → Tosu JCT → Kyushu Expwy → Dazaifu IC (Kurokawa Onsen Ryokan Association and Ichinoi access pages, 2026-09-13). Studless tyres Dec–Feb. Without a car: the direct highway bus Kurokawa→Hakata (~2.5–3h, reserve). |
| Amagase (Hita) | Fukuoka (Hakata) | 1h45 | 0 | train | Kyudai-line Ltd Exp 'Yufu'/'Yufuin no Mori' Amagase→Hakata, 1h35 ride + the Tensui pickup to Amagase Station. |
| Beppu | Kumamoto | 2h30 | 1 | train | Ltd Exp 'Sonic' Beppu→Kokura (~1h25, ~2/hr), change inside Kokura to the Kyushu Shinkansen 'Mizuho'/'Sakura'→Kumamoto (~50 min). ~2h30 door-to-door, one change at a single station. (The DIRECT cross-island option — the Hōhi-line Ltd Exp over the Aso caldera — is the scenic one but takes ~3h–3h30 and runs only 2/day, departing Kumamoto just after 09:00 and 15:00; treat it as a sightseeing choice, not the transfer.) |
| Beppu | Nagasaki | 4h | 2 | train | The long diagonal: Ltd Exp 'Sonic' Beppu→Hakata (~1h55–2h05), 'Relay Kamome'→Takeo-Onsen, timed cross-platform change to the Nishi-Kyushu Shinkansen 'Kamome'→Nagasaki (~2h Hakata→Nagasaki all told). ~4h, two changes, both high-frequency. By car ~245 km / ~3h15 (Ōita Expwy → Tosu JCT → Nagasaki Expwy) — the Nagasaki Expwy has no winter-regulated section, but the Hita–Hiji stretch at the Beppu end is an official winter-tire zone in January. |
| Beppu | Kagoshima | 3h10 | 1 | train | Ltd Exp 'Sonic' Beppu→Kokura (~1h25, ~2/hr), change at Kokura to a through 'Mizuho' down the Kyushu Shinkansen→Kagoshima-Chūō (~1h35; Kokura is a Mizuho stop, so this is one change for the whole island). ~3h10–3h20. (Doubling back via Hakata — Sonic ~1h51 + 'Mizuho' ~1h17 — comes out the same or slightly worse; Kokura is the cleaner pivot. The Nippō line straight down the east coast is a half-day — don't.) |
| Beppu | Yufuin | 1h | 0 | bus | Kamenoi bus Beppu Station→Yufuin Station, ~50 min, 1–2 per hour, ¥1,100 (japan-guide) — the turn-up-and-go option, and the reason Beppu and Yufuin pair so easily. ~1h05 by the Kurokawa association's reckoning; allow the inn shuttle at the Yufuin end. Scenic alt: the Ltd Exp 'Yufu'/'Yufuin-no-Mori' runs Beppu–Ōita–Yufuin direct in ~55 min, but only ~2–3/day and every seat is reserved (no unreserved cars at all) — book it as an experience, not a connection. Plain JR is ~80 min with a change at Ōita. By car ~1h over the top of the Yamanami. |
| Beppu | Kurokawa Onsen | 2h25 | 0 | bus | Kyushu Ōdan Bus direct, one seat over the Yamanami: Beppu Station 08:09 → Kurokawa Onsen 10:35 (~2h26; it's the same Beppu–Yufuin–Kurokawa–Aso–Kumamoto cross-island line). ⚠ Only 2 buses/day each way and the Beppu departure is the morning one — reserve (tickets are not sold at the stop machines), and the last Kurokawa→Yufuin/Beppu return is 16:55, so a transfer day must move early. By car it's the better call here: ~66 km / ~1h10 via Beppu IC → Hiji JCT → Kuju IC and the Yamanami Highway, but budget ~1h45 in January — the road crosses the Kuju highlands above 1,000 m and shaded stretches hold ice for days (low-road fallback via Kokonoe IC + R387). |
| Kumamoto | Nagasaki | 2h | 2 | train | Shinkansen→Shin-Tosu (~25 min), 'Relay Kamome'→Takeo-Onsen (timed cross-platform change), 'Kamome'→Nagasaki — ~2h all told. (The Ocean Arrow ferry + Shimabara Railway route is scenic and ~3.5h.) |
| Kumamoto | Kagoshima | 50 min | 0 | shinkansen | 'Mizuho'/'Sakura' Kumamoto→Kagoshima-Chūō (~44–57 min, ~hourly+). |
| Amakusa (Matsushima) | Kumamoto | 1h10 | 0 | car/train | By car ~1h10 via the Five Bridges, Misumi and R57 — coastal and effectively snow-proof. Carless parity (~1¼h): 15-min Takarajima-Line boat Matsushima Port⇄Misumi port (+2-min walk to the station) or 20-min taxi, then Misumi Line⇄Kumamoto ~50–60 min — both Tayuta and Amanojyaku sync pickups. ('Amakusa-gō' rapid bus Matsushima→Sakuramachi BT ~1h20, ~9/day, no reservation.) |
| Kurokawa Onsen | Kumamoto | 1h50 | 0 | car | Rental car ~77 km / ~1h50 via Senomoto + R57 (or the Milk Road rim), budget 2h15–2h30 in January — the Aso rim roads can gate-close in ice (owner: the volcanic middle assumes a car, 2026-09-13). Without a car: Kyushu Ōdan bus one-seat Kurokawa→Kumamoto Stn (~2h38; 3/day down, only 2/day back up — reserve). Also stops at Kumamoto Airport (~1h50) en route. By car ~77 km / ~1h50 via Senomoto + R57 (or the Milk Road rim), budget 2h15–2h30 in January — the Aso rim roads can gate-close in ice. |
| Takachiho | Kumamoto | 2h | 0 | car | By car ~85 km via R218 + the free E77 Kyushu-Chūō sections (open since Feb 2024): ~1h45 normal, budget 2h in January. R218 stays off the Aso rim (occasional chain regulation on the Kyushu-sanchi crossing; avoid the higher R325/Takamori route in ice). (Transit: 'Takachiho-gō' express bus→Sakuramachi BT ~2h45, only 2/day — reserve.) |
| Kagoshima | Nagasaki | 3h | 2 | shinkansen | Kyushu Shinkansen 'Mizuho'/'Sakura' Kagoshima-Chūō→Shin-Tosu (~1h10–1h25), change to the 'Relay Kamome' Ltd Exp→Takeo-Onsen (~50 min), then cross-platform to the Nishi-Kyushu Shinkansen 'Kamome'→Nagasaki (~30 min). ~3h, 2 changes. |
| Amakusa (Matsushima) | Nagasaki | 3h25 | 3 | train | Carless via the Misumi corridor: inn-synced 15–20-min boat/taxi to Misumi, Misumi Line→Kumamoto (~50–60 min), then Shinkansen→Shin-Tosu + Relay Kamome→Kamome to Nagasaki (~2h) — all-rail, snow-proof. Drivers' variant (the ferry drive): ~45 min to Oniike Port, Shimatetsu car ferry→Kuchinotsu (30 min, ~every 45), then ~1h45 down the Shimabara peninsula with Sakitsu Church and the Unzen jigoku en route (~3.5h; winter gales occasionally cancel the strait ferry). |
| Kurokawa Onsen | Nagasaki | 4h35 | 2 | bus | Direct highway bus Kurokawa→Hakata (~3h, only 2–3/day — reserve), then 'Relay Kamome'→Takeo-Onsen + 'Kamome'→Nagasaki (~1.4h). January snow can detour the Kurokawa road. |
| Kagoshima | Amakusa (Matsushima) | 2h20 | 1 | train | Kyushu Shinkansen 'Sakura' Kagoshima-Chūō→Kumamoto (~48 min), change to the JR Misumi line (~50 min — ⚠ 14-18/day, plan the connection), then the 20-min taxi/boat Misumi→Tayuta (the inn's own access chart; inn-synced Takarajima boat where sailing — Iruka 1/2 suspended Dec–Mar, 3-5 sailings remain). Carless, coastal, snow-proof. |
| Izu peninsula (Shuzenji) | Hakone | 1h50 | 2 | train | Sunzu to Mishima (self-change to Tōkaidō), short trunk hop to Odawara, second self-change onto the Tozan railway to Kōwakudani. Low-elevation, snow-mild. |
| Lake Kawaguchi (Mt Fuji) | Hakone | 3h45 | 3 | train | Fuji Excursion Kawaguchiko→Shinjuku (~4/day), cross to Tokyo, Tōkaidō to Odawara, Hakone Tozan up to Yumoto (self-change at Odawara) + inn shuttle. The seasonal Gotemba bus would cut a change but is January-unreliable. |
| Echigo-Yuzawa (snow country) | Nikkō | 3h10 | 2 | shinkansen | Inn car to Echigo-Yuzawa, Jōetsu Shinkansen through to Ōmiya, change to the Tōhoku Shinkansen for Utsunomiya, then JR Nikkō Line local to Nikkō. Two changes (Ōmiya, Utsunomiya); ⚠ the Nikkō-Line finish is the fragile bit in January. |
| Minakami / Tanigawa (snow country) | Nikkō | 2h50 | 2 | shinkansen | Taxi to Jōmō-Kōgen, Jōetsu Shinkansen through to Ōmiya, change to the Tōhoku Shinkansen for Utsunomiya, then the JR Nikkō Line local up to Nikkō + inn shuttle. ⚠ ends on the hourly Nikkō-Line local — snow-slow. |
| Nikkō | Kakunodate | 4h35 | 2 | shinkansen | JR Nikkō Line local to Utsunomiya, a 'Yamabiko' up to Morioka, then change to the 'Komachi' onto the Akita branch for Kakunodate + taxi. The fast Hayabusa/Komachi skip Utsunomiya, so you ride the slower Yamabiko north; ⚠ long and on the fragile single-track Komachi branch in snow. (If no through Morioka Yamabiko lines up, add a Sendai change.) |
| Lake Kawaguchi (Mt Fuji) | Izu peninsula (Shuzenji) | 3h45 | 3 | train | Fuji Excursion to Shinjuku (~4/day), cross to Tokyo, Tōkaidō to Mishima, then Izuhakone Sunzu to Shuzenji (self-change at Mishima) + taxi. ⚠ three changes plus the sparse Fuji Excursion. |
| Echigo-Yuzawa (snow country) | Minakami / Tanigawa (snow country) | 1h25 | 0 | car | RAIL-primary: inn car→Echigo-Yuzawa (~30 min), one-stop Jōetsu Shinkansen→Jōmō-Kōgen (~13 min, ~hourly 'Toki'), ~20-min taxi to Senjuan. No self-handled change. Car alt: ~55 km/~55 min via the Kan-Etsu Expressway — faster on a clear day, but ⚠ chains banned in-tunnel, checkpoints, and NEXCO preventive closures in heavy snow (Dec-2020 precedent). (Minakami-local version: Senjuan shuttle→Minakami + Jōetsu-line local ~40 min, ~6-8/day — similar total.) |
| Echigo-Yuzawa (snow country) | Kakunodate | 4h20 | 1 | shinkansen | Jōetsu Echigo-Yuzawa→Ōmiya, change to the through Akita 'Komachi' to Kakunodate + taxi. Single change at Ōmiya; ⚠ January snow can slow the Komachi north of Morioka. |
| Yamanaka Onsen (Kaga) | Yamashiro Onsen (Kaga) | 30 min | 0 | car | Trivial shared-station pairing — both inns hang off Kaga-Onsen Stn, so it's a single direct taxi between the two onsen towns (~20–30 min), no rail at all. |
| Minakami / Tanigawa (snow country) | Kakunodate | 4h05 | 1 | shinkansen | Jōetsu Shinkansen→Ōmiya (backtrack), change to Akita 'Komachi'→Kakunodate (Ōmiya→Kakunodate ~2h35) + ~12-min taxi. ⚠ Komachi on snow-prone conventional track past Morioka. |
| Yufuin | Amakusa (Matsushima) | 3h05 | 0 | car | ~222 km, ~3h05: Oita Expwy → Tosu JCT → Kyushu Expwy → Matsubase IC (2h04, ¥4,640), then R266 via Misumi and the Five Bridges to Matsushima (~1h). Budget 3¾–4h — the Hita–Hiji zone at the start only; coastal and snow-free past Tosu. (Carless: Yufuin no Mori→Hakata + Shinkansen→Kumamoto + Misumi Line + boat/taxi ≈ 4.2h, 3 changes — the car saves over an hour here.) |
| Kurokawa Onsen | Yufuin | 1h45 | 0 | bus | Kyushu Ōdan Bus direct (the Beppu–Yufuin–Kurokawa–Aso–Kumamoto cross-island line), ~1h45, ~¥2,370. ⚠ Only 2 buses/day each way — reserve; the last Kurokawa→Yufuin/Beppu departure is 16:55, so the transfer day must move by early afternoon. By car: 48 km straight over the Yamanami, ~1h05 (budget 1h30) — it crosses Makinoto Pass (1,330 m) itself and shaded stretches hold ice for days; iced over, the low road via Kokonoe IC + R387 (~600 m max) runs ~1h20. |
| Yufuin | Takachiho | 2h30 | 0 | car | By car (~105 km): Yamanami Highway over the Makinoto Pass (1,330 m) past Kurokawa and the Aso rim, then R325/R218 — budget 3h in January. ⚠ The pass gets real snow/ice closures: studless tires, check regulations morning-of; low-road fallback via Taketa/R57 (+~30 min). (Transit is a full day, ~6.5h via Kumamoto — this leg is why the car exists.) |
| Amagase (Hita) | Yufuin | 1h | 0 | train | Ltd Exp 'Yufu' / 'Yufuin no Mori' straight down the JR Kyudai Main Line, Yufuin→Amagase ~42–50 min ride + the Tensui pickup and Enowa-shuttle/taxi ends, no transfer — Amagase (天ヶ瀬) is a scheduled express stop and Sanso Tensui sits a few minutes from that station (the leg does NOT run to Hita Station proper). ~6 limited expresses/day toward Hakata (Yufu 09:08/14:15/19:27 · Yufuin-no-Mori 12:01/15:56/17:17 from Yufuin, 2026 timetable) — all reserved-seat; the scenic Yufuin-no-Mori sells out, so book ahead. Enowa's shuttle reaches Yufuin Station. Runs year-round, sidestepping the Mizuwake Pass winter-tire regulation that dogs the parallel car route. |
| Kurokawa Onsen | Amakusa (Matsushima) | 2h55 | 0 | car | ~115–120 km, ~2h55: off the rim to Kumamoto IC (~1h30), a Kyushu Expwy hop to Matsubase IC (15 min, ¥810 — skips city traffic), then R266 via Misumi and the Five Bridges to Matsushima (~1h10). Budget 3¼–3½h — the Aso-rim descent is the only winter segment; coastal after. (The Takefue→Tayuta hop.) |
| Takachiho | Amakusa (Matsushima) | 3h10 | 0 | car | By car (~140 km): R218 west off the highlands (~2h), then R266/R57 via Uto–Misumi and the Five Bridges to Matsushima (~1h10), skirting central Kumamoto. Transit alt: 'Takachiho-gō' + 'Amakusa-gō' buses via Sakuramachi (~4.5–5h, timed around the 2/day constraint). Front-load the mountain half before dusk in January. |
| Amagase (Hita) | Amakusa (Matsushima) | 2h30 | 0 | car | ~180 km, ~2h30: Hita IC → Tosu JCT → Kyushu Expwy → Matsubase IC (1h27, ¥3,690), then R266 via Misumi and the Five Bridges (~1h). Budget ~2h45 — the least winter-exposed leg in the Hita set; sea-level last mile. |
| Kurokawa Onsen | Takachiho | 1h10 | 0 | car | ~64 km / ~1h9 by car over the Aso highlands — no practical bus link; January snow or ice can slow the mountain road. (Drive-time only — verify before booking.) |
| Amagase (Hita) | Kurokawa Onsen | 1h15 | 0 | car | ~55 km, ~1h–1h25, toll-free: R210 to Hita, then R212 up the valley → Oguni → R442 east — one of Kurokawa's three official approach roads, low until the final climb and it skips Mizuwake entirely. Budget 1h30–1h45 (the R442/Kurokawa approach is the only winter bit — Shinmeikan's live cams ⑤/⑥ are the morning check). ⚠ The shorter Farm Road WAITA plateau shortcut is untreated 600–900 m municipal road with closure history — not the January move. |
| Okayama | Naoshima (Miyanoura) | 2h | 2 | ferry | Uno Line to Uno (~50 min, ¥590), a flat 5-min walk to Uno Port, then the Shikoku Kisen car ferry to Miyanoura: 20-min crossing, 13 sailings a day each way, ¥300, no reservations. ⚠ The LAST Uno→Miyanoura sailing is 20:25 (arr 20:45) — the binding constraint on a late start — and winter wind can suspend crossings. |
| Amagase (Hita) | Takachiho | 3h | 0 | car | ~200 km, ~2h50–3h05: Hita IC → Tosu JCT → Kyushu Expwy → Kashima JCT → free E77 → Yamato-Tsujunkyō IC → R218 east (~¥3,750). Budget ~3h15 — only the well-treated R218 corridor is exposed. ⚠ The direct Aso crossing (R212 over Mizuwake → caldera → R325 Takamori) saves ~45 min but stacks three winter zones — dry, above-freezing days only. |
| Sapporo | Niseko (Hirafu) | 3h | 0 | bus | Hokkaidō Chūō Bus 'Kōsoku Niseko-gō' Sapporo (Kita 3-jō, 5 min from the station)→Niseko Hirafu, ~3h, reserved, only ~2 morning departures (07:50, 09:20) in winter, ~¥6,000 in the 2025–26 season. Rail alt, 2 changes: 'Rapid Airport' Sapporo→Otaru (32 min), Hakodate-Line local Otaru→Kutchan (~1h–1h20, sparse), then a 15-min taxi (~¥2,500) to Hirafu — ~2h45 if the Otaru connection lines up. Zaborin/Shiguchi both quote ~2.5h by car from Sapporo; a private transfer is the comfortable answer here. |
| Sapporo | Furano | 2h45 | 0 | bus | Hokkaidō Chūō Bus 'Kōsoku Furano-gō' Sapporo Stn bus terminal→Furano Stn, ~2h30, roughly every 1–2 hours, ~¥2,300–2,700, reserved. Rail alt, 1 change: Ltd Exp 'Lilac'/'Kamui' Sapporo→Takikawa (~50 min) then the Nemuro-Line local Takikawa→Furano (~66 min, sparse) — 2.5–3.5h depending on the Takikawa wait; the summer-only 'Furano Lavender Express' is the direct train and does not run in January. |
| Sapporo | Noboribetsu Onsen | 1h45 | 1 | train | Ltd Exp 'Hokuto'/'Suzuran' Sapporo→Noboribetsu Stn, 1h05–1h14, all seats reserved, roughly hourly between the two services (¥3,250–4,890), then the Dōnan Bus up to Noboribetsu Onsen, 15 min, ¥450, 1–2 an hour (taxi ~¥3,000). One change at the station. Alt with no change: the reserved 'Kōsoku Onsen-gō' highway bus Sapporo→Noboribetsu Onsen, ~1h50–2h20, ~¥2,800–3,800. |
| Sapporo | Otaru | 35 min | 0 | train | JR Hakodate Line Sapporo→Otaru: 'Rapid Airport' 32–35 min, locals ~45 min, several an hour, ¥800. Kuramure (Asarigawa Onsen) and Ginrinsō are then a ~15-min car from Otaru or Otaru-Chikkō — reserve the hotel shuttle or take a taxi. |
| Sapporo | Lake Akan (Akanko Onsen) | 6h45 | 1 | train | Ltd Exp 'Ōzora' Sapporo→Kushiro, 4h08, 6 a day, ¥10,320 reserved, then the Akan Bus route bus Kushiro Stn→Akanko Onsen, ~110 min, ¥2,570, only 3 round trips a day — the connection wait, not the ride, makes it a full travel day. ⚠ The sensible way to Lake Akan is to fly: HND→Kushiro (KUH) 1h35–1h45, then the 'Akan Airport Liner' Kushiro Airport→Akanko Onsen, ~65 min, ¥2,190, 3 a day (reserve). |

**Domestic flights.** Door to door again — city centre, both airports, the ride in at the far end — so these hours already carry the ground legs and the airport time, and a flight row is not comparable to a train row of the same length. Book the flight separately from any rail ticket, and leave the morning after it free. **Where a town has a row of its own, use that row** rather than adding an airport transfer to a city's flight row: it already carries both ground ends, and the two together count the same journey twice, and a town's own row wins over one you compose. These rows name the airports rather than the route; the sourced route for each is in `data/transit-legs.md`. Okinawa is absent from the dataset, so a trip there means looking every leg up; Hokkaido's Sapporo hub and its towns are here.

| From | To | Door to door | Changes | Airports |
|---|---|---|---|---|
| Fukuoka (Hakata) | Mikuni / Awara | 3h45 | 2 | FUK → KMQ |
| Fukuoka (Hakata) | Minakami / Tanigawa (snow country) | 5h30 | 3 | FUK → HND |
| Fukuoka (Hakata) | Tokyo | 3h30 | 2 | FUK → HND |
| Fukuoka (Hakata) | Toyama | 3h45 | 2 | FUK → TOY |
| Fukuoka (Hakata) | Yakushima | 2h45 | 1 | FUK → KUM |
| Fukuoka (Hakata) | Yamanaka Onsen (Kaga) | 3h45 | 2 | FUK → KMQ |
| Fukuoka (Hakata) | Yamashiro Onsen (Kaga) | 3h30 | 2 | FUK → KMQ |
| Kagoshima | Mikuni / Awara | 5h15 | 3 | KOJ → KMQ |
| Kagoshima | Toyama | 5h15 | 3 | KOJ → TOY |
| Kagoshima | Yakushima | 2h30 | 1 | KOJ → KUM |
| Kagoshima | Yamanaka Onsen (Kaga) | 5h15 | 3 | KOJ → KMQ |
| Kagoshima | Yamashiro Onsen (Kaga) | 5h | 3 | KOJ → KMQ |
| Kanazawa | Amagase (Hita) | 5h15 | 3 | KMQ → FUK |
| Kanazawa | Fukuoka (Hakata) | 3h45 | 2 | KMQ → FUK |
| Kanazawa | Kagoshima | 5h15 | 3 | KMQ → KOJ |
| Kanazawa | Karatsu | 5h | 3 | KMQ → FUK |
| Kanazawa | Kirishima (Myōken Onsen) | 6h30 | 4 | KMQ → KOJ |
| Kanazawa | Kumamoto | 4h30 | 3 | KMQ → KMJ |
| Kanazawa | Kurokawa Onsen | 6h30 | 3 | KMQ → KMJ |
| Kanazawa | Nagasaki | 5h45 | 4 | KMQ → NGS |
| Kanazawa | Takeo Onsen | 4h45 | 3 | KMQ → FUK |
| Kanazawa | Unzen | 6h45 | 5 | KMQ → NGS |
| Kanazawa | Yufuin | 6h | 3 | KMQ → OIT |
| Kumamoto | Mikuni / Awara | 4h30 | 3 | KMJ → KMQ |
| Kumamoto | Toyama | 4h30 | 3 | KMJ → TOY |
| Kumamoto | Yakushima | 3h20 | 2 | KMJ → KUM |
| Kumamoto | Yamanaka Onsen (Kaga) | 4h30 | 3 | KMJ → KMQ |
| Kumamoto | Yamashiro Onsen (Kaga) | 4h15 | 3 | KMJ → KMQ |
| Nagasaki | Iki island | 2h40 | 1 | NGS → IKI |
| Nagasaki | Mikuni / Awara | 5h45 | 4 | NGS → KMQ |
| Nagasaki | Toyama | 5h45 | 4 | NGS → TOY |
| Nagasaki | Yakushima | 4h | 3 | NGS → KOJ → KUM |
| Nagasaki | Yamanaka Onsen (Kaga) | 5h45 | 4 | NGS → KMQ |
| Nagasaki | Yamashiro Onsen (Kaga) | 5h30 | 4 | NGS → KMQ |
| Tokyo | Amagase (Hita) | 5h | 3 | HND → FUK |
| Tokyo | Amakusa (Matsushima) | 5h | 1 | HND → KMJ |
| Tokyo | Kagoshima | 4h30 | 2 | HND → KOJ |
| Tokyo | Kirishima (Myōken Onsen) | 4h | 2 | HND → KOJ |
| Tokyo | Kumamoto | 4h30 | 2 | HND → KMJ |
| Tokyo | Kurokawa Onsen | 5h15 | 2 | HND → KMJ |
| Tokyo | Nagasaki | 4h15 | 2 | HND → NGS |
| Tokyo | Sapporo | 4h | 2 | HND → CTS |
| Tokyo | Takeo Onsen | 3h30 | 2 | HND → FUK · alternative HND → NGS (three researched halves), 3h35 · 2 |
| Tokyo | Unzen | 5h | 3 | HND → NGS |
| Tokyo | Yufuin | 4h | 1 | HND → OIT |

**Airport transfers.** City centre to the terminal door and no check-in queue at either end, so add the airline's own cut-off on top. **Every row runs both ways: the journey IN from the terminal on arrival is the same one shown here, so read a row as the transfer, not as a direction.** Tokyo's two airports are a long way apart — check which one the flight uses. **The two Tokyo rows are timed from Tokyo Station; add 20–30 min from a hotel door.**

| From | To | Door to door | Changes | Mode | Route |
|---|---|---|---|---|---|
| Tokyo | Tokyo · Haneda airport (HND) | 35 min | 1 | train | From Tokyo Stn/trunk: JR→Hamamatsuchō + Monorail, or Shinagawa + Keikyū (~25–30 min ride). Taxi ~40–60 min/0 changes and the hotel-doorstep Airport Limousine (~70 min) are the luggage-friendly versions. |
| Tokyo | Tokyo · Narita airport (NRT) | 1h05 | 0 | train | JR Narita Express (N'EX) Tokyo Station→Narita Airport Terminal 2·3 ~53 min, Terminal 1 ~56–60 min — direct, 1–2 an hour (JR East timetable; japan-guide Narita access). The door-to-terminal Airport Limousine bus from the big hotels runs ~85–120 min depending on traffic, and the Keisei Skyliner from Ueno/Nippori is ~41–46 min if you are staying on that side. |
| Hakone | Tokyo · Haneda airport (HND) | 2h10 | 2 | train | Direct Tozan BUS Gōra/Sengokuhara→Odawara (~45 min — one seat; the Tozan rail needs an extra change at Hakone-Yumoto), Tōkaidō Shinkansen Odawara→Shinagawa (~30 min), Keikyū→Haneda (~18 min); or the direct Odawara→HND limousine bus (~85 min). |
| Izu peninsula (Shuzenji) | Tokyo · Haneda airport (HND) | 2h | 2 | train | Taxi/shuttle→Shuzenji, Izuhakone Sunzu line→Mishima (~35 min), Tōkaidō Shinkansen Mishima→Shinagawa (~40 min), Keikyū→Haneda (~18 min). |
| Lake Kawaguchi (Mt Fuji) | Tokyo · Haneda airport (HND) | 3h | 1 | train | JR 'Fuji Excursion' Kawaguchiko→Shinjuku (~2h, direct), then the airport limousine bus Shinjuku→Haneda (~45 min). ⚠ limited morning Fuji departures. |
| Kyoto | Osaka · Kansai airport (KIX) | 1h30 | 0 | train | JR Ltd Exp 'Haruka' Kyoto→Kansai Airport (~75 min, direct). |
| Kyoto | Osaka · Itami airport (ITM) | 1h | 0 | bus | Airport limousine bus Kyoto Station→Osaka-Itami (~55 min). |
| Nara | Osaka · Kansai airport (KIX) | 1h55 | 1 | train | JR Yamatoji rapid Nara→Tennoji (~40 min), change to Haruka→KIX (~30 min). |
| Osaka | Osaka · Kansai airport (KIX) | 1h05 | 0 | train | JR Ltd Exp 'Haruka' Osaka Stn→Kansai Airport ~45 min (¥2,380 unreserved; Shin-Osaka ~50 min, ¥2,540), or the Nankai 'Rapi:t' Osaka-Namba→KIX 35–40 min (¥1,520–1,670, reserved; the fastest services 34 min). Cheaper: Nankai airport express 45–50 min ¥970, JR Airport Rapid from Osaka Stn ~70 min ¥1,180, airport bus from Umeda ~60 min ¥1,800 / Namba ~45 min ¥1,400. ~1h door-to-door with bags and the terminal walk — airport processing on top. |
| Osaka | Osaka · Itami airport (ITM) | 45 min | 0 | bus | Airport limousine bus Osaka Stn/Umeda→Itami (~30 min, ¥730, multiple per hour); Shin-Osaka ~25 min ¥600, Namba/OCAT ~30 min ¥730. Rail alt: Hankyu Takarazuka Line Osaka-Umeda→Hotarugaike (15–20 min, ¥240) + Osaka Monorail one stop to Osaka Airport (2 min, ¥200) ≈ 25 min, ¥440. Itami is the close-in domestic airport — the reason a Kansai finale flies ITM→HND. |
| Hiroshima | Hiroshima airport (HIJ) | 1h05 | 0 | bus | Airport limousine bus Hiroshima Station→Hiroshima Airport (~50 min; no rail link). |
| Fukuoka (Hakata) | Fukuoka airport (FUK) | 20 min | 0 | subway | Fukuoka City Subway Hakata→Fukuoka Airport (2 stops, ~5 min). |
| Beppu | Ōita airport (OIT) | 55 min | 0 | bus | Ōita Kōtsū 'Air Liner' airport bus Beppu Kitahama / Beppu Station→Ōita Airport (OIT), ~47–50 min, hourly, every day. ⚠ Take the 'Air Liner' — the separate 'Airport Express' for Ōita city does NOT stop in Beppu. OIT is Beppu's own gateway (OIT→Haneda ~1h40, frequent ANA/JAL/SNA — see oit>hnd), so a Beppu finale exits without crossing back to Fukuoka. |
| Kumamoto | Kumamoto airport (KMJ) | 55 min | 0 | bus | Airport limousine bus Kumamoto Stn/Sakuramachi→Kumamoto Airport (KMJ) at Mashiki (~55 min). |
| Nagasaki | Nagasaki airport (NGS) | 1h | 0 | bus | Airport limousine bus Nagasaki Station→Nagasaki Airport (~45 min). |
| Kagoshima | Kagoshima airport (KOJ) | 1h05 | 0 | bus | Airport limousine bus Kagoshima-Chūō→Kagoshima Airport (~40–60 min). |
| Yufuin | Ōita airport (OIT) | 1h | 0 | bus | Airport bus Yufuin Station→Oita Airport (~55 min; the inn shuttle reaches the station). |
| Kirishima (Myōken Onsen) | Kagoshima airport (KOJ) | 45 min | 0 | bus | Kagoshima Airport is Myōken's own gateway, ~30 km up the Amori river: the ¥450 Myōken route bus KOJ→Myōken Onsen runs ~25 min (Kirishima City's Myōken bus page; Kagoshima Kōtsū airport-bus timetable, Sep 2026), a pre-called taxi ~15 min. ~45 min door to door with bags. ⚠ Only ~8 airport departures a day on that bus, the inn's own shuttle-taxi was discontinued pre-Mar-2026, and called taxis want ~40 min notice. |
| Kanazawa | Komatsu airport (KMQ) | 50 min | 0 | bus | Hokutetsu airport limousine Kanazawa Station→Komatsu Airport (KMQ), ~40–50 min, timed to the departures — the same bus leg the Kanazawa→Kyushu flight legs are built on. KMQ is Kanazawa's own airport; ANA/Oriental Air Bridge fly it to Fukuoka ~4×daily (~1h40). |
| Takeo Onsen | Nagasaki airport (NGS) | 45 min | 1 | train | Nishi-Kyushu Shinkansen Takeo-Onsen→Shin-Ōmura (~12 min), then the airport shuttle to Nagasaki Airport (~15 min) — NGS sits between Takeo and Nagasaki, ~40 min door to door. |
| Sapporo | Sapporo · New Chitose airport (CTS) | 45 min | 0 | train | JR 'Rapid Airport' New Chitose Airport→Sapporo, 37–40 min, 3 an hour through the day (fewer early/late), from the station under the domestic terminal; ~¥1,150. The one Hokkaido leg nobody has to think about. |
| Niseko (Hirafu) | Sapporo · New Chitose airport (CTS) | 2h45 | 0 | bus | Chūō Bus/Niseko Bus New Chitose Airport→Niseko Hirafu, ~2h33, reserved, 4 a day in winter (10:00, 13:40, 14:40, 15:30), ~¥6,000; the reserved winter shuttles (Hokkaidō Resort Liner, White Liner, Sky Express) run the same ~2.5h with hotel drop-offs. Rail alt, 2 changes: 'Rapid Airport' through to Otaru (~72 min) + Hakodate-Line local to Kutchan (~1h–1h20) + 15-min taxi, ~3h+. The inns quote ~2h by car/private transfer straight from the airport — no Sapporo detour. |
| Furano | Sapporo · New Chitose airport (CTS) | 2h15 | 0 | bus | Furano Bus airport liner New Chitose Airport (stop 23)→Furano, ~2h, 4 a day year-round (10:30, 11:45, 14:30, 17:30); in winter (Dec 1–Mar 30) the reserved Hokkaidō Resort Liner runs the same corridor in 2h15–2h30 with ski-hotel drop-offs (book ≥9 days ahead). Nothing on rail beats these — the train goes back through Sapporo and Takikawa. |
| Noboribetsu Onsen | Sapporo · New Chitose airport (CTS) | 1h20 | 0 | bus | Dōnan Bus 'Noboribetsu Onsen Airport Express' New Chitose Airport→Noboribetsu Onsen direct, ~1h10, reserved, ~4 a day, ~¥2,200. Rail alt (2 changes): local one stop to Minami-Chitose, 'Hokuto' to Noboribetsu Stn, then the 15-min onsen bus. |
| Nagoya | Nagoya · Centrair airport (NGO) | 40 min | 0 | train | Meitetsu 'μSKY' Meitetsu-Nagoya→Central Japan Airport (Centrair, NGO), 28 min, all-reserved, ¥1,430 (¥980 fare + ¥450 μ-ticket), ~2 an hour; the ordinary Meitetsu Ltd Exp ~38 min for the plain ¥980. Meitetsu-Nagoya is under the JR station's west side — allow 10 min to cross. |
| Nikkō | Tokyo · Haneda airport (HND) | 2h50 | 1 | train | Taxi to Tōbu-Nikkō (~5 min), Tōbu Ltd Exp 'Spacia X'/'Kegon' Tōbu-Nikkō→Asakusa (~1h50, 6–7 a day, all reserved), walk to the Toei Asakusa-line platforms (~5 min), then the through train Asakusa→Haneda Airport Terminal 1·2 (37 min, no change on the Keikyū through services — check the destination board, otherwise change at Sengakuji). One change, at Asakusa; no Tokyo Station detour. |

Any pair not in these tables was not in the source data. Look it up on a timetable (Jorudan, Navitime or Google Maps), say out loud that you looked it up, label it estimated, and never estimate it from the distance. The full set of 790 sourced legs — including every inn — is in `data/transit-legs.md`.
<!-- /generated:corridors -->

### The connector inns

The inns on the road between two cities, with what a night at each costs over going straight through — read only when a plan wants an inn night on a leg that has none.

<!-- generated:connectors -->
*130 places to break a journey, worked out of the same researched legs as the corridor table. Read a row as: the direct journey between those two places takes `direct`, and a night at that inn on the way makes it the two legs shown, costing `detour` more than going straight through. **Prefer one of these to an inn you have to go out and come back from**: the night costs almost nothing in travel. **`Leg in` and `Leg out` are researched legs like any other here** — put either straight into an **Onward** cell, in either direction. A pair with no row has no researched place to break at, and a journey made by air has none at all, because a flight cannot be broken at an inn. One inn per valley, the best-scored of the kit's shortlist; the master inn table in Stage 4 holds the others there, and its `Reach` column answers the pairs this table does not.*

| From → To | Direct | Connector inn | Leg in | Leg out | Detour |
|---|---|---|---|---|---|
| Nagasaki → Kurokawa Onsen | 4h35/2 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 40 min/0 shinkansen | 2h15/0 car | −1h40 |
| Fukuoka → Nagasaki | 2h/1 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 1h/0 train | 40 min/0 shinkansen | −20 min |
| Beppu → Nagasaki | 4h/2 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 1h/0 bus | 3h/0 car | none |
| Kanazawa → Kyoto | 2h30/1 | [Hanamurasaki](https://ryokancatalog.com/inn/hanamurasaki) · Yamanaka Onsen | 55 min/0 train | 1h35/1 train | none |
| Osaka → Nagoya | 1h35/1 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 45 min/0 train | 55 min/0 shinkansen | +5 min |
| Kanazawa → Kyoto | 2h30/1 | [Beniya Mukayu](https://ryokancatalog.com/inn/beniya-mukayu) · Yamashiro Onsen | 35 min/0 train | 2h/1 train | +5 min |
| Kyoto → Yamashiro Onsen | 2h/1 | [Hanamurasaki](https://ryokancatalog.com/inn/hanamurasaki) · Yamanaka Onsen | 1h35/1 train | 30 min/0 car | +5 min |
| Nagasaki → Kurokawa Onsen | 4h35/2 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 3h/0 car | 1h45/0 bus | +10 min |
| Tokyo → Osaka | 3h15/1 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 2h45/0 shinkansen | 45 min/0 train | +15 min |
| Nagasaki → Kagoshima | 3h/2 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 40 min/0 shinkansen | 2h35/1 train | +20 min |
| Nagasaki → Amakusa | 3h25/3 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 40 min/0 shinkansen | 3h/2 train | +20 min |
| Beppu → Kurokawa Onsen | 2h25/0 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 1h/0 bus | 1h45/0 bus | +20 min |
| Nagasaki → Amakusa | 3h25/3 | [Mt.Resort Unzen Kyushu Hotel](https://ryokancatalog.com/inn/mt-resort-unzen-kyushu-hotel) · Unzen | 1h15/0 car | 2h30/0 car | +20 min |
| Nara → Kansai airport | 1h55/1 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 45 min/0 train | 1h30/0 train | +20 min |
| Osaka → Hakone | 3h25/2 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 45 min/0 train | 3h/1 train | +20 min |
| Sendai → Kanazawa | 4h30/1 | [Atamiso](https://ryokancatalog.com/inn/atamiso) · Bandai-Atami | 1h/1 shinkansen | 3h55/2 shinkansen | +25 min |
| Sendai → Kanazawa | 4h30/1 | [Tsuchiyu Bettei Satonoyu](https://ryokancatalog.com/inn/tsuchiyu-bettei-satonoyu) · Tsuchiyu Onsen | 1h/0 train | 3h55/1 shinkansen | +25 min |
| Kyoto → Yamashiro Onsen | 2h/1 | [Kanshuku-en Eshikoto](https://ryokancatalog.com/inn/kanshuku-en-eshikoto) · Eiheiji | 1h45/1 train | 40 min/0 car | +25 min |
| Nagasaki → Nagasaki airport | 1h/0 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 40 min/0 shinkansen | 45 min/1 train | +25 min |
| Fukuoka → Kurokawa Onsen | 2h30/0 | [Sanso Tensui](https://ryokancatalog.com/inn/sanso-tensui) · Amagase | 1h45/0 train | 1h15/0 car | +30 min |
| Kanazawa → Osaka | 2h45/1 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 2h30/1 train | 45 min/0 train | +30 min |
| Kumamoto → Nagasaki | 2h/2 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 1h50/1 train | 40 min/0 shinkansen | +30 min |
| Nara → Osaka | 1h/0 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 45 min/0 train | 45 min/0 train | +30 min |
| Sendai → Kanazawa | 4h30/1 | [Otogi no Yado Yoneya](https://ryokancatalog.com/inn/otogi-no-yado-yoneya) · Sukagawa | 1h20/1 train | 3h40/2 shinkansen | +30 min |
| Yufuin → Kurokawa Onsen | 1h45/0 | [Sanso Tensui](https://ryokancatalog.com/inn/sanso-tensui) · Amagase | 1h/0 train | 1h15/0 car | +30 min |
| Kagoshima → Kagoshima airport | 1h05/0 | [Myoken Ishiharaso](https://ryokancatalog.com/inn/myoken-ishiharaso) · Kirishima | 55 min/0 train | 45 min/0 bus | +35 min |
| Osaka → Hiroshima | 2h05/1 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 45 min/0 train | 1h55/0 shinkansen | +35 min |
| Fukuoka → Yufuin | 2h10/0 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 1h/0 train | 1h45/0 car | +35 min |
| Fukuoka → Yufuin | 2h10/0 | [Sanso Tensui](https://ryokancatalog.com/inn/sanso-tensui) · Amagase | 1h45/0 train | 1h/0 train | +35 min |
| Takayama → Kyoto | 3h50/1 | [Hanamurasaki](https://ryokancatalog.com/inn/hanamurasaki) · Yamanaka Onsen | 2h50/1 train | 1h35/1 train | +35 min |
| Kyoto → Yamanaka Onsen | 1h35/1 | [Kanshuku-en Eshikoto](https://ryokancatalog.com/inn/kanshuku-en-eshikoto) · Eiheiji | 1h45/1 train | 30 min/0 car | +40 min |
| Takayama → Osaka | 3h55/2 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 3h50/1 train | 45 min/0 train | +40 min |
| Tokyo → Takayama | 4h55/1 | [Beniya Mukayu](https://ryokancatalog.com/inn/beniya-mukayu) · Yamashiro Onsen | 3h/0 shinkansen | 2h35/1 train | +40 min |
| Tokyo → Nyūtō Onsen | 4h/1 | [Wabizakura](https://ryokancatalog.com/inn/wabizakura) · Kakunodate | 3h05/0 shinkansen | 1h35/1 train | +40 min |
| Fukuoka → Kurokawa Onsen | 2h30/0 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 1h/0 train | 2h15/0 car | +45 min |
| Fukuoka → Amagase | 1h45/0 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 1h/0 train | 1h30/0 car | +45 min |
| Izu peninsula → Haneda airport | 2h/2 | [Arcana Izu](https://ryokancatalog.com/inn/arcana-izu) · Yugashima | 30 min/0 car | 2h15/2 train | +45 min |
| Takayama → Kyoto | 3h50/1 | [Beniya Mukayu](https://ryokancatalog.com/inn/beniya-mukayu) · Yamashiro Onsen | 2h35/1 train | 2h/1 train | +50 min |
| Kanazawa → Takayama | 2h25/0 | [Beniya Mukayu](https://ryokancatalog.com/inn/beniya-mukayu) · Yamashiro Onsen | 35 min/0 train | 2h35/1 train | +50 min |
| Beppu → Kumamoto | 2h30/1 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 1h/0 bus | 2h25/1 train | +55 min |
| Kyoto → Yamanaka Onsen | 1h35/1 | [Beniya Mukayu](https://ryokancatalog.com/inn/beniya-mukayu) · Yamashiro Onsen | 2h/1 train | 30 min/0 car | +55 min |
| Tokyo → Kanazawa | 2h40/0 | [Beniya Mukayu](https://ryokancatalog.com/inn/beniya-mukayu) · Yamashiro Onsen | 3h/0 shinkansen | 35 min/0 train | +55 min |
| Sendai → Kanazawa | 4h30/1 | [Onyado Kawasemi](https://ryokancatalog.com/inn/onyado-kawasemi) · Iizaka Onsen | 1h15/1 train | 4h10/2 shinkansen | +55 min |
| Tokyo → Izu peninsula | 1h45/0 | [Arcana Izu](https://ryokancatalog.com/inn/arcana-izu) · Yugashima | 2h10/1 train | 30 min/0 car | +55 min |
| Beppu → Kagoshima | 3h10/1 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 1h/0 bus | 3h10/1 scenic | +1h |
| Kumamoto → Takachiho | 2h/0 | [Takefue](https://ryokancatalog.com/inn/takefue) · Kurokawa Onsen | 1h50/0 car | 1h10/0 car | +1h |
| Kanazawa → Nikkō | 4h/2 | [Beniya Mukayu](https://ryokancatalog.com/inn/beniya-mukayu) · Yamashiro Onsen | 35 min/0 train | 4h30/3 train (two researched halves) | +1h05 |
| Kumamoto → Kurokawa Onsen | 1h50/0 | [Sanso Tensui](https://ryokancatalog.com/inn/sanso-tensui) · Amagase | 1h40/1 train | 1h15/0 car | +1h05 |
| Kyoto → Kansai airport | 1h30/0 | [Tsukihitei](https://ryokancatalog.com/inn/tsukihitei) · Nara | 45 min/0 train | 1h55/1 train | +1h10 |
| Osaka → Fukuoka | 3h05/1 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 45 min/0 train | 3h30/0 shinkansen | +1h10 |
| Osaka → Kansai airport | 1h05/0 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 45 min/0 train | 1h30/0 train | +1h10 |
| Kanazawa → Minakami / Tanigawa | 3h15/1 | [Fujiiso](https://ryokancatalog.com/inn/fujiiso) · Yamada Onsen | 2h/0 train | 2h25/1 shinkansen | +1h10 |
| Fukuoka → Beppu | 2h/0 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 2h10/0 train | 1h/0 bus | +1h10 |
| Osaka → Kansai airport | 1h05/0 | [Sanso Amanosato](https://ryokancatalog.com/inn/sanso-amanosato) · Katsuragi | 1h25/1 train | 55 min/0 car | +1h10 |
| Kyoto → Fukuoka | 3h30/0 | [Migiwatei Ochi Kochi](https://ryokancatalog.com/inn/migiwatei-ochi-kochi) · Tomonoura | 2h10/1 train | 2h30/0 shinkansen | +1h10 |
| Kyoto → Lake Kawaguchi | 4h15/1 | [Fuefukigawa Onsen Zabou](https://ryokancatalog.com/inn/fuefukigawa-onsen-zabou) · Kōshū | 3h45/2 train | 1h45/1 train | +1h15 |
| Lake Kawaguchi → Haneda airport | 3h/1 | [Fuefukigawa Onsen Zabou](https://ryokancatalog.com/inn/fuefukigawa-onsen-zabou) · Kōshū | 1h45/1 train | 2h30/1 train | +1h15 |
| Nara → Kansai airport | 1h55/1 | [Sanso Amanosato](https://ryokancatalog.com/inn/sanso-amanosato) · Katsuragi | 2h15/2 train | 55 min/0 car | +1h15 |
| Sendai → Kanazawa | 4h30/1 | [Bettei Senjuan](https://ryokancatalog.com/inn/bettei-senjuan) · Minakami / Tanigawa | 2h30/1 train | 3h15/1 shinkansen | +1h15 |
| Tokyo → Lake Kawaguchi | 2h/0 | [Fuefukigawa Onsen Zabou](https://ryokancatalog.com/inn/fuefukigawa-onsen-zabou) · Kōshū | 1h30/0 train | 1h45/1 train | +1h15 |
| Kanazawa → Nikkō | 4h/2 | [Fujiiso](https://ryokancatalog.com/inn/fujiiso) · Yamada Onsen | 2h/0 train | 3h20/2 shinkansen | +1h20 |
| Kanazawa → Echigo-Yuzawa | 3h30/1 | [Fujiiso](https://ryokancatalog.com/inn/fujiiso) · Yamada Onsen | 2h/0 train | 2h50/1 shinkansen | +1h20 |
| Kanazawa → Takayama | 2h25/0 | [Hanamurasaki](https://ryokancatalog.com/inn/hanamurasaki) · Yamanaka Onsen | 55 min/0 train | 2h50/1 train | +1h20 |
| Kumamoto → Kurokawa Onsen | 1h50/0 | [Shinsen](https://ryokancatalog.com/inn/shinsen) · Takachiho | 2h/0 car | 1h10/0 car | +1h20 |
| Kyoto → Izu peninsula | 2h40/0 | [Gora Kadan Fuji](https://ryokancatalog.com/inn/gora-kadan-fuji) · Oyama | 2h35/0 train | 1h25/1 train | +1h20 |
| Tokyo → Echigo-Yuzawa | 1h45/0 | [Bettei Senjuan](https://ryokancatalog.com/inn/bettei-senjuan) · Minakami / Tanigawa | 1h40/0 train | 1h25/0 car | +1h20 |
| Tokyo → Hakone | 2h10/1 | [Asaba](https://ryokancatalog.com/inn/asaba) · Izu peninsula | 1h45/0 train | 1h50/2 train | +1h20 |
| Tokyo → Sendai | 1h40/0 | [Otogi no Yado Yoneya](https://ryokancatalog.com/inn/otogi-no-yado-yoneya) · Sukagawa | 1h45/1 train | 1h20/1 train | +1h20 |
| Sendai → Nyūtō Onsen | 2h30/1 | [Wabizakura](https://ryokancatalog.com/inn/wabizakura) · Kakunodate | 2h15/0 shinkansen | 1h35/1 train | +1h20 |
| Kyoto → Hiroshima | 1h55/0 | [Ryokan Nishiyama](https://ryokancatalog.com/inn/ryokan-nishiyama) · Onomichi | 2h20/1 shinkansen | 1h/1 train | +1h25 |
| Sendai → Minakami / Tanigawa | 2h30/1 | [Atamiso](https://ryokancatalog.com/inn/atamiso) · Bandai-Atami | 1h/1 shinkansen | 2h55/2 shinkansen | +1h25 |
| Sendai → Minakami / Tanigawa | 2h30/1 | [Tsuchiyu Bettei Satonoyu](https://ryokancatalog.com/inn/tsuchiyu-bettei-satonoyu) · Tsuchiyu Onsen | 1h/0 train | 2h55/1 train | +1h25 |
| Fukuoka → Amagase | 1h45/0 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 2h10/0 train | 1h/0 train | +1h25 |
| Kumamoto → Nagasaki | 2h/2 | [Mt.Resort Unzen Kyushu Hotel](https://ryokancatalog.com/inn/mt-resort-unzen-kyushu-hotel) · Unzen | 2h10/2 ferry | 1h15/0 car | +1h25 |
| Kyoto → Fukuoka | 3h30/0 | [Kinsuikan](https://ryokancatalog.com/inn/kinsuikan) · Miyajima | 2h40/2 train | 2h15/2 train | +1h25 |
| Tokyo → Izu peninsula | 1h45/0 | [Gora Kadan Fuji](https://ryokancatalog.com/inn/gora-kadan-fuji) · Oyama | 1h50/0 train | 1h25/1 train | +1h25 |
| Tokyo → Minakami / Tanigawa | 1h40/0 | [ryugon](https://ryokancatalog.com/inn/ryugon) · Echigo-Yuzawa | 1h45/0 train | 1h25/0 car | +1h30 |
| Kurokawa Onsen → Amagase | 1h15/0 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 1h45/0 bus | 1h/0 train | +1h30 |
| Kyoto → Hakone | 3h/1 | [Asaba](https://ryokancatalog.com/inn/asaba) · Izu peninsula | 2h40/0 train | 1h50/2 train | +1h30 |
| Kyoto → Hakone | 3h/1 | [Gora Kadan Fuji](https://ryokancatalog.com/inn/gora-kadan-fuji) · Oyama | 2h35/0 train | 1h55/1 train | +1h30 |
| Nagasaki → Nagasaki airport | 1h/0 | [Mt.Resort Unzen Kyushu Hotel](https://ryokancatalog.com/inn/mt-resort-unzen-kyushu-hotel) · Unzen | 1h15/0 car | 1h15/0 car | +1h30 |
| Tokyo → Hakone | 2h10/1 | [Gora Kadan Fuji](https://ryokancatalog.com/inn/gora-kadan-fuji) · Oyama | 1h50/0 train | 1h55/1 train | +1h30 |
| Tokyo → Nagoya | 2h05/0 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 2h45/0 shinkansen | 55 min/0 shinkansen | +1h35 · a stop, not a free connector |
| Tokyo → Kyoto | 2h45/0 | [Gora Kadan Fuji](https://ryokancatalog.com/inn/gora-kadan-fuji) · Oyama | 1h50/0 train | 2h35/0 train | +1h40 · a stop, not a free connector |
| Kyoto → Miyajima | 2h40/2 | [Migiwatei Ochi Kochi](https://ryokancatalog.com/inn/migiwatei-ochi-kochi) · Tomonoura | 2h10/1 train | 2h10/2 shinkansen | +1h40 · a stop, not a free connector |
| Tokyo → Kyoto | 2h45/0 | [Asaba](https://ryokancatalog.com/inn/asaba) · Izu peninsula | 1h45/0 train | 2h40/0 train | +1h40 · a stop, not a free connector |
| Kyoto → Nikkō | 4h40/2 | [Beniya Mukayu](https://ryokancatalog.com/inn/beniya-mukayu) · Yamashiro Onsen | 2h/1 train | 4h30/3 train (two researched halves) | +1h50 · a stop, not a free connector |
| Kyoto → Miyajima | 2h40/2 | [Ryokan Nishiyama](https://ryokancatalog.com/inn/ryokan-nishiyama) · Onomichi | 2h20/1 shinkansen | 2h20/3 ferry | +1h55 · a stop, not a free connector |
| Takayama → Nagoya | 2h45/0 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 3h50/1 train | 55 min/0 shinkansen | +1h55 · a stop, not a free connector |
| Kanazawa → Nikkō | 4h/2 | [Shoraiso](https://ryokancatalog.com/inn/shoraiso) · Yudanaka | 2h10/1 train | 3h50/3 shinkansen | +2h · a stop, not a free connector |
| Kanazawa → Nikkō | 4h/2 | [Bettei Senjuan](https://ryokancatalog.com/inn/bettei-senjuan) · Minakami / Tanigawa | 3h15/1 shinkansen | 2h50/2 shinkansen | +2h05 · a stop, not a free connector |
| Tokyo → Kyoto | 2h45/0 | [Hanamurasaki](https://ryokancatalog.com/inn/hanamurasaki) · Yamanaka Onsen | 3h15/0 shinkansen | 1h35/1 train | +2h05 · a stop, not a free connector |
| Fukuoka → Amakusa | 1h55/1 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 1h/0 train | 3h/2 train | +2h05 · a stop, not a free connector |
| Kyoto → Nikkō | 4h40/2 | [Asaba](https://ryokancatalog.com/inn/asaba) · Izu peninsula | 2h40/0 train | 4h10/3 train | +2h10 · a stop, not a free connector |
| Kyoto → Lake Kawaguchi | 4h15/1 | [Asaba](https://ryokancatalog.com/inn/asaba) · Izu peninsula | 2h40/0 train | 3h45/3 train | +2h10 · a stop, not a free connector |
| Osaka → Nikkō | 5h10/3 | [Hakone Suishoen](https://ryokancatalog.com/inn/hakone-suishoen) · Hakone | 3h25/2 shinkansen | 4h/3 train | +2h10 · a stop, not a free connector |
| Kyoto → Lake Kawaguchi | 4h15/1 | [Gora Kadan Fuji](https://ryokancatalog.com/inn/gora-kadan-fuji) · Oyama | 2h35/0 train | 3h55/2 train | +2h15 · a stop, not a free connector |
| Tokyo → Kyoto | 2h45/0 | [Beniya Mukayu](https://ryokancatalog.com/inn/beniya-mukayu) · Yamashiro Onsen | 3h/0 shinkansen | 2h/1 train | +2h15 · a stop, not a free connector |
| Tokyo → Kyoto | 2h45/0 | [Kanshuku-en Eshikoto](https://ryokancatalog.com/inn/kanshuku-en-eshikoto) · Eiheiji | 3h15/0 shinkansen | 1h45/1 train | +2h15 · a stop, not a free connector |
| Kyoto → Nikkō | 4h40/2 | [Hakone Suishoen](https://ryokancatalog.com/inn/hakone-suishoen) · Hakone | 3h/1 train | 4h/3 train | +2h20 · a stop, not a free connector |
| Kyoto → Nikkō | 4h40/2 | [Bettei Senjuan](https://ryokancatalog.com/inn/bettei-senjuan) · Minakami / Tanigawa | 4h15/1 shinkansen | 2h50/2 shinkansen | +2h20 · a stop, not a free connector |
| Fukuoka → Amakusa | 1h55/1 | [Sanso Tensui](https://ryokancatalog.com/inn/sanso-tensui) · Amagase | 1h45/0 train | 2h30/0 car | +2h20 · a stop, not a free connector |
| Fukuoka → Kumamoto | 40 min/0 | [Tayuta](https://ryokancatalog.com/inn/tayuta) · Amakusa | 1h55/1 train | 1h10/0 car/train | +2h25 · a stop, not a free connector |
| Fukuoka → Miyajima | 2h15/2 | [Migiwatei Ochi Kochi](https://ryokancatalog.com/inn/migiwatei-ochi-kochi) · Tomonoura | 2h30/0 shinkansen | 2h10/2 shinkansen | +2h25 · a stop, not a free connector |
| Tokyo → Nikkō | 2h/0 | [Bettei Senjuan](https://ryokancatalog.com/inn/bettei-senjuan) · Minakami / Tanigawa | 1h40/0 train | 2h50/2 shinkansen | +2h30 · a stop, not a free connector |
| Beppu → Kagoshima | 3h10/1 | [Takefue](https://ryokancatalog.com/inn/takefue) · Kurokawa Onsen | 2h25/0 bus | 3h20/1 train | +2h30 · a stop, not a free connector |
| Kanazawa → Nikkō | 4h/2 | [Otogi no Yado Yoneya](https://ryokancatalog.com/inn/otogi-no-yado-yoneya) · Sukagawa | 3h40/2 shinkansen | 2h50/2 shinkansen | +2h30 · a stop, not a free connector |
| Kyoto → Lake Kawaguchi | 4h15/1 | [Hakone Suishoen](https://ryokancatalog.com/inn/hakone-suishoen) · Hakone | 3h/1 train | 3h45/3 train | +2h30 · a stop, not a free connector |
| Sendai → Kakunodate | 2h15/0 | [Yamado](https://ryokancatalog.com/inn/yamado) · Hotto-Yuda | 2h/1 shinkansen | 2h50/2 shinkansen | +2h35 · a stop, not a free connector |
| Tokyo → Nikkō | 2h/0 | [Otogi no Yado Yoneya](https://ryokancatalog.com/inn/otogi-no-yado-yoneya) · Sukagawa | 1h45/1 train | 2h50/2 shinkansen | +2h35 · a stop, not a free connector |
| Kagoshima → Amakusa | 2h20/1 | [Myoken Ishiharaso](https://ryokancatalog.com/inn/myoken-ishiharaso) · Kirishima | 55 min/0 train | 4h/0 car | +2h35 · a stop, not a free connector |
| Fukuoka → Amakusa | 1h55/1 | [Yoyokaku](https://ryokancatalog.com/inn/yoyokaku) · Karatsu | 1h15/0 train | 3h20/0 car | +2h40 · a stop, not a free connector |
| Sendai → Kakunodate | 2h15/0 | [Tsuchiyu Bettei Satonoyu](https://ryokancatalog.com/inn/tsuchiyu-bettei-satonoyu) · Tsuchiyu Onsen | 1h/0 train | 3h55/1 shinkansen | +2h40 · a stop, not a free connector |
| Tokyo → Kakunodate | 3h05/0 | [Bettei Senjuan](https://ryokancatalog.com/inn/bettei-senjuan) · Minakami / Tanigawa | 1h40/0 train | 4h05/1 shinkansen | +2h40 · a stop, not a free connector |
| Kyoto → Lake Kawaguchi | 4h15/1 | [Arcana Izu](https://ryokancatalog.com/inn/arcana-izu) · Yugashima | 3h05/1 train | 3h55/3 train | +2h40 · a stop, not a free connector |
| Tokyo → Kakunodate | 3h05/0 | [Onyado Kawasemi](https://ryokancatalog.com/inn/onyado-kawasemi) · Iizaka Onsen | 2h/1 train | 3h55/2 shinkansen | +2h50 · a stop, not a free connector |
| Kagoshima → Amakusa | 2h20/1 | [Sanso Tensui](https://ryokancatalog.com/inn/sanso-tensui) · Amagase | 2h40/1 scenic | 2h30/0 car | +2h50 · a stop, not a free connector |
| Sendai → Kakunodate | 2h15/0 | [Onyado Kawasemi](https://ryokancatalog.com/inn/onyado-kawasemi) · Iizaka Onsen | 1h15/1 train | 3h55/2 shinkansen | +2h55 · a stop, not a free connector |
| Tokyo → Nikkō | 2h/0 | [Onyado Kawasemi](https://ryokancatalog.com/inn/onyado-kawasemi) · Iizaka Onsen | 2h/1 train | 2h55/2 train | +2h55 · a stop, not a free connector |
| Tokyo → Kakunodate | 3h05/0 | [ryugon](https://ryokancatalog.com/inn/ryugon) · Echigo-Yuzawa | 1h45/0 train | 4h20/1 shinkansen | +2h55 · a stop, not a free connector |
| Tokyo → Nikkō | 2h/0 | [ryugon](https://ryokancatalog.com/inn/ryugon) · Echigo-Yuzawa | 1h45/0 train | 3h10/2 shinkansen | +2h55 · a stop, not a free connector |
| Kyoto → Nikkō | 4h40/2 | [ryugon](https://ryokancatalog.com/inn/ryugon) · Echigo-Yuzawa | 4h30/1 shinkansen | 3h10/2 shinkansen | +3h · a stop, not a free connector |
| Tokyo → Nikkō | 2h/0 | [Atamiso](https://ryokancatalog.com/inn/atamiso) · Bandai-Atami | 2h10/1 shinkansen | 2h50/2 shinkansen | +3h · a stop, not a free connector |
| Sendai → Kakunodate | 2h15/0 | [Atamiso](https://ryokancatalog.com/inn/atamiso) · Bandai-Atami | 1h/1 shinkansen | 4h20/2 shinkansen | +3h05 · a stop, not a free connector |
| Tokyo → Kakunodate | 3h05/0 | [Otogi no Yado Yoneya](https://ryokancatalog.com/inn/otogi-no-yado-yoneya) · Sukagawa | 1h45/1 train | 4h25/2 shinkansen | +3h05 · a stop, not a free connector |
| Tokyo → Kakunodate | 3h05/0 | [Tsuchiyu Bettei Satonoyu](https://ryokancatalog.com/inn/tsuchiyu-bettei-satonoyu) · Tsuchiyu Onsen | 2h15/0 shinkansen | 3h55/1 shinkansen | +3h05 · a stop, not a free connector |
| Kagoshima → Amakusa | 2h20/1 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 2h35/1 train | 3h/2 train | +3h20 · a stop, not a free connector |
| Fukuoka → Amakusa | 1h55/1 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 2h10/0 train | 3h05/0 car | +3h20 · a stop, not a free connector |
| Sendai → Kakunodate | 2h15/0 | [Otogi no Yado Yoneya](https://ryokancatalog.com/inn/otogi-no-yado-yoneya) · Sukagawa | 1h20/1 train | 4h25/2 shinkansen | +3h25 · a stop, not a free connector |
| Fukuoka → Amakusa | 1h55/1 | [Takefue](https://ryokancatalog.com/inn/takefue) · Kurokawa Onsen | 2h30/0 car | 2h55/0 car | +3h30 · a stop, not a free connector |

*Hours are door to door and run both ways; `2h/1` is two hours and one change. A detour of `none` or less means the two halves come to no more than the direct journey. Up to 1h30 extra still counts as a free connector; past that the row is marked **a stop, not a free connector** — the place is worth a night of its own, and the detour is the price of it. Those marked rows appear only where a pair has no free connector at all.*
<!-- /generated:connectors -->

### How to read it, and what it doesn't have

- **Every row above is researched**, so none is labelled estimated. Two kinds of number are: one you looked up for a missing pair, and one marked "estimated" in `data/transit-legs.md`. Keep the word attached whenever you repeat it, and give a day built on one extra buffer.
- **Changes cost more than the clock says.** Two hours with none is an easier day than ninety minutes with two.
- **Times run both ways**, each row printed in whichever direction it was researched: read From/To as a pair, not an order. **A pair is missing only if it appears in neither direction.** Airports are a separate table and run both ways too — but never reuse one airport's number for another serving the same city: Tokyo's two are an hour apart in opposite directions.
- **Inn legs are not in these tables.** A gateway city to an inn is the `Reach` column of Stage 4's master table, written `kyoto 3h/1 train`; `in town` means no leg row; `changes to confirm` means hours researched, changes not: write `3h, changes to confirm`.
- **A missing pair is COMPOSED out of two researched rows, and composing comes before `to confirm`.** Grep the full leg table first (step 4a). If `A→B` is absent there too, find a **hub city** from step 4's list the tables hold both halves through, fastest first; sum the halves, **add one change for the join**, name both modes where they differ, and label the row `composed via <city>`. Kyoto→Haneda is the standard case: **Kyoto→Tokyo 2h45, 0 changes** plus **Tokyo→HND 35 min, 1 change** gives `3h20` and `0 + 1 + 1 for the join = 2`. Write both parts and show the sum. Two halves at most, both researched, plus the transfer where they do not meet in one station. A composed leg counts as sourced and is written as a time, never "estimated"; `to confirm` is only for a pair no hub joins.
- **Okinawa is absent from the dataset:** a trip there means looking up every leg. Hokkaido is in the tables.
- **For any gap:** look it up live — Google Maps, Jorudan or Navitime, station to station for the dates in question — say so in the plan and write it as an estimate. Never fill a hole from memory.
- **Winter and mountains.** Mountain and coastal lines carry real weather delays in winter, and some run a handful of services a day. Leave slack, and never schedule a flight straight after one.
- **The last mile is often the hard part.** Country inns sit some way from the nearest station; many run a shuttle that must be requested at booking, some have none, and the taxi rank at a small station can be empty. Ask the inn how you are meant to arrive, and put the answer in the plan.

### The exit airport

After a reorder, check two things: **no zig-zags** — a route that passes a place, comes back and passes it again needs resequencing — and that **three inn dinners in a row is still the cap**, which a reorder can break without anybody noticing.

**The exit works.** Pick the airport you fly home from **last**, once the order is settled: the one nearest the final stop. In through one airport and home from another is the default; doubling back to the one you landed at spends a day for nothing. The usual exits are **HND** and **NRT** for Tokyo, **KIX** for Kyoto and Osaka, **CTS** for Hokkaido, **NGO** for Takayama or Nagoya, and **FUK**, **KOJ**, **NGS**, **KMJ** or **OIT** for Kyushu, whichever end the route finishes at; any airport with a Haneda flight counts, Komatsu and Hiroshima included. **A ticket home out of Haneda does not mean Tokyo at the end.** At the far end of a Kyushu or Hokkaido trip it is the transfer to the nearest airport plus its Haneda flight — both rows in the tables — priced as the last leg like any other; the trip still ends where the route ends. Add Tokyo nights at the close only if they ask. A booked return ticket settles the airport.

### Two practical things

- **Luggage forwarding.** Hand a suitcase to the front desk in the morning and it reaches the next hotel the following afternoon for about the price of two meals, while you travel with an overnight bag. Use it for mountain legs and one-night stops. It is **next-day, not same-day**, so keep a night's things with you; some remote inns sit outside the fastest service areas.
- **Is a rail pass worth it?** Rarely since the 2023 price rise: total the long-journey fares against the pass; regional passes are often better value. **Reserve seats** for long journeys with luggage, especially around New Year, the early-May holiday week and mid-August.

### If two versions of the trip are still alive

Compare them in one frame: the same measures for both, none counted against one and forgiven in the other.

| | Version A | Version B |
|---|---|---|
| Total transit (including the journey to the airport at the end) | | |
| Separate stays | | |
| One-night stops | | |
| Nights at inns vs nights in cities | | |
| Days needing a car | | |
| Journeys on estimated times | | |

Show the table, name the trade-off in a sentence, say which you'd take, and let them choose. Cost differences belong in the verdict only if they are large. **The trip page does this better than prose** — two plans in one frame: fill `guides/trip-visual-template.html` from both itinerary tables and open it beside the comparison, drawn, not offered.

### The plan — this is the deliverable

Finish the itinerary table and show it whole. **Only three leg forms are allowed** — a sourced time, a time you looked up live and labelled an estimate, or `to confirm`. A leg composed through a hub city is the first form, written as the sum with both halves named and the row labelled `composed via <city>`. An invented travel time is the mistake in this kit most likely to cost somebody a booking.

A leg row reads `↓ <h>h · <n> changes · <mode>`; a composed one names its hub — `↓ 4h45 · 1 change · shinkansen (composed via Tokyo)`, said to them as two journeys added together; an estimated one `↓ ~1h50 · 1 change · bus (estimated — looked up live)`; an unsourced one `↓ to confirm`.

**Trip plan** · `<dates>` · `<n>` nights · arrive `<airport>`, depart `<airport>`

| # | Stop | Dates | Nights | Stay options |
|---|---|---|---|---|
| | ↓ in from `<airport>` · `<h>h` · `<n>` changes · `<mode>` | | | |
| 1 | `<stop>` · `<city / town / ryokan>` | `<dates>` | `<n>` | [`<name>`](`<link>`) (chosen) · [`<name>`](`<link>`) |
| | ↓ `<h>h` · `<n>` changes · `<mode>` | | | |
| 2 | `<stop>` · `<city / town / ryokan>` | `<dates>` | `<n>` | [`<name>`](`<link>`) (chosen) · [`<name>`](`<link>`) |
| | ↓ `<h>h` · `<n>` changes · `<mode>` | | | |
| 3 | `<stop>` · `<city / town / ryokan>` | `<dates>` | `<n>` | [`<name>`](`<link>`) (chosen) · [`<name>`](`<link>`) |
| | ↓ out to `<airport>` · `<h>h` · `<n>` changes · `<mode>` | | | |

**Totals:** `<n>` total transit · `<n>` separate stays · `<n>` inn nights / `<n>` city nights · `<n>` one-nighters. Every figure here comes from `plan`, never typed; the transit total sums the leg rows above, both airport legs in it, rounded to five minutes.

**Notes:** `<shuttle window, last-mile detail>`, one per stop that needs one. **Assumed:** `<every default you chose for them>`.

**To confirm**

1. `<unsourced leg, unverified opening, shuttle to arrange>`

**The totals line includes the departure leg.** A plan whose transit total stops at the last hotel understates the trip by two hours and hides the morning that decides whether the flight is catchable.

The `To confirm` list is the next thing they have to do: specific and short. **An open stop is not a blocker** — finish the plan around it and give the list a line, *"close the stay at Tokyo — the Okura or the Aman"*, for each stop Stage 4 left open.

**Then update the trip page and hand it back, without being asked.** They have had it since the end of
Stage 4, and every stop, stay and leg this stage moved has to reach it: refill
`guides/trip-visual-template.html` from the finished table and open it again. `guides/visualizing-the-trip.md`
says how.

## Stage 6 — Optional depth

```
Goal    whichever of the three they actually want
Inputs  the finished Trip plan, open stops and all
Do      offer (a) eating (b) day ideas (c) the booking calendar, in one line; do the one they pick.
        (a) and (b) open by asking what they like, not with a list. (d), the trip page, is already
        drawn — it was built at the end of Stage 4 and updated at the end of Stage 5; here it is only
        redrawn on request, or when a change in this stage lands on it
Tables  eating `| Place | Type | Price | Neighbourhood | Booking | Map |`, grouped under a heading per
        cuisine · day ideas `| Idea | What it is | Time | Map |` · the calendar as it is printed below
Ask     1 question — which of the three; then the taste or interest questions
Output  the thing they picked, and a checklist with real dates if (c)
Next    nothing. That is the whole job.
```

Only after the plan exists. **Don't deliver all of it unasked.**

**A fun read to offer once in this stage:** the kit author's illustrated trip report from an earlier Japan trip, photos and meals: https://docs.google.com/document/d/18FJshPTanc0IR7VbOufL0bE4Dz3prDVKNJuIeoNFmT0/edit — if it asks for access, say it is optional and move on.

### (a) Eating

**The first message is an interview, not a list of restaurants.** One short paragraph, then four questions, read against their `Taste:` line. The paragraph says: nobody needs reservations to eat superbly in Japan, and two or three booked meals per city is the most anyone needs. Then the questions, with examples, glossing each Japanese word:

1. **Which styles pull at you?** — sushi counter, izakaya, ramen, soba, udon, kaiseki, yakitori, tempura, tonkatsu, yakiniku, French or Italian in Japan, wine bars, cocktail bars, coffee, listening bars (built around a record collection).
2. **How formal, and what would you spend on a good dinner?** — a ¥3–6k counter, a ¥10–15k room, ¥25k and up for one big meal. An ambitious lunch is the cheaper way in.
3. **Drinks, and anything you don't eat?** — sake, natural wine, cocktails, none; allergies, vegetarian, no raw fish.
4. **How much booking effort do you want?** — none (then every place you name is walk-in), two or three anchors per city, or all in.

**Name the two sources once.**

- **`guides/dining.md`**, if it came with this kit — roughly 430 venues in Tokyo, 215 in Fukuoka, 110 in Kyoto, 80 each in Osaka and Kagoshima, 25 in Kanazawa, shorter sections for six more cities. One traveller's palate — creative low-key rooms, counters, natural wine — every entry checked for bookability.
- **The illustrated trip report** linked above: one earlier trip in photos, not a survey.

**Open one city at a time**, `guides/dining/<city>.md` for the stops on the plan and `guides/dining/index.md` to list them; **never `guides/dining.md` whole** — half a megabyte of the same text.

Say that what follows is a small subset chosen against their answers, and that they can **ask for more in any category, neighbourhood or price at any time.**

**If the dining guide isn't there**, say so in one line, name the **`japan-trip-kit`** repository on GitHub, and carry on.

**The recommendations are a table, never a list of paragraphs**, with a heading per cuisine above each — sushi · izakaya · noodles · kaiseki and kappō · yakitori and grills · tempura and tonkatsu · Western-in-Japan · wine bars · cocktail bars · listening bars · coffee — never grouped by how hard they are to book:

| Place | Type | Price | Neighbourhood | Booking | Map |
|---|---|---|---|---|---|
| `<name>` | `<cuisine or room type>` | `<band per head, dinner or lunch>` | `<neighbourhood, not the address>` | `<walk-in · Tabelog · TableCheck · OMAKASE.in · phone, in Japanese · through the hotel>` | [map](`<link>`) |

One line of prose per place at most, under the table, only where the pitch needs it; price and booking channel are cells. Lotteries and midnight releases are excluded. The booking-effort answer decides what appears: "none" is walk-in only, "two or three anchors" that many per city, "all in" the hard-to-get tier. The **Tabelog score** is optional — Japan's review site, 3.5 and up very good, 3.7 excellent; casual places are not marked down for being cheap.

**The map link rule.** A guide row's real pin (`google.com/maps/place/…`) is best: pass it through. A name-search link is the fallback, labelled "map (search)" so the reader checks it lands on the venue. Never write a map link from memory.

**Two rules for the picks.** On inn nights dinner is at the inn, so no restaurant those evenings. A listing with no available dates is not a channel — check it, or say you haven't.

**How the messages close.** The first ends with the taste questions and nothing else; every one after with **"more in any category, or another neighbourhood?"** Never close by pointing at the booking calendar.

### (b) Day ideas per stop

**Ask what interests them before you name anything.** As in (a): a short paragraph, then three questions, read against their `Draws:` line.

1. **What pulls at you?** — temples and gardens, craft and design, markets, neighbourhoods to walk, museums, nature, pop culture, an onsen open to day visitors.
2. **How full should a day be?** — one anchor and time to wander, or two or three planned things.
3. **Anything you already know you want?** — a museum, a garden, a show.

Then the ideas, as a table per stop, the stop as its heading:

| Idea | What it is | Time | Map |
|---|---|---|---|
| `<name>` | `<one line>` | `<half a day · 2h · a morning>` | [map](`<link>`) |

- Three or four ideas per stop, with **two low-effort** (a neighbourhood to walk, a market, a bath) and **one the thing the place is known for**; note under the table which need advance tickets.
- **Default rhythm per city block:** one landmark day, one neighbourhood day on foot, one day with a single anchor and nothing after it.
- **In the countryside the anchor is the bath and the meal**, and the day around it stays empty. A three o'clock inn check-in does not survive a morning excursion an hour away.
- **No more than one big timed thing per day**, and one empty afternoon per week.
- **Check anything seasonal against the month.** Mountain roads, ropeways, gorge railways and some gardens and museums close for the winter.
- Anything needing an advance ticket goes in the calendar, not the day list. Close the way (a) closes.

### (c) The booking calendar

Order by **deadline**, not trip order: a checklist, earliest first, with a real date against each item counted back from departure.

| When | Date | What | Book it at | Why |
|---|---|---|---|---|
| **6–12 months out** | `<date>` | Long-haul flights | [Google Flights](https://www.google.com/travel/flights) | Price and seat choice, worst around New Year, blossom season and mid-August |
| **6 months out** | `<date>` | The one inn the trip is built around | its page on [ryokancatalog.com](https://ryokancatalog.com), then the inn's own site | The best inns open their books six months to a year ahead, sometimes by phone or email only, and the best rooms go the day the window opens. If a room type is the reason for the stay, treat that date as an appointment |
| **4–6 months out** | `<date>` | Every other inn | the inn's own site, or [Ikyu](https://www.ikyu.com/) | The comfortable lead time; later than three months and the popular ones are gone |
| **3–4 months out** | `<date>` | City hotels | the property's own page — the links in the hotel table's `Stay` cell | Usually open and often free to cancel, so book early and revise |
| **2–3 months out** | `<date>` | The restaurants they chose as anchors, if any | the channel named on the row — walk-in, [Tabelog](https://tabelog.com/en/), [TableCheck](https://www.tablecheck.com/), [OMAKASE](https://omakase.in/en) or the hotel | Only the ones they picked; windows differ per restaurant, so give each its own date |
| **1–2 months out** | `<date>` | Rail passes | [Japan Rail Pass](https://www.japanrailpass.net/en/) and the regional passes beside it | Confirm first whether the plan needs one |
| **1 month out** | `<date>` | Reserved seats on long trains | [smartEX](https://smart-ex.jp/en/) for the Tokyo–Kyoto–Hiroshima line, [JR-EAST](https://www.eki-net.com/en/jreast-train-reservation/) north and west | Reservations open a set period ahead, commonly a month |
| **1 month out** | `<date>` | Inn shuttles and arrivals | email the inn directly — the address is on its own site | Many pickups need a request at booking, and some remote stations have no taxis. Confirm in writing |
| **1 month out** | `<date>` | Popular timed tickets | the venue's own page first, then [Lawson Ticket](https://l-tike.com/) or [e+](https://eplus.jp/) | Some sell out in hours, sometimes only through a convenience-store ticketing system inside Japan. Find the release date and have a second choice |
| **2 weeks out** | `<date>` | Car hire, if needed | [Toyota Rent a Car](https://rent.toyota.co.jp/eng/) or [Times Car Rental](https://www.timescar-rental.com/) | Plus an international driving permit, obtained at home |
| **1 week out** | `<date>` | Dietary requests and any special occasion | email each inn and each booked restaurant | Inn menus are fixed weeks ahead |
| **Before leaving** | `<date>` | Travel money, transport card, connectivity, confirmations saved offline | [Suica](https://www.jreast.co.jp/multi/en/pass/suica.html) on the phone, an eSIM before you fly | Cash still matters outside the cities |

**Put a real date in the `Date` column, counted back from their departure date** — "6 months out" is not a deadline anybody acts on; where a window opens on a fixed date, write that date. **Every row is a live link**, so the next click is in the table rather than in a search.

**A stop Stage 4 left open still gets its rows** — the inn or hotel deadline stands, and it is the reason to close the stay. **Restaurant windows live here, and only for the anchors they chose**: a room that books a fixed period ahead usually opens on the first of the month, one to three months out, and the good seats go the same day.

Hand over the checklist with real dates, and the Stage 5 plan alongside it.

### (d) The trip drawn as a page — already done

**This page is not offered here.** It is drawn unasked at the close of Stage 4 and updated at the close of
Stage 5, so they already have it. Redraw it on request, or when something settled in this stage changes
what it shows. What it is:

A single HTML file they open in a browser: the stops in travel order as bars sized by nights, every leg
as a chip with its hours, changes, mode and where the number came from, each stay with its link and price
band, and the totals as a table, drawn on a map of Japan with the inns' photos. **No `To confirm` list and
no follow-ups of any kind** — the page is for understanding the trip, not running its logistics. The one
exception is a rare **watch line** under a leg chip, for a major transit flag only: an estimated or
composed leg, a driving day, a ferry, a bus that must be reserved, a winter-risk pass.
**`guides/trip-visual-template.html`** ships pre-filled with the sample plan: overwrite its five marked
`EDIT` zones from the itinerary table (plain HTML, no script to run) and hand it over the way
**`guides/visualizing-the-trip.md`** says for your environment — that file carries the rules and the
pre-flight checklist, and **`guides/design-principles.md`** is what a finished page is read against.

It also draws two candidate plans in one frame, which Stage 5 explains. If two versions are still
open, draw that before (a), (b) or (c): the choice comes first.

Everything on the page comes from the plan; nothing is invented, and there are no day-by-day cards —
days are for after the trip is booked.

## Appendix

### The Trip profile block

Fill this in Stage 1, show it, and update it whenever the plan shifts. Rendered text, not a code block. `Assumed` is the honest record of what they did not answer.

**Trip profile**

- **Dates** — `<month, year>` · `<n>` nights
- **Flying into** — `<airport, if known — or "not booked yet">`
- **Travellers** — `<who>`
- **Japan before** — `<first trip / n times — where>`
- **Draws** — `<two or three, in their words>`
- **Taste** — `<what their favourite trips say about how they travel>`
- **Pace** — `<see a lot / settle in>`
- **Budget** — `<modest / comfortable / splurge>`
- **Fixed** — `<booked flights, dates, events — or "nothing yet">`
- **Wish list** — `<must-dos>`
- **Assumed** — `<every default you chose for them>`

### The tables the run hands over

Every sequence, set of options and comparison is a table, one header line per stage; the exception is a Stage 2 place card, two or three sentences in prose. The prose beside a table carries the pitch and the trade-offs; hours, prices, links and scores live in cells. Nothing is set in a code fence.

- **Stage 3, the spine menu** — `| Route | Who it's for | The trip | Nights | Travel | Ryokan nights | Flights | Fly in / home from |`, one row per spine at its default assembly
- **Stage 3, a spine's decisions** — `| Where | Decision | Options (chosen in bold) |`, the rows grouped in trip order (a city, its attachment, the next leg's slots, the next city), the options and descriptions as spines.json prints them
- **Stage 3, a timeline** — `| Stop | Nights | Onward |`, one row per stay, the arrival transfer first, the leg under each stop as time to five minutes and one mode word, the stop string beneath
- **Stage 3, a change before and after, or two routes compared; Stage 5, orders compared** — `| Route | Stops | Nights | Total transit | Separate stays | Ryokan nights | Flights | In / out |` (Stage 5's orders table is `| Order | Total transit | Separate stays | Inn / city nights | One-nighters |`), one row per route
- **Stage 4, the stays for a stop** — `| Stay | Price | Why |`, one per stop; a ryokan option spanning towns adds `Town`, the inns within reach of a city `From <city>`. The name, kind, score and links ride in the `Stay` cell: no Links column anywhere
- **Stages 3 to 5, the plan itself** — the itinerary table below, filled progressively
- **Stage 6, eating** — `| Place | Type | Price | Neighbourhood | Booking | Map |`, under a heading per cuisine
- **Stage 6, day ideas** — `| Idea | What it is | Time | Map |`, one table per stop
- **Stage 6, the booking calendar** — `| When | Date | What | Book it at | Why |`, ordered by deadline

**An inn stop is one night.** Two only where the plan argues for it — slower travel, the trip's only inn stay, or hot springs are what they came for — and the plan says which.

### Repeat visits are written `@2`

A second stay in a city is `tokyo@2` — in an explorer address, in a `plan` stop string and in `--nights tokyo@2=N`. `tokyo#2` is still accepted wherever it is typed and is never written out: a `#` starts the address's hash, so a link carrying one is cut in half by the browser.

### The itinerary table

The one table the run is built in, filled progressively from Stage 3 to Stage 5, and the deliverable. Rendered markdown with live links — never a fenced block, which kills the links and sets a plan in monospace.

**Trip plan** · `<dates>` · `<n>` nights · arrive `<airport>`, depart `<airport>`

| # | Stop | Dates | Nights | Stay options |
|---|---|---|---|---|
| | ↓ in from `<airport>` · `<h>h` · `<n>` changes · `<mode>` | | | |
| 1 | `<stop>` · `<city / town / ryokan>` | `<dates>` | `<n>` | [`<name>`](`<link>`) (chosen) · [`<name>`](`<link>`) |
| | ↓ `<h>h` · `<n>` changes · `<mode>` | | | |
| 2 | `<stop>` · `<city / town / ryokan>` | `<dates>` | `<n>` | [`<name>`](`<link>`) (chosen) · [`<name>`](`<link>`) |
| | ↓ `<h>h` · `<n>` changes · `<mode>` | | | |
| 3 | `<stop>` · `<city / town / ryokan>` | `<dates>` | `<n>` | [`<name>`](`<link>`) (chosen) · [`<name>`](`<link>`) |
| | ↓ out to `<airport>` · `<h>h` · `<n>` changes · `<mode>` | | | |

**Totals:** `<n>` total transit · `<n>` separate stays · `<n>` inn nights / `<n>` city nights · `<n>` one-nighters. Every figure here comes from `plan`, never typed; the transit total sums the leg rows above, both airport legs in it, rounded to five minutes.

**Notes:** `<shuttle window, last-mile detail>`, one per stop that needs one. **Assumed:** `<every default you chose for them>`.

**To confirm**

1. `<unsourced leg, unverified opening, shuttle to arrange>`

**How it is read, wherever it appears.** Stage 3 fills `#`, `Stop` — the name and its kind word, **city**, **town** or **ryokan** — `Nights` and every leg row; Stage 4 fills `Stay options`, the lean marked `(chosen)`; Stage 5 adds the airport rows and the totals. `Dates` is filled only where a start date is known, `Jan 2–6` for a run of nights and `Jan 6` for one. Show it whole each time it changes. **Mode** is the word the corridor and airport tables print — `shinkansen` · `train` · `subway` · `bus` · `car` · `ferry` · `flight` — and **every leg row has one**: two hours on a bullet train and two hours on a mountain bus are different days. **A hotel name links to its Google Maps pin, an inn's to its `ryokancatalog.com` page.** A leg has three forms: sourced, `estimated` and labelled every time, or `to confirm`, which is left out of the totals and makes them partial — `≥ 6h00 (partial — 1 leg unsourced)`.

### Finding a stay the kit doesn't hold

Stage 4's tables are a **design-and-luxury list** and do not cover every town. When the stop isn't in them, or the budget sits below them, say so plainly — "Japan is not expensive, this particular list is" — and go and find something. `guides/research-method.md` is the long version.

1. **Check this kit first, every time.** The master table, `catalog/catalog.md` and `data/hotels.md` answer most stops. Say what they hold, then go outside, and say plainly that the kit did not cover it.
2. **Read the Japanese sites first** — the sample is ten times the English one. **Ikyu (一休)** is the upper end and prints an overall out of 5 plus sub-ratings: **4.5 good, 4.7 very good, 4.8+ the top of the market**; 4.2 on a famous name is a warning. **Rakuten Travel** and **Jalan** cover the rest. Read the **distribution and the sub-ratings**, never one review.
3. **The property's own site is the only truth for policy** — tattoos, children, meal plans, whether the bath is a real hot spring, whether a "private bath" is in the room or booked by the hour. Check the policy for **overnight guests**, not the one for day visitors.
4. **Then the English connoisseurs** — FlyerTalk's Japan forums, TripAdvisor's long reviews: judgement and comparison, not facts about the building.
5. **Verify the negatives too.** "Fully booked", "closed", "referral only" are claims like any other; a false one silently deletes the best option.
6. **Link the real place**, not a name search, and **vary the properties across the trip**.

**Evidence** = stays, scores, distributions, the property's own written policy. **Not evidence** = the hotel's adjectives, a press release, one glowing review, an aggregator's "9.4 Wonderful".

**Present a find as a row of the same table** — the neighbourhood in the `Stay` cell, `Price` marked "unverified — check live". A named property with an honest caveat is a plan; a neighbourhood and a price range is homework.

**The reliable floor, in any city:** a clean, well-run, well-located mid-range room for two runs roughly **$90–200** a night. The chains: **Dormy Inn** (communal hot bath, often a real spring), **Mitsui Garden**, **Candeo**, **Richmond**, **Daiwa Roynet**, **Sotetsu Fresa Inn**, the **JR station hotels** (Granvia, JR-East Metropolitan) and **OMO by Hoshino Resorts**. The difference between a $120 and a $400 room here is size, breakfast and view.

### Credits

The accommodation catalogue behind this kit exists because of **KI-NRT**, the author of the FlyerTalk thread *"Japan Luxury Ryokans – A Primer + Impressions"*, and the members who added their reports over many years. Everything it says about a traditional inn traces back to somebody who stayed there and wrote it up; if you find an inn here and go, the thread is the right place to post what you thought.

Restaurant research draws on **Tabelog**, Japan's own review site. **Photographs belong to the inns and hotels themselves.** The travel times were researched leg by leg from timetables and mapping data.

### License

- **Documents and data** — Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC BY-NC-SA 4.0). Use it, adapt it, share it; credit the sources above; don't sell it; pass on the same freedoms.
- **Code** — MIT.

### What this kit is not

- **Not official, and not affiliated** with any inn, hotel, railway, tourist board or with FlyerTalk.
- **Not a booking service.** It tells you what to book and roughly when the window opens.
- **Not a rating authority.** The scores are one reader's synthesis of first-hand traveller reports, discounted where the evidence is thin.
- **Not current forever.** Prices move, inns renovate and close, rail services get cut; opening hours, shuttle timetables and availability go stale first.
- **Deepest on winter, on traditional inns, and on the main island.** Thinner on the far north and the southern islands, on summer, and on travelling with children.
- **Not a substitute for asking.** The place you book will answer a direct email about tattoos, children, dietary needs, a bed instead of a floor mattress, or how to get there from the station.
