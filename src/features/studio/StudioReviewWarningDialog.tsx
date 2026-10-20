import { useState } from "react";
import { Button, ChipSelect, Modal, Sending } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CONTENT_WARNINGS } from "../forum/compose/composeWarnings.data";
import type { StudioAdminTrackView } from "./api/studioSafety.adapters";
import {
  STUDIO_CONTENT_WARNING_IDS,
  type StudioContentWarningId,
} from "./api/studioSafety.types";
import css from "./StudioFlagReview.module.css";

const LABEL_KEY_BY_ID = new Map(
  CONTENT_WARNINGS.map((warning) => [warning.id, warning.labelKey]),
);

/** "Add content warning" on a track report: the D7 themes our team has not
 *  added yet. Staff warnings only grow (contract). Mounted per open, so the
 *  pick starts empty. The shared confirm dialog's look, built on `Modal`
 *  so Confirm can wait until at least one theme is picked. */
export function StudioReviewWarningDialog({
  track,
  isPending,
  onConfirm,
  onClose,
}: {
  track: StudioAdminTrackView;
  isPending: boolean;
  onConfirm: (warnings: StudioContentWarningId[]) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const staffSet = new Set<string>(track.staffContentWarnings);
  const options = STUDIO_CONTENT_WARNING_IDS.filter(
    (id) => !staffSet.has(id),
  ).map((id) => ({ value: id, label: t(LABEL_KEY_BY_ID.get(id) ?? id) }));
  const ordered = STUDIO_CONTENT_WARNING_IDS.filter((id) => picked.has(id));
  const hasPick = ordered.length > 0;

  function toggle(id: string) {
    const next = new Set(picked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPicked(next);
  }

  return (
    <Modal
      title={t("studio:flagReviewLive.trackReports.dialog.warningTitle", {
        title: track.title,
      })}
      onClose={onClose}
      footer={
        <div className={css.warningActions}>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            {t("shared:confirmDialog.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (hasPick && !isPending) onConfirm(ordered);
            }}
            disabled={isPending || !hasPick}
            aria-busy={isPending || undefined}
          >
            {isPending ? (
              <Sending
                label={t(
                  "studio:flagReviewLive.trackReports.dialog.warningConfirmPending",
                )}
              />
            ) : (
              t("studio:flagReviewLive.trackReports.dialog.warningConfirm")
            )}
          </Button>
        </div>
      }
    >
      <p className={css.warningDescription}>
        {t("studio:flagReviewLive.trackReports.dialog.warningBody")}
      </p>
      <div className={css.warningPicks}>
        <ChipSelect
          options={options}
          selected={picked}
          onToggle={toggle}
          label={t("studio:contentWarnings.pickerLabel")}
        />
      </div>
    </Modal>
  );
}
