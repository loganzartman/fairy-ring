import { expect } from "vitest";
import { page } from "vitest/browser";

// Called by the afterEach hook in preview.ts, so every story gets a visual snapshot.
globalThis.matchStoryScreenshot = (canvas) =>
  expect.element(page.elementLocator(canvas)).toMatchScreenshot();
