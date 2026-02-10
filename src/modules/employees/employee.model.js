const mongoose = require("mongoose");

/* ----------------------------- SUB SCHEMAS ----------------------------- */

const addressSchema = new mongoose.Schema(
  {
    addressType: String,
    line1: String,
    line2: String,
    country: String,
    state: String,
    city: String,
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    contactType: String,
    contactTag: String,
    details: String,
    country: String,
    state: String,
    city: String,
  },
  { _id: false }
);

const dependentSchema = new mongoose.Schema(
  {
    fullName: String,
    relationship: String,
    birthDate: Date,
    emergencyContactNumber: String,
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    educationType: String,
    instituteName: String,
    universityName: String,
    levelOfStudy: String,
    fieldOfStudy: String,
    activities: String,
    startDate: Date,
    endDate: Date,
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    type: String, // PAN, VOTER_ID, DRIVING_LICENSE, ESIC, PF
    documentNumber: String,
    nameOnDocument: String,
    fatherName: String,
    dateOfBirth: Date,
    issueDate: Date,
    expiryDate: Date,
    uanNumber: String,
    nomineeName: String,
    fileUrl: String,
  },
  { _id: false }
);

const bioDataSchema = new mongoose.Schema(
  {
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },

    genderPronoun: {
      type: String, // he/him, she/her, they/them, custom
    },

    challenged: {
      type: Boolean,
      default: false,
    },

    maritalStatus: {
      type: String,
      enum: ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"],
    },

    spouseOrPartnerName: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

/* ----------------------------- EMPLOYEE ----------------------------- */

const employeeSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    /* CORE */
    fullName: String,
    workEmail: {
      type: String,
      required: true,
    },
    phone: String,
    employeeId: String,

    /* BASIC INFO (invite step) */
    firstName: String,
    lastName: String,
    dob: Date,

    /* STATUS */
    status: {
      type: String,
      enum: ["PENDING_APPROVAL", "ACTIVE"],
      default: "PENDING_APPROVAL",
    },

    systemRole: {
      type: String,
      enum: ["EMPLOYEE", "HR", "TL"],
      default: "EMPLOYEE",
    },

    /* PROFILE (employee editable) */
    personal: {
      about: {
        salutation: String,
        preferredName: String,
        aboutYourself: String,
      },
      addresses: [addressSchema],
      contacts: [contactSchema],
      biodata: bioDataSchema,
      importantDates: {
        birthDate: Date,
        partnerBirthDate: Date,
        marriageAnniversary: Date,
      },
      dependents: [dependentSchema],
    },

    education: [educationSchema],
    documents: [documentSchema],

    /* ADMIN ONLY */
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
      currentExperience: String,
    },

    pastExperience: [
      {
        companyName: String,
        startDate: Date,
        endDate: Date,
        workRole: String,
      },
    ],

    authUserId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
