import { FiArrowLeft } from "react-icons/fi";
import { Button, SegmentedControl } from "../../../../shared/components/ui";
import { routes } from "../../../../app/routeMap";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { stripHtml } from "./articleWordCount";
import type { EditorMode } from "./editorMode";
import styles from "../../ArticleEditorPage.module.css";

export interface ArticleEditorHeaderProps {
  pieceId: string;
  title: string;
  section: string;
  issueLabel: string;
  savedLabel: string;
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  publishDisabled: boolean;
  onPublish: () => void;
  sendOnLabel: string;
  sendOnDisabled: boolean;
  onSendOn: () => void;
}

/**
 * The editor's sticky `.ebar` header: back to the piece record, the plain-
 * text title + "Article · {section} · {issue}" sub-line + saved indicator,
 * the Draft/Shape/Read mode seg, Send on (advances the piece to its next
 * pipeline stage via `moveStage` — disabled once it's already at "Ready",
 * the last stage), and Publish (still a stub — real publishing happens at
 * issue production, disabled by the same `articlePublishChecklist` the
 * `PublishRail` renders). Extracted from `ArticleEditorPage` purely to keep
 * that file under the 200-line cap.
 */
export function ArticleEditorHeader({
  pieceId,
  title,
  section,
  issueLabel,
  savedLabel,
  mode,
  onModeChange,
  publishDisabled,
  onPublish,
  sendOnLabel,
  sendOnDisabled,
  onSendOn,
}: ArticleEditorHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.ebar}>
      <Button
        variant="ghost"
        size="sm"
        to={routes.magazinePiece.replace(":id", pieceId)}
        aria-label={t("magazine:write.header.backAria")}
      >
        <FiArrowLeft aria-hidden />
      </Button>
      <div className={styles.title}>
        <b>{stripHtml(title).trim() || t("magazine:write.header.untitled")}</b>
        <span className={styles.titleSub}>
          {t("magazine:write.header.subtitle", {
            section: section || t("magazine:write.header.unsectioned"),
            issue: issueLabel,
            saved: savedLabel,
          })}
        </span>
      </div>
      <SegmentedControl
        label={t("magazine:write.header.viewLabel")}
        options={[
          { value: "draft", label: t("magazine:write.mode.draft") },
          { value: "shape", label: t("magazine:write.mode.shape") },
          { value: "read", label: t("magazine:write.mode.read") },
        ]}
        value={mode}
        onChange={(value) => onModeChange(value as EditorMode)}
      />
      <div className={styles.right}>
        <Button variant="ghost" size="sm" disabled={sendOnDisabled} onClick={onSendOn}>
          {sendOnLabel}
        </Button>
        <Button variant="plum" size="sm" disabled={publishDisabled} onClick={onPublish}>
          {t("magazine:write.header.publish")}
        </Button>
      </div>
    </div>
  );
}
