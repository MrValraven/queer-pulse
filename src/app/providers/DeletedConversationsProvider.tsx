import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useDemoMode } from "./DemoModeProvider";
import { DeletedConversationsContext } from "./useDeletedConversations";

const STORAGE_KEY = "qp.demo.deletedConversations";

function readStored(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

/**
 * Session store for "delete conversation for me" in DEMO mode only. In live
 * mode the server owns deletion (DELETE /conversations/:id + read filtering),
 * so nothing writes here and `deletedIds` stays empty. Persisted to
 * localStorage so a demo deletion survives a reload (WhatsApp-like); reset when
 * the "Populate platform" demo toggle flips, since demo deletions are fiction.
 */
export function DeletedConversationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { demoMode } = useDemoMode();
  const [deletedIds, setDeletedIds] = useState<Set<string>>(
    () => new Set(readStored()),
  );

  const [previousDemoMode, setPreviousDemoMode] = useState(demoMode);
  if (previousDemoMode !== demoMode) {
    setPreviousDemoMode(demoMode);
    setDeletedIds(new Set());
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage failures (private mode / quota)
    }
  }

  const markDeleted = useCallback((conversationId: string) => {
    setDeletedIds((previous) => {
      if (previous.has(conversationId)) return previous;
      const next = new Set(previous);
      next.add(conversationId);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // ignore storage failures
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ deletedIds, markDeleted }),
    [deletedIds, markDeleted],
  );

  return (
    <DeletedConversationsContext.Provider value={value}>
      {children}
    </DeletedConversationsContext.Provider>
  );
}
