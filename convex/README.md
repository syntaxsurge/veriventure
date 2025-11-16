# Convex backend

VeriVenture replaces the previous file-backed storage directory with Convex so
badges, documents, and notes stay synchronized across every workspace.

Tables:

- `achievements` – wallet-owned badge metadata + hashes
- `documents` – AI generated artifacts and their checksums
- `notes` – founder research and diligence notes
- `communityNotes` – OriginTrail Community Notes metadata

Functions live alongside the schema:

- `achievements.ts` – `list` and `insert`
- `documents.ts` – `list` and `insert`
- `notes.ts` – `list`, `create`, `update`, `remove`
- `communityNotes.ts` – `list`, `insert`
- `admin.ts` – `truncateAll` helper for `npm run convex:reset`

Run `npm run convex:dev` to launch the Convex CLI locally and regenerate
`convex/_generated/*` when the schema changes.
