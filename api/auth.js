const app = require("../app");
const route = require("../Routes/auth");

app.use("/api/", route);

module.exports = app;