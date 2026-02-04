const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
}

exports.sendEmployeeInviteMail = async ({
  to,
  companyName,
  inviteUrl,
  otp,
  inviteMessage
}) => {
  await getTransporter().sendMail({
    from: `"${companyName}" <no-reply@xyz.io>`,
    to,
    subject: `Employee Invitation`,
    html: `
      <p>${inviteMessage || `You are invited to join <b>${companyName}</b>`}</p>
      <p><a href="${inviteUrl}">Complete Registration</a></p>
      <p>OTP: <b>${otp}</b></p>
    `
  });
};


/* Login Email */
exports.sendEmployeeLoginMail = async ({ to, companyName, password }) => {
  await getTransporter().sendMail({
    from: `"${companyName}" <no-reply@xyz.io>`,
    to,
    subject: `Your Login Credentials`,
    html: `
      <p>Welcome to ${companyName}</p>
      <p>Email: ${to}</p>
      <p>Password: <b>${password}</b></p>
    `
  });
};
