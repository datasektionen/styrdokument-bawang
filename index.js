var express = require("./express");
var config = require("./config");

var app = express();
require("./routes")(app);

// We need to listen for requests from users
app.listen(config.port);
console.log("Server running on port: " + config.port);


// send the same request to taitan, get the data from that


// Decide what template file we want


// render with the taitan daata and the chosen template file


// return rendered HTML to user
