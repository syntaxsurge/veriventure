"use client";

import { decodeAddress, keccakAsU8a } from "@polkadot/util-crypto";
import { u8aToHex } from "@polkadot/util";

export function accountIdToH160(address: string) {
  const decoded = decodeAddress(address);
  if (decoded.length === 20) {
    return u8aToHex(decoded);
  }
  const hashed = keccakAsU8a(decoded);
  return u8aToHex(hashed.slice(-20));
}
