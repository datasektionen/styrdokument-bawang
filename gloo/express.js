const express = require("express");
const cons = require("consolidate");
const debug = require("debug")("gloo:express")
const config = require("./../config");


module.exports = function() {
    var app = express();
    app.set("views", "./" + config.templateDir);
    return app;
}

function registerSupportedEngines(app) {
    for (var engineName in config.supportedEngines) {
        var engineDesc = config.supportedEngines[engineName];
        app.engine(engineDesc.extension, cons[engineDesc.engine]);
        debug("registered view engine: " + engineDesc.extension);
    }
}
