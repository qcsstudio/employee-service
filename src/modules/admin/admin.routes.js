const router = require("express").Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const controller = require("./admin.controller");

router.get("/company-dashboard",authMiddleware, controller.getCompanyDashboardData);

module.exports = router;
