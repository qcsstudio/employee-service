const crypto = require("crypto");
const Employee = require("../employees/employee.model");
const Invite = require("../employee-invites/invite.model");
const {
  sendEmployeeInviteMail,
  sendEmployeeLoginMail
} = require("../../utils/mailer");
const employeeService = require("./employee.service");
   const axios = require("axios");

/**
 * CREATE EMPLOYEE
 */
exports.createEmployee = async (req, res) => {
  console.log("CREATE EMPLOYEE BODY:", req.body); // Debug log

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
console.log(existingEmployee,"------")
    if (existingEmployee) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    // Determine employee status
    const status = createLogin ? "ACTIVE" : "PENDING_APPROVAL";

    // Create Employee (catch Mongoose validation errors)
    let employee;
    try {
      employee = await Employee.create({
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
    } catch (err) {
      if (err.name === "ValidationError") {
        console.error("Mongoose Validation Error:", err.errors);
        return res.status(400).json({ message: "Validation failed", errors: err.errors });
      }
      throw err; // rethrow if not validation error
    }

    // === CREATE LOGIN ===

if (createLogin) {
  const password = crypto.randomBytes(4).toString("hex");

  const response = await axios.post(
    "http://localhost:4000/users/internal-create",
    {
      name: fullName,
      email: workEmail,
      password,
      role: systemRole || "EMPLOYEE",   // ✅ FIXED
      companyId: req.companyId
    }
  );

  employee.authUserId = response.data.userId;
  await employee.save();

  await sendEmployeeLoginMail({
  to: workEmail,
  companySlug: req.companySlug,
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
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48h
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

    // ✅ Success
    return res.status(200).json({
      message: "Employee created successfully",
      employee
    });

  } catch (err) {
    console.error("CREATE EMPLOYEE SERVER ERROR:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};


exports.updatePersonal = async (req, res) => {
  const { id } = req.params;
  if(!id) return res.status(400).json({ message: "Employee ID is required" });
  const employee = await employeeService.updatePersonal(
    id,
    req.body
  );
  res.json(employee);
};

exports.updateWorkProfile = async (req, res) => {
  const { id } = req.params;
  if(!id) return res.status(400).json({ message: "Employee ID is required" });
  const employee = await employeeService.updateWorkProfile(
    id,
    req.body
  );
  res.json(employee);
};

exports.addEducation = async (req, res) => {
  const { id } = req.params;
  if(!id) return res.status(400).json({ message: "Employee ID is required" });
  const employee = await employeeService.addEducation(
    id,
    req.body
  );
  res.json(employee);
};

exports.addOrUpdateDocument = async (req, res) => {
  const { id } = req.params;
  if(!id) return res.status(400).json({ message: "Employee ID is required" });
  const employee = await employeeService.addOrUpdateDocument(
    id,
    req.body
  );
  res.json(employee);
};

exports.addPastExperience = async (req, res) => {
  const { id } = req.params;
  if(!id) return res.status(400).json({ message: "Employee ID is required" });
  const employee = await employeeService.addPastExperience(
    id,
    req.body
  );
  res.json(employee);
};