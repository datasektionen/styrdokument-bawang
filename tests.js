console.log("These tests should print a finishing message.");


function assert(assertion, explanation) {
    if (!(assertion)) {
        console.log("Test failed: " + explanation);
    }
}

require("./find-template").test(assert);

console.log("Tests finished.");
//exit();