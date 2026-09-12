# Getting the plan without burning your quota

Most people using this kit are on a $20-a-month plan with a message or usage limit, and a planning
run is long. The kit is laid out so a whole trip can be planned inside an ordinary allowance —
provided the assistant reads what it needs and nothing more. This page is how.

**The split layout exists for exactly this.** In any assistant that can open files, work from
`START-HERE.md` and the `stages/` files. The single `JAPAN-TRIP-KIT.md` holds the same material in
one ~22,000-word document; loading it costs roughly ten times what one stage costs, and loading both
is pure waste. Pick one: the folder if the assistant can read files, the single file if it cannot.

**One stage at a time.** `START-HERE.md` carries the instructions, the interview and a map of which
file belongs to which stage. Read the stage you are on, act on it, and only then open the next one.
Nothing in Stage 5 helps you run Stage 2.

**Only the cities on the plan.** Every inn is listed once, in the master table inside
`stages/4-where-to-stay.md`. The `stays/` files are short indexes on top of it — `stays/kyoto.md`,
`stays/hakone-izu-fuji.md` and so on — saying which slugs a traveller based there can reach and how
long it takes. A trip through three places needs three of them. Opening all eleven costs more than
the rest of the run put together.

**Never read a data file whole.** `catalog/catalog.json`, `catalog/catalog.md`,
`data/transit-legs.json`, `builder/route-data.js` and `guides/dining.md` (about 500 KB on its own)
are reference files, tens of thousands of words each, and no answer needs all of one. Search for the
single row you want — one inn, one pair of places, one city's section or one genre inside the dining
guide — or, if the assistant can browse, fetch one inn's page at
`https://ryokancatalog.com/inn/<slug>`, which is the same data in a page-sized piece.

**The two big files are also shipped in pieces, and in this layout you open the piece.**
**Never open `guides/dining.md` whole here** — `guides/dining/<city>.md` holds the identical text for
one city, and `guides/dining/index.md` says which cities exist and what each section covers. The same
goes for the catalogue: `catalog/by-region/<region>.md` is the slice of `catalog/catalog.md` for one
of the thirteen regions, with `catalog/by-region/index.md` as its map. Two cities and one region cost
a fraction of either whole file.

**`data/transit-legs.md` is a lookup table**, not a document: search it for the pair you want. Most
journeys are already answered by the corridor and airport tables inside `stages/5-route.md`.

**The drawing guides are read only if they draw.** `guides/visualizing-the-trip.md` (how to build the
page and the pre-flight checks), `guides/trip-visual-template.html` (the file you fill in — never
rewrite), `guides/design-principles.md` (the checklist to build against) and
`guides/design-language.md` (the type, colour and spacing rules in full) belong to Stage 6's fourth
option. Open the first two when someone asks for the page; the last two only when the template itself
has to change.

**Keep the run in one conversation.** Every new chat re-reads the kit from scratch. Instead, carry
the `Trip profile` and the itinerary table forward: they are short and complete, and an
assistant handed the plan block does not need the kit again. The one worthwhile exception is Stage 6
— eating, day ideas, the booking calendar — which is a fresh job: start a new chat, paste the
itinerary table into it, and leave the rest behind.

**In a plain chat window,** paste `JAPAN-TRIP-KIT.md` once, at the start, and never again. Re-pasting
it mid-conversation doubles the cost of everything that follows.

**Spend the good model where the decision is hard.** Orientation, day ideas and the booking calendar
run fine on a smaller, cheaper model. The stay decision — reading five options against one person's
taste — is where the strongest model you have is worth its cost.

**Don't ask for a summary of the whole kit.** It is the most expensive thing you can ask for and the
least useful: the kit is already the summary, and the plan is the output that matters.
