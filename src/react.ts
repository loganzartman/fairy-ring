import { createElement, type ReactElement } from "react";
import { define } from "./element";

export function FairyRing(): ReactElement {
  define();
  return createElement("fairy-ring");
}
