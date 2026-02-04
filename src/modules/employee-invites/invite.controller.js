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
    email: invite.email,
    role: invite.role,
    companySlug: invite.companySlug
  });
};



exports.completeEmployeeProfile = async (req, res) => {
  const { inviteId, firstName, lastName, dob } = req.body;

  if (!firstName || !lastName || !dob) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const invite = await Invite.findById(inviteId);

  if (!invite || invite.used) {
    return res.status(400).json({ message: "Invite invalid" });
  }

  const existingEmployee = await Employee.findOne({
    companyId: invite.companyId,
    workEmail: invite.email
  });

  if (existingEmployee) {
    return res.status(400).json({ message: "Employee already exists" });
  }

  await Employee.create({
    companyId: invite.companyId,
    fullName: `${firstName} ${lastName}`,
    workEmail: invite.email,
    joiningDate: new Date(),
    employeeType: "FULL_TIME"
  });

  invite.used = true;
  await invite.save();

  res.json({ message: "Employee added successfully" });
};
