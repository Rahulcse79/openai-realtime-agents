export function loadServerEnv() {
  if (typeof window !== "undefined") return;
}

export async function loadServerEnvAsync() {
  if (typeof window !== "undefined") return;
  const dotenv = await import("dotenv");
  dotenv.config({ path: ".env.local" });
  dotenv.config({ path: ".env" });
  dotenv.config({ path: "./env" });
}
