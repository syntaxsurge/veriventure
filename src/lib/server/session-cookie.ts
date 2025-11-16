import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
} from "@/lib/constants/auth";
import { signSession, verifySession } from "@/lib/auth/session";

const ONE_DAY_MS = SESSION_MAX_AGE_MS;

export async function createSession(address: string) {
  const expiresAt = new Date(Date.now() + ONE_DAY_MS);
  const token = await signSession({
    address,
    expires: expiresAt.toISOString(),
  });
  const isProd = process.env.NODE_ENV === "production";
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSession() {
  const cookieValue = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!cookieValue) return null;
  try {
    return await verifySession(cookieValue);
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}
