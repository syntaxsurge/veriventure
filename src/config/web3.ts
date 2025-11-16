export const badgeContractConfig = {
  contractAddress: process.env.NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS?.trim() ?? "",
  rpcUrl:
    process.env.NEXT_PUBLIC_POLKADOT_RPC_URL?.trim() ?? "ws://127.0.0.1:9944",
  networkName:
    process.env.NEXT_PUBLIC_POLKADOT_NETWORK_NAME?.trim() ?? "Local ink! node",
};

export const polkadotDefaults = {
  maxGasRefTime: BigInt(
    process.env.NEXT_PUBLIC_POLKADOT_GAS_REF_TIME ?? "5000000000",
  ),
  maxGasProofSize: BigInt(
    process.env.NEXT_PUBLIC_POLKADOT_GAS_PROOF_SIZE ?? "131072",
  ),
};
