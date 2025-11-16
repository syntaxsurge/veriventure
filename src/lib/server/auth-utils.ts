"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/session-cookie";

export async function getAuthenticatedAddress() {
  const record = await getSession();
  return record?.address ?? null;
}

export async function requireAuthenticatedAddress() {
  const address = await getAuthenticatedAddress();
  if (!address) {
    redirect("/");
  }
  return address;
}
