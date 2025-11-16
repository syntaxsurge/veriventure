import { SignJWT, jwtVerify } from "jose";
import { SESSION_MAX_AGE_MS } from "@/lib/constants/auth";

export type SessionPayload = {
  address: string;
  expires: string;
};

const rawSecret = process.env.AUTH_SECRET?.trim();
const secretKey = new TextEncoder().encode(
  rawSecret && rawSecret.length > 0 ? rawSecret : "veriventure-dev-secret",
);

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
