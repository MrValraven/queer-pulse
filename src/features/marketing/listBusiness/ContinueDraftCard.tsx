import { useId } from "react";
import { FiTrash2 } from "react-icons/fi";
import { Button, IconButton } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { relativeAgo } from "../../../shared/lib/relativeAgo";
import { draftStepLineArgs } from "./draftProgress";
import styles from "./ContinueDraftsScreen.module.css";

/** One unfinished draft as the Continue screen shows it. */
export interface ContinueDraftItem {
  id: string;
  /** The place name typed so far; blank shows "Untitled listing". */
  name: string;
  /** The wizard step it reached. Clamped for display. */
  step: number;
  /** ISO 8601 time of its last save. */
  savedAtIso: string;
}

const SAVED_AGO_KEYS = {
  justNow: "marketing:listBusiness.drafts.savedJustNow",
  unknown: "marketing:listBusiness.drafts.savedUnknown",
};

/** One draft: name, how far it got, when it was saved, delete and Continue.
 *  Both buttons are described by the card's name, so a screen reader moving
 *  through several cards hears which draft each one acts on. */
export function ContinueDraftCard({
  draft,
  isPrimary,
  isResuming,
  isBusy,
  onContinue,
  onDelete,
}: {
  draft: ContinueDraftItem;
  isPrimary: boolean;
  isResuming: boolean;
  isBusy: boolean;
  onContinue: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const nameId = useId();
  const { number, total, labelKey } = draftStepLineArgs(draft.step);
  const typedName = draft.name.trim();
  const isUntitled = typedName === "";
  const savedWhen = relativeAgo(draft.savedAtIso, t, fmt, SAVED_AGO_KEYS);
  return (
    <article
      className={[
        styles.card,
        isPrimary ? styles.cardPrimary : styles.cardQuiet,
      ].join(" ")}
      aria-labelledby={nameId}
    >
      <h3
        id={nameId}
        className={[styles.name, isUntitled && styles.nameUntitled]
          .filter(Boolean)
          .join(" ")}
      >
        {isUntitled ? t("marketing:listBusiness.drafts.untitled") : typedName}
      </h3>
      <p className={styles.step}>
        {t("marketing:listBusiness.wizard.stepOf", {
          number,
          total,
          label: t(labelKey),
        })}
      </p>
      <div className={styles.track} aria-hidden>
        <div
          className={styles.fill}
          style={{ width: `${(number / total) * 100}%` }}
        />
      </div>
      <p className={styles.saved}>
        {t("marketing:listBusiness.drafts.saved", { when: savedWhen })}
      </p>
      <IconButton
        className={styles.delete}
        aria-label={t("marketing:listBusiness.drafts.delete")}
        aria-describedby={nameId}
        onClick={onDelete}
        disabled={isBusy}
      >
        <FiTrash2 aria-hidden />
      </IconButton>
      <Button
        variant={isPrimary ? "primary" : "soft"}
        className={styles.continue}
        aria-describedby={nameId}
        data-draft-continue={draft.id}
        onClick={onContinue}
        disabled={isBusy}
      >
        {isResuming
          ? t("marketing:listBusiness.drafts.resuming")
          : t("marketing:listBusiness.drafts.continue")}
      </Button>
    </article>
  );
}
