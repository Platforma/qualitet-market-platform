const express = require("express");
const path = require("path");
const app = express();

// Serwowanie statycznych plików z folderu frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Strona główna — index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Port dla Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
