var bunyan = require('bunyan');

/*
 * Abstracted interface for logging crash reports etc. We might want to change to something else later.
 */

var log = bunyan.createLogger({
    name: 'gloo',
    streams: [{
        level: "error",
        path: "gloo_errors.txt"
    }]
});

module.exports = function(msg) {
    log.error(msg);
}
