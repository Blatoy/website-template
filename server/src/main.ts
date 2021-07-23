import { NestFactory } from "@nestjs/core";
import { join } from "path";
import { AppModule } from "./app.module.js";

import express from "express";
import dotenv from "dotenv";

import routes from "../routes.json";

async function bootstrap() {
    dotenv.config();

    try {
        const app = await NestFactory.create(AppModule);
        app.setGlobalPrefix("api");

        const server = app.getHttpAdapter().getInstance() as express.Express;
        const staticFilesPath = join(__dirname, "..", "..", "..", "client", "static");
        const staticFolderMiddleware = express.static(staticFilesPath);

        server.use("/", (req, res, next) => {
            const baseURL = req.path.split("/")[1];

            if (routes.includes(baseURL)) {
                res.sendFile(join(staticFilesPath, "index.html"));
            } else {
                staticFolderMiddleware(req, res, next);
            }
        });

        if (process.env.PORT) {
            await app.listen(parseInt(process.env.PORT));
        } else {
            console.log("Specified PORT in .env is undefined");
        }
    } catch (e) {
        console.log(e);
    }
}
bootstrap();
