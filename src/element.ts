import { Task } from "@lit/task";
import { css, html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { fetchConfig, getNext, getPrev, getRandom, logConfigErrors } from "./lib";
import { defaultErrorString, defaultLoadingString, type LocString } from "./strings";
import { renderTemplate } from "./template";

export class FairyRingElement extends LitElement {
  @property({ attribute: "config-url" }) configUrl?: string;

  static styles = css`
    :host {
      display: grid;
      grid-template-areas: "prev home random next";
      justify-content: start;
      align-items: center;
      gap: 1em;

      &::part(prev) {
        grid-area: prev;
      }
      &::part(home) {
        grid-area: home;
      }
      &::part(random) {
        grid-area: random;
      }
      &::part(next) {
        grid-area: next;
      }
      &::part(loading),
      &::part(error) {
        display: none;
      }
    }

    :host([hidden]) {
      display: none;
    }

    /* match the surrounding text instead of the browser's default link blue/purple */
    a {
      color: inherit;
    }
  `;

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
        pending: () => html`<div part="loading">${renderTemplate(defaultLoadingString, {})}</div>`,
        error: () => html`<div part="error">${renderTemplate(defaultErrorString, {})}</div>`,
        complete: (config) => {
          const r = (s: LocString) => renderTemplate(s, { name: config.name });

          return html`
            <a part="prev link widget" rel="prev" href=${getPrev(config)?.url ?? ""}
              >${r(config.strings.previous)}</a
            >
            ${
              config.homeUrl
                ? html`<a part="home link widget" href=${config.homeUrl}>${r(config.homeText)}</a>`
                : html`<div part="home widget">${r(config.homeText)}</div>`
            }
            <a part="random link widget" href=${getRandom(config)?.url ?? ""}
              >${r(config.strings.random)}</a
            >
            <a part="next link widget" rel="next" href=${getNext(config)?.url ?? ""}
              >${r(config.strings.next)}</a
            >
          `;
        },
      })}
    `;
  }
}

export function define(tagName = "fairy-ring"): void {
  if (customElements.get(tagName)) return;
  customElements.define(tagName, FairyRingElement);
}
