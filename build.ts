import fs from "fs-extra";
import path = require("path");
import esbuild = require("esbuild");
import sassPlugin = require("esbuild-plugin-sass");
import { BuildResult } from "esbuild";
import TscWatchClient from "tsc-watch/client";
import { ChildProcessWithoutNullStreams, exec, spawn } from "child_process";

// Prod build
const DIST_DIRECTORY = "dist";
const DIST_PUBLIC_DIRECTORY = path.join(DIST_DIRECTORY, "public");
const DIST_SERVER_DIRECTORY = path.join(DIST_DIRECTORY, "server");

// Dev build
const SERVER_BUILD_DIRECTORY = "server/build";
const CLIENT_BUILD_DIRECTORY = "client/static/build";

// List of paths that will be copied into the public folder
const PUBLIC_FOLDERS = ["client/static"];
// List of paths that will be copied the server folder
const SERVER_FILES = ["server/package.json", "server/package-lock.json"];

const args = process.argv.slice(2);
const env = args[0];

const esbuildClientConfig = {
    entryPoints: ["client/src/index.tsx"],
    bundle: true,
    plugins: [sassPlugin()]
};

function clean() {
    console.log("Cleaning existing builds...");
    fs.emptyDirSync(SERVER_BUILD_DIRECTORY);
    fs.emptyDirSync(CLIENT_BUILD_DIRECTORY);
    fs.emptyDirSync(DIST_DIRECTORY);
}

switch (env) {
    case "clean": {
        clean();
    } break;
    case "build-dev":
    case "dev": {
        // Generate default .env if it does not exists
        if (!fs.pathExistsSync(".env")) {
            console.log("Creating .env from .env.template");
            fs.copyFileSync(".env.template", ".env");
        }

        const tscWatch = new TscWatchClient();
        const buildOnly = env === "build-dev";

        // Client
        esbuild.build({
            ...esbuildClientConfig,
            outdir: CLIENT_BUILD_DIRECTORY,
            watch: !buildOnly,
            sourcemap: true,
            logLevel: "info"
        }).catch(() => {
            tscWatch.kill();
            process.exit(1);
        });

        // Server
        if (buildOnly) {
            runTSC("--project", "./server/tsconfig.json", "--outDir", SERVER_BUILD_DIRECTORY);
        } else {
            // Start watch server
            let nodeServer: ChildProcessWithoutNullStreams;
            tscWatch.start("--project", "./server/tsconfig.json", "--outDir", SERVER_BUILD_DIRECTORY);

            tscWatch.on("success", () => {
                nodeServer?.kill();
                nodeServer = spawn("node", ["--inspect", "./server/build/src/main.js"]);

                nodeServer.stdout.on("data", data => process.stdout.write(data.toString()));
                nodeServer.stderr.on("data", data => process.stderr.write(data.toString()));
            });
        }

    } break;
    case "prod": {
        const asyncBuildSteps: Promise<BuildResult | void>[] = [];

        clean();

        fs.ensureDirSync(DIST_PUBLIC_DIRECTORY);
        fs.ensureDirSync(DIST_SERVER_DIRECTORY);

        console.log("Copying static files, building and bundling project...");

        for (const filePath of PUBLIC_FOLDERS) {
            asyncBuildSteps.push(fs.copy(filePath, DIST_PUBLIC_DIRECTORY));
        }

        for (const filePath of SERVER_FILES) {
            asyncBuildSteps.push(fs.copy(filePath, path.join(DIST_SERVER_DIRECTORY, path.basename(filePath))));
        }

        asyncBuildSteps.push(esbuild.build({
            ...esbuildClientConfig,
            outdir: path.join(DIST_PUBLIC_DIRECTORY, "build"),
            watch: false,
            sourcemap: false,
            minify: true,
        }));

        asyncBuildSteps.push(runTSC("--project", "./server/tsconfig.prod.json", "--outDir", DIST_SERVER_DIRECTORY));

        Promise.all(asyncBuildSteps).then(() => {
            console.log("Building finished with no errors. Dist folder in:", DIST_DIRECTORY);
        }).catch((err) => {
            console.error("Building failed:");
            console.error(err);
        });

    } break;
    default:
        console.error(`Specified env (${env}) is invalid`);
        process.exit(1);
}

function runTSC(...args: string[]) {
    return new Promise<void>((resolve, reject) => {
        console.log("tsc start");

        const tsc = exec(`${path.join("node_modules", ".bin", "tsc")} ${args.join(" ")}`);
        tsc.stdout?.on("data", data => process.stdout.write(data.toString()));
        tsc.stderr?.on("data", data => process.stderr.write(data.toString()));

        tsc.on("exit", () => {
            resolve();
        });

        tsc.on("error", () => {
            reject();
        });
    });

}
