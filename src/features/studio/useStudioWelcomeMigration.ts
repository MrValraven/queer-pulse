import { useEffect } from "react";
import { useSaveStudioWelcome } from "./api/useStudioWelcome";
import {
  clearStudioWelcomeDeviceCopy,
  readLegacyStudioWelcome,
  useStudioTaste,
} from "./studioFirstRunTaste";

/** Members whose device copy was already offered to the account in this page
 *  load. Module level, so a refused upload (or a remount) never loops. */
const migratedMemberIds = new Set<string>();

/** Tests only: a fresh page load. */
export function resetStudioWelcomeMigrationForTests(): void {
  migratedMemberIds.clear();
}

/**
 * Moves a welcome finished on this device before it lived on the account.
 * Once the account answers "not seen" and a valid record of this member is
 * stored here, that record goes up (seen, plus the picks) and the two device
 * keys are removed after the account has it. A refused upload leaves the keys
 * alone and is not tried again until the next page load. When the account
 * already has the welcome, a leftover device copy is simply removed.
 */
export function useStudioWelcomeMigration(): void {
  const { memberId, hasSeenWelcome, welcomeReadState, isAccountBacked } =
    useStudioTaste();
  const { mutate: saveWelcome } = useSaveStudioWelcome({ isSilent: true });

  useEffect(() => {
    if (!isAccountBacked || welcomeReadState !== "ready" || memberId === null)
      return;
    const legacy = readLegacyStudioWelcome(memberId);
    if (legacy === null) return;
    if (hasSeenWelcome) {
      clearStudioWelcomeDeviceCopy();
      return;
    }
    if (migratedMemberIds.has(memberId)) return;
    migratedMemberIds.add(memberId);
    saveWelcome(
      {
        hasSeenWelcome: true,
        genres: [...legacy.genres],
        moods: [...legacy.moods],
      },
      { onSuccess: clearStudioWelcomeDeviceCopy },
    );
  }, [
    isAccountBacked,
    welcomeReadState,
    memberId,
    hasSeenWelcome,
    saveWelcome,
  ]);
}
