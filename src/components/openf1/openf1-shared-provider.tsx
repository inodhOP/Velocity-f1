"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { OPENF1_PROXY_PREFIX } from "@/lib/openf1/constants";
import type { OpenF1Driver, OpenF1Session } from "@/lib/openf1/types";

type ApiMeta = { source?: string; error?: string };

type OpenF1SharedState = {
  sessions: OpenF1Session[];
  drivers: OpenF1Driver[];
  sessionKey: number | null;
  driverA: number | null;
  driverB: number | null;
  activeSession: OpenF1Session | null;
  status: {
    sessions: "idle" | "loading" | "done" | "error";
    drivers: "idle" | "loading" | "done" | "error";
  };
  loadMeta: {
    sessions?: ApiMeta;
    drivers?: ApiMeta;
  };
  setSessionKey: (sessionKey: number | null) => void;
  setDriverA: (driverNumber: number | null) => void;
  setDriverB: (driverNumber: number | null) => void;
  reloadSessions: () => Promise<void>;
};

const OpenF1SharedContext = createContext<OpenF1SharedState | null>(null);
const STORAGE_KEY = "velocity-f1:shared-selection";

function readPersistedSelection() {
  if (typeof window === "undefined") {
    return { sessionKey: null, driverA: null, driverB: null };
  }
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as {
      sessionKey?: number | null;
      driverA?: number | null;
      driverB?: number | null;
    };
    return {
      sessionKey: Number.isFinite(parsed.sessionKey) ? Number(parsed.sessionKey) : null,
      driverA: Number.isFinite(parsed.driverA) ? Number(parsed.driverA) : null,
      driverB: Number.isFinite(parsed.driverB) ? Number(parsed.driverB) : null,
    };
  } catch {
    return { sessionKey: null, driverA: null, driverB: null };
  }
}

export function OpenF1SharedProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<OpenF1Session[]>([]);
  const [drivers, setDrivers] = useState<OpenF1Driver[]>([]);
  const [sessionKey, setSessionKey] = useState<number | null>(null);
  const [driverA, setDriverA] = useState<number | null>(null);
  const [driverB, setDriverB] = useState<number | null>(null);
  const [loadMeta, setLoadMeta] = useState<{ sessions?: ApiMeta; drivers?: ApiMeta }>({});
  const [status, setStatus] = useState<{
    sessions: "idle" | "loading" | "done" | "error";
    drivers: "idle" | "loading" | "done" | "error";
  }>({
    sessions: "loading",
    drivers: "idle",
  });

  useEffect(() => {
    const persisted = readPersistedSelection();
    setSessionKey(persisted.sessionKey);
    setDriverA(persisted.driverA);
    setDriverB(persisted.driverB);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ sessionKey, driverA, driverB }),
    );
  }, [sessionKey, driverA, driverB]);

  const reloadSessions = useCallback(async () => {
    setStatus((prev) => ({ ...prev, sessions: "loading" }));
    try {
      const res = await fetch(`${OPENF1_PROXY_PREFIX}/sessions`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Sessions ${res.status}`);
      const json = await res.json();
      const list: OpenF1Session[] = json.sessions ?? [];
      setSessions(list);
      setLoadMeta((prev) => ({ ...prev, sessions: json.meta }));
      setSessionKey((prev) => {
        if (prev != null && list.some((s) => s.session_key === prev)) return prev;
        return list[0]?.session_key ?? null;
      });
      setStatus((prev) => ({ ...prev, sessions: "done" }));
    } catch {
      setStatus((prev) => ({ ...prev, sessions: "error" }));
    }
  }, []);

  useEffect(() => {
    void reloadSessions();
  }, [reloadSessions]);

  useEffect(() => {
    if (sessionKey == null) return;
    let cancelled = false;
    (async () => {
      setStatus((prev) => ({ ...prev, drivers: "loading" }));
      try {
        const res = await fetch(
          `${OPENF1_PROXY_PREFIX}/drivers?session_key=${sessionKey}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error(`Drivers ${res.status}`);
        const json = await res.json();
        const list: OpenF1Driver[] = json.drivers ?? [];
        if (cancelled) return;
        setDrivers(list);
        setLoadMeta((prev) => ({ ...prev, drivers: json.meta }));
        setDriverA((prev) => {
          if (prev != null && list.some((d) => d.driver_number === prev)) return prev;
          return list[0]?.driver_number ?? null;
        });
        setDriverB((prev) => {
          if (prev != null && list.some((d) => d.driver_number === prev)) return prev;
          return list[1]?.driver_number ?? list[0]?.driver_number ?? null;
        });
        setStatus((prev) => ({ ...prev, drivers: "done" }));
      } catch {
        if (!cancelled) setStatus((prev) => ({ ...prev, drivers: "error" }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionKey]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.session_key === sessionKey) ?? null,
    [sessions, sessionKey],
  );

  const value = useMemo<OpenF1SharedState>(
    () => ({
      sessions,
      drivers,
      sessionKey,
      driverA,
      driverB,
      activeSession,
      status,
      loadMeta,
      setSessionKey,
      setDriverA,
      setDriverB,
      reloadSessions,
    }),
    [
      sessions,
      drivers,
      sessionKey,
      driverA,
      driverB,
      activeSession,
      status,
      loadMeta,
      reloadSessions,
    ],
  );

  return <OpenF1SharedContext.Provider value={value}>{children}</OpenF1SharedContext.Provider>;
}

export function useOpenF1SharedState() {
  const context = useContext(OpenF1SharedContext);
  if (!context) {
    throw new Error("useOpenF1SharedState must be used within OpenF1SharedProvider");
  }
  return context;
}
