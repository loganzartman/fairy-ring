import { afterEach, expect, test } from "vitest";
import { createApp, defineComponent, h, nextTick, ref } from "vue";
import { FairyRingElement } from "../element/fairy-ring";
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
import { FairyRing, type FairyRingProps } from "./fairy-ring";

type VueTestProps = FairyRingProps & Record<string, unknown>;

const cleanups: (() => void)[] = [];

afterEach(() => {
  while (cleanups.length) cleanups.pop()!();
  document.body.replaceChildren();
});

function mountVue(initialProps: VueTestProps, css?: string) {
  const mount = createMount(css);
  const state = ref(initialProps);
  const app = createApp(
    defineComponent({
      setup: () => () => h(FairyRing, state.value),
    }),
  );
  app.mount(mount);
  cleanups.push(() => app.unmount());
  return {
    mount,
    async update(next: VueTestProps) {
      state.value = next;
      await nextTick();
    },
  };
}

test("default render matches element screenshot and DOM", async () => {
  const { mount } = mountVue({ configUrl: DEFAULT_CONFIG_URL });
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

  const { mount } = mountVue({ configUrl: DEFAULT_CONFIG_URL, class: "themed" }, THEMED_CSS);
  const el = await waitForLoaded(mount);

  expect(summarizeElement(el)).toEqual(baseline.summary);
  expect(await screenshot(mount)).toBe(baseline.screenshot);
});

test("updates reactively when configUrl changes", async () => {
  const { mount, update } = mountVue({ configUrl: DEFAULT_CONFIG_URL });
  await waitForLoaded(mount);

  await update({ configUrl: UPDATED_CONFIG_URL });
  const el = await waitForLoaded(mount, "second ring");
  expect(el.getAttribute("config-url")).toBe(UPDATED_CONFIG_URL);
  expect(el.configUrl).toBe(UPDATED_CONFIG_URL);
});

test("forwards HTML attributes", async () => {
  const { mount } = mountVue({
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

test("accepts kebab-case config-url and class object/array bindings", async () => {
  const mount = createMount();
  const active = ref(true);
  const app = createApp(
    defineComponent({
      setup: () => () =>
        h(FairyRing, {
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
