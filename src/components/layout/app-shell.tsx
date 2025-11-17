import { getSession } from "@/lib/server/session-cookie";
import { AppShellLayout, type AppShellBaseProps } from "./app-shell.client";

export type AppShellProps = AppShellBaseProps;

export async function AppShell(props: AppShellProps) {
  const session = await getSession();
  return <AppShellLayout {...props} address={session?.address ?? null} />;
}
