# VeriVenture

VeriVenture is a Next.js workspace plus an ink! smart-contract package that powers the "wallet-only" entrepreneur trust layer described in the build plan. The project is split into:

- `src/app` – the Next.js application (wallet-only auth already wired in day 1).
- `blockchain/` – ink! v6 contracts and tooling that will be deployed to a Polkadot-compatible environment.

## Quick start

```bash
npm install
npm run dev
```

The web experience runs at [http://localhost:3000](http://localhost:3000). Wallet authentication requires a Substrate-compatible extension (Polkadot.js, SubWallet, Talisman, …).

### Environment variables

Copy `.env.example` to `.env.local` and update the values per your environment:

```bash
cp .env.example .env.local
```

Key sections:

- **Public web config** (`NEXT_PUBLIC_*`): RPC endpoint, contract address, and optional gas hints for `@polkadot/api`.
- **Convex** – `NEXT_PUBLIC_CONVEX_URL` points to your Convex deployment (e.g. `https://veriventure.convex.cloud`). Optionally set `CONVEX_DEPLOYMENT_URL`/`CONVEX_DEPLOYMENT` for CLI tasks and `CONVEX_RESET_TOKEN` for `npm run convex:reset`.
- **OpenAI**: API key plus completion + embedding model overrides for the copilots/embeddings pipeline.
- **Grokipedia**: Optional base URL + user agent for live HTML scraping before falling back to AI synthesis.
- **OriginTrail DKG**: Edge Node endpoint, blockchain signer, and retry options used when publishing Community Notes.

All `NEXT_PUBLIC_*` entries run in the browser (RPC + contract metadata). The remaining values stay on the server so the DKG client can talk to your Edge Node.

## Research + requirement mapping

Real-world pain points and the hackathon alignment matrix are documented in `docs/problem-research.md`. Each item cites a government, multilateral, or academic source (World Bank on SME finance gaps, CISA’s SME cyber guidance, IPCC AR6, Harvard Business Review on AI literacy, and NIST’s AI Risk Management Framework) and maps directly to a VeriVenture feature:

- Wallet-only credentialing + verifiable documents address SME finance and cybersecurity requirements (Hackathon #1/#2).
- Truth Alignment Lab + DKG publishing delivers Hackathon #3’s Grokipedia vs Wikipedia brief.
- AI copilots reuse the same wallet context so entrepreneurs can operate inside one workspace without re-uploading data.

## Key workflows

- **Notes** – `/notes` stores research, diligence calls, and operational to-dos via `/api/notes`. Entries live in the Convex `notes` table so every session stays in sync instantly.
- **Pitch decks & business plans** – `/api/ai/pitch-deck` and `/api/ai/business-plan` ask OpenAI for slide decks or plan sections, then persist them as documents with deterministic checksums.
- **Resume builder** – `/api/ai/resume` leverages OpenAI to package headline, summary, bullet sections, and skill tags. Results are saved as `DocumentRecord` entries of type `resume`.
- **Social autopost studio** – `/api/ai/social-posts` drafts multi-channel campaigns (LinkedIn, Twitter, etc.) and exports CSV schedules while storing the generated posts as documents.
- **Truth Alignment Lab** – `/api/alignment/analyze` calls Wikipedia and Grokipedia, runs embeddings for cosine similarities, and `/api/dkg/notes` publishes Community Notes onto the OriginTrail DKG.
- **Documents vault** – `/documents` lists every AI artifact with metadata, checksum copy actions, and JSON downloads regardless of type (`pitch_deck`, `business_plan`, `resume`, `social_post`). All entries live in Convex `documents`.

## Contracts

The `blockchain` folder is a self-contained Cargo workspace. The first contract (`achievement_badge`) issues non-transferable badge hashes and is built with ink! v6.

```bash
cd blockchain/contracts/achievement_badge
cargo contract build --release
```

> **Heads up:** the current `cargo-contract` (6.0.0-alpha) build on macOS fails during the final PolkaVM link step with `unsupported relocation in data section '.polkavm_exports'`. Compilation succeeds and the artifact is produced up to that link stage. Re-run the command on an environment with the updated linker once Parity releases the fix, or target a Wasm build using a nightly toolchain in the meantime.

### ink! dev loop tips

- Use `cargo contract test` for pure logic/unit tests without the linker pass.
- Run `cargo +stable contract build --release --manifest-path blockchain/contracts/achievement_badge/Cargo.toml` when you only want the badge contract.
- The generated metadata & Wasm artifacts live under `blockchain/target/ink/achievement_badge/`.

### Local deployment

1. Launch an `ink-node` (or any contracts-enabled devnet) locally.
2. Deploy `achievement_badge` via `cargo contract instantiate` or Contracts UI.
3. Copy the instantiated address into `NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS`.
4. Restart the Next.js dev server so the new address is picked up.

### OriginTrail DKG quickstart

1. Install and run an [OriginTrail Edge Node](https://github.com/OriginTrail/edge-node-installer) (default HTTP port `8900`).
2. Set the `DKG_*` variables above, including a private key that can sign on your target chain (Hardhat, NeuroWeb testnet, etc.).
3. Use the **AI Assistant → OriginTrail DKG connection test** card to publish a sample Community Note. Successful UAL output confirms the wiring is correct.

### Convex quickstart

1. Install the Convex CLI (`npm install -g convex`) and authenticate.
2. From the repo root run `npm run convex:deploy` to create/update your deployment.
3. `npm run convex:dev` runs the local Convex dev server (helpful for rapid schema changes).
4. `npm run convex:reset` truncates all tables (requires `CONVEX_RESET_TOKEN` if you set one).

### Further reading

- `docs/problem-research.md` – Evidence-backed problems + the exact VeriVenture feature(s) that solve them.
- Hackathon briefs referenced in the planning document (GEF2025 “AI-Powered Entrepreneur,” Polkadot “Build Resilient Apps,” and OriginTrail “Scaling Trust in the Age of AI”) map 1:1 to the workflows above. The README focuses on the production-ready state—the Agent Playbook remains the canonical architecture reference.
