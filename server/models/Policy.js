const mongoose = require("mongoose");

const policySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
   nameOfPolicyHolder: { type: String, required: true },
   relationWithAccountHolder : { type: String, required: true },
    

  monthlyAmount: { type: Number, required: true },

  totalInvestmentAmount: { type: Number, required: true },

  leftInvestmentAmount: { type: Number, required: true },

  maturityAmount: { type: Number, required: true },

  policyOpendate: { type: String, required: true },

  PolicyCloseDate: { type: String, required: true },

  installmentsGenerated: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model("Policy", policySchema);