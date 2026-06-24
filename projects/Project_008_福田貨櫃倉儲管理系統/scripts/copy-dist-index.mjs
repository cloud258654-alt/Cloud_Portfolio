import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

const dist = resolve("dist");

copyFileSync(resolve(dist, "app-source.html"), resolve(dist, "index.html"));
