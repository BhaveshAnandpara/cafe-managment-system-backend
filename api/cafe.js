const app = require("../app");
const route = require("../Routes/cafe");

app.use("/api/", route);

module.exports = app;