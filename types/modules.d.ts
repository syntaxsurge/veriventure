declare module "@noble/hashes/blake2b.js" {
  export function blake2b(
    data: Uint8Array,
    options?: { dkLen?: number },
  ): Uint8Array;
}

declare module "@noble/hashes/utils.js" {
  export function bytesToHex(bytes: Uint8Array): string;
}

declare module "dkg.js" {
  export default class DkgClient {
    constructor(config: unknown);
    asset: {
      create(
        dataset: unknown,
        options: {
          epochsNum?: number;
          minimumNumberOfFinalizationConfirmations?: number;
          minimumNumberOfNodeReplications?: number;
        },
      ): Promise<unknown>;
    };
  }
}
