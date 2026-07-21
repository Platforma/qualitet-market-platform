const express = require("express");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const app = express();
const ROOT_DIR = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const ROOT_STATIC_FILES = new Set([
  "manifest.json",
  "service-worker.js"
]);
const SAFE_ROOT_FILE_PATTERN = /^[A-Za-z0-9._-]+$/;
const staticRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});
const ROOT_STATIC_PATHS = new Map(
  fs.readdirSync(PUBLIC_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => ROOT_STATIC_FILES.has(fileName) || path.extname(fileName) === ".html")
    .map((fileName) => [fileName, path.join(PUBLIC_DIR, fileName)])
);
const STATIC_ROUTE_ALIASES = new Map([
  ["generator", "generator-sklepu"]
]);

function sendRootStaticFile(req, res, next) {
  const requestPath = req.path === "/" ? "index.html" : (req.params.file || "");
  const requestPathBase = path.extname(requestPath) === ".html"
    ? requestPath.slice(0, -5)
    : requestPath;
  const normalizedPath = STATIC_ROUTE_ALIASES.get(requestPathBase) || requestPathBase;
  const fileName = normalizedPath && path.extname(normalizedPath) === ""
    ? `${normalizedPath}.html`
    : normalizedPath;
  if (!fileName || fileName.includes("..") || !SAFE_ROOT_FILE_PATTERN.test(fileName)) {
    return next();
  }

  const filePath = ROOT_STATIC_PATHS.get(fileName);
  if (!filePath) {
    return next();
  }

  return res.sendFile(filePath);
}

app.use(staticRateLimit, express.static(PUBLIC_DIR));
app.use("/public", staticRateLimit, express.static(PUBLIC_DIR));

app.get(["/owner-panel", "/owner-panel.html"], (_req, res) => {
  res.redirect(301, "/panel/owner-panel.html");
});

// Strona główna i pliki statyczne z głównego katalogu projektu
app.get("/", staticRateLimit, sendRootStaticFile);
app.get("/:file", staticRateLimit, sendRootStaticFile);

// Port dla Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
