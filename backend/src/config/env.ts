import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  reinfolibApiKey: requireEnv("REINFOLIB_API_KEY"),
  port: Number(process.env.PORT ?? 3000),
  // Optional: when set, all /api/* requests must include a matching
  // X-App-Secret header. Left unset for local development.
  appSharedSecret: process.env.APP_SHARED_SECRET ?? null,
};
