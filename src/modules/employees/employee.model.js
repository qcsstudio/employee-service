const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    fullName: String,
    workEmail: String,
    phone: String,
    employeeCode: String,

    department: String,
    designation: String,
    reportingManager: String,
    location: String,

    joiningDate: Date,
    employeeType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "CONTRACT"]
    },

    shift: String,
    probationEndDate: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
