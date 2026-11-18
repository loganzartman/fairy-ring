import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    passWithNoTests: true,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
    projects: [
      {
        extends: true,
        plugins: [storybookTest()],
        test: {
          name: "storybook",
          setupFiles: [".storybook/vitest.setup.ts"],
          // The Storybook plugin disables file writes unless opted in; needed to save screenshots.
          api: { allowWrite: true },
        },
      },
      {
        extends: true,
        test: { name: "unit", include: ["src/**/*.test.ts"] },
      },
    ],
  },
});
