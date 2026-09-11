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

/** The small "Saving..." / "Saved · just now" line in the page head. Nothing
 *  until the first save of the session is under way. */
export function SavedIndicator({ status }: { status: DraftSaveStatus }) {
  const { t } = useTranslation();
  if (status.kind === "idle") return null;
  const isSaving = status.kind === "saving";
  return (
    <div className={cx(styles.saved, isSaving && styles.savedSaving)}>
      <span className={styles.savedDot} aria-hidden />
      {status.kind === "saving"
        ? t("gatherings:create.v2.saved.saving")
        : t("gatherings:create.v2.saved.label", {
            age: draftAgeText(status.minutesAgo, t),
          })}
    </div>
  );
}
