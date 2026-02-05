const Invite = require("../modules/employee-invites/invite.model");

module.exports = async (req, res, next) => {
  try {
    const tenantHost = req.headers["x-tenant"];
    if (!tenantHost) {
      return res.status(400).json({ message: "x-tenant header required" });
    }

    const hostname = new URL(tenantHost).hostname;
    const slug = hostname.split(".")[0];

    const { inviteId } = req.body;
    if (!inviteId) {
      return res.status(400).json({ message: "inviteId required" });
    }

    const invite = await Invite.findById(inviteId);
    if (!invite || !invite.companyId) {
      return res.status(401).json({ message: "Invalid invite" });
    }

    req.companyId = invite.companyId;
    req.companySlug = slug;
    req.invite = invite;

    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid tenant header" });
  }
};
