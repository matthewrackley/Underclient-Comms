import "dotenv/config";
import { build } from "esbuild";
import { chmodSync } from 'node:fs';
import { copyFile, mkdir, rm, glob } from "node:fs/promises";
import dotenv from "dotenv";
import path from 'node:path';

dotenv.config();

const svgPattern = "src/assets/*.svg";

/** @type {import("esbuild").BuildOptions} */
const shared = {
  bundle: true,
  sourcemap: false,
  minify: true,
  legalComments: "external",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  alias: {
    "@": "./src",
    "$": "./src/server",
    "#": "./dist/client/assets"
  },
};

await rm("dist", { recursive: true, force: true });
await mkdir("dist/client/terms-of-service", { recursive: true });
await mkdir("dist/client/privacy-policy", { recursive: true });
await mkdir("dist/server", { recursive: true });
await mkdir("dist/client/assets", { recursive: true });

/** @type {import("esbuild").BuildOptions} */
const cjsOptions = {
  ...shared,
  entryPoints: ["src/server/server.ts"],
  outfile: "dist/server/server.cjs",
  platform: "node",
  format: "cjs",
  target: "node24",
  define: {
    ...shared.define,
    "process.env.HTTPS_CERT_PATH": JSON.stringify(process.env.HTTPS_CERT_PATH ?? ""),
    "process.env.HTTPS_KEY_PATH": JSON.stringify(process.env.HTTPS_KEY_PATH ?? ""),
    "process.env.REDIRECT_URI": JSON.stringify(process.env.REDIRECT_URI ?? ""),
  },
  banner: {
    js: "#!/usr/bin/env node",
  }
};
/** @type {import("esbuild").BuildOptions} */
const jsOptions = {
  ...shared,
  entryPoints: ["src/index.tsx"],
  outfile: "dist/client/index.js",
  platform: "browser",
  format: "iife",
  target: "es2022",
  define: {
    ...shared.define,
    "process.env.DISCORD_CLIENT_ID": JSON.stringify(process.env.DISCORD_CLIENT_ID ?? ""),
  }
}

await Promise.all([
  build(cjsOptions),
  build(jsOptions),
]);

chmodSync("dist/server/server.cjs", 0o755);
await copyFile("src/public/index.html", "dist/client/index.html");
await copyFile("src/public/styles.css", "dist/client/styles.css");
await copyFile("src/public/terms-of-service.html", "dist/client/terms-of-service/index.html");
await copyFile("src/public/privacy-policy.html", "dist/client/privacy-policy/index.html");
for await (const filepath of glob(svgPattern)) {
  const fileName = path.basename(filepath);
  const destination = path.join("dist/client/assets", fileName);

  await copyFile(filepath, destination);
};
