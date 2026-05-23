import "dotenv/config";
import { build } from "esbuild";
import { chmodSync } from 'node:fs';
import { copyFile, mkdir, rm, glob } from "node:fs/promises";
import dotenv from "dotenv";
import path from 'node:path';

dotenv.config();

const svgPattern = "src/assets/*.svg";
const pngPattern = "src/client/public/assets/*.png";

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
await mkdir("public/terms-of-service", { recursive: true });
await mkdir("public/privacy-policy", { recursive: true });
await mkdir("dist/server", { recursive: true });
await mkdir("public/assets", { recursive: true });
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
await copyFile("src/client/public/index.html", "dist/client/index.html");
await copyFile("src/client/public/styles.css", "public/assets/styles.css");
await copyFile("src/client/public/terms-of-service.html", "public/terms-of-service/index.html");
await copyFile("src/client/public/privacy-policy.html", "public/privacy-policy/index.html");
await copyFile("src/client/public/invite.html", "public/index.html");
await copyFile("src/client/public/invite-styles.css", "public/styles.css");
for await (const filepath of glob(pngPattern)) {
  const fileName = path.basename(filepath);
  const destination = path.join("public/assets", fileName);

  await copyFile(filepath, destination);
}
for await (const filepath of glob(svgPattern)) {
  const fileName = path.basename(filepath);
  const destination = path.join("dist/client/assets", fileName);

  await copyFile(filepath, destination);
};
