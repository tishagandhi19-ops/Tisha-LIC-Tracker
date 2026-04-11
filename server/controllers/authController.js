const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {

  try {

    const { email, password } = req.body;

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      email,
      password: hashedPassword
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin registered successfully"
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin)
      return res.status(400).json({ message: "Admin not found" });

    const validPass = await bcrypt.compare(password, admin.password);

    if (!validPass)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET, // Ensure you are using your env variable
    );

    // 1. Convert mongoose document to a plain object
    const adminData = admin.toObject();
    
    // 2. Remove the password from the object
    delete adminData.password;

    // 3. Send the token AND the safe adminData
    res.json({
      token,
      admin: adminData 
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};