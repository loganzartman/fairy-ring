import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

// follow the OS color scheme, including when it changes
const dark = window.matchMedia("(prefers-color-scheme: dark)");
const theme = () => create({ base: dark.matches ? "dark" : "light", brandTitle: "fairy-ring" });
dark.addEventListener("change", () => addons.setConfig({ theme: theme() }));

addons.setConfig({
  theme: theme(),
  // open the Code tab (from addon-docs) by default
  selectedPanel: "storybook/docs/panel",
  layoutCustomisations: {
    // hide the addons panel on docs pages; nothing to control there. this is evaluated on every
    // render, unlike a per-story showPanel parameter, which can leak into the next story.
    showPanel: ({ storyId }, defaultValue) => (storyId?.startsWith("docs-") ? false : defaultValue),
  },
});
