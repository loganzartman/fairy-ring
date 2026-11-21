import { render as renderSolid } from "@solidjs/web";
import { createElement } from "react";
import { createRoot as createReactRoot } from "react-dom/client";
import { stringify } from "smol-toml";
import { createComponent, createSignal, createStore, flush } from "solid-js";
import { afterEach, describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { createApp, defineComponent, h, nextTick, ref } from "vue";
import type * as z from "zod/v4-mini";
import { define, FairyRingElement } from "./element";
import type { configSchema } from "./lib";
import { FairyRing as ReactFairyRing } from "./react";
import { FairyRing as SolidFairyRing } from "./solid";
import { FairyRing as VueFairyRing } from "./vue";

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

const DEFAULT_CONFIG_URL = configUrl("fairy ring");
const UPDATED_CONFIG_URL = configUrl("second ring");

const THEMED_CSS = `
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

type WrapperProps = {
  configUrl: string;
  class?: string;
  id?: string;
  hidden?: boolean;
  style?: Record<string, string>;
  "data-test"?: string;
};

type FrameworkHarness = {
  name: string;
  mount: (
    container: HTMLElement,
    initialProps: WrapperProps,
  ) => { update: (props: WrapperProps) => Promise<void> | void; unmount: () => void };
};

const FRAMEWORKS: FrameworkHarness[] = [
  {
    name: "react",
    mount(container, initialProps) {
      const root = createReactRoot(container);
      const render = ({ class: className, ...rest }: WrapperProps) =>
        root.render(createElement(ReactFairyRing, { ...rest, className }));
      render(initialProps);
      return { update: render, unmount: () => root.unmount() };
    },
  },
  {
    name: "solid",
    mount(container, initialProps) {
      const [props, setProps] = createStore<WrapperProps>(initialProps);
      const unmount = renderSolid(() => createComponent(SolidFairyRing, props), container);
      return {
        update(next) {
          setProps(() => next);
          flush();
        },
        unmount,
      };
    },
  },
  {
    name: "vue",
    mount(container, initialProps) {
      const state = ref(initialProps);
      const app = createApp(
        defineComponent({
          setup: () => () => h(VueFairyRing, state.value),
        }),
      );
      app.mount(container);
      return {
        async update(next) {
          state.value = next;
          await nextTick();
        },
        unmount: () => app.unmount(),
      };
    },
  },
];

const cleanups: (() => void)[] = [];

afterEach(() => {
  while (cleanups.length) cleanups.pop()!();
  document.body.replaceChildren();
});

function createMount(css?: string): HTMLDivElement {
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

function mountFramework(fw: FrameworkHarness, props: WrapperProps, css?: string) {
  const mount = createMount(css);
  const { update, unmount } = fw.mount(mount, props);
  cleanups.push(unmount);
  return { mount, update };
}

async function waitForLoaded(
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

function summarizeElement(el: FairyRingElement) {
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

const screenshot = (el: HTMLElement) => page.elementLocator(el).screenshot({ save: false });

const baselines = new Map<
  "default" | "themed",
  { summary: ReturnType<typeof summarizeElement>; screenshot: string }
>();

async function getBaseline(variant: "default" | "themed") {
  const cached = baselines.get(variant);
  if (cached) return cached;

  define();
  const mount = createMount(variant === "themed" ? THEMED_CSS : undefined);
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
    document.body.replaceChildren();
  }
}

describe("framework wrappers match <fairy-ring> element snapshot", () => {
  test.each(FRAMEWORKS)("$name default render matches element screenshot and DOM", async (fw) => {
    const baseline = await getBaseline("default");
    const { mount } = mountFramework(fw, { configUrl: DEFAULT_CONFIG_URL });
    const el = await waitForLoaded(mount);

    expect(el).toBeInstanceOf(FairyRingElement);
    expect(summarizeElement(el)).toEqual(baseline.summary);
    expect(await screenshot(mount)).toBe(baseline.screenshot);
  });

  test.each(FRAMEWORKS)("$name themed render matches element screenshot and DOM", async (fw) => {
    const defaultBaseline = await getBaseline("default");
    const baseline = await getBaseline("themed");
    expect(baseline.screenshot).not.toBe(defaultBaseline.screenshot);

    const { mount } = mountFramework(
      fw,
      { configUrl: DEFAULT_CONFIG_URL, class: "themed" },
      THEMED_CSS,
    );
    const el = await waitForLoaded(mount);

    expect(summarizeElement(el)).toEqual(baseline.summary);
    expect(await screenshot(mount)).toBe(baseline.screenshot);
  });

  test.each(FRAMEWORKS)("$name updates reactively when configUrl changes", async (fw) => {
    const { mount, update } = mountFramework(fw, { configUrl: DEFAULT_CONFIG_URL });
    await waitForLoaded(mount);

    await update({ configUrl: UPDATED_CONFIG_URL });
    const el = await waitForLoaded(mount, "second ring");
    expect(el.getAttribute("config-url")).toBe(UPDATED_CONFIG_URL);
    expect(el.configUrl).toBe(UPDATED_CONFIG_URL);
  });

  test.each(FRAMEWORKS)("$name forwards HTML attributes", async (fw) => {
    const { mount } = mountFramework(fw, {
      configUrl: DEFAULT_CONFIG_URL,
      id: "my-ring",
      hidden: true,
      style: { gap: "2em" },
      "data-test": "ring",
    });
    const el = await waitForLoaded(mount);

    expect(el.id).toBe("my-ring");
    expect(el.hidden).toBe(true);
    expect(getComputedStyle(el).display).toBe("none");
    expect(el.style.gap).toBe("2em");
    expect(el.getAttribute("data-test")).toBe("ring");
  });
});

describe("framework-specific features", () => {
  test("react forwards ref to FairyRingElement", async () => {
    let refEl: FairyRingElement | null = null;
    const mount = createMount();
    const root = createReactRoot(mount);
    cleanups.push(() => root.unmount());

    root.render(
      createElement(ReactFairyRing, {
        configUrl: DEFAULT_CONFIG_URL,
        ref: (el: FairyRingElement | null) => {
          refEl = el;
        },
      }),
    );

    const el = await waitForLoaded(mount);
    expect(refEl).toBe(el);
  });

  test("solid supports ref callbacks and object/array class syntax", async () => {
    let refEl: FairyRingElement | undefined;
    const mount = createMount();
    const [active, setActive] = createSignal(true);
    cleanups.push(
      renderSolid(
        () =>
          createComponent(SolidFairyRing, {
            configUrl: DEFAULT_CONFIG_URL,
            get class() {
              return ["base", { themed: active() }];
            },
            ref: (node) => {
              refEl = node;
            },
          }),
        mount,
      ),
    );

    const el = await waitForLoaded(mount);
    expect(refEl).toBe(el);
    expect(el.className).toBe("base themed");
    setActive(false);
    flush();
    expect(el.className).toBe("base");
  });

  test("vue accepts kebab-case config-url and class object/array bindings", async () => {
    const mount = createMount();
    const active = ref(true);
    const app = createApp(
      defineComponent({
        setup: () => () =>
          h(VueFairyRing, {
            "config-url": DEFAULT_CONFIG_URL,
            class: ["base", { themed: active.value }],
          } as never),
      }),
    );
    app.mount(mount);
    cleanups.push(() => app.unmount());

    const el = await waitForLoaded(mount);
    expect(el.className).toBe("base themed");
    active.value = false;
    await nextTick();
    expect(el.className).toBe("base");
  });
});
