import { MainNavClient } from "./main-nav.client";
import { getSessionIdentity } from "@/lib/server/session-identity";

export async function MainNav() {
  const session = await getSessionIdentity();
  return (
    <MainNavClient
      address={session.address}
      handle={session.handle}
    />
  );
}
