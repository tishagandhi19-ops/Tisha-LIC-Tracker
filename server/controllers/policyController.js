const Policy = require("../models/Policy");
const Installment = require("../models/Installment");

const {
  recalcLeftInvestmentAmount,
  assertUserOwnedByAdmin
} = require("../utils/investmentUtils");

exports.createPolicy = async (req, res) => {

  try {

    const user = await assertUserOwnedByAdmin(
      req.body.userId,
      req.admin.id
    );

    if (!user)
      return res.status(404).json({
        message: "User not found or unauthorized"
      });

    const policy = new Policy(req.body);

    await policy.save();

    await recalcLeftInvestmentAmount(user._id);

    res.status(201).json(policy);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

exports.getUserPolicies = async (req, res) => {

  try {

    const user = await assertUserOwnedByAdmin(
      req.params.userId,
      req.admin.id
    );

    if (!user)
      return res.status(404).json({ message: "Unauthorized" });

    const policies = await Policy.find({
      userId: req.params.userId
    });

    res.json(policies);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

exports.getPolicy = async (req, res) => {

  try {

    const policy = await Policy.findById(req.params.id).populate("userId");

    if (!policy)
      return res.status(404).json({ message: "Policy not found" });

    if (policy.userId.adminId !== req.admin.id)
      return res.status(403).json({ message: "Unauthorized" });

    res.json(policy);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

exports.updatePolicy = async (req, res) => {

  try {

    const policy = await Policy.findById(req.params.id).populate("userId");

    if (!policy || policy.userId.adminId !== req.admin.id)
      return res.status(403).json({ message: "Unauthorized" });

    let updateData = { ...req.body };

    if (policy.installmentsGenerated) {

      delete updateData.policyOpendate;

      delete updateData.PolicyCloseDate;

    }

    const updatedPolicy = await Policy.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    await recalcLeftInvestmentAmount(
      policy.userId._id,
      policy._id
    );

    res.json(updatedPolicy);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

exports.deletePolicy = async (req, res) => {

  try {

    const policy = await Policy.findById(req.params.id).populate("userId");

    if (!policy || policy.userId.adminId !== req.admin.id)
      return res.status(403).json({ message: "Unauthorized" });

    await Installment.deleteMany({ policyId: req.params.id });

    await Policy.findByIdAndDelete(req.params.id);

    await recalcLeftInvestmentAmount(policy.userId._id);

    res.json({
      message: "Policy and associated installments deleted"
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};
// for check commit