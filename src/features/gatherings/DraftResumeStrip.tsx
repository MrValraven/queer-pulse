import { Collapse } from "../../shared/components/ui/Collapse";
import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import { ActionStrip } from "./ActionStrip";
import {
  draftAgeText,
  type DraftResumeOffer,
  type DraftSaveStatus,
} from "./useCreateGatheringDraft";
import styles from "./CreateGatheringShell.module.css";

/** "Resume your draft?" over the chapters, when a saved draft is waiting.
 *  Both answers remove the strip; the page moves focus to a chapter head. */
export function DraftResumeStrip({
  offer,
  onResume,
  onStartFresh,
}: {
  offer: DraftResumeOffer;
  onResume: () => void;
  onStartFresh: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ActionStrip
      title={t("gatherings:create.v2.draft.resumeTitle")}
      sub={t("gatherings:create.v2.draft.resumeSub", {
        label: offer.label,
        age: draftAgeText(offer.ageMinutes, t),
      })}
      primaryLabel={t("gatherings:create.v2.draft.resume")}
      onPrimary={onResume}
      secondaryLabel={t("gatherings:create.v2.draft.startFresh")}
      onSecondary={onStartFresh}
    />
  );
}

/** The words for one save status that is under way or done. */
function savedIndicatorText(
  status: Exclude<DraftSaveStatus, { kind: "idle" }>,
  t: TFunction,
): string {
  switch (status.kind) {
    case "saving":
      return t("gatherings:create.v2.saved.saving");
    case "saved":
      return t("gatherings:create.v2.saved.label", {
        age: draftAgeText(status.minutesAgo, t),
      });
    case "retrying":
      return t("gatherings:create.v2.saved.retrying");
    case "tooLarge":
      return t("gatherings:create.v2.saved.tooLarge");
    case "notSaved":
      return t("gatherings:create.v2.saved.notSaved");
    case "conflict":
      return t("gatherings:create.v2.saved.conflict");
    default: {
      const unhandledStatus: never = status;
      return unhandledStatus;
    }
  }
}

/** The small "Saving..." / "Saved · just now" line in the page head, read
 *  out politely as it changes. Empty until the first save of the session is
 *  under way. A save that failed or paused takes the problem tone. */
export function SavedIndicator({ status }: { status: DraftSaveStatus }) {
  const { t } = useTranslation();
  const isSaving = status.kind === "saving";
  const isProblem =
    status.kind === "retrying" ||
    status.kind === "tooLarge" ||
    status.kind === "notSaved" ||
    status.kind === "conflict";
  return (
    <div aria-live="polite">
      <Collapse isOpen={status.kind !== "idle"}>
        <div
          className={cx(
            styles.saved,
            isSaving && styles.savedSaving,
            isProblem && styles.savedProblem,
          )}
        >
          <span className={styles.savedDot} aria-hidden />
          {status.kind === "idle" ? null : savedIndicatorText(status, t)}
        </div>
      </Collapse>
    </div>
  );
}
