import { stringify } from "smol-toml";
import { expect } from "vitest";
import { page } from "vitest/browser";
import type * as z from "zod/v4-mini";
import { define, type FairyRingElement } from "./element";
import type { configSchema } from "./lib";

type ConfigInput = z.input<typeof configSchema>;

function configUrl(name: string): string {
  const config: ConfigInput = {
    configVersion: 1,
    name: { en: name },
    sites: [
      { url: "https://example.com", scope: "host" },
      { url: location.origin, scope: "host" },
      { url: "https://example.org", scope: "host" },
    ],
  };
  return `data:application/toml,${encodeURIComponent(stringify(config))}`;
}

export const DEFAULT_CONFIG_URL = configUrl("fairy ring");
export const UPDATED_CONFIG_URL = configUrl("second ring");

export const THEMED_CSS = `
  .themed {
    &::part(widget) {
      padding: 0.25em 0.5em;
    }
    &::part(home) {
      color: #6f42c1;
      font-weight: bolder;
    }
    &::part(link) {
      color: white;
      background: #6f42c1;
      box-shadow:
        0 0 0 1px #ffffff,
        0 0 0 3px #6f42c1;
      text-decoration: none;
    }
  }
`;

export function createMount(css?: string): HTMLDivElement {
  if (css) {
    const style = document.createElement("style");
    style.textContent = css;
    document.body.append(style);
  }
  const mount = document.createElement("div");
  mount.style.fontFamily = "system-ui, sans-serif";
  mount.style.width = "600px";
  document.body.append(mount);
  return mount;
}

export async function waitForLoaded(
  root: ParentNode,
  expectedHome = "fairy ring",
): Promise<FairyRingElement> {
  await expect
    .poll(() =>
      root
        .querySelector("fairy-ring")
        ?.shadowRoot?.querySelector('[part~="home"]')
        ?.textContent?.trim(),
    )
    .toBe(expectedHome);
  return root.querySelector("fairy-ring")!;
}

export function summarizeElement(el: FairyRingElement) {
  const part = (name: string) => {
    const node = el.shadowRoot?.querySelector(`[part~="${name}"]`);
    return {
      tag: node?.tagName ?? null,
      part: node?.getAttribute("part") ?? null,
      text: node?.textContent?.trim() ?? null,
      // `random` picks a non-deterministic site on each render
      href: name === "random" ? null : (node?.getAttribute("href") ?? null),
    };
  };

  return {
    tagName: el.tagName,
    configUrl: el.getAttribute("config-url"),
    className: el.className,
    parts: {
      prev: part("prev"),
      home: part("home"),
      random: part("random"),
      next: part("next"),
    },
  };
}

export const screenshot = (el: HTMLElement) => page.elementLocator(el).screenshot({ save: false });

type Baseline = { summary: ReturnType<typeof summarizeElement>; screenshot: string };
const baselines = new Map<"default" | "themed", Baseline>();

export async function getBaseline(variant: "default" | "themed"): Promise<Baseline> {
  const cached = baselines.get(variant);
  if (cached) return cached;

  define();
  const style =
    variant === "themed"
      ? Object.assign(document.createElement("style"), { textContent: THEMED_CSS })
      : undefined;
  if (style) document.body.append(style);
  const mount = createMount();
  try {
    const el = document.createElement("fairy-ring");
    el.setAttribute("config-url", DEFAULT_CONFIG_URL);
    if (variant === "themed") el.className = "themed";
    mount.append(el);
    await waitForLoaded(mount);

    const baseline = { summary: summarizeElement(el), screenshot: await screenshot(mount) };
    baselines.set(variant, baseline);
    return baseline;
  } finally {
    mount.remove();
    style?.remove();
  }
}
