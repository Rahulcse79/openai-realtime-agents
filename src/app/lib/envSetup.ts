/**
 * Server-only environment loader.
 *
 * Notes:
 * - Next.js automatically loads `.env*` files into `process.env` for server code.
 * - Do NOT import `dotenv` from Client Components or shared modules, or it will be
 *   bundled for the browser and can crash at runtime.
 */
export function loadServerEnv() {
	if (typeof window !== "undefined") return;

	// Intentionally no-op in sync context. Use `loadServerEnvAsync()` when needed.
}

export async function loadServerEnvAsync() {
	if (typeof window !== "undefined") return;

	const dotenv = await import("dotenv");
	// Prefer Next.js conventions first, but keep backward compatibility
	// with the repo's older `./env` file convention.
	//
	// Order matters: later calls shouldn't override earlier ones.
	// dotenv won't override existing vars unless `override: true`.
	dotenv.config({ path: ".env.local" });
	dotenv.config({ path: ".env" });
	dotenv.config({ path: "./env" });
}

