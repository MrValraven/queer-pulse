import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import styles from "./CommunityDetailPage.module.css";

/**
 * Edit a post or reply in place. Shared by the Discussion thread and the Pulse
 * feed, which render the same `community_post` rows and so must offer the same
 * authoring affordances (a Pulse post used to be uneditable purely because
 * this editor lived inside `CommunityThread`).
 */
export function CommunityInlineTextEditor({
  initial,
  isBusy = false,
  onCancel,
  onSave,
}: {
  initial: string;
  /** True while the save is in flight — the editor stays open so a failure
   *  hands the edit back to its author instead of losing it. */
  isBusy?: boolean;
  onCancel: () => void;
  onSave: (next: string) => void;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initial);
  const trimmed = value.trim();
  return (
    <div className={styles.inlineEdit}>
      <MentionTextarea
        className={styles.inlineTa}
        aria-label={t("communities:detail.thread.editAria")}
        value={value}
        onChange={setValue}
        rows={3}
      />
      <div className={styles.inlineActions}>
        <Button
          variant="ghost"
          disabled={isBusy}
          onClick={onCancel}
          style={{ padding: "6px 12px", fontSize: 13 }}
        >
          {t("communities:detail.thread.editCancel")}
        </Button>
        <Button
          variant="primary"
          disabled={isBusy || !trimmed || trimmed === initial}
          onClick={() => onSave(trimmed)}
          style={{ padding: "6px 12px", fontSize: 13 }}
        >
          {isBusy
            ? t("communities:common.loading")
            : t("communities:detail.thread.editSave")}
        </Button>
      </div>
    </div>
  );
}
