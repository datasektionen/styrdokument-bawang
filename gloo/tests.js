const debug = require("debug")("gloo:test");

var counter = 0;
var failCounter = 0;


function assert(assertion, explanation) {
    counter++;
    if (!(assertion)) {
        console.log("Test failed: " + explanation);
        failCounter++;
    } else {
        debug("Test " + counter + " succeeded.")
    }
}

assert.equals = function(expected, actual, explanation) {
    counter++;
    if (expected === actual) {
        debug("Test " + counter + " succeeded.")
    } else {
        console.log("Test failed: \"" + explanation + "\" because I expected:");
        console.log(expected + " but got " + actual);
        failCounter++;
    }
}

require("./find-template").test(assert);

if (failCounter == 0) {
    console.log("All " + counter + " tests passed.");
} else {
    console.log(counter + " tests finished. " + failCounter + " failed.");
}
