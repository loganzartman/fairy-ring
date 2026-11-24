import { dynamic, isServer, type JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { define, type FairyRingElement } from "../element/fairy-ring";

export type FairyRingProps = Omit<JSX.HTMLAttributes<FairyRingElement>, "children"> & {
  configUrl: string;
};

const FairyRingElementTag = /* @__PURE__ */ dynamic(() => "fairy-ring", { static: true });

export function FairyRing(props: FairyRingProps): JSX.Element {
  if (!isServer) define();
  return FairyRingElementTag(
    merge(omit(props, "configUrl"), {
      get "config-url"() {
        return props.configUrl;
      },
    }),
  );
}
