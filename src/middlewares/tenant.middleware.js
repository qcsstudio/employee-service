const axios = require("axios");

module.exports = async (req, res, next) => {
  try {
    const tenantHost =
      req.headers["x-tenant"] ||
      req.headers.origin ||
      req.headers.referer;

    if (!tenantHost) {
      return res.status(400).json({ message: "Tenant header missing" });
    }

    const hostname = new URL(tenantHost).hostname;
    const cleanHost = hostname.replace("www.", "");

    const subdomain = cleanHost.split(".")[0];

    const response = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/companies/resolve/${subdomain}`
    );

    req.companyId = response.data.companyId;
    req.companySlug = subdomain;

    next();
  } catch (err) {
    return res.status(404).json({ message: "Invalid tenant" });
  }
};
