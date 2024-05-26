const express = require("express");
const cons = require("consolidate");
const config = require("./../config");


module.exports = function() {
    var app = express();
    app.set("views", "./" + config.templateDir);
    app.engine(config.extension, cons[config.engine]);
    return app;
};
