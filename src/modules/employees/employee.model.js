const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, required: true },

    fullName: String,
    workEmail: { type: String, required: true },
    phone: String,
    employeeId: String,

    department: String,
    designation: String, // EMPLOYEE | HR | TL | MANAGER
    reportingManager: String,

    locationBranch: String,
    joiningDate: Date,

    employeeType: String, // FULL_TIME, PART_TIME, etc
    shift: String,
    probation: Boolean,
systemRole: {
  type: String,
  enum: ["EMPLOYEE", "HR", "TL"],
  default: "EMPLOYEE"
},
    status: {
      type: String,
      enum: ["ACTIVE", "PENDING_APPROVAL"],
      default: "PENDING_APPROVAL"
    },

    authUserId: { type: mongoose.Schema.Types.ObjectId }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
