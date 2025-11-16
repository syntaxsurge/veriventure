import type { ApiPromise } from "@polkadot/api";
import type { Signer } from "@polkadot/api/types";
import { hexToU8a, u8aConcat, u8aToHex } from "@polkadot/util";
import { badgeContractConfig, polkadotDefaults } from "@/config/web3";
import { accountIdToH160 } from "@/lib/web3/account";

const MINT_BADGE_SELECTOR = "0x6a627842";
const GET_BADGES_SELECTOR = "0x16653eef";

type MintConfig = {
  contractAddress?: string;
  rpcUrl?: string;
  networkName?: string;
};

export type MintBadgeResult = {
  txHash: string;
  network: string;
  contractAddress: string;
};

export async function mintAchievementBadge({
  ownerAddress,
  signer,
  payloadHash,
  config,
}: {
  ownerAddress: string;
  signer: Signer;
  payloadHash: string;
  config?: MintConfig;
}): Promise<MintBadgeResult> {
  const contractAddress =
    config?.contractAddress || badgeContractConfig.contractAddress;
  const rpcUrl = config?.rpcUrl || badgeContractConfig.rpcUrl;
  const networkName = config?.networkName || badgeContractConfig.networkName;

  if (!contractAddress) {
    throw new Error("Badge contract address is not configured.");
  }
  if (!rpcUrl) {
    throw new Error("Polkadot RPC URL is not configured.");
  }

  const { ApiPromise, WsProvider } = await import("@polkadot/api");
  const provider = new WsProvider(rpcUrl);
  const api = await ApiPromise.create({ provider });

  try {
    const callData = encodeMintBadgePayload(api, ownerAddress, payloadHash);
    const gasLimit = api.registry.createType("WeightV2", {
      refTime: polkadotDefaults.maxGasRefTime,
      proofSize: polkadotDefaults.maxGasProofSize,
    });

    const tx = api.tx.contracts.call(
      contractAddress,
      0,
      gasLimit,
      null,
      callData,
    );

    const txHash = await new Promise<string>((resolve, reject) => {
      let unsub: (() => void) | undefined;
      tx.signAndSend(ownerAddress, { signer }, (result) => {
        if (result.status.isInBlock || result.status.isFinalized) {
          unsub?.();
          resolve(result.txHash.toHex());
        } else if (result.isError) {
          unsub?.();
          reject(
            new Error(
              result.dispatchError?.toString() ||
                "Contract call failed before finalization.",
            ),
          );
        }
      })
        .then((unsubFn) => {
          unsub = unsubFn;
        })
        .catch((error) => {
          reject(error);
        });
    });

    return {
      txHash,
      network: networkName,
      contractAddress,
    };
  } finally {
    await api.disconnect();
  }
}

function encodeMintBadgePayload(
  api: ApiPromise,
  ownerAddress: string,
  payloadHash: string,
) {
  const ownerH160 = accountIdToH160(ownerAddress);
  const selector = hexToU8a(MINT_BADGE_SELECTOR);
  const ownerEncoded = api.registry.createType("H160", ownerH160).toU8a();
  const hashEncoded = api.registry.createType("H256", payloadHash).toU8a();
  return u8aToHex(u8aConcat(selector, ownerEncoded, hashEncoded));
}

function encodeGetBadgesPayload(api: ApiPromise, ownerAddress: string) {
  const ownerH160 = accountIdToH160(ownerAddress);
  const selector = hexToU8a(GET_BADGES_SELECTOR);
  const ownerEncoded = api.registry.createType("H160", ownerH160).toU8a();
  return u8aToHex(u8aConcat(selector, ownerEncoded));
}

export async function readBadgeHashes(
  ownerAddress: string,
  config?: MintConfig,
) {
  const contractAddress =
    config?.contractAddress || badgeContractConfig.contractAddress;
  const rpcUrl = config?.rpcUrl || badgeContractConfig.rpcUrl;

  if (!contractAddress) {
    throw new Error("Badge contract address is not configured.");
  }
  if (!rpcUrl) {
    throw new Error("Polkadot RPC URL is not configured.");
  }

  const { ApiPromise, WsProvider } = await import("@polkadot/api");
  const provider = new WsProvider(rpcUrl);
  const api = await ApiPromise.create({ provider });

  try {
    const gasLimit = api.registry.createType("WeightV2", {
      refTime: polkadotDefaults.maxGasRefTime,
      proofSize: polkadotDefaults.maxGasProofSize,
    });
    const inputData = encodeGetBadgesPayload(api, ownerAddress);
    const result = await api.call.contractsApi.call({
      origin: ownerAddress,
      dest: contractAddress,
      value: 0,
      gasLimit,
      storageDepositLimit: null,
      inputData,
    });

    const callResult = result as unknown as {
      result: {
        isErr: boolean;
        asErr: { toString(): string };
        asOk: { data: { toU8a: () => Uint8Array } };
      };
    };

    if (callResult.result.isErr) {
      throw new Error(callResult.result.asErr.toString());
    }

    const raw = callResult.result.asOk.data.toU8a();
    const decoded = api.registry.createType("Vec<Hash>", raw);
    const hashes = decoded.toArray().map((hash) => hash.toHex());
    return { hashes };
  } finally {
    await api.disconnect();
  }
}
