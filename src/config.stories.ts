import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html, type TemplateResult } from "lit";
import * as z from "zod/v4-mini";
import { configSchema } from "./lib";

type JSONSchema = z.core.JSONSchema.JSONSchema;

/** human-readable type; named schemas ($ref) become links to their section */
function type(s: JSONSchema): TemplateResult | string {
  if (s.$ref) {
    const name = s.$ref.replace("#/$defs/", "");
    return html`<a href="#${name}">${name}</a>`;
  }
  if (s.type === "array") return html`${type(s.items as JSONSchema)}[]`;
  return s.enum?.map((v) => JSON.stringify(v)).join(" | ") ?? String(s.type);
}

function section(name: string, s: JSONSchema): TemplateResult {
  return html`<h2 id=${name}>${name}</h2>
    ${s.description ? html`<p>${s.description}</p>` : ""}
    ${
      s.properties
        ? html`<table>
            <tr>
              <th>name</th>
              <th>type</th>
              <th>description</th>
            </tr>
            ${Object.entries(s.properties).map(([key, p]) => {
              const field = p as JSONSchema;
              const optional = s.required?.includes(key) ? "" : " (optional)";
              return html`<tr>
                <td><code>${key}</code></td>
                <td><code>${type(field)}</code>${optional}</td>
                <td>${field.description}</td>
              </tr>`;
            })}
          </table>`
        : ""
    }`;
}

const meta: Meta = { title: "Docs/Config reference", tags: ["!test"] };
export default meta;

export const ConfigReference: StoryObj = {
  name: "Config reference",
  render: () => {
    const { $defs = {}, ...root } = z.toJSONSchema(configSchema, { io: "input" });
    return html`${section("Config", root)}
    ${Object.entries($defs).map(([name, s]) => section(name, s as JSONSchema))}`;
  },
};
