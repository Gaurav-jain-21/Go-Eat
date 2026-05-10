const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/user.routes");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.use("/api/users", userRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "User Service", port: 4008 });
});

app.use((err, req, res, next) => {
  if (err.type === "request.aborted") return;
  console.error(err.message);
  res.status(500).json({ message: err.message });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("User DB connected");
    app.listen(process.env.PORT || 4008, () =>
      console.log(`User Service running on port ${process.env.PORT || 4008}`),
    );
  })
  .catch((err) => console.error("DB error:", err.message));
