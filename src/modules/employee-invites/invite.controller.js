const crypto = require("crypto");
const Invite = require("./invite.model");
const Employee = require("../employees/employee.model");
const { sendEmployeeInviteMail } = require("../../utils/mailer");


exports.sendEmployeeInvite = async (req, res) => {
  const { email, fullName } = req.body;

  if (!email || !fullName) {
    return res.status(400).json({ message: "email & fullName required" });
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

  // ⏱ auto expiry (48 hours)
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  await Invite.create({
    companyId: req.companyId,
    companySlug: req.companySlug,
    email,
    fullName,
    role: "EMPLOYEE",
    token,
    otp,
    expiresAt
  });

  const inviteUrl = `https://${req.companySlug}.xyz.io/newemployee`;

  await sendEmployeeInviteMail({
    to: email,
    companyName: req.companySlug,
    inviteUrl,
    otp,
    fullName
  });

  res.json({ message: "Employee invite sent" });
};


exports.verifyInvite = async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: "OTP required" });
  }

  const invite = await Invite.findOne({
    otp,
    used: false,
    expiresAt: { $gt: new Date() }
  });

  if (!invite) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  res.json({
    inviteId: invite._id,
    email: invite.email,
    fullName: invite.fullName,
    companyId: invite.companyId,
    companySlug: invite.companySlug
  });
};
exports.completeEmployeeProfile = async (req, res) => {
  const {
    inviteId,
    fullName,
    dob,
    email,
    phone
  } = req.body;

  if (!inviteId || !fullName || !email) {
    return res.status(400).json({ message: "inviteId, fullName & email required" });
  }

  const invite = await Invite.findById(inviteId);
  if (!invite || invite.used) {
    return res.status(400).json({ message: "Invalid invite" });
  }

  // optional split (if needed later)
  const [firstName, ...rest] = fullName.trim().split(" ");
  const lastName = rest.join(" ");

  const employee = await Employee.create({
    companyId: invite.companyId,
    workEmail: email,
    phone,
    fullName,           // ✅ main source of truth
    firstName,          // optional
    lastName,           // optional
    dob,
    status: "PENDING_APPROVAL"
  });

  invite.used = true;
  await invite.save();

  console.log("🟡 Approval required for:", employee._id);

  res.json({
    message: "Profile submitted. Approval pending.",
    employeeId: employee._id,
    status: employee.status
  });
};
