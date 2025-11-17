# OriginTrail DKG + Docker Guide

This guide distills the official OriginTrail documentation into the exact steps required to wire VeriVenture to the public NeuroWeb testnet.

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

## 2. Checklist recap

- Public DKG only: all publishing happens through `https://v6-pegasus-node-02.origin-trail.network` so no local node or Docker services are needed.
- Keep your NeuroWeb private key in `.env` (server-only). The repo never exposes it to the browser.
- Faucet again whenever the wallet runs low—publishes will fail with `insufficient balance` if you forget.

That’s it. Once the health probe passes and you can mint a note from the Truth Alignment Lab or DKG Tester, the entire OriginTrail flow is production-ready on the public testnet.
