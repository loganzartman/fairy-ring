import type { Preview } from "@storybook/web-components-vite";

declare global {
  // Defined only when running under Vitest (see vitest.setup.ts).
  var matchStoryScreenshot: ((canvas: HTMLElement) => Promise<void>) | undefined;
}

const preview: Preview = {
  parameters: {
    // "Code" tab in the addons panel showing each story's source
    docs: { codePanel: true },
    options: {
      storySort: { order: ["docs", ["getting started", "config"], "api", "*"] },
    },
  },
  afterEach: async ({ canvasElement }) => {
    await globalThis.matchStoryScreenshot?.(canvasElement);
  },
};

export default preview;
