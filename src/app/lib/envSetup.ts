import dotenv from "dotenv";
let envLoaded = false;

export async function loadServerEnvAsync() {
  if (typeof window !== "undefined") return;
  if (envLoaded) return;
  dotenv.config({ path: ".env.local", override: false });
  dotenv.config({ path: ".env", override: false });
  envLoaded = true;
}
