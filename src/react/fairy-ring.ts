import { createElement, type ClassAttributes, type HTMLAttributes, type ReactElement } from "react";
import { define, type FairyRingElement } from "../element/fairy-ring";

export type FairyRingProps = Omit<
  HTMLAttributes<FairyRingElement> & ClassAttributes<FairyRingElement>,
  "children"
> & {
  configUrl: string;
};

export function FairyRing({ configUrl, ...props }: FairyRingProps): ReactElement {
  define();
  return createElement("fairy-ring", { ...props, "config-url": configUrl });
}
