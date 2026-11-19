// writes dist/config.schema.json, a json schema for fairy-ring.toml so editors can validate and
// autocomplete it. runs after tsdown and imports the built lib, so tsdown stays the only compiler.
import { writeFile } from "node:fs/promises";
import * as z from "zod/v4-mini";
import { configSchema } from "../dist/lib.js";

const schema = { title: "fairy-ring config", ...z.toJSONSchema(configSchema, { io: "input" }) };
await writeFile("dist/config.schema.json", JSON.stringify(schema, null, 2) + "\n");
