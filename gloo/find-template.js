const path = require("path");
const fs = require("fs");
const debug = require("debug")("gloo:find-template");
const config = require("./../config");

/**
 * Finds the template file that fits the request
 *
 * @param req       Express request object
 */
exports.find = function(req) {

    var searchPath = path.dirname(req.path) + '/' + path.basename(req.path);

    // 1. Look for the exact path template
    var resolved = resolveTemplate(searchPath);

    // Remove trailing file name to switch to directory-based search mode
    searchPath = path.dirname(searchPath);

    // 2. Traverse the directory tree upwards
    while (resolved === undefined) {
        resolved = resolveTemplate(path.join(searchPath, config.defaultTemplate));
        searchPath = path.normalize(searchPath + "/..");
    }

    // 3. Fallback to site default template
    if (resolved === undefined)
        resolved = config.defaultTemplate + "." + config.extension;

    return resolved;
};

/**
 * Try to resolve a template file inside the config.templateDir directory.
 * Returns the template file path (with extension) upon success, or `undefined`.
 *
 * @param fullPath  Path of the template (inside the config.templateDir)
 * @returns         string/undefined
 */
function resolveTemplate(fullPath) {

    var fullPathWithExt = fullPath + "." + config.extension;

    try {
        fs.accessSync(config.templateDir + "/" + fullPathWithExt);
        return fullPathWithExt;
    } catch (e) {
        debug("Could not find file " + fullPathWithExt)
    }

    return undefined;
}