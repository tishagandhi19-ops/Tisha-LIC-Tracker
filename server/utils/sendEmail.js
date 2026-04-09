const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tishagandhi1919@gmail.com",
    pass: "lziagzxtodgbngic"
  },tls: {
    rejectUnauthorized: false
  }
});
 
const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: "tishagandhi1919@gmail.com",
    to,
    subject,
    html: text // ✅ CHANGE 'text' TO 'html'
  });
};

module.exports = sendEmail;