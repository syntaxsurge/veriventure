"use server";

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, getSession } from "@/lib/server/session-store";

export async function getAuthenticatedAddress() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) {
    return null;
  }
  const record = getSession(sessionCookie.value);
  if (!record) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }
  return record.address;
}
