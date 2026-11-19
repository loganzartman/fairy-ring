import { Task } from "@lit/task";
import { css, html, LitElement, unsafeCSS } from "lit";
import { property } from "lit/decorators.js";
import { fetchConfig, getNext, getPrev, getRandom, logConfigErrors } from "./lib";
import { defaultErrorString, defaultLoadingString, localize } from "./strings";

export class FairyRingElement extends LitElement {
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

  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      ${this.#config.render({
        pending: () => html`<div data-fr="loading">${localize(defaultLoadingString)}</div>`,
        error: () => html`<div data-fr="error">${localize(defaultErrorString)}</div>`,
        complete: (config) => html`
          <a data-fr="prev" rel="prev" href=${getPrev(config)?.url ?? ""}
            >${localize(config.strings.previous)}</a
          >
          ${
            config.homeUrl
              ? html`<a data-fr="home" href=${config.homeUrl}>${config.name}</a>`
              : html`<div data-fr="home">${localize(config.name)}</div>`
          }
          <a data-fr="random" href=${getRandom(config)?.url ?? ""}
            >${localize(config.strings.random)}</a
          >
          <a data-fr="next" rel="next" href=${getNext(config)?.url ?? ""}
            >${localize(config.strings.next)}</a
          >
        `,
      })}
    `;
  }
}

function baseStyles(tagName: string): CSSStyleSheet {
  const tag = unsafeCSS(tagName);
  // layer allows ordering before other CSS libraries that use layers, e.g. tailwind.
  // :where sets zero specificity, so any user-defined rules override these ones by default.
  return css`
    @layer fairy-ring {
      :where(${tag}) {
        display: grid;
        grid-template-areas: "prev home random next";
        justify-content: start;
        align-items: center;
        gap: 1em;
        font-family: system-ui, sans-serif;

        & :where([data-fr="prev"]) {
          grid-area: prev;
        }
        & :where([data-fr="home"]) {
          grid-area: home;
        }
        & :where([data-fr="random"]) {
          grid-area: random;
        }
        & :where([data-fr="next"]) {
          grid-area: next;
        }
        & :where([data-fr="loading"], [data-fr="error"]) {
          display: none;
        }
      }
    }
  `.styleSheet!;
}

export function define(tagName = "fairy-ring"): void {
  if (customElements.get(tagName)) return;
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, baseStyles(tagName)];
  customElements.define(tagName, FairyRingElement);
}
