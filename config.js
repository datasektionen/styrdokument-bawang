// Configurations, for example ports for the templates

module.exports = {
    port: 5000,
    defaultTemplate: "_default",
    topTemplateDir: "templates",
    subdomainData: {
        www: {
            taitanHost: "taitan.datasektionen.se",
            // Engine is what it's called by consolidate.js. Might not always be the same as extension.
            engine: "jade",
        },
        gloo: {
            taitanHost: "taitan.datasektionen.se",
            engine: "handlebars"
        }
    },
    knownExtensions: {
        "www/": "handlebars"
    },
    //The following is to be removed in the future as we move to knowing what every site uses.
    supportedEngines: {
        // Engine is what it's called by consolidate.js. Might not always be the same as extension.
        "jade": {extension: "jade", engine: "jade"},
        "handlebars": {extension: "handlebars", engine: "handlebars"}
    }
}
