const express = require("express");

const dotenv = require("dotenv");

const cors = require("cors");

const connectDB = require("./config/db");

const locationRoutes = require("./routes/locationRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/location", locationRoutes);

app.get("/", (req, res) => {
  res.send("Location Service Running...");
});

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`Location Service running on port ${PORT}`);
});
