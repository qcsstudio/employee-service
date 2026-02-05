const Employee = require("./employee.model");

exports.updatePersonal = async (req, res) => {
  await Employee.findOneAndUpdate(
    { _id: req.user.employeeId, companyId: req.user.companyId },
    { personal: req.body }
  );
  res.json({ message: "Personal info updated" });
};

exports.updateEducation = async (req, res) => {
  await Employee.findOneAndUpdate(
    { _id: req.user.employeeId, companyId: req.user.companyId },
    { education: req.body }
  );
  res.json({ message: "Education updated" });
};

exports.updateDocuments = async (req, res) => {
  await Employee.findOneAndUpdate(
    { _id: req.user.employeeId, companyId: req.user.companyId },
    { documents: req.body }
  );
  res.json({ message: "Documents updated" });
};

exports.updatePastExperience = async (req, res) => {
  await Employee.findOneAndUpdate(
    { _id: req.user.employeeId, companyId: req.user.companyId },
    { pastExperience: req.body }
  );
  res.json({ message: "Past experience updated" });
};
