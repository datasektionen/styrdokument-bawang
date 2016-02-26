const path = require("path");
const fs = require("fs");
const config = require("./config");

exports.find = function(req, subdomain) {
    // Concatenating the subdomains not to have to handle multiple ones.
    const requestPath = req.path;
    const topDir = path.resolve("./templates");
    
    var subPathToLookIn = "/templates/" + subdomain + requestPath;
    var pathToLookIn = path.resolve("." + subPathToLookIn);
    var pathFound;
    if (!(pathFound = fileExistsPath(pathToLookIn))) {
        pathToLookIn = path.dirname(pathToLookIn);
        pathToLookIn = path.resolve(pathToLookIn, config.defaultTemplate);
        while (!(pathFound = fileExistsPath(pathToLookIn))) {
            var directory = path.dirname(pathToLookIn);
            if (directory == topDir) {
                return undefined;
            }
            pathToLookIn = path.resolve(directory, "../" + config.defaultTemplate);
        }
    }
    return pathFound;
}

function fileExistsPath(fullPath) {
    for (var i in config.supportedEngines) {
        var engineDesc = config.supportedEngines[i];
        try {
            var fullPathWithExt = fullPath + "." + engineDesc.extension;
            //console.log("Looking for " + fullPathWithExt);
            fs.accessSync(fullPathWithExt);
            console.log("Found it!", fullPathWithExt);
            return fullPathWithExt;
        } catch (e) { 
            //console.log("did not find it!", fullPathWithExt);
        }
    }
    //console.log("Does not exist :(");
    return undefined;
}