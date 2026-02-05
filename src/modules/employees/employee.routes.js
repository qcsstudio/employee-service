const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const tenant = require("../../middlewares/tenant.middleware");

const employeeController = require("./employee.controller");
const profileController = require("./employee.profile.controller");
const approvalController = require("./ employee.approval.controller");

/**
 * ===============================
 * ADMIN – CREATE EMPLOYEE
 * ===============================
 */
router.post("/", auth, tenant, employeeController.createEmployee);

/**
 * ===============================
 * EMPLOYEE – SELF PROFILE (INVITE FLOW)
 * ===============================
 */
router.put("/profile/personal", tenant, profileController.updatePersonal);
router.put("/profile/education", auth, tenant, profileController.updateEducation);
router.put("/profile/documents", auth, tenant, profileController.updateDocuments);
router.put("/profile/past-experience", auth, tenant, profileController.updatePastExperience);

/**
 * ===============================
 * ADMIN – APPROVE EMPLOYEE
 * ===============================
 */
router.post("/approve/:id", auth, tenant, approvalController.approveEmployee);

module.exports = router;
