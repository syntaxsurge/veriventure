import { MainNavClient } from "./main-nav.client";
import { getSession } from "@/lib/server/session-cookie";

export async function MainNav() {
  const session = await getSession();
  return <MainNavClient address={session?.address ?? null} />;
}
