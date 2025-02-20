import express from "express";
import cons from "consolidate"
import config from "../config";


export default () => {
    const app = express();
    app.set("views", "./" + config.templateDir);
    app.engine(config.extension, cons[config.engine]);
    return app;
};
