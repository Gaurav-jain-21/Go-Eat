const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Auth DB connected"))
  .catch((err) => console.log(err));

app.listen(process.env.PORT || 4001, () =>
  console.log("Auth service running on port 4001"),
);
