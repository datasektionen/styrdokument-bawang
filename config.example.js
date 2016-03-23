/**
 * Gloo configuration
 */
module.exports = {

    // External port where Gloo should listen for connections
    // When deployed, this is usually process.env.PORT
    port: process.env.PORT || 5000,

    // Hostname of the Taitan instance, and whether to communicate over HTTPS with it
    taitanHost: "taitan.datasektionen.se",
    https: true, // Taitan seems to only accept https atm.

    // The name of the template engine as it's called by consolidate.js, may differ from extension
    // Default template file to look for in subdirectories
    engine: "nunjucks",
    extension: "nunj",
    defaultTemplate: "_default",

    // Directories this gloo instance uses to source its content
    templateDir: "templates",
    staticDir: "static"
};