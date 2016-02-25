const http = require("https");
const template = require("./find-template");
const config = require("./config");

module.exports = function(app) {
    app.get("*", function(req, res) {
        templatePath = template.find(req);
        if (templatePath) {
            getTaitanData(req.path, function(taitanData) {
                res.render(templatePath, taitanData);
            })
        } else {
            res.send("404 not found.");
        }
    })
}

// does not handle subdomain differentiation.
function getTaitanData(path, callback) {
    var options = {
        host: config.taitanHost,
        path: path,
        method: "GET"
    }
    var request = http.request(options, function(res) {
        res.setEncoding("utf-8");
        var collectedData = "";
        res.on("data", function(data) {
            collectedData += data;
        });
        res.on("end", function() {
            if (collectedData) {
                try {
                    var responseObject = JSON.parse(collectedData);
                    callback(responseObject);
                } catch(e) {
                    console.log("Taitn parsing error:", e);
                }
            }
        });
        res.on("error", function(err) {
            console.log("Taitan error:", err);
        });
    });
    request.end();
}
