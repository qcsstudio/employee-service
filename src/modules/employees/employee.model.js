const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, required: true },

    // CORE
    fullName: String,
    workEmail: { type: String, required: true },
    phone: String,
    employeeId: String,

    // BASIC INFO (invite step)
    firstName: String,
    lastName: String,
    dob: Date,

    // STATUS
    status: {
      type: String,
      enum: ["PENDING_APPROVAL", "ACTIVE"],
      default: "PENDING_APPROVAL"
    },

    systemRole: {
      type: String,
      enum: ["EMPLOYEE", "HR", "TL"],
      default: "EMPLOYEE"
    },

    // 🔓 PROFILE (employee editable)
    personal: {
      about: {
        salutation: String,
        preferredName: String,
        aboutYourself: String
      },
      addresses: [String],
      contacts: [String],
      biodata: [String],
      importantDates: {
        birthDate: Date,
        partnerBirthDate: Date,
        marriageAnniversary: Date
      },
      dependents: [String]
    },

    education: {
      school: [String],
      underGraduation: [String],
      graduation: [String],
      postGraduation: [String],
      doctorate: [String]
    },

    documents: {
      identity: [String],
      other: [String]
    },

    // 🔒 ADMIN ONLY
    workProfile: {
      dateOfJoining: Date,
      employmentStage: String,
      employmentType: String,
      employmentGrade: String,
      selfService: Boolean,
      probationEndDate: Date,
      confirmationDate: Date,
      noticePeriodStart: Date,
      exitDate: Date,
      reportingOffice: String,
      currentExperience: String
    },

    pastExperience: [String],

    authUserId: mongoose.Schema.Types.ObjectId
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
