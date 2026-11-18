import { Task } from "@lit/task";
import { css, html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { fetchConfig, getNext, getPrev, getRandom, logConfigErrors } from "./lib";
import { defaultErrorString, defaultLoadingString, localize } from "./strings";

export class FairyRingElement extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: row;
      gap: 1em;

      &.loading {
        display: none;
      }
      &.error {
        display: none;
      }
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
          ${config.options.cssHref ? html`<link rel="stylesheet" href="${config.options.cssHref}" />` : nothing}
          <a class="button button--clickable prev" href=${getPrev(config)?.url ?? ""}
            >${localize(config.strings.previous)}</a
          >
          ${
            config.options.homeUrl
              ? html`<a class="button button--clickable home" href=${config.options.homeUrl}
                  >${config.name}</a
                >`
              : html`<div class="button home">${localize(config.name)}</div>`
          }
          <a class="button button--clickable random" href=${getRandom(config)?.url ?? ""}
            >${localize(config.strings.random)}</a
          >
          <a class="button button--clickable next" href=${getNext(config)?.url ?? ""}
            >${localize(config.strings.next)}</a
          >
        `,
      })}
    `;
  }
}

export function define(tagName = "fairy-ring"): void {
  if (!customElements.get(tagName)) customElements.define(tagName, FairyRingElement);
}
