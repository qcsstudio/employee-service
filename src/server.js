require("./config/env");
const connectDB = require("./config/database");
const app = require("./app");

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`employee-service running on ${process.env.PORT}`);
  });
});
