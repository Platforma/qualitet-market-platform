const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const app = express();
const ROOT_DIR = path.join(__dirname, "..");
const STATIC_DIRS = ["assets", "css", "js"];
const ROOT_STATIC_FILES = new Set([
  ".nojekyll",
  "CNAME",
  "_redirects",
  "landing.css",
  "manifest.json",
  "panel.css",
  "service-worker.js",
  "shop.css",
  "shop.js",
  "stores.js",
  "styles.css"
]);
const staticRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false
});

function isAllowedRootFile(fileName) {
  if (!fileName || fileName.includes("/") || fileName.includes("\\")) {
    return false;
  }

  return ROOT_STATIC_FILES.has(fileName) || path.extname(fileName) === ".html";
}

function sendRootStaticFile(req, res, next) {
  const fileName = req.path === "/" ? "index.html" : req.params.file;
  if (!isAllowedRootFile(fileName)) {
    return next();
  }

  return res.sendFile(path.join(ROOT_DIR, fileName));
}

STATIC_DIRS.forEach((dirName) => {
  app.use(`/${dirName}`, express.static(path.join(ROOT_DIR, dirName)));
});

// Strona główna i pliki statyczne z głównego katalogu projektu
app.get("/", staticRateLimit, sendRootStaticFile);
app.get("/:file", staticRateLimit, sendRootStaticFile);

// Port dla Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
