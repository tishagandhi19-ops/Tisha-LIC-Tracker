const mongoose = require("mongoose");

const installmentSchema = new mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  policyId: { type: mongoose.Schema.Types.ObjectId, ref: "Policy" },

  month: String,

  year: Number,

  amount: { type: Number, default: 0 },

  paid: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model("Installment", installmentSchema);