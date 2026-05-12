require("dotenv").config();

const express = require("express");

const cors = require("cors");

const connectDB = require("./config/db");

const notificationRoutes = require("./routes/notificationRoutes");

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/notification", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Notification Service Running...");
});

const PORT = process.env.PORT || 5008;

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
