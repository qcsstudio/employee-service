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

    employeeType: String,
    shift: String,
    probation: Boolean,

    status: {
      type: String,
      enum: ["ACTIVE", "PENDING_APPROVAL"],
      default: "ACTIVE"
    },

    authUserId: { type: mongoose.Schema.Types.ObjectId }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
