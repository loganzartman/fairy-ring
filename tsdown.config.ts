import { defineConfig } from "tsdown";

export default defineConfig([
  // library exports
  {
    entry: {
      element: "src/element.ts",
      lib: "src/lib.ts",
      react: "src/react.ts",
      vue: "src/vue.ts",
      solid: "src/solid.ts",
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
