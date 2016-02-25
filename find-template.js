const path = require("path");
const fs = require("fs");
const config = require("./config");

exports.find = function(req) {
    // Concatenating the subdomains not to have to handle multiple ones.
    const subdomain = req.subdomains.join();
    const requestPath = req.path;

    const topDir = path.resolve("./templates");
    const subPathToLookIn = "/templates/" + subdomain + requestPath;
    var pathToLookIn = path.resolve("." + subPathToLookIn);
    var pathFound;
    if (!(pathFound = fileExistsPath(pathToLookIn))) {
        pathToLookIn = path.dirname(pathToLookIn);
        pathToLookIn = path.resolve(pathToLookIn, config.defaultTemplate);
        while (!(pathFound = fileExistsPath(pathToLookIn))) {
            const directory = path.dirname(pathToLookIn);
            if (directory == topDir) {
                return undefined;
            }
            pathToLookIn = path.resolve(pathToLookIn, "../" + config.defaultTemplate);
        }
    }
    return pathFound;
}

function fileExistsPath(fullPath) {
    for (var i in config.supportedEngines) {
        var engineDesc = config.supportedEngines[i];
        try {
            var fullPathWithExt = fullPath + "." + engineDesc.extension;
            console.log("Looking for " + fullPathWithExt);
            fs.accessSync(fullPathWithExt);
            console.log("Found it!");
            return fullPathWithExt;
        } catch (e) { }
    }
    console.log("Does not exist :(");
    return undefined;
}