const express = require("express");

const dotenv = require("dotenv");

const cors = require("cors");

const connectDB = require("./config/db");

const foodRoutes = require("./routes/foodRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/food", foodRoutes);

app.get("/", (req, res) => {
  res.send("Food Service Running...");
});

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
  console.log(`Food Service running on port ${PORT}`);
});
