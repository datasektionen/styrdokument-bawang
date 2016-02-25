const template = require("./find-template");

module.exports = function(app) {
    app.get("/", function(req, res) {
        res.send("Hello world");
    });

    app.get("*", function(req, res) {
        console.log("Recieved reqest for: " + req.path);
        templatePath = template.find(req);
        console.log(templatePath);
        if (templatePath) {
            // Hämta data från tiatan, har har vi lite dummydata för stunden.
            taitanData = {
                body: "<h1>Hello world!</h1><h1>Hello world!</h1><h1>Hello world!</h1>",
                sidebar: "<h1>Sidebar world</h1>",
                anchors: ["hej", "världen"]
            }

            res.render(templatePath, taitanData);
        } else {
            res.send("404 not found.");
        }
    })
}