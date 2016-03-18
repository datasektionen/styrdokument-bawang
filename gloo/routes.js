const https = require("https");
const http = require("http");
const debug = require("debug")("gloo:routes");
const template = require("./find-template");
const config = require("./../config");
const express = require("express");

module.exports = function(app) {
    //Sometime later we might want to do something with the favicon.ico.
    app.get("/favicon.ico", (req, res) => res.status(404).send());

    // Static assets will be available on the same path as their directory,
    // i.e. assets => /assets, static => /static
    app.use('/' + config.staticDir, express.static(config.staticDir));

    // All requests that are not static files should be resolved
    app.get("*", (req, res) => {
        
        var templatePath = template.find(req);
        
        if (templatePath)
            getTaitanData(req.path, function(taitanData) {
                if (taitanData)
                    res.render(templatePath, taitanData);
                else
                    res.render("_404." + config.extension);
            });
        else
            res.send("404: The page could not be found and this gloo instance contains no 404 template");

    });

};

function getTaitanData(path, callback) {
    var options = {
        host: config.taitanHost,
        path: path,
        method: "GET"
    };

    var requestCallback = function(res) {
        var collectedData = "";
        res.setEncoding("utf-8");

        res.on("data", (data) => collectedData += data);

        res.on("end", () => {
            if (collectedData) {
                try {
                    var responseObject = JSON.parse(collectedData);
                    callback(responseObject);
                } catch(e) {
                    debug("Taitan parsing error: " + e);
                }
            } else {
                callback(undefined);
            }
        });

        res.on("error", (err) => debug("Taitan connection error: " + err));
    };
    
    
    var request;
    if(config.https)
        request = https.request(options, requestCallback);
    else
        request = http.request(options, requestCallback);
    
    request.end();
}
