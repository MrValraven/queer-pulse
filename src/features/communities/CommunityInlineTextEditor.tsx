import { useRef, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import { CommunityComposerBody } from "./CommunityComposerBody";
import bodyStyles from "./CommunityComposerBody.module.css";
import styles from "./CommunityDetailPage.module.css";

/**
 * Edit a post or reply in place. Shared by the Discussion thread and the Pulse
 * feed, which render the same `community_post` rows and so must offer the same
 * authoring affordances (a Pulse post used to be uneditable purely because
 * this editor lived inside `CommunityThread`).
 *
 * `hasFormatting` gives a post body the composer's toolbar, growing field and
 * Write | Preview switch, since that body was written with them. Replies stay
 * plain text, so they leave it off and keep the plain box.
 */
export function CommunityInlineTextEditor({
  initial,
  isBusy = false,
  onCancel,
  onSave,
  hasFormatting = false,
}: {
  initial: string;
  /** True while the save is in flight. The editor stays open meanwhile, so a
   *  failure hands the edit back to its author with every word intact. */
  isBusy?: boolean;
  onCancel: () => void;
  onSave: (next: string) => void;
  /** Show the markdown-lite toolbar and preview. Off keeps a plain box. */
  hasFormatting?: boolean;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initial);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const trimmed = value.trim();
  const canSave = !isBusy && trimmed.length > 0 && trimmed !== initial;
  return (
    <div className={styles.inlineEdit}>
      {hasFormatting ? (
        <div className={bodyStyles.editBox}>
          <CommunityComposerBody
            textareaRef={textareaRef}
            textareaClassName={bodyStyles.editInput}
            ariaLabel={t("communities:detail.thread.editAria")}
            value={value}
            onChange={setValue}
            onSubmit={() => {
              if (canSave) onSave(trimmed);
            }}
            isToolbarAlwaysShown
          />
        </div>
      ) : (
        <MentionTextarea
          className={styles.inlineTa}
          aria-label={t("communities:detail.thread.editAria")}
          value={value}
          onChange={setValue}
          rows={3}
        />
      )}
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
          disabled={!canSave}
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
