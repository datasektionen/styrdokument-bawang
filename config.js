// Configurations, for example ports for the templates

module.exports = {
    port: 3000,
    defaultTemplate: "_default",
    supportedEngines: [
        {extension: "jade", engine: "jade"},
        {extension: "handlebars", engine: "handlebars"}
    ]
}