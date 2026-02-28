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
  inviteMessage,
  employeeName,
  invitedBy,
  expiryHours = 48
}) => {

  if (!inviteUrl) throw new Error("inviteUrl required");
  if (!process.env.BASE_DOMAIN) throw new Error("BASE_DOMAIN missing");

  await getTransporter().sendMail({

    from: `"${companyName} HRMS" <no-reply@${process.env.BASE_DOMAIN}>`,

    to,

    subject: `You're invited to join ${companyName}`,

    html: `
<div style="
margin:0;
padding:0;
background:#f4f6f9;
font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">

<tr>
<td align="center">

<table width="600"
style="
background:#ffffff;
border-radius:12px;
box-shadow:0 12px 30px rgba(0,0,0,0.08);
overflow:hidden;
">

<!-- HEADER -->

<tr>
<td style="
background:#0575E6;
padding:30px;
text-align:center;
color:#ffffff;
">

<h1 style="margin:0;font-size:22px;">
You're invited to join ${companyName}
</h1>

<p style="margin:8px 0 0;font-size:14px;opacity:0.9;">
Secure Employee Registration
</p>

</td>
</tr>

<!-- BODY -->

<tr>
<td style="padding:35px;color:#333;line-height:1.6;">

<p>
Hello ${employeeName || "there"},
</p>

<p>
${
  inviteMessage ||
  `You have been invited to join ${companyName}'s HRMS workspace. Please complete your registration to access your employee portal.`
}
</p>

${
  invitedBy
    ? `<p style="font-size:14px;color:#555;">
Invited by: <strong>${invitedBy}</strong>
</p>`
    : ""
}

<!-- CTA BUTTON -->

<div style="text-align:center;margin:30px 0;">

<a href="${inviteUrl}"
style="
background:#0575E6;
color:#ffffff;
padding:14px 30px;
border-radius:6px;
font-size:16px;
font-weight:600;
text-decoration:none;
display:inline-block;
">

Complete Your Registration

</a>

</div>

<!-- OTP BOX -->

<div style="
background:#f8fafc;
border:1px solid #E2E8F0;
border-radius:8px;
padding:20px;
text-align:center;
margin:25px 0;
">

<p style="margin:0;font-size:14px;color:#666;">
Your One-Time Verification Code
</p>

<p style="
margin:12px 0;
font-size:26px;
font-weight:bold;
letter-spacing:4px;
color:#0575E6;
">

${otp}

</p>

<p style="margin:0;font-size:13px;color:#777;">
Valid for ${expiryHours} hours
</p>

</div>

<!-- BACKUP LINK -->

<p style="font-size:13px;color:#666;">
If the button doesn't work, use the link below:
</p>

<p style="font-size:13px;word-break:break-all;">
<a href="${inviteUrl}" style="color:#0575E6;">
Click here to complete registration
</a>
</p>

<!-- SECURITY NOTICE -->

<div style="
margin-top:25px;
padding:15px;
background:#fff8e1;
border:1px solid #FFE082;
border-radius:6px;
">

<p style="margin:0;font-size:13px;color:#666;">
This invitation is secure and intended only for you. Please do not share this email or OTP.
</p>

</div>

</td>
</tr>

<!-- FOOTER -->

<tr>
<td style="
background:#f8fafc;
padding:20px;
text-align:center;
font-size:12px;
color:#888;
">

© ${new Date().getFullYear()} ${companyName} HRMS<br>
Secure Human Resource Management Platform

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
  companyName,
  password,
  employeeName
}) => {

  if (!companySlug) throw new Error("companySlug required");
  if (!process.env.BASE_DOMAIN) throw new Error("BASE_DOMAIN missing");

  const loginUrl = `https://${companySlug}.${process.env.BASE_DOMAIN}/login`;

  await getTransporter().sendMail({

    from: `"${companyName || companySlug} HRMS" <no-reply@${process.env.BASE_DOMAIN}>`,

    to,

    subject: `Your ${companyName || companySlug} workspace login details`,

    html: `
<div style="margin:0;padding:0;background:#f4f6f9;
font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">

<table width="600"
style="background:#ffffff;border-radius:12px;
box-shadow:0 10px 30px rgba(0,0,0,0.08);overflow:hidden;">

<!-- HEADER -->

<tr>
<td style="background:#0575E6;padding:30px;text-align:center;color:white;">

<h1 style="margin:0;font-size:22px;">
Welcome to ${companyName || companySlug}
</h1>

<p style="margin:8px 0 0;font-size:14px;opacity:0.9;">
Your workspace has been successfully created
</p>

</td>
</tr>

<!-- BODY -->

<tr>
<td style="padding:35px;color:#333;">

<p>
Hello ${employeeName || "there"},
</p>

<p>
Your employee account has been created. Below are your login credentials.
</p>

<!-- LOGIN BUTTON -->

<div style="text-align:center;margin:30px 0;">

<a href="${loginUrl}"
style="
background:#0575E6;
color:white;
padding:14px 30px;
border-radius:6px;
font-weight:600;
text-decoration:none;
display:inline-block;
">

Login to Your Workspace

</a>

</div>

<!-- CREDENTIAL BOX -->

<div style="
background:#f8fafc;
border:1px solid #E2E8F0;
border-radius:8px;
padding:20px;
">

<p style="margin:0 0 10px 0;">
<strong>Login URL:</strong>
</p>

<p style="margin:0 0 15px 0;">
<a href="${loginUrl}" style="color:#0575E6;">
Click here to login
</a>
</p>

<p style="margin:5px 0;">
<strong>Email:</strong><br>
${to}
</p>

<p style="margin:5px 0;">
<strong>Temporary Password:</strong><br>
<span style="
font-size:18px;
letter-spacing:2px;
color:#0575E6;
font-weight:bold;
">
${password}
</span>
</p>

</div>

<!-- SECURITY NOTICE -->

<div style="
margin-top:20px;
padding:15px;
background:#fff8e1;
border:1px solid #FFE082;
border-radius:6px;
">

<p style="margin:0;font-size:13px;color:#666;">
For security reasons, please change your password immediately after logging in.
</p>

</div>

<p style="margin-top:20px;font-size:13px;color:#666;">
If you did not expect this email, please contact your administrator.
</p>

</td>
</tr>

<!-- FOOTER -->

<tr>
<td style="
background:#f8fafc;
padding:20px;
text-align:center;
font-size:12px;
color:#888;
">

© ${new Date().getFullYear()} QCS HRMS<br>
Secure Employee Management System

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