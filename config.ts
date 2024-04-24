import { z } from "zod";
import fs from "node:fs";
import yaml from "yaml";

const ConfigSchema = z.object({
  QueueUrl: z.string().url(),
});

export const config = ConfigSchema.parse({
  ...yaml.parse(fs.readFileSync("./config.yml", "utf8")),
});
