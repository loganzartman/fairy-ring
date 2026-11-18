import { defineComponent, h, type Component } from "vue";
import { define } from "./element";

export const FairyRing: Component = defineComponent(() => {
  define();
  return () => h("fairy-ring");
});
