const nodemailer = require("nodemailer");
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  },tls: {
    rejectUnauthorized: false
  }
})
 
const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: "tishagandhi1919@gmail.com",
    to,
    subject,
    html: text // ✅ CHANGE 'text' TO 'html'
  });
};

module.exports = sendEmail;