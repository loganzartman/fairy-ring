import type { Meta, StoryObj } from "@storybook/web-components-vite";
import hljs from "highlight.js/lib/core";
import ini from "highlight.js/lib/languages/ini";
import { html, type TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { parse as parseToml } from "smol-toml";
import * as z from "zod/v4-mini";
import { configSchema } from "./lib";

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

hljs.registerLanguage("ini", ini); // highlight.js's ini grammar covers TOML
const exampleHtml = hljs.highlight(example, { language: "ini" }).value;

const meta: Meta = { title: "Docs/Config reference", tags: ["!test"] };
export default meta;

export const ConfigReference: StoryObj = {
  name: "Config reference",
  render: () => {
    const { $defs = {}, ...root } = z.toJSONSchema(configSchema, { io: "input" });
    return html`<style>
        article {
          font:
            15px/1.5 system-ui,
            sans-serif;
          max-width: 960px;
          color: #222;
        }
        h2 {
          font-size: 1.25em;
          margin: 2em 0 0.5em;
          scroll-margin-top: 0.5em;
        }
        h2:first-child {
          margin-top: 0;
        }
        h2:target {
          background: #fff3c4;
          outline: 0.25em solid #fff3c4;
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th,
        td {
          border: 1px solid #ddd;
          padding: 0.4em 0.75em;
          text-align: left;
          vertical-align: top;
        }
        th {
          background: #f5f5f5;
          font-weight: 600;
        }
        td:nth-child(-n + 2) {
          white-space: nowrap;
        }
        th:last-child {
          width: 100%;
        }
        code {
          font-size: 0.9em;
        }
        pre {
          background: #f5f5f5;
          border: 1px solid #ddd;
          padding: 0.75em 1em;
          overflow-x: auto;
        }
        .hljs-section {
          color: #6f42c1;
          font-weight: 600;
        }
        .hljs-attr {
          color: #005cc5;
        }
        .hljs-string {
          color: #22863a;
        }
        .hljs-literal,
        .hljs-number {
          color: #d73a49;
        }
        .hljs-comment {
          color: #6a737d;
        }
      </style>
      <article>
        <h2 id="Example">Example</h2>
        <pre><code>${unsafeHTML(exampleHtml)}</code></pre>
        ${section("Config", root)}
        ${Object.entries($defs).map(([name, s]) => section(name, s as JSONSchema))}
      </article>`;
  },
};
