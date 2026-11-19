import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { stringify } from "smol-toml";
import { expect, waitFor } from "storybook/test";
import type * as z from "zod/v4-mini";
import { dedent } from "./docs/docs";
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
  parameters: {
    docs: {
      source: {
        // stories inline the config as a data: URL. in the Code tab, show it as a TOML file
        // in a comment and point config-url at a realistic URL instead.
        transform: (code: string, { args }: { args: Args }) =>
          `<!-- fairy-ring.toml\n${stringify(args.config).trim()}\n-->\n` +
          dedent(code).replace(
            /config-url="data:[^"]*"/g,
            'config-url="https://your-site.example/fairy-ring.toml"',
          ),
      },
    },
  },
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

export const Icons: StoryObj<Args> = {
  args: Default.args,
  render: ({ config }) => html`
    <style>
      .icons {
        --cream: #f3e9d2;
        --dark: #34302b;
        width: fit-content;
        padding: 0.5em 0.75em;
        border-radius: 999px;
        background: var(--dark);
        color: var(--cream);

        & [data-fr="home"] {
          color: inherit;
          font-weight: 600;
        }
        & :is([data-fr="prev"], [data-fr="random"], [data-fr="next"]) {
          --icon-size: 0.75em;
          position: relative;
          width: 2.25em;
          height: 2.25em;
          border: 2px solid currentColor;
          border-radius: 50%;
          color: inherit;
          /* hide the text visually; it stays the accessible name */
          overflow: hidden;
          white-space: nowrap;
          text-indent: 100%;

          &::before {
            content: "";
            position: absolute; /* not shifted by text-indent */
            inset: 0;
            margin: auto;
            width: var(--icon-size);
            height: var(--icon-size);
            background: currentColor;
            mask: var(--icon) center / contain no-repeat;
          }
          &:hover {
            background: var(--cream);
            color: var(--dark);
          }
          &:focus-visible {
            outline: 2px solid var(--cream);
            outline-offset: 2px;
          }
        }
        & :is([data-fr="prev"], [data-fr="next"]) {
          --icon: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><path d='M1 0L10 5L1 10Z'/></svg>");
        }
        & [data-fr="prev"]::before {
          scale: -1 1;
        }
        & [data-fr="random"] {
          /* shuffle: two crossing lines with arrowheads. sized up since it doesn't fill its box */
          --icon-size: 0.9em;
          --icon: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><path d='M0.5 2.5H2.5L5.5 7.5H7M0.5 7.5H2.5L5.5 2.5H7' fill='none' stroke='black' stroke-width='1.5' stroke-linejoin='round'/><path d='M6.75 0.5L9.5 2.5L6.75 4.5ZM6.75 5.5L9.5 7.5L6.75 9.5Z'/></svg>");
        }
      }
    </style>
    <fairy-ring class="icons" config-url=${configUrl(config)}></fairy-ring>
  `,
};
