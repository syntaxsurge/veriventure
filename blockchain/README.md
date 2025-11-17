# VeriVenture – Moonbase Alpha Contracts

This folder hosts the Solidity version of VeriVenture's soulbound credential registry.
It mirrors the Hardhat layout used in the AIPenGuild and Push Campus repos so the
Moonbase Alpha tooling (Hardhat + RainbowKit + Moonbeam RPCs) stays consistent.

## Requirements

- Node 20+
- `npm install` from this folder to grab Hardhat + toolbox
- `.env` file populated with:
  - `MOONBASE_RPC_NETWORK=https://rpc.testnet.moonbeam.network`
  - `PRIVATE_KEY=0x4777e4060466e23792e80ebd9cd3df92664026f950e224a77dfca86fe9f38b69`

(Values align with the AIPenGuild setup so deployments line up across projects.)

## Scripts

```bash
npm run compile          # hardhat compile
npm run deploy:moonbase  # deploy scripts/deployValidity.ts --network moonbase
npm run deploy:local     # deploy to the local Hardhat node
```

Deployment logs are appended to `deployment.log` for quick reference so the frontend can
pick up the fresh address.

## Contract summary

`contracts/ValidityRegistry.sol` is a minimal Ownable registry:
- `mint(address holder, bytes32 hash)` records a BLAKE2b-256 hash for a holder (soulbound).
- `revoke(address holder, bytes32 hash)` deletes the mapping.
- `hasBadge(address, bytes32)` / `countOf(address)` power quick reads for the dashboard.

The Moonbase Alpha RPC and deployer key match the faucet-funded account already used in
AIPenGuild, so you can deploy and immediately reference the same wallet inside RainbowKit.
