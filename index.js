var express = require("./gloo/express");
var config = require("./config");
var app = express();

require("./gloo/routes")(app);
app.listen(config.port);

console.log("Server running on port: " + config.port);
