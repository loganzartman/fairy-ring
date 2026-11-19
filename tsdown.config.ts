import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { defineConfig } from "tsdown";
import * as z from "zod/v4-mini";

export default defineConfig([
  // library exports
  {
    entry: {
      index: "src/index.ts",
      element: "src/element.ts",
      lib: "src/lib.ts",
      react: "src/react.ts",
      vue: "src/vue.ts",
      solid: "src/solid.ts",
    },
    format: "esm",
    platform: "browser",
    dts: true,
    hooks: {
      // json schema for fairy-ring.toml, so editors can validate and autocomplete it.
      // generated from the built lib, since node can't import src/ directly.
      "build:done": async ({ options }) => {
        const lib = pathToFileURL(join(options.outDir, "lib.js")).href;
        const { configSchema } = await import(lib);
        const schema = z.toJSONSchema(configSchema, { io: "input" });
        const json = JSON.stringify({ title: "fairy-ring config", ...schema }, null, 2);
        await writeFile(join(options.outDir, "config.schema.json"), json + "\n");
      },
    },
  },
  // self-contained bundle for <script type="module"> from a CDN
  {
    entry: { standalone: "src/standalone.ts" },
    format: "esm",
    platform: "browser",
    dts: false,
    minify: true,
    clean: false,
    deps: { alwaysBundle: [/.*/], onlyBundle: false },
  },
]);
