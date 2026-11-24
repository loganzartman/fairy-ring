import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vitest";
import { FairyRingElement } from "../element/fairy-ring";
import { FairyRing, type FairyRingProps } from "./fairy-ring";
import {
  createMount,
  DEFAULT_CONFIG_URL,
  getBaseline,
  screenshot,
  summarizeElement,
  THEMED_CSS,
  UPDATED_CONFIG_URL,
  waitForLoaded,
} from "../test-utils";

type ReactTestProps = FairyRingProps & { "data-test"?: string };

const cleanups: (() => void)[] = [];

afterEach(() => {
  while (cleanups.length) cleanups.pop()!();
  document.body.replaceChildren();
});

function mountReact(props: ReactTestProps, css?: string) {
  const mount = createMount(css);
  const root = createRoot(mount);
  const update = (next: ReactTestProps) => root.render(createElement(FairyRing, next));
  update(props);
  cleanups.push(() => root.unmount());
  return { mount, update };
}

test("default render matches element screenshot and DOM", async () => {
  const { mount } = mountReact({ configUrl: DEFAULT_CONFIG_URL });
  const el = await waitForLoaded(mount);

  expect(el).toBeInstanceOf(FairyRingElement);
  const summary = summarizeElement(el);
  const image = await screenshot(mount);

  const baseline = await getBaseline("default");
  expect(summary).toEqual(baseline.summary);
  expect(image).toBe(baseline.screenshot);
});

test("themed render matches element screenshot and DOM", async () => {
  const defaultBaseline = await getBaseline("default");
  const baseline = await getBaseline("themed");
  expect(baseline.screenshot).not.toBe(defaultBaseline.screenshot);

  const { mount } = mountReact({ configUrl: DEFAULT_CONFIG_URL, className: "themed" }, THEMED_CSS);
  const el = await waitForLoaded(mount);

  expect(summarizeElement(el)).toEqual(baseline.summary);
  expect(await screenshot(mount)).toBe(baseline.screenshot);
});

test("updates reactively when configUrl changes", async () => {
  const { mount, update } = mountReact({ configUrl: DEFAULT_CONFIG_URL });
  await waitForLoaded(mount);

  update({ configUrl: UPDATED_CONFIG_URL });
  const el = await waitForLoaded(mount, "second ring");
  expect(el.getAttribute("config-url")).toBe(UPDATED_CONFIG_URL);
  expect(el.configUrl).toBe(UPDATED_CONFIG_URL);
});

test("forwards HTML attributes", async () => {
  const { mount } = mountReact({
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

test("forwards ref to FairyRingElement", async () => {
  let refEl: FairyRingElement | null = null;
  const { mount } = mountReact({
    configUrl: DEFAULT_CONFIG_URL,
    ref: (el) => {
      refEl = el;
    },
  });

  const el = await waitForLoaded(mount);
  expect(refEl).toBe(el);
});
