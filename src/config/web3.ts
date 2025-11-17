import { clientEnv } from "@/env/client";

export const validityContractConfig = {
  contractAddress: clientEnv.NEXT_PUBLIC_VALIDITY_CONTRACT_ADDRESS.trim(),
  rpcUrl: clientEnv.NEXT_PUBLIC_EVM_RPC_URL.trim(),
  networkName: clientEnv.NEXT_PUBLIC_EVM_NETWORK_NAME.trim(),
};
