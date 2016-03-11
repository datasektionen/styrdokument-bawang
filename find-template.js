const path = require("path");
const fs = require("fs");
const debug = require("debug")("gloo:find-template");
const config = require("./config");

// Finds the template file that fits the request.
//We should at least always deliver the toplevel default file.
exports.find = function(req, subdomain) {
    var site = subdomain + req.path;
    var pathToLookIn = path.resolve("./templates/" + site)
    if (site.substr(site.length-1) == "/") {
        pathToLookIn += path.sep + config.defaultTemplate;
    }
    debug("PATHL: " + pathToLookIn);
    debug("SITE: " + site);

    var result;

    var explicitTemplatePath = templatePath(pathToLookIn, subdomain);
    if (explicitTemplatePath) {
        result = explicitTemplatePath;
    } else {
        debug("No explicit template found, looking for a default.");
        result = defaultTemplateOf(pathToLookIn, subdomain);
    }

    if (result) {
        debug("Found template file: " + result);
        return result;
    } else {
        debug("Could not even find a defualt template file. This is a bug and should never happen. Report pls.")
        return undefined;
    }
}

// First looks for a default file (name specified in config.defualtTemplate) in
// the same directory as given file, then in the directory above, then above
// that, etc.
// The last one it will check is ./config.topTemplateDirectory/config.defaultFile.
// That one should always exist, and if some idiot deletes it, bad things might
// happen.
function defaultTemplateOf(pathToLookIn, subdomain) {
    const topDir = path.resolve("./" + config.topTemplateDir + "/" + subdomain + "/");
    // We shall only look in templateDir, else we'll go into a loop.
    if (isPathInsideDir(pathToLookIn, topDir)) {
        pathToLookIn = path.resolve(path.dirname(pathToLookIn), config.defaultTemplate);
        var pathFound;
        while (!(pathFound = templatePath(pathToLookIn, subdomain))) {
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
function templatePath(fullPath, subdomain) {
    var templatePathKnownExt = templatePathGuessExt(fullPath, subdomain);
    if (templatePathKnownExt) {
        return templatePathKnownExt;
    } else {
        return templatePathTryAll(fullPath);
    }
}

function templatePathGuessExt(fullPath, subdomain) {
    var guessExt = config.knownExtensions[subdomain];
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
    assert(!(defaultTemplateOf(path.resolve("/"))),
        "Nothing should be returned if we're not in template dir.");
    assert(exports.find({path: "/namnder"}, "www"),
        "This nonexistent template should fallback to default template");
    assert.equals(path.resolve(config.topTemplateDir, "test", config.defaultTemplate + ".jade"), exports.find({path: "/"}, "test"),
        "Should use default template in subdomain when asked for topdir");
    assert.equals(path.resolve(config.topTemplateDir, "test/foo", config.defaultTemplate + ".jade"), exports.find({path: "/foo/"}, "test"),
        "Should use default template in foo folder.");
    assert.equals(path.resolve(config.topTemplateDir, "test", config.defaultTemplate + ".jade"), exports.find({path: "/bar"}, "test"),
        "No default in that folder, so it should use toplevel default template");
    assert.equals(path.resolve(config.topTemplateDir, "test/foo", config.defaultTemplate + ".jade"), exports.find({path: "/foo/baz"}, "test"),
        "No default in that folder, so it should climb up a level");
    assert.equals(path.resolve(config.topTemplateDir, "test/foo", config.defaultTemplate + ".jade"), exports.find({path: "/foo/baz/bad/bac/baf/burbur"}, "test"),
        "Should climb up many levels");
    assert.equals(path.resolve(config.topTemplateDir, "test/custom.jade"), exports.find({path: "/custom"}, "test"),
        "Should use custom template since it exists");
    assert.equals(path.resolve(config.topTemplateDir, "test/", config.defaultTemplate + ".jade"), exports.find({path: "/custom/"}, "test"),
        "Should not confuse directory custom with file custom.");

}
