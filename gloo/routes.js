const https = require("https");
const http = require("http");
const debug = require("debug")("gloo:routes");
const template = require("./find-template");
const config = require("./../config");

module.exports = function(app) {
    //Sometime later we might want to do something with the favicon.ico.
    app.get("/favicon.ico", function(req, res) {
        res.status(404).send();
    });

    app.get("*", function(req, res) {
        var templatePath = template.find(req);
        if (templatePath) {
            getTaitanData(req.path, function(taitanData) {
                if (taitanData) {
                    res.render(templatePath, taitanData);
                } else {
                    res.send("404 not found");
                }
            });
        } else {
            res.send("404 not found.");
        }
    });
}

// does not handle subdomain differentiation.
function getTaitanData(path, callback) {
    var options = {
        host: config.taitanHost,
        path: path,
        method: "GET"
    }

    var requestCallback = function(res) {
        var collectedData = "";
        res.setEncoding("utf-8");

        res.on("data", function(data) {
            collectedData += data;
        });

        res.on("end", function() {
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

        res.on("error", function(err) {
            debug("Taitan connection error: " + err);
        });
    };
    var request;
    if(config.https) {
        request = https.request(options, requestCallback);
    } else {
        request = http.request(options, requestCallback);
    }
    request.end();
}
