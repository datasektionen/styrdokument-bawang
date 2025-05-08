import express from "./gloo/express";
import config from "./config";
import routes from "./gloo/routes";

const app = express();
routes(app);
app.listen(config.port);

console.log("Server running on port: " + config.port);
