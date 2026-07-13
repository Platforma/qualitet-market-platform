const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/index.html"));
});

app.get("/api/products", (req, res) => {
  res.json([
    {
      id: 1,
      name: "Produkt testowy 1",
      price: 99.99,
      image: "https://via.placeholder.com/300x300?text=Produkt+1"
    },
    {
      id: 2,
      name: "Produkt testowy 2",
      price: 149.99,
      image: "https://via.placeholder.com/300x300?text=Produkt+2"
    }
  ]);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Serwer działa na porcie " + PORT);
});
