const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
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
    <div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
              style="background:#ffffff;border-radius:10px;overflow:hidden;
              box-shadow:0 8px 20px rgba(0,0,0,0.05);">

              <tr>
                <td style="background:#0575E6;padding:25px;text-align:center;color:#ffffff;">
                  <h2 style="margin:0;">Employee Invitation</h2>
                </td>
              </tr>

              <tr>
                <td style="padding:30px;color:#333333;">
                  <p>${inviteMessage}</p>

                  <div style="text-align:center;margin:25px 0;">
                    <a href="${inviteUrl}"
                      style="background:#0575E6;color:#ffffff;padding:12px 25px;
                      border-radius:5px;text-decoration:none;font-weight:bold;">
                      Verify OTP & Complete Registration
                    </a>
                  </div>

                  <div style="background:#f8fafc;padding:15px;border-radius:6px;">
                    <p style="margin:5px 0;"><strong>OTP:</strong> ${otp}</p>
                    <p style="margin:5px 0;">This OTP is valid for 48 hours.</p>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="background:#f1f5f9;padding:15px;text-align:center;
                  font-size:12px;color:#666;">
                  © ${new Date().getFullYear()} QCS HRMS. All rights reserved.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </div>
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

  const loginUrl = `https://${companySlug}.${process.env.BASE_DOMAIN}/login`;

  await getTransporter().sendMail({
    from: `"${companySlug}" <no-reply@xyz.io>`,
    to,
    subject: `Your Login Credentials`,
    html: `
    <div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
              style="background:#ffffff;border-radius:10px;overflow:hidden;
              box-shadow:0 8px 20px rgba(0,0,0,0.05);">

              <tr>
                <td style="background:#0575E6;padding:25px;text-align:center;color:#ffffff;">
                  <h2 style="margin:0;">Welcome to Your Workspace</h2>
                </td>
              </tr>

              <tr>
                <td style="padding:30px;color:#333333;">
                  <p>Your login credentials are provided below.</p>

                  <div style="background:#f8fafc;padding:15px;border-radius:6px;">
                    <p style="margin:5px 0;"><strong>Login URL:</strong></p>
                    <p style="margin:5px 0;">
                      <a href="${loginUrl}"
                        style="color:#0575E6;text-decoration:none;font-weight:bold;">
                        ${loginUrl}
                      </a>
                    </p>

                    <p style="margin:5px 0;"><strong>Email:</strong> ${to}</p>
                    <p style="margin:5px 0;"><strong>Password:</strong> ${password}</p>
                  </div>

                  <div style="text-align:center;margin:25px 0;">
                    <a href="${loginUrl}"
                      style="background:#0575E6;color:#ffffff;padding:12px 25px;
                      border-radius:5px;text-decoration:none;font-weight:bold;">
                      Login Now
                    </a>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="background:#f1f5f9;padding:15px;text-align:center;
                  font-size:12px;color:#666;">
                  © ${new Date().getFullYear()} QCS HRMS. All rights reserved.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </div>
    `
  });
};
