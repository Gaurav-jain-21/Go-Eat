const express = require("express");

const dotenv = require("dotenv");

const cors = require("cors");

const connectDB = require("./config/db");

const orderRoutes = require("./routes/orderRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/order", orderRoutes);

app.get("/", (req, res) => {
  res.send("Order Service Running...");
});

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});
