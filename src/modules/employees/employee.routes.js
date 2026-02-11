       const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const tenant = require("../../middlewares/tenant.middleware");

const employeeController = require("./employee.controller");
const profileController = require("./employee.profile.controller");
const approvalController = require("./ employee.approval.controller");
const inviteTenant = require("../../middlewares/inviteTenant.middleware");
const uploadToS3  = require("../../middlewares/s3Upload");

/**
 * ===============================
 * EMPLOYEE – SELF PROFILE (INVITE FLOW)
 * ===============================
 */
router.put("/:id/personal", employeeController.updatePersonal);
router.put("/:id/work-profile", employeeController.updateWorkProfile);
router.put("/:id/education", employeeController.addEducation);
router.put("/:id/document", uploadToS3("documents").single("file"), employeeController.addOrUpdateDocument);
router.put("/:id/past-experience", employeeController.addPastExperience);

/**
 * ===============================
 * ADMIN – CREATE EMPLOYEE
 * ===============================
*/
router.post("/", auth, tenant, employeeController.createEmployee);

/**
 * ===============================
 * ADMIN – APPROVE EMPLOYEE
 * ===============================
 */
router.post("/approve/:id", auth, tenant, approvalController.approveEmployee);
router.post(
  "/reject/:id",
  auth,
  tenant,
  approvalController.rejectEmployee
);

router.get(
  "/pending",
  auth,
  tenant,
  approvalController.getPendingEmployees
);


module.exports = router;
