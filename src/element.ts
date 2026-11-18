export class FairyRingElement extends HTMLElement {}

export function define(tagName = "fairy-ring"): void {
  if (!customElements.get(tagName)) customElements.define(tagName, FairyRingElement);
}
