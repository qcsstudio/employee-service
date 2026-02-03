const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const tenant = require("../../middlewares/tenant.middleware");
const controller = require("./invite.controller");


router.post("/", auth, tenant, controller.sendEmployeeInvite);

router.post("/verify", controller.verifyInvite);
router.post("/complete", controller.completeEmployeeProfile);

module.exports = router;
