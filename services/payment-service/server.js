const express = require("express");

const dotenv = require("dotenv");

const cors = require("cors");

const connectDB = require("./config/db");

const paymentRoutes = require("./routes/paymentRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Payment Service Running...");
});

const PORT = process.env.PORT || 5007;

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});
