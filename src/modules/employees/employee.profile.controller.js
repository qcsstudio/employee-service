const Employee = require("./employee.model");
const Invite = require("../employee-invites/invite.model");

/**
 * ===============================
 * PERSONAL DETAILS
 * ===============================
 */
exports.updatePersonal = async (req, res) => {
  try {
    // INVITE FLOW (no JWT)
    if (req.invite) {
      await Invite.findByIdAndUpdate(req.invite._id, {
        personal: req.body
      });

      return res.json({
        message: "Personal info saved (invite stage)"
      });
    }

    // AUTH FLOW (JWT)
    if (req.user) {
      await Employee.findOneAndUpdate(
        { _id: req.user.employeeId, companyId: req.user.companyId },
        { personal: req.body }
      );

      return res.json({
        message: "Personal info updated"
      });
    }

    return res.status(401).json({ message: "Invalid request context" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ===============================
 * EDUCATION
 * ===============================
 */
exports.updateEducation = async (req, res) => {
  try {
    if (req.invite) {
      await Invite.findByIdAndUpdate(req.invite._id, {
        education: req.body
      });

      return res.json({
        message: "Education saved (invite stage)"
      });
    }

    if (req.user) {
      await Employee.findOneAndUpdate(
        { _id: req.user.employeeId, companyId: req.user.companyId },
        { education: req.body }
      );

      return res.json({ message: "Education updated" });
    }

    return res.status(401).json({ message: "Invalid request context" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ===============================
 * DOCUMENTS
 * ===============================
 */
exports.updateDocuments = async (req, res) => {
  try {
    if (req.invite) {
      await Invite.findByIdAndUpdate(req.invite._id, {
        documents: req.body
      });

      return res.json({
        message: "Documents saved (invite stage)"
      });
    }

    if (req.user) {
      await Employee.findOneAndUpdate(
        { _id: req.user.employeeId, companyId: req.user.companyId },
        { documents: req.body }
      );

      return res.json({ message: "Documents updated" });
    }

    return res.status(401).json({ message: "Invalid request context" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ===============================
 * PAST EXPERIENCE
 * ===============================
 */
exports.updatePastExperience = async (req, res) => {
  try {
    if (req.invite) {
      await Invite.findByIdAndUpdate(req.invite._id, {
        pastExperience: req.body
      });

      return res.json({
        message: "Past experience saved (invite stage)"
      });
    }

    if (req.user) {
      await Employee.findOneAndUpdate(
        { _id: req.user.employeeId, companyId: req.user.companyId },
        { pastExperience: req.body }
      );

      return res.json({ message: "Past experience updated" });
    }

    return res.status(401).json({ message: "Invalid request context" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
