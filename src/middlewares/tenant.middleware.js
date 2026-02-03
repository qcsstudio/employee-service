module.exports = (req, res, next) => {
  // companyId already trusted from auth-service
  if (!req.user || !req.user.companyId) {
    return res.status(401).json({ message: "Invalid token" });
  }

  req.companyId = req.user.companyId;
  req.companySlug = req.user.slug || null; // optional

  next();
};
