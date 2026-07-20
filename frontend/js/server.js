const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env.PORT || "3000", 10);
const API_BASE = "https://qualitet-market.com/api";

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/products", (_req, res) => {
  res.status(501).json({
    error: "Ten serwer nie udostępnia danych demo. Użyj produkcyjnego API.",
    api: API_BASE + "/products",
  });
});

app.listen(PORT, () => {
  console.log("Frontend helper API server listening on port " + PORT);
});
