const User = require("../models/User");
const Policy = require("../models/Policy");
const Installment = require("../models/Installment");

const { assertUserOwnedByAdmin } = require("../utils/investmentUtils");

exports.createUser = async (req, res) => {

  try {

    const user = new User({
      ...req.body,
      adminId: req.admin.id
    });

    await user.save();

    res.status(201).json(user);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

exports.getUsers = async (req, res) => {

  try {

    const users = await User.find({
      adminId: req.admin.id
    });
    console.log(users);

    res.json(users);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

exports.getUser = async (req, res) => {

  try {

    const user = await assertUserOwnedByAdmin(
      req.params.id,
      req.admin.id
    );

    if (!user)
      return res.status(404).json({
        message: "User not found or unauthorized"
      });

    res.json(user);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

exports.updateUser = async (req, res) => {

  try {

    const user = await assertUserOwnedByAdmin(
      req.params.id,
      req.admin.id
    );

    if (!user)
      return res.status(404).json({ message: "Unauthorized" });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedUser);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

exports.deleteUser = async (req, res) => {

  try {

    const user = await assertUserOwnedByAdmin(
      req.params.id,
      req.admin.id
    );

    if (!user)
      return res.status(404).json({ message: "Unauthorized" });

    await Policy.deleteMany({ userId: req.params.id });

    await Installment.deleteMany({ userId: req.params.id });

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "User and all associated records deleted"
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};