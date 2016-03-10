const path = require("path");
const fs = require("fs");
const debug = require("debug")("gloo:find-template");
const config = require("./config");

// Finds the template file that fits the request.
//We should at least always deliver the toplevel default file.
exports.find = function(req, subdomain) {
    var requestPath = req.path;
    var site = subdomain + requestPath;
    var pathToLookIn = path.resolve("./templates/" + site);
    var explicitTemplatePath = templatePath(pathToLookIn, site);
    var result;

    if (explicitTemplatePath) {
        result = explicitTemplatePath;
    } else {
        result = defaultTemplateOf(pathToLookIn, site);
    }

    debug("Found template file: " + result);
    return result;
}

// First looks for a default file (name specified in config.defualtTemplate) in
// the same directory as given file, then in the directory above, then above
// that, etc.
// The last one it will check is ./config.topTemplateDirectory/config.defaultFile.
// That one should always exist, and if some idiot deletes it, bad things might
// happen.
function defaultTemplateOf(pathToLookIn, site) {
    const topDir = path.resolve("./" + config.topTemplateDir + "/");
    // We shall only look in templateDir, else we'll go into a loop.
    if (isPathInsideDir(pathToLookIn, topDir)) {
        pathToLookIn = path.resolve(path.dirname(pathToLookIn), config.defaultTemplate);
        var pathFound;
        while (!(pathFound = templatePath(pathToLookIn, site))) {
            var directory = path.dirname(pathToLookIn);
            if (directory == topDir) {
                debug("BAD!", "Toplevel default template", pathToLookIn, "not found.",
                    "This should never happen. Who deleted it?");
                return undefined;
            }
            pathToLookIn = path.resolve(directory, "../" + config.defaultTemplate);
        }
        return pathFound;
    } else {
        return undefined;
    }
}

// Takes a full path to a file too look for, without the extension.
// Returns undefined if not found with any supported extension.
function templatePath(fullPath, site) {
    var templatePathKnownExt = templatePathGuessExt(fullPath, site);
    if (templatePathKnownExt) {
        return templatePathKnownExt;
    } else {
        return templatePathTryAll(fullPath);
    }
}

function templatePathGuessExt(fullPath, site) {
    var guessExt = config.knownExtensions[site];
    var filePath = fullPath + "." + guessExt;
    if (fileExists(filePath)) {
        debug("Guessed extension right");
        return filePath;
    } else {
        return undefined;
    }
}

function templatePathTryAll(fullPath) {
    for (var engineName in config.supportedEngines) {
        var engineDesc = config.supportedEngines[engineName];
        try {
            var fullPathWithExt = fullPath + "." + engineDesc.extension;
            debug("trying" + fullPathWithExt + engineDesc)
            fs.accessSync(fullPathWithExt);
            return fullPathWithExt;
        } catch (e) {
            continue;
        }
    }
    debug("Could not find file" + fullPath);
    return undefined;
}

function isPathInsideDir(fullPath, containingDir) {
    const relPath = path.relative(containingDir, fullPath)
    // If we have to go up from containingDir, fullPath is not in containingDir.
    if (relPath.substr(0,2) == "..") {
        return false;
    } else {
        return true;
    }
}

//Here, we actually mean a full path, extension and all.
function fileExists(fullPath) {
    try {
        fs.accessSync(fullPath);
        return true;
    } catch (e) {
        return false;
    }
}

///////////////////////////////////// Unit tests

exports.test = function(assert) {
    assert(templatePath(path.resolve("./" + config.topTemplateDir + "/", config.defaultTemplate)),
        "There must be a toplevel default template file.");
    assert(!(defaultTemplateOf(path.resolve("/"))),
        "Nothing should be returned if we're not in template dir.");
}
