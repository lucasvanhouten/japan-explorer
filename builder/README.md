# The itinerary builder

An optional tool. It runs in a browser, needs no installation, and does one thing: lets you assemble
a trip stop by stop and see the consequences immediately — total travel time, train changes, nights
per stop, and the lodging cost of the choices you've made.

## How to open it

Download the ZIP of this repository (the green **Code** button → **Download ZIP**), unzip it, and
double-click `builder/index.html`. It opens in your browser and works with no internet connection
except for photographs.

**If the page loads empty or broken,** your browser is blocking scripts in files opened directly from
disk, as some versions of Chrome and Edge do. Either open the same file in Safari or Firefox, which
don't block it, or — if you have Node.js installed — run `node serve.js` from inside the `builder`
folder and visit `http://localhost:8778`.

## The three starting routes

Three ready-made routes you can load and then change freely — they are starting points, not the kit's
menu (that is the nine spines in `guides/route-explorer.html` and Stage 3):

- **The Golden Route** — Tokyo and Kyoto with an Inland Sea stop for Hiroshima and Miyajima: the
  standard first-timer shape, on the bullet train.
- **Golden Route + one onsen stop** — the same two cities with a hot-spring inn in Hakone between
  them, so the trip has a slow middle. Swap the inn from the alternates.
- **The Kanazawa loop** — Tokyo out to Kanazawa on the Sea of Japan coast, over the mountains to
  Takayama, then down to Kyoto: for a second trip, or a first one that wants fewer crowds.

A loaded route is only a starting point. Add or remove stops, drag them into a new order, change the
nights, and swap the inn at any stop from that region's comparison grid. Travel times come from a
table of individually sourced connections, so reordering recalculates against real timetables. The
route explorer (`guides/route-explorer.html`) is the other way in: click a spine's decisions, read the
map and the timeline, and hand the stop string it prints to `builder/route.js plan` or to your
assistant.

## Two things to know

**Photographs load from the web.** Inn pictures are served from ryokancatalog.com, so showing them
needs a connection. Everything else — travel times, prices, inn details, the route logic — is built
into the files and works offline.

**Your itinerary is saved in your browser.** It persists between visits on the same computer and
browser, but it is not saved to a file or an account: it won't follow you to another machine, and
clearing your browser's site data erases it. Export to keep a copy — either plain text you can paste
anywhere, or a clean print layout you can save as a PDF. The share button packs the whole itinerary
into a long link, so opening that link on another device, or sending it to whoever you're travelling
with, shows the same plan.
