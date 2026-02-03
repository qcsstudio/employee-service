const express = require("express");
const app = express();

app.use(express.json());

app.use("/employees", require("./modules/employees/employee.routes"));
app.use("/employee-invites", require("./modules/employee-invites/invite.routes"));

app.get("/", (req, res) => {
  res.json({ status: "Employee Service running 🚀" });
});

module.exports = app;
