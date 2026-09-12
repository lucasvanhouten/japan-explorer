# Japan Trip Kit

**Two ways in — and the first is much better.** Give this kit to an assistant that can **read files**: it then loads one stage at a time, opens only the places on your trip, and looks things up instead of holding the whole document in its head. A plain chat window works, but it costs several times as much and the assistant has to carry everything at once.

- **An assistant that can read files** — Claude Code, Claude Cowork, Codex, ChatGPT with a workspace, or similar: open this folder. Assistants that auto-load an `AGENTS.md` or `CLAUDE.md` pick the kit up on their own; anything else just needs **"read START-HERE.md and help me plan a trip to Japan."** From there it reads one stage file at a time.
- **A plain chat window** — paste [JAPAN-TRIP-KIT.md](JAPAN-TRIP-KIT.md) into a new chat, or upload it, or give the assistant its web address. It is the same kit as one document. Then say: **"help me plan a trip to Japan with this kit."**

Either way, nothing to install and no need to read anything yourself first — it tells the assistant how to run the conversation, starting with a few questions about your trip.

## What this is

A planning kit for a first trip to Japan, written to be handed to an AI assistant. It carries the
interview questions, an orientation to Japan's regions and cities, an explanation of the different
kinds of places to stay, a shortlist of specific inns and hotels, real travel times between the main
cities, and the method for turning all of that into a route. Behind it sit years of forum research, a
scored catalogue of nearly 200 Japanese inns, and hundreds of individually sourced train and road
connections.

The goal is a concrete answer to the two questions that matter first: **where to go, and where to
sleep each night.** Everything else — where to eat, what to do each day, when to start booking — is
depth the kit offers once those are settled.

## Getting the plan without burning your quota

Most people run this on a $20-a-month plan, so the kit is laid out to be read a piece at a time. The
long version is [`guides/token-guide.md`](guides/token-guide.md); the short version:

- In an assistant that reads files, work from `START-HERE.md` and `stages/`, and **do not load `JAPAN-TRIP-KIT.md` as well** — it is the same kit in one ~22,000-word file.
- Read the file for the stage you are on, and nothing else.
- Open `stays/<place>.md` only for the places actually on the plan, never the whole folder.
- Never read `catalog/catalog.json`, `data/transit-legs.json`, `builder/route-data.js` or `guides/dining.md` (~500 KB) whole — search out the one row, city or genre you need, or fetch one inn at `https://ryokancatalog.com/inn/<slug>`.
- Open `guides/dining/<city>.md` and `catalog/by-region/<region>.md` instead of the whole guide or the whole catalogue: identical text, one city or one region at a time.
- Keep the run in one conversation and carry the `Trip profile` and the itinerary table forward instead of re-pasting the kit.
- Start a fresh chat for Stage 6 with only the itinerary table in it.
- In a plain chat window, paste the single file once and never again.
- A smaller, cheaper model is fine for orientation and day ideas; use the strongest one you have for the stay decision.
- Don't ask for a summary of the whole kit — the most expensive request here, and the least useful.

## What's in the folders

| File or folder | What's inside |
|---|---|
| `START-HERE.md` | The way in for a file-reading assistant: how to run the conversation, the first two stages, and the map of which file belongs to which stage. `AGENTS.md` and `CLAUDE.md` are identical copies, under the names assistants load automatically |
| `stages/` | One file per stage — orientation, where to go, where to stay, the route, optional depth, and the appendix |
| `stays/` | One short index per place: which inns you can reach from there and how long each takes, plus that place's hotels. The full row for every inn is the master table in `stages/4-where-to-stay.md` |
| `JAPAN-TRIP-KIT.md` | The same kit as one document, for chat windows that cannot open a folder |
| `guides/` | Reference documents: transit know-how, how to research a place to stay yourself, the token guide, and a guide to eating in Japan from one traveller's palate — `guides/dining.md` whole, and the same text one city at a time in `guides/dining/` |
| `guides/visualizing-the-trip.md` | How to draw the finished plan as a page: what it must show, and the checks before handing it over |
| `guides/trip-visual-template.html` | The page itself — fill in the plan block at the top and open it in a browser. The starting point for every trip page; not a file to rewrite |
| `guides/design-principles.md` | The checklist any page built from a plan has to pass |
| `guides/design-language.md` | The same rules in full: type, colour, spacing, and what is deliberately absent |
| `data/` | Machine-readable travel-time table and city-hotel list |
| `catalog/` | A snapshot of the inn catalogue — the same data the live site publishes, whole in `catalog.md` and cut by region in `catalog/by-region/` |
| `builder/` | An optional offline itinerary tool (see `builder/README.md`) |
| `examples/` | A worked sample plan, so you can see what the finished output looks like |

The folders below `stages/` and `stays/` are optional. The kit works without them; when one is
present the assistant uses it for extra depth, and when it isn't, it falls back to the live catalogue at
[ryokancatalog.com](https://ryokancatalog.com) or says what it doesn't know.

**To get everything at once:** use the green **Code** button above and choose **Download ZIP**.

## The builder (optional)

A small itinerary tool that runs entirely in a browser with no installation: download the ZIP, unzip
it, and double-click `builder/index.html`. Assemble a route stop by stop and watch travel time,
transfers, and lodging cost recalculate. Optional — see
`builder/README.md`.

## Credits

The inn research rests on the FlyerTalk thread *"Japan Luxury Ryokans – A Primer + Impressions"* and
above all on its author **KI-NRT**, whose first-hand reviews of scores of inns are the backbone of
the catalogue, along with the many members who added their own stays. Restaurant research leans on
**Tabelog**, Japan's dominant restaurant review site. Inn photographs belong to the properties
themselves and are served from **[ryokancatalog.com](https://ryokancatalog.com)**, the primary,
always-current version of the inn data.

## License

Documents and data: **CC BY-NC-SA 4.0** — share and adapt for non-commercial use, with credit, under
the same terms. Code (the builder's HTML and JavaScript): **MIT**. Full text in [LICENSE](LICENSE).

## What this is not

- **Not official.** Nothing here comes from a tourist board, a railway, or any property described.
  Travel times are sourced, but schedules and prices change — confirm anything a plan depends on.
- **Not a booking service.** The kit says what to book and roughly when, and links to the places
  that take reservations. It cannot make one for you.
- **Deepest on winter.** The research was done for a January trip, so cold-season detail — snow
  delay risk, which lines hold up, which inns shine under snow — is unusually thorough. Other
  seasons are covered honestly but less densely.
- **Opinionated about lodging.** The catalogue skews toward small, food-focused, design-minded inns.
  It does not list every place to stay in Japan.
