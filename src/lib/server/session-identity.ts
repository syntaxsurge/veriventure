import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { getSession } from "@/lib/server/session-cookie";

export type SessionIdentity = {
  address: string | null;
  handle: string | null;
};

export async function getSessionIdentity(): Promise<SessionIdentity> {
  const session = await getSession();
  if (!session?.address) {
    return { address: null, handle: null };
  }

  try {
    const handleRecord = await fetchQuery(api.handles.getHandleByAddress, {
      ownerAddress: session.address,
    });
    return {
      address: session.address,
      handle: handleRecord?.handle ?? null,
    };
  } catch (error) {
    console.error("Failed to fetch session handle", error);
    return { address: session.address, handle: null };
  }
}
