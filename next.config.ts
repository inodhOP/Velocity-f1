import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Keeps Turbopack from using a parent folder when another package-lock.json exists (e.g. in home). */
const turbopackRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: turbopackRoot,
  },
};

export default nextConfig;
