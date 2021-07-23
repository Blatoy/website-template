import fs from "fs-extra";
import path = require("path");
import esbuild = require("esbuild");
import sassPlugin = require("esbuild-plugin-sass");
import { BuildResult } from "esbuild";
import TscWatchClient from "tsc-watch/client";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";

const DIST_FOLDER_PATH = "dist";
const STATIC_PATHS = ["client/index.html", "client/static"];

const args = process.argv.slice(2);
const env = args[0];

const tscWatch = new TscWatchClient();

const baseConfig = {
    entryPoints: ["client/src/index.tsx"],
    bundle: true,
    plugins: [sassPlugin()]
};

switch (env) {
    case "dev": {
        if (!fs.pathExistsSync(".env")) {
            console.log("Creating .env from .env.template");

            fs.copyFileSync(".env.template", ".env");
        }

        // Client
        esbuild.build({
            ...baseConfig,
            outdir: "client/static/build",
            watch: true,
            sourcemap: true,
            logLevel: "info"
        }).catch(() => {
            tscWatch.kill();
            process.exit(1);
        });

        // Server
        let nodeServer: ChildProcessWithoutNullStreams;
        tscWatch.start("--project", "./server");

        tscWatch.on("success", () => {
            nodeServer?.kill();
            nodeServer = spawn("node", ["--inspect", "./server/build/src/main.js"]);

            nodeServer.stdout.on("data", data => process.stdout.write(data.toString()));
            nodeServer.stderr.on("data", data => process.stderr.write(data.toString()));

        });
    } break;
    case "prod": {
        const asyncBuildSteps: Promise<BuildResult | void>[] = [];

        console.log("Cleaning previous build...");
        fs.emptyDirSync(DIST_FOLDER_PATH);

        console.log("Copying static files, building and bundling project...");

        for (const filePath of STATIC_PATHS) {
            asyncBuildSteps.push(fs.copy(filePath, path.join(DIST_FOLDER_PATH, path.basename(filePath))));
        }

        asyncBuildSteps.push(esbuild.build({
            ...baseConfig,
            outdir: path.join(DIST_FOLDER_PATH, "build"),
            watch: false,
            sourcemap: false,
            minify: true,
        }));

        Promise.all(asyncBuildSteps).then(() => {
            console.log("Building finished with no errors. Dist folder in:", DIST_FOLDER_PATH);
        }).catch((err) => {
            console.error("Building failed:");
            console.error(err);
        });

    } break;
    default:
        console.error(`Specified env (${env}) is invalid`);
        process.exit(1);
}

