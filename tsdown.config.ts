import { defineConfig } from "tsdown";

export default defineConfig({
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
});
