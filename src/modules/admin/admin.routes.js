const router = require("express").Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const controller = require("./admin.controller");
const tenantMiddleware = require("../../middlewares/tenant.middleware")

router.get("/company-dashboard",authMiddleware, tenantMiddleware, controller.getCompanyDashboardData);

module.exports = router;
