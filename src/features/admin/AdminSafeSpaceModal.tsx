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
  classifyVisitBarRefusal,
  isBelowVisitBarReasonLongEnough,
  type VisitBarRefusal,
} from "./api/safeSpaceVisitBarError";
import { useHasOpenNomination } from "./api/useHasOpenNomination";
import {
  draftFromSpace,
  draftToInput,
  emptyDraft,
  isBecomingVerified,
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
 *
 * This is also the SECOND door to a safe-space badge, beside the reviewed
 * nomination queue, so it carries the same independent-visit gate the reviewed
 * path carries: a move INTO `verified` for a listing under the bar needs a
 * written exception of at least 20 characters, which lands on the audit trail
 * and forces the public provenance line to state the real visit count. Every
 * other save (unmarking, removing, editing a badge that already stands) is
 * untouched.
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

  const [refusal, setRefusal] = useState<VisitBarRefusal | null>(null);
  const hasOpenNomination = useHasOpenNomination(candidate.ref);

  const isMarkingVerified = isBecomingVerified(
    candidate.safeSpaceStatus,
    draft.status,
  );
  // Mirrors the server rule exactly. Looser hands the moderator an avoidable
  // 400; tighter blocks a legitimate award.
  const isBelowVisitBar = isMarkingVerified && !candidate.visits.hasMetVisitBar;
  const isSaveBlocked =
    isBelowVisitBar &&
    !isBelowVisitBarReasonLongEnough(draft.belowVisitBarReason);

  function updateDraft(patch: Partial<SafeSpaceFormDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function handleSave() {
    const body = draftToInput(draft, isMarkingVerified);
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
        // Branch on the typed `code`, never on the message prose: the two
        // badge-granting endpoints word their refusals differently and neither
        // message is localised. A refusal keeps the modal open with the counts
        // the server returned, so the moderator can write the reason where they
        // already are.
        onError: (error) => {
          const visitBarRefusal = classifyVisitBarRefusal(error);
          setRefusal(visitBarRefusal);
          if (!visitBarRefusal) {
            showToast(t("admin:adminSafeSpaces.modal.saveFailed"), "error");
          }
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
              setSafeSpace.isPending ||
              isWaitingForProfile ||
              hasLoadFailed ||
              isSaveBlocked
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
        <AdminSafeSpaceModalFields
          draft={draft}
          onChange={updateDraft}
          visits={candidate.visits}
          isBelowVisitBar={isBelowVisitBar}
          refusal={refusal}
          hasOpenNomination={hasOpenNomination}
        />
      )}
    </AdminModal>
  );
}
