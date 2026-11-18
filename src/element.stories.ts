import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { stringify } from "smol-toml";
import { expect, waitFor } from "storybook/test";
import type * as z from "zod/v4-mini";
import { define } from "./element";
import type { configSchema } from "./lib";

const CURRENT_PAGE = `${document.location.protocol}//${document.location.host}`;

define();

type ConfigInput = z.input<typeof configSchema>;

type Args = { config: ConfigInput };

function configUrl(config: ConfigInput): string {
  return `data:application/toml,${encodeURIComponent(stringify(config))}`;
}

const meta: Meta<Args> = {
  title: "api/element",
  component: "fairy-ring",
  render: ({ config }) => html`<fairy-ring config-url=${configUrl(config)}></fairy-ring>`,
  // Wait for the config to load so screenshots capture the final state, not "loading".
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector("fairy-ring");
    await waitFor(() => {
      expect(el?.shadowRoot?.querySelector(".prev, .error")).toBeTruthy();
    });
  },
};
export default meta;

export const Default: StoryObj<Args> = {
  args: {
    config: {
      version: "0.0",
      name: { en: "Example ring" },
      sites: [
        { url: "https://example.com", scope: "host" },
        { url: CURRENT_PAGE, scope: "host" },
        { url: "https://example.org", scope: "host" },
      ],
    },
  },
};
