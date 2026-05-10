const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Auth Service", port: 4001 });
});
app.use((err, req, res, next) => {
  if (err.type === "request.aborted") return;
  console.error(err.message);
  res.status(500).json({ message: err.message });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Auth DB connected");
    app.listen(process.env.PORT || 4001, () => {
      console.log(`Auth Service running on port ${process.env.PORT || 4001}`);
    });
  })
  .catch((err) => console.error("DB connection failed:", err.message));
