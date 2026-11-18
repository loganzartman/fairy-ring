import { defineConfig } from "tsdown";

export default defineConfig([
  // library exports
  {
    entry: {
      index: "src/index.ts",
      element: "src/element.ts",
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
  },
]);
