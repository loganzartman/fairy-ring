import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { parse as parseToml } from "smol-toml";
import { code, docsStyles, storyLink } from "./docs";
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
  title: "docs/getting started",
  tags: ["!test"],
  // hide the addons panel (controls etc.); nothing to control on a docs page
  parameters: { options: { showPanel: false } },
};
export default meta;

export const GettingStarted: StoryObj = {
  name: "getting started",
  render: () =>
    html`${docsStyles}
      <article>
        <h2>getting started</h2>
        <p>
          fairy-ring shows navigation for your webring with a tiny code snippet. it needs a
          configuration file to know what your webring is called, what sites are in it, and even how
          you want to style it. here's how to build a webring with fairy-ring:
        </p>

        <h2>1. write a config</h2>
        <p>
          create a TOML file listing the sites in your ring. sites are linked in the order they
          appear.
        </p>
        ${code(minimalConfig, "toml")}
        <p>see ${storyLink("docs-config--config", "config")} for all options.</p>

        <h2>2. host it</h2>
        <p>
          put the file somewhere public, like your own website or a github pages site. if you're
          hosting your own, you need to allow CORS requests from the member sites.
        </p>

        <h2>3. embed it</h2>
        <p>each member should add this snippet wherever they want to show the ring navigation:</p>
        ${code(
          `
<script type="module" src="https://cdn.jsdelivr.net/npm/fairy-ring/dist/standalone.js"></script>
<fairy-ring config-url="https://your-site.example/fairy-ring.toml"></fairy-ring>
`,
          "html",
        )}
        <p>
          fairy-ring figures out which site it's on by matching the page URL against
          <code>sites</code>. the snippet is the same for everyone.
        </p>

        <h2>using a bundler</h2>
        <p>install the package and register the element once, then use it like any other tag:</p>
        ${code("pnpm install fairy-ring", "sh")}
        ${code(
          `
import { define } from "fairy-ring/element";

define(); // registers <fairy-ring>
`,
          "js",
        )}
      </article>`,
};
