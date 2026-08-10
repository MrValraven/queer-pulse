import { FiCheck, FiInfo, FiX } from "react-icons/fi";
import { Button, SegmentedControl } from "../../../../shared/components/ui";
import { cx } from "../../../../shared/lib/cx";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ArticleBlock } from "../../api/pieces.api";
import { buildPublishChecklist, isPublishReady } from "./articlePublishChecklist";
import styles from "../pieceTabs.module.css";

export type PublishStatus = "now" | "schedule" | "issue";

export interface PublishRailProps {
  standfirst: string;
  blocks: ArticleBlock[];
  publishStatus: PublishStatus;
  onPublishStatusChange: (status: PublishStatus) => void;
  onPublish: () => void;
}

/**
 * The publish rail: a Now/Schedule/With-issue seg plus the "before it
 * ships" checklist (`buildPublishChecklist` — shared with the page header's
 * own Publish button so the two never disagree). Ported from the design
 * prototype's publish rail (`mag-write.jsx`). Publish stays disabled while
 * any REQUIRED item is open — the two informational items never block it.
 */
export function PublishRail({
  standfirst,
  blocks,
  publishStatus,
  onPublishStatusChange,
  onPublish,
}: PublishRailProps) {
  const { t } = useTranslation();
  const checklist = buildPublishChecklist(standfirst, blocks, t);
  const doneCount = checklist.filter((item) => item.done).length;

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
        onChange={(value) => onPublishStatusChange(value as PublishStatus)}
        fullWidth
      />

      {publishStatus === "schedule" && (
        <p className={styles.tiny}>{t("magazine:write.publish.scheduleNote")}</p>
      )}
      {publishStatus === "issue" && (
        <p className={styles.tiny}>{t("magazine:write.publish.issueNote")}</p>
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

      <Button variant="plum" disabled={!isPublishReady(checklist)} onClick={onPublish}>
        {t("magazine:write.publish.cta")}
      </Button>
    </div>
  );
}
