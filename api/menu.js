const app = require("../app");
const route = require("../Routes/menu");

app.use("/api/", route);

module.exports = app;