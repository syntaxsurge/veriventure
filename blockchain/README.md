# VeriVenture Blockchain Package — **ink! v5 (Wasm)**

This workspace compiles, tests, and deploys the `achievement_badge` ink! contract that powers VeriVenture’s credential hashes. It targets the stable ink! v5 toolchain and runs on any contracts-enabled Substrate node (local `substrate-contracts-node`, Shibuya, etc.).

---

## 📂 Folder Structure

| Path                              | Purpose                                                                  |
| --------------------------------- | ------------------------------------------------------------------------ |
| `contracts/achievement_badge`     | ink! soulbound badge contract (Wasmtime/Wasm target).                    |
| `workspace/bin/instantiate.rs`    | Rust CLI → builds & instantiates the badge contract on the target chain. |
| `workspace/bin/extract_address.rs`| Helper that parses `cargo contract` logs and prints the deployed address.|
| `deployment.log`                  | Auto-updated ledger storing the latest deployed contract address.        |
| `.env` / `.env.example`           | Shared configuration consumed by the CLI when instantiating contracts.   |
| `Cargo.toml`                      | Workspace manifest wiring the contract crate + CLI tooling.              |

---

## 🛠 Prerequisites (ink! v5)

1. **Rust stable** (`rustup`)
2. **wasm32 target**
3. **cargo-contract 5.x**
4. **substrate-contracts-node 0.42+** for local testing

```bash
rustup default stable
rustup update
rustup target add wasm32-unknown-unknown

cargo install cargo-contract --version ^5.0.0 --locked
cargo install contracts-node --locked
```

> `cargo-contract 5.0.3` is the latest release at the time of writing and is fully compatible with ink! v5.1. `contracts-node` bundles pallet-contracts with sensible defaults for local devnets.

---

## ⚡ Start a Local Chain

```bash
substrate-contracts-node
# RPC: ws://127.0.0.1:9944
```

Connect the Contracts UI (`https://ui.use.ink/`) or Polkadot/apps to that endpoint for key management.

---

## 🔐 Configure Environment

Copy `.env.example` to `.env` inside `blockchain/` and update:

- `POLKADOT_WS_ENDPOINT` – RPC endpoint (defaults to `ws://127.0.0.1:9944`).
- `POLKADOT_SUDO_SEED` – Secret phrase that signs instantiations (defaults to `//Alice`).
- `ADMIN_SS58_ADDRESS` – Wallet that becomes the contract owner (converted to H160 for constructor args).
- `PLATFORM_SS58_ADDRESS` – Optional downstream signer (kept for parity with PolkaStamp scripts).

The instantiate CLI prints a masked summary before running so you can verify values.

---

## 🚀 Instantiate the Achievement Badge Contract

```bash
cargo run --release --bin instantiate_contracts
```

The script:

1. Loads `.env`, prints the resolved WS endpoint + sudo/dev key.
2. Builds `contracts/achievement_badge` via `cargo contract build --release`.
3. Instantiates it on the configured node with `cargo contract instantiate --suri <seed> --args Some(0x…)` so the ADMIN wallet becomes the owner.
4. Parses the `cargo contract` stdout for the deployed address (preferring `0x…` hex, falling back to SS58).
5. Updates/creates `deployment.log` with `NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS=<value>` so frontend `.env` files can be patched quickly.

After a successful run, copy the printed address into the project-root `.env` key `NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS` for the Next.js app.

---

## 🧪 Test & Build the Contract

Run Wasm-side tests directly inside the contract crate:

```bash
cd contracts/achievement_badge
cargo contract test
```

Compile the release artifacts (Wasm + metadata JSON) with:

```bash
cargo contract build --release
# artifacts under target/ink/achievement_badge/
```

---

## 🔍 Extract an Address from Logs

If you only have a log file (or clipboard text) from a previous deployment, run:

```bash
cargo run --bin extract_address -- deployment.log
# or
cat some.log | cargo run --bin extract_address
```

The helper scans for the first `0x…` 32-byte value and prints it, making it easy to backfill `.env` keys.

---

## 🗝 Deployment Log Keys

| Purpose                 | Key                                   |
| ----------------------- | ------------------------------------- |
| Achievement Badge (H160)| `NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS`  |

`deployment.log` only stores the latest values so secrets aren’t scattered across files.

---

## 🌐 Explorer & Wallet Links

- **Contracts UI**: <https://ui.use.ink/>
- **Polkadot/apps**: <https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/contracts>

Happy hacking with **ink! v5 + VeriVenture badges** 🚀
