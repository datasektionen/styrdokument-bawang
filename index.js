var express = require("./express");
var config = require("./config");

var app = express();
require("./routes")(app);

app.listen(config.port);
console.log("Server running on port: " + config.port);
