import { z } from "zod";

const serverSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required."),
  OPENAI_COMPLETIONS_MODEL: z
    .string()
    .min(1)
    .default("gpt-4o-mini"),
  OPENAI_EMBEDDING_MODEL: z
    .string()
    .min(1)
    .default("text-embedding-3-small"),
  OPENAI_IMAGE_MODEL: z.string().min(1).default("gpt-image-1"),
  PITCH_DECK_IMAGE_SIZE: z
    .string()
    .regex(/^\d+x\d+$/, "Image size must follow WIDTHxHEIGHT.")
    .default("1792x1024"),
  PITCH_DECK_SCRAPE_SIZE: z
    .string()
    .regex(/^\d+x\d+$/, "Scrape size must follow WIDTHxHEIGHT.")
    .default("1200x675"),
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters long."),
  GROKIPEDIA_BASE_URL: z
    .string()
    .url("GROKIPEDIA_BASE_URL must be a valid URL."),
  GROKIPEDIA_USER_AGENT: z
    .string()
    .min(1)
    .default("VeriVentureBot/1.0 (+https://veriventure.xyz)"),
  WIKIPEDIA_USER_AGENT: z
    .string()
    .min(1)
    .default("VeriVentureBot/1.0 (+https://veriventure.xyz)"),
  DKG_NODE_ENDPOINT: z
    .string()
    .url("DKG_NODE_ENDPOINT must be a valid URL."),
  DKG_NODE_PORT: z.coerce.number().int().positive().default(8900),
  DKG_ENV: z.enum(["development", "testnet", "mainnet"]).default("testnet"),
  DKG_BLOCKCHAIN_NAME: z.string().min(1),
  DKG_BLOCKCHAIN_RPC: z
    .string()
    .url("DKG_BLOCKCHAIN_RPC must be a valid URL.")
    .default("https://lofar-testnet.origin-trail.network"),
  DKG_BLOCKCHAIN_PRIVATE_KEY: z.string().min(1),
  DKG_NODE_AUTH_TOKEN: z.string().optional(),
  DKG_MAX_RETRIES: z.coerce.number().int().positive().default(180),
  DKG_POLL_FREQUENCY: z.coerce.number().int().positive().default(2),
  CONVEX_URL: z.string().url().optional(),
  CONVEX_DEPLOYMENT_URL: z.string().url().optional(),
  NEXT_PUBLIC_CONVEX_URL: z.string().url().optional(),
});

const parsed = serverSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid server environment configuration", parsed.error.issues);
  throw new Error("Missing or invalid server environment values.");
}

export const serverEnv = parsed.data;

export type ServerEnv = typeof serverEnv;
