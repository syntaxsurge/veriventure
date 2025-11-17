"use client";

import { useCallback, useEffect, useState } from "react";

type SessionResponse = {
  address: string | null;
  handle: string | null;
};

export const SESSION_EVENT_NAME = "veriventure:session-updated";

export function useSessionAddress() {
  const [address, setAddress] = useState<string | null>(null);
  const [handle, setHandle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });
      if (!response.ok) {
        setAddress(null);
        setHandle(null);
        return;
      }
      const payload = (await response.json()) as SessionResponse;
      setAddress(payload.address);
      setHandle(payload.handle ?? null);
    } catch {
      setAddress(null);
      setHandle(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const handler = () => {
      void refresh();
    };
    window.addEventListener(SESSION_EVENT_NAME, handler);
    return () => window.removeEventListener(SESSION_EVENT_NAME, handler);
  }, [refresh]);

  return { address, handle, loading, refresh };
}
