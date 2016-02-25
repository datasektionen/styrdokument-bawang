# gloo
"View over the wire"

En app för att ta data från Taitan och rendrera in det med tmplates från Bawang, för att sedan ge tillbaks det till användaren.

## Procedur:



 1. Vi lyssnar efter ex: `get gloo.datasektionen.se/stuff/abc`
 2. `Get taitan.datasektionen.se/stuff/abc`, detta är datan för sidan som ska rendreras
 3. Avgör vilken template vi ska ha: Kollar först efter `/templates/gloo/stuff/abc.*`, detta bör vara en template eller en referens till en template.
   1. Om det är det, använd den och fortsätt
   2. Om inte, försök `/templates/gloo/stuff/_default.*`. (Ja, vi antar att ingen riktig sida kommer heta det, så det är "defaulten" för alla sidor i mappen.
   3. Om den inte finns, prova `/templates/gloo/_default.*` och så vidare, klättra så högt du kan.
   4. *Två specialfall:* Toppdomänen, den kommer sökas som `/templates/gloo.*`. (Och om filen inte finns skulle alltså `/templates/gloo/_default.*` användas.
   5. Och om subdomänen inte specifieras antas `www` som subdomän.
 4. Rendera datan med givet template
 5. Skicka tillbaks till användaren
 


