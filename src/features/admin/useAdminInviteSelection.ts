import { useMemo, useState } from "react";
import {
  ADMIN_INVITE_BULK_CAP,
  type AdminInviteDTO,
} from "./api/adminInvites.api";

/**
 * Select mode on the invite oversight page: whether it is on, and which loaded
 * invites are picked for a bulk action.
 *
 * Selection is held as ids and read back against `loadedInvites`, so the bar
 * always sees each invite's current status, and a card that leaves the list
 * drops out of the count with it. It never grows past
 * {@link ADMIN_INVITE_BULK_CAP}, the most one bulk request may name. The page
 * calls `clearSelection` when the tab or sender changes; leaving select mode
 * clears it here.
 */
export function useAdminInviteSelection(loadedInvites: AdminInviteDTO[]) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const selectedInvites = useMemo(
    () => loadedInvites.filter((invite) => selectedIds.has(invite.id)),
    [loadedInvites, selectedIds],
  );
  const isAtCap = selectedInvites.length >= ADMIN_INVITE_BULK_CAP;
  const isEveryLoadedSelected =
    loadedInvites.length > 0 && selectedInvites.length === loadedInvites.length;

  const clearSelection = () => setSelectedIds(new Set());

  const toggleSelectMode = () => {
    setIsSelectMode((current) => !current);
    clearSelection();
  };

  // Rebuilt from the loaded rows, so ids of cards that already left the list
  // never count toward the cap.
  const toggleInvite = (inviteId: string) =>
    setSelectedIds((current) => {
      const next = new Set(
        loadedInvites
          .map((invite) => invite.id)
          .filter((loadedId) => current.has(loadedId)),
      );
      if (next.has(inviteId)) next.delete(inviteId);
      else if (next.size < ADMIN_INVITE_BULK_CAP) next.add(inviteId);
      return next;
    });

  /** Selects every loaded invite, up to the cap. Returns true when the cap
   *  left some loaded invites out, so the caller can say so. */
  const selectAllLoaded = (): boolean => {
    const loadedIds = loadedInvites.map((invite) => invite.id);
    setSelectedIds(new Set(loadedIds.slice(0, ADMIN_INVITE_BULK_CAP)));
    return loadedIds.length > ADMIN_INVITE_BULK_CAP;
  };

  return {
    isSelectMode,
    toggleSelectMode,
    selectedIds,
    selectedInvites,
    isAtCap,
    isEveryLoadedSelected,
    toggleInvite,
    selectAllLoaded,
    clearSelection,
  };
}

export type AdminInviteSelection = ReturnType<typeof useAdminInviteSelection>;
