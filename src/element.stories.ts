import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { stringify } from "smol-toml";
import type * as z from "zod/v4-mini";
import { define } from "./element";
import type { configSchema } from "./lib";

define();

// what an author writes (fields with defaults are optional), not the parsed result.
type ConfigInput = z.input<typeof configSchema>;

type Args = { config: ConfigInput };

function configUrl(config: ConfigInput): string {
  return `data:application/toml,${encodeURIComponent(stringify(config))}`;
}

const meta: Meta<Args> = {
  component: "fairy-ring",
  render: ({ config }) => html`<fairy-ring config-url=${configUrl(config)}></fairy-ring>`,
};
export default meta;

export const Default: StoryObj<Args> = {
  args: {
    config: {
      version: "0.0",
      name: { en: "Example ring" },
      sites: [
        { url: "https://example.com", scope: "host" },
        { url: "http://127.0.0.1:6006", scope: "host" },
        { url: "https://example.org", scope: "host" },
      ],
    },
  },
};
