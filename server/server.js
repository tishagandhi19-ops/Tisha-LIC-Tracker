require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const https = require("https"); // ✅ for self-ping

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const policyRoutes = require("./routes/policyRoutes");
const installmentRoutes = require("./routes/installmentRoutes");
const exportRoutes = require("./routes/exportRoutes");

const app = express();

app.use(express.json());
app.use(cors());

// ✅ Health route (important for pinging)
app.get("/", (req, res) => {
  res.send("Server is alive 🚀");
});

// Routes
app.use(authRoutes);
app.use(userRoutes);
app.use(policyRoutes);
app.use(installmentRoutes);
app.use(exportRoutes);

const PORT = process.env.PORT || 5000;

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/finance_policies_db";

// ✅ Function to ping itself
const selfPing = () => {
  const url = "https://lic-tracker-vlp3.onrender.com";

  https
    .get(url, (res) => {
      console.log(`🔁 Self ping success: ${res.statusCode}`);
    })
    .on("error", (err) => {
      console.error("❌ Self ping failed:", err.message);
    });
};

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);

      // ✅ Run every 5 minutes
      setInterval(selfPing, 5 * 60 * 1000);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
  });