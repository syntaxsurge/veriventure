import { blake2b } from "@noble/hashes/blake2b";

const encoder = new TextEncoder();

export type MerkleSibling = {
  position: "left" | "right";
  hash: string;
};

export type MerkleProof = {
  leafHash: string;
  siblings: MerkleSibling[];
};

type LeafInput<T> = {
  id: string;
  payload: T;
};

type MerkleNode = {
  id: string;
  hash: string;
};

function hashPayload(payload: unknown) {
  const canonical = JSON.stringify(payload);
  const bytes = encoder.encode(canonical);
  const digest = blake2b(bytes, { dkLen: 32 });
  return `0x${Buffer.from(digest).toString("hex")}`;
}

function hashPair(left: string, right: string) {
  const concatenated = `${left}${right}`;
  const bytes = encoder.encode(concatenated);
  const digest = blake2b(bytes, { dkLen: 32 });
  return `0x${Buffer.from(digest).toString("hex")}`;
}

export function buildMerkleTree<T>(leaves: LeafInput<T>[]) {
  if (leaves.length === 0) {
    throw new Error("Cannot build a Merkle tree with zero leaves.");
  }

  const sortedLeaves = [...leaves].sort((a, b) => a.id.localeCompare(b.id));
  let currentLayer: MerkleNode[] = sortedLeaves.map((leaf) => ({
    id: leaf.id,
    hash: hashPayload(leaf.payload),
  }));

  const proofs: Record<string, MerkleProof> = {};
  for (const node of currentLayer) {
    proofs[node.id] = { leafHash: node.hash, siblings: [] };
  }

  while (currentLayer.length > 1) {
    const nextLayer: MerkleNode[] = [];

    for (let i = 0; i < currentLayer.length; i += 2) {
      const left = currentLayer[i];
      const explicitRight = currentLayer[i + 1];
      const right = explicitRight ?? currentLayer[i];

      const parentHash = hashPair(left.hash, right.hash);
      nextLayer.push({
        id: `${left.id}|${right.id}`,
        hash: parentHash,
      });

      proofs[left.id].siblings.push({ position: "right", hash: right.hash });
      if (explicitRight) {
        proofs[right.id].siblings.push({ position: "left", hash: left.hash });
      }
    }

    currentLayer = nextLayer;
  }

  const root = currentLayer[0]?.hash ?? "";
  return { root, proofs };
}
