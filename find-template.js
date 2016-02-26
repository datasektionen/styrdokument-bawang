const path = require("path");
const fs = require("fs");
const config = require("./config");

// Finds the template file that fits the request. We should at least always deliver the toplevel default file.
exports.find = function(req, subdomain) {
    var requestPath = req.path;
    var topDir = path.resolve("./templates");

    var pathToLookIn = path.resolve("./templates/" + subdomain + requestPath);
    var explicitTemplatePath = templatePath(pathToLookIn);
    if (explicitTemplatePath) {
        return explicitTemplatePath;
    } else {
        return defualtTemplateOf(pathToLookIn);
    }
}

function defualtTemplateOf(pathToLookIn) {
    pathToLookIn = path.dirname(pathToLookIn);
    pathToLookIn = path.resolve(pathToLookIn, config.defaultTemplate);
    var pathFound;
    while (!(pathFound = templatePath(pathToLookIn))) {
        var directory = path.dirname(pathToLookIn);
        if (directory == topDir) {
            return undefined;
        }
        pathToLookIn = path.resolve(directory, "../" + config.defaultTemplate);
    }
    return pathFound;
}

// Takes a full path to a file too look for, without the extension.
// Returns undefined if not found with any supported extension.
function templatePath(fullPath) {
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