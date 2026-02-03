const crypto = require("crypto");
const Employee = require("../employees/employee.model");
const Invite = require("../employee-invites/invite.model");
const {
  sendEmployeeInviteMail,
  sendEmployeeLoginMail
} = require("../../utils/mailer");

/**
 * ADMIN CREATES EMPLOYEE
 */
exports.createEmployee = async (req, res) => {
  const {
    fullName,
    workEmail,
    phone,
    employeeId,
    department,
    designation,
    reportingManager,
    locationBranch,
    joiningDate,
    employeeType,
    shift,
    probation,
    createLogin,
    sendInvite
  } = req.body;

  const employee = await Employee.create({
    companyId: req.companyId,
    fullName,
    workEmail,
    phone,
    employeeId,
    department,
    designation,
    reportingManager,
    locationBranch,
    joiningDate,
    employeeType,
    shift,
    probation,
    status: createLogin ? "ACTIVE" : "PENDING_APPROVAL"
  });

  /* CREATE LOGIN */
  if (createLogin) {
    const password = crypto.randomBytes(4).toString("hex");

    // 🔥 call auth-service here (pseudo)
    // const authUser = await authService.createUser(...)

    // employee.authUserId = authUser.id;
    await employee.save();

    await sendEmployeeLoginMail({
      to: workEmail,
      companyName: req.companySlug,
      password
    });
  }

  /* SEND INVITE */
  if (sendInvite) {
    const token = crypto.randomBytes(32).toString("hex");
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await Invite.create({
      companyId: req.companyId,
      email: workEmail,
      token,
      otp,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
    });

    const inviteUrl = `https://${req.companySlug}.xyz.io/newemployee?token=${token}`;

    await sendEmployeeInviteMail({
      to: workEmail,
      companyName: req.companySlug,
      inviteUrl,
      otp
    });
  }

  res.json({ message: "Employee created successfully" });
};
