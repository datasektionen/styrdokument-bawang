# gloo
"View over the wire"

An app for taking data from Taitan (or similar) and rendering it according to templates, returns html to the user.

### What it does:
 1. We listen for e.g. `GET gloo.datasektionen.se/stuff/abc`
 2. We `GET taitan.datasektionen.se/stuff/abc`, this is the data that will be rendered.
 3. Determine which template we should use. First look for `/templates/gloo/stuff/abc.*` (where * ~~are all our supported engine extensions~~ is the rendering engine extension specified in config.js).
   1. If this template file exists, use it and continue.
   2. Else, try `/templates/gloo/stuff/_default.*`.
   3. Else, try `/templates/gloo/_default.*` and so on, climbing until you reach the top of the templates folder.
   4. **Note:** If the subdomain is not specified it is presumed to be `www`.
 4. Render the data with the given template.
 5. Send back the rendered html to the user.

### Setup

Before running, you have to create file `config.js` and directory `templates`. Feel free to copy `config.example.js` and `templates_example`.

## Development

#### Writing templates
The variables passed to the template engine are the same ones that [Taitan](https://github.com/datasektionen/taitan) sends, with no processing applied.
So look there for documentation.

#### Adding a template engine
 1. Go to [consolidatejs](https://www.npmjs.com/package/consolidate) and make sure the engine is supported.
 2. Add the engine to `package.json`
 3. Add the engine name in consolidate and extension to `config.js`
 4. Do `npm install` to install the new engine.
 5. Done.
