# Invoice System Deployment Guide

This guide will help you deploy the complete on-chain invoicing system for VeriVenture.

## Overview

The invoice system allows entrepreneurs to:
- Create invoices with on-chain receipts
- Get paid instantly in native DEV tokens
- Track invoice status (Pending, Paid, Cancelled, Overdue)
- Share payment links with clients
- Optional: Publish invoice proofs to DKG for verification

## Prerequisites

- Moonbase Alpha testnet DEV tokens (for gas fees)
- Private key for contract deployment

## Step 1: Deploy the InvoiceRegistry Smart Contract

1. Navigate to the blockchain directory:
```bash
cd blockchain
```

2. Create a `.env` file with your private key:
```bash
echo "PRIVATE_KEY=your_private_key_here" > .env
```

3. Compile the contracts:
```bash
npm run compile
```

4. Deploy to Moonbase Alpha:
```bash
npx hardhat run scripts/deploy-invoice-registry.ts --network moonbase
```

5. Copy the deployed contract address from the output.

## Step 2: Configure Environment Variables

1. Return to the root directory:
```bash
cd ..
```

2. Update `.env.local` with the deployed contract address:
```bash
NEXT_PUBLIC_INVOICE_REGISTRY_ADDRESS=0xYourDeployedContractAddress
```

3. Ensure other required environment variables are set:
```bash
NEXT_PUBLIC_EVM_RPC_URL=https://rpc.api.moonbase.moonbeam.network
NEXT_PUBLIC_EVM_NETWORK_NAME=Moonbase Alpha
NEXT_PUBLIC_EXPLORER_TX_TEMPLATE="https://moonbase.moonscan.io/tx/{tx}"
```

## Step 3: Deploy Convex Schema Changes

1. Push the updated schema to Convex:
```bash
npm run convex:deploy
```

This will deploy the new `invoices` table and related mutations/queries.

## Step 4: Start the Development Server

```bash
npm run dev
```

The invoicing feature is now available at `/invoices`.

## Features

### Invoice Dashboard (`/invoices`)
- View all issued and received invoices
- See statistics (total invoices, amounts earned/paid)
- Quick access to create new invoices
- Filter by status (Pending, Paid, Cancelled, Overdue)

### Create Invoice (`/invoices/new`)
- Enter client wallet address
- Set amount in DEV tokens
- Choose due date
- Add invoice description
- Optional: Publish proof to DKG (future feature)

### Invoice Detail (`/invoices/[id]`)
- View complete invoice information
- Pay invoice (if you're the payer)
- Cancel invoice (if you're the issuer)
- View transaction on block explorer
- Share invoice link with clients

## Smart Contract Functions

### For Issuers

**createInvoiceNative(payer, amountWei, dueAt, memo, dkgUAL)**
- Creates a new native currency invoice
- Returns the invoice ID

**cancel(invoiceId)**
- Cancels a pending invoice
- Only callable by issuer

### For Payers

**payNative(invoiceId)**
- Pays a pending invoice in DEV
- Must send exact amount
- Automatically transfers to issuer

### View Functions

**getInvoice(invoiceId)**
- Returns complete invoice details

**getIssuerInvoices(address)**
- Returns all invoice IDs created by an address

**getPayerInvoices(address)**
- Returns all invoice IDs for a payer address

**getTotalInvoices()**
- Returns total number of invoices created

## Invoice Statuses

- **Pending**: Invoice created, awaiting payment
- **Paid**: Invoice has been paid successfully
- **Cancelled**: Invoice was cancelled by issuer
- **Overdue**: Invoice past due date and still unpaid

## API Endpoints

### GET `/api/invoices`
Query parameters:
- `address`: User wallet address
- `type`: "issued" or "received"

Returns list of invoices for the user.

### POST `/api/invoices`
Create a new invoice record in the database.

### GET `/api/invoices/[id]`
Get details of a specific invoice.

### PATCH `/api/invoices/[id]`
Update invoice status (typically called after on-chain payment).

### GET `/api/invoices/stats`
Query parameters:
- `address`: User wallet address

Returns statistics about issued and received invoices.

## Architecture

### Smart Contracts
- **InvoiceRegistry.sol**: Moonbase Alpha contract managing invoices
- Deployed at: `NEXT_PUBLIC_INVOICE_REGISTRY_ADDRESS`

### Frontend
- **Pages**: `/app/invoices/**`
- **Components**: Using shadcn/ui for modern, accessible UI
- **Web3**: viem + wagmi for blockchain interactions

### Backend
- **Database**: Convex for invoice records and metadata
- **API**: Next.js API routes for CRUD operations
- **Auth**: Session-based authentication via middleware

### Web3 Utilities
- **invoice-contract.ts**: Viem wrappers for contract interactions
- Functions: createNativeInvoice, payNativeInvoice, cancelInvoice, readInvoice

## Testing

1. Connect your wallet to the app
2. Navigate to `/invoices`
3. Click "Create Invoice"
4. Fill in the form with a test payer address
5. Submit and copy the share link
6. Open the share link in another browser with the payer wallet
7. Pay the invoice
8. Verify the transaction on Moonbase Moonscan

## Security Considerations

- All invoice amounts stored as strings to preserve precision
- ReentrancyGuard on payment functions
- Address validation before contract interactions
- Session-based authentication for all invoice pages
- Transaction receipts stored for verification

## Future Enhancements

- ERC20 token invoices
- Recurring invoices
- Invoice templates
- DKG proof integration
- Multi-signature invoices
- Partial payments
- Invoice escrow

## Troubleshooting

### Contract not deployed
- Check that `NEXT_PUBLIC_INVOICE_REGISTRY_ADDRESS` is set
- Verify the address is not `0x0000000000000000000000000000000000000000`

### Transaction failing
- Ensure you have enough DEV for gas
- Check the invoice amount matches exactly
- Verify the invoice is still in Pending status

### Invoice not appearing
- Wait for Convex to sync (usually < 1 second)
- Refresh the page
- Check browser console for errors

## Support

For issues or questions:
- Check the smart contract on Moonbase Moonscan
- Review Convex dashboard for database records
- Inspect API responses in browser dev tools
- Check logs in the deployment console

---

**VeriVenture Invoice System**
Built with Next.js, Solidity, Convex, and viem
