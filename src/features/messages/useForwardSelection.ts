import { useCallback, useMemo, useState } from "react";
import type { Conversation } from "./data";

/** WhatsApp-style forward cap: at most this many recipients per send, across
 *  BOTH the People and Groups sections combined. */
export const MAX_FORWARD_RECIPIENTS = 5;

export interface ForwardSelection {
  selected: Conversation[];
  isSelected: (id: string) => boolean;
  isAtCap: boolean;
  toggle: (recipient: Conversation) => void;
  remove: (id: string) => void;
  /** Narrows the selection down to exactly the given ids. Used after a
   *  partial send failure, so only the recipients that actually failed stay
   *  selected, ready for a one-tap retry. */
  keepOnly: (ids: Set<string>) => void;
}

/**
 * Multi-select state for `ForwardPickerModal`: which recipients are picked,
 * capped at `MAX_FORWARD_RECIPIENTS`, and the post-failure narrowing that
 * powers its retry flow. Extracted purely to keep the modal component under
 * the line cap; it owns no data of its own beyond the selection itself.
 */
export function useForwardSelection(): ForwardSelection {
  const [selected, setSelected] = useState<Conversation[]>([]);

  const selectedIds = useMemo(
    () => new Set(selected.map((recipient) => recipient.id)),
    [selected],
  );

  const toggle = useCallback((recipient: Conversation) => {
    setSelected((current) => {
      if (current.some((existing) => existing.id === recipient.id)) {
        return current.filter((existing) => existing.id !== recipient.id);
      }
      if (current.length >= MAX_FORWARD_RECIPIENTS) return current;
      return [...current, recipient];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setSelected((current) => current.filter((existing) => existing.id !== id));
  }, []);

  const keepOnly = useCallback((ids: Set<string>) => {
    setSelected((current) =>
      current.filter((existing) => ids.has(existing.id)),
    );
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  return {
    selected,
    isSelected,
    isAtCap: selected.length >= MAX_FORWARD_RECIPIENTS,
    toggle,
    remove,
    keepOnly,
  };
}
