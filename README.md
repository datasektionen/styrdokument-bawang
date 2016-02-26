# gloo
"View over the wire"

An app for taking data from Taitan (or similar) and rendering it according to templates, returns html to the user.

## Procedur:
 1. We listen after for example `GET gloo.datasektionen.se/stuff/abc`
 2. `GET taitan.datasektionen.se/stuff/abc`, this is the data that will be rendered.
 3. Determine which template we should use. First look after `/templates/gloo/stuff/abc.*`
   1. If it is a template, used it and continue.
   2. Else, try `/templates/gloo/stuff/_default.*`.
   3. Else, try `/templates/gloo/_default.*` and so on, climbing until you reach the top of the templates folder.
   4. If the subdomain is not specified it is presumed to be `www`.
 4. Render the data with the given template.
 5. Send back the rendered html to the user.
 
## Lägg till template engine
 1. Go to [consolidatejs](https://www.npmjs.com/package/consolidate) and check if the engine is supported.
 2. Add the engine to `package.json`
 3. Add the engine and extension to `config.js`
 4. Do `npm install` to install the new engine. 
 5. Done.
