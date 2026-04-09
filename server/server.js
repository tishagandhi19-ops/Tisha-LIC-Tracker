require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const policyRoutes = require("./routes/policyRoutes");
const installmentRoutes = require("./routes/installmentRoutes");
const exportRoutes = require("./routes/exportRoutes");

const app = express();

app.use(express.json());
app.use(cors());

app.use(authRoutes);
app.use(userRoutes);
app.use(policyRoutes);
app.use(installmentRoutes);
app.use(exportRoutes);

const PORT = process.env.PORT || 5000;

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/finance_policies_db";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
  });