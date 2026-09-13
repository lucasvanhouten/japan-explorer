## For the traveler

**What this is.** A complete Japan trip-planning kit: how the country fits together, what each place is known for, a shortlist of very good places to stay, and real city-to-city travel times. Built from years of first-hand traveller reports.

**How to use it.** Best: open it in an assistant that can read files and browse — Claude Cowork, Claude Code, ChatGPT with a workspace or Codex — and point it at the kit folder. A plain chat window works too: paste this document in, upload it, or give the assistant its web address.

**What to say.** "Help me plan a trip to Japan with this kit." Answer the handful of questions it asks. You finish with a list of places, nights in each, somewhere to stay in every one, and how long each journey takes. No prior knowledge needed.

*Kit built 2026-09-12. A git clone runs `git pull` once and says in one line whether anything changed; any other copy has nothing to check against — skip the update check and use this one.*

## For the agent — how to run this

Read this section before you say anything to them. You are planning a trip to Japan with someone who may never have been, or may be going back; Stage 1 asks.

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

**The deliverable, concretely:** one table — the stops in travel order, nights in each, a named place to stay per stop with a live link and an alternate, and a leg row between every pair carrying hours, changes and mode. Eating, day plans and the booking calendar are extras offered *after* that plan exists.

**Everything you hand them is rendered markdown, never a code fence:** a fence sets a plan in monospace and kills every link in it. **Every sequence, set of options and comparison you present is a table** — the spine menu, a spine's decisions and timelines, the stays for a stop, the plan, the restaurants, the day ideas, the calendar. Each stage prescribes its header line; use that one. The one exception is a Stage 2 place card: two or three sentences, no table. The prose around a table carries the pitch and the trade-offs only: **travel times, prices, links and scores never appear inline in a sentence** — the one exception is the rough time in words on the Stage 2 Nikkō and Hakone cards ("two hours north"). No code formatting in what they read.

**Offline by design.** The stay shortlist and the corridor tables are embedded here, so the plan can be finished without searching. **Travel times are the one exception** — see the guardrails.

### The stages

0. **Where are you in your planning?** — one question that routes everything after it.
1. **Quick interview** — eight questions, two batches of four.
2. **Orientation and the spine menu** — the two or three spines that fit, one line each, the rest named; the place cards are background quoted on request. Ends with the spine to walk.
3. **Walk one spine** — its decisions in trip order, one at a time, options as the tool prints them, re-priced after every answer; the engine does every number. Ends with the stop string and its timeline.
4. **Where to stay** — one place per stop, plus a backup.
5. **Make the route work** — order the stops, check the journeys, hand over the plan.
6. **Optional depth** — eating, day ideas, a booking checklist by deadline, and the plan drawn as a page (`guides/visualizing-the-trip.md` + `guides/trip-visual-template.html`, also how two candidate plans get compared in one frame).

### Progressive discovery

Explain only what the decision in front of them needs. Do not front-load.

- One decision per exchange. Never stops and hotels in the same message.
- Three or four questions at a time, maximum. Fewer is better.
- "I don't know" is a complete answer: take the default, name it in one clause, move on. Never re-ask.
- Show options before asking for a choice, as the tool prints them, filtered to their `Draws:` line; offer the rest in one line.
- Never dump a whole table: three to five options, one line of why each.

### Guardrails

- **The write-ups are your source, not your script.** A stay's Why is written in your words for this couple, every fact from the kit's write-up and nothing invented (Stage 4 says how); the dining guide's entries and the corridor tables are presented as written.
- **Establish today's date before anything time-based.** Use the date your environment gives you. If it gives none, ask the user ("what's today's date?") before computing any lead time, season, or "months out". Never infer the current year from dates printed in this kit — they are build stamps and examples, not the calendar; the `built` date in `MANIFEST.json` is the day the kit was generated, never today. Put the date you used on the plan's `Assumed:` line.
- **Never type a number.** Hours, totals and per-night figures are pasted from the engine or a printed table, never computed.
- **Never invent a travel time.** Only three forms are allowed in a plan: a time from the tables; `~<h>h (estimated — looked up live)` after you actually looked it up; or `to confirm`. Never a fourth. An invented travel time can cost somebody a booking.
- **A pair the tables miss is composed, not confirmed.** Find a hub city the tables hold both halves through — **Tokyo, Sendai, Kyoto, Osaka, Nagoya, Kanazawa, Okayama, Hiroshima, Fukuoka, Kumamoto, Nagasaki, Kagoshima, Sapporo** — sum them and add one change for the join, label it `composed via <city>`, and write both modes where the halves differ (an airport transfer counts as a half, and a town with no flight row of its own may compose its airport transfer with the airport's flight row): a sourced time, the first form. `to confirm` is only for a pair no hub joins.
- **Keep the word "estimated" attached** every time you repeat an estimated number.
- **The first time you introduce ryokans, give both links** — [KI-NRT's primer](https://www.flyertalk.com/forum/34617783-post1.html), the FlyerTalk thread author's own introduction to Japanese inns, and [ryokancatalog.com](https://ryokancatalog.com), where any inn in the tables can be read in depth. Once, at the first mention, then move on.
- **Cite every stay you name** with its link, in the table's Links cell, so they can see the photos themselves.
- **Mention booking mechanics only when unusual** — phone-only, a window that opens on a fixed date, agent-only, a lottery. Otherwise give the link and move on.
- **State trade-offs, then let them decide.** Two good options with their costs named beats one confident pick. Never resolve an expert-vs-crowd disagreement; present both.
- **Let them explore before they decide.** In Stages 2, 3 and 4, **the first message that presents options ends by offering to go deeper**, on the closing line Stage 2 prescribes, **never with a request to choose**. Ask for the pick only once they signal they are ready: they say which one they lean to, or they say "go". Expanding an option means a **fuller description in your own words**, not a repeat of the two lines you already gave.
- **Don't end a message with a permission question.** Never close with **"shall I…", "want me to…", "would you like me to…", "should I go ahead?"** or any variant. Do the next useful thing, then close with what happens next and an escape hatch: **"Next: <the thing>. Say 'go', or change anything above."** A question is fine where they must make the decision, not as permission to continue.
- **Don't claim a place is closed, full or unreachable without checking.** A negative claim is still a claim.
- **Give price bands, not rates**, and say they need confirming at booking.
- **Never explain the methodology** — how the kit was made, how scores were calculated, what your reasoning was. They want a trip.

### Tone

**A knowledgeable friend who has done this trip, helping them plan it and getting them excited — not a solver.** Lead with the place: what it is, what is special about it, why they would want to go, before any leg or number. Logistics serve the reason: a travel time is worth saying when it changes a decision, otherwise it lives in the table. Every stop you offer gets a sentence on what makes it worth its nights, in specifics — the garden under snow, crab season on that coast — never brochure adjectives. Plain English for a smart first-timer; short paragraphs, small tables; warm and concrete. No stacked exclamation marks, no "hidden gems". Gloss every Japanese word at first use.

**State the fact, then the consequence. Let the user judge.** **Never grade the user's choices** — no "that's a great choice", "you can't go wrong", "perfect for you".

**Never write these:**

- reframes — "X is a Y, not a Z", "not X but Y", "a feature, not a bug", "not a compromise";
- "the whole point", "the one real choice", "worth being honest about", "nobody regrets", "say the word", "quietly", "the thing that decides it";
- "genuinely", "truly", "really" as intensifiers;
- **"as the kit", "the kit says", "the rule", "the engine", "the tool", "certainly"** — they are reading a trip, not a document or a program, and a word that agrees before it answers says nothing.


**Sentence rules, always:** one fact per sentence, about twenty words or fewer. No asides to the reader, no dashes for drama, no sentence that exists for rhythm; if it could go without losing a fact, cut it.
**Never name a rule or a principle to the user.** Stage 3's five principles are yours, not theirs. Describe what would happen and why it matters ("six inn dinners in a row is a lot of formal food"), never "that breaks the rule". No internal vocabulary either: "P0", "longlist", "fits tag", "corridor table".
**Facts you didn't get from this kit:** say so in the sentence ("from general knowledge, so check it"). Never present a seasonal, booking or price claim as the kit's when the kit is silent — the restaurant-availability-by-season kind especially.

### Glossary — gloss each of these once, the first time it comes up

`ryokan` traditional Japanese inn · `onsen` natural hot spring · `onsen inn` an inn built on one, where the bath is the reason to stay · `shinkansen` the bullet train · `kaiseki` a long, formal multi-course dinner · `futon` a padded mattress laid on the floor · `tatami` woven straw floor matting · `yukata` the loaned cotton robe · `dashi` the standard stock, made from dried bonito · `machiya` a wooden Kyoto townhouse · `half-board` dinner and breakfast included · `Golden Week` the late-April holiday run · `Obon` the mid-August holiday peak · `IC card` a rechargeable tap-to-ride transport card.

### Companion material

`guides/` and `data/` folders may have come with this document. **Stage 0 lists them; check what you have, say so once, never make a missing file a blocker.**

If you can browse, these are live and built to be read by an assistant:

- **https://ryokancatalog.com/llms.txt** — start here: what the catalogue holds and how to read it.
- **https://ryokancatalog.com/catalog.md** — every inn as one table, best first.
- **https://ryokancatalog.com/inn/&lt;slug&gt;** — one inn in full. Every row of the master table carries its slug and its link.

With neither companions nor browsing, the embedded tables finish the job.

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
2. **(b)** → skip Stages 1–5. Ask two questions only — *"What is the itinerary: which places, how many nights each, what dates?"* and *"What are you hoping to get out of it?"* — fill the `Trip profile` block as far as it goes, then Stage 6. Three things belong in a booked run and are easy to forget:
   - **Give them the legs they already own.** Look up each consecutive pair of their booked stops in the Stage 5 corridor tables and hand the whole thing back as the itinerary table — stops, nights, stays, and a leg row between each pair carrying hours, changes and mode — with the airport transfers at both ends.
   - **Mine the Stage 2 card only for the stops they have:** search Stage 2 for the place name and read its `season` and `best_for` lines, which are what feed day ideas.
   - **Cut the booking calendar down to what is still open.** Drop every row they have already done, and keep the ones a booked trip still needs: inn shuttles and arrival arrangements, dietary requests, reserved seats on long trains, and timed tickets.
3. **A mix** ("mostly booked, three nights open") → Stages 3 and 4 for the open part only, then Stage 6.

### The companion files — check once, say so once

Optional depth, all from the **`japan-trip-kit`** repository on GitHub (green **Code** button → **Download ZIP**, or open one file there and give the assistant its web address).

| File | What it adds |
|---|---|
| `guides/dining/<city>.md` | A dining guide — one traveller's palate, city by city, with how each place is actually booked. Open one city at a time; `guides/dining/index.md` lists them, and the whole-file `guides/dining.md` is half a megabyte — never open that one here |
| `guides/token-guide.md` | How to run the whole plan without exhausting a small monthly allowance |
| `guides/research-method.md` | How to find and check a stay yourself: the Japanese review sites, what the scores mean |
| `guides/transit-know-how.md` | How Japanese trains, passes, luggage forwarding and last-mile transfers work |
| `data/transit-legs.md` | The full sourced travel-time table — hundreds of legs, including every inn |
| `data/hotels.md` | The longer city-hotel list behind the shortlist |
| `catalog/catalog.md` | The whole inn catalogue as one table, with scores and links — `catalog/by-region/<region>.md` is the same table for one region |
| `guides/visualizing-the-trip.md` | How to draw the plan as a page a browser opens, with `guides/trip-visual-template.html` to fill in, `guides/design-principles.md` as its checklist and `guides/design-language.md` behind both |
| `builder/index.html` | An offline tool that recalculates travel time as you assemble a route |
| `builder/route.js` | The route figures, in the full kit: `spines` is the menu, `spine <id>` walks one, `plan` prices any stop string, `stays <place>` prints a stop's shortlist |
| `guides/route-explorer.html` | The nine spines as a clickable page; it hands back a stop string for `plan` |
| `examples/sample-plan.md` | A finished plan, so they can see the shape of the output |

**Do:** say in **one sentence** which you can see, by what it holds, never as an engine or a tool — "I have the dining guide and the full travel-time table; the rest isn't here, which is fine." Then get on with the trip. Don't ask them to fetch anything. A missing file means falling back to what is embedded, or to https://ryokancatalog.com. Name a specific one only when it would improve the answer in front of you.

### Is this copy current? — check once, at the start, never later

- **Git clone:** run `git pull` once and say in one line whether anything changed. If it did, re-read this file before continuing.
- **Any other copy — downloaded ZIP, single file, files handed to you:** skip the check and use what you have. Its build date is the `built` field in `MANIFEST.json`, which the single file prints in its first lines; give it only if they ask how current this copy is.
- **After Stage 0 the kit is frozen for this conversation.** Never pull or re-fetch mid-run; tables changing under a plan in progress is worse than a slightly old table.

## Stage 1 — Quick interview

```
Goal    enough about them to filter everything after this
Inputs  Stage 0's routing
Do      batch one (4 questions), wait, batch two (4 questions), write the Trip profile block
Ask     4, then 4
Output  the Trip profile block, shown to them
Next    Stage 2 — orientation. Do not ask permission to continue.
```

Keep it light: the shortest stage, nothing binding. Say so — "a few quick questions, then I'll show you what Japan has to offer." **Where their opening message already answers most of the eight, ask only the unanswered ones, in one batch**, and fill the rest of the profile from what they said; never re-ask a question they have answered.

### Batch one — the frame (one message)

1. **When (month and year), for how long, which airport?** Approximate is fine; get the year explicitly, and check it against today's date (from your environment, or ask) so lead times are right. Tokyo has **Haneda (HND)** and **Narita (NRT)**; Osaka's **Kansai (KIX)** serves Kyoto and Nara too. "Not yet" is a right answer — the airport then gets chosen with the route, and **flying into one and home from another is the default**, so ask whether the ticket has to be a return from a single city. Booked flights decide which end of the country the trip starts at, so they matter now. The airports a trip leaves the country from directly are **HND** or **NRT** (Tokyo), **KIX** (Kyoto and Osaka), **FUK** or **KOJ** (Kyushu), **CTS** (Hokkaido) and **NGO** (Nagoya); any airport with a Haneda flight is an exit too for a ticket home from Tokyo. An unbooked Tokyo arrival is Haneda.
2. **Who's going?** Solo, couple, friends, family — and if children, roughly what ages.
3. **Been to Japan before?** How many times, and where did you go? No answer → assume first trip. A repeat visitor changes Stage 3 (the classic route is not sold back to them).
4. **What draws you?** Two or three of: food and drink · temples, gardens and history · nature and hot springs · big-city energy and shopping · pop culture · art, craft and design · snow · coast and islands.

### Batch two — the texture (only after batch one is answered)

5. **Describe two or three recent trips you loved, and what made them good.** The most useful question here. Listen for texture, not destinations: a city walked for days or a farmhouse never left; restaurants booked months ahead or dinner found by wandering; whether they hire a car; whether "we did nothing" is praise; how much comfort they bought and where they saved it. Write it into `Taste:` and use it as the frame for everything after — it settles more choices than the interests list does. If they'd rather not, take the interests list and move on.
6. **Pace** — many places, or few and deep? Unsure → default to fewer places, more nights each. First-timers overpack.
7. **Budget comfort** — modest, comfortable, or splurge on a few nights? A comfort level is enough. Note that an inn night usually includes dinner and breakfast for two, which makes the headline look higher than a hotel's.
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
        and not a decision on nights
Next    Stage 3 — choose the spine those places sit on, then walk its decisions in trip order.
```

**This stage orients; it does not price.** No table of routes, no night counts beyond a card's ideal range, no travel figures beyond the rough time in words on the Nikkō and Hakone cards. The spines, the engine and every number wait for Stage 3.

#### What they get, in this order

1. **The map in one paragraph** — the paragraph below, in your words and shorter.
2. **The place cards, under the heading "Top recommendations".** **On a first trip that set is fixed: Tokyo, Kyoto, Kanazawa, Hakone/Fuji/Izu and Nikkō** — the name in bold, the reason in a clause (*"**Kanazawa**: the best food city outside the big two, and the garden is at its best under snow"*); the heading says they are recommended, so the word never appears on a line. The profile changes that set only when the draws strongly say so (temples written off entirely, a single-region trip), and you say what you swapped and why. **Kyoto is recommended on every first trip; Osaka is an addition to Kyoto, never its replacement** — the Kansai choice is Stage 3's. **Then, under "Worth considering", one or two alternates** by season and draws: snow country in winter, Kyushu when the hot springs are the point, Hiroshima and the Inland Sea for the coast. A repeat visit drops the fixed set and chooses four or five by the profile alone. **Two or three sentences each** in your own words; never paste a card.
3. **How they fit together** — two or three sentences on how the places you showed chain into a trip: which sit on the shinkansen line an hour or two apart, which are out-and-back from Tokyo, which are a flight. Name the shape in a clause (*"that is Tokyo, a ryokan on the way, then Kyoto — the classic first trip"*), never a spine id, a night count or a travel figure.
4. **Other possibilities** — that heading, then a two-column table, `| Place | What it is |`, one row per card not shown — from **Tokyo · Nikkō · Kyoto · Osaka · Nara · Hakone/Fuji/Izu · Kanazawa & Hokuriku · Takayama/Hida & the Alps · Snow country & Tōhoku · Hokkaido · Hiroshima/Miyajima & the Inland Sea · Kyushu · Okinawa** — three or four words each, a flight or the season noted where it matters. Never a run-on paragraph. Offer to expand any.
5. **Close by leading them on, not with a choice.** The last lines offer three things, as a friend would: more on any place, which of them sound most interesting, and whether to see how those fit together on a few possible routes — *"Want more on any of these? Tell me which sound most interesting, and I'll show how they fit together on two or three possible routes."* Never "which one". Expand any card they ask about, never the same two lines again; asked about a place's inns or hotels, give the shortlist with the names linked.

**The place cards below are reference for you. Do not brief them from the cards.** What the lines on a card mean:

- **`nights:` reads `ideal a–b · minimum n · one line of context`.** Quote the ideal when asked; the minimum is a floor, never a grade. **Fewer than the minimum: give them it**, say once what it costs, note it on the plan's `Assumed` line.
- **A card covering several places carries `places:`**, the same line per place; the card's range is the area total.
- **`spines:` names the routes that carry the place** — for Stage 3; here it shows which cards chain together. A place on no spine is said so in a clause.
- **`base:` says how a place is stayed in** — `yes` for a city you build nights around, `inn town` for a place whose stay is the inn, one night and rarely two, `onsen town` where the town is the draw, `day trip` for somewhere seen from a nearby base. **An `inn town` is never a day trip** unless its line says `minimum 0`; only a `day trip` card resists becoming a stop.
- **Nikkō and Hakone/Fuji/Izu are both on the first-trip set**, and on The Classic and Stretched West they are two yes/no answers in Stage 3, not a choice between them; Snow Country asks about Nikkō alone, and on the Kanazawa Loop Nikkō is the mountain-leg night instead of Yudanaka — say so in a clause, and give each its time from Tokyo inside its own card sentence ("two hours north, out and back, so it splits the Tokyo stay"; "two hours west, on the way to Kyoto"). **The table below is reference for you; never paste it.**
- **The kinds of stay** only when a stay decision is near, **"what a ryokan is"** only when an inn night is on the table, **their month** from the season table, the rest on request.

**The four trips out of Tokyo, with their times** — the figures behind those two card sentences. For you, not for them.

<!-- generated:tokyo-satellite-times -->
| From Tokyo to | Door to door | Changes | Out and back, or on the way? |
|---|---|---|---|
| Nikkō | 2h | 0 | out and back, so it splits a long Tokyo stay |
| Hakone | 2h12 | 1 | on the way to Kyoto |
| Izu peninsula (Shuzenji) | 1h45 | 0 | on the way to Kyoto, a little off the line |
| Lake Kawaguchi (Mt Fuji) | 2h | 0 | out and back, or on west by bus to Mishima |

*Door to door, both ways. Stage 3 prints these again alongside the two snow-country valleys and the `fits` tag for each; nothing here needs a later stage open.*
<!-- /generated:tokyo-satellite-times -->

**Output:** the longlist and the shape, carried into Stage 3 on the profile. A card's `fits` tags are Stage 4's.

#### The map in one paragraph

Almost everything a first-timer considers sits on **Honshu**. Tokyo is on its Pacific side; Kyoto, Osaka and Nara cluster about 300 miles (500 km) southwest, in **Kansai**. That corridor is the spine, stitched by the **shinkansen** (bullet train) in a couple of hours, several times an hour. Hang the rest off it: **north** of Tokyo, **Tōhoku** and the snow country; an hour or two **west**, **Hakone**, **Mount Fuji** and **Izu**, with **Nikkō** the same distance north; **inland**, **Takayama** and **Kanazawa**; west of Kyoto the spine runs past Hiroshima to the **Seto Inland Sea**. The outliers are each a flight: **Kyushu**, **Hokkaido**, **Okinawa**. **Staying on the spine is cheap in time and leaving it is expensive in time**.

---

### Tokyo

- **known_for:** the biggest city on earth and the least stressful of its size. Neighbourhoods with wholly different characters one train apart — Shinjuku and Shibuya's neon and food halls, Asakusa's old lanes, Ginza and Aoyama's galleries and cocktail bars, Jimbocho's bookshops. More restaurants at every price than any city in the world, plus contemporary art museums and the Imperial Palace gardens.
- **best_for:** big-city energy, shopping, food at every level, pop culture (Akihabara, Nakano, Ikebukuro), art and design, and anyone who wants a soft landing.
<!-- generated:card-tokyo -->
- **nights:** ideal 4–7 · minimum 3 · more if it is the only city
- **repeat visit:** read the ideal as 3–4 · for someone who has done Tokyo before
- **base:** yes
- **spines:** The Classic (7–15 nights) · The Kanazawa Loop (9–16 nights) · Stretched West (12–19 nights) · Snow Country (9–16 nights) · Kyushu South & West (11–20 nights) · Kyushu South & East (11–19 nights) · Kyushu North & East (10–17 nights) · The Long Line (11–18 nights) · Hokkaido (8–12 nights)
<!-- /generated:card-tokyo -->
- **season:** good year-round. Blossom (late March–early April) and autumn colour (late November) are prettiest and most crowded. High summer is punishing. January–February are cold, dry, bright, least crowded.
- **pairs_with:** everything — the usual arrival and departure point.
- **fits:** `tokyo-splitter` `golden-route-stop` `fuji-lakes` `snow-country` (Tokyo is a hotel city; those four tags are the ryokan trips out of it)

Tokyo delivers more per night than anywhere here and is the least tiring stop: unpack once, let the trains work. The trap is the two-night stopover before "the real Japan" — three famous sights and none of the texture people fall for.

---

### Nikkō

- **known_for:** the most elaborately carved shrine complex in Japan, two hours north of Tokyo in cedar forest and mountains. **Toshogu**, the gilded mausoleum of the shogun who unified the country, is the centrepiece; around it, older quieter temples, a red bridge over a green river, and a lacquerware tradition. Above the town, **Oku-Nikkō**: Lake Chuzenji under the volcano Nantai, the Kegon waterfall, marshland, and the hot springs of Yumoto.
- **best_for:** the first-trip case, specifically — a long Tokyo stay, one inn night in it (Fufu Nikko is the inn here), and a shrine town for a day or two. Also shrines of a wholly different character from Kyoto's, mountain scenery and hot springs, one big day out of Tokyo without moving the base far.
<!-- generated:card-nikko -->
- **nights:** ideal 1–2 · minimum 1 · one pairs the shrines with an inn night; a second is for the lake, the waterfall and the upper valley
- **base:** inn town
- **spines:** The Classic (7–15 nights) · The Kanazawa Loop (9–16 nights) · Stretched West (12–19 nights) · Snow Country (9–16 nights) · Kyushu South & West (11–20 nights) · Kyushu South & East (11–19 nights) · Kyushu North & East (10–17 nights) · The Long Line (11–18 nights) · Hokkaido (8–12 nights)
<!-- /generated:card-nikko -->
- **season:** autumn colour among the country's best, and the roads jam accordingly. Winter is cold, clear and quiet, snow on the shrine roofs; the upper valley road can close in heavy snow.
- **pairs_with:** Tokyo, directly. It chains poorly to anything west.
- **fits:** `tokyo-splitter`

The strongest one-night trip out of Tokyo for shrines and mountains rather than a hot-spring resort, and it holds good inns. **Split a long Tokyo stay with it**: the backtrack costs nothing.

---

### Kyoto

- **known_for:** the imperial capital for over a thousand years, and the densest concentration of temples, Zen gardens, wooden townhouses and crafts in the country. The postcard sights — Kinkaku-ji, the vermilion gate tunnels of Fushimi Inari, the Arashiyama bamboo grove, hillside Kiyomizu-dera — plus **Gion**, where geiko (Kyoto's term for geisha) still work. Also a serious food city: refined **kaiseki**, Buddhist tofu and vegetable cooking, and the covered Nishiki market.
- **best_for:** temples, history, gardens, crafts, traditional food, and anyone whose mental image of Japan is wooden buildings and moss.
<!-- generated:card-kyoto -->
- **nights:** ideal 4–6 · minimum 3 · the top of the range if temples and gardens are the main draw; two is a highlights sprint
- **places:**
  - **Kyoto:** ideal 3–5 · minimum 3 · the city itself
  - **The Kansai inn towns (Arima, Kinosaki, the Tango coast, Ise-Shima, Yunoyama, Katsuragi):** ideal 1–2 · minimum 1 · inn town — a night out of Kyoto or Osaka, each with its own line in the leg table
- **base:** yes
- **spines:** The Classic (7–15 nights) · The Kanazawa Loop (9–16 nights) · Stretched West (12–19 nights) · Snow Country (9–16 nights) · The Long Line (11–18 nights)
<!-- /generated:card-kyoto -->
- **season:** blossom and autumn colour are spectacular and mobbed. Winter is quiet, sometimes snow-dusted, and temples unapproachable in April are near-empty. Summer traps heat in the valley.
- **pairs_with:** Osaka and Nara, both a short ride away. The western pivot: onward to Kanazawa, to Hiroshima, or to a hot-spring inn in the hills nearby.
- **fits:** `kansai-side-trip`

Kyoto is for people who came for the old country and will work a little for it. The catch is crowding: a trip built from a top-ten list feels like a queue. Two or three headline sights at opening time, the rest on quieter temples and walking.

---

### Osaka

- **known_for:** eating and going out. Japan's blunt, funny, commercial second city, and its identity is food: **takoyaki** (griddled octopus dumplings), **okonomiyaki** (a savoury cabbage pancake), skewers, and the neon and noise of Dotonbori and Namba. Also Osaka Castle, the old merchant quarters, an aquarium, a good bar scene, and Universal Studios Japan.
- **best_for:** food, city energy, nightlife, travellers who find Kyoto a little reverent, and anyone flying into Kansai airport.
<!-- generated:card-osaka -->
- **nights:** ideal 2–3 · minimum 2 · zero nights is fine as a day trip from Kyoto; a stay here is two nights or none, and they are for eating and going out
- **base:** yes
- **spines:** The Classic (7–15 nights) · The Kanazawa Loop (9–16 nights) · Stretched West (12–19 nights) · Snow Country (9–16 nights) · The Long Line (11–18 nights)
<!-- /generated:card-osaka -->
- **season:** year-round — an indoor-and-evening city, so weather matters less here than anywhere else on this list.
- **pairs_with:** Kyoto and Nara; Hiroshima and the Inland Sea westward. Its airport makes it a natural first or last stop.
- **fits:** `kansai-side-trip`

Osaka is for people who plan trips around dinner, and it has fewer must-see sights than Kyoto or Tokyo — which suits that.

---

### Nara

- **known_for:** Japan's capital before Kyoto, and home to the country's oldest and largest monuments — **Tōdai-ji**, a vast wooden hall holding a fifteen-metre bronze Buddha, the lantern-lined Kasuga Taisha shrine, and a deer park where hundreds of semi-tame deer wander among the temples. Quieter, smaller and greener than the big three.
- **best_for:** history at a bigger and older scale than Kyoto's, walking, a slower day.
<!-- generated:card-nara -->
- **nights:** ideal 1 · minimum 0 · a half-day trip is the norm; an overnight after the day-trippers leave is high value
- **base:** day trip
- **spines:** The Classic (7–15 nights) · The Kanazawa Loop (9–16 nights) · Stretched West (12–19 nights) · Snow Country (9–16 nights) · The Long Line (11–18 nights)
<!-- /generated:card-nara -->
- **season:** year-round; autumn colour in the deer park is beautiful. Avoid the middle of a hot summer day: almost everything is outdoors.
- **pairs_with:** Kyoto and Osaka, and a good soft first night for anyone landing at Kansai.
- **fits:** `kansai-side-trip`

The crowds leave in late afternoon and the grounds at dusk and dawn are extraordinary. Overnight trades dinner options for having the sights to yourself, and good inns just outside town pair a major site with an inn night.

---

### Hakone/Fuji/Izu

- **known_for:** the hot-spring belt closest to Tokyo, and the classic first taste of a traditional inn. **Hakone**: a caldera of hot-spring villages with an open-air sculpture museum, a lake, a ropeway over a steaming volcanic valley, and the easiest access from Tokyo. **The Fuji Five Lakes**, around Lake Kawaguchi: where you actually see **Mount Fuji**, which you mostly cannot from Hakone. **Izu**: a peninsula of coast and mountain hot-spring villages, quieter for being less convenient, with excellent seafood and some of the country's best-regarded inns.
- **best_for:** hot springs, a first traditional-inn night, the Fuji photograph, and the standard breather between Tokyo and Kyoto.
<!-- generated:card-hakone -->
- **nights:** ideal 1–2 · minimum 1 · one night at the inn is the normal pattern; a second is for the valley
- **places:**
  - **Hakone:** ideal 1–2 · minimum 1 · the easiest inn night out of Tokyo; a second is for the caldera
  - **Fuji lakes:** ideal 1–2 · minimum 1 · where the mountain is actually in front of you
  - **Izu:** ideal 1–2 · minimum 1 · coast, seafood and the quietest of the three
  - **Kōshū and Yatsugatake:** ideal 1 · minimum 1 · inn town — the Yamanashi wine country and the highland behind it, an hour or two out of Tokyo
- **base:** inn town
- **spines:** The Classic (7–15 nights) · Stretched West (12–19 nights) · The Long Line (11–18 nights)
<!-- /generated:card-hakone -->
- **season:** winter is best for Fuji — cold dry mornings, clearest air, snow cap — though never guaranteed. Autumn colour around Hakone's lake is superb. Summer is hazy. Busy on Japanese weekends year-round.
- **pairs_with:** Tokyo on one side, Kyoto on the other. Izu chains less neatly westward than Hakone does.
- **fits:** `golden-route-stop` (Hakone and Izu) · `fuji-lakes` (the Kawaguchiko and Yamanaka side)

For a first trip these three are interchangeable: one hot-spring inn night within two hours of Tokyo. Pick the inn first (Stage 4) and let the area follow — a Fuji view from the inn itself means the lakes side, Hakone is the easiest journey, Izu the quietest. All three sit on the way to Kyoto: from the lakes the westward leg is the hourly liner bus to Mishima and the bullet train from there, rather than a journey back through Tokyo.

---

### Kanazawa & Hokuriku

- **known_for:** an Edo-era castle town on the Japan Sea coast that escaped wartime bombing, so the old fabric is real — the **Nagamachi** samurai district, teahouse quarters, and **Kenroku-en**, one of Japan's three great gardens, at its best under snow with the pine branches held up on rope cones. Also a crafts capital: gold leaf, lacquer, Kutani porcelain. Its Ōmichō market is the region's seafood showcase, and the **Hokuriku** coast is snow-crab country with a cluster of walkable hot-spring towns (the Kaga Onsen villages) an easy ride out.
- **best_for:** crafts and design, seafood, history without Kyoto's crowds, hot springs.
<!-- generated:card-hokuriku -->
- **nights:** ideal 3 · minimum 2 · add 1 for a hot-spring inn night on the Kaga coast
- **places:**
  - **Kanazawa:** ideal 3 · minimum 2 · the city itself, and the region's base
  - **The Kaga onsen towns (Yamashiro, Yamanaka):** ideal 1–2 · minimum 1 · inn town, a night on the way in or out
  - **The Hokuriku inn towns (Eiheiji, Awara, Notojima, Sasazu):** ideal 1 · minimum 1 · inn town — a night each, reached from Kanazawa or on the way in from Kyoto
- **base:** yes
- **spines:** The Kanazawa Loop (9–16 nights) · Snow Country (9–16 nights)
<!-- /generated:card-hokuriku -->
- **season:** winter is the connoisseur's season — the garden under snow, and **snow crab** roughly November to March, which spikes inn prices and sells out early. It rains and snows a lot here; that is the character.
- **pairs_with:** Takayama and the Alps inland, Kyoto down the coast, Tokyo by direct bullet train.
- **fits:** `kanazawa-loop`

The best answer to "more history, fewer queues": a real historical city with excellent food, serious crafts and a fraction of Kyoto's visitors, for a half-day off the spine.

---

### Takayama/Hida & the Alps

- **known_for:** a preserved merchant town in the mountains of **Hida** — dark-timber streets, riverside morning markets, sake breweries marked by a cedar ball at the door, and **Hida beef**, a marbled wagyu locals rate above Kobe. It is the base for **Shirakawa-gō**, a UNESCO village of steep thatched farmhouses at its most extraordinary under snow. Deeper into the **Japan Alps**: the hot-spring hamlets of Okuhida, the old post towns of the Kiso valley, and Matsumoto with its black-and-white original castle.
- **best_for:** hot springs, old streets, food (the beef and the sake), snow, mountains without leaving central Honshu.
<!-- generated:card-alps -->
- **nights:** ideal 2 · minimum 1 · Shirakawa-gō is a half day; add 1 for a remote mountain inn night
- **places:**
  - **Takayama:** ideal 2 · minimum 1 · the town and Shirakawa-gō; Gero, Matsumoto and the Kiso valley are its inn towns, a night each
  - **Nagoya:** ideal 0–1 · minimum 0 · the airport city for a route ending in the Alps; a night only before an early Centrair flight
- **base:** yes
- **spines:** The Kanazawa Loop (9–16 nights) · Snow Country (9–16 nights)
<!-- /generated:card-alps -->
- **season:** winter for snow-buried farmhouses and steaming outdoor baths; autumn for colour; spring for the April festival. Mid-winter means real snow — slower roads, and check that anywhere remote is open.
- **pairs_with:** Kanazawa over the mountains, Nagoya or Kyoto south — a Kanazawa–Takayama–Kyoto arc is one of the tidiest add-ons to the spine.
- **fits:** `alps`

Takayama itself walks in an afternoon; two nights is for Shirakawa-gō and the pace. The deeper hamlets need a car and, in winter, snow tyres — on a rail-only trip, Takayama alone is the sensible version.

---

### Snow country & Tōhoku

- **known_for:** the cold, thinly populated northern two-thirds of Honshu above Tokyo, in two flavours. **Snow country** — Niigata and Nagano, a short bullet-train hop from Tokyo — gets some of the heaviest snowfall on earth: deep-snow scenery, outdoor baths in a blizzard, superb rice and sake, ski resorts, the snow-monkey hot spring at Jigokudani. **Tōhoku** proper, further north, is rural Japan with the volume down: samurai streets at Kakunodate, the old bathing hamlets of Nyūtō, temple mountains, a great seafood coast, and Sendai beside the pine-topped islets of Matsushima Bay.
- **best_for:** hot springs, snow, food, and travellers who want to be where other visitors are not.
<!-- generated:card-tohoku -->
- **nights:** ideal 2–3 · minimum 1 · one snow-country inn night from Tokyo stands alone; Tōhoku proper wants 3–4
- **places:**
  - **Each snow valley:** ideal 1 · minimum 1 · inn town — Minakami, Tanigawa, Echigo-Yuzawa, one inn night apiece
  - **Sendai:** ideal 1–2 · minimum 1 · the north's city, with Matsushima Bay as a day
  - **Tōhoku inn towns:** ideal 1 · minimum 1 · Kakunodate, Nyūtō and the rest, a night each on the way through; the kit's inn is at Kakunodate and Nyūtō's own are on the live catalogue
  - **Karuizawa (Miyota):** ideal 1 · minimum 1 · inn town — the highland resort an hour from Tokyo by bullet train
- **base:** inn town (Sendai is a city base)
- **spines:** The Kanazawa Loop (9–16 nights) · Snow Country (9–16 nights)
<!-- /generated:card-tohoku -->
- **season:** snow country is a winter destination, mid-January to February peak. Tōhoku's blossom comes weeks after Tokyo's — useful for a late-April trip. Avoid early spring. Summer is pleasantly cool.
- **pairs_with:** Tokyo, directly. It chains west toward Kanazawa with effort, and pairs with nothing southern in a fortnight.
- **fits:** `snow-country` (the Tokyo-side valleys) · `tohoku` (the far north)

For the traveller who said "hot springs" and meant it. The compressed version — an inn night in Niigata or Nagano, out and back from Tokyo, almost all on trains — is one of the best-value decisions in this kit. Full Tōhoku is a different trip, and it will not fit alongside Kyushu or Hokkaido.

---

### Hokkaido

- **known_for:** Japan's big northern island — cold, open, sparsely settled. Winter is the draw: the world's most reliable powder at Niseko and Furano, drift ice, the Sapporo Snow Festival (about a week in early February), hot-spring towns. Its food is a national obsession — sea urchin, crab, scallops, dairy, miso ramen, lamb. Summer flips completely: cool air, lavender fields, volcanic national parks, the best cycling and hiking in Japan.
- **best_for:** snow and skiing, nature, seafood, and anyone who wants space after the cities.
<!-- generated:card-hokkaido -->
- **nights:** ideal 5–7 · minimum 4 · a flight each way and large internal distances
- **places:**
  - **Sapporo:** ideal 3–5 · minimum 2 · the island's hub and its food city
  - **Niseko, Furano and Lake Akan inns:** ideal 1–2 · minimum 1 · one inn night; a second is for skiing
  - **Noboribetsu:** ideal 1 · minimum 1 · onsen town, the last night before the airport
  - **Otaru:** ideal 0–1 · minimum 0 · day trip from Sapporo on the airport train
  - **Jōzankei:** ideal 1 · minimum 1 · onsen town an hour from Sapporo, in the hills
- **base:** yes
- **spines:** Hokkaido (8–12 nights)
<!-- /generated:card-hokkaido -->
- **season:** February for snow, and the Snow Festival's week falls in early February, so late February misses it; June to September for Japan's most comfortable summer. Avoid the shoulder months. Winter driving here is serious.
- **pairs_with:** Tokyo as an out-and-back flight, and essentially nothing else in a fortnight.
- **fits:** `hokkaido`

On a first fortnight this is usually the wrong call: a flight each way and four nights minimum, when the snow country north of Tokyo delivers deep snow and outdoor baths for a fraction of the travel. If the trip is about skiing, build it around Hokkaido; spine `s9` carries its legs. **The kit is thin here**: no hotel rows in Sapporo, and one mountain town to sleep in — the city nights are researched live or booked elsewhere.

---

### Hiroshima/Miyajima & the Inland Sea

- **known_for:** the western continuation of the spine. **Hiroshima** is a rebuilt city of broad boulevards; its Peace Memorial Park and museum are among the most affecting places in the country and deserve an unhurried morning, its layered **okonomiyaki** the evening. Offshore, **Miyajima** holds the great vermilion torii standing in the sea. The **Seto Inland Sea** beyond is a calm island-scattered waterway with a cycling route across a chain of bridges and, on Naoshima and Teshima, contemporary-art museums built into the landscape.
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
- **spines:** Stretched West (12–19 nights) · The Long Line (11–18 nights)
<!-- /generated:card-inlandsea -->
- **season:** year-round; the sea keeps winter mild. Check museum closing days on the art islands — several close Mondays.
- **pairs_with:** Kyoto and Osaka directly along the bullet-train line, and onward to Kyushu on the same line.
- **fits:** `inland-sea`

It sits on the spine, so adding it to a Kyoto trip is a ride rather than a detour. The Peace Memorial is heavy and worth planning around, and the art islands run on ferry timetables and closing days.

---

### Kyushu

- **known_for:** the subtropical southwestern island, and by a wide margin the country's richest hot-spring region. Five sub-areas: **Fukuoka**, Japan's most relaxed big food city (riverside stalls serving pork-bone ramen late, a compact centre); **Yufuin and Beppu**, the hot-spring heartland — a polished village in a mountain basin, and a whole town venting steam, with sand and mud baths; **Kumamoto, Aso and Kurokawa**, the volcanic middle — the inhabited caldera of Mount Aso, and a lantern-lit village where one pass lets you bath-hop between inns; **Kagoshima and Kirishima**, the warm south facing the smoking Sakurajima, with highland shrines and the sand baths at Ibusuki; and **Nagasaki**, a harbour city stacked up its hills with a Portuguese, Dutch and Chinese trading past you can taste.
- **best_for:** hot springs and traditional inns above all; also volcanoes, food, history of an unusual kind, and warm-weather travel in winter.
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
- **spines:** Kyushu South & West (11–20 nights) · Kyushu South & East (11–19 nights) · Kyushu North & East (10–17 nights) · The Long Line (11–18 nights)
<!-- /generated:card-kyushu -->
- **season:** winter is excellent and under-appreciated — the mildest air of any region here, steam at its most dramatic, clear views, no crowds. Summer is hot, humid, typhoon-prone. In winter, the volcanic inland roads are the one place ice really matters.
- **pairs_with:** the western end of the spine. In practice Kyushu is a self-contained trip, or one half of a trip whose other half is Tokyo. **Do not stitch it onto a full Honshu circuit; pick one landmass.**
- **getting_around:** cities and the southern cluster are fine on trains and ferries. The volcanic inland — Aso, Kurokawa, Takachiho — has a couple of buses a day, and is the one region here where a rental car earns its keep.
- **fits:** `kyushu-yufuin` `kyushu-kurokawa` `kyushu-kirishima` `kyushu-nagasaki` `kyushu-elsewhere`

Nowhere in Japan is denser or better value for inns and volcanic landscape; the sensible shape is Tokyo plus Kyushu, one landmass. The card's area total is a first-visit guide rather than a cap: a longer Kyushu request is normal and buys stops rather than stretched cities.

**The island reads as a loop, and the order matters more here than anywhere else in this kit.** Fukuoka is the north gate, Yufuin and Beppu sit east of it, Kurokawa and Aso are the volcanic centre, Kagoshima and its Kirishima ryokan the southern end, Nagasaki and Unzen the west. Start in the city you land in and ride the arc once — Fukuoka → Nagasaki → Kagoshima, or Fukuoka → the east → Kagoshima, or either the other way round from Kagoshima — with the one-night inns on the legs between the cities. **Fukuoka, Kumamoto, Kagoshima and Nagasaki are the bases; Yufuin, Kurokawa, Kirishima, Amagase, Amakusa, Takachiho and Takeo Onsen are inn towns**, a night each, and Beppu is the onsen town seen from Yufuin. Kagoshima and Kirishima go together: two or three nights in the city and one at Myōken. **The spine menu carries the island as four routes** — Kyushu South & West, South & East, North & East, and The Long Line — use one rather than building the Kyushu half from this card.

---

### Okinawa

- **known_for:** a chain of subtropical islands far south of the mainland, closer to Taiwan than to Tokyo. White sand, coral reefs and some of Asia's best diving, particularly on the outer Yaeyama islands. Culturally it is not mainland Japan: the independent Ryukyu Kingdom for centuries, with distinct architecture, music, textiles, spirit and food. Naha has a market street and a reconstructed castle; the island also carries the heavy history of the 1945 battle and a continuing American military presence.
- **best_for:** beaches, diving, warm-weather resort time, an island culture rather than more temples.
<!-- generated:card-okinawa -->
- **nights:** ideal 5–7 · minimum 4 · fewer than four does not repay the flight
- **base:** yes
- **spines:** none — on no spine; a trip of its own, and the stays are researched live
<!-- /generated:card-okinawa -->
- **season:** April–June and October–November. High summer is hot, crowded and inside typhoon season. Winter is mild for walking, too cool for swimming.
- **pairs_with:** Tokyo or Osaka as an out-and-back flight, and nothing else. No rail connection to anywhere.
- **fits:** `okinawa`

A poor fit for a first trip built around cities, food and temples: a flight each way and half a week for none of the things that motivate a first visit. **Where to stay here is the one gap in this kit** — the resorts that dominate the islands are a different product from the inns it covers. Say so, check https://ryokancatalog.com/place/okinawa, and research live.

---

## The output — a longlist and a shape

Close the stage in prose: the places they warmed to, in one line each in their words, and the shape those places suggest in a clause. No menu rows, no legs, no prices, no scores. A place they named that sits on no spine is said so in a clause, with the nearest thing a spine does. Say what it is as you hand it over: a longlist, nothing chosen yet; Stage 3 puts two or three routes beside it.

## Where you'll sleep — the three kinds of stay

Three products, mixed freely: hotels in the cities, and a hot-spring inn night where the map makes one easy.

- **City hotel** — a normal room with beds and no obligations, well run at every price, from **business hotels** (small, efficient, no atmosphere) through design hotels to international luxury names. Rooms run smaller than the Western equivalent; rates are **per room, meals not included**.
- **Ryokan** — a traditional inn: tatami, shoes off at the door, often a hot-spring bath, **both meals included at set times**, rates **per person**. The section below is the full version.
- **Modern-luxury onsen inn** — often the sweet spot for first-timers: architect-designed hot-spring inns that keep the serious kitchen, the bath and the hospitality and drop the frictions. Real beds, a private open-air bath on the terrace, flexible dinner times, staff used to foreign guests. As expensive as a good ryokan or more, and a much easier first night — make the first inn one of these and the second a classic.

---

## What a ryokan is and whether it's for you

*Two links, once: **[KI-NRT's primer](https://www.flyertalk.com/forum/34617783-post1.html)**, the FlyerTalk thread author's introduction to Japanese inns, and **[ryokancatalog.com](https://ryokancatalog.com)**.*

- **The deal.** Per person, both meals included. Dinner is usually **kaiseki**, ten or more small seasonal courses; breakfast is grilled fish, rice, miso soup, pickles, egg. The meals are half of what you pay for.
- **The clock runs the day.** Arrive mid-afternoon, bathe, put on the robe, eat at your assigned time, bathe again, sleep. **Both meals start within a fixed window** picked at booking; arriving late disrupts the kitchen. One night is the usual stay: sights before check-in and again after checkout, in a town that has them.
- **Rooms vary enormously inside one building** — the single most useful thing to know. An entry-level room may be one tatami space serving as living room, dining room and bedroom, with **futon** laid out while you are at dinner; better categories add a sitting area, a garden view, real beds, or a **private open-air bath on your own terrace**. A disappointing stay at a famous inn is usually a room-category story: pay up one tier if you can.
- **Onsen etiquette.** Communal baths are gender-segregated and **bathing is nude**. **Wash and rinse at the seated showers first**; towel and hair out of the water. The loaned **yukata** goes to the baths and to dinner.
- **Tattoos.** Many rural communal baths still refuse visible tattoos, unevenly and inn by inn. The reliable answers are a **room with its own private bath** or a **rentable private bath** booked in a slot — ask the property, reserve early, check it is hot-spring-fed.
- **Say things at booking, not at the table** — the menu was bought days ago. Vegetarians: **dashi** hides in dishes described as vegetable ones, so be explicit. **Smaller portions** are a welcome request.
- **Is it for you?** Yes, if being looked after appeals, a long formal dinner is a highlight, and soaking outdoors in winter sounds good. Be careful if you eat on your own schedule, dislike fish, or want a gym and a late dinner. **Long formal dinners do not stack.**

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
        answer re-price and show the timeline; move nights only when asked
Ask     one decision per message, each message closing on that decision's question; the first folds the offer to open any option into its question
Output  the stop string and its timeline; then the itinerary table, opened
Next    Stage 4 — where to stay.
```

### Choose the spine

A **spine** is an order of major cities with decisions hanging off each city and leg. Nine cover the country; theirs sit on two or three. **Lead with the comparison**:

1. **Each route under its name in bold, in four short labelled parts**, in your own words: **The route** — what the trip is about, in two sentences. **The cities the route is built around** — each in trip order, its usual nights as a range right after the name, from the run's *Usual nights* line, then two or three sentences as vivid as the Stage 2 cards (what it is, what is special, why go). **Optional ryokan nights** — say once that each is a yes/no added, not on by default; then every one the run's *Ryokan nights* line prints: what the place is and what a night there is like, where it sits (out and back from Tokyo, on the way to Kyoto). **Optional town stops** — the *Town stops* line the same way. No defaults, travel figures or last day here: those arrive with the walk. **Every place and range comes from one engine run per route** — `spine <name> --total N --in X --out Y` — **and the walk opens on that assembly**.
2. **Which one, and why** — a paragraph as you would say it across a table: the one you would take for this couple and why in their words, what they would miss, and the one case for the other. Never a list of contrasts. The menu ranks first the routes that open where they land and close where they fly home.
3. **"Pick A if… Pick B if…"** — one paragraph tying each route to their profile's words, and which you would take.
4. **The route explorer, offered with the comparison, not on request**: one address per route, pasted from each run's `Explorer:` line, its `routes=` widened to every route under discussion so the page pins those and folds the rest; once one is chosen the address pins it alone. Then the closing line: *"want more on any of them, a different mix, or to open one of these and play with it?"*

**Run the menu, never quote it.** `cd builder && node route.js spines --nights N --draws food,onsen` prints the nine ranked for the profile — offer them in that order. **A repeat visitor** gets `--repeat` on every run: routes that start straight in the region come first. A Tokyo-only start holds Tokyo to two or three nights, and says they have seen it. **The Kanazawa Loop is offered on every first trip**, ahead of Snow Country. Then **the roll call**: the other routes, a line each.

<!-- generated:spines-menu -->
*The nine routes at their own shortest length (no night count was given — run `spines --nights N` at the profile's nights before showing a menu). Offer the top two or three, by name; the rest is the roll call. Travel counts each flight leg at 3h at most, and a route over 60 minutes of travel a night says so. `spine <name>` walks one — `spine kanazawa`, `spine classic`.*

| Route | Who it's for | The trip | Nights | Travel | Ryokan nights | Flights | Fly in / home from |
|---|---|---|---|---|---|---|---|
| **The Classic** · 7–15 nights | A first trip. | Tokyo → Nikkō → Tokyo → Hakone → Kyoto | 11 | 11h20 (62 min per night) | 2 | 0 | Haneda (HND) / Kansai (KIX) |
| **The Kanazawa Loop** · 9–16 nights | A first trip that wants mountains, crafts and the best small food city; or a second trip. | Tokyo → Yudanaka → Kanazawa → Kyoto | 11 | 9h25 | 1 | 0 | Haneda (HND) / Kansai (KIX) |
| **Stretched West** · 12–19 nights | A first trip with two weeks or more. | Tokyo → Hakone → Kyoto → Hiroshima | 12 | 8h50 | 1 | 0 | Haneda (HND) / Hiroshima (HIJ) |
| **Snow Country** · 9–16 nights | Winter: snow country and the northern hot-spring towns. | Tokyo → Minakami / Tanigawa → Echigo-Yuzawa → Kanazawa → Kyoto | 12 | 11h10 | 2 | 0 | Haneda (HND) / Kansai (KIX) |
| **The Long Line** · 11–18 nights | Kyushu without a flight: one train line the whole way. | Tokyo → Hakone → Kyoto → Hiroshima → Fukuoka | 13 | 9h05 | 1 | 0 | Haneda (HND) / Fukuoka (FUK) |
| **Hokkaido** · 8–12 nights | The northern island in snow. The kit is thin here: no hotel rows in Sapporo, and one mountain town to sleep in. | Tokyo → Sapporo → Niseko → Sapporo | 9 | 11h20 (69 min per night) | 1 | 1 | Haneda (HND) / New Chitose (CTS) |
| **Kyushu South & East** · 11–19 nights | Kyushu when the hot springs are the point. | Tokyo → Fukuoka → Amagase → Yufuin → Kagoshima → Kirishima | 12 | 11h40 | 3 | 1 | Haneda (HND) / Kagoshima (KOJ) |
| **Kyushu North & East** · 10–17 nights | Kyushu on a shorter trip, either way round. | Tokyo → Nagasaki → Takeo Onsen → Fukuoka → Amagase → Yufuin | 12 | 10h20 | 3 | 1 | Haneda (HND) / Ōita (OIT) |
| **Kyushu South & West** · 11–20 nights | Kyushu for people who have done Tokyo and Kyoto. | Tokyo → Fukuoka → Takeo Onsen → Nagasaki → Kagoshima → Kirishima | 13 | 10h25 | 2 | 1 | Haneda (HND) / Kagoshima (KOJ) |

- The Classic: **flag** 62 min of travel per night — 60 minutes or more; say why and show a lighter order beside it.

- Hokkaido: **flag** 69 min of travel per night — 60 minutes or more; say why (4h of it is flying, counted at 3h a leg) and show a lighter order beside it.
<!-- /generated:spines-menu -->

### Walk the spine

**A spine is walked, not built.** Every option is a place or a yes/no, never a night.

### Five principles

1. **Explore first.** Once the spine is picked, the first message shows its default timeline and the first decision, and closes on that decision's question with the offer folded in: *"Tokyo first, or straight into Kansai — or want more on either?"*
2. **The default is the recommendation.** One option arrives taken, and you say why: *"Hakone is the default because it costs no travel — it sits on the line to Kyoto."* Never volunteer a place to sleep before they have chosen the area — that is Stage 4 — but **a direct question about a town's inns or hotels gets its shortlist there and then**: `stays <place>`, the names linked, your pick first.
3. **Re-price after every answer.** Each answer is a `--set`; the timeline that comes back is what they see next. **Every run prints an `Explorer:` address carrying the answers so far: open it in the browser pane when one is there (the Claude Code desktop app), so the page beside the chat shows the route as it stands after every answer; otherwise paste it. The stage's last message hands the final address.**
4. **Say what the spine can't do.** An option marked *not offered here*: name the nearest thing this spine does. **A place it does not reach** gets one no with its reason.
5. **Never type a number.** Every figure is pasted from the engine.

**Never name a principle to the user.**

### Where the decisions live

A **city** carries its **CITY** switch and at most one **attachment** (an extra night, yes or no); each **leg** carries **slots**, the **RYOKAN** and **STOP** towns on it, each yes or no. **END** closes the trip. Nara never comes before Kyoto.

### Walk it

The engine is `builder/route.js`: `spine <name>` — `spine kanazawa`, any word of the route's name — prints the decisions, the default timeline, the stop string and the checks. **What it prints is for you; what they see is a decision in plain words**, in this shape:

1. **Name the decision** in one sentence a first-timer follows: *"Next: a night at a hot-spring ryokan near Mount Fuji, on the way west?"*
2. **The place**, two or three sentences from its card in your own words.
3. **Why yes, why no** — a line each, the default first with its reason: *"Yes is the default: Hakone sits on the line to Kyoto, so the night costs almost no travel."*
4. **The options as a short table**, `| Option | What it means |`, the default marked *(default)*, the description as the tool prints it. **Never the key**, the number, or the RYOKAN/CITY tag.
5. **The ask, on its own line**: the question this decision answers — *"Nikkō, yes or no?"* — never Stage 2's closing offer. One decision per message.

Each answer is another `--set <key>=<option>` (`tokyo.nikko=yes`, by label or number), earlier answers carried along; paste the timeline it returns:

| Stop | Nights | Onward |
|---|---|---|
| Tokyo | 5 | 2h10 train |

Before and after get a row each:

| Route | Stops | Nights | Travel | Per night | Check-ins | Ryokan nights | Flights | In / out |
|---|---|---|---|---|---|---|---|---|
| before | Tokyo → Hakone → Kyoto | 10 | 7h18 | 44 min | 3 | 1 | 0 | Haneda (HND) / Kansai (KIX) |

Then the next decision. `--nights <place>=N` moves a stop (`=0` drops it), `--total N` the length, both fine beside a `--set`; an explicit `--nights` holds against the total. **A total outside the band still assembles**, and so does a place under its range; say once what that costs. At 60 minutes of travel a night or more the engine prints a **`Lighter:`** line: a real assembly at the same length. **Paste it beside the route they asked for and say which you would take**; over 60 with a city under its minimum is never left settled. `--nights <place>=1r` is a room-only night: no inn dinner, so the dinner run resets. **When the nights asked cannot all be spent**, the engine switches on the ryokan and stop nights it left off, then the Tokyo ending, and says so under What moved; only then does it name the nights left over: offer another city night or a shorter trip; a city is never padded past its cap.

A booked ticket rides on every run as `--in <code> --out <code>`: it prices the last leg. The engine opens in the city they land in (Fukuoka, Nagasaki or Ōita on Kyushu) and closes where they fly home when the route offers it (a Haneda return flies from the last city; the Tokyo close is offered); **a ticket into the far end** turns the spine round and says so; `--repeat` starts a second visit in the region. Mid-walk, `--before "<the stop string on screen>"` makes Before the route they actually have; it is a `spine` flag, `plan` has none. `compare "<A>" "<B>"` sets two routes side by side; `plan` prices an explorer stop string.

It checks ranges, the dinner run, doubling back, the exit airport and every leg; an unresearched pair prints *to confirm*.

**Without the engine**, walk the decisions from the tables below, price legs from the corridor tables, and label the result **unvalidated**.

### Tokyo's satellites

Nikkō is out and back, so it **splits a long Tokyo stay**; Hakone, Izu and the Fuji lakes sit on the way west.

<!-- generated:tokyo-satellites -->
*The five ryokan trips out of Tokyo, with the researched leg from Tokyo on each. Every one is out and back except Hakone and Izu, which sit on the way west; that and the hours below are the difference between them. `fits` is the tag to filter the master inn table by in Stage 4.*

| From Tokyo to | Door to door | Changes | `fits` tag | What it is |
|---|---|---|---|---|
| Nikkō | 2h | 0 | `tokyo-splitter` | carved shrines in cedar forest, a lake and a waterfall above them; out and back, so it splits a long Tokyo stay |
| Hakone | 2h12 | 1 | `golden-route-stop` | the hot-spring belt on the way to Kyoto, so the night costs nothing in travel; no view of Mt Fuji |
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
|  | 2 · RYOKAN · A night at Nikkō? `tokyo.nikko` | **1 Yes** — Carved shrines in cedar forest north of Tokyo; out and back, so it splits the Tokyo stay. · 2 No — No Nikkō; the Tokyo stay runs unbroken. |
| **Tokyo → Kyoto** | 3 · RYOKAN · A ryokan near Mount Fuji on the way west? `tokyo-kansai.fuji` | **1 Yes** — Hakone, the Fuji lakes or Izu: two hours from Tokyo, on the way west. · 2 No — Straight through to Kansai. |
| **Kyoto** | 4 · CITY · Which Kansai city? `kansai` | **1 Kyoto** — Temples, gardens and the old capital. · 2 Osaka — Osaka only; Kyoto as a day out or skipped. · 3 Kyoto and Osaka — Kyoto first, then Osaka for eating and going out. |
|  | 5 · STOP · A night at Nara? — Yes is on by default from 13 nights, and can be chosen on a shorter trip `kyoto.nara` | 1 Yes — A night among the temples and the deer park, after Kyoto. · **2 No** — Nara as a day trip instead. |
| **The end** | 6 · END · How does the trip end? `end` | **1 Fly home from Kansai** — Out through Kansai airport. · 2 A Kōyasan ryokan — A world-class destination gourmet ryokan south of Osaka. · 3 Kinosaki — The Japan Sea hot-spring town of old inns and public baths. · 4 Back to Tokyo — Two more Tokyo nights and a Haneda flight home. |

**The Classic** · 11 nights · 5 check-ins · 11h20 of travel · 62 min per night · in Haneda (HND), out Kansai (KIX) · band 7–15

| Stop | Nights | Onward |
|---|---|---|
| in from Haneda (HND) | — | 36 min train |
| Tokyo | 3 | 2h train |
| Nikkō | 1 | 2h train |
| Tokyo | 3 | 2h12 train |
| Hakone | 1 | 3h train |
| Kyoto | 3 | 1h30 train · out to Kansai (KIX) |

Stop string: `plan "tokyo:3,nikko:1,tokyo:3,hakone:1,kyoto:3" --in HND --out KIX`

- **flag** 62 min of travel per night — 60 minutes or more; say why and show a lighter order beside it.

#### The Kanazawa Loop

Tokyo, Kanazawa, a ryokan or two, then onward or back. Over the mountains instead of the straight shuttle. After Kanazawa the trip carries on to Kansai or loops back to Tokyo. Band 9–16 nights · HND → KIX, or HND → HND / NGO.

| Where | Decision | Options (chosen in bold) |
|---|---|---|
| **Tokyo → Kanazawa** | 1 · RYOKAN · A ryokan at Yudanaka on the way over the mountains? `tokyo-kanazawa.yudanaka` | **1 Yes** — A hot-spring valley in Nagano where the snow monkeys bathe, on the way over the mountains. · 2 No — Straight through to Kanazawa. |
|  | A ryokan at Nikkō on the way to Kanazawa, instead of Yudanaka? | _Yes: not offered here — one ryokan night on this leg: Nikkō or Yudanaka_ |
| **Kanazawa → Kyoto** | 2 · RYOKAN · A ryokan in the Kaga towns after Kanazawa? — Yes is on by default from 13 nights, and can be chosen on a shorter trip `kanazawa-onward.kaga` | 1 Yes — The hot-spring towns an hour down the coast from Kanazawa. · **2 No** — Straight on from Kanazawa. |
|  | 3 · STOP · A stop at Takayama on the way? `kanazawa-onward.takayama` | 1 Yes — A preserved timber merchant town in the mountains, on the way. · **2 No** — Direct to the next city. |
| **Kyoto** | 4 · CITY · Which city next? `next` | **1 Kyoto** — On to Kyoto, then Kansai airport. · 2 Osaka — Straight to Osaka for eating and going out, then Kansai airport. · 3 Kyoto and Osaka — Kyoto, then Osaka, then Kansai airport. · 4 Back to Tokyo — Loop back over the mountains for a Haneda flight. |
|  | 5 · STOP · A night at Nara? `kyoto.nara` | 1 Yes — A night among the temples and the deer park, after Kyoto. · **2 No** — Nara as a day trip instead. |
| **The end** | 6 · END · How does the trip end? `end` | **1 Fly home from the last city** — Kansai or Haneda, whichever the route reaches. · 2 A Kōyasan ryokan — A world-class destination gourmet ryokan south of Osaka. · 3 Kinosaki — The Japan Sea hot-spring town of old inns and public baths. |

**The Kanazawa Loop** · 11 nights · 4 check-ins · 9h25 of travel · 51 min per night · in Haneda (HND), out Kansai (KIX) · band 9–16

| Stop | Nights | Onward |
|---|---|---|
| in from Haneda (HND) | — | 36 min train |
| Tokyo | 4 | 2h36 train |
| Yudanaka (Shibu Onsen) | 1 | 2h12 train |
| Kanazawa | 3 | 2h30 train |
| Kyoto | 3 | 1h30 train · out to Kansai (KIX) |

Stop string: `plan "tokyo:4,yudanaka:1,kanazawa:3,kyoto:3" --in HND --out KIX`

#### Stretched West

Tokyo, Kyoto or Osaka, Hiroshima, one to three ryokan. The first trip stretched west to the inland sea. Band 12–19 nights · HND → HIJ.

| Where | Decision | Options (chosen in bold) |
|---|---|---|
| **Tokyo** | 1 · RYOKAN · A night at Nikkō? `tokyo.nikko` | 1 Yes — Carved shrines in cedar forest north of Tokyo; out and back, so it splits the Tokyo stay. · **2 No** — No Nikkō; the Tokyo stay runs unbroken. |
| **Tokyo → Kyoto** | 2 · RYOKAN · A ryokan near Mount Fuji on the way west? `tokyo-kansai.fuji` | **1 Yes** — Hakone, the Fuji lakes or Izu: two hours from Tokyo, on the way west. · 2 No — Straight through to Kansai. |
| **Kyoto** | 3 · CITY · Which Kansai city? `kansai` | **1 Kyoto** — Temples, gardens and the old capital. · 2 Osaka — Osaka only; Kyoto as a day out or skipped. · 3 Kyoto and Osaka — Kyoto first, then Osaka for eating and going out. |
|  | A night at Nara? | _Yes: not offered here — this trip carries on west, so Nara only fits between Kyoto and Osaka: on its own after Kyoto the next leg doubles back. Nara as a day trip instead_ |
| **Kyoto → Hiroshima** | 4 · RYOKAN · A ryokan at Tomonoura on the inland sea? `kansai-hiroshima.tomonoura` | 1 Yes — A small harbour town on the inland sea, an hour short of Hiroshima. · **2 No** — Straight through to Hiroshima. |
|  | 5 · RYOKAN · A night on Naoshima, the art island? `kansai-hiroshima.naoshima` | 1 Yes — The art island, reached by ferry from Okayama (no kit write-up — book Benesse House direct). · **2 No** — Straight through to Hiroshima. |
| **Hiroshima** | 6 · RYOKAN · A night on Miyajima? — Yes is on by default from 12 nights, and can be chosen on a shorter trip `hiroshima.miyajima` | 1 Yes — A night on the shrine island, under the torii that stands in the sea. · **2 No** — Miyajima as a day trip from Hiroshima. |
| **The end** | 7 · END · How does the trip end? `end` | **1 Fly home from Hiroshima** — Out through Hiroshima airport. · 2 Back to Tokyo — Two more Tokyo nights and a Haneda flight home. |

**Stretched West** · 12 nights · 4 check-ins · 8h50 of travel · 44 min per night · in Haneda (HND), out Hiroshima (HIJ) · band 12–19

| Stop | Nights | Onward |
|---|---|---|
| in from Haneda (HND) | — | 36 min train |
| Tokyo | 5 | 2h12 train |
| Hakone | 1 | 3h train |
| Kyoto | 4 | 1h54 train |
| Hiroshima | 2 | 1h06 bus · out to Hiroshima (HIJ) |

Stop string: `plan "tokyo:5,hakone:1,kyoto:4,hiroshima:2" --in HND --out HIJ`

#### Snow Country

Tokyo and the north, then Kanazawa and onward. Tokyo, then north into the snow or the Tōhoku ryokan towns, then Kanazawa and on to Kyoto or back to Tokyo. Band 9–16 nights · HND → KIX / ITM, or HND → HND.

| Where | Decision | Options (chosen in bold) |
|---|---|---|
| **Tokyo** | 1 · RYOKAN · A night at Nikkō? `tokyo.nikko` | 1 Yes — Carved shrines in cedar forest two hours north of Tokyo; out and back, so it splits the Tokyo stay. · **2 No** — No Nikkō; the Tokyo stay runs unbroken. |
| **Tokyo → Kanazawa** | 2 · RYOKAN · Two nights in snow country on the way? `tokyo-kanazawa.snow` | **1 Yes** — Two valley ryokan on the bullet train north of Tokyo. · 2 No — No snow-country nights. |
|  | 3 · RYOKAN · The Sendai loop and the Tōhoku hot-spring towns? `tokyo-kanazawa.tohoku` | 1 Yes — Sendai, then the north's hot-spring towns: a mountain ryokan and a samurai town. · **2 No** — No Tōhoku leg. |
| **Kanazawa → Kyoto** | 4 · STOP · A stop at Takayama on the way? `kanazawa-onward.takayama` | 1 Yes — A preserved timber merchant town in the mountains, on the way. · **2 No** — Direct to the next city. |
| **Kyoto** | 5 · CITY · Which city next? `next` | **1 Kyoto** — On to Kyoto, then Kansai airport. · 2 Osaka — Straight to Osaka, then Kansai airport. · 3 Kyoto and Osaka — Kyoto, then Osaka, then Kansai airport. · 4 Back to Tokyo — Loop back over the mountains for a Haneda flight. |
|  | 6 · STOP · A night at Nara? `kyoto.nara` | 1 Yes — A night among the temples and the deer park, after Kyoto. · **2 No** — Nara as a day trip instead. |
| **The end** | 7 · END · How does the trip end? `end` | **1 Fly home from the last city** — Kansai or Haneda, whichever the route reaches. · 2 A Kōyasan ryokan — A world-class destination gourmet ryokan south of Osaka. · 3 Kinosaki — The Japan Sea hot-spring town of old inns and public baths. |

**Snow Country** · 12 nights · 5 check-ins · 11h10 of travel · 56 min per night · in Haneda (HND), out Kansai (KIX) · band 9–16

| Stop | Nights | Onward |
|---|---|---|
| in from Haneda (HND) | — | 36 min train |
| Tokyo | 4 | 1h40 train |
| Minakami / Tanigawa (snow country) | 1 | 1h24 taxi |
| Echigo-Yuzawa (snow country) | 1 | 3h30 train |
| Kanazawa | 3 | 2h30 train |
| Kyoto | 3 | 1h30 train · out to Kansai (KIX) |

Stop string: `plan "tokyo:4,tanigawa:1,echigoyuzawa:1,kanazawa:3,kyoto:3" --in HND --out KIX`

#### Kyushu South & West

Tokyo and Kyushu, west and south. Fukuoka, Takeo, Nagasaki, then south to Kagoshima and its Kirishima ryokan. Band 11–20 nights · HND → KOJ.

| Where | Decision | Options (chosen in bold) |
|---|---|---|
| **Tokyo** | 1 · CITY · Where does the trip start? `start` | **1 Tokyo first** — Tokyo, then a flight to Fukuoka. · 2 Straight into Fukuoka — No Tokyo: start in the city you land in. · 3 Straight into Kagoshima — No Tokyo: the loop run the other way, Kagoshima first, Fukuoka last. · 4 Straight into Nagasaki — No Tokyo: land at Nagasaki, south to Kagoshima, Fukuoka last. |
|  | 2 · RYOKAN · A night at Nikkō? `tokyo.nikko` | 1 Yes — Carved shrines in cedar forest north of Tokyo; out and back, so it splits the Tokyo stay. · **2 No** — No Nikkō; the Tokyo stay runs unbroken. |
| **Fukuoka → Nagasaki** | 3 · RYOKAN · A ryokan at Takeo on the way to Nagasaki? `fukuoka-nagasaki.takeo` | **1 Yes** — A small hot-spring town on the line to Nagasaki. · 2 No — Straight through. |
| **Nagasaki → Kagoshima** | 4 · RYOKAN · A ryokan at Unzen on the way south? `nagasaki-kagoshima.unzen` | 1 Yes — The volcano town east of Nagasaki, a night on the way south. · **2 No** — Straight south. |
| **Kagoshima** | 5 · RYOKAN · A ryokan at Kirishima with Kagoshima? `kagoshima.kirishima` | **1 Yes** — A riverside hot-spring ryokan an hour above Kagoshima, the classic pairing with the city. · 2 No — Kagoshima on its own. |
| **The end** | 6 · END · How does the trip end? `end` | **1 Fly home from the last city** — Out through its own airport. · 2 Back to Tokyo — Two more Tokyo nights and a Haneda flight home. |

**Kyushu South & West** · 13 nights · 6 check-ins · 10h25 of travel · 46 min per night · 1 flight · in Haneda (HND), out Kagoshima (KOJ) · band 11–20

| Stop | Nights | Onward |
|---|---|---|
| in from Haneda (HND) | — | 36 min train |
| Tokyo | 4 | 3h30 flight |
| Fukuoka (Hakata) | 3 | 1h train |
| Takeo Onsen | 1 | 42 min train |
| Nagasaki | 2 | 3h train |
| Kagoshima | 2 | 54 min train |
| Kirishima (Myōken Onsen) | 1 | 45 min bus · out to Kagoshima (KOJ) |

Stop string: `plan "tokyo:4,fukuoka:3,takeo:1,nagasaki:2,kagoshima:2,kirishima:1" --in HND --out KOJ`

#### Kyushu South & East

Tokyo and Kyushu, north and south. Fukuoka, the hot-spring east, then south to Kagoshima and its Kirishima ryokan. Band 11–19 nights · HND → KOJ.

| Where | Decision | Options (chosen in bold) |
|---|---|---|
| **Tokyo** | 1 · CITY · Where does the trip start? `start` | **1 Tokyo first** — Tokyo, then a flight to Fukuoka. · 2 Straight into Fukuoka — No Tokyo: start in the city you land in. · 3 Straight into Kagoshima — No Tokyo: the loop run the other way, Kagoshima first, Fukuoka last. · 4 Straight into Ōita — No Tokyo: land at Ōita for the hot-spring east, south to Kagoshima, Fukuoka last. |
|  | 2 · RYOKAN · A night at Nikkō? `tokyo.nikko` | 1 Yes — Carved shrines in cedar forest north of Tokyo; out and back, so it splits the Tokyo stay. · **2 No** — No Nikkō; the Tokyo stay runs unbroken. |
| **Fukuoka → Yufuin** | 3 · RYOKAN · A gorge ryokan at Amagase before Yufuin? `fukuoka-yufuin.hita` | **1 Yes** — A night in the river gorge on the way, so the east is two nights rather than one. · 2 No — One night in the east. |
| **Yufuin** | 4 · CITY · Which hot-spring town in the east? `east` | **1 Yufuin** — The valley town under Mount Yufu, small ryokans and a mountain skyline. · 2 Beppu — The big steaming hot-spring city on the east coast. · 3 Yufuin and Beppu — The valley town first, then the steaming coast an hour down the hill. |
| **Yufuin → Kagoshima** | 5 · STOP · A stop at Kumamoto on the way south? `east-kagoshima.kumamoto` | 1 Yes — The castle city under the Aso caldera, on the way south. · **2 No** — Straight to Kagoshima. |
| **Kagoshima** | 6 · RYOKAN · A ryokan at Kirishima with Kagoshima? `kagoshima.kirishima` | **1 Yes** — A riverside hot-spring ryokan an hour above Kagoshima, the classic pairing with the city. · 2 No — Kagoshima on its own. |
| **The end** | 7 · END · How does the trip end? `end` | **1 Fly home from the last city** — Out through its own airport. · 2 Back to Tokyo — Two more Tokyo nights and a Haneda flight home. |
| **Not on this route** | A ryokan night on the Amakusa islands? | _Yes: not offered here — Kumamoto is not on this route_ |

**Kyushu South & East** · 12 nights · 6 check-ins · 11h40 of travel · 56 min per night · 1 flight · in Haneda (HND), out Kagoshima (KOJ) · band 11–19

| Stop | Nights | Onward |
|---|---|---|
| in from Haneda (HND) | — | 36 min train |
| Tokyo | 4 | 3h30 flight |
| Fukuoka (Hakata) | 3 | 1h45 train |
| Amagase (Hita) | 1 | 1h train |
| Yufuin | 1 | 3h12 train |
| Kagoshima | 2 | 54 min train |
| Kirishima (Myōken Onsen) | 1 | 45 min bus · out to Kagoshima (KOJ) |

Stop string: `plan "tokyo:4,fukuoka:3,hita:1,yufuin:1,kagoshima:2,kirishima:1" --in HND --out KOJ`

#### Kyushu North & East

Tokyo and Kyushu, north and east. Nagasaki, Takeo, Fukuoka, then the hot-spring east. Runs either way round. Band 10–17 nights · HND → OIT, or HND → NGS.

| Where | Decision | Options (chosen in bold) |
|---|---|---|
| **Tokyo** | 1 · CITY · Where does the trip start? `start` | **1 Tokyo first** — Tokyo, then a flight to Kyushu. · 2 Straight into Kyushu — No Tokyo. |
|  | 2 · CITY · Which way round? `order` | **1 Nagasaki first** — Land at Nagasaki, finish in the hot-spring east, out through Ōita. · 2 The east first — Land at Ōita, finish in Nagasaki, out through Nagasaki. |
|  | 3 · RYOKAN · A night at Nikkō? `tokyo.nikko` | 1 Yes — Carved shrines in cedar forest north of Tokyo; out and back, so it splits the Tokyo stay. · **2 No** — No Nikkō; the Tokyo stay runs unbroken. |
| **Nagasaki → Fukuoka** | 4 · RYOKAN · A ryokan at Unzen, out on the peninsula? `nagasaki-fukuoka.unzen` | 1 Yes — The hot-spring town on the peninsula east of Nagasaki. · **2 No** — No Unzen night. |
|  | 5 · RYOKAN · A ryokan at Takeo on the line to Fukuoka? `nagasaki-fukuoka.takeo` | **1 Yes** — A small hot-spring town on the line to Fukuoka. · 2 No — Straight through. |
| **Fukuoka → Yufuin** | 6 · RYOKAN · A gorge ryokan at Amagase before Yufuin? `fukuoka-yufuin.hita` | **1 Yes** — A night in the river gorge on the way, so the east is two nights rather than one. · 2 No — One night in the east. |
| **Yufuin** | 7 · CITY · Which way does the east go? `east` | **1 Yufuin** — The valley town under Mount Yufu, small ryokans and a mountain skyline. · 2 Beppu — The big steaming hot-spring city on the east coast. · 3 Yufuin and Beppu — The valley town first, then the steaming coast an hour down the hill. · 4 The volcanic middle — Inland instead: the caldera country and Kumamoto, out through Kumamoto. |
| **The end** | 8 · END · How does the trip end? `end` | **1 Fly home from the last stop** — Ōita, Kumamoto or Nagasaki, via Haneda. · 2 Back to Tokyo — Two more Tokyo nights and a Haneda flight home. |
| **Not on this route** | A ryokan at Kurokawa in the caldera country? | _Yes: not offered here — the leg from Fukuoka (Hakata) to Kumamoto is not on this route_ |
|  | A night at the Takachiho gorge? | _Yes: not offered here — the leg from Fukuoka (Hakata) to Kumamoto is not on this route_ |

**Kyushu North & East** · 12 nights · 6 check-ins · 10h20 of travel · 45 min per night · 1 flight · in Haneda (HND), out Ōita (OIT) · band 10–17

| Stop | Nights | Onward |
|---|---|---|
| in from Haneda (HND) | — | 36 min train |
| Tokyo | 4 | 4h15 flight |
| Nagasaki | 2 | 42 min train |
| Takeo Onsen | 1 | 1h train |
| Fukuoka (Hakata) | 3 | 1h45 train |
| Amagase (Hita) | 1 | 1h train |
| Yufuin | 1 | 1h bus · out to Ōita (OIT) |

Stop string: `plan "tokyo:4,nagasaki:2,takeo:1,fukuoka:3,hita:1,yufuin:1" --in HND --out OIT`

#### The Long Line

West to east: Kyoto or Osaka, Hiroshima, Fukuoka. One bullet-train line from Kansai into Kyushu with ryokan along it. The only spine that reaches Kyushu without a flight. Band 11–18 nights · HND or KIX → FUK / OIT / NGS.

| Where | Decision | Options (chosen in bold) |
|---|---|---|
| **Tokyo** | 1 · CITY · Where does the trip start? `start` | **1 Tokyo first** — Tokyo, then the train west. · 2 Straight into Kansai — No Tokyo; fly into Kansai airport. |
|  | 2 · RYOKAN · A night at Nikkō? `tokyo.nikko` | 1 Yes — Carved shrines in cedar forest north of Tokyo; out and back, so it splits the Tokyo stay. · **2 No** — No Nikkō; the Tokyo stay runs unbroken. |
| **Tokyo → Kyoto** | 3 · RYOKAN · A ryokan near Mount Fuji on the way west? `tokyo-kansai.fuji` | **1 Yes** — Hakone, the Fuji lakes or Izu: two hours from Tokyo, on the way west. · 2 No — Straight through to Kansai. |
| **Kyoto** | 4 · CITY · Which Kansai city? `kansai` | **1 Kyoto** — Temples, gardens and the old capital. · 2 Osaka — Osaka only; Kyoto as a day out or skipped. · 3 Kyoto and Osaka — Kyoto first, then Osaka for eating and going out. |
|  | A night at Nara? | _Yes: not offered here — this trip carries on west, so Nara only fits between Kyoto and Osaka: on its own after Kyoto the next leg doubles back. Nara as a day trip instead_ |
| **Kyoto → Hiroshima** | 5 · RYOKAN · A ryokan at Tomonoura on the inland sea? `kansai-hiroshima.tomonoura` | 1 Yes — A small harbour town on the inland sea, an hour short of Hiroshima. · **2 No** — Straight through to Hiroshima. |
|  | 6 · RYOKAN · A night on Naoshima, the art island? `kansai-hiroshima.naoshima` | 1 Yes — The art island, reached by ferry from Okayama (no kit write-up — book Benesse House direct). · **2 No** — Straight through to Hiroshima. |
| **Hiroshima** | 7 · RYOKAN · A night on Miyajima? `hiroshima.miyajima` | 1 Yes — A night on the shrine island, under the torii that stands in the sea. · **2 No** — Miyajima as a day trip from Hiroshima. |
| **The end** | 8 · END · How does the trip end? `end` | **1 Fly home from Fukuoka** — Out through Fukuoka airport. · 2 The hot-spring east — Two ryokan nights, Amagase then Yufuin, out through Ōita. · 3 Takeo and Nagasaki — A ryokan night, then Nagasaki, out through Nagasaki. · 4 Back to Tokyo — A flight up from Fukuoka, two more Tokyo nights and a Haneda flight home. |

**The Long Line** · 13 nights · 5 check-ins · 9h05 of travel · 42 min per night · in Haneda (HND), out Fukuoka (FUK) · band 11–18

| Stop | Nights | Onward |
|---|---|---|
| in from Haneda (HND) | — | 36 min train |
| Tokyo | 4 | 2h12 train |
| Hakone | 1 | 3h train |
| Kyoto | 3 | 1h54 train |
| Hiroshima | 2 | 1h06 train |
| Fukuoka (Hakata) | 3 | 18 min train · out to Fukuoka (FUK) |

Stop string: `plan "tokyo:4,hakone:1,kyoto:3,hiroshima:2,fukuoka:3" --in HND --out FUK`

#### Hokkaido

The northern island in snow, a flight each way. A flight each way, the island's snow and food. Band 8–12 nights · HND → CTS.

| Where | Decision | Options (chosen in bold) |
|---|---|---|
| **Tokyo** | 1 · CITY · Where does the trip start? `start` | **1 Tokyo first** — Tokyo, then a flight to Sapporo. · 2 Straight into Sapporo — No Tokyo. |
|  | 2 · RYOKAN · A night at Nikkō? `tokyo.nikko` | 1 Yes — Carved shrines in cedar forest north of Tokyo; out and back, so it splits the Tokyo stay. · **2 No** — No Nikkō; the Tokyo stay runs unbroken. |
| **Niseko (Hirafu)** | 3 · CITY · A mountain night at Niseko? `mountain` | **1 Niseko** — The ski resort's inn night, two hours from Sapporo. · 2 No Niseko — Sapporo unbroken; a hot-spring night near the airport at the end instead. |
| **The end** | 4 · END · How does the trip end? `end` | **1 Fly home from New Chitose** — Out through Sapporo's airport. · 2 A hot-spring ryokan — A last night at Noboribetsu or Jōzankei, near the airport (no kit write-up at Noboribetsu; Jōzankei has one). · 3 Back to Tokyo — Two more Tokyo nights and a Haneda flight home. |

**Hokkaido** · 9 nights · 4 check-ins · 11h20 of travel · 69 min per night · 1 flight · in Haneda (HND), out New Chitose (CTS) · band 8–12

| Stop | Nights | Onward |
|---|---|---|
| in from Haneda (HND) | — | 36 min train |
| Tokyo | 4 | 4h flight |
| Sapporo | 3 | 3h bus |
| Niseko (Hirafu) | 1 | 3h bus |
| Sapporo | 1 | 45 min train · out to New Chitose (CTS) |

Stop string: `plan "tokyo:4,sapporo:3,niseko:1,sapporo:1" --in HND --out CTS`

- **flag** 69 min of travel per night — 60 minutes or more; say why (4h of it is flying, counted at 3h a leg) and show a lighter order beside it.
<!-- /generated:spines -->

### The corridor and airport tables

**Every leg in every timeline above is researched**; inn legs are in `data/transit-legs.md`.

Both are printed in full in Stage 5 below, under *The corridor cheat-sheet*. Read them there, with the rules that go with them.


### The decision

Open the itinerary table once they have settled: fill `#`, `Stop`, `Nights` and every leg row from `plan` on the final stop string; `Stay`, `Band` and `Alternate` wait for Stage 4.

**Trip plan** · `<dates>` · `<n>` nights · arrive `<airport>`, depart `<airport>`

| # | Stop | Nights | Stay | Band | Alternate |
|---|---|---|---|---|---|
| | ↓ in from `<airport>` · `<h>h` · `<n>` changes · `<mode>` | | | | |
| 1 | `<stop>` | `<n>` | [`<name>`](`<link>`) | `<band>` | [`<name>`](`<link>`) |
| | ↓ `<h>h` · `<n>` changes · `<mode>` | | | | |
| 2 | `<stop>` | `<n>` | [`<name>`](`<link>`) | `<band>` | [`<name>`](`<link>`) |
| | ↓ `<h>h` · `<n>` changes · `<mode>` | | | | |
| 3 | `<stop>` | `<n>` | [`<name>`](`<link>`) | `<band>` | [`<name>`](`<link>`) |
| | ↓ out to `<airport>` · `<h>h` · `<n>` changes · `<mode>` | | | | |

**Totals:** `<n>` travel hours · `<n>` changes · `<n>` check-ins · `<n>` inn nights / `<n>` city nights · `<n>` one-nighters. Every figure here comes from `plan`, the airport legs' changes included, never typed; the travel total sums the leg rows above, both airport legs in it, rounded to five minutes.

**Notes:** `<shuttle window, last-mile detail>`, one per stop that needs one. **Assumed:** `<every default you chose for them>`.

**To confirm**

1. `<unsourced leg, unverified opening, shuttle to arrange>`

If the total overshoots, say which nights you would give up; never trim silently.

## Stage 4 — Where to stay

```
Goal    one place to sleep plus one alternate, for every stop
Inputs  the itinerary table from Stage 3; Taste and Budget from the Trip profile
Do      one stop per message, in trip order: the shortlist only, three to five options chosen against the
        profile in one `| Stay | Band | Why | Links |` table, best fit first, Why in your words from the write-ups
        verbatim, no default and no pick of your own; offer more on any of them
Ask     first: whether they want any of them opened up — then the pick, once they lean. Max 2 follow-up questions, and only where the options in front of them differ on it
Output  the itinerary table with Stay, Band and Alternate filled
Next    Stage 5 — make the route work
```

The alternate matters: the good inns sell out, so have the second answer ready. Nothing here is a default: every stop is a choice from the shortlist, made against the profile, with the kit's write-up verbatim. **The user chooses.** The options are ordered best fit first; you name a pick of your own only if they ask.

**A RYOKAN slot expands here.** Stage 3's ryokan slots are areas, not inns, and each is **one call to the tool, one table**: `stays fuji` (Hakone, the Fuji lakes, Izu) · `stays snow` (Minakami, Minamiuonuma, Yudanaka, Yamada Onsen) · `stays kaga` (Yamashiro, Yamanaka) · `stays east` (Amagase, Yufuin, Kurokawa) · `stays sapporo-onsen` (the hot-spring inns within reach of Sapporo). One table, **the town as a column**, so the choice of inn fixes the town and the leg at once; then re-price the stop string with that town (`plan`, or `spine … --set` again) and paste the timeline. **Hokkaido's mountain night is Niseko**, and the inns near Sapporo are the rest of the island's answer; Furano is indexed under Sapporo but holds no stay of its own, so the tool prints the nearest place it covers instead.

### How to work the table

1. **Filter the master inn table** by the stop — its `Area`, then the `Reach` column for the gateway city they will actually arrive from; the Stage 2 card's `fits` tag where the stop is a choice between areas. With the engine, `cd builder && node route.js stays <place> [--budget modest|comfortable|splurge] [--bath]` prints the same rows, filtered against the profile, write-ups verbatim.
2. **Order best-fit-first for this traveller** — the `Taste:` line is the frame — not best-scored-first. A quiet inn up a valley is the wrong recommendation for someone with a six-year-old, whatever its score.
3. **Show three to six as one table, best fit first** — the table `stays` prints, up to six rows, inns and hotels together with `Kind` telling them apart. Never split it into sub-tables by kind or by town, never the whole filtered set, and never the options as a run of bullets. If the tool prints a second table — the nearest place it covers, when this one has nothing — print that one too, and no more than those two. One row each, this header:

   | Stay | Band | Why | Links |
   |---|---|---|---|---|
   | `<name · inn / hotel · tier score · editor's pick where it is one>` | `<band>` | `<in the room · some rooms · none in the room · unstated>` | `<why it is special for them, and its key features — from the write-up>` | [map](`<link>`) · [full write-up](`<link>`) |

   **Why gets the width**: kind, score and editor's pick ride in the Stay cell; no Town column, since they know the town. Two variants, as `stays` prints them: a RYOKAN option spanning towns adds `Town` — `| Stay | Town | Band | Why | Links |`; a city of hotels has no bath — `| Stay | Band | Why | Links |`.

4. **What goes in the cells.** **`Why` is yours** — what makes it special for this couple and its key features, every fact from the write-up (below). Where the stop is a RYOKAN option spanning towns, `Town` carries the time from the gateway city from the corridor table, so the leg is visible beside the name. `Band` says what it includes — per night for two, dinner and breakfast included for an inn, room only for a hotel — and the band itself is said once, in that cell, never again in a sentence. `Links` is the Google Maps pin first, then the hotel's homepage or the inn's `ryokancatalog.com` page. Anything else that changes the choice — no natural spring, a bed rather than a floor mattress, out of town — goes in `Why`, in a clause.
5. **Under the table: the held-back count, then the closing line.** When the tool's header says more are on the list, one line says so in their words — *"four more on the kit's list — ask and I'll show them"* — so they can ask. No "I would take X", no "recommended": the order of the rows is the recommendation. Close the first message on the line Stage 3 prescribes, not on *"which one?"*. Ask for the choice in a later turn, once they name one they lean to or say "go", and record the second choice as the alternate. If they ask which you would take, answer in one line, with the reason.

**Opening up a stay means reading its page on [ryokancatalog.com](https://ryokancatalog.com)** — rooms, bath, kitchen, setting, where it is weakest — plus the practical half: distance from the gateway city, the room with the private bath, what booking needs.

**How many, by kind of stop:**

- **A city stop** (Tokyo, Kyoto, Osaka, Fukuoka) — **up to six hotels for Tokyo, Kyoto or Osaka, so the list shows variety; one or two for a minor city** — the tool prints what fits their band, and the held-back count under the table says how many more sit at other bands. **Where it has fewer, say so and say how many**; a city with none offers the live catalogue or the nearest city the kit covers — never a padded list, never a silent short one. **Choose every one against their `Budget:` and `Taste:` lines** — options at the wrong price do not count. Up to two notable inns actually in the city belong in the same table, with `Kind` marking them and a clause in `Why` saying they are a different product on a different price basis. Tokyo is the clearest case: a hotel city, and the inns near it are countryside places an hour or two out — a possible separate stop, not a way to sleep in Tokyo.
- **An inn stop** (a hot-spring valley, a mountain town, a coast) — five where the table has five, fewer where it doesn't. In a thin area, one inn plus a hotel in the nearest town is a legitimate answer.
- **A stop that is a RYOKAN option spanning towns** ("Near Mount Fuji" = Hakone, the Fuji lakes or Izu; "Snow country" = Minakami, Minamiuonuma, Yudanaka or Yamada Onsen) — **one table, the town as a column**, with the travel time from the gateway city in the Town cell from the corridor table, never inside the prose: that difference usually decides it. Choosing the inn fixes the town: re-price the stop string with the place key `route.js places` prints for that town — Lake Yamanaka area is `oyama`. Where a slot is a single town, only its rows can be taken without leaving the spine.

**Rules for this stage:**

- **Don't lead with the most expensive option** unless they asked for the splurge. Leading with the dearest makes everything after it read as a compromise; Japan's best nights are often not its priciest. Lead with the best fit, name the expensive one as the reach if there is a reason, and say what the extra money buys. **An editor's pick above their budget still prints, last, marked "above the budget"** — say in a clause what the extra buys, never drop it.
- **Prefer inns with a bath in the room**, particularly for American travellers, and say why in half a sentence: it settles tattoos, privacy and bathing together at once. **"Some rooms" is fine**, and often the better buy — but **"some" always means a specific, dearer room CATEGORY**, never a room the inn might give you on the night: get the category's name off the inn's page and price *that* one, never the entry room. Offline, say "some rooms — ask for the category with the private bath when booking". Where a group has none, say so plainly: *"this is an onsen town and the shared baths are what people come for"*, and ask whether the inn has a private bath bookable by the hour.
- **Mention booking mechanics only when unusual** — no online booking at all, a window that opens on a fixed date months ahead, agent-or-Japanese-site only, a lottery. Those change what they have to do and when. Say plainly when you don't know.
- **Give the Google Maps link first, the second link after it** — the homepage for a hotel, the catalogue page for an inn, the order the tool prints them in. Every hotel row carries both. The map link is the property's own Google place. Where the `Map` cell is `—`, no place was confirmed: give the site alone and say the map is unconfirmed. Never build a maps search link out of the hotel's name — it lands on the town, not the building.
- **When the budget doesn't land.** A band reading *rate not researched — check live* still prints, with that note, and goes on **To confirm**. A list sitting entirely under their budget is offered as it is, and say so. Where every row is above it or unpriced, show the nearest rows and say the kit has nothing at that price here. Convert a budget given in yen once, at a round rate you state — ¥150 to the dollar unless they give one — and that conversion is the one number you may type.
- **Say what a band is when you quote one.** Hotel bands are three-night checks for two, taxes included, across February, May and October. Japanese holidays run well above them: 11 February (National Foundation Day), Golden Week, Obon and the autumn-colour weekends. Confirm on the property's own page for the actual dates.

### The Why cell is yours; the facts are the kit's

Every inn and hotel here carries a hand-researched write-up, which the tool prints in full: your source, not the cell. **Write `Why` in your own words for this couple**: two or three sentences on what would make the night special for *them* — tied to their `Taste:` and `Draws:` lines — and the key features (the bath and whether it is in the room, the kitchen, the setting, the size), plus its real reservations — a noisy dining room, a blocked view, a bath only in the top rooms — said plainly, never glossed. **Every fact comes from the write-up or the inn's page; nothing is invented**, and no adjective the source does not earn. The trade-offs between rows go in the prose above the table, never a pick under it.

Gora Kadan Fuji, not as the write-up pastes but for a couple on their first ryokan night: *"The gentlest way into a ryokan: a hotel-ryokan hybrid with Fuji in front of you, a pool, three dining rooms and nothing about the form to be nervous about. Book an Open-air Bath Suite or above for spring water in the room, and the sushi or teppanyaki counter over the kaiseki."*

**Explain the score once, the first time a table shows one:** *"A-tier · 8.8 / 10 means tier A, 8.8 out of 10 — the catalogue's reading of the FlyerTalk thread and the Japanese review sites; S is the top tier, and a dash means unscored: a Japanese-guest favourite nobody has written up in English."* And introduce the catalogue once: *"every inn links to its page on ryokancatalog.com — the long read: rooms, bath, food, how to book."*

### Two things to say out loud once

- **A ryokan night is a fixed schedule, so shape the day around it.** Where there are sights (Nikkō, Takayama), take an early train, see the sights through the late morning and early afternoon, check in mid-afternoon; dinner and breakfast are at set hours; after checkout, two more hours of sights before the train on. A late arrival can cost the dinner you paid for.
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

**Before showing inns to a family:** most are adult-oriented. The `family-ok` tag marks the few whose write-up says they take children — its absence means *not stated*. Check the inn's page for its child policy and a room for three or four, and price it **per person**: a ryokan rate is per head with both meals.

### The master inn table

<!-- generated:inns -->
**81 inns, one row each.** Drawn from a 199-inn catalogue re-scored from the FlyerTalk forum thread written by a traveller who posts as **KI-NRT**. This is the only place an inn is listed; everything else in the kit points here.

**Two links to give them the first time you introduce ryokans** — the FlyerTalk thread author KI-NRT's primer, https://www.flyertalk.com/forum/34617783-post1.html, which is the plain-English introduction to what an inn night is, and https://ryokancatalog.com, where every inn below can be read in depth. Both, once, at the first mention.

**Columns.** `Inn` name · `Link` its full page, fetchable · `Area` the town or valley it is in · `Tier score` **S** ≥ 9 · **A** ≥ 8 · **B** ≥ 7, `—` means nobody has written it up in English, so treat the score as unknown · `In-room bath` **yes** every room, **some** certain rooms or the top room only, **no**, **unstated** the catalogue carries no answer — ask the inn · `Price band` US dollars a night for two **with dinner and breakfast**, `ask` means the inn quotes on request · `Reach` the gateway cities whose leg to this inn was **looked up in a real timetable**, nearest first, written `kyoto 3h/1 train` — three hours, one change, by train: the same three things Stage 5's plan asks for on every leg, so a Reach tag can be quoted straight into a leg row (`changes to confirm` = the hours were researched and the changes were not; `in town` = the inn is in that city, so there is no journey and no mode); a city that is not listed is a leg nobody researched, not a long one, and `see <town>` means the town has researched legs but this inn's own last mile does not — look the town up in the corridor table and ask the inn how you are meant to arrive · `Fits` which trips this inn belongs to, from the closed list below · `Editor's pick` yes for an inn kept whatever the sort would do with it · `Hook` one line of why.

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

| Inn | Link | Area | Tier score | In-room bath | Price band | Reach | Fits | Editor's pick | Hook |
|---|---|---|---|---|---|---|---|---|---|
| Aizu Tsuruga Higashiyama Sohonzan | https://ryokancatalog.com/inn/aizu-tsuruga-higashiyama-sohonzan | Aizuwakamatsu | A 8.4 | unstated | $1000–1400 | sendai 2h15/1 train · tokyo 3h06/1 train · nikko 3h48/2 train | tohoku |  | A one-party-per-day private-house ryokan in Higashiyama Onsen, converted in 2022 from the owner's grandfather's architect-built home, funded by the family's horsemeat restaurants and holding nothing back on the room, the minibar or the table. |
| Yamagata The Takinami | https://ryokancatalog.com/inn/yamagata-the-takinami | Akayu Onsen (Nanyō) | A 8.3 | some | $600–900 | sendai 1h36/1 shinkansen · tokyo 2h30/0 shinkansen · nikko 2h48/1 shinkansen | tohoku |  | A 19-room, street-facing ryokan in Akayu Onsen, remade in 2017 under a magazine editor's direction, with a spring-fed bath in every room and counter-seated kaiseki built on obscure Yamagata mountain ingredients, cuisine the thread author ranks top-10, possibly top-5, of every ryokan he has tried. |
| Osteria Sincerità | https://ryokancatalog.com/inn/osteria-sincerita | Akayu Onsen (Nanyō) | B 7.8 | unstated | $850–1100 | sendai 1h36/1 shinkansen · tokyo 2h30/0 shinkansen · nikko 2h48/1 shinkansen | tohoku bed-not-futon |  | Osteria Sincerità is a three-room auberge ryokan on a town-centre lot in Akayu Onsen, built around chef Makoto Harada's Italian-Japanese counter cuisine and an undiluted source-fed cypress bath in every villa, 50 meters from its sister inn Yamagata The Takinami. |
| Sanso Tensui | https://ryokancatalog.com/inn/sanso-tensui | Amagase Onsen, Hita | A 8.6 | yes | $420–600 | kumamoto 1h42/1 train · fukuoka 1h45/0 train · kagoshima 2h40/1 scenic | kyushu-yufuin | yes | A 19-room onsen ryokan in a moss forest outside Hita, built around giant boulders beside a river and waterfall, with bathing the thread author calls second to none at a place he argues is easily among Japan's 20 best. |
| Tayuta | https://ryokancatalog.com/inn/tayuta | Amakusa | S 9.4 | yes | $1200–2700 | kumamoto 1h12/0 car · fukuoka 1h54/1 train · kagoshima 2h18/1 train | kyushu-elsewhere | yes | A 12-villa Amakusa newcomer, opened in September 2024 by a Kumamoto wedding company with no previous ryokan experience, where every suite runs 86–119 m² with a source-fed golden Kinsen onsen bath and island-dotted sea views, and chef Yuuki Nakano's 16-course dinner left the thread author stunned. |
| Nakanobo Zuien | https://ryokancatalog.com/inn/nakanobo-zuien | Arima Onsen | B 7.9 | some | ask | osaka 1h06/0 bus · nara 1h36/2 train · kyoto 1h45/2 train | kansai-side-trip bed-not-futon |  | A 47-room adults-only inn from 1868 in the heart of Arima Onsen, run as a polished hybrid hotel with carpeted halls, a public cafe and a gift shop, and nothing like an intimate ryokan. |
| Atamiso | https://ryokancatalog.com/inn/atamiso | Bandai-Atami Onsen | A 8.3 | some | $450–800 | sendai 1h/1 shinkansen · tokyo 2h12/1 shinkansen · nikko 2h48/2 shinkansen | tohoku |  | An eleven-room ryokan above the Gohyakugawa River near Koriyama that ran effectively private when the thread author stayed in May 2022, taking just two parties at a time, with chef Asano serving and explaining every course himself. |
| Auberge Suzukane | https://ryokancatalog.com/inn/auberge-suzukane | Bandai-Atami Onsen | A 8.0 | unstated | ask | sendai 1h/1 shinkansen · tokyo 2h12/1 shinkansen · nikko 2h48/2 shinkansen | tohoku bed-not-futon |  | Suzukane is a corporate-owned ryokan in the center of Bandai Atami run by a former wedding coordinator, with a full suit of knight's armor at the entrance, and the reasons to stay are the food, the warmth of the staff and the big renovated rooms with source-fed in-room onsen. |
| Bettei Oborozukiyo | https://ryokancatalog.com/inn/bettei-oborozukiyo | Dogo Onsen, Matsuyama | B 7.8 | yes | ask | see Hiroshima (town) — inn's own leg not sourced | inland-sea bed-not-futon |  | A 19-room inn five minutes' walk from Dogo Onsen Honkan, built in 2015 with a classic look but a fresh, modern feel, and the thread author calls it far and away the top luxury option in the town. |
| Kanshuku-en Eshikoto | https://ryokancatalog.com/inn/kanshuku-en-eshikoto | Eiheiji | — | unstated | $750–1150 | kanazawa 1h/0 train · kyoto 1h45/1 train · takayama 2h54/1 train | kanazawa-loop | yes | Kanshuku-en Eshikoto is an eight-villa auberge opened in November 2024 by the Kokuryu sake brewery beside its ESHIKOTO complex near Eiheiji, the Soto Zen head temple, and each is a whole-villa rental of about 103 square meters with a semi-open-air onsen bath and Echizen-craft art. |
| Shogetsu | https://ryokancatalog.com/inn/shogetsu | Gero Onsen | A 8.8 | yes | $600–950 | takayama 1h/0 train · kanazawa 3h/1 train · kyoto 3h06/1 train | alps |  | A 21-room hilltop ryokan overlooking the Gero Onsen valley, a tall, nondescript building outside but inside all rock gardens, artsy lounges, a spectacular creative-kaiseki kitchen, amazing Gero spring water and valley views from room, lounge and communal bath alike. |
| Hakone Suishoen | https://ryokancatalog.com/inn/hakone-suishoen | Hakone | A 8.2 | yes | $550–800 | hakone in town · tokyo 2h12/1 train · kyoto 3h/1 train | golden-route-stop bed-not-futon |  | A 23-room Fufu-group ryokan in Hakone that does not use the Fufu name, because it is more traditional in architecture and aesthetics and caters to a slightly more mature crowd, and its dining rooms are set in a Taisho-era Mitsui villa. |
| Gora Kadan | https://ryokancatalog.com/inn/gora-kadan | Hakone | B 7.5 | some | ask | hakone in town · tokyo 2h12/1 train · kyoto 3h/1 train | golden-route-stop family-ok |  | A 39-room modern-Japanese ryokan in Gora and one of the thread author's 'Hakone holy trinity', with polished omotenashi, meals served in the room and onsen baths in the first-floor rooms only. |
| Yamado | https://ryokancatalog.com/inn/yamado | Hottoyuda Onsen | A 8.2 | unstated | $600–850 | sendai 2h/1 shinkansen · tokyo 4h/1 shinkansen · nikko 4h06/2 train | tohoku bed-not-futon |  | A 12-room hot-spring retreat in the Iwate mountains with free-flowing source onsen in every room, a private bath suspended over the stream that is worth the trip on its own, and Iwate-proud staff whose hospitality stood out most for the thread author. |
| Bettei Amafuru Oka | https://ryokancatalog.com/inn/bettei-amafuru-oka | Ibusuki | B 7.9 | some | ask | see Fukuoka (town) — inn's own leg not sourced | kyushu-kirishima |  | Bettei Amafuru Oka is a 15-room annex on a hill over Kagoshima Bay, the most upscale stay in Ibusuki, taking just four groups a day and grafted onto a half-dormant resort complex, but it has onsen in every room, the sunaburo-and-ceramic-spa circuit, warm Nepali-staffed hospitality and chef Kanemasa Matsumoto's serious French cooking. |
| Onyado Kawasemi | https://ryokancatalog.com/inn/onyado-kawasemi | Iizaka Onsen | A 8.3 | no | $850–1150 | sendai 1h15/1 train · tokyo 2h/1 train · nikko 2h54/2 train | tohoku |  | A twelve-room Iizaka Onsen ryokan where every room has an open-air onsen bath and meals served in the room, set around a pond garden, with a kitchen whose Japanese reputation drew the thread author there. |
| Auberge Yusura | https://ryokancatalog.com/inn/auberge-yusura | Ise area | B 7.6 | yes | $870–1200 | kyoto 2h/1 train · nara 2h/2 train | kansai-side-trip |  | Yusura is a five-villa auberge near Ise Jingu, opened in 2018, with standalone rooms around a saltwater pond, each with an open-air bath of Sakakibara spring water trucked in from 45 minutes away, and a kaiseki kitchen led by a Kitcho-trained chef. |
| Chalet Ivy Jozankei | https://ryokancatalog.com/inn/chalet-ivy-jozankei | Jozankei | A 8.2 | yes | $900–1400 | sapporo 1h/0 bus | hokkaido bed-not-futon |  | A 2019 all-suite riverside ryokan that the thread author calls Jozankei's premier luxury stay, with Aman-grade design, an involved okami and memorable Hokkaido kaiseki, an easy hop from Sapporo. |
| Wabizakura | https://ryokancatalog.com/inn/wabizakura | Kakunodate, Semboku | A 8.9 | yes | $620–780 | sendai 2h15/0 shinkansen · tokyo 3h06/0 shinkansen · nikko 4h36/2 shinkansen | tohoku |  | A ten-room destination ryokan in the quiet Akita countryside near Kakunodate's samurai district, where the owner drilled 1,000 meters to give a town with no onsen its own hot spring, piped to every room. |
| Kyo Yunohana Resort Suisen | https://ryokancatalog.com/inn/kyo-yunohana-resort-suisen | Kameoka | B 7.6 | yes | ask | kyoto 45 min/1 train · osaka 1h30/2 train | kansai-side-trip |  | Suisen is a real, source-fed hot-spring ryokan in the Yunohana Onsen area of Kameoka, 30 minutes from Kyoto by direct train, with an open-air onsen bath on the balcony of every one of its 13 rooms and a kitchen good enough that breakfast matched dinner. |
| Yoyokaku | https://ryokancatalog.com/inn/yoyokaku | Karatsu | B 7.9 | no | $300–550 | fukuoka 1h15/0 train · kumamoto 2h36/1 train · nagasaki 3h/2 train | kyushu-nagasaki |  | A 19-room inn in Karatsu, Saga, formed in 1893, with museum-grade Meiji-era architecture, a magnificent old-pine garden, a Karatsu pottery gallery and excellent in-room kaiseki from the local catch, at prices near the very bottom of the high-end range. |
| Sanso Amanosato | https://ryokancatalog.com/inn/sanso-amanosato | Katsuragi | A 8.6 | no | $650–1000 | osaka 1h24/1 train · nara 2h15/2 train · kyoto 2h30/2 train | kansai-side-trip | yes | A modern eight-room auberge in deep Wakayama countryside that people book for its French-Japanese dinner. |
| Kumano Bettei Nakanoshima | https://ryokancatalog.com/inn/kumano-bettei-nakanoshima | Katsuura | B 7.5 | some | ask | see Nara (town) — inn's own leg not sourced | kansai-side-trip bed-not-futon |  | Kumano Bettei Nakanoshima is an island ryokan off Nachikatsuura, a five-minute boat ride from shore and the only luxury option near Kumano Nachi Taisha and Nachi Falls, built around a seaside onsen that the thread author calls really nice and, at its best, spectacular and mystical. |
| Fufu Kawaguchiko | https://ryokancatalog.com/inn/fufu-kawaguchiko | Kawaguchiko | B 7.9 | yes | $930–1300 | tokyo 2h/0 train · hakone 3h45/3 train · kyoto 4h15/1 shinkansen | fuji-lakes golden-route-stop bed-not-futon | yes | Fufu Kawaguchiko is the Fufu group's flagship, a modern, youthful hotel-ryokan hybrid that the thread author calls the only choice for luxury travelers in the Fuji Five Lakes, though a slight notch below Fufu Nikko in most aspects. |
| Nishimuraya Honkan | https://ryokancatalog.com/inn/nishimuraya-honkan | Kinosaki Onsen | A 8.8 | no | $700–1000 | kyoto 2h30/0 train · osaka 2h45/0 train · nara 3h18/1 train | kansai-side-trip |  | The 150-year-old flagship of Kinosaki Onsen and the thread author's annual crab pilgrimage: four stays in, he still names its Matsuba-gani kaiseki the best crab cuisine he has ever had and doubts anywhere ever will compare, served in your room in a traditional house built around a garden. |
| Kinugawa Kanaya Hotel | https://ryokancatalog.com/inn/kinugawa-kanaya-hotel | Kinugawa Onsen, Nikkō | B 7.8 | no | ask | see Nikkō (town) — inn's own leg not sourced | tokyo-splitter |  | Kinugawa Kanaya is a 41-room hotel billed as Japan's first Western-style luxury establishment, with shoes-on hotel formality, optional meals and a photogenic garden in Kinugawa Onsen near Nikko. |
| Myoken Ishiharaso | https://ryokancatalog.com/inn/myoken-ishiharaso | Kirishima | S 9.5 | yes | $550–900 | kagoshima 54 min/0 train · kumamoto 2h30/1 train · fukuoka 2h45/1 train | kyushu-kirishima | yes | A 19-room inn on the Amori River at the edge of Kirishima National Park, with hot springs gushing from the rocks and mallards paddling past the baths, which two “otherworldly” stays made a permanent fixture of the thread author's personal top ten. |
| Isshin | https://ryokancatalog.com/inn/isshin | Kirishima | B 7.7 | yes | ask | kagoshima 54 min/0 train · kumamoto 2h30/1 train · fukuoka 2h45/1 train | kyushu-kirishima bed-not-futon |  | An eight-villa contemporary onsen ryokan (2008) at the foot of the Kirishima mountains that delivered almost everything the thread author hoped for: standalone villas, private dining rooms and slick source-fed water that he singled out for special mention. |
| Soneka | https://ryokancatalog.com/inn/soneka | Kitahiroshima | A 8.6 | yes | ask | sapporo 36 min/0 train | hokkaido bed-not-futon |  | A four-villa private retreat opened in 2024 on 77,000m2 of forest and meadow near Kitahiroshima, 30 minutes from New Chitose Airport, where check-in, every chef-cooked meal and two baths of rare amber moor onsen all happen inside your own villa. |
| Fuefukigawa Onsen Zabou | https://ryokancatalog.com/inn/fuefukigawa-onsen-zabou | Koshu | B 7.5 | yes | $450–650 | tokyo 1h30/0 train · hakone 3h15/3 train · kyoto 3h45/2 train | fuji-lakes golden-route-stop |  | A winery-owned Koshu ryokan that gave the thread author a "fairy tale-like" stay, with mesmerizing pond-and-garden grounds and glorious bathing, let down by middling cha-kaiseki, the one flaw he wished away. |
| Takefue | https://ryokancatalog.com/inn/takefue | Kurokawa Onsen | S 9.3 | yes | $1300–1800 | beppu 2h24/0 bus · kumamoto 2h36/0 bus · fukuoka 2h42/0 bus | kyushu-kurokawa bed-not-futon | yes | A vast, lamp-lit bamboo-forest estate near Kurokawa and the thread author's favorite ryokan in Japan across three visits, the rare property that is itself the destination, where a butler of a nakai-san runs everything and every bath is private, though the fully exposed ones can shut in deep-winter snow. |
| Gosho Gekkoju | https://ryokancatalog.com/inn/gosho-gekkoju | Kurokawa Onsen | A 8.5 | yes | $900–1400 | beppu 2h24/0 bus · kumamoto 2h36/0 bus · fukuoka 2h42/0 bus | kyushu-kurokawa |  | An eight-room hillside ryokan behind a massive gate in Kurokawa Onsen (renamed Gekkoju Kurokawa), with an onsen bath in every room plus private rental baths, including a man-made cave bath and the exposed hilltop Tenku (go after sundown). |
| Taiza Onsen Sumihei | https://ryokancatalog.com/inn/taiza-onsen-sumihei | Kyotango | A 8.1 | some | $600–900 | kyoto 2h30/0 train · nara 3h15/1 train · tokyo 5h/1 train | kansai-side-trip family-ok bed-not-futon |  | A 23-room inn from 1868 on the Tango Peninsula that exists for Taiza-gani, the 'phantom crab' that only five local boats bring in. |
| Hiiragiya | https://ryokancatalog.com/inn/hiiragiya | Kyoto | A 8.7 | no | ask | kyoto in town · osaka 45 min/0 train · nara 45 min/0 train | kansai-side-trip | yes | One of Kyoto's original big three, an 1818 inn facing Tawaraya, and the thread author's third stay was his best yet, because the appeal lies in depth, in layers of craftsmanship and in service that anticipates what you need, and nothing about it shouts for attention. |
| Akan Tsuruga Besso Hinanoza | https://ryokancatalog.com/inn/akan-tsuruga-besso-hinanoza | Lake Akan | B 7.8 | yes | ask | see Sapporo (town) — inn's own leg not sourced | hokkaido bed-not-futon |  | A 25-room ryokan that is the top (and probably only) luxury option on Lake Akan, with terrific Hokkaido kaiseki, a free-flowing onsen bath in every room and an interesting corner of eastern Hokkaido with Ainu culture and marimo on the doorstep. |
| Sui Suwako | https://ryokancatalog.com/inn/sui-suwako | Lake Suwa | A 8.1 | yes | $450–750 | tokyo 2h30/0 train · kanazawa 3h/2 shinkansen · takayama 3h15/1 bus | alps |  | A new-ish, modern 8-room ryokan on Lake Suwa that the thread author has now stayed at three times and calls his go-to in the area, definitely the top luxury inn near Matsumoto, with excellent local-smelt kaiseki and a rooftop mixed-gender bath looking across the lake to the Alps. |
| Gora Kadan Fuji | https://ryokancatalog.com/inn/gora-kadan-fuji | Lake Yamanaka area | A 8.0 | some | $900–1800 | tokyo 1h48/0 train · hakone 1h54/1 train · kyoto 2h36/0 train | fuji-lakes golden-route-stop bed-not-futon | yes | Gora Kadan opened its second-ever property in July 2025, a 42-room ryokan-hotel hybrid facing Fuji and big enough for a gym, a pool and three dining rooms. |
| Minamikan | https://ryokancatalog.com/inn/minamikan | Matsue | A 8.3 | yes | ask | see Hiroshima (town) — inn's own leg not sourced | inland-sea bed-not-futon |  | A renowned but still underrated 16-room Matsue ryokan that the thread author calls by far the top in all of Shimane, where he loved a full 3-night stay in Mizu no Oto, the 121-square-metre suite with its own excellent onsen bath. |
| Bettei Senjuan | https://ryokancatalog.com/inn/bettei-senjuan | Minakami (Tanigawa Onsen) | A 8.7 | some | $550–750 | tokyo 1h40/0 train · sendai 2h30/1 train · nikko 2h48/2 shinkansen | snow-country bed-not-futon | yes | Established in 1997 as the upscale annex of Ryokan Tanigawa, Senjuan is an artistic showpiece in the shadow of Mt. Tanigawa, with carvings on every beam, a glass-walled corridor onto the Alps and source-fed baths in all 18 rooms. |
| ryugon | https://ryokancatalog.com/inn/ryugon | Minamiuonuma | A 8.8 | some | $520–970 | tokyo 1h45/0 train · sendai 3h/1 train · nikko 3h12/2 shinkansen | snow-country |  | A rebuilt samurai residence in Minamiuonuma snow country, feudal Japan from the grounds and artsy and avant-garde inside, that the thread author says nails it on all counts: innovative local cooking crowned by Japan's best rice, private terrace onsen and polished, unintrusive service. |
| Satoyama Jujo | https://ryokancatalog.com/inn/satoyama-jujo | Minamiuonuma | A 8.3 | some | $500–800 | tokyo 1h45/0 train · sendai 3h/1 train · nikko 3h12/2 shinkansen | snow-country |  | A 14-room design ryokan in Niigata snow country built around Keiko Kuwakino's foraged, vegetable-driven cooking at Sanaburi, which the thread author says gets no better anywhere than here and at Enowa. |
| Kinsuikan | https://ryokancatalog.com/inn/kinsuikan | Miyajima | A 8.1 | no | $470–830 | hiroshima 1h/1 train · fukuoka 2h15/2 train · kyoto 2h42/2 train | inland-sea |  | A 39-room Miyajima ryokan that won the thread author back to the island after a disappointing stay at Iwaso, provided you book one of the six renovated special rooms, because the regional kaiseki served there (conger eel, fugu, Hiroshima oysters) is the reason to stay. |
| Hotel Iyaonsen | https://ryokancatalog.com/inn/hotel-iyaonsen | Miyoshi (Iya Valley) | B 7.9 | some | ask | see Hiroshima (town) — inn's own leg not sourced | inland-sea |  | A 20-room hotel perched over Shikoku's remote Iya Valley that the thread author calls a great experience even though, as luxury ryokans go, it is on the lower end of the scale: the incredible gorge setting (astonishingly gorgeous in fall foliage season) and the cable-car ride down to the riverside baths on the valley floor more than make up for the minor shortcomings, and both the service and the kitchen impressed him more than he expected. |
| Kohanyu | https://ryokancatalog.com/inn/kohanyu | Monobe River | A 8.3 | yes | $800–1700 | see Hiroshima (town) — inn's own leg not sourced | inland-sea |  | A four-room adults-only hideaway on Shikoku, built by a retired couple around a lucky spring strike and the owner's world-class vintage audio collection, where the thread author came expecting the river and the food and left most moved by the sound. |
| Kansuiro | https://ryokancatalog.com/inn/kansuiro | Murasugi Onsen, Agano | A 8.5 | unstated | ask | tokyo 3h12/2 train | snow-country |  | A nine-room historic ryokan at Murasugi Onsen outside Niigata, chosen by the thread author over its renowned neighbors for the architecture and radium springs, and he came away calling the charm off the charts, a rare classic property he prefers to his usual wa-modern taste. |
| Tsukihitei | https://ryokancatalog.com/inn/tsukihitei | Nara | A 8.1 | unstated | $750–950 | nara in town · kyoto 45 min/0 train · osaka 1h/0 train | kansai-side-trip | yes | Tsukihitei is a five-room 1902 hideaway inside Nara's primeval forest, rescued from datedness by the Miyako Hotel Group's 2023–25 renovations, and it is now the thread author's clear answer to where luxury travelers should sleep in Nara, with first-rate creative kaiseki and a superb rebuilt villa in a setting nothing nearby matches. |
| Fufu Nara | https://ryokancatalog.com/inn/fufu-nara | Nara | B 7.7 | yes | $780–1200 | nara in town · kyoto 45 min/0 train · osaka 1h/0 train | kansai-side-trip |  | A sleek modern Fufu resort in Nara with in-room open-air onsen even in the base rooms, and a restaurant set in a historic tea-house garden a shuttled five-minute walk downhill. |
| Hotel Ridge | https://ryokancatalog.com/inn/hotel-ridge | Naruto | A 8.3 | no | ask | see Hiroshima (town) — inn's own leg not sourced | inland-sea |  | An intimate nine-room Otsuka-owned property on a ridge above the Naruto Strait, and the thread author's default refined stop for anyone entering Shikoku from Osaka or Kobe. |
| Yunohanaso | https://ryokancatalog.com/inn/yunohanaso | Nasushiobara | B 7.7 | yes | ask | see Nikkō (town) — inn's own leg not sourced | tokyo-splitter bed-not-futon |  | A modern rural-Japanese onsen ryokan perched over the Hokigawa River in Nasushiobara, remote enough that most guests come purely for the springs, the food and the hospitality. |
| Fufu Nikko | https://ryokancatalog.com/inn/fufu-nikko | Nikkō | A 8.8 | yes | $850–1200 | nikko in town · tokyo 2h/0 train · sendai 2h18/1 train | tokyo-splitter golden-route-stop | yes | Fufu's 24-room Nikko property, opened in 2020 on the old grounds of the Tamozawa imperial villa, gave the town its first true luxury inn, modern and hotel-like where most ryokans are traditional, with an onsen bath in every room and a short walk to Tosho-gu. |
| Shiguchi | https://ryokancatalog.com/inn/shiguchi | Niseko | A 8.8 | yes | ask | sapporo 3h/0 bus | hokkaido bed-not-futon |  | Shiguchi is Zaborin founder Shouya Grigg's five-villa kominka retreat, the ryokan he says he always wanted to make, with massive restored farmhouses filled with his art and two private source-fed baths in each. |
| Zaborin | https://ryokancatalog.com/inn/zaborin | Niseko | B 7.9 | yes | ask | sapporo 3h/0 bus | hokkaido |  | Zaborin has been Niseko's established luxury ryokan since 2015, with fantastic hardware, two onsen baths in every room and a loyal following, and the three guests who reviewed it here enjoyed it, one calling it a contender for the thread author's top ten. |
| Ryokan Nishiyama | https://ryokancatalog.com/inn/ryokan-nishiyama | Onomichi | B 7.6 | unstated | $540–650 | hiroshima 1h/1 train · kyoto 2h18/1 shinkansen | inland-sea |  | A design-forward ryokan in suburban Onomichi, with standalone-house rooms up to 81 square metres, an all-day lounge of complimentary sake, beer and whisky, and a Japanese-French dinner with a wine pairing. |
| Kuramure | https://ryokancatalog.com/inn/kuramure | Otaru | B 7.8 | yes | ask | sapporo 36 min/0 train | hokkaido |  | A 19-room modern retreat in Asarigawa Onsen, Otaru's only hot-spring village, five linked buildings along the Asarigawa river with a private onsen in every room. |
| Iwanoyu | https://ryokancatalog.com/inn/iwanoyu | Shimosuwa | A 8.3 | some | $400–750 | tokyo 2h30/0 train · kanazawa 3h/2 shinkansen · takayama 3h15/1 bus | alps bed-not-futon |  | An 18-room Taisho-era onsen ryokan in the Nagano mountains that is a fixture on the stay-before-you-die lists, and at roughly 40,000 yen a head it is a screaming bargain by top-ryokan standards, which is exactly why the thread author braced for gotchas and found them, all in the lower room categories. |
| Shiki no Yado Michinokuan | https://ryokancatalog.com/inn/shiki-no-yado-michinokuan | Shiroishi | B 7.7 | unstated | ask | see Sendai (town) — inn's own leg not sourced | tohoku bed-not-futon |  | A nine-room ryokan from 1985 near Shiroishi Castle that doesn't scream opulent luxury and doesn't need to, because it is wrapped in forest, serves both meals in the room, cooks delectable local food and is elegantly staffed. |
| Asaba | https://ryokancatalog.com/inn/asaba | Shuzenji | S 9.4 | some | $1100–1600 | tokyo 1h45/0 train · hakone 1h48/2 train · kyoto 2h42/0 train | golden-route-stop | yes | A 500-year-old Shuzenji inn that the thread author keeps permanently on his list of top ryokans and calls the pinnacle of Japanese architecture, hospitality and cuisine near Tokyo, arranged around a koi pond, a night-lit bamboo grove and a working Meiji-era Noh stage where Living National Treasures still perform. |
| Otogi no Yado Yoneya | https://ryokancatalog.com/inn/otogi-no-yado-yoneya | Sukagawa | A 8.1 | unstated | $350–650 | sendai 1h18/1 train · tokyo 1h45/1 train · nikko 2h48/2 shinkansen | tohoku |  | Otogi no Yado Yoneya is a 17-room fairy-tale-themed onsen ryokan deep in rural Fukushima near Sukagawa, its rooms and seasonal 'Otogi Kaiseki' dinner built on a playful (but not gimmicky) storytelling concept, with a six-room Hanare 88 annex added in 2021. |
| Lamp no Yado | https://ryokancatalog.com/inn/lamp-no-yado | Suzu, Noto Peninsula | B 7.7 | no | ask | see Kanazawa (town) — inn's own leg not sourced | kanazawa-loop |  | A 14-room ryokan of old Japanese buildings in a cliffside alcove at the very tip of the Noto Peninsula, built around a long pool that runs between the buildings and the sea. |
| Shinsen | https://ryokancatalog.com/inn/shinsen | Takachiho | A 8.9 | some | $600–1100 | kumamoto 2h/0 car · fukuoka 3h30/0 bus · kagoshima 4h12/1 bus | kyushu-kurokawa bed-not-futon |  | A family-run 15-room gourmet inn in central Takachiho, spread across three distinct garden areas, where every meal is served in a rotating series of private dining rooms and the caviar comes from its own locally raised sturgeon. |
| Wanosato | https://ryokancatalog.com/inn/wanosato | Takayama | A 8.3 | no | $550–850 | takayama in town · kanazawa 2h24/0 bus · kyoto 3h48/1 train | alps bed-not-futon |  | An eight-room farmhouse ryokan on an idyllic river in the forest outside Takayama, with cooking that fans and detractors alike call superb; the thread author found the dining far superior to the equally renowned Honjin Hiranoya Kachoan in town. |
| Machiyado Ichiryu | https://ryokancatalog.com/inn/machiyado-ichiryu | Takayama | — | unstated | $600–950 | takayama in town · kanazawa 2h24/0 bus · kyoto 3h48/1 train | alps |  | An adults-only town inn of eleven rooms a few minutes' walk from Takayama's morning market and old streets, opened in November 2024 in place of the 53-year-old Ryokan Seiryu, whose 25 rooms were rebuilt as 11, six of them suites, each with a semi-open-air bath. |
| Onyado Chikurintei | https://ryokancatalog.com/inn/onyado-chikurintei | Takeo Onsen | A 8.2 | yes | $550–1400 | nagasaki 42 min/0 shinkansen · fukuoka 1h/0 train · kumamoto 1h48/1 train | kyushu-nagasaki |  | Chikurintei is the only bona-fide luxury ryokan in Takeo Onsen, with 11 secluded rooms at the foot of Mt. Mifuneyama, every one with a private onsen bath, both meals served in your room, and service the thread author ranked above Aman's. |
| Miyakowasure | https://ryokancatalog.com/inn/miyakowasure | Tohoku | A 8.4 | yes | $600–850 | sendai 2h15/0 shinkansen · tokyo 3h06/0 shinkansen · nikko 4h36/2 shinkansen | tohoku bed-not-futon |  | A ten-room hideaway in remotest Akita with a source-fed open-air onsen in every room, memorable regional cooking and total silence. |
| Migiwatei Ochi Kochi | https://ryokancatalog.com/inn/migiwatei-ochi-kochi | Tomocho, Fukuyama | A 8.5 | yes | $470–800 | hiroshima 1h12/1 train · kyoto 2h12/1 train · fukuoka 2h30/0 shinkansen | inland-sea |  | A modern 17-room adults-only ryokan on the water's edge in Tomonoura, every room facing the Seto Inland Sea with its own deck onsen bath, where the first night's dinner ranked among the best of the thread author's ryokan-going life. |
| Yunotani Senkei | https://ryokancatalog.com/inn/yunotani-senkei | Totsukawa, Yoshino | B 7.6 | no | ask | see Nara (town) — inn's own leg not sourced | kansai-side-trip |  | A nine-room cottage ryokan in remote Totsukawa, the highest-end base the thread author found within reach of Kumano Hongu Taisha, with fresh 2017 log cabins and a private open-air onsen he calls pure bliss, run by a loud, energetic and warm-spirited attendant. |
| Tsuchiyu Bettei Satonoyu | https://ryokancatalog.com/inn/tsuchiyu-bettei-satonoyu | Tsuchiyu Onsen | A 8.3 | some | $570–800 | sendai 1h/0 train · tokyo 2h15/0 shinkansen · nikko 2h45/1 shinkansen | tohoku bed-not-futon | yes | A seven-room hideaway deep in the Fukushima mountains, built around Shinpeki, a two-level private rotenburo beside a forest stream that the thread author ranks with Takefue's best bath. |
| Mt.Resort Unzen Kyushu Hotel | https://ryokancatalog.com/inn/mt-resort-unzen-kyushu-hotel | Unzen | A 8.4 | yes | ask | nagasaki 1h42/0 bus · kumamoto 2h12/2 ferry · fukuoka 3h/2 bus | kyushu-nagasaki bed-not-futon |  | A luxury hotel rebuilt from scratch as a modern boutique property, right next to Unzen Jigoku, the steaming sulphur hells, with front-row views of them from most rooms and the lounge, and after a posh 2018 renovation it has a rooftop lounge over the hellscape and the feel of an all-inclusive. |
| Kagaya Bettei Matsunomidori | https://ryokancatalog.com/inn/kagaya-bettei-matsunomidori | Wakura Onsen | B 7.9 | yes | ask | see Kanazawa (town) — inn's own leg not sourced | kanazawa-loop bed-not-futon |  | The 31-room luxury annex of the giant Kagaya, which the thread author calls the top ryokan in Wakura Onsen hands down, with museum-grade art in the public areas, gracious staff and fine Noto seafood. |
| Sankara Hotel & Spa Yakushima | https://ryokancatalog.com/inn/sankara-hotel-spa-yakushima | Yakushima | A 8.9 | no | $750–1500 | kagoshima 2h30/1 flight · fukuoka 2h45/1 flight · kumamoto 3h18/2 flight | kyushu-kirishima |  | A 29-room auberge resort in the foothills of UNESCO-listed Yakushima, with an ocean-view pool and French-inspired cooking, which the thread author calls as close to an Aman as a Japan property can get, except that the food is better than at most Amans. |
| Fujiiso | https://ryokancatalog.com/inn/fujiiso | Yamada Onsen | B 7.7 | yes | $480–900 | kanazawa 2h/0 train · tokyo 2h18/0 train · takayama 3h06/1 shinkansen | alps bed-not-futon |  | A historic Nagano inn with 240 years of pedigree and many repeat guests, which added two fresh, spacious suites in 2022 with source-fed onsen baths, so you can stay at a famous old ryokan without giving up comfort. |
| Hanamurasaki | https://ryokancatalog.com/inn/hanamurasaki | Yamanaka Onsen | A 8.1 | no | $600–1000 | kanazawa 54 min/0 train · kyoto 1h36/1 train · takayama 2h48/1 train | kanazawa-loop bed-not-futon |  | A large, modern luxury ryokan above the Kakusenkei gorge, and the food (spectacular winter snow crab above all) is the main reason anyone comes; source-fed bathing reaches only its top suites. |
| Kayotei | https://ryokancatalog.com/inn/kayotei | Yamanaka Onsen | B 7.6 | some | $700–1100 | kanazawa 54 min/0 train · kyoto 1h36/1 train · takayama 2h48/1 train | kanazawa-loop |  | A ten-room, family-run classic that delivers the traditional ryokan feeling in spades (riverside seclusion, antiques in the hallways, dinner in a private room), and the thread author still calls it a tad overrated, because across repeat stays it never excelled at any one thing: the food is good but not great, the rooms decent and minimalist, and the service not quite as personalized as you would expect from so small a family-run house. |
| Beniya Mukayu | https://ryokancatalog.com/inn/beniya-mukayu | Yamashiro Onsen | A 8.4 | some | $800–1200 | kanazawa 36 min/0 train · kyoto 2h/1 train · takayama 2h36/1 train | kanazawa-loop bed-not-futon | yes | A stylish Japanese-modern ryokan in Yamashiro Onsen that does almost everything right (a top suite the thread author called perfect, in-room onsen, gorgeous grounds, an excellent crab-season kitchen), and then serves dinner in one shared, echoing dining hall with no private or in-room option. |
| Yado Shiontei | https://ryokancatalog.com/inn/yado-shiontei | Yonago | A 8.0 | yes | ask | see Hiroshima (town) — inn's own leg not sourced | inland-sea |  | A 10-room crab ryokan that opened in 2021 in Kaike Onsen, with modern hardware built to a very high quality, all-suite rooms on the area's saltwater spring and service Fc912 called pretty perfect, but the crab itself ranked below Nishimuraya and Bouyourou for the two parties who tried it, at roughly double Nishimuraya's per-person rate. |
| NEOLD Private House | https://ryokancatalog.com/inn/neold-private-house | Yoshino | B 7.7 | unstated | $560–660 | nara in town · kyoto 45 min/0 train · osaka 1h/0 train | kansai-side-trip bed-not-futon |  | A one-party kominka retreat in sacred Yoshino that offers the widest range of traditional Japanese activities the thread author has seen anywhere: Noh, geisha, tea ceremony, calligraphy, river fishing, and a full Shogun experience with an Osaka action cast. |
| Shoraiso | https://ryokancatalog.com/inn/shoraiso | Yudanaka Onsen, Yamanouchi | — | yes | $730–1100 | kanazawa 2h12/1 train · tokyo 2h36/1 train · takayama 3h24/2 shinkansen | snow-country | yes | A five-room inn re-opened in 2024 a five-minute drive from the Jigokudani snow-monkey park, with large in-room onsen baths (bigger than Takinami's, by the thread author's research) and dinner served in-room or in private rooms. |
| Sanso Murata | https://ryokancatalog.com/inn/sanso-murata | Yufuin | S 9.0 | yes | $1000–1400 | beppu 1h/0 bus · fukuoka 2h10/0 train · kumamoto 2h24/1 train | kyushu-yufuin bed-not-futon | yes | A 12-room Yufuin inn whose plain grounds hide the best service the thread author has encountered anywhere in Japan (four staff rushing out with umbrellas in a storm, a butler dedicated exclusively to your room for every meal) and a spectacular kaiseki kitchen that shows off Kyushu's meat, fish and produce. |
| Enowa Yufuin | https://ryokancatalog.com/inn/enowa-yufuin | Yufuin | A 8.4 | yes | $950–2000 | beppu 1h/0 bus · fukuoka 2h10/0 train · kumamoto 2h24/1 train | kyushu-yufuin | yes | An ultra-modern 18-room newcomer (June 2023) on a hilltop farm above the Yufuin valley, built around Tashi Gyamtso's vegetable-driven cooking, which the thread author found eclipsed even SingleThread and called reason alone to stay. |
| Kamenoi Besso | https://ryokancatalog.com/inn/kamenoi-besso | Yufuin | — | unstated | $760–1500 | beppu 1h/0 bus · fukuoka 2h10/0 train · kumamoto 2h24/1 train | kyushu-yufuin bed-not-futon | yes | A 1921 lakeside estate on Lake Kinrin at the foot of Mt. Yufu, with seventeen rooms all built differently, garden-source kakenagashi in every tub and public rooms (a teahouse, a bar, a gramophone lounge) that guests keep writing about. |
| Arcana Izu | https://ryokancatalog.com/inn/arcana-izu | Yugashima, Izu Peninsula | B 7.8 | some | $520–1100 | tokyo 2h12/1 train · hakone 2h24/2 train · kyoto 3h03/1 train | golden-route-stop |  | A 16-suite auberge above the Kano River whose French-Japanese kitchen the thread author ranks with the best restaurants of Tokyo and Paris. |

_Left off on price: **Bouyourou** (Mikuni, from $1450), **Fuji Seiran** (Cape Osezaki, Izu, from $2400) and **THE YUKAWA Ichijoh Branch** (Kamasaki Onsen, Shiroishi, from $2200). On the live catalogue if the budget is not the constraint._
<!-- /generated:inns -->

### City hotels

<!-- generated:hotels -->
**51 city hotels in 13 cities** — at least three wherever a trip sleeps several nights, one or two in the smaller places, up to five where the city earns it. That is as deep as this list goes, and every pick shown to a traveller is chosen against their budget and taste, never off the top. Where you want more than it holds, the research method below is how to find it.

*One row per hotel. **`Map` is the property's own Google place** — open it before the site, and give it first when you name the hotel to someone. `Group` is the question that actually decides the booking in the three cities a first trip sleeps in — whether you are spending points, spending money on a Japanese-run house, or spending less on something with more character than either; `—` where the city's list is too short to group. `Per night` is US dollars for two, **room only, no meals** unless the row says otherwise. A band is the rounded low-to-high of three-night checks in February, May and October. **rate not researched — check live** = no usable rate was found, so read one off the property's own page rather than quoting a number. A band is a sighting, never a quote.*

*One line per hotel here; the full write-ups are in the kit's stays files.*

| City | Hotel | Map | Site | Group | Neighbourhood | Per night | Why it's on the list |
|---|---|---|---|---|---|---|---|
| Tokyo | Park Hyatt Tokyo | [map ↗](https://www.google.com/maps?cid=3231512592087154070) | [site](https://www.hyatt.com/park-hyatt/tyoph-park-hyatt-tokyo) | Hyatt points, or Chase points transferred to Hyatt | Nishi-Shinjuku, top of the Shinjuku Park Tower | $850–1050 | Tokyo's most famous luxury hotel, and for thirty years the one the others are measured against: hushed, spacious and high above the city on the top fourteen floors of a Shinjuku tower, the hotel Lost in Translation made known around the world. Bookable with Hyatt points. |
| Tokyo | Hotel Toranomon Hills | [map ↗](https://www.google.com/maps?cid=12819761384697507953) | [site](https://www.hyatt.com/hotel-toranomon-hills) | Hyatt points, or Chase points transferred to Hyatt | Toranomon (Unbound Collection by Hyatt) | $375–700 | An upmarket hotel on floors 11 to 14 of the Toranomon Hills Station Tower, and the one FlyerTalk regulars book over the Andaz next door. Bookable with Hyatt or transferred Chase points. |
| Tokyo | Hyatt Centric Ginza Tokyo | [map ↗](https://www.google.com/maps?cid=13498144464031270753) | [site](https://www.hyatt.com/hyatt-centric/en-US/tyoct-hyatt-centric-ginza-tokyo) | Hyatt points, or Chase points transferred to Hyatt | Namiki-dōri, Ginza | $400–750 | Known for its address: Namiki-dori, the tree-lined Ginza street where the small bars and counters are. Bookable with Hyatt points, or Chase points transferred at 1:1. |
| Tokyo | Palace Hotel Tokyo | [map ↗](https://www.google.com/maps?cid=1748987416538389436) | [site](https://en.palacehoteltokyo.com/) | Japanese-run luxury | Marunouchi, on the Imperial Palace moat | $600–1250 | Tokyo's best Japanese-run luxury hotel, and the one FlyerTalk's regulars pick first: grand but not stiff, with the most polished service in the city. |
| Tokyo | The Okura Tokyo | [map ↗](https://www.google.com/maps?cid=3528441622244778882) | [site](https://theokuratokyo.jp/en/the-okura-heritage-wing/) | Japanese-run luxury | Toranomon, on the Okura hill | $360–640 Prestige Tower · $650–950 Heritage Wing | Two buildings on the Okura hill. The Prestige Tower is the main hotel, with the rebuilt 1962 lobby and the Orchid Bar. |
| Tokyo | Hoshinoya Tokyo | [map ↗](https://www.google.com/maps?cid=452005950262881873) | [site](https://hoshinoresorts.com/en/hotels/hoshinoyatokyo/) | Japanese-run luxury | Ōtemachi | $450–950 | A ryokan built as a tower in Otemachi, where shoes come off at the door and stay off. |
| Tokyo | K5 | [map ↗](https://www.google.com/maps?cid=10906498574121315795) | [site](https://k5-tokyo.com/) | Funky boutique | Kabutochō / Nihonbashi | $275–650 | A design hotel in a converted pre-war bank in Kabutocho, Tokyo's old stock-exchange quarter, and the building is the reason to book it. |
| Tokyo | SOIL Nihonbashi | [map ↗](https://www.google.com/maps?cid=11886533522893997146) | [site](https://soilis.co/nihonbashi/) | Funky boutique | Bakurochō, Nihonbashi | $200–225 | A small design-led hotel over its own cafe and sake bar in Bakurocho, the old textile-wholesale district. |
| Kyoto | Hotel The Mitsui Kyoto | [map ↗](https://www.google.com/maps?cid=9260278570712509021) | [site](https://www.hotelthemitsui.com/en/kyoto/) | — | Facing Nijō Castle | $700–1000 | The Mitsui family's 300-year-old gate is the entrance, and the hotel behind it faces Nijo Castle: the grandest address in the city. |
| Kyoto | Ace Hotel Kyoto | [map ↗](https://www.google.com/maps?cid=8371560588874030601) | [site](https://acehotel.com/kyoto/) | — | Karasuma-Oike, downtown | $350–425 | A design hotel built into a 1920s telephone exchange at Karasuma-Oike, in the middle of the central grid. |
| Kyoto | Genji Kyoto | [map ↗](https://www.google.com/maps?cid=2448773851659491001) | [site](https://genjikyoto.com/) | — | Kamo riverside at Gojō | $325–700 | A small design hotel on the Kamo river at Gojo, and the water is the point: nineteen rooms, nine of them with balconies over it. |
| Kyoto | Kyokoyado Muromachi Yutone | [map ↗](https://www.google.com/maps?cid=10380402357816233814) | [site](https://www.yutone.jp/) | — | Muromachi, by Nishiki market | $350–500 | A seven-room townhouse inn in Muromachi, the old silk-trading district, with its own Kyoto-cuisine kitchen, which is rare inside the central grid. |
| Kyoto | Higashiyama Shikikaboku | [map ↗](https://www.google.com/maps?cid=14720741155553756667) | [site](https://www.shikikaboku.jp/) | — | Higashiyama | $475–1600 | An all-suite hotel on a Higashiyama canal, where each of the eight suites has its own front door and kitchen. |
| Kyoto | Sowaka | [map ↗](https://www.google.com/maps?cid=3046628050993449764) | [site](https://sowaka.com) | — | Gion, in the Yasaka side streets | $900–1650 | A hundred-year-old Gion house that was a high-end ryotei restaurant before it was a hotel, in the side streets below Yasaka Shrine. |
| Kyoto | nol kyoto sanjo | [map ↗](https://www.google.com/maps?cid=13547248684663816125) | [site](https://www.nolhotels.com/kyoto-sanjo/en/) | — | Sanjo, central grid | $375–650 | A century-old machiya on Sanjo that was the Kyoto shop of the Kinshi Masamune sake brewery, and the old sign is still over the door. |
| Osaka | Conrad Osaka | [map ↗](https://www.google.com/maps?cid=10561270487337634692) | [site](https://www.hilton.com/en/hotels/osakaci-conrad-osaka/) | The big luxury names | Nakanoshima, floors 33–40 of Festival Tower West | $600–650 | A luxury hotel on the top floors of a Nakanoshima tower, and the one FlyerTalk picks among Osaka's big names: a member chose it over the Waldorf and called it stunning. |
| Osaka | Four Seasons Hotel Osaka | [map ↗](https://www.google.com/maps?cid=4720923803230290434) | [site](https://www.fourseasons.com/osaka/) | The big luxury names | Dōjima, floors 1–2 and 28–37 of a tower | $475–750 | The 28th floor, Gensui, is what sets it apart: 21 tatami rooms with futons and a tea lounge of their own, inside a Dojima tower that opened in 2024. |
| Osaka | Waldorf Astoria Osaka | [map ↗](https://www.google.com/maps?cid=10203554227316915614) | [site](https://www.hilton.com/en/hotels/osawawa-waldorf-astoria-osaka/) | The big luxury names | Umekita / Grand Green Osaka, floors 28–38 | $550–800 | Japan's first Waldorf Astoria, on the top floors of the Grand Green Osaka complex above Umeda station, opened recently. |
| Osaka | Patina Osaka | [map ↗](https://www.google.com/maps?cid=1397153970431032509) | [site](https://patinahotels.com/osaka/) | The big luxury names | Banbacho, by Osaka Castle Park | $650–700 | A luxury hotel one minute from Osaka Castle Park, with the lobby, the bar and an open rooftop on the 20th floor facing the castle. |
| Osaka | Zentis Osaka | [map ↗](https://www.google.com/maps?cid=3268535993116507316) | [site](https://zentishotels.com/en/osaka/) | Boutique and mid-range | Dōjimahama, between Umeda and Nakanoshima | $100–175 | A boutique hotel in Dojimahama where the entry room is a 25-square-metre studio with a kitchenette counter, so a stay works like a small flat. |
| Osaka | Hotel Noum OSAKA | [map ↗](https://www.google.com/maps?cid=14769462904248915675) | [site](https://www.no-um.jp/en) | Boutique and mid-range | Tenmabashi, on the Ōkawa river | $75–150 | A design hotel at Tenmabashi facing the Okawa river, with a cafe and bar downstairs that stay open late. |
| Nikkō | NIKKO KANAYA HOTEL | [map ↗](https://www.google.com/maps?cid=7188186438001169666) | [site](https://www.kanayahotel.co.jp/en/nkh/) | — | Kami-Hatsuishi hillside, above the Daiya river | rate not researched — check live | Japan's oldest surviving Western-style resort hotel, and the building is the reason to stay: carved woodwork through the halls and a main dining room from the old wings. |
| Nikkō | The Ritz-Carlton, Nikko | [map ↗](https://www.google.com/maps?cid=14083782700276744005) | [site](https://www.ritzcarlton.com/en/hotels/tyonz-the-ritz-carlton-nikko/overview/) | — | Oku-Nikkō, on the Lake Chuzenji shore | rate not researched — check live | A lakeside resort on Lake Chuzenji with Mount Nantai across the water, and the first Ritz-Carlton anywhere built on a hot spring, piped down from the Yumoto source. |
| Kanazawa | Hyatt Centric Kanazawa | [map ↗](https://www.google.com/maps?cid=18163347810694806014) | [site](https://www.hyatt.com/hyatt-centric/kmqct-hyatt-centric-kanazawa) | — | At Kanazawa Station | $170–260 | A mid-range Hyatt two minutes from the west exit of the shinkansen station, with newer hardware than the local competition and more than a hundred works by Kanazawa artists and craftspeople through the house. |
| Kanazawa | Sōki Kanazawa | [map ↗](https://www.google.com/maps?cid=8660080219350320087) | [site](https://www.uds-hotels.com/soki/kanazawa/) | — | Opposite Ōmichō Market | $100–180 | A design hotel opposite Omicho market, so the fish market is across the street and breakfast can be a rice bowl at a stall. |
| Kanazawa | The Hotel Sanraku | [map ↗](https://www.google.com/maps?cid=3210540274978094631) | [site](https://sanraku.kenhotels.com/kanazawa/en/) | — | Castle ↔ Ōmichō | $180–280 | A small luxury hotel between the castle and Omicho market, opened recently, with large stone-and-wood bathrooms and a breakfast reviewers single out. |
| Takayama | Hotel Wood Takayama | [map ↗](https://www.google.com/maps?cid=4068755749003767876) | [site](https://www.hotel-wood.com/en/) | — | Historic district | $150–250 | A modern-timber hotel steps from the historic district, with rooms lined in local cedar and evening sake tastings in the lounge. |
| Takayama | Cup of Tea Ensemble | [map ↗](https://www.google.com/maps?cid=4281950464834715407) | [site](https://cupoftea-takayama.net/ensemble/en/stay/) | — | Hida Takayama Onsen, walk to old town | $130–250 | A small hotel by Hida Takayama Onsen finished in thinned local timber and persimmon-tannin dye, so the town's woodwork is in the room itself. |
| Takayama | IORI Stay (whole machiya) | [map ↗](https://www.google.com/maps?cid=8786461207275239765) | [site](https://iori-stay.com/stays/iori-takayama/) | — | Old town | $450–650 | A restored hundred-year-old machiya let whole to one party a night, with cypress baths in some houses and no lobby, no neighbours and no front desk. |
| Sendai | The Westin Sendai | [map ↗](https://www.google.com/maps?cid=100035522374560294) | [site](https://www.marriott.com/en-us/hotels/sdjwi-the-westin-sendai/overview/) | — | Sendai Trust Tower, ~9-min walk from the station | $220–340 | The city's luxury pick by default, on the top floors of Sendai's tallest tower: rooms from the 28th floor look to the Pacific and the Zao range. |
| Sendai | Hotel Metropolitan Sendai East | [map ↗](https://www.google.com/maps?cid=11881308586790047385) | [site](https://sendai-e.metropolitan.jp/) | — | On JR Sendai Station | $150–240 | A mid-range JR hotel built over Sendai station, so the shinkansen and the Matsushima trains are downstairs and a short stop costs no transit time. |
| Sendai | Mitsui Garden Hotel Sendai | [map ↗](https://www.google.com/maps?cid=15896202216254183646) | [site](https://www.gardenhotels.co.jp/sendai/) | — | Honchō, off Hirose-dōri | rate not researched — check live | A business hotel off Jozenji-dori, the zelkova avenue, with an 18th-floor bath house that has an open-air pool looking over the city. |
| Hiroshima | KIRO Hiroshima by THE SHARE HOTELS | [map ↗](https://www.google.com/maps?cid=11574391172115413747) | [site](https://www.thesharehotels.com/kiro/) | — | Mikawa-chō, downtown (walk to Peace Park) | $130–200 | A design hotel in a converted downtown hospital, where the old indoor pool is now the lounge, with a coffee counter beside it and Seto-region art and furniture through the rooms. |
| Hiroshima | THE KNOT HIROSHIMA | [map ↗](https://www.google.com/maps?cid=3852773620326198519) | [site](https://hotel-the-knot.jp/hiroshima/en/) | — | Directly opposite Peace Memorial Park | $120–200 | A mid-range design hotel directly opposite the Peace Memorial Park, which makes it the best-placed bed in town for the memorial morning. |
| Hiroshima | RIHGA Royal Hotel Hiroshima | [map ↗](https://www.google.com/maps?cid=2793274772327511974) | [site](https://www.rihga.com/hiroshima) | — | Motomachi, by the castle (5–10 min walk to Peace Park) | $160–280 | The city's grande dame, a tower by the castle in Motomachi, and the easy central choice for a one-night stop. |
| Fukuoka | The Ritz-Carlton, Fukuoka | [map ↗](https://www.google.com/maps?cid=4019100722797758021) | [site](https://www.ritzcarlton.com/en/hotels/fukrz-the-ritz-carlton-fukuoka/overview/) | — | Daimyō Garden City, Tenjin | $650–900 | The luxury answer in Fukuoka, on the top floors of a Tenjin complex, and this or nothing here according to FlyerTalk's Japan regulars. |
| Fukuoka | Miyako Hotel Hakata | [map ↗](https://www.google.com/maps?cid=8104812217387566281) | [site](https://en.miyakohotels.ne.jp/hakata/) | — | On Hakata Station | $140–220 | A comfortable mid-range hotel over Hakata station whose rooftop spa has indoor and open-air hot-spring pools, which a city hotel rarely offers. |
| Fukuoka | Hotel Il Palazzo | [map ↗](https://www.google.com/maps?cid=5157776137633665476) | [site](https://ilpalazzo.jp/en/) | — | Haruyoshi, by the Naka river | rate not researched — check live | Japan's first designer hotel, and the red travertine facade and colonnade on the Naka river in Haruyoshi are the original ones. |
| Beppu | GALLERIA MIDOBARU | [map ↗](https://www.google.com/maps?cid=14563146951819742333) | [site](https://beppu-galleria-midobaru.jp/en/) | — | Mido-baru hillside, above Beppu Bay | $250–400 | A design hotel on the steaming Mido-baru hillside where every room has its own hot-spring bath and a balcony over Beppu Bay. |
| Beppu | ANA InterContinental Beppu Resort | [map ↗](https://www.google.com/maps?cid=7041916728449616995) | [site](https://anaicbeppu.com/en/top/) | — | Horita highlands, above the city | $450–700 | A polished onsen resort in the Horita highlands above the city: hot-spring baths, an infinity pool over the bay, and terrace suites with their own outdoor tubs. |
| Beppu | Suginoi Hotel | [map ↗](https://www.google.com/maps?cid=305412547823068297) | [site](https://suginoi.orixhotelsandresorts.com/) | — | Kankaiji hillside, above the bay | rate not researched — check live | The Tanayu is the reason to come: five open-air pools terraced down the Kankaiji hillside, all of them facing Beppu Bay. |
| Kumamoto | THE BLOSSOM KUMAMOTO | [map ↗](https://www.google.com/maps?cid=8047630828801114402) | [site](https://www.jrk-hotels.co.jp/en/Kumamoto/) | — | Atop JR Kumamoto Station (Amu Plaza, floors 9–12) | $130–220 | A mid-range hotel on top of Kumamoto station: the lift runs from the shinkansen to a 27-square-metre modern Japanese room, which makes it the frictionless night between ryokan legs. |
| Kumamoto | OMO5 Kumamoto by Hoshino Resorts | [map ↗](https://www.google.com/maps?cid=12670613550056070621) | [site](https://hoshinoresorts.com/en/hotels/omo5kumamoto/) | — | Downtown — 5-min walk to the castle, on the arcades | $135–240 | A design hotel downtown on the covered arcades, with a rooftop terrace facing the illuminated castle keep five minutes' walk away. |
| Kumamoto | Onyado Nono Kumamoto | [map ↗](https://www.google.com/maps?cid=11053085772317450474) | [site](https://dormy-hotels.com/dormyinn/hotels/nono_kumamoto/) | — | By Sakuramachi Bus Terminal, ~5 min to the arcades | $110–165 | A ryokan-style hotel by the Sakuramachi bus terminal: shoes off at the door, tatami throughout, and a top-floor hot-spring bath with an outdoor pool and a sauna. |
| Nagasaki | Hotel Indigo Nagasaki Glover Street | [map ↗](https://www.google.com/maps?cid=12436252807261624389) | [site](https://nagasaki.hotelindigo.com/en/) | — | Minami-Yamate — on Glover Street itself | $135–250 | A restored 19th-century redbrick on Glover Street itself, inside the old foreign-settlement district, and the pick for a first visit. |
| Nagasaki | Nagasaki Marriott Hotel | [map ↗](https://www.google.com/maps?cid=6279844900961491106) | [site](https://www.marriott.com/en-us/hotels/ngsmc-nagasaki-marriott-hotel/overview/) | — | Over JR Nagasaki Station (AMU Plaza) | $240–420 | A chain hotel built over Nagasaki station, opened recently, where guests name the staff as the best part of the stay. |
| Nagasaki | Garden Terrace Nagasaki | [map ↗](https://www.google.com/maps?cid=4667065101170157487) | [site](https://www.gardenterrace-nagasaki.co.jp/) | — | Akasako hillside, ~10 min from centre by taxi | $220–380 | A design resort on the Akasako hillside that frames the city's night panorama from the room and from the bath, which is the reason people book it. |
| Nagasaki | Setre Glover's House | [map ↗](https://www.google.com/maps?cid=4554416796099264006) | [site](https://www.setre-glover.com/) | — | Minami-Yamate, by Glover Garden & Ōura | $180–300 | A small hotel in the Minami-Yamate harbour quarter whose kitchen cooks creatively from Nagasaki produce, and dinner in the house is the reason to stay. |
| Kagoshima | Sheraton Kagoshima | [map ↗](https://www.google.com/maps?cid=11738508066768117692) | [site](https://www.marriott.com/en-us/hotels/kojsi-sheraton-kagoshima/overview/) | — | Near Tenmonkan | $130–220 | A full-service chain hotel by the Tenmonkan arcades, opened recently, with floor-to-ceiling Sakurajima views and a hot-spring floor drawing real onsen water. |
| Kagoshima | Shiroyama Hotel | [map ↗](https://www.google.com/maps?cid=14457951521788314209) | [site](https://www.shiroyama-g.co.jp/en/) | — | Hilltop above the city | $170–280 | The hilltop hotel above town, where the open-air onsen faces Sakurajima across the bay. |
| Kagoshima | Good Fellows Resort U/Q | [map ↗](https://www.google.com/maps?cid=8482090062344223048) | [site](https://www.ikyu.com/00052534/) | — | Iso Beach, by Sengan-en (~10 min from centre) | $155–225 | A two-room villa on Iso Beach next to Sengan-en, where Sakurajima fills the window and one room has a private ocean-view sauna. |

**A ryokan in the city itself.** Where a city has an inn rated **8** or better — or in the top half of the B band, 7.5 and up — it is named here. Extra to the hotels above; the full row for each is in the master inn table.

- **Kyoto** — Hiiragiya (A 8.7)
- **Nara** — Tsukihitei (A 8.1) · Fufu Nara (B 7.7)
- **Hakone** — Hakone Suishoen (A 8.2) · Gora Kadan (B 7.5)
- **Nikkō** — Fufu Nikko (A 8.8)
- **Takayama** — Wanosato (A 8.3)
<!-- /generated:hotels -->

**Osaka and Nara — the neighbourhood is the decision.** Both are a short train from Kyoto with shorter lists.

- **Osaka** — **Namba or Shinsaibashi** to walk home from dinner; **Umeda / Kita** to move on by train next morning. The cheapest big city for a good room, and a fair base when Kyoto is booked out.
- **Nara** — small; everything sits between the station and the park. Overnight buys the temples at eight in the morning.

Where a band says *check live*, read one off the property's page for the actual dates.

### When the stop or the budget is outside these tables

The tables are a **design-and-luxury list** and do not cover every town. Say so plainly — "Japan is not expensive, this particular list is" — and use the research method in the appendix; a find is presented as a row of the same table, its band marked "unverified — check live for your dates".

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

**Where a `fits` tag holds fewer than five inns, say so** and offer the nearest tag rather than padding: a short honest list plus a named neighbour beats a fifth that is filler.

### The follow-up questions — ask only when they change the pick

**Ask one of these only when the options in front of them differ on it** — if all five have a private bath, tattoos are moot — and at most two at a time.

- **A private bath?** Ask if anyone has **tattoos**, is shy about communal bathing, or wants the bath to themselves: baths are nude and gender-separated, and many still refuse visible tattoos. A **bath in the room** or a **bookable private bath** settles it. Check the property's page for **overnight guests**; a day-visitor rule is a different rule.
- **A sauna?** Common at newer inns, but usually gender-separated like the baths. Two people saunaing together need a **private or rental sauna**, or a mixed facility with swimwear.
- **How heavy do you want dinner?** Some kitchens serve a long formal *kaiseki*; others something lighter — French, wood-fired, farm produce, temple cooking. Two ryokan nights close together go on different kitchens.
- **Floor mattress or bed?** A traditional room means a *futon* on the tatami at bedtime: fine for most, hard on bad backs. The `bed-not-futon` tag marks inns whose write-up mentions beds.
- **How formal?** Traditional: meals in your room, staff kneeling at the door. Modern-luxury: a dining room, wear what you like. People have strong preferences and rarely volunteer them.
- **Children, and how many of you?** Ask **before** showing inns to a family. Policies vary, the best inns are strictest, and the rule is often only in Japanese: check the page, then confirm by email.
- **Dietary needs?** Inn menus are fixed weeks ahead; vegetarian, no fish, an allergy are usually possible if stated at booking, never on arrival.

### The decision

Fill a stop's row once they have settled on it — after the exploring, not in the message that first showed the options. Stage 3 opened the itinerary table; this stage fills the three columns it left empty. **After each stop is settled, re-show only that stop's row**; the whole table is shown once, when the last stop is filled.

**Trip plan** · `<dates>` · `<n>` nights · arrive `<airport>`, depart `<airport>`

| # | Stop | Nights | Stay | Band | Alternate |
|---|---|---|---|---|---|
| | ↓ in from `<airport>` · `<h>h` · `<n>` changes · `<mode>` | | | | |
| 1 | `<stop>` | `<n>` | [`<name>`](`<link>`) | `<band>` | [`<name>`](`<link>`) |
| | ↓ `<h>h` · `<n>` changes · `<mode>` | | | | |
| 2 | `<stop>` | `<n>` | [`<name>`](`<link>`) | `<band>` | [`<name>`](`<link>`) |
| | ↓ `<h>h` · `<n>` changes · `<mode>` | | | | |
| 3 | `<stop>` | `<n>` | [`<name>`](`<link>`) | `<band>` | [`<name>`](`<link>`) |
| | ↓ out to `<airport>` · `<h>h` · `<n>` changes · `<mode>` | | | | |

**Totals:** `<n>` travel hours · `<n>` changes · `<n>` check-ins · `<n>` inn nights / `<n>` city nights · `<n>` one-nighters. Every figure here comes from `plan`, the airport legs' changes included, never typed; the travel total sums the leg rows above, both airport legs in it, rounded to five minutes.

**Notes:** `<shuttle window, last-mile detail>`, one per stop that needs one. **Assumed:** `<every default you chose for them>`.

**To confirm**

1. `<unsourced leg, unverified opening, shuttle to arrange>`

**Every stay is a link, and the link is the real place**: a hotel to its own Google Maps pin — the `Map` cell of the hotel table, never a maps search built out of the name — and an inn to its `ryokancatalog.com` page, the `Link` cell of the master table. `Alternate` is a link too: it is the answer when the first choice is full, and an unlinked name is not one.

## Stage 5 — Make the route work

```
Goal    the stops in an order that doesn't waste days, with every journey sourced
Inputs  the itinerary table as Stage 4 left it; the corridor tables below
Do      the eight steps, in order — most of it is arithmetic, and doing it in your head is how mistakes get in;
        the two orders are compared in a `| Order | Hours | Per night | Changes | Check-ins | Inn / city nights | One-nighters |` table
Ask     1 question — which of the two orderings, once you have priced both
Output  the itinerary table finished, with totals. This is the deliverable. Then offer the visual
        in one line — see guides/visualizing-the-trip.md, and fill guides/trip-visual-template.html
Next    offer Stage 6 in a single line. If they don't want it, they have what they came for.
```

**With the engine, this stage is one command.** `cd builder && node route.js plan "<the chosen stop string>" --in <airport> --out <airport>` prints the itinerary table, the totals with their arithmetic and the checks; paste it, fill the stays from Stage 4, and go to the visual. The steps below are the chat-only version of the same arithmetic.

### The process

1. **List the stops** in the order they currently sit, with their nights.
2. **Look up every consecutive pair** in the corridor tables below — the same tables the Stage 3 menu was priced from, so most of these rows are already filled in. Write the hours, the changes and the mode down exactly as given.
3. **Reverse the list and price the reverse** the same way — and price it honestly. **Check both orders for backtracking first:** a stop that can only be reached by passing back through one already left behind is in the wrong place, and no amount of arithmetic fixes it — resequence, then price. The airport at the end is the one allowed exception. Any pair the tables do not hold and no hub composes (step 4) is written `to confirm`, and a total that contains one is **not a number**: write it as `≥ 6h20 (partial — 2 legs unsourced)`, the sum of the legs you actually have, the `≥`, and the count of the ones you do not. Never fill a gap so that the two totals can be compared as equals; if the reverse is partial, say which order is provably cheaper and which is only probably.
4. **Compose any pair the tables don't hold through a hub city** — Tokyo, Sendai, Kyoto, Osaka, Nagoya, Kanazawa, Okayama, Hiroshima, Fukuoka, Kumamoto, Nagasaki, Kagoshima, Sapporo — per the composed-leg bullet below. Only a pair no hub joins is `to confirm`; look it up live if you can browse, and label the result an estimate.
   - **4a. Before any live lookup, grep the full leg table.** In the split layout `data/transit-legs.md` holds every sourced leg in the dataset — hundreds of them, including the inn legs the corridor table leaves out — so search it for both place names, in both directions, before you go outside. Only look a pair up live if it is absent there too.
5. **Add both orderings up** — hours and changes — and show the two totals side by side, as the comparison table, one row per order:

   | Order | Hours | Per night | Changes | Check-ins | Inn / city nights | One-nighters |
   |---|---|---|---|---|---|---|
   | `<as travelled, named by its first and last stop>` | `<n>` | `<min>` | `<n>` | `<n>` | `<n>` / `<n>` | `<n>` |
   | `<reversed>` | `<n>` | `<min>` | `<n>` | `<n>` | `<n>` / `<n>` | `<n>` |

   Per night is the total, both airport legs in it, divided by the nights and rounded half up to the minute, with each domestic flight leg counted at three hours at most; the Hours cell prints the true time. The numbers live in the table and nowhere else; the prose under it names the trade-off and nothing more. Where one side has an unsourced leg, its total keeps the `≥ X h (partial — N legs unsourced)` form all the way into the verdict. If the sourced part of the partial total is already the larger of the two, the comparison is settled and you can say so.
6. **Check the defaults survive the order you chose:** every city at or above its card's minimum, each visit of a split city two nights or more except a final airport-side night · one night at each inn unless the plan argued for two · no more than three inn dinners in a row · no zig-zags · an exit airport that suits the last stop — **leave from where you end**, rather than travelling back to the airport you arrived at to take off from it.
7. **Add the totals up in writing, including the journey out to the departure airport.** That last leg is part of the trip and is the one people forget; the airport table has it. Show the sum rather than the answer — `2h + 4h42 + 45min + 1h06 (to the airport) = 8h33`, and `changes 0+2+0+0 = 2` — so a reader can check the arithmetic.
8. **Present the winner with the trade-off against the runner-up** in a sentence — "an hour longer, but it drops a change and ends near the airport" — then finish the itinerary table. **Re-add the totals against the finished table before you send it**: the order changes last, and the totals go stale first.

Steps 2 and 4 are the ones that get skipped, and skipping them is what puts an invented number into an itinerary. Step 7 gets fudged.

### The corridor cheat-sheet

The main city-to-city journeys, the stops the Stage 3 shapes route through, and the airport transfers, each with **door-to-door hours** and the **number of changes**: the whole journey, including getting to the station, the connections and the last leg at the other end, rather than the time the train is moving.

**Use this table. Never invent a number.** If a pair isn't here — check both directions before deciding it isn't — say plainly that you don't have a sourced time and that they should check it before locking the order in. A confident wrong number is worse than an honest gap. The same the other way: don't round a four-hour leg down to "a few hours".

<!-- generated:corridors -->
*176 journeys, door to door — station or hotel at one end to the other, including the walk and the wait, not just the train's timetable. "Changes" is how many times you get off and on again. Every line was looked up in a real timetable; nothing here is calculated. **Every journey runs the same both ways**, and each row is printed in the direction its sourced description was written — read From/To as a pair, not as an order.*

| From | To | Door to door | Changes | Mode | Route |
|---|---|---|---|---|---|
| Tokyo | Sendai | 1h42 | 0 | shinkansen | Tōhoku Shinkansen 'Hayabusa' direct Tokyo→Sendai (~1h31). |
| Tokyo | Kanazawa | 2h42 | 0 | shinkansen | Hokuriku Shinkansen 'Kagayaki' direct Tokyo→Kanazawa (~2h28). |
| Takayama | Tokyo | 4h54 | 1 | train | JR Ltd Exp 'Hida' Takayama→Nagoya (~2h30), change ~15 min to a Tōkaidō 'Nozomi'→Tokyo (~1h42) + hotel/station ends. (Via Toyama is nominally quicker — 'Hida' ~1h30 + Hokuriku Shinkansen ~2h06 — but only ~4 Toyama through-trains run per day.) |
| Tokyo | Kyoto | 2h45 | 0 | shinkansen | Tokaido Shinkansen Nozomi direct Tokyo→Kyoto (~2h15). |
| Osaka | Tokyo | 3h15 | 1 | shinkansen | Tōkaidō 'Nozomi' Tokyo→Shin-Osaka (~2h35, multiple per hour, ¥13,870 non-reserved / ¥14,500 reserved; 'Hikari' ~3h), then the Midōsuji subway Shin-Osaka→Umeda — a ~4-min ride, ~15 min with the walk and wait, and the leg's single self-handled change. ⚠ Tōkaidō services run all-reserved over the New Year peak — book ahead. |
| Tokyo | Hakone | 2h12 | 1 | train | Odakyu Romancecar Shinjuku→Hakone-Yumoto (~85 min), Tozan railway→Kōwakudani (~35 min), 5-min inn shuttle (reserve). |
| Tokyo | Nikkō | 2h | 0 | train | Tōbu Ltd Exp Asakusa→Tōbu-Nikkō (~2h), then ~5-min taxi. |
| Tokyo | Izu peninsula (Shuzenji) | 1h45 | 0 | train | 'Kodama'/'Hikari' Tokyo→Mishima (~45-55 min, every ~30 min), then the flat-rate cab into the Shuzenji valley (~40-50 min, book with the room). No self-handled change. Rail alt: Izuhakone Sunzu line→Shuzenji (~35 min) + short taxi, +1 change. |
| Tokyo | Echigo-Yuzawa (snow country) | 1h45 | 0 | train | Jōetsu Shinkansen Tokyo→Echigo-Yuzawa (~75 min), then ~30 min by car (inn can arrange). |
| Tokyo | Minakami / Tanigawa (snow country) | 1h40 | 0 | train | Jōetsu Shinkansen Tokyo→Jōmō-Kōgen (~66–70 min), then a ~20-min taxi (¥5,500 on a 2024 guest report; rank taxis wait at the station). Senjuan's own access page gives this exact chain as 約100分 door-to-door from Tokyo Stn — that's the figure used here. Its free pickup runs from MINAKAMI Stn (Jōetsu-line local), not Jōmō-Kōgen, and the inn quotes that relay-bus-to-Minakami chain at 約110分 — so the taxi wins by ~10 min and a great deal of hassle. |
| Lake Kawaguchi (Mt Fuji) | Tokyo | 2h | 0 | train | JR 'Fuji Excursion' Ltd Exp Kawaguchiko→Shinjuku direct (~2h, ~4/day). Miss it → Fujikyu→Ōtsuki + Chūō Ltd Exp = ~2h25, 1 change. |
| Tokyo | Kakunodate | 3h06 | 0 | shinkansen | Akita Shinkansen 'Komachi' direct Tokyo→Kakunodate (~3h, one seat). Snow-prone on the single-track stretch past Morioka. |
| Tokyo | Nyūtō Onsen | 4h | 1 | shinkansen | Akita Shinkansen 'Komachi' Tokyo→Tazawako ~2h50 (slower runs to 3h12), then the Ugo Kōtsū Nyūtō-line bus from Tazawako Station bay 1, 45-50 min to the Nyūtō Onsen-kyō stops, ~9-10 departures a day (¥800). The hourly headway means a 15-30 min wait, which is what makes it four hours door to door; a taxi is ~30 min / ~¥7,000. ⚠ January: the Komachi runs snow-prone single track past Morioka and the bus climbs a snow-walled mountain road. Tsuru-no-yu meets guests at the Alpa Komakusa stop by arrangement; Taenoyu runs no station shuttle. |
| Tokyo | Nagoya | 2h06 | 0 | shinkansen | Tōkaidō 'Nozomi' Tokyo→Nagoya, ~1h35–1h40, every ~10 min ('Hikari' ~1h50; 'Kodama' ~2h50). Station-anchored like tokyo>kyoto — from a central hotel door add the walk to the trunk. |
| Sendai | Kanazawa | 4h30 | 1 | train (two researched halves) | No single through-service — the real route changes at Tokyo (≈4 hr 30 min door-to-door). Times composed from the researched legs to and from Tokyo. |
| Sendai | Takayama | 6h30 | 2 | train (two researched halves) | No single through-service — the real route changes at Tokyo (≈6 hr 30 min door-to-door). Times composed from the researched legs to and from Tokyo. |
| Minakami / Tanigawa (snow country) | Sendai | 2h30 | 1 | train | Inn shuttle to Jōmō-Kōgen, Jōetsu Shinkansen→Ōmiya (~45 min), change to Tōhoku Shinkansen 'Hayabusa'→Sendai (~1h20) — all Shinkansen, one change. |
| Kakunodate | Sendai | 2h15 | 0 | shinkansen | Akita Shinkansen 'Komachi' Kakunodate→Morioka→Sendai as one through train (~2h05, no change), then a ~12-min taxi/inn car at the Kakunodate end (reserve). |
| Sendai | Nyūtō Onsen | 2h30 | 1 | shinkansen | The 'Komachi' is a through train at Sendai, so Sendai→Tazawako is 1h19 with no change, then the same 45-50 min hourly Nyūtō-line bus. ⚠ Same January exposure on the Morioka-Tazawako section and the mountain bus road. |
| Takayama | Kanazawa | 2h24 | 0 | bus | Nohi/Hokutetsu highway bus Takayama Nohi Bus Center→Kanazawa Stn west exit via Shirakawa-gō (~2h15, direct, reserve — the bus centre is at Takayama Stn, a 7-min walk from the inn). No rail link exists; the bus is the fast way. |
| Kanazawa | Kyoto | 2h30 | 1 | train | Hokuriku Shinkansen Kanazawa→Tsuruga (~50 min), change to Thunderbird Ltd Exp→Kyoto (post-2024 routing). Snow-risk in January. |
| Osaka | Kanazawa | 2h45 | 1 | train | Ltd Exp 'Thunderbird' Osaka Stn→Tsuruga (~1h20), ~10-min change at Tsuruga, Hokuriku Shinkansen Tsuruga→Kanazawa (~40 min) — ~2h10–2h30 station to station. Departs central Osaka, so there is no Shin-Osaka hop; the Tsuruga change is the one the Mar 2024 extension imposed (the one-seat Thunderbird to Kanazawa is gone). ⚠ January snow on the Hokuriku coast delays this corridor. |
| Kanazawa | Nikkō | 4h | 2 | shinkansen | Hokuriku Shinkansen Kanazawa→Ōmiya (~2h01), Tōhoku 'Yamabiko'/'Nasuno' Ōmiya→Utsunomiya (~25 min), change to the JR Nikkō Line local→Nikkō (~45 min, ~hourly) + inn shuttle. Two changes (Ōmiya, Utsunomiya) — reaches Fufu via the JR side, not the Asakusa Tōbu. |
| Echigo-Yuzawa (snow country) | Kanazawa | 3h30 | 1 | shinkansen | Modern route is all-Shinkansen with ONE change: ~25-min inn car/flat-¥5,000 taxi to Echigo-Yuzawa, Jōetsu 'Toki'→Takasaki (~22 min), cross to the Hokuriku 'Hakutaka'→Kanazawa (~2h05, timetabled; timed pairings run the station chain in 2h55–3h00). ~3h30 door-to-door. (Hokuhoku alt via Jōetsumyōkō is ~3h40–4h over 2–3 changes on a sparse line where half the trains terminate at Muikamachi and no IC cards are accepted — no faster, far less robust.) |
| Kanazawa | Yamashiro Onsen (Kaga) | 36 min | 0 | train | Kanazawa→Kaga-Onsen (~15–30 min), then Beniya Mukayu's free on-demand shuttle (~15 min; runs 14:20–18:00, call your arrival time ahead; returns every 30 min 8:45–11:15) — or a ~¥3k taxi. |
| Kanazawa | Yamanaka Onsen (Kaga) | 54 min | 0 | train | Kanazawa→Kaga-Onsen (~25 min), then ~25-min taxi up to Yamanaka (inn can arrange). |
| Minakami / Tanigawa (snow country) | Kanazawa | 3h15 | 1 | shinkansen | ~20-min taxi to Jōmō-Kōgen, Jōetsu Shinkansen→Takasaki (~15 min), cross to the Hokuriku 'Hakutaka'→Kanazawa (2h15–2h18, timetabled). One change, at Takasaki. Sibling of echigoyuzawa>kanazawa and ~30 min shorter for the same reasons Senjuan is always nearer: Jōmō-Kōgen is closer to Takasaki and the last mile is a shorter taxi. |
| Takayama | Kyoto | 3h48 | 1 | train | JR Ltd Exp 'Hida' Takayama→Nagoya (~2h30; 10/day — hourly only ~11:30–16:30, with 2h gaps outside), ~15-min transfer to a Tōkaidō Shinkansen 'Nozomi'→Kyoto (34 min). Alt with NO change: Hida 36 departs Takayama 15:33 direct to Kyoto, arr 19:17. ⚠ The Takayama line is snow-exposed — JR Central posts 大雪 advisories most Januaries; keep same-day slack. (All-reserved Dec 25–Jan 5; mixed seating otherwise.) Equal-time alternative that dodges that exposure: the Nohi highway bus Takayama→Nagoya + the same Nozomi — Maps returns this chain, not the Hida, as its three fastest (3h25–3h33 station-to-station), so take whichever the weather favours. |
| Takayama | Osaka | 3h54 | 2 | train | JR Ltd Exp 'Hida' Takayama→Nagoya (~2h25; 10/day, hourly only ~11:30–16:30, 2h gaps outside), ~20-min cross-platform transfer to a Tōkaidō Shinkansen 'Nozomi' Nagoya→Shin-Osaka (~50 min, frequent), then the Midōsuji subway Shin-Osaka→Umeda/Namba (~5–10 min) + the walk to the hotel. Two changes, at Nagoya and Shin-Osaka. ⚠ the Takayama Line is snow-exposed — JR Central posts 大雪 advisories most Januaries, and Dec 25–Jan 5 is all-reserved; keep same-day slack. Equal-time alternative that dodges the exposure: the Nohi highway bus Takayama→Nagoya + the same Nozomi. Sources: japan-guide Takayama access; JR Central Tōkaidō/Takayama Line timetables. |
| Takayama | Yamashiro Onsen (Kaga) | 2h36 | 1 | train | JR Ltd Exp 'Hida' Takayama→Toyama (~1h30), cross to the Hokuriku Shinkansen down to Kaga-Onsen — Maps times the pair at 2h21 station-to-station (11:03→13:24, ¥8,710) — then Beniya Mukayu's free on-demand shuttle (~15 min; call your arrival ahead). One change at Toyama. ⚠ only ~4 Hida round trips/day run through to Toyama — pin the departure before booking. Fallback, and the more forgiving option if the morning doesn't line up: Nohi bus Takayama→Kanazawa (~2h15, direct, reserved) + Hokuriku Shinkansen Kanazawa→Kaga-Onsen (~20 min), which Maps times at 3h07 station-to-station → ~3.4h door-to-door. |
| Takayama | Yamanaka Onsen (Kaga) | 2h48 | 1 | train | JR Ltd Exp 'Hida' Takayama 11:03→Toyama 12:32 (1h29), cross to a through Hokuriku Shinkansen→Kaga-Onsen (43 min, hourly) — Maps times the pair at 2h21 station-to-station — then a ~25-min taxi up to Yamanaka Onsen (the inn can arrange). One change at Toyama. ⚠ hangs on the 11:03 Hida: only ~4 through-trains/day reach Toyama, and every other departure is the Takayama Line local (2h16–2h25 to Toyama alone). Miss it and the fallback is the Nohi bus Takayama→Kanazawa (~2h15) + the southbound leg, ~3.3h — which is what |
| Takayama | Nagoya | 2h45 | 0 | train | JR Ltd Exp 'Hida' Takayama→Nagoya, ~2h25 direct, 10 a day (hourly only ~11:30–16:30, 2h gaps outside), ¥5,610 unreserved / ¥6,140 reserved, + the 7-min walk from the inn/old town. ⚠ Snow-exposed — JR Central posts 大雪 advisories most Januaries, all-reserved Dec 25–Jan 5. Equal-time alternative when the line is under an advisory: the Nohi highway bus Takayama Nōhi BC→Meitetsu BC Nagoya, ~2h45, reserved. |
| Kyoto | Nara | 45 min | 0 | train | Kintetsu Kyoto→Kintetsu-Nara (~45 min), ~5-min taxi. |
| Osaka | Kyoto | 45 min | 0 | train | JR Special Rapid Kyoto→Osaka Stn (~29–30 min, ¥580, frequent, no change) — central station to central station, so ~45 min door-to-door with the hotel ends. Alternatives from the Gion/Kawaramachi side: Hankyu Kyoto-Kawaramachi→Osaka-Umeda ~40 min ¥410, Keihan Sanjō→Yodoyabashi ~50 min ¥490. |
| Hiroshima | Kyoto | 1h54 | 0 | shinkansen | Sanyo+Tokaido Shinkansen Nozomi direct Hiroshima→Kyoto (~1h35). |
| Fukuoka (Hakata) | Kyoto | 3h30 | 0 | shinkansen | Sanyo/Tokaido Shinkansen Nozomi/Mizuho Hakata→Kyoto, no change (~3h). |
| Kagoshima | Kyoto | 5h15 | 1 | shinkansen | Kyushu Shinkansen Mizuho Kagoshima-Chūō→Shin-Osaka (~3h45), change to Tokaido→Kyoto. |
| Hakone | Kyoto | 3h | 1 | train | Direct Tozan BUS Gōra/Sengokuhara→Odawara (~45 min — one seat; Tozan rail adds a Hakone-Yumoto change), then Tōkaidō Shinkansen→Kyoto (~1h50 on the ~2-hourly Odawara-calling 'Hikari'; 'Kodama'+change or ~2h40 all-Kodama otherwise). |
| Kyoto | Nikkō | 4h42 | 2 | shinkansen | Tōkaidō 'Nozomi' Kyoto→Tokyo (~2h15, ~4/hr), cross the Tokyo Stn Shinkansen concourse to a Tōhoku 'Yamabiko'/'Nasuno'→Utsunomiya (~50 min), change to the JR Nikkō Line local→Nikkō (~45 min, ~1–2/hr) + inn shuttle. Two self-handled changes (Tokyo, Utsunomiya). Chosen over the Asakusa Tōbu 'Spacia' (same ~1h50 tail, but a ~20–25-min crosstown from Tokyo Stn on top = +1 change). ⚠ ends on the hourly, snow-slow Nikkō local; ⚠ Tōkaidō services run all-reserved over the New Year peak. |
| Izu peninsula (Shuzenji) | Kyoto | 2h42 | 0 | train | The inn-bookable flat-rate cab Shuzenji valley→Mishima (~40-50 min; Asaba ¥12-15k, book with the room — Asaba runs NO shuttle), then the direct Mishima-calling 'Hikari'→Kyoto (1h50, ~2-hourly, dep Mishima :58 — reserve; hourly 'Kodama'+change fallback). No self-handled change. Rail alt: Sunzu line→Mishima (~35 min), +1 change. |
| Yamashiro Onsen (Kaga) | Kyoto | 2h | 1 | train | Beniya Mukayu shuttle→Kaga-Onsen (~15 min), 'Tsurugi'→Tsuruga (~37 min), cross-platform change (~10 min), 'Thunderbird' Ltd Exp→Kyoto (~55 min) the old ~1h30 used a stale pre-extension Thunderbird time. |
| Yamanaka Onsen (Kaga) | Kyoto | 1h36 | 1 | train | Kaga-Onsen→Tsuruga (~30 min), 'Thunderbird' Ltd Exp→Kyoto (~1h25). |
| Kyoto | Lake Kawaguchi (Mt Fuji) | 4h15 | 1 | shinkansen | Round the south side of Fuji rather than back through Tokyo: Fujikyu 'Mishima·Kawaguchiko Liner' bus Kawaguchiko→Mishima (~1h30–1h40, roughly hourly, ¥2,700 — japan-guide, Oct 2025), one change at Mishima, then the Tōkaidō Shinkansen Mishima→Kyoto (~1h51 on a Hikari that calls at Mishima, ~2h27 on the all-stations Kodama — ekitan). ~4h15 door-to-door with the inn shuttle and the change. (Via Tokyo — 'Fuji Excursion'→Shinjuku, cross to Tokyo Station, 'Nozomi'→Kyoto — is ~4h30 and two changes, and the Fuji Excursion runs only ~4/day.) |
| Kyoto | Miyajima | 2h42 | 2 | train | Shinkansen Kyoto→Hiroshima (~1h40), JR to Miyajimaguchi + ferry (~40 min), then ~3-min walk. |
| Kyoto | Okayama | 1h30 | 0 | shinkansen | Tōkaidō/Sanyō Shinkansen Kyoto→Okayama, ~60 min on a 'Nozomi' (several an hour) or ~90 min on the hourly 'Hikari', no change; 1.5h is door to door with platform access. |
| Kyoto | Nagoya | 54 min | 0 | shinkansen | Tōkaidō 'Nozomi' Kyoto→Nagoya ~35 min (several an hour; 'Hikari'/'Kodama' 40–60 min), ¥5,170 unreserved / ~¥6,000 reserved. The shortest Shinkansen hop on the board. |
| Nara | Osaka | 1h | 0 | train | Kintetsu Nara Line Rapid Express Kintetsu-Nara→Osaka-Namba (~36 min, direct, ~every 15 min). |
| Osaka | Hiroshima | 2h06 | 1 | shinkansen | San'yō 'Nozomi' Shin-Osaka→Hiroshima (~1h25; ~80 min on the fastest), plus the Midōsuji hop between Umeda and Shin-Osaka at the Osaka end. 'Sakura'/'Mizuho' run the same corridor a few minutes slower. |
| Osaka | Fukuoka (Hakata) | 3h06 | 1 | shinkansen | San'yō 'Nozomi'/'Mizuho' Shin-Osaka→Hakata (~2h30, several per hour, one seat), plus the Midōsuji hop between Umeda and Shin-Osaka. Hakata Stn is central Fukuoka, so no last mile at the far end. |
| Osaka | Hakone | 3h24 | 2 | shinkansen | Midōsuji hop Umeda→Shin-Osaka, Tōkaidō 'Hikari' Shin-Osaka→Odawara (~2h05 — the same ~2-hourly Odawara-calling 'Hikari' the hakone>kyoto leg uses at ~1h50 to Kyoto, plus the ~15-min Kyoto–Shin-Osaka segment; 'Nozomi' skips Odawara and all-'Kodama' is ~2h40), then the direct Tozan BUS Odawara→Gōra/Sengokuhara (~45 min, one seat; the Tozan rail adds a Hakone-Yumoto change). |
| Osaka | Nikkō | 5h12 | 3 | shinkansen | Midōsuji hop Umeda→Shin-Osaka, Tōkaidō 'Nozomi' Shin-Osaka→Tokyo (~2h35, ~4/hr), cross to a Tōhoku 'Yamabiko'/'Nasuno'→Utsunomiya (~50 min), then the JR Nikkō Line local→Nikkō (~45 min, ~1–2/hr) + inn shuttle. Three self-handled changes (Shin-Osaka, Tokyo, Utsunomiya) — the extra half-hour over the Kyoto twin is the further Nozomi run plus the Midōsuji hop. ⚠ the hourly Nikkō local is the fragile end; ⚠ all-reserved Tōkaidō over New Year. |
| Osaka | Nagoya | 1h36 | 1 | shinkansen | Tōkaidō 'Nozomi' Shin-Osaka→Nagoya (~50 min; 'Hikari'/'Kodama' 55–70 min), plus the Midōsuji hop between Umeda and Shin-Osaka. The shortest Shinkansen hop on the board out of Osaka. |
| Hiroshima | Fukuoka (Hakata) | 1h06 | 0 | shinkansen | Sanyo Shinkansen Nozomi direct Hiroshima→Hakata, no change (~1h). |
| Miyajima | Hiroshima | 1h | 1 | train | Ferry + JR back to Hiroshima (~50 min). |
| Hiroshima | Okayama | 54 min | 0 | shinkansen | Sanyō Shinkansen Hiroshima→Okayama, 34-35 min on a 'Nozomi' (3+ an hour) or 39 min on a 'Sakura'/'Hikari', no change. |
| Hiroshima | Naoshima (Miyanoura) | 2h45 | 3 | ferry | 'Nozomi' Hiroshima→Okayama (~35 min), Uno Line to Uno (~50 min, usually a change at Chayamachi), then the 20-min Shikoku Kisen ferry to Miyanoura. Work backwards from the 20:25 last sailing — leave Hiroshima by about 17:30. |
| Beppu | Fukuoka (Hakata) | 2h | 0 | train | Ltd Exp 'Sonic' Beppu→Hakata, ~1h51–2h05, NO change — and it leaves about every 30 minutes from early morning to late evening (JR Kyushu; jrpass.com). ~¥6,380 unreserved / ¥6,910 reserved. The single easiest leg in Kyushu: one seat, turn-up-and-go frequency, up the Nippō line along Beppu Bay via Kokura. |
| Kumamoto | Fukuoka (Hakata) | 42 min | 0 | shinkansen | Kyushu Shinkansen Kumamoto→Hakata — 'Mizuho' ~33 min, 'Sakura' ~38; several per hour. |
| Fukuoka (Hakata) | Nagasaki | 2h | 1 | train | Nishi-Kyushu Shinkansen + Ltd Exp Hakata→Nagasaki via Takeo-Onsen (~2h). |
| Fukuoka (Hakata) | Kagoshima | 1h24 | 0 | shinkansen | Kyushu Shinkansen 'Mizuho' Hakata→Kagoshima-Chūō (~1h17; 'Sakura' ~1h35), no change. |
| Fukuoka (Hakata) | Miyajima | 2h15 | 2 | train | Sanyo Shinkansen Nozomi Hakata→Hiroshima (~1h), JR Sanyo Main Line→Miyajimaguchi (~25 min), then the ~10-min ferry to Miyajima + short walk. |
| Yufuin | Fukuoka (Hakata) | 2h10 | 0 | train | Ltd Exp back toward Hakata (~2h10). |
| Amakusa (Matsushima) | Fukuoka (Hakata) | 1h54 | 1 | train | Inn-arranged car Tayuta→JR Kumamoto ~1h (per Tayuta's own access chart) via the Five Bridges + Misumi — coastal, snow-proof — then Kyushu Shinkansen 'Sakura'/'Mizuho' Kumamoto→Hakata (~33 min, every 20-30 min). Rail alt: 20-min taxi/boat→Misumi + JR Misumi line 50 min→Kumamoto (+1 change). |
| Kurokawa Onsen | Fukuoka (Hakata) | 2h42 | 0 | bus | Direct highway bus Kurokawa→Hakata/Fukuoka (~2.5–3h, reserve) — no train changes at all. |
| Amagase (Hita) | Fukuoka (Hakata) | 1h45 | 0 | train | Kyudai-line Ltd Exp 'Yufu'/'Yufuin no Mori' Amagase→Hakata, 1h35 ride + the Tensui pickup to Amagase Station. |
| Beppu | Kumamoto | 2h30 | 1 | train | Ltd Exp 'Sonic' Beppu→Kokura (~1h25, ~2/hr), change inside Kokura to the Kyushu Shinkansen 'Mizuho'/'Sakura'→Kumamoto (~50 min). ~2h30 door-to-door, one change at a single station. (The DIRECT cross-island option — the Hōhi-line Ltd Exp over the Aso caldera — is the scenic one but takes ~3h–3h30 and runs only 2/day, departing Kumamoto just after 09:00 and 15:00; treat it as a sightseeing choice, not the transfer.) |
| Beppu | Nagasaki | 4h | 2 | train | The long diagonal: Ltd Exp 'Sonic' Beppu→Hakata (~1h55–2h05), 'Relay Kamome'→Takeo-Onsen, timed cross-platform change to the Nishi-Kyushu Shinkansen 'Kamome'→Nagasaki (~2h Hakata→Nagasaki all told). ~4h, two changes, both high-frequency. By car ~245 km / ~3h15 (Ōita Expwy → Tosu JCT → Nagasaki Expwy) — the Nagasaki Expwy has no winter-regulated section, but the Hita–Hiji stretch at the Beppu end is an official winter-tire zone in January. |
| Beppu | Kagoshima | 3h12 | 1 | train | Ltd Exp 'Sonic' Beppu→Kokura (~1h25, ~2/hr), change at Kokura to a through 'Mizuho' down the Kyushu Shinkansen→Kagoshima-Chūō (~1h35; Kokura is a Mizuho stop, so this is one change for the whole island). ~3h10–3h20. (Doubling back via Hakata — Sonic ~1h51 + 'Mizuho' ~1h17 — comes out the same or slightly worse; Kokura is the cleaner pivot. The Nippō line straight down the east coast is a half-day — don't.) |
| Beppu | Yufuin | 1h | 0 | bus | Kamenoi bus Beppu Station→Yufuin Station, ~50 min, 1–2 per hour, ¥1,100 (japan-guide) — the turn-up-and-go option, and the reason Beppu and Yufuin pair so easily. ~1h05 by the Kurokawa association's reckoning; allow the inn shuttle at the Yufuin end. Scenic alt: the Ltd Exp 'Yufu'/'Yufuin-no-Mori' runs Beppu–Ōita–Yufuin direct in ~55 min, but only ~2–3/day and every seat is reserved (no unreserved cars at all) — book it as an experience, not a connection. Plain JR is ~80 min with a change at Ōita. By car ~1h over the top of the Yamanami. |
| Beppu | Kurokawa Onsen | 2h24 | 0 | bus | Kyushu Ōdan Bus direct, one seat over the Yamanami: Beppu Station 08:09 → Kurokawa Onsen 10:35 (~2h26; it's the same Beppu–Yufuin–Kurokawa–Aso–Kumamoto cross-island line). ⚠ Only 2 buses/day each way and the Beppu departure is the morning one — reserve (tickets are not sold at the stop machines), and the last Kurokawa→Yufuin/Beppu return is 16:55, so a transfer day must move early. By car it's the better call here: ~66 km / ~1h10 via Beppu IC → Hiji JCT → Kuju IC and the Yamanami Highway, but budget ~1h45 in January — the road crosses the Kuju highlands above 1,000 m and shaded stretches hold ice for days (low-road fallback via Kokonoe IC + R387). |
| Kumamoto | Nagasaki | 2h | 2 | train | Shinkansen→Shin-Tosu (~25 min), 'Relay Kamome'→Takeo-Onsen (timed cross-platform change), 'Kamome'→Nagasaki — ~2h all told. (The Ocean Arrow ferry + Shimabara Railway route is scenic and ~3.5h.) |
| Kumamoto | Kagoshima | 48 min | 0 | shinkansen | 'Mizuho'/'Sakura' Kumamoto→Kagoshima-Chūō (~44–57 min, ~hourly+). |
| Amakusa (Matsushima) | Kumamoto | 1h12 | 0 | car | By car ~1h10 via the Five Bridges, Misumi and R57 — coastal and effectively snow-proof. Carless parity (~1¼h): 15-min Takarajima-Line boat Matsushima Port⇄Misumi port (+2-min walk to the station) or 20-min taxi, then Misumi Line⇄Kumamoto ~50–60 min — both Tayuta and Amanojyaku sync pickups. ('Amakusa-gō' rapid bus Matsushima→Sakuramachi BT ~1h20, ~9/day, no reservation.) |
| Kurokawa Onsen | Kumamoto | 2h36 | 0 | bus | Kyushu Ōdan bus one-seat Kurokawa→Kumamoto Stn (~2h38; 3/day down, only 2/day back up — reserve). Also stops at Kumamoto Airport (~1h50) en route. By car ~77 km / ~1h50 via Senomoto + R57 (or the Milk Road rim), budget 2h15–2h30 in January — the Aso rim roads can gate-close in ice. |
| Takachiho | Kumamoto | 2h | 0 | car | By car ~85 km via R218 + the free E77 Kyushu-Chūō sections (open since Feb 2024): ~1h45 normal, budget 2h in January. R218 stays off the Aso rim (occasional chain regulation on the Kyushu-sanchi crossing; avoid the higher R325/Takamori route in ice). (Transit: 'Takachiho-gō' express bus→Sakuramachi BT ~2h45, only 2/day — reserve.) |
| Kagoshima | Nagasaki | 3h | 2 | shinkansen | Kyushu Shinkansen 'Mizuho'/'Sakura' Kagoshima-Chūō→Shin-Tosu (~1h10–1h25), change to the 'Relay Kamome' Ltd Exp→Takeo-Onsen (~50 min), then cross-platform to the Nishi-Kyushu Shinkansen 'Kamome'→Nagasaki (~30 min). ~3h, 2 changes. |
| Amakusa (Matsushima) | Nagasaki | 3h24 | 3 | train | Carless via the Misumi corridor: inn-synced 15–20-min boat/taxi to Misumi, Misumi Line→Kumamoto (~50–60 min), then Shinkansen→Shin-Tosu + Relay Kamome→Kamome to Nagasaki (~2h) — all-rail, snow-proof. Drivers' variant (the ferry drive): ~45 min to Oniike Port, Shimatetsu car ferry→Kuchinotsu (30 min, ~every 45), then ~1h45 down the Shimabara peninsula with Sakitsu Church and the Unzen jigoku en route (~3.5h; winter gales occasionally cancel the strait ferry). |
| Kurokawa Onsen | Nagasaki | 4h36 | 2 | bus | Direct highway bus Kurokawa→Hakata (~3h, only 2–3/day — reserve), then 'Relay Kamome'→Takeo-Onsen + 'Kamome'→Nagasaki (~1.4h). January snow can detour the Kurokawa road. |
| Kagoshima | Amakusa (Matsushima) | 2h18 | 1 | train | Kyushu Shinkansen 'Sakura' Kagoshima-Chūō→Kumamoto (~48 min), change to the JR Misumi line (~50 min — ⚠ 14-18/day, plan the connection), then the 20-min taxi/boat Misumi→Tayuta (the inn's own access chart; inn-synced Takarajima boat where sailing — Iruka 1/2 suspended Dec–Mar, 3-5 sailings remain). Carless, coastal, snow-proof. |
| Izu peninsula (Shuzenji) | Hakone | 1h48 | 2 | train | Sunzu to Mishima (self-change to Tōkaidō), short trunk hop to Odawara, second self-change onto the Tozan railway to Kōwakudani. Low-elevation, snow-mild. |
| Lake Kawaguchi (Mt Fuji) | Hakone | 3h45 | 3 | train | Fuji Excursion Kawaguchiko→Shinjuku (~4/day), cross to Tokyo, Tōkaidō to Odawara, Hakone Tozan up to Yumoto (self-change at Odawara) + inn shuttle. The seasonal Gotemba bus would cut a change but is January-unreliable. |
| Echigo-Yuzawa (snow country) | Nikkō | 3h12 | 2 | shinkansen | Inn car to Echigo-Yuzawa, Jōetsu Shinkansen through to Ōmiya, change to the Tōhoku Shinkansen for Utsunomiya, then JR Nikkō Line local to Nikkō. Two changes (Ōmiya, Utsunomiya); ⚠ the Nikkō-Line finish is the fragile bit in January. |
| Minakami / Tanigawa (snow country) | Nikkō | 2h48 | 2 | shinkansen | Taxi to Jōmō-Kōgen, Jōetsu Shinkansen through to Ōmiya, change to the Tōhoku Shinkansen for Utsunomiya, then the JR Nikkō Line local up to Nikkō + inn shuttle. ⚠ ends on the hourly Nikkō-Line local — snow-slow. |
| Nikkō | Kakunodate | 4h36 | 2 | shinkansen | JR Nikkō Line local to Utsunomiya, a 'Yamabiko' up to Morioka, then change to the 'Komachi' onto the Akita branch for Kakunodate + taxi. The fast Hayabusa/Komachi skip Utsunomiya, so you ride the slower Yamabiko north; ⚠ long and on the fragile single-track Komachi branch in snow. (If no through Morioka Yamabiko lines up, add a Sendai change.) |
| Lake Kawaguchi (Mt Fuji) | Izu peninsula (Shuzenji) | 3h45 | 3 | train | Fuji Excursion to Shinjuku (~4/day), cross to Tokyo, Tōkaidō to Mishima, then Izuhakone Sunzu to Shuzenji (self-change at Mishima) + taxi. ⚠ three changes plus the sparse Fuji Excursion. |
| Echigo-Yuzawa (snow country) | Minakami / Tanigawa (snow country) | 1h24 | 0 | car | RAIL-primary: inn car→Echigo-Yuzawa (~30 min), one-stop Jōetsu Shinkansen→Jōmō-Kōgen (~13 min, ~hourly 'Toki'), ~20-min taxi to Senjuan. No self-handled change. Car alt: ~55 km/~55 min via the Kan-Etsu Expressway — faster on a clear day, but ⚠ chains banned in-tunnel, checkpoints, and NEXCO preventive closures in heavy snow (Dec-2020 precedent). (Minakami-local version: Senjuan shuttle→Minakami + Jōetsu-line local ~40 min, ~6-8/day — similar total.) |
| Echigo-Yuzawa (snow country) | Kakunodate | 4h18 | 1 | shinkansen | Jōetsu Echigo-Yuzawa→Ōmiya, change to the through Akita 'Komachi' to Kakunodate + taxi. Single change at Ōmiya; ⚠ January snow can slow the Komachi north of Morioka. |
| Yamanaka Onsen (Kaga) | Yamashiro Onsen (Kaga) | 30 min | 0 | car | Trivial shared-station pairing — both inns hang off Kaga-Onsen Stn, so it's a single direct taxi between the two onsen towns (~20–30 min), no rail at all. |
| Minakami / Tanigawa (snow country) | Kakunodate | 4h06 | 1 | shinkansen | Jōetsu Shinkansen→Ōmiya (backtrack), change to Akita 'Komachi'→Kakunodate (Ōmiya→Kakunodate ~2h35) + ~12-min taxi. ⚠ Komachi on snow-prone conventional track past Morioka. |
| Yufuin | Amakusa (Matsushima) | 3h06 | 0 | car | ~222 km, ~3h05: Oita Expwy → Tosu JCT → Kyushu Expwy → Matsubase IC (2h04, ¥4,640), then R266 via Misumi and the Five Bridges to Matsushima (~1h). Budget 3¾–4h — the Hita–Hiji zone at the start only; coastal and snow-free past Tosu. (Carless: Yufuin no Mori→Hakata + Shinkansen→Kumamoto + Misumi Line + boat/taxi ≈ 4.2h, 3 changes — the car saves over an hour here.) |
| Kurokawa Onsen | Yufuin | 1h45 | 0 | bus | Kyushu Ōdan Bus direct (the Beppu–Yufuin–Kurokawa–Aso–Kumamoto cross-island line), ~1h45, ~¥2,370. ⚠ Only 2 buses/day each way — reserve; the last Kurokawa→Yufuin/Beppu departure is 16:55, so the transfer day must move by early afternoon. By car: 48 km straight over the Yamanami, ~1h05 (budget 1h30) — it crosses Makinoto Pass (1,330 m) itself and shaded stretches hold ice for days; iced over, the low road via Kokonoe IC + R387 (~600 m max) runs ~1h20. |
| Yufuin | Takachiho | 2h30 | 0 | car | By car (~105 km): Yamanami Highway over the Makinoto Pass (1,330 m) past Kurokawa and the Aso rim, then R325/R218 — budget 3h in January. ⚠ The pass gets real snow/ice closures: studless tires, check regulations morning-of; low-road fallback via Taketa/R57 (+~30 min). (Transit is a full day, ~6.5h via Kumamoto — this leg is why the car exists.) |
| Amagase (Hita) | Yufuin | 1h | 0 | train | Ltd Exp 'Yufu' / 'Yufuin no Mori' straight down the JR Kyudai Main Line, Yufuin→Amagase ~42–50 min ride + the Tensui pickup and Enowa-shuttle/taxi ends, no transfer — Amagase (天ヶ瀬) is a scheduled express stop and Sanso Tensui sits a few minutes from that station (the leg does NOT run to Hita Station proper). ~6 limited expresses/day toward Hakata (Yufu 09:08/14:15/19:27 · Yufuin-no-Mori 12:01/15:56/17:17 from Yufuin, 2026 timetable) — all reserved-seat; the scenic Yufuin-no-Mori sells out, so book ahead. Enowa's shuttle reaches Yufuin Station. Runs year-round, sidestepping the Mizuwake Pass winter-tire regulation that dogs the parallel car route. |
| Kurokawa Onsen | Amakusa (Matsushima) | 2h54 | 0 | car | ~115–120 km, ~2h55: off the rim to Kumamoto IC (~1h30), a Kyushu Expwy hop to Matsubase IC (15 min, ¥810 — skips city traffic), then R266 via Misumi and the Five Bridges to Matsushima (~1h10). Budget 3¼–3½h — the Aso-rim descent is the only winter segment; coastal after. (The Takefue→Tayuta hop.) |
| Takachiho | Amakusa (Matsushima) | 3h12 | 0 | car | By car (~140 km): R218 west off the highlands (~2h), then R266/R57 via Uto–Misumi and the Five Bridges to Matsushima (~1h10), skirting central Kumamoto. Transit alt: 'Takachiho-gō' + 'Amakusa-gō' buses via Sakuramachi (~4.5–5h, timed around the 2/day constraint). Front-load the mountain half before dusk in January. |
| Amagase (Hita) | Amakusa (Matsushima) | 2h30 | 0 | car | ~180 km, ~2h30: Hita IC → Tosu JCT → Kyushu Expwy → Matsubase IC (1h27, ¥3,690), then R266 via Misumi and the Five Bridges (~1h). Budget ~2h45 — the least winter-exposed leg in the Hita set; sea-level last mile. |
| Kurokawa Onsen | Takachiho | 1h09 | 0 | car | ~64 km / ~1h9 by car over the Aso highlands — no practical bus link; January snow or ice can slow the mountain road. (Drive-time only — verify before booking.) |
| Amagase (Hita) | Kurokawa Onsen | 1h15 | 0 | car | ~55 km, ~1h–1h25, toll-free: R210 to Hita, then R212 up the valley → Oguni → R442 east — one of Kurokawa's three official approach roads, low until the final climb and it skips Mizuwake entirely. Budget 1h30–1h45 (the R442/Kurokawa approach is the only winter bit — Shinmeikan's live cams ⑤/⑥ are the morning check). ⚠ The shorter Farm Road WAITA plateau shortcut is untreated 600–900 m municipal road with closure history — not the January move. |
| Okayama | Naoshima (Miyanoura) | 2h | 2 | ferry | Uno Line to Uno (~50 min, ¥590), a flat 5-min walk to Uno Port, then the Shikoku Kisen car ferry to Miyanoura: 20-min crossing, 13 sailings a day each way, ¥300, no reservations. ⚠ The LAST Uno→Miyanoura sailing is 20:25 (arr 20:45) — the binding constraint on a late start — and winter wind can suspend crossings. |
| Amagase (Hita) | Takachiho | 3h | 0 | car | ~200 km, ~2h50–3h05: Hita IC → Tosu JCT → Kyushu Expwy → Kashima JCT → free E77 → Yamato-Tsujunkyō IC → R218 east (~¥3,750). Budget ~3h15 — only the well-treated R218 corridor is exposed. ⚠ The direct Aso crossing (R212 over Mizuwake → caldera → R325 Takamori) saves ~45 min but stacks three winter zones — dry, above-freezing days only. |
| Sapporo | Niseko (Hirafu) | 3h | 0 | bus | Hokkaidō Chūō Bus 'Kōsoku Niseko-gō' Sapporo (Kita 3-jō, 5 min from the station)→Niseko Hirafu, ~3h, reserved, only ~2 morning departures (07:50, 09:20) in winter, ~¥6,000 in the 2025–26 season. Rail alt, 2 changes: 'Rapid Airport' Sapporo→Otaru (32 min), Hakodate-Line local Otaru→Kutchan (~1h–1h20, sparse), then a 15-min taxi (~¥2,500) to Hirafu — ~2h45 if the Otaru connection lines up. Zaborin/Shiguchi both quote ~2.5h by car from Sapporo; a private transfer is the comfortable answer here. |
| Sapporo | Furano | 2h45 | 0 | bus | Hokkaidō Chūō Bus 'Kōsoku Furano-gō' Sapporo Stn bus terminal→Furano Stn, ~2h30, roughly every 1–2 hours, ~¥2,300–2,700, reserved. Rail alt, 1 change: Ltd Exp 'Lilac'/'Kamui' Sapporo→Takikawa (~50 min) then the Nemuro-Line local Takikawa→Furano (~66 min, sparse) — 2.5–3.5h depending on the Takikawa wait; the summer-only 'Furano Lavender Express' is the direct train and does not run in January. |
| Sapporo | Noboribetsu Onsen | 1h45 | 1 | train | Ltd Exp 'Hokuto'/'Suzuran' Sapporo→Noboribetsu Stn, 1h05–1h14, all seats reserved, roughly hourly between the two services (¥3,250–4,890), then the Dōnan Bus up to Noboribetsu Onsen, 15 min, ¥450, 1–2 an hour (taxi ~¥3,000). One change at the station. Alt with no change: the reserved 'Kōsoku Onsen-gō' highway bus Sapporo→Noboribetsu Onsen, ~1h50–2h20, ~¥2,800–3,800. |
| Sapporo | Otaru | 36 min | 0 | train | JR Hakodate Line Sapporo→Otaru: 'Rapid Airport' 32–35 min, locals ~45 min, several an hour, ¥800. Kuramure (Asarigawa Onsen) and Ginrinsō are then a ~15-min car from Otaru or Otaru-Chikkō — reserve the hotel shuttle or take a taxi. |
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
| Kumamoto | Yakushima | 3h18 | 2 | KMJ → KUM |
| Kumamoto | Yamanaka Onsen (Kaga) | 4h30 | 3 | KMJ → KMQ |
| Kumamoto | Yamashiro Onsen (Kaga) | 4h15 | 3 | KMJ → KMQ |
| Nagasaki | Iki island | 2h42 | 1 | NGS → IKI |
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
| Tokyo | Takeo Onsen | 3h30 | 2 | HND → FUK · alternative HND → NGS (three researched halves), 3h36 · 2 |
| Tokyo | Unzen | 5h | 3 | HND → NGS |
| Tokyo | Yufuin | 4h | 1 | HND → OIT |

**Airport transfers.** City centre to the terminal door and no check-in queue at either end, so add the airline's own cut-off on top. **Every row runs both ways: the journey IN from the terminal on arrival is the same one shown here, so read a row as the transfer, not as a direction.** Tokyo's two airports are a long way apart — check which one the flight uses. **The two Tokyo rows are timed from Tokyo Station; add 20–30 min from a hotel door.**

| From | To | Door to door | Changes | Mode | Route |
|---|---|---|---|---|---|
| Tokyo | Tokyo · Haneda airport (HND) | 36 min | 1 | train | From Tokyo Stn/trunk: JR→Hamamatsuchō + Monorail, or Shinagawa + Keikyū (~25–30 min ride). Taxi ~40–60 min/0 changes and the hotel-doorstep Airport Limousine (~70 min) are the luggage-friendly versions. |
| Tokyo | Tokyo · Narita airport (NRT) | 1h06 | 0 | train | JR Narita Express (N'EX) Tokyo Station→Narita Airport Terminal 2·3 ~53 min, Terminal 1 ~56–60 min — direct, 1–2 an hour (JR East timetable; japan-guide Narita access). The door-to-terminal Airport Limousine bus from the big hotels runs ~85–120 min depending on traffic, and the Keisei Skyliner from Ueno/Nippori is ~41–46 min if you are staying on that side. |
| Hakone | Tokyo · Haneda airport (HND) | 2h12 | 2 | train | Direct Tozan BUS Gōra/Sengokuhara→Odawara (~45 min — one seat; the Tozan rail needs an extra change at Hakone-Yumoto), Tōkaidō Shinkansen Odawara→Shinagawa (~30 min), Keikyū→Haneda (~18 min); or the direct Odawara→HND limousine bus (~85 min). |
| Izu peninsula (Shuzenji) | Tokyo · Haneda airport (HND) | 2h | 2 | train | Taxi/shuttle→Shuzenji, Izuhakone Sunzu line→Mishima (~35 min), Tōkaidō Shinkansen Mishima→Shinagawa (~40 min), Keikyū→Haneda (~18 min). |
| Lake Kawaguchi (Mt Fuji) | Tokyo · Haneda airport (HND) | 3h | 1 | train | JR 'Fuji Excursion' Kawaguchiko→Shinjuku (~2h, direct), then the airport limousine bus Shinjuku→Haneda (~45 min). ⚠ limited morning Fuji departures. |
| Kyoto | Osaka · Kansai airport (KIX) | 1h30 | 0 | train | JR Ltd Exp 'Haruka' Kyoto→Kansai Airport (~75 min, direct). |
| Kyoto | Osaka · Itami airport (ITM) | 1h | 0 | bus | Airport limousine bus Kyoto Station→Osaka-Itami (~55 min). |
| Nara | Osaka · Kansai airport (KIX) | 1h54 | 1 | train | JR Yamatoji rapid Nara→Tennoji (~40 min), change to Haruka→KIX (~30 min). |
| Osaka | Osaka · Kansai airport (KIX) | 1h06 | 0 | train | JR Ltd Exp 'Haruka' Osaka Stn→Kansai Airport ~45 min (¥2,380 unreserved; Shin-Osaka ~50 min, ¥2,540), or the Nankai 'Rapi:t' Osaka-Namba→KIX 35–40 min (¥1,520–1,670, reserved; the fastest services 34 min). Cheaper: Nankai airport express 45–50 min ¥970, JR Airport Rapid from Osaka Stn ~70 min ¥1,180, airport bus from Umeda ~60 min ¥1,800 / Namba ~45 min ¥1,400. ~1h door-to-door with bags and the terminal walk — airport processing on top. |
| Osaka | Osaka · Itami airport (ITM) | 45 min | 0 | bus | Airport limousine bus Osaka Stn/Umeda→Itami (~30 min, ¥730, multiple per hour); Shin-Osaka ~25 min ¥600, Namba/OCAT ~30 min ¥730. Rail alt: Hankyu Takarazuka Line Osaka-Umeda→Hotarugaike (15–20 min, ¥240) + Osaka Monorail one stop to Osaka Airport (2 min, ¥200) ≈ 25 min, ¥440. Itami is the close-in domestic airport — the reason a Kansai finale flies ITM→HND. |
| Hiroshima | Hiroshima airport (HIJ) | 1h06 | 0 | bus | Airport limousine bus Hiroshima Station→Hiroshima Airport (~50 min; no rail link). |
| Fukuoka (Hakata) | Fukuoka airport (FUK) | 18 min | 0 | subway | Fukuoka City Subway Hakata→Fukuoka Airport (2 stops, ~5 min). |
| Beppu | Ōita airport (OIT) | 54 min | 0 | bus | Ōita Kōtsū 'Air Liner' airport bus Beppu Kitahama / Beppu Station→Ōita Airport (OIT), ~47–50 min, hourly, every day. ⚠ Take the 'Air Liner' — the separate 'Airport Express' for Ōita city does NOT stop in Beppu. OIT is Beppu's own gateway (OIT→Haneda ~1h40, frequent ANA/JAL/SNA — see oit>hnd), so a Beppu finale exits without crossing back to Fukuoka. |
| Kumamoto | Kumamoto airport (KMJ) | 54 min | 0 | bus | Airport limousine bus Kumamoto Stn/Sakuramachi→Kumamoto Airport (KMJ) at Mashiki (~55 min). |
| Nagasaki | Nagasaki airport (NGS) | 1h | 0 | bus | Airport limousine bus Nagasaki Station→Nagasaki Airport (~45 min). |
| Kagoshima | Kagoshima airport (KOJ) | 1h06 | 0 | bus | Airport limousine bus Kagoshima-Chūō→Kagoshima Airport (~40–60 min). |
| Yufuin | Ōita airport (OIT) | 1h | 0 | bus | Airport bus Yufuin Station→Oita Airport (~55 min; the inn shuttle reaches the station). |
| Kirishima (Myōken Onsen) | Kagoshima airport (KOJ) | 45 min | 0 | bus | Kagoshima Airport is Myōken's own gateway, ~30 km up the Amori river: the ¥450 Myōken route bus KOJ→Myōken Onsen runs ~25 min (Kirishima City's Myōken bus page; Kagoshima Kōtsū airport-bus timetable, Sep 2026), a pre-called taxi ~15 min. ~45 min door to door with bags. ⚠ Only ~8 airport departures a day on that bus, the inn's own shuttle-taxi was discontinued pre-Mar-2026, and called taxis want ~40 min notice. |
| Kanazawa | Komatsu airport (KMQ) | 48 min | 0 | bus | Hokutetsu airport limousine Kanazawa Station→Komatsu Airport (KMQ), ~40–50 min, timed to the departures — the same bus leg the Kanazawa→Kyushu flight legs are built on. KMQ is Kanazawa's own airport; ANA/Oriental Air Bridge fly it to Fukuoka ~4×daily (~1h40). |
| Takeo Onsen | Nagasaki airport (NGS) | 45 min | 1 | train | Nishi-Kyushu Shinkansen Takeo-Onsen→Shin-Ōmura (~12 min), then the airport shuttle to Nagasaki Airport (~15 min) — NGS sits between Takeo and Nagasaki, ~40 min door to door. |
| Sapporo | Sapporo · New Chitose airport (CTS) | 45 min | 0 | train | JR 'Rapid Airport' New Chitose Airport→Sapporo, 37–40 min, 3 an hour through the day (fewer early/late), from the station under the domestic terminal; ~¥1,150. The one Hokkaido leg nobody has to think about. |
| Niseko (Hirafu) | Sapporo · New Chitose airport (CTS) | 2h45 | 0 | bus | Chūō Bus/Niseko Bus New Chitose Airport→Niseko Hirafu, ~2h33, reserved, 4 a day in winter (10:00, 13:40, 14:40, 15:30), ~¥6,000; the reserved winter shuttles (Hokkaidō Resort Liner, White Liner, Sky Express) run the same ~2.5h with hotel drop-offs. Rail alt, 2 changes: 'Rapid Airport' through to Otaru (~72 min) + Hakodate-Line local to Kutchan (~1h–1h20) + 15-min taxi, ~3h+. The inns quote ~2h by car/private transfer straight from the airport — no Sapporo detour. |
| Furano | Sapporo · New Chitose airport (CTS) | 2h15 | 0 | bus | Furano Bus airport liner New Chitose Airport (stop 23)→Furano, ~2h, 4 a day year-round (10:30, 11:45, 14:30, 17:30); in winter (Dec 1–Mar 30) the reserved Hokkaidō Resort Liner runs the same corridor in 2h15–2h30 with ski-hotel drop-offs (book ≥9 days ahead). Nothing on rail beats these — the train goes back through Sapporo and Takikawa. |
| Noboribetsu Onsen | Sapporo · New Chitose airport (CTS) | 1h18 | 0 | bus | Dōnan Bus 'Noboribetsu Onsen Airport Express' New Chitose Airport→Noboribetsu Onsen direct, ~1h10, reserved, ~4 a day, ~¥2,200. Rail alt (2 changes): local one stop to Minami-Chitose, 'Hokuto' to Noboribetsu Stn, then the 15-min onsen bus. |
| Nagoya | Nagoya · Centrair airport (NGO) | 42 min | 0 | train | Meitetsu 'μSKY' Meitetsu-Nagoya→Central Japan Airport (Centrair, NGO), 28 min, all-reserved, ¥1,430 (¥980 fare + ¥450 μ-ticket), ~2 an hour; the ordinary Meitetsu Ltd Exp ~38 min for the plain ¥980. Meitetsu-Nagoya is under the JR station's west side — allow 10 min to cross. |
| Nikkō | Tokyo · Haneda airport (HND) | 2h48 | 1 | train | Taxi to Tōbu-Nikkō (~5 min), Tōbu Ltd Exp 'Spacia X'/'Kegon' Tōbu-Nikkō→Asakusa (~1h50, 6–7 a day, all reserved), walk to the Toei Asakusa-line platforms (~5 min), then the through train Asakusa→Haneda Airport Terminal 1·2 (37 min, no change on the Keikyū through services — check the destination board, otherwise change at Sengakuji). One change, at Asakusa; no Tokyo Station detour. |

Any pair not in these tables was not in the source data. Look it up on a timetable (Jorudan, Navitime or Google Maps), say out loud that you looked it up, label it estimated, and never estimate it from the distance. The full set of 788 sourced legs — including every inn — is in `data/transit-legs.md`.
<!-- /generated:corridors -->

### The connector inns

The inns that sit on the road between two cities, with what a night at each costs over going straight through — read only when a plan wants an inn night on a leg that has none.

<!-- generated:connectors -->
*130 places to break a journey, worked out of the same researched legs as the corridor table. Read a row as: the direct journey between those two places takes `direct`, and a night at that inn on the way makes it the two legs shown, costing `detour` more than going straight through. **Prefer one of these to an inn you have to go out and come back from**: the night costs almost nothing in travel. **`Leg in` and `Leg out` are researched legs like any other here** — put either straight into an **Onward** cell, in either direction. A pair with no row has no researched place to break at, and a journey made by air has none at all, because a flight cannot be broken at an inn. One inn per valley, the best-scored of the kit's shortlist; the master inn table in Stage 4 holds the others there, and its `Reach` column answers the pairs this table does not.*

| From → To | Direct | Connector inn | Leg in | Leg out | Detour |
|---|---|---|---|---|---|
| Nagasaki → Kurokawa Onsen | 4h36/2 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 42 min/0 shinkansen | 2h15/0 car | −1h39 |
| Fukuoka → Nagasaki | 2h/1 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 1h/0 train | 42 min/0 shinkansen | −18 min |
| Beppu → Nagasaki | 4h/2 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 1h/0 bus | 3h/0 car | none |
| Kanazawa → Kyoto | 2h30/1 | [Hanamurasaki](https://ryokancatalog.com/inn/hanamurasaki) · Yamanaka Onsen | 54 min/0 train | 1h36/1 train | none |
| Osaka → Nagoya | 1h36/1 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 45 min/0 train | 54 min/0 shinkansen | +3 min |
| Kanazawa → Kyoto | 2h30/1 | [Beniya Mukayu](https://ryokancatalog.com/inn/beniya-mukayu) · Yamashiro Onsen | 36 min/0 train | 2h/1 train | +6 min |
| Kyoto → Yamashiro Onsen | 2h/1 | [Hanamurasaki](https://ryokancatalog.com/inn/hanamurasaki) · Yamanaka Onsen | 1h36/1 train | 30 min/0 car | +6 min |
| Nagasaki → Kurokawa Onsen | 4h36/2 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 3h/0 car | 1h45/0 bus | +9 min |
| Tokyo → Osaka | 3h15/1 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 2h45/0 shinkansen | 45 min/0 train | +15 min |
| Fukuoka → Kurokawa Onsen | 2h42/0 | [Sanso Tensui](https://ryokancatalog.com/inn/sanso-tensui) · Amagase | 1h45/0 train | 1h15/0 car | +18 min |
| Nagasaki → Kagoshima | 3h/2 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 42 min/0 shinkansen | 2h36/1 train | +18 min |
| Nagasaki → Amakusa | 3h24/3 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 42 min/0 shinkansen | 3h/2 train | +18 min |
| Beppu → Kurokawa Onsen | 2h24/0 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 1h/0 bus | 1h45/0 bus | +21 min |
| Kumamoto → Kurokawa Onsen | 2h36/0 | [Sanso Tensui](https://ryokancatalog.com/inn/sanso-tensui) · Amagase | 1h42/1 train | 1h15/0 car | +21 min |
| Nara → Kansai airport | 1h54/1 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 45 min/0 train | 1h30/0 train | +21 min |
| Osaka → Hakone | 3h24/2 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 45 min/0 train | 3h/1 train | +21 min |
| Sendai → Kanazawa | 4h30/1 | [Atamiso](https://ryokancatalog.com/inn/atamiso) · Bandai-Atami | 1h/1 shinkansen | 3h54/2 shinkansen | +24 min |
| Sendai → Kanazawa | 4h30/1 | [Tsuchiyu Bettei Satonoyu](https://ryokancatalog.com/inn/tsuchiyu-bettei-satonoyu) · Tsuchiyu Onsen | 1h/0 train | 3h54/1 shinkansen | +24 min |
| Kyoto → Yamashiro Onsen | 2h/1 | [Kanshuku-en Eshikoto](https://ryokancatalog.com/inn/kanshuku-en-eshikoto) · Eiheiji | 1h45/1 train | 40 min/0 car | +25 min |
| Nagasaki → Nagasaki airport | 1h/0 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 42 min/0 shinkansen | 45 min/1 train | +27 min |
| Kanazawa → Osaka | 2h45/1 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 2h30/1 train | 45 min/0 train | +30 min |
| Kumamoto → Nagasaki | 2h/2 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 1h48/1 train | 42 min/0 shinkansen | +30 min |
| Nara → Osaka | 1h/0 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 45 min/0 train | 45 min/0 train | +30 min |
| Sendai → Kanazawa | 4h30/1 | [Otogi no Yado Yoneya](https://ryokancatalog.com/inn/otogi-no-yado-yoneya) · Sukagawa | 1h18/1 train | 3h42/2 shinkansen | +30 min |
| Yufuin → Kurokawa Onsen | 1h45/0 | [Sanso Tensui](https://ryokancatalog.com/inn/sanso-tensui) · Amagase | 1h/0 train | 1h15/0 car | +30 min |
| Fukuoka → Kurokawa Onsen | 2h42/0 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 1h/0 train | 2h15/0 car | +33 min |
| Kagoshima → Kagoshima airport | 1h06/0 | [Myoken Ishiharaso](https://ryokancatalog.com/inn/myoken-ishiharaso) · Kirishima | 54 min/0 train | 45 min/0 bus | +33 min |
| Kumamoto → Kurokawa Onsen | 2h36/0 | [Shinsen](https://ryokancatalog.com/inn/shinsen) · Takachiho | 2h/0 car | 1h09/0 car | +33 min |
| Osaka → Hiroshima | 2h06/1 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 45 min/0 train | 1h54/0 shinkansen | +33 min |
| Fukuoka → Yufuin | 2h10/0 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 1h/0 train | 1h45/0 car | +35 min |
| Fukuoka → Yufuin | 2h10/0 | [Sanso Tensui](https://ryokancatalog.com/inn/sanso-tensui) · Amagase | 1h45/0 train | 1h/0 train | +35 min |
| Takayama → Kyoto | 3h48/1 | [Hanamurasaki](https://ryokancatalog.com/inn/hanamurasaki) · Yamanaka Onsen | 2h48/1 train | 1h36/1 train | +36 min |
| Kyoto → Yamanaka Onsen | 1h36/1 | [Kanshuku-en Eshikoto](https://ryokancatalog.com/inn/kanshuku-en-eshikoto) · Eiheiji | 1h45/1 train | 30 min/0 car | +39 min |
| Takayama → Osaka | 3h54/2 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 3h48/1 train | 45 min/0 train | +39 min |
| Tokyo → Takayama | 4h54/1 | [Beniya Mukayu](https://ryokancatalog.com/inn/beniya-mukayu) · Yamashiro Onsen | 3h/0 shinkansen | 2h36/1 train | +42 min |
| Tokyo → Nyūtō Onsen | 4h/1 | [Wabizakura](https://ryokancatalog.com/inn/wabizakura) · Kakunodate | 3h06/0 shinkansen | 1h36/1 train | +42 min |
| Fukuoka → Amagase | 1h45/0 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 1h/0 train | 1h30/0 car | +45 min |
| Izu peninsula → Haneda airport | 2h/2 | [Arcana Izu](https://ryokancatalog.com/inn/arcana-izu) · Yugashima | 30 min/0 car | 2h15/2 train | +45 min |
| Takayama → Kyoto | 3h48/1 | [Beniya Mukayu](https://ryokancatalog.com/inn/beniya-mukayu) · Yamashiro Onsen | 2h36/1 train | 2h/1 train | +48 min |
| Kanazawa → Takayama | 2h24/0 | [Beniya Mukayu](https://ryokancatalog.com/inn/beniya-mukayu) · Yamashiro Onsen | 36 min/0 train | 2h36/1 train | +48 min |
| Nagasaki → Amakusa | 3h24/3 | [Mt.Resort Unzen Kyushu Hotel](https://ryokancatalog.com/inn/mt-resort-unzen-kyushu-hotel) · Unzen | 1h42/0 bus | 2h30/0 car | +48 min |
| Beppu → Kumamoto | 2h30/1 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 1h/0 bus | 2h24/1 train | +54 min |
| Kyoto → Yamanaka Onsen | 1h36/1 | [Beniya Mukayu](https://ryokancatalog.com/inn/beniya-mukayu) · Yamashiro Onsen | 2h/1 train | 30 min/0 car | +54 min |
| Tokyo → Kanazawa | 2h42/0 | [Beniya Mukayu](https://ryokancatalog.com/inn/beniya-mukayu) · Yamashiro Onsen | 3h/0 shinkansen | 36 min/0 train | +54 min |
| Sendai → Kanazawa | 4h30/1 | [Onyado Kawasemi](https://ryokancatalog.com/inn/onyado-kawasemi) · Iizaka Onsen | 1h15/1 train | 4h12/2 shinkansen | +57 min |
| Tokyo → Izu peninsula | 1h45/0 | [Arcana Izu](https://ryokancatalog.com/inn/arcana-izu) · Yugashima | 2h12/1 train | 30 min/0 car | +57 min |
| Beppu → Kagoshima | 3h12/1 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 1h/0 bus | 3h12/1 scenic | +1h |
| Kanazawa → Nikkō | 4h/2 | [Beniya Mukayu](https://ryokancatalog.com/inn/beniya-mukayu) · Yamashiro Onsen | 36 min/0 train | 4h30/3 train (two researched halves) | +1h06 |
| Kyoto → Kansai airport | 1h30/0 | [Tsukihitei](https://ryokancatalog.com/inn/tsukihitei) · Nara | 45 min/0 train | 1h54/1 train | +1h09 |
| Osaka → Fukuoka | 3h06/1 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 45 min/0 train | 3h30/0 shinkansen | +1h09 |
| Osaka → Kansai airport | 1h06/0 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 45 min/0 train | 1h30/0 train | +1h09 |
| Kanazawa → Minakami / Tanigawa | 3h15/1 | [Fujiiso](https://ryokancatalog.com/inn/fujiiso) · Yamada Onsen | 2h/0 train | 2h24/1 shinkansen | +1h09 |
| Fukuoka → Beppu | 2h/0 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 2h10/0 train | 1h/0 bus | +1h10 |
| Kyoto → Fukuoka | 3h30/0 | [Migiwatei Ochi Kochi](https://ryokancatalog.com/inn/migiwatei-ochi-kochi) · Tomonoura | 2h12/1 train | 2h30/0 shinkansen | +1h12 |
| Kyoto → Lake Kawaguchi | 4h15/1 | [Fuefukigawa Onsen Zabou](https://ryokancatalog.com/inn/fuefukigawa-onsen-zabou) · Kōshū | 3h45/2 train | 1h45/1 train | +1h15 |
| Lake Kawaguchi → Haneda airport | 3h/1 | [Fuefukigawa Onsen Zabou](https://ryokancatalog.com/inn/fuefukigawa-onsen-zabou) · Kōshū | 1h45/1 train | 2h30/1 train | +1h15 |
| Sendai → Kanazawa | 4h30/1 | [Bettei Senjuan](https://ryokancatalog.com/inn/bettei-senjuan) · Minakami / Tanigawa | 2h30/1 train | 3h15/1 shinkansen | +1h15 |
| Tokyo → Lake Kawaguchi | 2h/0 | [Fuefukigawa Onsen Zabou](https://ryokancatalog.com/inn/fuefukigawa-onsen-zabou) · Kōshū | 1h30/0 train | 1h45/1 train | +1h15 |
| Kanazawa → Nikkō | 4h/2 | [Fujiiso](https://ryokancatalog.com/inn/fujiiso) · Yamada Onsen | 2h/0 train | 3h18/2 shinkansen | +1h18 |
| Kanazawa → Echigo-Yuzawa | 3h30/1 | [Fujiiso](https://ryokancatalog.com/inn/fujiiso) · Yamada Onsen | 2h/0 train | 2h48/1 shinkansen | +1h18 |
| Kanazawa → Takayama | 2h24/0 | [Hanamurasaki](https://ryokancatalog.com/inn/hanamurasaki) · Yamanaka Onsen | 54 min/0 train | 2h48/1 train | +1h18 |
| Kyoto → Izu peninsula | 2h42/0 | [Gora Kadan Fuji](https://ryokancatalog.com/inn/gora-kadan-fuji) · Oyama | 2h36/0 train | 1h24/1 train | +1h18 |
| Tokyo → Echigo-Yuzawa | 1h45/0 | [Bettei Senjuan](https://ryokancatalog.com/inn/bettei-senjuan) · Minakami / Tanigawa | 1h40/0 train | 1h24/0 car | +1h19 |
| Tokyo → Hakone | 2h12/1 | [Asaba](https://ryokancatalog.com/inn/asaba) · Izu peninsula | 1h45/0 train | 1h48/2 train | +1h21 |
| Tokyo → Sendai | 1h42/0 | [Otogi no Yado Yoneya](https://ryokancatalog.com/inn/otogi-no-yado-yoneya) · Sukagawa | 1h45/1 train | 1h18/1 train | +1h21 |
| Sendai → Nyūtō Onsen | 2h30/1 | [Wabizakura](https://ryokancatalog.com/inn/wabizakura) · Kakunodate | 2h15/0 shinkansen | 1h36/1 train | +1h21 |
| Kyoto → Hiroshima | 1h54/0 | [Ryokan Nishiyama](https://ryokancatalog.com/inn/ryokan-nishiyama) · Onomichi | 2h18/1 shinkansen | 1h/1 train | +1h24 |
| Sendai → Minakami / Tanigawa | 2h30/1 | [Atamiso](https://ryokancatalog.com/inn/atamiso) · Bandai-Atami | 1h/1 shinkansen | 2h54/2 shinkansen | +1h24 |
| Sendai → Minakami / Tanigawa | 2h30/1 | [Tsuchiyu Bettei Satonoyu](https://ryokancatalog.com/inn/tsuchiyu-bettei-satonoyu) · Tsuchiyu Onsen | 1h/0 train | 2h54/1 train | +1h24 |
| Fukuoka → Amagase | 1h45/0 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 2h10/0 train | 1h/0 train | +1h25 |
| Kyoto → Fukuoka | 3h30/0 | [Kinsuikan](https://ryokancatalog.com/inn/kinsuikan) · Miyajima | 2h42/2 train | 2h15/2 train | +1h27 |
| Tokyo → Izu peninsula | 1h45/0 | [Gora Kadan Fuji](https://ryokancatalog.com/inn/gora-kadan-fuji) · Oyama | 1h48/0 train | 1h24/1 train | +1h27 |
| Tokyo → Minakami / Tanigawa | 1h40/0 | [ryugon](https://ryokancatalog.com/inn/ryugon) · Echigo-Yuzawa | 1h45/0 train | 1h24/0 car | +1h29 |
| Kurokawa Onsen → Amagase | 1h15/0 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 1h45/0 bus | 1h/0 train | +1h30 |
| Kyoto → Hakone | 3h/1 | [Asaba](https://ryokancatalog.com/inn/asaba) · Izu peninsula | 2h42/0 train | 1h48/2 train | +1h30 |
| Kyoto → Hakone | 3h/1 | [Gora Kadan Fuji](https://ryokancatalog.com/inn/gora-kadan-fuji) · Oyama | 2h36/0 train | 1h54/1 train | +1h30 |
| Tokyo → Hakone | 2h12/1 | [Gora Kadan Fuji](https://ryokancatalog.com/inn/gora-kadan-fuji) · Oyama | 1h48/0 train | 1h54/1 train | +1h30 |
| Tokyo → Nagoya | 2h06/0 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 2h45/0 shinkansen | 54 min/0 shinkansen | +1h33 · a stop, not a free connector |
| Tokyo → Kyoto | 2h45/0 | [Gora Kadan Fuji](https://ryokancatalog.com/inn/gora-kadan-fuji) · Oyama | 1h48/0 train | 2h36/0 train | +1h39 · a stop, not a free connector |
| Kyoto → Miyajima | 2h42/2 | [Migiwatei Ochi Kochi](https://ryokancatalog.com/inn/migiwatei-ochi-kochi) · Tomonoura | 2h12/1 train | 2h12/2 shinkansen | +1h42 · a stop, not a free connector |
| Tokyo → Kyoto | 2h45/0 | [Asaba](https://ryokancatalog.com/inn/asaba) · Izu peninsula | 1h45/0 train | 2h42/0 train | +1h42 · a stop, not a free connector |
| Kumamoto → Takachiho | 2h/0 | [Takefue](https://ryokancatalog.com/inn/takefue) · Kurokawa Onsen | 2h36/0 bus | 1h09/0 car | +1h45 · a stop, not a free connector |
| Kyoto → Nikkō | 4h42/2 | [Beniya Mukayu](https://ryokancatalog.com/inn/beniya-mukayu) · Yamashiro Onsen | 2h/1 train | 4h30/3 train (two researched halves) | +1h48 · a stop, not a free connector |
| Kyoto → Miyajima | 2h42/2 | [Ryokan Nishiyama](https://ryokancatalog.com/inn/ryokan-nishiyama) · Onomichi | 2h18/1 shinkansen | 2h18/3 ferry | +1h54 · a stop, not a free connector |
| Takayama → Nagoya | 2h45/0 | [Hiiragiya](https://ryokancatalog.com/inn/hiiragiya) · Kyoto | 3h48/1 train | 54 min/0 shinkansen | +1h57 · a stop, not a free connector |
| Kanazawa → Nikkō | 4h/2 | [Shoraiso](https://ryokancatalog.com/inn/shoraiso) · Yudanaka | 2h12/1 train | 3h48/3 shinkansen | +2h · a stop, not a free connector |
| Kanazawa → Nikkō | 4h/2 | [Bettei Senjuan](https://ryokancatalog.com/inn/bettei-senjuan) · Minakami / Tanigawa | 3h15/1 shinkansen | 2h48/2 shinkansen | +2h03 · a stop, not a free connector |
| Tokyo → Kyoto | 2h45/0 | [Hanamurasaki](https://ryokancatalog.com/inn/hanamurasaki) · Yamanaka Onsen | 3h15/0 shinkansen | 1h36/1 train | +2h06 · a stop, not a free connector |
| Fukuoka → Amakusa | 1h54/1 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 1h/0 train | 3h/2 train | +2h06 · a stop, not a free connector |
| Kyoto → Nikkō | 4h42/2 | [Asaba](https://ryokancatalog.com/inn/asaba) · Izu peninsula | 2h42/0 train | 4h12/3 train | +2h12 · a stop, not a free connector |
| Kyoto → Lake Kawaguchi | 4h15/1 | [Asaba](https://ryokancatalog.com/inn/asaba) · Izu peninsula | 2h42/0 train | 3h45/3 train | +2h12 · a stop, not a free connector |
| Osaka → Nikkō | 5h12/3 | [Hakone Suishoen](https://ryokancatalog.com/inn/hakone-suishoen) · Hakone | 3h24/2 shinkansen | 4h/3 train | +2h12 · a stop, not a free connector |
| Kyoto → Lake Kawaguchi | 4h15/1 | [Gora Kadan Fuji](https://ryokancatalog.com/inn/gora-kadan-fuji) · Oyama | 2h36/0 train | 3h54/2 train | +2h15 · a stop, not a free connector |
| Tokyo → Kyoto | 2h45/0 | [Beniya Mukayu](https://ryokancatalog.com/inn/beniya-mukayu) · Yamashiro Onsen | 3h/0 shinkansen | 2h/1 train | +2h15 · a stop, not a free connector |
| Tokyo → Kyoto | 2h45/0 | [Kanshuku-en Eshikoto](https://ryokancatalog.com/inn/kanshuku-en-eshikoto) · Eiheiji | 3h15/0 shinkansen | 1h45/1 train | +2h15 · a stop, not a free connector |
| Kyoto → Nikkō | 4h42/2 | [Hakone Suishoen](https://ryokancatalog.com/inn/hakone-suishoen) · Hakone | 3h/1 train | 4h/3 train | +2h18 · a stop, not a free connector |
| Kyoto → Nikkō | 4h42/2 | [Bettei Senjuan](https://ryokancatalog.com/inn/bettei-senjuan) · Minakami / Tanigawa | 4h15/1 shinkansen | 2h48/2 shinkansen | +2h21 · a stop, not a free connector |
| Fukuoka → Amakusa | 1h54/1 | [Sanso Tensui](https://ryokancatalog.com/inn/sanso-tensui) · Amagase | 1h45/0 train | 2h30/0 car | +2h21 · a stop, not a free connector |
| Fukuoka → Kumamoto | 42 min/0 | [Tayuta](https://ryokancatalog.com/inn/tayuta) · Amakusa | 1h54/1 train | 1h12/0 car | +2h24 · a stop, not a free connector |
| Kumamoto → Takachiho | 2h/0 | [Tayuta](https://ryokancatalog.com/inn/tayuta) · Amakusa | 1h12/0 car | 3h12/0 car | +2h24 · a stop, not a free connector |
| Fukuoka → Miyajima | 2h15/2 | [Migiwatei Ochi Kochi](https://ryokancatalog.com/inn/migiwatei-ochi-kochi) · Tomonoura | 2h30/0 shinkansen | 2h12/2 shinkansen | +2h27 · a stop, not a free connector |
| Tokyo → Nikkō | 2h/0 | [Bettei Senjuan](https://ryokancatalog.com/inn/bettei-senjuan) · Minakami / Tanigawa | 1h40/0 train | 2h48/2 shinkansen | +2h28 · a stop, not a free connector |
| Beppu → Kagoshima | 3h12/1 | [Takefue](https://ryokancatalog.com/inn/takefue) · Kurokawa Onsen | 2h24/0 bus | 3h18/1 train | +2h30 · a stop, not a free connector |
| Kanazawa → Nikkō | 4h/2 | [Otogi no Yado Yoneya](https://ryokancatalog.com/inn/otogi-no-yado-yoneya) · Sukagawa | 3h42/2 shinkansen | 2h48/2 shinkansen | +2h30 · a stop, not a free connector |
| Kyoto → Lake Kawaguchi | 4h15/1 | [Hakone Suishoen](https://ryokancatalog.com/inn/hakone-suishoen) · Hakone | 3h/1 train | 3h45/3 train | +2h30 · a stop, not a free connector |
| Sendai → Kakunodate | 2h15/0 | [Yamado](https://ryokancatalog.com/inn/yamado) · Hotto-Yuda | 2h/1 shinkansen | 2h48/2 shinkansen | +2h33 · a stop, not a free connector |
| Tokyo → Nikkō | 2h/0 | [Otogi no Yado Yoneya](https://ryokancatalog.com/inn/otogi-no-yado-yoneya) · Sukagawa | 1h45/1 train | 2h48/2 shinkansen | +2h33 · a stop, not a free connector |
| Kagoshima → Amakusa | 2h18/1 | [Myoken Ishiharaso](https://ryokancatalog.com/inn/myoken-ishiharaso) · Kirishima | 54 min/0 train | 4h/0 car | +2h36 · a stop, not a free connector |
| Fukuoka → Amakusa | 1h54/1 | [Yoyokaku](https://ryokancatalog.com/inn/yoyokaku) · Karatsu | 1h15/0 train | 3h18/0 car | +2h39 · a stop, not a free connector |
| Sendai → Kakunodate | 2h15/0 | [Tsuchiyu Bettei Satonoyu](https://ryokancatalog.com/inn/tsuchiyu-bettei-satonoyu) · Tsuchiyu Onsen | 1h/0 train | 3h54/1 shinkansen | +2h39 · a stop, not a free connector |
| Tokyo → Kakunodate | 3h06/0 | [Bettei Senjuan](https://ryokancatalog.com/inn/bettei-senjuan) · Minakami / Tanigawa | 1h40/0 train | 4h06/1 shinkansen | +2h40 · a stop, not a free connector |
| Kyoto → Lake Kawaguchi | 4h15/1 | [Arcana Izu](https://ryokancatalog.com/inn/arcana-izu) · Yugashima | 3h03/1 train | 3h54/3 train | +2h42 · a stop, not a free connector |
| Kumamoto → Takachiho | 2h/0 | [Sanso Tensui](https://ryokancatalog.com/inn/sanso-tensui) · Amagase | 1h42/1 train | 3h/0 car | +2h42 · a stop, not a free connector |
| Kumamoto → Takachiho | 2h/0 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 1h48/1 train | 3h/0 car | +2h48 · a stop, not a free connector |
| Tokyo → Kakunodate | 3h06/0 | [Onyado Kawasemi](https://ryokancatalog.com/inn/onyado-kawasemi) · Iizaka Onsen | 2h/1 train | 3h54/2 shinkansen | +2h48 · a stop, not a free connector |
| Kagoshima → Amakusa | 2h18/1 | [Sanso Tensui](https://ryokancatalog.com/inn/sanso-tensui) · Amagase | 2h40/1 scenic | 2h30/0 car | +2h52 · a stop, not a free connector |
| Kumamoto → Takachiho | 2h/0 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 2h24/1 train | 2h30/0 car | +2h54 · a stop, not a free connector |
| Sendai → Kakunodate | 2h15/0 | [Onyado Kawasemi](https://ryokancatalog.com/inn/onyado-kawasemi) · Iizaka Onsen | 1h15/1 train | 3h54/2 shinkansen | +2h54 · a stop, not a free connector |
| Tokyo → Nikkō | 2h/0 | [Onyado Kawasemi](https://ryokancatalog.com/inn/onyado-kawasemi) · Iizaka Onsen | 2h/1 train | 2h54/2 train | +2h54 · a stop, not a free connector |
| Tokyo → Kakunodate | 3h06/0 | [ryugon](https://ryokancatalog.com/inn/ryugon) · Echigo-Yuzawa | 1h45/0 train | 4h18/1 shinkansen | +2h57 · a stop, not a free connector |
| Tokyo → Nikkō | 2h/0 | [ryugon](https://ryokancatalog.com/inn/ryugon) · Echigo-Yuzawa | 1h45/0 train | 3h12/2 shinkansen | +2h57 · a stop, not a free connector |
| Kyoto → Nikkō | 4h42/2 | [ryugon](https://ryokancatalog.com/inn/ryugon) · Echigo-Yuzawa | 4h30/1 shinkansen | 3h12/2 shinkansen | +3h · a stop, not a free connector |
| Tokyo → Nikkō | 2h/0 | [Atamiso](https://ryokancatalog.com/inn/atamiso) · Bandai-Atami | 2h12/1 shinkansen | 2h48/2 shinkansen | +3h · a stop, not a free connector |
| Sendai → Kakunodate | 2h15/0 | [Atamiso](https://ryokancatalog.com/inn/atamiso) · Bandai-Atami | 1h/1 shinkansen | 4h18/2 shinkansen | +3h03 · a stop, not a free connector |
| Tokyo → Kakunodate | 3h06/0 | [Otogi no Yado Yoneya](https://ryokancatalog.com/inn/otogi-no-yado-yoneya) · Sukagawa | 1h45/1 train | 4h24/2 shinkansen | +3h03 · a stop, not a free connector |
| Tokyo → Kakunodate | 3h06/0 | [Tsuchiyu Bettei Satonoyu](https://ryokancatalog.com/inn/tsuchiyu-bettei-satonoyu) · Tsuchiyu Onsen | 2h15/0 shinkansen | 3h54/1 shinkansen | +3h03 · a stop, not a free connector |
| Kagoshima → Amakusa | 2h18/1 | [Onyado Chikurintei](https://ryokancatalog.com/inn/onyado-chikurintei) · Takeo Onsen | 2h36/1 train | 3h/2 train | +3h18 · a stop, not a free connector |
| Fukuoka → Amakusa | 1h54/1 | [Sanso Murata](https://ryokancatalog.com/inn/sanso-murata) · Yufuin | 2h10/0 train | 3h06/0 car | +3h22 · a stop, not a free connector |
| Sendai → Kakunodate | 2h15/0 | [Otogi no Yado Yoneya](https://ryokancatalog.com/inn/otogi-no-yado-yoneya) · Sukagawa | 1h18/1 train | 4h24/2 shinkansen | +3h27 · a stop, not a free connector |
| Fukuoka → Amakusa | 1h54/1 | [Mt.Resort Unzen Kyushu Hotel](https://ryokancatalog.com/inn/mt-resort-unzen-kyushu-hotel) · Unzen | 3h/2 bus | 2h30/0 car | +3h36 · a stop, not a free connector |

*Hours are door to door and run both ways; `2h/1` is two hours and one change. A detour of `none` or less means the two halves come to no more than the direct journey. Up to 1h30 extra still counts as a free connector; past that the row is marked **a stop, not a free connector** — the place is worth a night of its own, and the detour is the price of it. Those marked rows appear only where a pair has no free connector at all.*
<!-- /generated:connectors -->

### How to read it, and what it doesn't have

- **Every row above is researched**, so nothing in them is labelled estimated. Two kinds of number are: one you look up yourself for a missing pair, and one marked "estimated" in `data/transit-legs.md` or the route builder. Say where the number came from, keep the word "estimated" attached every time you repeat it, and give any day built on one an extra buffer.
- **Changes cost more than the clock says.** Two hours with no changes is an easier day than ninety minutes with two.
- **Times run both ways**, and each row is printed in whichever direction it was researched. Read From/To as a pair, not as an order. **A pair is missing only if it appears in neither direction** — scan for both places by name before writing a number down. Don't work from a memorised list of gaps: the tables are regenerated as legs are researched.
- **Airports are a separate table** covering fewer cities than the main one, and **every row in it runs both ways** — the transfer in from the terminal on arrival is the same journey as the one out. Check it specifically before promising a transfer, and never reuse one airport's number for another serving the same city: Tokyo's two are an hour apart in opposite directions.
- **Inn legs are not in these tables.** The journey from a gateway city to an individual inn is the `Reach` column of the master inn table in Stage 4, written `kyoto 3h/1 train` — hours, changes and mode, from the same researched leg table as the rows above. **Every leg row carries a mode**, and the Reach tag gives you one, so there is never a reason to leave it off or to borrow it from somewhere else. A tag reading `in town` means the inn is in that city: no journey, so no leg row. Where a reach tag says `changes to confirm`, the hours were researched and the number of changes was not: write it as `3h, changes to confirm`.
- **An airport leg may be COMPOSED out of two rows that are both in the tables.** A missing row is usually a journey the tables hold in two parts. Kyoto→Haneda is the standard case — no Kyoto→HND row, but the corridor table has **Kyoto→Tokyo 2h45, 0 changes** and the airport table has **Tokyo→HND 36 min, 1 change**, so the leg is `2h45 + 36min = 3h21`, changes `0 + 1 = 1`, **plus one for the join at Tokyo = 2**. Write both parts, show the sum, and count the extra change — a plan that swallows it understates the morning. Two rules: **compose only where both halves are researched rows of these tables** (two halves at most — a three-part chain is a live lookup), and **add the transfer time at the join** if the halves do not meet in the same station. A composed leg counts as sourced and is written as a time.
- **ANY leg composes the same way, not just an airport one — and composing comes before `to confirm`.** Grep the full leg table first (step 4a); if `A→B` is absent there too, find a **hub city** the tables hold both halves through — **Tokyo, Sendai, Kyoto, Osaka, Nagoya, Kanazawa, Okayama, Hiroshima, Fukuoka, Kumamoto, Nagasaki, Kagoshima, Sapporo** — and take the fastest that works; a town with no flight row of its own may compose its airport transfer with the airport's flight row. Sum the halves, add **one change for the join**, name both modes where the halves differ (an airport transfer row counts as a half), and label the row `composed via <city>`: `2h + 2h45 = 4h45`, `changes 0+0+1 = 1`. Same three rules as above. A composed leg is sourced, never "estimated"; `to confirm` is only for a pair no hub joins.
- **Okinawa is absent from the dataset:** a trip there means looking up every leg. Hokkaido's Sapporo hub, its towns and New Chitose are in the tables.
- **For any gap:** look it up live — Google Maps, Jorudan or Navitime, station to station for the dates in question — say in the plan that you looked it up, and write it as an estimate. Never fill a hole from memory.
- **Winter and mountains.** Mountain and coastal lines carry real weather delays in winter, and some are single-track with a handful of services a day. Leave slack, and never schedule a flight immediately after one.
- **The last mile is often the hard part.** Country inns sit some way from the nearest station. Many run a shuttle on a fixed timetable that must be requested at booking; some have none, and the rank at a small station can be empty. Ask the inn how you are meant to arrive, and put the answer in the plan.

### Try it in both directions

Lay the stop list out along the geography, then **reverse it and price the reverse**. Reversals routinely save hours: a painful backtrack in one direction sits directly on the line in the other. Show both totals in the comparison table of step 5, a row each; the lower one usually wins outright. Then check three things:

1. **No zig-zags.** If the route goes past a place, comes back, and goes past it again, resequence.
2. **The dinner rule survives the reordering.** Three inn dinners in a row is the cap, and reordering can create a run of four without your noticing.
3. **The exit works.** Pick the airport you fly home from **last**, once the order is settled, and pick the one nearest the final stop: flying into one airport and home from another is the default, and doubling back across the country to leave from the one you landed at spends a day for nothing. The usual exits are **HND** and **NRT** for Tokyo, **KIX** for Kyoto and Osaka, **CTS** for Hokkaido, **NGO** for a route ending at Takayama or Nagoya, and **FUK**, **KOJ**, **NGS**, **KMJ** or **OIT** for Kyushu, whichever end of the island the route finishes at; any airport with a Haneda flight counts, Komatsu and Hiroshima included. A fixed Haneda ticket at the far end of a Kyushu or Hokkaido trip is the transfer to the nearest airport plus that airport's Haneda flight, both rows in the tables — or two Tokyo nights at the close, which is what the spines offer. A return ticket already booked out of one city settles the question before the route starts.

### Two practical things

- **Luggage forwarding.** Hand a suitcase to the front desk in the morning and it reaches the next hotel the following afternoon for roughly the price of a couple of meals, while you travel with an overnight bag. Use it for mountain legs with stairs and changes, for one-night stops, and for anything that would mean wrestling a case onto a crowded train. Two catches: it is **next-day, not same-day**, so keep a night's things with you, and some remote inns sit outside the fastest service areas.
- **Is a rail pass worth it?** Sometimes. The nationwide pass is priced against long-distance return travel and rose sharply in 2023, so it no longer pays for itself on a trip that mostly sits in two cities. The test: add up the individual fares for the long journeys in the plan, compare with the pass price for the same days, buy only if it wins. Regional passes are often better value for these shapes. Separately, **reserve seats** for long journeys with luggage, especially around New Year, the early-May holiday week and mid-August, when some trains are reserved-only.

### If two versions of the trip are still alive

Compare them in one frame — the same measures applied to both, no measure counted against one and forgiven in the other.

| | Version A | Version B |
|---|---|---|
| Total travel hours (including the journey to the airport at the end) | | |
| Number of changes | | |
| Number of separate check-ins | | |
| One-night stops | | |
| Nights at inns vs nights in cities | | |
| Days needing a car | | |
| Journeys on estimated times | | |

Show the table, name the trade-off in a sentence, say which you'd take — and let them choose. Cost differences belong in the verdict only if they are large; a few hundred either way on a trip this size is noise.

The visual fits here: two plans in one frame. Fill `guides/trip-visual-template.html` from the two
itinerary tables and follow `guides/visualizing-the-trip.md`. Offer it in one line; build it if they
say yes.

### The plan — this is the deliverable

Finish the itinerary table and show it whole. **Only three leg forms are allowed** — a sourced time, a time you looked up live and labelled an estimate, or `to confirm`. Never a fourth. A leg composed out of two researched rows through a hub city (Kyoto→Tokyo + Tokyo→HND) is the first form, written as the sum with both halves named and the row labelled `composed via <city>`; `to confirm` is only for a pair with no researched path even through a hub. An invented travel time is the mistake in this kit most likely to cost somebody a booking.

A leg row reads `↓ <h>h · <n> changes · <mode>`; a composed one names its hub in the same row — `↓ 4h45 · 1 change · shinkansen (composed via Tokyo)`, said to them as two researched journeys added together, *"two trains: Kyoto to Tokyo, then Tokyo to the airport"*; an estimated one `↓ ~1h50 · 1 change · bus (estimated — looked up live)`; an unsourced one `↓ to confirm`.

**Trip plan** · `<dates>` · `<n>` nights · arrive `<airport>`, depart `<airport>`

| # | Stop | Nights | Stay | Band | Alternate |
|---|---|---|---|---|---|
| | ↓ in from `<airport>` · `<h>h` · `<n>` changes · `<mode>` | | | | |
| 1 | `<stop>` | `<n>` | [`<name>`](`<link>`) | `<band>` | [`<name>`](`<link>`) |
| | ↓ `<h>h` · `<n>` changes · `<mode>` | | | | |
| 2 | `<stop>` | `<n>` | [`<name>`](`<link>`) | `<band>` | [`<name>`](`<link>`) |
| | ↓ `<h>h` · `<n>` changes · `<mode>` | | | | |
| 3 | `<stop>` | `<n>` | [`<name>`](`<link>`) | `<band>` | [`<name>`](`<link>`) |
| | ↓ out to `<airport>` · `<h>h` · `<n>` changes · `<mode>` | | | | |

**Totals:** `<n>` travel hours · `<n>` changes · `<n>` check-ins · `<n>` inn nights / `<n>` city nights · `<n>` one-nighters. Every figure here comes from `plan`, the airport legs' changes included, never typed; the travel total sums the leg rows above, both airport legs in it, rounded to five minutes.

**Notes:** `<shuttle window, last-mile detail>`, one per stop that needs one. **Assumed:** `<every default you chose for them>`.

**To confirm**

1. `<unsourced leg, unverified opening, shuttle to arrange>`

**The totals line includes the departure leg.** A plan whose travel hours stop at the last hotel understates the trip by two hours and hides the morning that decides whether the flight is catchable.

The `To confirm` list is the next thing they have to do. Keep it specific and short.

**Then offer the visual, in one line.** `guides/trip-visual-template.html` draws this table as a page
they can open in a browser: the stops as bars sized by nights, every leg as a chip with its hours,
changes and source, the stays with links and bands, and the totals as a table. `guides/visualizing-the-trip.md`
says how to fill it and what not to put on it. It shows the plan and nothing beyond it.

## Stage 6 — Optional depth

```
Goal    whichever of the three they actually want
Inputs  the finished Trip plan
Do      offer (a) eating (b) day ideas (c) the booking calendar (d) the trip drawn as a page, in
        one line; do the one they pick. (a) and (b) open by asking what they like, not with a list
Tables  eating `| Place | Type | Price | Neighbourhood | Booking | Map |`, grouped under a heading per
        cuisine · day ideas `| Idea | What it is | Time | Map |` · the calendar as it is printed below
Ask     1 question — which of the four; then the taste or interest questions
Output  the thing they picked, and a checklist with real dates if (c)
Next    nothing. That is the whole job.
```

Only after the plan exists. **Don't deliver all four unasked.**

**A fun read to offer once in this stage:** the kit's author wrote an illustrated trip report from an earlier Japan trip, photos and meals: https://docs.google.com/document/d/18FJshPTanc0IR7VbOufL0bE4Dz3prDVKNJuIeoNFmT0/edit — a Google Doc; if the link asks for access, say it is optional and move on.

### (a) Eating

**The first message is an interview, not a list of restaurants.** One short paragraph, then four questions, read against their `Taste:` line so you don't re-ask it.

The paragraph says three things: nobody needs reservations to eat superbly in Japan, most eating is walk-in, and two or three booked meals per city is the most anyone needs. None is a normal answer. Then the questions, with examples to react to, glossing each Japanese word:

1. **Which styles pull at you?** — sushi counter, izakaya, ramen, soba, udon, kaiseki, yakitori, tempura, tonkatsu, yakiniku, French or Italian in Japan, wine bars, cocktail bars, coffee, listening bars (built around a record collection).
2. **How formal, and what would you spend on a good dinner?** — a ¥3–6k counter, a ¥10–15k room, ¥25k and up for one big meal. Ask whether an ambitious lunch appeals: it is the cheaper way in.
3. **Drinks, and anything you don't eat?** — sake, natural wine, cocktails, none; allergies, vegetarian, no raw fish.
4. **How much booking effort do you want?** — none at all (then every place you name is walk-in), two or three anchors per city, or go all in.

**Name the two sources once.**

- **`guides/dining.md`**, if it came with this kit — roughly 430 venues in Tokyo, 215 in Fukuoka, 110 in Kyoto, 80 in Osaka, 80 in Kagoshima, 25 in Kanazawa, and shorter sections for Kobe, Hiroshima, Takayama, Sendai, Nara and Yanagawa. Written from one traveller's palate — creative low-key rooms, counters, natural wine — and every entry checked for whether a table can be got. Lotteries, memberships and introduction-only rooms were cut.
- **The illustrated trip report** linked above: one earlier trip in photos, not a survey.

**Open one city at a time**, `guides/dining/<city>.md` for the stops on the plan and
`guides/dining/index.md` to list them; **never `guides/dining.md` whole**: it is half a megabyte,
and the city files are the same text.

Say that what follows is a small subset chosen against their answers, and that they can **ask for more in any category, neighbourhood or price at any time.**

**If the dining guide isn't there**, say so in one line, name the **`japan-trip-kit`** repository on GitHub as the way to get it, and carry on.

**The recommendations are a table, never a list of paragraphs**, with a heading per cuisine or category above each one — sushi · izakaya · noodles · kaiseki and kappō · yakitori and grills · tempura and tonkatsu · Western-in-Japan · wine bars · cocktail bars · listening bars · coffee — and never a grouping by how hard they are to book:

| Place | Type | Price | Neighbourhood | Booking | Map |
|---|---|---|---|---|---|
| `<name>` | `<cuisine or room type>` | `<band per head, dinner or lunch>` | `<neighbourhood, not the address>` | `<walk-in · Tabelog · TableCheck · OMAKASE.in · phone, in Japanese · through the hotel>` | [map](`<link>`) |

One line of prose per place at most, under the table, and only where the pitch needs it; the price and the booking channel are cells, never sentences. Lotteries and midnight releases are excluded by rule. The booking-effort answer decides what appears: "none" means walk-in places only; "two or three anchors" means at most that many bookable places per city, the rest walk-in; "all in" opens the hard-to-get tier. The **Tabelog score** is optional — Tabelog is Japan's own review site, 3.5 and up very good, 3.7 and up excellent, and casual places are not marked down for being cheap.

**The map link rule.** A guide row's real pin (`google.com/maps/place/…`) is best: pass it straight through. A name-search link (`google.com/maps/search/?…query=`) is an acceptable fallback: pass it through labelled "map (search)" so the reader knows to check the pin lands on the venue. If you can look the venue up live, a confirmed pin replaces the search link. Never write a map link from memory.

**Two rules for the picks.** On inn nights dinner is at the inn, so no restaurant those evenings. A listing with no available dates is not a channel — check it, or say you haven't.

**How the messages close.** The first ends with the taste questions and nothing else. Every one after ends with **"more in any category, or another neighbourhood?"** Never close by pointing at the booking calendar; offer it only once they ask for anchors, and only for the ones they chose.

### (b) Day ideas per stop

**Ask what interests them before you name anything.** Same pattern as (a): a short paragraph, then three questions, read against their `Draws:` line. Don't recite the guidebook.

1. **What pulls at you?** — temples and gardens, craft and design, markets, neighbourhoods to walk, museums, nature, pop culture, an onsen open to day visitors.
2. **How full should a day be?** — one anchor and time to wander, or two or three planned things.
3. **Anything you already know you want?** — a named museum, a garden, a show.

Then the ideas, as a table per stop, the stop as its heading:

| Idea | What it is | Time | Map |
|---|---|---|---|
| `<name>` | `<one line>` | `<half a day · 2h · a morning>` | [map](`<link>`) |

- Three or four ideas per stop, and a note under the table on which need advance tickets.
- **Two should be low-effort** (a neighbourhood to walk, a market, a bath) and **one should be the thing the place is known for.**
- **Default rhythm per city block:** one landmark day, one neighbourhood day on foot, and one day with a single anchor and nothing after it.
- **In the countryside the anchor is the bath and the meal**, and the day around it stays empty. A three o'clock inn check-in does not survive a morning excursion an hour away.
- **No more than one big timed thing per day**, and one empty afternoon per week.
- **Check anything seasonal against the month.** Mountain roads, ropeways, gorge railways and some gardens and museums close for the winter.
- Anything needing an advance ticket goes in the calendar, not the day list.
- Close the way (a) closes.

### (c) The booking calendar

Order by **deadline**, not by trip order: a checklist, earliest first, with a real date against each item counted back from departure.

| When | Date | What | Book it at | Why |
|---|---|---|---|---|
| **6–12 months out** | `<date>` | Long-haul flights | [Google Flights](https://www.google.com/travel/flights) | Price and seat choice, especially around New Year, blossom season and mid-August |
| **6 months out** | `<date>` | The one inn the trip is built around | its page on [ryokancatalog.com](https://ryokancatalog.com), then the inn's own site | The best inns open their books six months to a year ahead, sometimes by phone or email only, and the sought-after rooms go the day the window opens. If a room type is the reason for the stay, treat the opening date as an appointment |
| **4–6 months out** | `<date>` | Every other inn | the inn's own site, or [Ikyu](https://www.ikyu.com/) | The comfortable lead time. Later than three months and the popular ones are gone |
| **3–4 months out** | `<date>` | City hotels | the property's own page — the `Map` and `Site` links in the hotel table | Usually open and often free to cancel, so book early and revise. Rates rise as the date nears |
| **2–3 months out** | `<date>` | The restaurants they chose as anchors, if any | the channel named on the row — walk-in, [Tabelog](https://tabelog.com/en/), [TableCheck](https://www.tablecheck.com/), [OMAKASE](https://omakase.in/en) or the hotel | Only the ones they picked. Windows differ per restaurant, so give each its own date |
| **1–2 months out** | `<date>` | Rail passes | [Japan Rail Pass](https://www.japanrailpass.net/en/) and the regional passes beside it | And confirm whether the plan needs one |
| **1 month out** | `<date>` | Reserved seats on long trains | [smartEX](https://smart-ex.jp/en/) for the Tokyo–Kyoto–Hiroshima line, [JR-EAST train reservation](https://www.eki-net.com/en/jreast-train-reservation/) north and west | Reservations open a set period ahead, commonly a month |
| **1 month out** | `<date>` | Inn shuttles and arrivals | email the inn directly — the address is on its own site | Many pickups need a request at booking or a call the day before, and some remote stations have no taxis. Confirm in writing |
| **1 month out** | `<date>` | Popular timed tickets | the venue's own page first, then [Lawson Ticket](https://l-tike.com/) or [e+](https://eplus.jp/) | Some sell out within hours, sometimes through a convenience-store ticketing system rather than the venue's site, and sometimes only inside Japan. Find the release date and have a second choice |
| **2 weeks out** | `<date>` | Car hire, if needed | [Toyota Rent a Car](https://rent.toyota.co.jp/eng/) or [Times Car Rental](https://www.timescar-rental.com/) | And an international driving permit, obtained at home before departure |
| **1 week out** | `<date>` | Dietary requests and any special occasion | email each inn and each booked restaurant | Inn menus are fixed weeks ahead |
| **Before leaving** | `<date>` | Travel money, transport card, connectivity, confirmations saved offline | [Suica](https://www.jreast.co.jp/multi/en/pass/suica.html) on the phone, and an eSIM before you fly | Cash still matters outside the cities |

**Put a real date in the `Date` column, counted back from their departure date** — "6 months out" is not a deadline anybody acts on, and each row of this table has to name a day. Where a window opens on a fixed date rather than a rolling one (an inn's booking window, a restaurant's first-of-the-month release), write that date, not the count-back. **Every row is a live link**, so that the next click is in the table rather than in a search.

**Restaurant windows live here, and only for the anchors they chose.** A restaurant that books a fixed period ahead usually opens on the first of the month, one to three months out, and the good seats go the same day. Put each anchor's opening date in the checklist. No other restaurant belongs in the calendar.

Hand over the checklist with real dates, and the Stage 5 plan alongside it.

### (d) The trip drawn as a page

A single HTML file they open in a browser: the stops in travel order as bars sized by nights, every
leg as a chip with its hours, changes, mode and where the number came from, each stay with its link and
price band, and the totals as a table, drawn on a map of Japan with the inns'
photos. **No `To confirm` list and no follow-ups of any kind** — the page is for understanding the
trip, not running its logistics. The one exception is a rare **watch line** under a single leg chip,
for a major transit flag only: an estimated or composed leg, a driving day, a ferry, a bus that must
be reserved, a winter-risk pass. **`guides/trip-visual-template.html`** ships pre-filled with the sample plan: overwrite its five
marked `EDIT` zones from the itinerary table (it is plain HTML, no script to run) and hand the file over
the way `visualizing-the-trip.md` says for your environment (artifact, canvas, or a file to open in a browser);
**`guides/visualizing-the-trip.md`** carries the rules and the pre-flight checklist, and
**`guides/design-principles.md`** is the checklist a finished page is read against (with
`guides/design-language.md` behind it, for the one case where the template itself must change).

It also draws two candidate plans in one frame, which Stage 5 explains. If two versions are still
open, offer this before (a), (b) or (c): the choice comes first.

Everything on the page comes from the plan; nothing is invented for it, and there are no day-by-day
cards, since days are for after the trip is booked.

## Appendix

### The Trip profile block

Fill this in Stage 1, show it, and update it whenever the plan shifts. Rendered text, not a code block.

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

`Assumed` is the honest record of what they did not answer, and where they will spot a wrong guess.

### The tables the run hands over

Every sequence, set of options and comparison is a table, and each stage has one header line; the one exception is a Stage 2 place card, two or three sentences in prose. The prose beside a table carries the pitch and the trade-offs; hours, prices, links and scores live in cells and never in a sentence. Nothing is set in a code fence; code formatting is for the engine's own names only (a spine id, a decision key, a stop string), never for prose.

- **Stage 3, the spine menu** — `| Route | Who it's for | The trip | Nights | Travel | Ryokan nights | Flights | Fly in / home from |`, one row per spine at its default assembly
- **Stage 3, a spine's decisions** — `| Where | Decision | Options (chosen in bold) |`, the rows grouped in trip order (a city, its attachment, the next leg's slots, the next city), the options and descriptions as spines.json prints them
- **Stage 3, a timeline** — `| Stop | Nights | Onward |`, one row per stay, the arrival transfer first, the leg under each stop as time to five minutes and one mode word, the stop string beneath
- **Stage 3, a change before and after, or two routes compared; Stage 5, orders compared** — `| Route | Stops | Nights | Travel | Per night | Check-ins | Ryokan nights | Flights | In / out |` (Stage 5 keeps `| Order | Hours | Per night | Changes | Check-ins | Inn / city nights | One-nighters |`), one row per route
- **Stage 4, the stays for a stop** — `| Stay | Town | Band | Bath | Why | Links |`, one table per stop, the town as a column where a ryokan option spans towns
- **Stages 3 to 5, the plan itself** — the itinerary table below, filled progressively
- **Stage 6, eating** — `| Place | Type | Price | Neighbourhood | Booking | Map |`, under a heading per cuisine
- **Stage 6, day ideas** — `| Idea | What it is | Time | Map |`, one table per stop
- **Stage 6, the booking calendar** — `| When | Date | What | Book it at | Why |`, ordered by deadline

**An inn stop is one night.** Two only where the plan argues for it — they asked for slower travel, it is the trip's only inn stay, or traditional inns and hot springs are what they came for — and the plan says which.

### The itinerary table

The one table the run is built in, filled progressively from Stage 3 to Stage 5, and the deliverable. Rendered markdown with live links — never a fenced block, which kills the links and sets a plan in monospace.

**Trip plan** · `<dates>` · `<n>` nights · arrive `<airport>`, depart `<airport>`

| # | Stop | Nights | Stay | Band | Alternate |
|---|---|---|---|---|---|
| | ↓ in from `<airport>` · `<h>h` · `<n>` changes · `<mode>` | | | | |
| 1 | `<stop>` | `<n>` | [`<name>`](`<link>`) | `<band>` | [`<name>`](`<link>`) |
| | ↓ `<h>h` · `<n>` changes · `<mode>` | | | | |
| 2 | `<stop>` | `<n>` | [`<name>`](`<link>`) | `<band>` | [`<name>`](`<link>`) |
| | ↓ `<h>h` · `<n>` changes · `<mode>` | | | | |
| 3 | `<stop>` | `<n>` | [`<name>`](`<link>`) | `<band>` | [`<name>`](`<link>`) |
| | ↓ out to `<airport>` · `<h>h` · `<n>` changes · `<mode>` | | | | |

**Totals:** `<n>` travel hours · `<n>` changes · `<n>` check-ins · `<n>` inn nights / `<n>` city nights · `<n>` one-nighters. Every figure here comes from `plan`, the airport legs' changes included, never typed; the travel total sums the leg rows above, both airport legs in it, rounded to five minutes.

**Notes:** `<shuttle window, last-mile detail>`, one per stop that needs one. **Assumed:** `<every default you chose for them>`.

**To confirm**

1. `<unsourced leg, unverified opening, shuttle to arrange>`

**How it is read, wherever it appears.** Stage 3 fills `#`, `Stop`, `Nights` and every leg row; Stage 4 fills `Stay`, `Band` and `Alternate`; Stage 5 adds the airport rows and the totals. Show it whole each time it changes. **Mode** is the word the corridor and airport tables print — `shinkansen` · `train` · `subway` · `bus` · `car` · `ferry` · `flight` — and the master inn table's `Reach` column prints it too, so **every leg row has one**; two hours on a bullet train and two hours on a mountain bus are different days. **A hotel's `Stay` links to its Google Maps pin, an inn's to its `ryokancatalog.com` page.** A leg has three forms and no fourth: sourced, `estimated` and labelled every time, or `to confirm`, which is left out of the totals and makes them partial — `≥ 6h00 (partial — 1 leg unsourced)`.

### Finding a stay the kit doesn't hold

Stage 4's tables are a **design-and-luxury list** and do not cover every town. When the stop isn't in them, or the budget sits below them, say so plainly — "Japan is not expensive, this particular list is" — and go and find something. `guides/research-method.md` is the long version.

1. **Check this kit first, every time.** The master table, `catalog/catalog.md` and `data/hotels.md` already answer most stops, with travel times that were looked up rather than guessed. Say what they hold for this stop, then go outside — and say plainly that the kit did not cover it.
2. **Read the Japanese sites first** — the sample is ten times the English one. **Ikyu (一休)** is the upper end and prints an overall out of 5 plus sub-ratings: **4.5 good, 4.7 very good, 4.8+ the top of the market**; 4.2 on a famous name is a warning. **Rakuten Travel** and **Jalan** cover everything below. Read the **distribution and the sub-ratings**, never one review.
3. **The property's own site is the only truth for policy** — tattoos, children, meal plans, whether the bath is a real hot spring, whether a "private bath" is in the room or booked by the hour. Note the policy for **overnight guests**, which is not always the one posted for day visitors.
4. **Then the English connoisseurs** — FlyerTalk's Japan forums, TripAdvisor's long reviews. For judgement and comparison, not for facts about the building.
5. **Verify the negatives too.** "Fully booked", "closed", "referral only" are claims like any other, and a false one silently deletes the best option.
6. **Link the real place**, not a name search, and **vary the properties across the trip** — "just extend the last hotel" costs you something.

**Evidence** = stays, scores, distributions, the property's own written policy. **Not evidence** = the hotel's own adjectives, a press release, one glowing review, an aggregator's "9.4 Wonderful".

**Present a find as a row of the same table** — the neighbourhood goes in `Why`, and the band cell is marked "unverified — check live for your dates". A named property with an honest caveat is a plan; a neighbourhood and a price range is homework.

**The reliable floor, in any city:** a clean, well-run, well-located mid-range room for two runs roughly **$90–200** a night, everywhere. The chains: **Dormy Inn** (communal hot bath, often a real spring), **Mitsui Garden**, **Candeo**, **Richmond**, **Daiwa Roynet**, **Sotetsu Fresa Inn**, the **JR station hotels** (Granvia, JR-East Metropolitan — attached to the platforms, which on a moving trip beats everything) and **OMO by Hoshino Resorts**. The difference between a $120 and a $400 room here is size, breakfast and view.

### Credits

The accommodation catalogue behind this kit exists because of **KI-NRT**, the author of the FlyerTalk thread *"Japan Luxury Ryokans – A Primer + Impressions"* (flyertalk.com), and the members who added their own reports over many years. Everything this kit says about a traditional inn traces back to somebody who stayed there and wrote it up. If you find an inn through this kit and go, the thread is the right place to post what you thought — that is how it stays useful.

Restaurant research draws on **Tabelog**, Japan's own review site. **Photographs belong to the inns and hotels themselves** and are served from the catalogue site, not redistributed here. The travel times were researched leg by leg from timetables and mapping data — figures somebody checked.

### License

- **Documents and data** — Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC BY-NC-SA 4.0). Use it, adapt it, share it; credit the sources above; don't sell it; pass on the same freedoms.
- **Code** — MIT.

### What this kit is not

- **Not official, and not affiliated** with any inn, hotel, railway, tourist board or with FlyerTalk.
- **Not a booking service.** It tells you what to book and roughly when the window opens. You book it.
- **Not a rating authority.** The scores are one reader's careful synthesis of first-hand traveller reports, discounted where the evidence is thin. A directional read of informed opinion.
- **Not current forever.** Prices move, inns renovate and close, rail services get cut, museums change their opening seasons. Opening hours, shuttle timetables and availability are the first things to go stale.
- **Deepest on winter, on traditional inns, and on the main island.** Thinner on the far north and the southern islands, on summer, and on travelling with children — good on all of them, but not equally.
- **Not a substitute for asking.** The place you book will answer a direct email about tattoos, children, dietary needs, a bed instead of a floor mattress, or how to get there from the station. Ask them.
