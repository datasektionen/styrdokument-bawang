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

    var searchPath = req.path;

    // 1. Root URL always renders default template
    if (req.path === "/")
        return config.defaultTemplate + "." + config.extension;

    // 2. Look for the exact path template
    var resolved = resolveTemplate(searchPath);

    // Remove trailing file name to switch to directory-based search mode
    searchPath = path.dirname(searchPath);

    // 3. Traverse the directory tree upwards
    // If nothing more specific exists, this will fallback to site default template
    while (resolved === undefined) {
        debug("SearchPath is " + searchPath);
        debug("Looking for " + path.join(searchPath, config.defaultTemplate));
        resolved = resolveTemplate(path.join(searchPath, config.defaultTemplate));
        searchPath = path.normalize(searchPath + "/..");
    }

    // If no default template is provided, throw error
    if (resolved === undefined)
        return console.error("Fatal error: Site has no default template file. Check your config.");

    // Remove starting slash from path
    if (resolved.startsWith('/'))
        resolved = resolved.substr(1);

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