# Blockchain workspace

This directory is the ink! workspace that backs VeriVenture badges. It currently hosts a single contract:

- `contracts/achievement_badge` – mints non-transferable badge hashes keyed by `H160` owners and emits provenance events that the frontend can read.

## Prerequisites

- Rust stable + `cargo`
- [`cargo-contract`](https://github.com/paritytech/cargo-contract) `6.0.0-alpha` or newer
- `wasm32-unknown-unknown` target (rustup) for testing and metadata generation

## Useful commands

```bash
# compile & bundle
cd blockchain/contracts/achievement_badge
cargo contract build --release

# run the Wasm-side unit tests
cargo contract test

# wipe build artifacts
cargo clean
```

If you are targeting Pop/Passet Hub, run the Pop CLI against the compiled `.contract` file located under `blockchain/target/ink/achievement_badge/` once `cargo contract build` finishes.
