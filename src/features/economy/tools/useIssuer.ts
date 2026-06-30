import { useCallback, useEffect, useState } from "react";

/** The freelancer's own details, reused across invoice/contract/scope tools. */
export interface Issuer {
  name: string;
  nif: string;
  address: string;
  email: string;
  iban?: string;
}

const STORAGE_KEY = "qp.economy.issuer";

const EMPTY: Issuer = { name: "", nif: "", address: "", email: "", iban: "" };

function load(): Issuer {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...EMPTY, ...(JSON.parse(raw) as Partial<Issuer>) };
  } catch {
    // localStorage unavailable (private mode) — fall through to in-memory.
  }
  return EMPTY;
}

/**
 * Issuer details backed by localStorage so they prefill across all generators.
 * Degrades silently to in-memory state when localStorage is unavailable.
 */
export function useIssuer(): [Issuer, (patch: Partial<Issuer>) => void] {
  const [issuer, setIssuer] = useState<Issuer>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(issuer));
    } catch {
      // Ignore — keep working from in-memory state.
    }
  }, [issuer]);

  const update = useCallback((patch: Partial<Issuer>) => {
    setIssuer((prev) => ({ ...prev, ...patch }));
  }, []);

  return [issuer, update];
}
