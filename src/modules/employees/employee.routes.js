const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const tenant = require("../../middlewares/tenant.middleware");
const controller = require("./employee.controller");

router.post("/", auth, tenant, controller.createEmployee);


module.exports = router;
