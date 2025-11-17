"use server";

import DkgClient from "dkg.js";
import { serverEnv } from "@/env/server";

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
  node: {
    info: () => Promise<unknown>;
  };
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
    nodeApiVersion: serverEnv.DKG_NODE_API_VERSION,
    authToken: serverEnv.DKG_NODE_AUTH_TOKEN,
    blockchain: {
      name: serverEnv.DKG_BLOCKCHAIN_NAME,
      privateKey: serverEnv.DKG_BLOCKCHAIN_PRIVATE_KEY,
    },
    maxNumberOfRetries: serverEnv.DKG_MAX_RETRIES,
    frequency: serverEnv.DKG_POLL_FREQUENCY,
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

export async function fetchDkgNodeInfo() {
  const client = getClient();
  return client.node.info();
}
