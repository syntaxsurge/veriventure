"use server";

import DkgClient from "dkg.js";

type DkgConfig = {
  endpoint: string;
  port: string;
  nodeApiVersion: string;
  authToken?: string;
  blockchain: {
    name: string;
    privateKey: string;
  };
  maxNumberOfRetries: number;
  frequency: number;
  communicationType: string;
};

type DkgClientInstance = {
  asset: {
    create: (
      dataset: unknown,
      options: {
        epochsNum?: number;
        minimumNumberOfFinalizationConfirmations?: number;
        minimumNumberOfNodeReplications?: number;
      },
    ) => Promise<unknown>;
  };
};

let cachedClient: DkgClientInstance | null = null;
let cachedConfig: DkgConfig | null = null;

function buildConfig(): DkgConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const endpoint = process.env.DKG_NODE_ENDPOINT?.trim() ?? "http://127.0.0.1";
  const port = process.env.DKG_NODE_PORT?.trim() ?? "8900";
  const blockchainName =
    process.env.DKG_BLOCKCHAIN_NAME?.trim() ?? "hardhat1:31337";
  const privateKey = process.env.DKG_BLOCKCHAIN_PRIVATE_KEY?.trim();

  if (!privateKey) {
    throw new Error("DKG_BLOCKCHAIN_PRIVATE_KEY must be configured.");
  }

  cachedConfig = {
    endpoint,
    port,
    nodeApiVersion: process.env.DKG_NODE_API_VERSION?.trim() ?? "/v1",
    authToken: process.env.DKG_NODE_AUTH_TOKEN?.trim(),
    blockchain: {
      name: blockchainName,
      privateKey,
    },
    maxNumberOfRetries: Number(process.env.DKG_MAX_RETRIES ?? "180"),
    frequency: Number(process.env.DKG_POLL_FREQUENCY ?? "2"),
    communicationType: "Http",
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

export async function publishCommunityNote(note: CommunityNoteInput) {
  const client = getClient();
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
  };

  const result = await client.asset.create(dataset, {
    epochsNum: 2,
    minimumNumberOfFinalizationConfirmations: 1,
    minimumNumberOfNodeReplications: 1,
  });

  return result;
}
