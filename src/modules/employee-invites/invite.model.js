const mongoose = require("mongoose");

const employeeInviteSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    companySlug: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    role: String,
    token: String,
    otp: String,
    expiresAt: Date,
    used: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmployeeInvite", employeeInviteSchema);
