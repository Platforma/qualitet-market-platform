const express = require("express");
const cors = require("cors");
const pool = require("./db/db");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Test API
app.use("/api/test-db", require("./api/test"));

app.get("/", (req, res) => {
  res.send("Backend działa!");
});

app.listen(PORT, () => {
  console.log(`Backend działa na porcie ${PORT}`);
});
