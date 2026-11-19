import * as z from "zod/v4-mini";
import { parse as parseToml } from "smol-toml";
import {
  defaultNextString,
  defaultPrevString,
  defaultRandomString,
  locStringSchema,
} from "./strings";
import { impossible } from "./impossible";

export { localize, type LocString } from "./strings";

export const siteSchema = z
  .object({
    url: z.url().check(z.describe("where to link to")),
    scope: z
      .enum(["host", "path"])
      .check(
        z.describe(
          'what part of this link does the site own? "host": all of my.example.com. "path": just sub-paths of my.example.com/path, not my.example.com/other',
        ),
      ),
  })
  .check(z.meta({ id: "Site" }));
export type Site = z.infer<typeof siteSchema>;

export const configSchema = z.object({
  configVersion: z.union([z.literal(1)]).check(z.describe("config schema version")),
  name: z.nonoptional(locStringSchema).check(z.describe("name of this webring")),
  homeUrl: z.optional(z.url()).check(z.describe("a homepage for the webring, if one exists")),
  sites: z.array(siteSchema).check(z.describe("list sites in the webring")),
  strings: z
    .prefault(
      z
        .object({
          next: z
            ._default(locStringSchema, defaultNextString)
            .check(z.describe("link to the next site")),
          previous: z
            ._default(locStringSchema, defaultPrevString)
            .check(z.describe("link to the previous site")),
          random: z
            ._default(locStringSchema, defaultRandomString)
            .check(z.describe("link to a random site")),
        })
        .check(z.meta({ id: "Strings" })),
      {},
    )
    .check(z.describe("overrides for built-in translations")),
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
