const express = require("express");
const cors = require("cors");

const app = express();

/* CORS */
app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "x-tenant"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));

/* VERY IMPORTANT — HANDLE PREFLIGHT */
app.options("*", cors());

app.use(express.json());

/* ROUTES */
app.use("/admin", require("./modules/admin/admin.routes"));
app.use("/employees", require("./modules/employees/employee.routes"));
app.use("/employee-invites", require("./modules/employee-invites/invite.routes"));

app.get("/", (req, res) => {
  res.json({ status: "Employee Service running 🚀" });
});

module.exports = app;