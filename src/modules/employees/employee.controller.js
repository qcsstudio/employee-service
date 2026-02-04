const crypto = require("crypto");
const Employee = require("../employees/employee.model");
const Invite = require("../employee-invites/invite.model");
const {
  sendEmployeeInviteMail,
  sendEmployeeLoginMail
} = require("../../utils/mailer");

/**
 * CREATE EMPLOYEE
 */
exports.createEmployee = async (req, res) => {
  try {
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
      sendInvite,
      systemRole,
      method = "email",
      inviteMessage
    } = req.body;

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({
      companyId: req.companyId,
      workEmail
    });

    if (existingEmployee) {
      return res
        .status(400)
        .json({ message: "Employee already exists" });
    }

    // Determine employee status
    const status = createLogin ? "ACTIVE" : "PENDING_APPROVAL";

    // Create Employee
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
      status,
      systemRole
    });

    // === CREATE LOGIN ===
    if (createLogin) {
      const password = crypto.randomBytes(4).toString("hex"); // 8 hex chars

      // Example: call your auth service to create login (pseudo code)
      // const authUser = await authService.createUser(workEmail, password);
      // employee.authUserId = authUser.id;

      await employee.save();

      await sendEmployeeLoginMail({
        to: workEmail,
        companyName: req.companySlug,
        password
      });
    }

    // === SEND INVITE ===
    if (sendInvite) {
      const token = crypto.randomBytes(32).toString("hex");
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      await Invite.create({
        companyId: req.companyId,
        email: workEmail,
        token,
        otp,
        systemRole,
        method,
        inviteMessage,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
      });

      const inviteUrl = `https://${req.companySlug}.xyz.io/newemployee?token=${token}`;

      await sendEmployeeInviteMail({
        to: workEmail,
        companyName: req.companySlug,
        inviteUrl,
        otp,
        inviteMessage
      });
    }

    // ✅ Return success 200
    res.status(200).json({
      message: "Employee created successfully",
      employee
    });

  } catch (err) {
    console.error("Error creating employee:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};
