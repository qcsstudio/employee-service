const Employee = require("./employee.model");

exports.createEmployee = async (companyId, data) => {
  return await Employee.create({
    ...data,
    companyId
  });
};

exports.employeeDashboard = async (companyId, filters) => {
  const matchQuery = { companyId };

  // apply filters if present
  if (filters.department) {
    matchQuery.department = filters.department;
  }

  if (filters.designation) {
    matchQuery.designation = filters.designation;
  }

  if (filters.location) {
    matchQuery.location = filters.location;
  }

  if (filters.employeeType) {
    matchQuery.employeeType = filters.employeeType;
  }

  // summary
  const teamSize = await Employee.countDocuments({ companyId });

  // employee table data
  const employees = await Employee.find(matchQuery)
    .select(
      "fullName department designation employeeType joiningDate"
    )
    .sort({ joiningDate: -1 });

  // dropdown filters
  const departments = await Employee.distinct("department", {
    companyId
  });

  const designations = await Employee.distinct("designation", {
    companyId
  });

  const locations = await Employee.distinct("location", {
    companyId
  });

  const employeeTypes = await Employee.distinct("employeeType", {
    companyId
  });

  return {
    summary: {
      teamSize,
      presentToday: 0,
      pendingApproval: 0,
      onboardingTasks: 0
    },

    filters: {
      departments,
      designations,
      locations,
      employeeTypes
    },

    employees: employees.map(emp => ({
      id: emp._id,
      employee: emp.fullName,
      department: emp.department,
      role: emp.designation,
      status: emp.employeeType,
      joiningDate: emp.joiningDate
    }))
  };
};

