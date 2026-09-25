import { useState } from "react";
import { FiAlertTriangle, FiArrowRight } from "react-icons/fi";
import { Button, Modal } from "../../../../../shared/components/ui";
import { useFormat } from "../../../../../shared/i18n/format";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { relativeAgo } from "../../../../../shared/lib/relativeAgo";
import type { RestorableEditDraft } from "../useListingEditorAutosave";
import { RestoreDiffAreaCard } from "./RestoreDiffAreaCard";
import type { RestoreAreaKey, RestoreDiffArea } from "./restoreDiff.types";
import styles from "./RestoreDiff.module.css";

/**
 * The review behind "Bring them back": every change the saved copy would make,
 * grouped by the editor area it lands in, each area with its own tick.
 *
 * Nothing on the form moves until the owner confirms. Every area starts
 * ticked, because the banner's promise was "bring them back" and the usual
 * answer is all of it; the ticks are there for the owner who spots one area
 * where the copy on screen is the one they want to keep.
 *
 * It takes the areas ready-made (the caller runs `buildRestoreDiff`), so it
 * holds no editor state of its own beyond which ticks are on.
 */
export function ListingRestoreReviewModal({
  areas,
  restorable,
  onConfirm,
  onDiscard,
  onClose,
}: {
  areas: RestoreDiffArea[];
  restorable: RestorableEditDraft;
  onConfirm: (areaKeys: ReadonlySet<RestoreAreaKey>) => void;
  onDiscard: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const [tickedKeys, setTickedKeys] = useState<ReadonlySet<RestoreAreaKey>>(
    () => new Set(areas.map((area) => area.key)),
  );
  const when = relativeAgo(
    new Date(restorable.savedAt).toISOString(),
    t,
    formatters,
    {
      justNow: "marketing:listBusiness.editor.restore.justNow",
      unknown: "marketing:listBusiness.editor.restore.unknownWhen",
    },
  );

  const tickedCount = areas.filter((area) => tickedKeys.has(area.key)).length;
  const isEveryAreaTicked = tickedCount === areas.length;
  const isEmpty = areas.length === 0;

  const toggleArea = (areaKey: RestoreAreaKey) =>
    setTickedKeys((previous) => {
      const next = new Set(previous);
      if (next.has(areaKey)) next.delete(areaKey);
      else next.add(areaKey);
      return next;
    });
  const toggleEveryArea = () =>
    setTickedKeys(
      isEveryAreaTicked ? new Set() : new Set(areas.map((area) => area.key)),
    );

  const isNothingTicked = tickedCount === 0;
  let confirmLabel = t(
    "marketing:listBusiness.editor.restore.review.confirmSome",
    { count: tickedCount },
  );
  if (isNothingTicked)
    confirmLabel = t(
      "marketing:listBusiness.editor.restore.review.confirmNone",
    );
  else if (isEveryAreaTicked)
    confirmLabel = t("marketing:listBusiness.editor.restore.review.confirmAll");

  // No note about the areas left out lives here: each unticked card says it
  // itself, so the footer keeps one height and never eats into the list on a
  // small phone.
  const footer = isEmpty ? (
    <div className={styles.footerActions}>
      <Button variant="ghost" className={styles.footerButton} onClick={onClose}>
        {t("marketing:listBusiness.editor.restore.review.closeCta")}
      </Button>
      <Button
        variant="primary"
        className={styles.footerButton}
        onClick={onDiscard}
      >
        {t("marketing:listBusiness.editor.restore.review.discardCta")}
      </Button>
    </div>
  ) : (
    <div className={styles.footerActions}>
      <Button variant="ghost" className={styles.footerButton} onClick={onClose}>
        {t("marketing:listBusiness.editor.restore.review.keepCta")}
      </Button>
      {/* aria-disabled keeps the button in the tab order, so a keyboard user
          reaching it with nothing ticked still hears what it needs. */}
      <Button
        variant="primary"
        className={styles.footerButton}
        aria-disabled={isNothingTicked || undefined}
        onClick={() => {
          if (!isNothingTicked) onConfirm(tickedKeys);
        }}
      >
        {confirmLabel}
      </Button>
    </div>
  );

  return (
    <Modal
      wide
      title={t("marketing:listBusiness.editor.restore.review.title")}
      sub={t("marketing:listBusiness.editor.restore.review.sub", { when })}
      footer={footer}
      onClose={onClose}
    >
      <div className={styles.body}>
        {restorable.hasServerChanged && (
          <p className={styles.warning}>
            <FiAlertTriangle aria-hidden className={styles.warningIcon} />
            <span>
              {t("marketing:listBusiness.editor.restore.serverChanged")}
            </span>
          </p>
        )}
        {isEmpty ? (
          <p className={styles.emptyState}>
            {t("marketing:listBusiness.editor.restore.review.emptyState")}
          </p>
        ) : (
          <>
            <ReviewToolbar
              hasSeveralAreas={areas.length > 1}
              isEveryAreaTicked={isEveryAreaTicked}
              onToggleEveryArea={toggleEveryArea}
            />

            <div className={styles.areas}>
              {areas.map((area) => (
                <RestoreDiffAreaCard
                  key={area.key}
                  area={area}
                  isTicked={tickedKeys.has(area.key)}
                  onToggle={() => toggleArea(area.key)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

/**
 * The key to the whole comparison, with Select all / Clear all on the same
 * row. Struck and red reads as "yours, going away" to most owners, which is
 * right for their own unsaved edits and wrong when the server changed since:
 * then the struck text is newer wording written elsewhere. Naming the two
 * sides once, above every card, keeps both cases honest. It shows even for a
 * single area, since the sides need naming either way.
 */
function ReviewToolbar({
  hasSeveralAreas,
  isEveryAreaTicked,
  onToggleEveryArea,
}: {
  hasSeveralAreas: boolean;
  isEveryAreaTicked: boolean;
  onToggleEveryArea: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.toolbar}>
      <p className={styles.legend}>
        <span className="visuallyHidden">
          {t("marketing:listBusiness.editor.restore.review.legend.spoken")}
        </span>
        <span className={styles.legendVisual} aria-hidden>
          <del className={styles.removedRun}>
            {t("marketing:listBusiness.editor.restore.review.legend.now")}
          </del>
          <FiArrowRight className={styles.arrow} />
          <ins className={styles.addedRun}>
            {t("marketing:listBusiness.editor.restore.review.legend.back")}
          </ins>
        </span>
      </p>
      {hasSeveralAreas && (
        <Button
          variant="ghost"
          size="sm"
          className={styles.toolbarButton}
          onClick={onToggleEveryArea}
        >
          {isEveryAreaTicked
            ? t("marketing:listBusiness.editor.restore.review.clearAll")
            : t("marketing:listBusiness.editor.restore.review.selectAll")}
        </Button>
      )}
    </div>
  );
}
