const Employee = require("./employee.model");
const mongoose = require("mongoose");

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

// PERSONAL UPDATE
exports.updatePersonal = async (employeeId, data) => {
  return await Employee.findByIdAndUpdate(
    employeeId,
    { $set: { personal: data } },
    { new: true }
  );
};

// WORK PROFILE UPDATE
exports.updateWorkProfile = async (employeeId, data) => {
  return await Employee.findByIdAndUpdate(
    employeeId,
    { $set: { workProfile: data } },
    { new: true }
  );
};

// ADD EDUCATION
exports.addEducation = async (employeeId, data) => {
  return await Employee.findByIdAndUpdate(
    employeeId,
    { $push: { education: data } },
    { new: true }
  );
};

// ADD DOCUMENT (Dynamic by Type)
exports.addOrUpdateDocument = async (employeeId, data) => {
  const employee = await Employee.findById(employeeId);

  const existingIndex = employee.documents.findIndex(
    d => d.type === data.type
  );

  if (existingIndex > -1) {
    employee.documents[existingIndex] = data;
  } else {
    employee.documents.push(data);
  }

  await employee.save();
  return employee;
};

// ADD EXPERIENCE
exports.addPastExperience = async (employeeId, data) => {
  return await Employee.findByIdAndUpdate(
    employeeId,
    { $push: { pastExperience: data } },
    { new: true }
  );
};

exports.getDashboardStats = async ({
  companyId,
  userId,
  role
}) => {

  if (!["HR", "TL"].includes(role)) {
    throw new Error("Unauthorized access");
  }

  const companyObjectId = new mongoose.Types.ObjectId(companyId);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);

  const todayEnd = new Date();
  todayEnd.setHours(23,59,59,999);

  /* ---------------- GET TL TEAM EMPLOYEES ---------------- */

  let employeeMatch = {
    companyId: companyObjectId
  };

  if (role === "TL") {

    const team = await mongoose
      .connection
      .collection("teams")
      .findOne({
        "teamLead.employeeid": userObjectId
      });

    const teamEmployeeIds =
      team?.assignedEmployeeList?.map(
        emp => new mongoose.Types.ObjectId(emp.employeeId)
      ) || [];

    employeeMatch._id = {
      $in: teamEmployeeIds
    };

  }

  /* ---------------- DASHBOARD AGGREGATION ---------------- */

  const result = await mongoose
    .connection
    .collection("employees")
    .aggregate([

      {
        $match: employeeMatch
      },

      {
        $facet: {

          /* TEAM SIZE */

          teamSize: [
            {
              $count: "count"
            }
          ],

          /* PENDING APPROVAL */

          pendingApprovals: [
            {
              $match: {
                status: "PENDING_APPROVAL"
              }
            },
            {
              $count: "count"
            }
          ],

          /* PRESENT TODAY */

          presentToday: [

            {
              $lookup: {

                from: "attendances",

                let: {
                  empId: "$_id"
                },

                pipeline: [

                  {
                    $match: {

                      companyId: companyObjectId,

                      date: {
                        $gte: todayStart,
                        $lte: todayEnd
                      },

                      status: {
                        $in: ["PRESENT", "LATE"]
                      },

                      $expr: {
                        $eq: ["$employeeId", "$$empId"]
                      }

                    }
                  }

                ],

                as: "attendance"

              }
            },

            {
              $match: {
                attendance: { $ne: [] }
              }
            },

            {
              $count: "count"
            }

          ],

          /* EMPLOYEE LIST */

          employees: [

            {
              $lookup: {

                from: "attendances",

                let: {
                  empId: "$_id"
                },

                pipeline: [

                  {
                    $match: {

                      date: {
                        $gte: todayStart,
                        $lte: todayEnd
                      },

                      $expr: {
                        $eq: ["$employeeId", "$$empId"]
                      }

                    }
                  }

                ],

                as: "todayAttendance"

              }

            },

            {
              $addFields: {

                attendanceStatus: {

                  $cond: [

                    {
                      $eq: [
                        { $size: "$todayAttendance" },
                        0
                      ]
                    },

                    "NOT_MARKED",

                    {
                      $arrayElemAt: [
                        "$todayAttendance.status",
                        0
                      ]
                    }

                  ]

                }

              }

            },

            {
              $project: {

                fullName: 1,
                workEmail: 1,
                systemRole: 1,
                status: 1,

                dateOfJoining:
                  "$workProfile.dateOfJoining",

                attendanceStatus: 1

              }
            }

          ]

        }

      },

      {

        $project: {

          teamSize:
            {
              $ifNull: [
                { $arrayElemAt: ["$teamSize.count", 0] },
                0
              ]
            },

          pendingApprovals:
            {
              $ifNull: [
                { $arrayElemAt: ["$pendingApprovals.count", 0] },
                0
              ]
            },

          presentToday:
            {
              $ifNull: [
                { $arrayElemAt: ["$presentToday.count", 0] },
                0
              ]
            },

          employees: 1

        }

      }

    ])
    .toArray();

  return result[0] || {
    teamSize: 0,
    presentToday: 0,
    pendingApprovals: 0,
    employees: []
  };

};

exports.getAllEmployees = async ({ companyId, userId, role }) => {

  const companyObjectId = new mongoose.Types.ObjectId(companyId);
  
  if(role !== "HR"){
    throw new Error("Unauthorized");
  }

  const employees = await Employee.find({
    companyId: companyObjectId
  }).select("fullName _id").lean();

  return employees;
}
