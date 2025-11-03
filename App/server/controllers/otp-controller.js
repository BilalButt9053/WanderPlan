const nodemailer = require("nodemailer");
const EmailVerificationToken = require("../modals/EmailVerificationToken");

let OTP = "";
for (let i = 0; i < 6; i++) {
  const randomValue = Math.round(Math.random() * 9);
  OTP += randomValue;
}

const emailVerificationToken = new EmailVerificationToken({
    owner: userExist._id,
    token: OTP,
  });
  await emailVerificationToken.save();

  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "02c0b2df6efaeb",
      pass: "6e297ec4cd36c6",
    },
  });

  transport.sendMail({
    from: "Parkease@example.com",
    to: userExist.email,
    subject: "Email Verification",
    html: `<p>Your verification OTP</p>
           <h1>${OTP}</h1>`,
  });