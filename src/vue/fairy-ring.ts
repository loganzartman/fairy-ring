import { defineComponent, h } from "vue";
import { define } from "../element/fairy-ring";

export interface FairyRingProps {
  configUrl: string;
}

export const FairyRing = defineComponent({
  name: "FairyRing",
  props: {
    configUrl: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    define();
    return () => h("fairy-ring", { "config-url": props.configUrl });
  },
});
