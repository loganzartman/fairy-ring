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
              &::part(widget) {
                font-family: cursive;
                color: purple;
              }
              &::part(prev) {
                background: red;
              }
              &::part(next) {
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
        <p>
          fairy-ring renders inside a shadow root, so page styles can't reach its internals by
          accident. style the element itself with any selector, and its pieces with
          <code>::part()</code> after that selector, like <code>.my-ring::part(prev)</code>.
        </p>
        <table>
          <tr>
            <th>selector</th>
            <th>element</th>
            <th>description</th>
          </tr>
          <tr>
            <td><code>.my-ring</code></td>
            <td><code>&lt;fairy-ring&gt;</code></td>
            <td>the container. a grid with areas <code>prev home random next</code>.</td>
          </tr>
          <tr>
            <td><code>::part(widget)</code></td>
            <td></td>
            <td>
              every visible piece: <code>prev</code>, <code>home</code>, <code>random</code>,
              <code>next</code>.
            </td>
          </tr>
          <tr>
            <td><code>::part(link)</code></td>
            <td></td>
            <td>
              every link: <code>prev</code>, <code>random</code>, <code>next</code>, and
              <code>home</code> if <code>homeUrl</code> is set.
            </td>
          </tr>
          <tr>
            <td><code>::part(prev)</code></td>
            <td><code>&lt;a&gt;</code></td>
            <td>link to the previous site.</td>
          </tr>
          <tr>
            <td><code>::part(home)</code></td>
            <td><code>&lt;a&gt;</code> or <code>&lt;div&gt;</code></td>
            <td>the ring's name. a link if <code>homeUrl</code> is set.</td>
          </tr>
          <tr>
            <td><code>::part(random)</code></td>
            <td><code>&lt;a&gt;</code></td>
            <td>link to a random site.</td>
          </tr>
          <tr>
            <td><code>::part(next)</code></td>
            <td><code>&lt;a&gt;</code></td>
            <td>link to the next site.</td>
          </tr>
          <tr>
            <td><code>::part(loading)</code></td>
            <td><code>&lt;div&gt;</code></td>
            <td>shown while the config loads. hidden by default.</td>
          </tr>
          <tr>
            <td><code>::part(error)</code></td>
            <td><code>&lt;div&gt;</code></td>
            <td>shown if the config fails to load. hidden by default.</td>
          </tr>
        </table>
      </article>`,
};
