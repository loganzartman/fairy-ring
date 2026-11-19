import { addons } from "storybook/manager-api";

addons.setConfig({
  // open the Code tab (from addon-docs) by default
  selectedPanel: "storybook/docs/panel",
  layoutCustomisations: {
    // hide the addons panel on docs pages; nothing to control there. this is evaluated on every
    // render, unlike a per-story showPanel parameter, which can leak into the next story.
    showPanel: ({ storyId }, defaultValue) => (storyId?.startsWith("docs-") ? false : defaultValue),
  },
});
