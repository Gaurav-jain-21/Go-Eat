const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const locationRoutes = require("./routes/location.routes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/location", locationRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Location DB connected"))
  .catch((err) => console.log(err));

app.listen(process.env.PORT || 4003, () =>
  console.log("Location service running on port 4003"),
);
