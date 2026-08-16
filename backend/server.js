const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/sellers", require("./api/sellers"));
app.use("/api/breakdowns", require("./api/breakdowns"));
app.use("/api/parts", require("./api/parts"));
app.use("/api/facebook", require("./api/facebook"));
app.use("/api/shipping", require("./api/shipping"));
app.use("/api/payments", require("./api/payments"));
app.use("/api/test-db", require("./api/test")); // test DB endpoint

// Root endpoint
app.get("/", (req, res) => {
  res.send("Backend działa!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend działa na http://localhost:${PORT}`);
});
