module.exports = (req, res, next) => {
  try {
    // JWT already verified by auth middleware
    if (!req.user || !req.user.companyId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Tenant header is mandatory for company routes
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
    return res.status(400).json({ message: "Invalid tenant header" });
  }
};
