# Design principles for any trip visual

Agent-facing. These govern every page, card or comparison you build from a Trip plan. They were earned over many rounds of building and rejecting route consoles; each one exists because its absence shipped something bad. Apply them before you hand anything over, and check them against a screenshot, not the code.

## Content

1. **One signal per surface.** A card shows the single strongest rating for a stay, never two rating systems stacked.
2. **No unexplained marks.** Every glyph, colour or symbol either self-explains to a stranger or becomes a labelled chip or is deleted. Kanji are decoration on a labelled cell, never the only label.
3. **Subtract, don't accrete.** A new element must displace something. Ask "what did this addition replace?"
4. **One fact, one place.** A name, score or number renders exactly once per card. A new component replaces its predecessor, never joins it.
5. **Don't say what is visible.** No "city stay" under a city, no captions restating the photo. Show real information instead: the chosen stay, its price, its link.
6. **A comparison surface carries only what helps choose.** Booking windows, shuttle logistics and lead times belong in the booking pass, not the comparison. Park them in data; do not render them.
7. **Derived metrics that are arithmetic of each other collapse to one line.** Separate stays is always the number of stops; pack-ups is stays minus one. Bars whose numbers already say it become text.
8. **Numbers only where they are the story.** Nights, yes. Transit hours live in the metrics row, never in a headline. Headlines describe what a route is: places, stays, experiences.
9. **Describe things by what they are, never by negation.** "Room-only, so evenings belong to the town", not "no dinner". Negation is allowed only in a real trade-off ("bath or view, not both").
10. **No internal vocabulary and no process narration.** Nothing about rules, caps, audits, sources being "checked" or options being "cut". The page shows the current state of the plan; how it got there is not on the page.
11. **Conditional phrasing is banned in names and labels.** Booking difficulty is data (channel and lead time) tied to the calendar, never a clause in an option's name.
12. **Detail copy describes the thing itself**: the room, the food, the format, who cooks. Never a comparison to something off the page, never research provenance. Where little is known, stay short.
13. **Density goes to the data, not the prose.** Atmospheric scene-setting is filler and dies. An option earns its pixels with facts: what it is, rating, price, booking channel and lead, closed days, map link.
14. **Every place links out.** Google Maps at minimum for every stay and sight; Tabelog plus Maps for restaurants. Links are the real place, never a name search.
15. **Categories self-explain their membership.** If a reader would misfile it, the group is wrong.

## Form

16. **Nothing hover-only.** Anything a reader needs is visible text. No tooltips as the only carrier of a fact.
17. **Exactly three typefaces, each with one job**: a sans for prose, names and headings; a mono for data and labels (eyebrows, stats, strips, chips, captions, buttons); a Japanese mincho for CJK accent glyphs only, never roman text. Body prose is warm near-ink, about 1.55 line height.
18. **Colour is semantic or absent.** One accent. Route colour once per card. A tier ramp only on the tier badge. No decorative colour on weather, summaries or links, no gradients, no decorative icons.
19. **Numbers live where eyes are.** No right-justified stat clusters far from their labels.
20. **Affordances state their action.** "Details" with a caret, not an ellipsis; "compare", labelled; finger-sized hit areas. Occasional actions get a dropdown, not a wall of chips.
21. **Chrome earns its place.** Templates collapse into a drawer; a sidebar exists only for the map.
22. **Shared controls live in a shared fixed region.** Anything only some panes have (variant tabs) sits in the header so content below starts at the same height in every pane.
23. **Town-first when the town is the point.** Title the card by the town (Takayama), let the town lead, the inn follows with its name and rate on the meta line.
24. **Times display as "1 hr 35 min"**, five-minute rounding, never decimal hours. Estimated and unsourced legs are marked on the page, in text.
25. **One consistent frame for everything compared.** Two plans side by side use the identical layout, scale and metric set, in the same order.

## Process

26. **Every visual round ends with a full-page screenshot review against this list**, including expanded and interactive states, in light and dark.
27. **Check widths, element by element.** About 900, 1100 and 1300 px plus mobile. Page-level scroll width misses cells that spill into neighbours; check that no element's scroll width exceeds its own width. Grid tracks use minmax(0, 1fr), never bare 1fr.
28. **Verify the thing the reader opens**, not only the local file: the artifact URL or the shared file itself.
