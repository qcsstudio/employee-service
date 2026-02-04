const Company = require("../companies/company.model"); // or shared model

module.exports = async (req, res, next) => {
  try {
    if (!req.user || !req.user.companyId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const tenantHost = req.headers["x-tenant"];
    if (!tenantHost) {
      return res.status(400).json({ message: "x-tenant header required" });
    }

    const hostname = new URL(tenantHost).hostname;
    const slug = hostname.split(".")[0];

    req.companyId = req.user.companyId;
    req.companySlug = slug;

    next();
  } catch (err) {
    next(err);
  }
};
