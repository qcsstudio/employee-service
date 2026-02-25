const Employee = require("./employee.model");
const crypto = require("crypto");
const { sendEmployeeLoginMail } = require("../../utils/mailer");
const mongoose = require("mongoose")
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



exports.companyEmployeeDashboard = async (req, res) => {
  try {

    if (!req.user?.companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId missing in token"
      });
    }
    // console.log(req.user,"ffff")
    const companyId  = new mongoose.Types.ObjectId(req.user?.companyId)
    // const companyId = new mongoose.Types.ObjectId(req.query.companyId);

    const result = await Employee.aggregate([
      {
        $match: { companyId: companyId }
      },

      { $limit: 1 },

      {
        $facet: {

          /* ================= TOTAL EMPLOYEES ================= */
          totalEmployees: [
            {
              $lookup: {
                from: "employees",
                pipeline: [
                  { $match: { companyId: companyId } },
                  { $count: "count" }
                ],
                as: "empCount"
              }
            },
            {
              $project: {
                count: {
                  $ifNull: [
                    { $arrayElemAt: ["$empCount.count", 0] },
                    0
                  ]
                }
              }
            }
          ],

          /* ================= PENDING LEAVE COUNT ================= */
          pendingLeaveCount: [
            {
              $lookup: {
                from: "leaves",
                pipeline: [
                  {
                    $match: {
                      companyId: companyId,
                      $or: [
                        { "approvals.tl.status": "PENDING" },
                        { "approvals.hr.status": "PENDING" }
                      ]
                    }
                  },
                  { $count: "count" }
                ],
                as: "leaveCount"
              }
            },
            {
              $project: {
                count: {
                  $ifNull: [
                    { $arrayElemAt: ["$leaveCount.count", 0] },
                    0
                  ]
                }
              }
            }
          ],

          /* ================= PENDING LEAVE LIST ================= */
          leaveRequests: [
            {
              $lookup: {
                from: "leaves",
                pipeline: [
                  {
                    $match: {
                      companyId: companyId,
                      $or: [
                        { "approvals.tl.status": "PENDING" },
                        { "approvals.hr.status": "PENDING" }
                      ]
                    }
                  },
                  { $sort: { createdAt: -1 } },
                  {
                    $lookup: {
                      from: "employees",
                      localField: "employeeId",
                      foreignField: "_id",
                      as: "employee"
                    }
                  },
                  {
                    $unwind: {
                      path: "$employee",
                      preserveNullAndEmptyArrays: true
                    }
                  },
                  { $limit: 5 }
                ],
                as: "leaveRequests"
              }
            },
            {
              $project: {
                leaveRequests: 1
              }
            }
          ],

          /* ================= UPCOMING EVENTS ================= */
          upcomingEvents: [
            {
              $lookup: {
                from: "events",
                pipeline: [
                  {
                    $match: {
                      companyId: companyId,
                      eventDate: { $gte: new Date() }
                    }
                  },
                  { $sort: { eventDate: 1 } },
                  { $limit: 5 }
                ],
                as: "upcomingEvents"
              }
            },
            {
              $project: {
                upcomingEvents: 1
              }
            }
          ]
        }
      },

      {
        $project: {
          totalEmployees: {
            $ifNull: [
              { $arrayElemAt: ["$totalEmployees.count", 0] },
              0
            ]
          },
          pendingLeaveCount: {
            $ifNull: [
              { $arrayElemAt: ["$pendingLeaveCount.count", 0] },
              0
            ]
          },
          leaveRequests: {
            $ifNull: [
              { $arrayElemAt: ["$leaveRequests.leaveRequests", 0] },
              []
            ]
          },
          upcomingEvents: {
            $ifNull: [
              { $arrayElemAt: ["$upcomingEvents.upcomingEvents", 0] },
              []
            ]
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: result[0] || {
        totalEmployees: 0,
        pendingLeaveCount: 0,
        leaveRequests: [],
        upcomingEvents: []
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Dashboard fetch failed",
      error: error.message
    });
  }
};