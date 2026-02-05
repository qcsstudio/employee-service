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
