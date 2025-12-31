export function loadServerEnv() {
  if (typeof window !== "undefined") return;
  if (process.env.__ENV_LOADED__) return;
  const dotenv = require("dotenv");
  dotenv.config({ path: ".env" });
  process.env.__ENV_LOADED__ = "true";
}

export async function loadServerEnvAsync() {
  if (typeof window !== "undefined") return;
  if (process.env.__ENV_LOADED__) return;
  const dotenv = await import("dotenv");
  dotenv.config({ path: ".env" });
  process.env.__ENV_LOADED__ = "true";
}
