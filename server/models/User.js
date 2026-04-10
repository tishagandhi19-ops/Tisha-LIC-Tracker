const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  adminId: { type: String, required: true },
  firstName: { type: String, required: true },
  secondName: String,
  mobileNumber: String,
  nomineeName: { type: String, required: true },
  accountType: { type: String, enum: ["First Slot", "Second Slot"] },
  email:{ type: String, required: true},
  totalInvestmentAmount: { type: Number, default: 0 },
  leftInvestmentAmount: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);