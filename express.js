const express = require("express");
const cons = require("consolidate");
const config = require("./config");


module.exports = function() {
    var app = express();

    for (var i in config.supportedEngines) {
        var engineDesc = config.supportedEngines[i];
        //console.log(engineDesc.extension, JSON.stringify(engineDesc.engine));
        app.engine(engineDesc.extension, cons[engineDesc.engine]);
    }
    app.set("views", "./templates");

    return app;
}