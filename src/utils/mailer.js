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
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  return transporter;
}

exports.sendEmployeeInviteMail = async ({
  to,
  companyName,
  inviteUrl,
  otp
}) => {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"${companyName}" <${process.env.SMTP_USER}>`,
    to,
    subject: `You're invited to join ${companyName}`,
    html: `
      <p>Hi,</p>

      <p>Welcome to <b>${companyName}</b>.</p>

      <p>
        Please add yourself as an employee by clicking here:<br/>
        <a href="${inviteUrl}">${inviteUrl}</a>
      </p>

      <p>
        <b>Company OTP:</b> ${otp}
      </p>

      <p>Best Regards,<br/>${companyName}</p>
    `
  });
};
