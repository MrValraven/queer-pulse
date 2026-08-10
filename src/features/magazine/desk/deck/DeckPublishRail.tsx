import { FiCheck, FiInfo, FiX } from "react-icons/fi";
import { Button, SegmentedControl } from "../../../../shared/components/ui";
import { cx } from "../../../../shared/lib/cx";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { DeckDraft } from "../../deckDraft";
import { buildDeckPublishChecklist, isDeckPublishReady } from "./deckPublishChecklist";
import styles from "../pieceTabs.module.css";

export type DeckPublishStatus = "now" | "schedule" | "issue";

export interface DeckPublishRailProps {
  draft: DeckDraft;
  published: boolean;
  /** `false` for a brand-new, never-saved draft — publishing needs a server id. */
  canPublish: boolean;
  publishPending: boolean;
  publishStatus: DeckPublishStatus;
  onPublishStatusChange: (status: DeckPublishStatus) => void;
  onPublish: () => void;
}

/**
 * The deck editor's publish rail: a Now/Schedule/With-issue seg plus the
 * "before it ships" checklist (`buildDeckPublishChecklist` — shared with the
 * page header's own Publish button so the two never disagree). Mirrors the
 * article editor's `PublishRail` shape (`desk/editor/PublishRail.tsx`),
 * reusing its `pieceTabs.module.css` card/ticks styling and generic
 * `write.publish.*` copy.
 *
 * Publish stays disabled while an unpublished draft still has an open
 * required item; unpublishing an already-live deck is never gated by the
 * checklist.
 */
export function DeckPublishRail({
  draft,
  published,
  canPublish,
  publishPending,
  publishStatus,
  onPublishStatusChange,
  onPublish,
}: DeckPublishRailProps) {
  const { t } = useTranslation();
  const checklist = buildDeckPublishChecklist(draft, t);
  const doneCount = checklist.filter((item) => item.done).length;
  const disabled =
    !canPublish || publishPending || (!published && !isDeckPublishReady(checklist));

  return (
    <div className={styles.card}>
      <h3>{t("magazine:write.publish.title")}</h3>
      <SegmentedControl
        label={t("magazine:write.publish.whenLabel")}
        options={[
          { value: "now", label: t("magazine:write.publish.now") },
          { value: "schedule", label: t("magazine:write.publish.schedule") },
          { value: "issue", label: t("magazine:write.publish.withIssue") },
        ]}
        value={publishStatus}
        onChange={(value) => onPublishStatusChange(value as DeckPublishStatus)}
        fullWidth
      />

      {publishStatus !== "now" && (
        <p className={styles.tiny}>{t("magazine:deck.editor.publish.notNowNote")}</p>
      )}

      <div>
        <span className={styles.tiny}>
          {t("magazine:write.publish.checklistHeading", {
            done: doneCount,
            total: checklist.length,
          })}
        </span>
        <ul className={styles.ticks}>
          {checklist.map((item) => (
            <li key={item.id} className={cx(!item.done && item.required && styles.open)}>
              {item.done ? (
                <FiCheck aria-hidden />
              ) : item.required ? (
                <FiX aria-hidden />
              ) : (
                <FiInfo aria-hidden />
              )}
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <Button
        variant="plum"
        disabled={disabled}
        aria-busy={publishPending}
        onClick={onPublish}
      >
        {published ? t("magazine:deck.editor.unpublish") : t("magazine:deck.editor.publish")}
      </Button>
    </div>
  );
}
