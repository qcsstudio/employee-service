const service = require("./employee.service");

exports.createEmployee = async (req, res) => {
  try {
    const employee = await service.createEmployee(
      req.companyId,
      req.body
    );

    res.status(201).json({
      message: "employee created",
      employeeId: employee._id
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.employeeDashboard = async (req, res) => {
  try {
    const data = await service.employeeDashboard(
      req.companyId,
      req.query
    );

    res.json({
      message: "employee dashboard data",
      data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
