var express = require("express");
var engines = require("consolidate");

module.exports = function() {
   var app = express();

   app.engine("jade", engines.jade);
   app.engine("handlebars", engines.handlebars);



   return app;
}