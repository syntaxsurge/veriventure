# VeriVenture Blockchain Package — **ink! v6**

This workspace compiles, tests, and deploys the `achievement_badge` ink! contract that powers VeriVenture’s credential hashes. It mirrors the PolkaStamp toolchain so we can reuse the same `.env`, deployment logs, and CLI helpers when targeting **ink-node / Westend** networks.

---

## 📂 Folder Structure

| Path                         | Purpose                                                                  |
| ---------------------------- | ------------------------------------------------------------------------ |
| `contracts/achievement_badge`| ink! soulbound badge contract.                                           |
| `workspace/bin/instantiate.rs` | Rust CLI → builds & instantiates the badge contract on the target chain. |
| `workspace/bin/extract_address.rs` | Helper that parses `cargo contract` logs and prints the deployed address. |
| `deployment.log`             | Auto-updated ledger storing the latest deployed contract address.        |
| `.env` / `.env.example`      | Shared configuration consumed by the CLI when instantiating contracts.   |
| `Cargo.toml`                 | Workspace manifest wiring the contract crate + CLI tooling.              |

---

## 🛠 Prerequisites

1. **Rust stable** via [`rustup`](https://rustup.rs/)
2. **cargo-contract v6**

   ```bash
   cargo install --git https://github.com/use-ink/cargo-contract.git --locked --force
   ```

3. **ink-node** (single-binary Substrate node with the Contracts pallet). Install it from <https://github.com/use-ink/ink-node>.

---

## ⚡ Start a Local Chain

```bash
ink-node --dev -lruntime::revive=debug
```

The node exposes **`ws://127.0.0.1:9944`**. Open the Polkadot/apps UI for account management:
<https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/accounts>

---

## 🔐 Configure Environment

Copy `.env.example` to `.env` (already committed with dev defaults). Update the following keys as needed:

- `POLKADOT_WS_ENDPOINT` – RPC endpoint (defaults to `ws://127.0.0.1:9944`).
- `POLKADOT_SUDO_SEED` – Secret phrase that signs instantiations (defaults to `//Alice`).
- `ADMIN_SS58_ADDRESS` – Wallet that should become the contract owner (converted to H160 for constructor args).
- `PLATFORM_SS58_ADDRESS` – Optional downstream signer (kept for parity with PolkaStamp scripts).

The CLI automatically prints a masked summary before running so you can verify values.

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

## 🧪 Test the Contract

Run Wasm-side unit tests directly inside the contract crate:

```bash
cd contracts/achievement_badge
cargo contract test
```

Clean artifacts with `cargo clean` inside the same directory.

---

## 🔍 Extract an Address from Logs

If you only have a log file (or clipboard text) from a previous deployment, run:

```bash
cargo run --bin extract_address -- deployment.log
# or
cat some.log | cargo run --bin extract_address
```

The helper scans for the first 0x-prefixed 32-byte value and prints it, making it easy to backfill `.env` keys.

---

## 🗝 Deployment Log Keys

| Purpose                 | Key                                   |
| ----------------------- | ------------------------------------- |
| Achievement Badge (H160)| `NEXT_PUBLIC_BADGE_CONTRACT_ADDRESS`  |

`deployment.log` only stores the latest values so secrets aren’t scattered across files.

---

## 🌐 Explorer & Wallet Links

- **Accounts & signing**: <https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/accounts>
- **Explorer example**: <https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/explorer/query/0xd8b6…ab6c>

Happy hacking with **ink! v6 + VeriVenture badges** 🚀
