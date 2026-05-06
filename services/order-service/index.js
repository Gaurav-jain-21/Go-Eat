const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Order DB connected"))
  .catch((err) => console.log(err));

app.listen(process.env.PORT || 4004, () =>
  console.log("Order service running on port 4004"),
);
