import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { parse as parseToml } from "smol-toml";
import { code, dedent, docsStyles, storyLink } from "./docs";
import { configSchema } from "../lib";

const minimalConfig = `
#:schema https://cdn.jsdelivr.net/npm/fairy-ring/dist/config.schema.json

configVersion = 1
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
};
export default meta;

export const GettingStarted: StoryObj = {
  name: "getting started",
  render: () =>
    html`${docsStyles}
      <article>
        <h2>getting started</h2>
        <p>
          fairy-ring shows navigation for your webring with a tiny code snippet. here's how to build
          a webring with fairy-ring:
        </p>

        <h3>1. write a config</h3>
        <p>
          create a
          <a target="_blank" rel="noopener noreferrer" href="https://toml.io/">TOML</a> file listing
          the sites in your ring. sites are linked in the order they appear.
        </p>
        ${code(minimalConfig, "toml")}
        <p>
          you can configure some other things, too. see
          ${storyLink("docs-config--config", "config")} for all options.
        </p>

        <h3>2. host it</h3>
        <p>
          put the file somewhere public, like your own website or a github pages site. if you're
          hosting your own, you need to allow CORS requests from the member sites.
        </p>

        <h3>3. embed it</h3>
        <p>each member should add this snippet wherever they want to show the ring navigation:</p>
        ${code(
          dedent`
            <script type="module" src="https://cdn.jsdelivr.net/npm/fairy-ring/dist/standalone.js"></script>
            <fairy-ring class="my-ring" config-url="https://my-ring.example/fairy-ring.toml"></fairy-ring>
          `,
          "html",
        )}
        <p>
          fairy-ring figures out which site it's on by matching the page URL against
          <code>sites</code>. the snippet is the same for everyone.
        </p>

        <h3>4. create a theme</h3>
        <p>
          fairy-ring comes with only the most bare-bones of styling. you can add more styles using
          CSS:
        </p>
        ${code(
          dedent`
            .my-ring::part(link) {
              padding: 8px;
            }
            .my-ring::part(next) {
              color: purple;
            }
          `,
          "css",
        )}
        <p>
          you can learn more about theming here: ${storyLink("docs-theming--theming", "theming")}.
        </p>
        <p>
          as a ring owner, you can host this in the same place as your .toml file and share it with
          your ring members:
        </p>
        ${code(
          dedent`
            <script type="module" src="https://cdn.jsdelivr.net/npm/fairy-ring/dist/standalone.js"></script>
            <link rel="stylesheet" href="https://my-ring.example/fairy-ring.css">
            <fairy-ring class="my-ring" config-url="https://my-ring.example/fairy-ring.toml"></fairy-ring>
          `,
          "html",
        )}
        <p>as a ring member, you can write your own styles too!</p>

        <h2>using a bundler</h2>
        <p>install the package and register the element once, then use it like any other tag:</p>
        ${code("pnpm install fairy-ring", "sh")}
        ${code(
          dedent`
            import { define } from "fairy-ring/element";

            define(); // registers <fairy-ring>
          `,
          "js",
        )}
      </article>`,
};
