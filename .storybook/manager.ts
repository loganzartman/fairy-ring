import { addons, types } from "storybook/manager-api";

// Storybook has no option for addon panel order; tabs follow registration order, and the
// built-in panels (Controls, Actions, Interactions) register before addon-docs' Code panel.
// Re-insert the panels so Code comes first (it then also opens by default).
const CODE_PANEL = "storybook/docs/panel";

addons.register("fairy-ring/panel-order", () => {
  const panels = addons.getElements(types.PANEL);
  const code = panels[CODE_PANEL];
  if (!code) return;
  const rest = Object.entries(panels).filter(([id]) => id !== CODE_PANEL);
  for (const id of Object.keys(panels)) delete panels[id];
  panels[CODE_PANEL] = code;
  for (const [id, panel] of rest) panels[id] = panel;
});
