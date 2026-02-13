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
      <p>${inviteMessage}</p>
      <p>
        <a href="${inviteUrl}" 
           style="padding:10px 16px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;">
           Verify OTP & Complete Registration
        </a>
      </p>
      <p>OTP: <b>${otp}</b></p>
      <p>This OTP is valid for 48 hours.</p>
    `
  });
};



exports.sendEmployeeLoginMail = async ({
  to,
  companySlug,
  password
}) => {

  if (!companySlug) {
    throw new Error("companySlug required for login URL");
  }

  const loginUrl =
    `https://${companySlug}.${process.env.BASE_DOMAIN}/login`;

  await getTransporter().sendMail({
    from: `"${companySlug}" <no-reply@xyz.io>`,
    to,
    subject: `Your Login Credentials`,
    html: `
      <h3>Welcome</h3>

      <p>
        <b>Login URL:</b><br/>
        <a href="${loginUrl}">${loginUrl}</a>
      </p>

      <p><b>Email:</b> ${to}</p>
      <p><b>Password:</b> ${password}</p>

      <p>Please login and change password immediately.</p>
    `
  });
};

