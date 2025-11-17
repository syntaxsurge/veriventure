"use server";

import DkgClient from "dkg.js";
import { serverEnv } from "@/env/server";

type DkgConfig = {
  endpoint: string;
  port: string;
  environment: "development" | "testnet" | "mainnet";
  blockchain: {
    name: string;
    rpc?: string;
    privateKey: string;
  };
  maxNumberOfRetries: number;
  frequency: number;
  communicationType: string;
  auth?: {
    token?: string | null;
  };
};

type DkgClientInstance = {
  asset: {
    create: (
      dataset: unknown,
      options: {
        epochsNum?: number;
        minimumNumberOfFinalizationConfirmations?: number;
        minimumNumberOfNodeReplications?: number;
        minimumBlockConfirmations?: number;
      },
    ) => Promise<AssetCreateResult>;
  };
  node: {
    info: () => Promise<unknown>;
  };
};

type AssetCreateResult = {
  UAL?: string;
  ual?: string;
  operation?: {
    mintKnowledgeCollection?: {
      transactionHash?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

let cachedClient: DkgClientInstance | null = null;
let cachedConfig: DkgConfig | null = null;

function buildConfig(): DkgConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  cachedConfig = {
    endpoint: serverEnv.DKG_NODE_ENDPOINT,
    port: String(serverEnv.DKG_NODE_PORT),
    environment: serverEnv.DKG_ENV,
    blockchain: {
      name: serverEnv.DKG_BLOCKCHAIN_NAME,
      rpc: serverEnv.DKG_BLOCKCHAIN_RPC,
      privateKey: serverEnv.DKG_BLOCKCHAIN_PRIVATE_KEY,
    },
    maxNumberOfRetries: serverEnv.DKG_MAX_RETRIES,
    frequency: serverEnv.DKG_POLL_FREQUENCY,
    communicationType: "Http",
    auth: serverEnv.DKG_NODE_AUTH_TOKEN
      ? { token: serverEnv.DKG_NODE_AUTH_TOKEN }
      : undefined,
  };
  return cachedConfig;
}

function getClient(): DkgClientInstance {
  if (cachedClient) {
    return cachedClient;
  }
  const config = buildConfig();
  cachedClient = new DkgClient(config) as unknown as DkgClientInstance;
  return cachedClient;
}

export type CommunityNoteInput = {
  topic: string;
  summary: string;
  references: string[];
};

export type PublishedCommunityNote = {
  ual: string;
  txHash?: string;
  result: AssetCreateResult;
};

type PublishOptions = {
  epochsNum?: number;
  minimumNumberOfFinalizationConfirmations?: number;
  minimumNumberOfNodeReplications?: number;
  minimumBlockConfirmations?: number;
};

function normalizeOptions(
  options?: PublishOptions,
): Required<PublishOptions> {
  return {
    epochsNum: options?.epochsNum ?? 6,
    minimumNumberOfFinalizationConfirmations:
      options?.minimumNumberOfFinalizationConfirmations ?? 2,
    minimumNumberOfNodeReplications:
      options?.minimumNumberOfNodeReplications ?? 1,
    minimumBlockConfirmations: options?.minimumBlockConfirmations ?? 1,
  };
}

async function publishDataset(
  dataset: unknown,
  options?: PublishOptions,
) {
  const client = getClient();
  const normalized = normalizeOptions(options);
  const result = await client.asset.create(dataset, normalized);

  const rawUal =
    (typeof result.UAL === "string" && result.UAL) ||
    (typeof result.ual === "string" && result.ual);
  if (!rawUal) {
    throw new Error("DKG publish succeeded but no UAL was returned.");
  }

  const txHash =
    typeof result.operation?.mintKnowledgeCollection?.transactionHash ===
    "string"
      ? result.operation?.mintKnowledgeCollection?.transactionHash
      : undefined;

  return {
    ual: rawUal,
    txHash,
    result,
  };
}

export async function publishCommunityNote(
  note: CommunityNoteInput,
): Promise<PublishedCommunityNote> {
  const referenceList = note.references.filter(Boolean);
  const slug = note.topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  const dataset = {
    public: {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "@id": `urn:veriventure:note:${slug}`,
      identifier: `urn:veriventure:note:${slug}`,
      about: note.topic,
      name: `Community note for ${note.topic}`,
      description: note.summary,
      citation: referenceList,
      dateCreated: new Date().toISOString(),
    },
    private: {
      "@context": "https://schema.org",
      "@type": "Conversation",
      text: note.summary,
      url: referenceList[0] ?? "",
    },
  };

  return publishDataset(dataset);
}

export async function publishKnowledgeAsset(
  dataset: unknown,
  options?: PublishOptions,
) {
  return publishDataset(dataset, options);
}

export async function fetchDkgNodeInfo() {
  const client = getClient();
  return client.node.info();
}
