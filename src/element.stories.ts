import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { define } from "./element";

define();

const meta: Meta = {
  component: "fairy-ring",
  render: () => Object.assign(document.createElement("fairy-ring"), { textContent: "fairy-ring" }),
};
export default meta;

export const Default: StoryObj = {};
