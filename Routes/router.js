const routes = require("express").Router();

const auth = require("./auth");
const cafe = require("./cafe");
const menu = require("./menu");
const order = require("./order");

routes.get("/", async function (req, res) {
  //homepage route returns some HTML
  res.send(`<h1>Reached home!</h1> 
            <br>
            <a href='/auth'>Auth</a>`);
});

routes.use("/auth", auth);
routes.use("/cafe", cafe);
routes.use("/menu", menu);
routes.use("/order", order);

module.exports = routes;