const Employee = require("./employee.model");
const crypto = require("crypto");
const { sendEmployeeLoginMail } = require("../../utils/mailer");
exports.approveEmployee = async (req, res) => {
  const { id } = req.params;

  const employee = await Employee.findOne({
    _id: id,
    companyId: req.companyId
  });

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  if (employee.status === "ACTIVE") {
    return res.status(400).json({ message: "Employee already approved" });
  }

  const password = crypto.randomBytes(4).toString("hex");

  employee.status = "ACTIVE";
  await employee.save();

  await sendEmployeeLoginMail({
    to: employee.workEmail,
    companyName: req.companySlug,
    password
  });

  res.json({
    message: "Employee approved",
    employeeId: employee._id
  });
};

exports.rejectEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findOne({
      _id: id,
      companyId: req.companyId
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (employee.status === "APPROVAL_REJECTED") {
      return res.status(400).json({ message: "Employee already rejected" });
    }

    if (employee.status === "ACTIVE") {
      return res.status(400).json({ message: "Active employee cannot be rejected" });
    }

    employee.status = "APPROVAL_REJECTED";
    await employee.save();

    return res.json({
      message: "Employee rejected successfully",
      employeeId: employee._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPendingEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({
      companyId: req.companyId,
      status: "PENDING_APPROVAL"
    })
      .select("fullName workEmail department designation createdAt")
      .sort({ createdAt: -1 });

    return res.json({
      count: employees.length,
      employees
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
