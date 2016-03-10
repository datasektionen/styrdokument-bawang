const http = require("https");
const debug = require("debug")("gloo:routes");
const template = require("./find-template");
const config = require("./config");

module.exports = function(app) {
    //Sometime later we might want to do something with the favicon.ico.
    app.get("/favicon.ico", function(req, res) {
        res.status(404).send();
    });

    app.get("*", function(req, res) {
        subdomain = getSubdomain(req);
        var templatePath = template.find(req, subdomain);
        if (templatePath) {
            getTaitanData(req.path, subdomain, function(taitanData) {
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

// Concatenates the subdomains so we don't have to handle multiple ones.
function getSubdomain(req) {
    if (req.subdomains && req.subdomains.length > 0) {
        // We do not have subdomains.
        // Template should be located in
        return req.subdomains.join();
    } else {
        return "www"; // Default if there is no subdomain.
    }
}

// does not handle subdomain differentiation.
function getTaitanData(path, subdomain, callback) {
    var options = {
        host: config.subdomainData[subdomain].taitanHost,
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

    var request = http.request(options, requestCallback);
    request.end();
}
