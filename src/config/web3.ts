import { clientEnv } from "@/env/client";

export const badgeContractConfig = {
  contractAddress: clientEnv.NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS.trim(),
  rpcUrl: clientEnv.NEXT_PUBLIC_POLKADOT_RPC_URL.trim(),
  networkName: clientEnv.NEXT_PUBLIC_POLKADOT_NETWORK_NAME.trim(),
};

export const polkadotDefaults = {
  maxGasRefTime: BigInt(clientEnv.NEXT_PUBLIC_POLKADOT_GAS_REF_TIME),
  maxGasProofSize: BigInt(clientEnv.NEXT_PUBLIC_POLKADOT_GAS_PROOF_SIZE),
};
