const express = require("express");
const cons = require("consolidate");
const debug = require("debug")("gloo:express")
const config = require("./../config");


module.exports = function() {
    var app = express();
    app.set("views", "./" + config.templateDir);
    app.engine(config.extension, cons[config.engine]);
    debug("registered view engine: " + config.engine);
    return app;
};