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
};//update nay chaltu jo mane email vadi kari aap thase ke var lagse? kevu email vadu ?? vat n ati thay apdi message jase aem ohk e wait jova de sambhad ae var lage avu hoy to pela biju kar daye? haa e var lage em j 6 mey koi var kariyu nahi pn tara ma karie chat gpt ni help thi baby ha to kae me clg hov tare kar deje ok naa ajej pn pachi pela nana nana kar daie ha jo me samjvu 6u jo aa zalak vadi main policy 6e ok? haa ohk to active policy vadu 6ene aema mane 2 vastu biju joye 6e are sambhad aa je 6 ne te jalak ni profile 6 jyare user create karti vakhate e and eni niche je nakhe e policy 6 and eni and eni andar installments ha to aa policy vada mane name ne relation avu joye 6e like zalk name nu profile 6ene to ana andar ana family ni badhani policy aay jay aevu ave e agru lai ne avi tu i mean me create kakrti vakhate ek add kari saku like jalak jode add kar dau to me eni profile ma joi saku jalak ni pn and bija jetla linked hoy wni right baby ???avu nay jo simple  aa policy 6ene  ama jem remainig maturity vadu 6ene avi rite j name ne relation 2 vastu andar ave aem to link karvani jarur nathi just mane 2 feild joye 6e ok?haa kbr padi i mean policy create karti vakhate tare 2 fileds jove ek to name ke kona mate ni 6  and biju ke su purpuse ke relation ship su 6 e right ??yes ae to easy 6ene? haa just 2 minit baby 