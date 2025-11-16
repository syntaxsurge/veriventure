import { SignJWT, jwtVerify } from "jose";
import { serverEnv } from "@/env/server";
import { SESSION_MAX_AGE_MS } from "@/lib/constants/auth";

export type SessionPayload = {
  address: string;
  expires: string;
};

const secretKey = new TextEncoder().encode(serverEnv.AUTH_SECRET);

export async function signSession(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + SESSION_MAX_AGE_MS) / 1000))
    .sign(secretKey);
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, secretKey, {
    algorithms: ["HS256"],
  });
  return payload as SessionPayload;
}
