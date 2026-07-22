import { useEffect, useRef, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminModal } from "./ui";
import { useSetSafeSpace } from "./api/useSetSafeSpace";
import { useSafeSpace } from "../safety/api/useSafeSpaces";
import type {
  SafeSpaceCandidate,
  SafeSpaceStatus,
} from "./api/adminSafeSpaces.api";
import { AdminSafeSpaceModalFields } from "./AdminSafeSpaceModalFields";
import {
  draftFromSpace,
  draftToInput,
  emptyDraft,
  type SafeSpaceFormDraft,
} from "./adminSafeSpaceModal.utils";
import styles from "./AdminSafeSpaceModal.module.css";

/**
 * Full safe-space profile editor for one listing: status, tier, verifier,
 * re-verified date, subheading, repeatable promises/vouches, and (when
 * removing) a reason. Self-contained: owns its draft state; `useScrollLock`
 * runs inside `AdminModal`, which is only mounted while this modal is open.
 *
 * `setSafeSpace` replaces the ENTIRE `promises`/`vouches` arrays on save —
 * so for a listing that's already `verified`/`removed`, this first loads the
 * listing's current public profile (`useSafeSpace`) and seeds the draft from
 * it. Editing blind from a blank form would silently wipe out promises/
 * vouches the moderator never saw. A brand-new mark (status `none`) has no
 * existing profile to lose, so it skips the fetch and starts blank.
 */
export function AdminSafeSpaceModal({
  candidate,
  onClose,
  onSaved,
}: {
  candidate: SafeSpaceCandidate;
  onClose: () => void;
  onSaved: (status: SafeSpaceStatus) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const setSafeSpace = useSetSafeSpace();

  const hasExistingProfile = candidate.safeSpaceStatus !== "none";
  const { space, isLoading: isProfileLoading } = useSafeSpace(
    hasExistingProfile ? candidate.slug : undefined,
  );

  const [draft, setDraft] = useState<SafeSpaceFormDraft>(() =>
    emptyDraft(candidate),
  );
  // Guards the one-time seed-from-fetched-profile below: `space` settling
  // shouldn't clobber edits the moderator has already started making.
  const hasSeededProfileRef = useRef(false);

  useEffect(() => {
    if (!hasExistingProfile) return;
    if (isProfileLoading) return;
    if (hasSeededProfileRef.current) return;
    hasSeededProfileRef.current = true;
    setDraft(draftFromSpace(candidate, space));
  }, [hasExistingProfile, isProfileLoading, space, candidate]);

  function updateDraft(patch: Partial<SafeSpaceFormDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function handleSave() {
    const body = draftToInput(draft);
    setSafeSpace.mutate(
      { ref: candidate.ref, body },
      {
        onSuccess: (updatedCandidate) => {
          showToast(
            t("admin:adminSafeSpaces.modal.savedToast", {
              name: candidate.name,
            }),
            "success",
          );
          onSaved(updatedCandidate.safeSpaceStatus);
          onClose();
        },
      },
    );
  }

  const isWaitingForProfile = hasExistingProfile && isProfileLoading;
  // `useSafeSpace` collapses every read failure (not just a real 404) down to
  // `space: undefined`. For a brand-new mark that's fine — there was never a
  // profile to lose. For a listing that already HAS a profile, though, a
  // settled fetch with no space is indistinguishable from a transient error,
  // and `setSafeSpace` would happily replace the real promises/vouches with
  // whatever the (blank) draft holds. So block the form and the save instead
  // of trusting a blank draft in that case.
  const hasLoadFailed =
    hasExistingProfile && !isProfileLoading && space === undefined;

  return (
    <AdminModal
      onClose={onClose}
      wide
      eyebrow={t("admin:adminSafeSpaces.modal.eyebrow")}
      title={t("admin:adminSafeSpaces.modal.title", { name: candidate.name })}
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            {t("admin:adminSafeSpaces.modal.cancelCta")}
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={
              setSafeSpace.isPending || isWaitingForProfile || hasLoadFailed
            }
          >
            {setSafeSpace.isPending
              ? t("admin:adminSafeSpaces.modal.savingCta")
              : t("admin:adminSafeSpaces.modal.saveCta")}
          </Button>
        </>
      }
    >
      {isWaitingForProfile ? (
        <p className={styles.hint}>
          {t("admin:adminSafeSpaces.modal.loadingProfile")}
        </p>
      ) : hasLoadFailed ? (
        <p className={styles.hint}>
          {t("admin:adminSafeSpaces.modal.loadFailed")}
        </p>
      ) : (
        <AdminSafeSpaceModalFields draft={draft} onChange={updateDraft} />
      )}
    </AdminModal>
  );
}
