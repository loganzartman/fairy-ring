import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { stringify } from "smol-toml";
import { expect, waitFor } from "storybook/test";
import type * as z from "zod/v4-mini";
import { define } from "./element";
import type { configSchema, Site } from "./lib";

const CURRENT_PAGE = `${document.location.protocol}//${document.location.host}`;

define();

type ConfigInput = z.input<typeof configSchema>;

type Args = { config: ConfigInput };

function configUrl(config: ConfigInput): string {
  return `data:application/toml,${encodeURIComponent(stringify(config))}`;
}

const EXAMPLE_SITES = [
  { url: "https://example.com", scope: "host" },
  { url: CURRENT_PAGE, scope: "host" },
  { url: "https://example.org", scope: "host" },
] satisfies Site[];

const meta: Meta<Args> = {
  title: "api/element",
  component: "fairy-ring",
  render: ({ config }) => html`<fairy-ring config-url=${configUrl(config)}></fairy-ring>`,
  // Wait for the config to load so screenshots capture the final state, not "loading".
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector("fairy-ring");
    await waitFor(() => {
      expect(el?.querySelector('[data-fr="prev"], [data-fr="error"]')).toBeTruthy();
    });
  },
};
export default meta;

export const Default: StoryObj<Args> = {
  args: {
    config: {
      version: "0.0",
      name: { en: "fairy ring" },
      sites: EXAMPLE_SITES,
    },
  },
};

/** target parts with [data-fr="..."] */
export const Themed: StoryObj<Args> = {
  args: Default.args,
  render: ({ config }) => html`
    <style>
      .themed {
        & [data-fr] {
          padding: 0.25em 0.5em;
        }
        & [data-fr="home"] {
          color: #6f42c1;
          font-weight: bolder;
        }
        & a[data-fr] {
          color: white;
          background: #6f42c1;
          box-shadow:
            0 0 0 1px #ffffff,
            0 0 0 3px #6f42c1;
          text-decoration: none;

          &:hover {
            background: #8a63d2;
          }
        }
      }
    </style>
    <fairy-ring class="themed" config-url=${configUrl(config)}></fairy-ring>
  `,
};

/** rearrange parts by redefining the grid areas: prev/home/random/next */
export const Layout: StoryObj<Args> = {
  args: Default.args,
  render: ({ config }) => html`
    <style>
      .stacked {
        grid-template-areas:
          "home home home"
          "prev random next";
        justify-items: center;
      }
    </style>
    <fairy-ring class="stacked" config-url=${configUrl(config)}></fairy-ring>
  `,
};
