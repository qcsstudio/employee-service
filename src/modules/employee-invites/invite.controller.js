const crypto = require("crypto");
const Invite = require("./invite.model");
const Employee = require("../employees/employee.model");
const { sendEmployeeInviteMail } = require("../../utils/mailer");


exports.sendEmployeeInvite = async (req, res) => {
  const { email, role, linkExpiry } = req.body;

  if (!email || !linkExpiry) {
    return res.status(400).json({ message: "email & expiry required" });
  }

  const existingInvite = await Invite.findOne({
    email,
    companyId: req.companyId,
    used: false,
    expiresAt: { $gt: new Date() }
  });

  if (existingInvite) {
    return res.status(400).json({ message: "Employee already invited" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  await Invite.create({
    companyId: req.companyId,
    companySlug: req.companySlug,
    email,
    role,
    token,
    otp,
    expiresAt: new Date(linkExpiry)
  });
console.log("📩 EMPLOYEE INVITE SENT");
  console.log("➡ Email:", email);
  console.log("➡ OTP:", otp);
  console.log("➡ Token:", token);
  const inviteUrl = `https://${req.companySlug}.xyz.io/newemployee`;

  await sendEmployeeInviteMail({
    to: email,
    companyName: req.companySlug,
    inviteUrl,
    otp
  });

  res.json({ message: "Employee invite sent" });
};

exports.verifyInvite = async (req, res) => {
  const { email, otp } = req.body;

  const invite = await Invite.findOne({
    email,
    otp,
    used: false,
    expiresAt: { $gt: new Date() }
  });

  if (!invite) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  res.json({
    inviteId: invite._id,
    companyId: invite.companyId,
    companySlug: invite.companySlug
  });
};



exports.completeEmployeeProfile = async (req, res) => {
  const { inviteId, firstName, lastName, dob } = req.body;

  const invite = await Invite.findById(inviteId);
  if (!invite || invite.used) {
    return res.status(400).json({ message: "Invalid invite" });
  }

  const employee = await Employee.create({
    companyId: invite.companyId,
    workEmail: invite.email,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    dob,
    status: "PENDING_APPROVAL"
  });

  invite.used = true;
  await invite.save();

  // 🔔 notify admin (email / dashboard)
  console.log("🟡 Approval required for:", employee._id);

  res.json({
    message: "Basic info saved. Approval pending.",
    employeeId: employee._id,
    status: employee.status
  });
};
