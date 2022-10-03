const nodemailer = require("nodemailer");
const MyError = require("./error");

exports.createTransport = () => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: process.env.FROM,
      pass: process.env.PASSWORD
    }
  });
  return transporter;
};

exports.message = (receiver, subject, body) => {
  const message = {
    from: process.env.FROM,
    to: receiver,
    subject: subject,
    html: body
  };
  return message;
};

exports.sendEmail = (receiver, subject, body) => {
  const transporter = this.createTransport();
  const message = this.message(receiver, subject, body);
  transporter.sendMail(message, (err, result) => {
    if (err) {
      return res.status(500).json({
        status: "ERROR",
        message: err.message
      });
    } else {
      return res.status(200).json({
        status: "OK",
        message: "Mail sent successfully!"
      });
    }
  });
};