"use client";

import { useCallback, useEffect, useState } from "react";

type SessionResponse = {
  address: string | null;
};

export const SESSION_EVENT_NAME = "veriventure:session-updated";

export function useSessionAddress() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });
      if (!response.ok) {
        setAddress(null);
        return;
      }
      const payload = (await response.json()) as SessionResponse;
      setAddress(payload.address);
    } catch {
      setAddress(null);
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

  return { address, loading, refresh };
}
