import path from "path";
import fs from "fs";
import config from "../config";
import { Request } from "express";


// exports.find = findTemplate;

/**
 * Finds the template file that fits the request
 *
 * @param req         Express request object
 * @returns resolved  Resolved template file path
 */
const findTemplate = (searchPath: Request["path"]) => {

    // var searchPath = req.path;

    // 1. Root URL always renders default template
    if (searchPath === "/")
        return config.defaultTemplate + "." + config.extension;

    // 2. Look for the exact path template - if found, step 3 will be skipped
    var resolved = resolveTemplate(searchPath);

    // Remove trailing file name to switch to directory-based search mode
    searchPath = path.dirname(searchPath);

    // 3. Traverse the directory tree upwards
    // If nothing more specific exists, this will fallback to site default template
    while (resolved === undefined) {
        resolved = resolveTemplate(path.join(searchPath, config.defaultTemplate));
        searchPath = path.normalize(searchPath + "/..");
    }

    // If no default template is provided, throw error
    if (resolved === undefined)
        return console.error("Fatal error: Site has no default template file. Check your config.");


    // Remove starting slash from path
    if (resolved.startsWith(path.sep))
        resolved = resolved.substring(1);


    return resolved;
};

/**
 * Try to resolve a template file inside the config.templateDir directory.
 * Returns the template file path (with extension) upon success, or `undefined`.
 *
 * @param fullPath  Path of the template (inside the config.templateDir)
 * @returns         string/undefined
 */
const resolveTemplate = (fullPath: string) => {
    var fullPathWithExt = path.normalize(fullPath + "." + config.extension);

    try {
        fs.accessSync(config.templateDir + path.sep + fullPathWithExt);
        return fullPathWithExt;
    } catch (e) {
        return undefined;
    }
}


//== TESTS ================
// These tests only work for what's in template_example

const test = (assert) => {
    const defaultTemplateFile = config.defaultTemplate + "." + config.extension;

    assert.equals(defaultTemplateFile,
        findTemplate("/"),
        "Root URL always renders default template.");

    assert.equals("_404." + config.extension,
        findTemplate("/_404"),
        "Should be able to find a specific file.");

    assert.equals(defaultTemplateFile,
        findTemplate("/noTemplateForThisOne"),
        "Should give default file when asked for one without template.");

    assert.equals(defaultTemplateFile,
        findTemplate("/foo/bar"),
        "Should be able to climb out of a directory and give default file.");

}

export default {
    find: findTemplate,
    test
}