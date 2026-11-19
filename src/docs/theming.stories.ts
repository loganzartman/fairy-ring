import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { parse as parseToml } from "smol-toml";
import { code, dedent, docsStyles } from "./docs";
import { configSchema } from "../lib";

const minimalConfig = `
version = "0.0"
name = { en = "my webring" }

[[sites]]
url = "https://alice.example.com"
scope = "host"

[[sites]]
url = "https://bob.example.net"
scope = "host"
`;
// fail loudly if the example drifts out of sync with the schema
configSchema.parse(parseToml(minimalConfig));

const meta: Meta = {
  title: "docs/theming",
  tags: ["!test"],
};
export default meta;

export const Theming: StoryObj = {
  name: "theming",
  render: () =>
    html`${docsStyles}
      <article>
        <h2>theming</h2>
        <p>
          fairy-ring is a "headless" component, meaning it doesn't include an opinionated theme.
          instead, you can write your own!
        </p>
        <p>there are two approaches that you can mix and match:</p>
        <ol>
          <li>your ring shares a theme</li>
          <li>each ring member writes their own theme</li>
        </ol>
        <p>themes are just CSS:</p>
        ${code(
          dedent`
            /* my-ring.css */
            .my-ring {
              & [data-fr] {
                font-family: cursive;
                color: purple;
              }
              & [data-fr="prev"] {
                background: red;
              }
              & [data-fr="next"] {
                background: green;
              }
            }
          `,
          "css",
        )}
        ${code(
          dedent`
            <script type="module" src="https://cdn.jsdelivr.net/npm/fairy-ring/dist/standalone.js"></script>
            <link rel="stylesheet" href="https://my-ring.example/fairy-ring.css">
            <fairy-ring class="my-ring" config-url="https://my-ring.example/fairy-ring.toml"></fairy-ring> 
          `,
          "html",
        )}
        <p>
          you can host a stylesheet for your members to load, and/or they can add their own styles.
        </p>
        <h2>css selectors</h2>
        <table>
          <tr>
            <th>selector</th>
            <th>element</th>
            <th>description</th>
          </tr>
          <tr>
            <td><code>fairy-ring</code></td>
            <td><code>&lt;fairy-ring&gt;</code></td>
            <td>the container. a grid with areas <code>prev home random next</code>.</td>
          </tr>
          <tr>
            <td><code>[data-fr]</code></td>
            <td></td>
            <td>every part below.</td>
          </tr>
          <tr>
            <td><code>[data-fr="prev"]</code></td>
            <td><code>&lt;a&gt;</code></td>
            <td>link to the previous site.</td>
          </tr>
          <tr>
            <td><code>[data-fr="home"]</code></td>
            <td><code>&lt;a&gt;</code> or <code>&lt;div&gt;</code></td>
            <td>the ring's name. a link if <code>homeUrl</code> is set.</td>
          </tr>
          <tr>
            <td><code>[data-fr="random"]</code></td>
            <td><code>&lt;a&gt;</code></td>
            <td>link to a random site.</td>
          </tr>
          <tr>
            <td><code>[data-fr="next"]</code></td>
            <td><code>&lt;a&gt;</code></td>
            <td>link to the next site.</td>
          </tr>
          <tr>
            <td><code>[data-fr="loading"]</code></td>
            <td><code>&lt;div&gt;</code></td>
            <td>shown while the config loads. hidden by default.</td>
          </tr>
          <tr>
            <td><code>[data-fr="error"]</code></td>
            <td><code>&lt;div&gt;</code></td>
            <td>shown if the config fails to load. hidden by default.</td>
          </tr>
        </table>
        <h2>tailwind compatibility</h2>
        <p>
          if you're using a CSS framework like tailwind that uses CSS @layer directives,
          fairy-ring's base styles will override it by default.
        </p>
        <p>the fix is to define the layer order before importing tailwind:</p>
        ${code(
          dedent`
            @layer theme, base, fairy-ring, components, utilities;
            @import "tailwindcss";
          `,
          "css",
        )}
      </article>`,
};
