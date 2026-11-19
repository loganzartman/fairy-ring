import { html, nothing, type TemplateResult } from "lit";
import { localize, type LocString } from "./strings";
import { isTemplateResult } from "lit/directive-helpers.js";

export function renderTemplate(
  template: LocString,
  values: Record<string, string | LocString | TemplateResult | typeof nothing>,
): TemplateResult {
  const localized = localize(template);
  const parts = localized.split(/\{\{\s*(\w+)\s*\}\}/).map((s, i) => {
    const isKey = i % 2 === 1;
    if (isKey) {
      const value = Object.hasOwn(values, s) ? values[s] : undefined;
      if (isTemplateResult(value)) {
        return value;
      }
      if (typeof value === "object") {
        return localize(value);
      }
      if (value !== undefined) {
        return value;
      }
      console.error("[fairy-ring] unknown template key:", s);
      return nothing;
    } else {
      return s;
    }
  });
  return html`${parts}`;
}
