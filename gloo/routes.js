const fetch = require("node-fetch");
const debug = require("debug")("gloo:routes");
const template = require("./find-template");
const config = require("./../config");
const express = require("express");

const comparePages = (a, b) => {
    if (a.sort === b.sort) {
        if (a.title === b.title) return 0
        if (a.title === undefined) return 1;
        if (b.title === undefined) return -1;

        return a.title.localeCompare(b.title, 'sv-SE') // the comparison ignores case
    }

    if (a.sort === undefined) return 1;
    if (b.sort === undefined) return -1;

    return (a.sort - b.sort);
}


module.exports = function(app) {

    // Static assets will be available on the same path as their directory,
    // i.e. assets => /assets, static => /static
    app.use('/' + config.staticDir, express.static(config.staticDir));

    // All requests that are not static files should be resolved
    app.get("*", (req, res) => {

        var templatePath = template.find(req);

        if (templatePath)
            fetch(config.taitanUrl + req.path)
                .then(response => {
                    if (response.ok && response.url === config.taitanUrl + req.path)
                        return response.json()
                    else if (response.ok)
                        if (response.url.indexOf(config.taitanUrl) === 0)
                            throw response.url.substr(config.taitanUrl.length)
                        else
                            throw response.url
                    else
                        throw response.status
                })
                .then(data => {
                    if(data.fuzzes)
                        res.send(data)
                    else {
                        data.nav.sort(comparePages)
                        data.nav.forEach(item => {
                            console.log(item)
                            if (item.nav) {
                                item.nav.sort(comparePages)
                            } 
                        })
                        res.render(templatePath, data)
                    }
                })
                .catch(err => {
                    if (err == 404)
                        res.status(404).render("_404." + config.extension, { req: req });
                    else if (err.startsWith("/") || err.startsWith("http"))
                        res.redirect(err)
                    else
                        res.status(500).send("An unexpected error occured. " + err)
                })
        else
            return res.status(404).send("404: The page could not be found and this gloo instance contains no 404 template");

    });

};
