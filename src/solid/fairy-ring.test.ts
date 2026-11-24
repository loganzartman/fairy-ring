import { render } from "@solidjs/web";
import { createComponent, createSignal, createStore, flush } from "solid-js";
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

type SolidTestProps = FairyRingProps & { "data-test"?: string };

const cleanups: (() => void)[] = [];

afterEach(() => {
  while (cleanups.length) cleanups.pop()!();
  document.body.replaceChildren();
});

function mountSolid(initialProps: SolidTestProps, css?: string) {
  const mount = createMount(css);
  const [props, setProps] = createStore<SolidTestProps>(initialProps);
  cleanups.push(render(() => createComponent(FairyRing, props), mount));
  return {
    mount,
    update(next: SolidTestProps) {
      setProps(() => next);
      flush();
    },
  };
}

test("default render matches element screenshot and DOM", async () => {
  const { mount } = mountSolid({ configUrl: DEFAULT_CONFIG_URL });
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

  const { mount } = mountSolid({ configUrl: DEFAULT_CONFIG_URL, class: "themed" }, THEMED_CSS);
  const el = await waitForLoaded(mount);

  expect(summarizeElement(el)).toEqual(baseline.summary);
  expect(await screenshot(mount)).toBe(baseline.screenshot);
});

test("updates reactively when configUrl changes", async () => {
  const { mount, update } = mountSolid({ configUrl: DEFAULT_CONFIG_URL });
  await waitForLoaded(mount);

  update({ configUrl: UPDATED_CONFIG_URL });
  const el = await waitForLoaded(mount, "second ring");
  expect(el.getAttribute("config-url")).toBe(UPDATED_CONFIG_URL);
  expect(el.configUrl).toBe(UPDATED_CONFIG_URL);
});

test("forwards HTML attributes", async () => {
  const { mount } = mountSolid({
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

test("supports ref callbacks and object/array class syntax", async () => {
  let refEl: FairyRingElement | undefined;
  const mount = createMount();
  const [active, setActive] = createSignal(true);
  cleanups.push(
    render(
      () =>
        createComponent(FairyRing, {
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
