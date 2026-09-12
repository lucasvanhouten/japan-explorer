/* Minimal static file server for previewing the route builder. Serves this
 * directory (planning/) on the given port. Usage: node planning/serve.js [port] */
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const PORT = parseInt(process.argv[2] || process.env.PORT || "8778", 10);
const TYPES = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".md": "text/markdown" };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  // "/" → index.html where one exists (the kit build ships the builder as index.html), else the
  // repo's own filename.
  if (p === "/") p = fs.existsSync(path.join(ROOT, "index.html")) ? "/index.html" : "/route-builder.html";
  const file = path.join(ROOT, path.normalize(p).replace(/^(\.\.[/\\])+/, ""));
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("Not found: " + p); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(PORT, () => console.log("serving " + ROOT + " on http://localhost:" + PORT));
