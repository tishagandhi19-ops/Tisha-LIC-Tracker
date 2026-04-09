const User = require("../models/User");
const Policy = require("../models/Policy");
const Installment = require("../models/Installment");

async function recalcLeftInvestmentAmount(userId, policyId = null) {

  const user = await User.findById(userId);

  if (!user) return;

  if (policyId) {

    const policy = await Policy.findById(policyId);

    if (policy) {

      const paidAgg = await Installment.aggregate([
        { $match: { policyId: policy._id, paid: true } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);

      const paidTotal = paidAgg.length ? paidAgg[0].total : 0;

      policy.leftInvestmentAmount = Math.max(
        0,
        policy.totalInvestmentAmount - paidTotal
      );

      await policy.save();
    }
  }

  const allPolicies = await Policy.find({ userId: user._id });

  let totalInvestmentAllPolicies = 0;

  if (allPolicies.length > 0) {

    totalInvestmentAllPolicies = allPolicies.reduce(
      (sum, p) => sum + (p.totalInvestmentAmount || 0),
      0
    );

  } else {

    totalInvestmentAllPolicies = user.totalInvestmentAmount || 0;

  }

  const allPaidAgg = await Installment.aggregate([
    { $match: { userId: user._id, paid: true } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const allPaidTotal = allPaidAgg.length ? allPaidAgg[0].total : 0;

  user.totalInvestmentAmount = totalInvestmentAllPolicies;

  user.leftInvestmentAmount = Math.max(
    0,
    totalInvestmentAllPolicies - allPaidTotal
  );

  await user.save();

  return user.leftInvestmentAmount;
}

async function assertUserOwnedByAdmin(userId, adminId) {

  const user = await User.findById(userId);

  if (!user) return null;

  if (user.adminId !== adminId) return null;

  return user;
}

module.exports = {
  recalcLeftInvestmentAmount,
  assertUserOwnedByAdmin
};