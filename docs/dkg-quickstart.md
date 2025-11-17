# OriginTrail DKG + Docker Guide

This guide distills the official OriginTrail documentation into the exact steps required to wire VeriVenture to the public NeuroWeb testnet and, if needed, to run your own Edge Node alongside the project's Dockerized web app.

## 1. Use the public NeuroWeb DKG node

Set the following values in both `.env` and `.env.example`:

```bash
DKG_NODE_ENDPOINT=https://v6-pegasus-node-02.origin-trail.network
DKG_NODE_PORT=8900
DKG_NODE_API_VERSION=/v1
DKG_BLOCKCHAIN_NAME=otp:20430
DKG_BLOCKCHAIN_PRIVATE_KEY=0x<your_neuroweb_private_key>
```

- Endpoint + port map to the public Pegasus V6 testnet nodes published at [OriginTrail's network status page](https://docs.origintrail.io/graveyard/everything/dkg-core-node/run-a-v8-core-node-on-testnet).
- `otp:20430` targets the NeuroWeb testnet chain id, matching the SDK examples in [`dkg.js`](https://github.com/OriginTrail/dkg.js/tree/v8/develop).
- Fund the private key with **MNEURO** (gas) and **TRAC** (publishing fee) using the Discord faucet commands documented in [Test token faucet](https://docs.origintrail.io/dkg-knowledge-hub/useful-resources/test-token-faucet):

```text
!fundme_neuroweb 0xYourWalletAddress
!fundme_neuroweb_trac 0xYourWalletAddress
```

### Health check + publishing commands

After starting the app (`npm run dev` or Docker), verify the node connectivity:

```bash
curl -s http://localhost:3000/api/dkg/health | jq
```

Publish a note via the existing API route (requires an authenticated wallet session):

```bash
curl -X POST http://localhost:3000/api/dkg/notes \
  -H "content-type: application/json" \
  -b "veriventure_session=<session_cookie>" \
  -d '{
    "topic": "Climate impact",
    "summary": "Wikipedia vs Grokipedia diverge on methane trends.",
    "references": ["https://en.wikipedia.org/wiki/Methane" ]
  }'
```

Both endpoints surface the raw DKG response (the latter includes the minted `UAL`).

## 2. Optional: self-host the Edge Node

If you eventually need your own Edge Node, follow the automated installer described in [Get started with the Edge Node boilerplate → Automated setup](https://docs.origintrail.io/graveyard/everything/dkg-edge-node/get-started-with-the-edge-node-boilerplate/automated-setup-with-the-installer):

```bash
# 1. Clone the installer
git clone https://github.com/OriginTrail/edge-node-installer
cd edge-node-installer

# 2. Generate credentials (creates MANAGEMENT, OPERATIONAL, and PUBLISH keys)
cp .env.example .env
npm install ethers && node env-setup.js

# 3. Fund the addresses via faucet (Neuroweb testnet)
!fundme_neuroweb 0xYourOperationalWallet
!fundme_neuroweb_trac 0xYourPublishWallet

# 4. Run the installer (Ubuntu 20.04/22.04/24.04 or macOS)
sudo bash edge-node-installer.sh
```

The script provisions MySQL, Redis, Blazegraph, and the OT Node service, then exposes the stack on:

- `http://localhost` – Edge Node UI (`my_edge_node` / `edge_node_pass` default credentials)
- `:3001` – auth service
- `:3002` – API backend you can point `DKG_NODE_ENDPOINT` at (use HTTPS and port `8900` when exposing it publicly)
- `:5002` – dRAG API
- `:8900` – OT Node HTTP interface consumed by `dkg.js`

Control services with `systemctl` (Linux) or the helper script that ships with the repo:

```bash
sudo ./service-status.sh           # quick health report
sudo systemctl restart otnode      # bounce the OT node only
sudo systemctl restart edge-node-api.service
```

All of the commands above are direct lifts from the official guide so the behavior matches production deployments.

## 3. Dockerize the VeriVenture web app

The repo ships with a multi-stage `Dockerfile` and `docker-compose.yml` so you can run the Next.js workspace anywhere Docker is available:

```bash
# 1. Ensure .env is populated (copy .env.example if needed)
cp .env.example .env    # only if you have not set up .env yet

# 2. Build the image (installs deps + runs next build)
docker compose build

# 3. Launch the container on port 3000 (override with VERIVENTURE_PORT)
docker compose up -d

# 4. Follow logs / stop
docker compose logs -f veriventure
docker compose down
```

Environment variables from `.env` are injected automatically, so the container uses the same OpenAI, Convex, Moonbase, and DKG credentials as `npm run dev`. The image exposes port `3000` internally; change `VERIVENTURE_PORT` in your shell before running `docker compose up` to bind it elsewhere.
