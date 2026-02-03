const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema(
  {
    companyId: mongoose.Schema.Types.ObjectId,
    email: String,
    token: String,
    otp: String,
    expiresAt: Date,
    used: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmployeeInvite", inviteSchema);
