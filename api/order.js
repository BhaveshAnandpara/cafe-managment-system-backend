const app = require("../app");
const route = require("../Routes/order");

app.use("/api/", route);

module.exports = app;