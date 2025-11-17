import { validityContractConfig } from "@/config/web3";
import { createPublicClient, getAddress, http, isAddress, type WalletClient } from "viem";
import { moonbaseAlpha } from "viem/chains";

const VALIDITY_ABI = [
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "bytes32", name: "badgeHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    name: "listBadges",
    type: "function",
    stateMutability: "view",
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    outputs: [{ internalType: "bytes32[]", name: "", type: "bytes32[]" }],
  },
  {
    name: "hasBadge",
    type: "function",
    stateMutability: "view",
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "bytes32", name: "badgeHash", type: "bytes32" },
    ],
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
  },
  {
    name: "countOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  },
] as const;

const defaultClient = createPublicClient({
  chain: moonbaseAlpha,
  transport: http(validityContractConfig.rpcUrl),
});

export type MintBadgeResult = {
  txHash: `0x${string}`;
  network: string;
  contractAddress: string;
};

export type MintConfigOverride = {
  contractAddress?: string;
  networkName?: string;
};

export async function mintAchievementBadge({
  walletClient,
  to,
  payloadHash,
  config,
}: {
  walletClient: WalletClient | null;
  to: string;
  payloadHash: string;
  config?: MintConfigOverride;
}): Promise<MintBadgeResult> {
  if (!walletClient) {
    throw new Error("Wallet client unavailable.");
  }
  if (!isAddress(to)) {
    throw new Error("Recipient address is invalid.");
  }
  const contractAddress = (config?.contractAddress ?? validityContractConfig.contractAddress) as `0x${string}`;
  const normalizedTo = getAddress(to);
  const normalizedHash = payloadHash as `0x${string}`;
  const txHash = await walletClient.writeContract({
    address: contractAddress,
    abi: VALIDITY_ABI,
    functionName: "mint",
    args: [normalizedTo, normalizedHash],
    chain: walletClient.chain,
    account: walletClient.account ?? normalizedTo,
  });

  return {
    txHash,
    network: config?.networkName ?? validityContractConfig.networkName,
    contractAddress,
  };
}

export async function readBadgeHashes(holder: string): Promise<{ hashes: string[] }> {
  if (!isAddress(holder)) {
    throw new Error("Invalid address provided.");
  }
  const hashes = await defaultClient.readContract({
    address: validityContractConfig.contractAddress as `0x${string}`,
    abi: VALIDITY_ABI,
    functionName: "listBadges",
    args: [getAddress(holder)],
  });
  return { hashes: hashes.map((hash) => hash.toLowerCase()) };
}
