import { z } from "zod";

const rpcProtocol = /^(https?|wss?):\/\//i;
const numericPattern = /^\d+$/;

const clientSchema = z.object({
  NEXT_PUBLIC_POLKADOT_RPC_URL: z
    .string()
    .regex(
      rpcProtocol,
      "NEXT_PUBLIC_POLKADOT_RPC_URL must start with http(s) or ws(s).",
    ),
  NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS: z
    .string()
    .min(5, "NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS is required."),
  NEXT_PUBLIC_POLKADOT_NETWORK_NAME: z
    .string()
    .min(1, "NEXT_PUBLIC_POLKADOT_NETWORK_NAME is required."),
  NEXT_PUBLIC_POLKADOT_GAS_REF_TIME: z
    .string()
    .regex(numericPattern, "NEXT_PUBLIC_POLKADOT_GAS_REF_TIME must be numeric.")
    .default("5000000000"),
  NEXT_PUBLIC_POLKADOT_GAS_PROOF_SIZE: z
    .string()
    .regex(
      numericPattern,
      "NEXT_PUBLIC_POLKADOT_GAS_PROOF_SIZE must be numeric.",
    )
    .default("131072"),
  NEXT_PUBLIC_CONVEX_URL: z
    .string()
    .url("NEXT_PUBLIC_CONVEX_URL must be a valid URL."),
  NEXT_PUBLIC_EXPLORER_TX_TEMPLATE: z
    .string()
    .regex(
      /\{tx\}/,
      "NEXT_PUBLIC_EXPLORER_TX_TEMPLATE must include a {tx} placeholder.",
    ),
  NEXT_PUBLIC_DKG_VIEWER_TEMPLATE: z
    .string()
    .regex(
      /\{ual\}/,
      "NEXT_PUBLIC_DKG_VIEWER_TEMPLATE must include a {ual} placeholder.",
    ),
});

const parsed = clientSchema.safeParse({
  NEXT_PUBLIC_POLKADOT_RPC_URL: process.env.NEXT_PUBLIC_POLKADOT_RPC_URL,
  NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS:
    process.env.NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS,
  NEXT_PUBLIC_POLKADOT_NETWORK_NAME:
    process.env.NEXT_PUBLIC_POLKADOT_NETWORK_NAME,
  NEXT_PUBLIC_POLKADOT_GAS_REF_TIME:
    process.env.NEXT_PUBLIC_POLKADOT_GAS_REF_TIME,
  NEXT_PUBLIC_POLKADOT_GAS_PROOF_SIZE:
    process.env.NEXT_PUBLIC_POLKADOT_GAS_PROOF_SIZE,
  NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  NEXT_PUBLIC_EXPLORER_TX_TEMPLATE:
    process.env.NEXT_PUBLIC_EXPLORER_TX_TEMPLATE,
  NEXT_PUBLIC_DKG_VIEWER_TEMPLATE:
    process.env.NEXT_PUBLIC_DKG_VIEWER_TEMPLATE,
});

if (!parsed.success) {
  console.error("Invalid public environment configuration", parsed.error.issues);
  throw new Error("Missing or invalid public environment values.");
}

export const clientEnv = parsed.data;
export type ClientEnv = typeof clientEnv;
