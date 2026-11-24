import { defineConfig } from "tsdown";

export default defineConfig([
  // library exports
  {
    entry: {
      element: "src/element/index.ts",
      lib: "src/lib.ts",
      react: "src/react/index.ts",
      vue: "src/vue/index.ts",
      solid: "src/solid/index.ts",
    },
    format: "esm",
    platform: "browser",
    dts: true,
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
    outputOptions: { comments: false },
  },
]);
