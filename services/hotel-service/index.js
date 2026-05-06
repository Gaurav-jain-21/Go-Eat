const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const hotelRoutes = require("./routes/hotel.routes");
const foodRoutes = require("./routes/food.routes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/uploads", express.static("uploads"));

app.use("/api/hotels", hotelRoutes);
app.use("/api/foods", foodRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Hotel DB connected"))
  .catch((err) => console.log(err));

app.listen(process.env.PORT || 4002, () =>
  console.log("Hotel service running on port 4002"),
);
