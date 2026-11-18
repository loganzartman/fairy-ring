import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import { parse as parseToml } from "smol-toml";
import * as z from "zod/v4-mini";
import { code, docsStyles } from "./docs";
import { configSchema } from "../lib";

type JSONSchema = z.core.JSONSchema.JSONSchema;

/** human-readable type; named schemas ($ref) become links to their section */
function type(s: JSONSchema): TemplateResult | string {
  if (s.$ref) {
    const name = s.$ref.replace("#/$defs/", "");
    return html`<a href="#${name}" target="_self">${name}</a>`;
  }
  if (s.type === "array") return html`${type(s.items as JSONSchema)}[]`;
  return s.enum?.map((v) => JSON.stringify(v)).join(" | ") ?? String(s.type);
}

function section(name: string, s: JSONSchema): TemplateResult {
  const rows = Object.entries(s.properties ?? {}).map(([key, p]) => ({
    key,
    field: p as JSONSchema,
    optional: !s.required?.includes(key),
  }));
  // records (e.g. LocString): one row with a placeholder key like <language>
  if (typeof s.additionalProperties === "object") {
    const keyName = (s.propertyNames as JSONSchema | undefined)?.title ?? "key";
    rows.push({ key: `<${keyName}>`, field: s.additionalProperties, optional: false });
  }
  return html`<h2 id=${name}>${name}</h2>
    ${s.description ? html`<p>${s.description}</p>` : ""}
    ${
      rows.length
        ? html`<table>
            <tr>
              <th>name</th>
              <th>type</th>
              <th>description</th>
            </tr>
            ${rows.map(
              ({ key, field, optional }) =>
                html`<tr>
                  <td><code>${key}</code></td>
                  <td><code>${type(field)}</code>${optional ? " (optional)" : ""}</td>
                  <td>${field.description}</td>
                </tr>`,
            )}
          </table>`
        : ""
    }`;
}

const example = `version = "0.0"
name = { en = "Example ring", es = "Anillo de ejemplo" }

[[sites]]
url = "https://alice.example.com"
scope = "host"

[[sites]]
url = "https://example.org/~bob/"
scope = "path"

[options]
homeUrl = "https://ring.example.com"
showRandom = true
cssHref = "https://ring.example.com/fairy-ring.css"

[strings]
next = { en = "next →", es = "siguiente →" }
previous = { en = "← prev", es = "← anterior" }
random = { en = "random", es = "aleatorio" }
`;
// fail loudly if the example drifts out of sync with the schema
configSchema.parse(parseToml(example));

const meta: Meta = {
  title: "docs/config",
  tags: ["!test"],
  // hide the addons panel (controls etc.); nothing to control on a docs page
  parameters: { options: { showPanel: false } },
};
export default meta;

export const Config: StoryObj = {
  name: "config",
  render: () => {
    const { $defs = {}, ...root } = z.toJSONSchema(configSchema, { io: "input" });
    return html`${docsStyles}
      <article>
        <h2>configuring fairy-ring</h2>
        <p>
          the configuration is written in
          <a target="_blank" href="https://toml.io/" rel="noopener noreferrer">TOML</a>. you need to
          host the configuration somewhere public, like on your own website, or a shared website
          specific to your webring. you could deploy a github pages site and manage the
          configuration on github.
        </p>
        <p>
          the configuration is provided to the <code>&lt;fairy-ring&gt;</code> element via the
          <code>config-url</code> attribute.
        </p>
      </article>
      <article>
        <h2 id="Example">example</h2>
        ${code(example, "toml")} ${section("Config", root)}
        ${Object.entries($defs).map(([name, s]) => section(name, s as JSONSchema))}
      </article>`;
  },
};
