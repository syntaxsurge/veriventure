import { createPublicClient, getAddress, http, isAddress, parseEther, type WalletClient } from "viem";
import { moonbaseAlpha } from "viem/chains";
import { clientEnv } from "@/env/client";

const INVOICE_ABI = [
  {
    inputs: [{ internalType: "address", name: "initialOwner", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "cancel",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "payer", type: "address" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "dueAt", type: "uint256" },
      { internalType: "string", name: "memo", type: "string" },
      { internalType: "string", name: "dkgUAL", type: "string" },
    ],
    name: "createInvoiceERC20",
    outputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "payer", type: "address" },
      { internalType: "uint256", name: "amountWei", type: "uint256" },
      { internalType: "uint256", name: "dueAt", type: "uint256" },
      { internalType: "string", name: "memo", type: "string" },
      { internalType: "string", name: "dkgUAL", type: "string" },
    ],
    name: "createInvoiceNative",
    outputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "getInvoice",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address", name: "issuer", type: "address" },
          { internalType: "address", name: "payer", type: "address" },
          { internalType: "enum InvoiceRegistry.CurrencyType", name: "currencyType", type: "uint8" },
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "dueAt", type: "uint256" },
          { internalType: "enum InvoiceRegistry.Status", name: "status", type: "uint8" },
          { internalType: "string", name: "memo", type: "string" },
          { internalType: "string", name: "dkgUAL", type: "string" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "uint256", name: "paidAt", type: "uint256" },
        ],
        internalType: "struct InvoiceRegistry.Invoice",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "issuer", type: "address" }],
    name: "getIssuerInvoices",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "payer", type: "address" }],
    name: "getPayerInvoices",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalInvoices",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "markOverdue",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "payERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "payNative",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "issuer", type: "address" },
      { indexed: true, internalType: "address", name: "payer", type: "address" },
      { indexed: false, internalType: "enum InvoiceRegistry.CurrencyType", name: "currencyType", type: "uint8" },
      { indexed: false, internalType: "address", name: "token", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "dueAt", type: "uint256" },
      { indexed: false, internalType: "string", name: "memo", type: "string" },
      { indexed: false, internalType: "string", name: "dkgUAL", type: "string" },
    ],
    name: "InvoiceCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "payer", type: "address" },
      { indexed: true, internalType: "address", name: "issuer", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "paidAt", type: "uint256" },
    ],
    name: "InvoicePaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "issuer", type: "address" },
    ],
    name: "InvoiceCancelled",
    type: "event",
  },
] as const;

// Get the invoice registry address from environment
function getInvoiceRegistryAddress(): `0x${string}` {
  const address = clientEnv.NEXT_PUBLIC_INVOICE_REGISTRY_ADDRESS?.trim();
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error("Invoice Registry address not configured. Please deploy the contract first.");
  }
  return address as `0x${string}`;
}

// Create public client for reading contract data
const defaultClient = createPublicClient({
  chain: moonbaseAlpha,
  transport: http(clientEnv.NEXT_PUBLIC_EVM_RPC_URL),
});

export type CurrencyType = "NATIVE" | "ERC20";
export type InvoiceStatus = "Pending" | "Paid" | "Cancelled" | "Overdue";

export type OnChainInvoice = {
  id: bigint;
  issuer: string;
  payer: string;
  currencyType: number;
  token: string;
  amount: bigint;
  dueAt: bigint;
  status: number;
  memo: string;
  dkgUAL: string;
  createdAt: bigint;
  paidAt: bigint;
};

export type CreateInvoiceResult = {
  txHash: `0x${string}`;
  invoiceId: bigint;
  network: string;
  contractAddress: string;
};

// Create a native currency invoice (DEV on Moonbase Alpha)
export async function createNativeInvoice({
  walletClient,
  payer,
  amountDEV,
  dueDate,
  memo,
  dkgUAL = "",
}: {
  walletClient: WalletClient | null;
  payer: string;
  amountDEV: string;
  dueDate: Date;
  memo: string;
  dkgUAL?: string;
}): Promise<CreateInvoiceResult> {
  if (!walletClient) {
    throw new Error("Wallet client unavailable");
  }
  if (!isAddress(payer)) {
    throw new Error("Invalid payer address");
  }

  const contractAddress = getInvoiceRegistryAddress();
  const amountWei = parseEther(amountDEV);
  const dueAtTimestamp = BigInt(Math.floor(dueDate.getTime() / 1000));

  // Create invoice on-chain
  const txHash = await walletClient.writeContract({
    address: contractAddress,
    abi: INVOICE_ABI,
    functionName: "createInvoiceNative",
    args: [getAddress(payer), amountWei, dueAtTimestamp, memo, dkgUAL],
    chain: walletClient.chain,
    account: walletClient.account!,
  });

  // Wait for transaction and get invoice ID from event
  const receipt = await defaultClient.waitForTransactionReceipt({ hash: txHash });

  // Find InvoiceCreated event
  const log = receipt.logs.find((log) =>
    log.topics[0] === "0x..." // InvoiceCreated event signature
  );

  // The invoice ID is the first indexed parameter (topic[1])
  const invoiceId = log?.topics[1] ? BigInt(log.topics[1]) : BigInt(0);

  return {
    txHash,
    invoiceId,
    network: clientEnv.NEXT_PUBLIC_EVM_NETWORK_NAME,
    contractAddress,
  };
}

// Pay a native invoice
export async function payNativeInvoice({
  walletClient,
  invoiceId,
  amount,
}: {
  walletClient: WalletClient | null;
  invoiceId: number | bigint;
  amount: string;
}): Promise<{ txHash: `0x${string}` }> {
  if (!walletClient) {
    throw new Error("Wallet client unavailable");
  }

  const contractAddress = getInvoiceRegistryAddress();
  const amountWei = parseEther(amount);

  const txHash = await walletClient.writeContract({
    address: contractAddress,
    abi: INVOICE_ABI,
    functionName: "payNative",
    args: [BigInt(invoiceId)],
    value: amountWei,
    chain: walletClient.chain,
    account: walletClient.account!,
  });

  await defaultClient.waitForTransactionReceipt({ hash: txHash });

  return { txHash };
}

// Cancel an invoice (issuer only)
export async function cancelInvoice({
  walletClient,
  invoiceId,
}: {
  walletClient: WalletClient | null;
  invoiceId: number | bigint;
}): Promise<{ txHash: `0x${string}` }> {
  if (!walletClient) {
    throw new Error("Wallet client unavailable");
  }

  const contractAddress = getInvoiceRegistryAddress();

  const txHash = await walletClient.writeContract({
    address: contractAddress,
    abi: INVOICE_ABI,
    functionName: "cancel",
    args: [BigInt(invoiceId)],
    chain: walletClient.chain,
    account: walletClient.account!,
  });

  await defaultClient.waitForTransactionReceipt({ hash: txHash });

  return { txHash };
}

// Read invoice details from contract
export async function readInvoice(invoiceId: number | bigint): Promise<OnChainInvoice | null> {
  try {
    const contractAddress = getInvoiceRegistryAddress();

    const invoice = await defaultClient.readContract({
      address: contractAddress,
      abi: INVOICE_ABI,
      functionName: "getInvoice",
      args: [BigInt(invoiceId)],
    });

    return invoice as unknown as OnChainInvoice;
  } catch (error) {
    console.error("Error reading invoice:", error);
    return null;
  }
}

// Read all invoice IDs for an issuer
export async function readIssuerInvoiceIds(issuerAddress: string): Promise<bigint[]> {
  if (!isAddress(issuerAddress)) {
    throw new Error("Invalid issuer address");
  }

  const contractAddress = getInvoiceRegistryAddress();

  const ids = await defaultClient.readContract({
    address: contractAddress,
    abi: INVOICE_ABI,
    functionName: "getIssuerInvoices",
    args: [getAddress(issuerAddress)],
  });

  return ids as bigint[];
}

// Read all invoice IDs for a payer
export async function readPayerInvoiceIds(payerAddress: string): Promise<bigint[]> {
  if (!isAddress(payerAddress)) {
    throw new Error("Invalid payer address");
  }

  const contractAddress = getInvoiceRegistryAddress();

  const ids = await defaultClient.readContract({
    address: contractAddress,
    abi: INVOICE_ABI,
    functionName: "getPayerInvoices",
    args: [getAddress(payerAddress)],
  });

  return ids as bigint[];
}

// Helper: Convert status enum to string
export function invoiceStatusToString(status: number): InvoiceStatus {
  const statuses: InvoiceStatus[] = ["Pending", "Paid", "Cancelled", "Overdue"];
  return statuses[status] || "Pending";
}

// Helper: Convert currency type enum to string
export function currencyTypeToString(currencyType: number): CurrencyType {
  return currencyType === 0 ? "NATIVE" : "ERC20";
}
