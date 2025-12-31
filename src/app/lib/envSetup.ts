import dotenv from "dotenv";
let envLoaded = false;

export async function loadServerEnvAsync() {

  if (typeof window !== "undefined") return;
  if (envLoaded) return;

  dotenv.config({ path: ".env" });
  envLoaded = true;
}
