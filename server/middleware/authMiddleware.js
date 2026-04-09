const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_123";

module.exports = (req, res, next) => {

  const token = req.header("Authorization")?.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Access Denied: No Token Provided" });

  try {

    const verified = jwt.verify(token, JWT_SECRET);

    req.admin = verified;

    next();

  } catch (err) {

    res.status(400).json({ message: "Invalid Token" });

  }
};