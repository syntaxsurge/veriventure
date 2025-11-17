import { getSessionIdentity } from "@/lib/server/session-identity";
import { AppShellLayout, type AppShellBaseProps } from "./app-shell.client";

export type AppShellProps = AppShellBaseProps;

export async function AppShell(props: AppShellProps) {
  const session = await getSessionIdentity();
  return (
    <AppShellLayout
      {...props}
      address={session.address}
      handle={session.handle}
    />
  );
}
