import * as z from "zod/v4-mini";
import { parse as parseToml } from "smol-toml";
import {
  defaultNextString,
  defaultPrevString,
  defaultRandomString,
  locStringSchema,
} from "./strings";
import { impossible } from "./impossible";

export const siteSchema = z.object({
  /** where to link to */
  url: z.url(),
  /** what part of this link does the site own? */
  scope: z.enum([
    /** all of my.example.com */
    "host",
    /** just sub-paths of my.example.com/path, not my.example.com/other */
    "path",
  ]),
});
export type Site = z.infer<typeof siteSchema>;

export const configSchema = z.object({
  /** config schema version */
  version: z.enum(["0.0"]),
  /** name of this webring */
  name: locStringSchema,
  /** list sites in the webring  */
  sites: z.array(siteSchema),
  options: z.prefault(
    z.object({
      /** a homepage for the webring, if one exists */
      homeUrl: z.optional(z.url()),
      /** enable the "random" button */
      showRandom: z._default(z.boolean(), true),
      /** suggested stylesheet; loaded unless disabled by site developer */
      cssHref: z.optional(z.url()),
    }),
    {},
  ),
  strings: z.prefault(
    z.object({
      /** link to the next site */
      next: z._default(locStringSchema, defaultNextString),
      /** link to the previous site */
      previous: z._default(locStringSchema, defaultPrevString),
      /** link to a random site */
      random: z._default(locStringSchema, defaultRandomString),
    }),
    {},
  ),
});
export type Config = z.infer<typeof configSchema>;

export type GetConfigOptions = {
  url: string;
  init?: RequestInit | undefined;
};

export async function fetchConfig({ url, init }: GetConfigOptions): Promise<Config> {
  const result = await fetch(url, init);
  if (!result.ok) {
    throw new Error(`fetchConfig response error ${result.status}: ${await result.text()}`);
  }
  const raw = await result.text();
  const json = parseToml(raw);
  return configSchema.parse(json);
}

export async function logConfigErrors(
  promise: Promise<Config>,
  log = console.error,
): Promise<Config> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof z.core.$ZodError) {
      log("[fairy-ring] invalid config:", z.prettifyError(error));
    } else {
      log("[fairy-ring] error loading config:", error);
    }
    throw error;
  }
}

/** match against the configured sites; if this is one of them, return [Site, index]; else, return null */
export function getCurrent(config: Config): [Site, number] | null {
  const url = new URL(document.baseURI);
  const index = config.sites.findIndex((site) => {
    const siteUrl = new URL(site.url);
    switch (site.scope) {
      case "host":
        return siteUrl.host.toLowerCase() === url.host.toLowerCase();
      case "path":
        return (
          siteUrl.host.toLowerCase() === url.host.toLowerCase() && siteUrl.pathname === url.pathname
        );
      default:
        impossible(site.scope);
    }
  });
  if (index < 0) {
    return null;
  }
  return [config.sites[index], index];
}

function mod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

export function getNext(config: Config): Site | null {
  const cur = getCurrent(config);
  if (!cur) {
    return null;
  }
  return config.sites[mod(cur[1] + 1, config.sites.length)];
}

export function getPrev(config: Config): Site | null {
  const cur = getCurrent(config);
  if (!cur) {
    return null;
  }
  return config.sites[mod(cur[1] - 1, config.sites.length)];
}

export function getRandom(config: Config): Site | null {
  if (config.sites.length === 0) {
    return null;
  }
  if (config.sites.length === 1) {
    return config.sites[0];
  }

  const [_, cur = 0] = getCurrent(config) ?? [];
  let site = 0;
  for (let i = 0; site === cur && i < 10; ++i) {
    site = Math.floor(Math.random() * config.sites.length);
  }
  return config.sites[site];
}
