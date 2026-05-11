const express = require("express");

const dotenv = require("dotenv");

const cors = require("cors");

const connectDB = require("./config/db");

const hotelRoutes = require("./routes/hotelRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/hotel", hotelRoutes);

app.get("/", (req, res) => {
  res.send("Hotel Service Running...");
});

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`Hotel Service running on port ${PORT}`);
});
