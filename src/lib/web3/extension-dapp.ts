let extensionPromise:
  | Promise<typeof import("@polkadot/extension-dapp")>
  | null = null;

export async function loadExtensionDapp() {
  if (!extensionPromise) {
    extensionPromise = import("@polkadot/extension-dapp");
  }
  return extensionPromise;
}
