import { Task } from "@lit/task";
import { css, html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { fetchConfig, getNext, getPrev, getRandom, logConfigErrors } from "./lib";
import { defaultErrorString, defaultLoadingString, localize } from "./strings";

export class FairyRingElement extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: row;
      gap: 1em;
    }
  `;

  @property({ attribute: "config-url" }) configUrl?: string;

  #config = new Task(this, {
    args: () => [this.configUrl],
    task: async ([url], { signal }) => {
      if (!url) {
        throw new Error("missing config-url");
      }
      return logConfigErrors(fetchConfig({ url, init: { signal } }));
    },
  });

  render() {
    return html`
      ${this.#config.render({
        pending: () => html`<div class="loading">${localize(defaultLoadingString)}</div>`,
        error: () => html`<div class="error">${localize(defaultErrorString)}</div>`,
        complete: (config) => html`
          <a class="prev" href=${getPrev(config)?.url ?? ""}
            >${localize(config.strings.previous)}</a
          >
          ${
            config.options.homeUrl
              ? html`<a class="home" href=${config.options.homeUrl}>${config.name}</a>`
              : html`<div>${localize(config.name)}</div>`
          }
          <a class="random" href=${getRandom(config)?.url ?? ""}
            >${localize(config.strings.random)}</a
          >
          <a class="next" href=${getNext(config)?.url ?? ""}>${localize(config.strings.next)}</a>
        `,
      })}
    `;
  }
}

export function define(tagName = "fairy-ring"): void {
  if (!customElements.get(tagName)) customElements.define(tagName, FairyRingElement);
}
