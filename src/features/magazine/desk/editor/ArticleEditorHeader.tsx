import { FiArrowLeft, FiRefreshCw } from "react-icons/fi";
import { Button, SegmentedControl, Tag } from "../../../../shared/components/ui";
import { routes } from "../../../../app/routeMap";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { EditorMode } from "./editorMode";
import type { PublishStatus } from "./PublishRail";
import styles from "../../ArticleEditorPage.module.css";

export type ArticleLiveStatus = "draft" | "scheduled" | "published";

export interface ArticleEditorHeaderProps {
  pieceId: string;
  title: string;
  section: string;
  issueLabel: string;
  savedLabel: string;
  /** True while the last autosave is still unsent because it failed. The
   * retry matters because a failed save leaves that content only in the
   * browser until something else changes. */
  canRetrySave: boolean;
  onRetrySave: () => void;
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  /** Derived from `article.publishedAt` against the clock — `"scheduled"`
   *  (a future `publishedAt`) is never rendered as `"published"`; the whole
   *  point of a real schedule is that the status tag doesn't lie about
   *  whether the piece is actually live yet. */
  liveStatus: ArticleLiveStatus;
  publishStatus: PublishStatus;
  publishPending: boolean;
  publishDisabled: boolean;
  onPublish: () => void;
  sendOnLabel: string;
  sendOnDisabled: boolean;
  onSendOn: () => void;
}

/**
 * The editor's sticky `.ebar` header: back to the piece record, the plain-
 * text title (plain by contract now — see `plainText.ts` — so it is rendered
 * as-is rather than run through a tag stripper) + "Article · {section} · {issue}" sub-line + a status `<Tag>` +
 * saved indicator, the Draft/Shape/Read mode seg, Send on (advances the piece
 * to its next pipeline stage via `moveStage` — disabled once it's already at
 * "Ready", the last stage), and Publish/Schedule/Unpublish — a real action
 * against `article.publishedAt` (mirrors the deck editor's
 * `DeckEditorHeader`), gated on a fresh publish by the same
 * `articlePublishChecklist` the `PublishRail` renders, never gated on
 * unpublishing an already-live or already-scheduled article. Extracted from
 * `ArticleEditorPage` purely to keep that file under the 200-line cap.
 */
export function ArticleEditorHeader({
  pieceId,
  title,
  section,
  issueLabel,
  savedLabel,
  canRetrySave,
  onRetrySave,
  mode,
  onModeChange,
  liveStatus,
  publishStatus,
  publishPending,
  publishDisabled,
  onPublish,
  sendOnLabel,
  sendOnDisabled,
  onSendOn,
}: ArticleEditorHeaderProps) {
  const { t } = useTranslation();
  const publishLabel =
    liveStatus !== "draft"
      ? t("magazine:write.header.unpublish")
      : publishStatus === "schedule"
        ? t("magazine:write.publish.scheduleCta")
        : t("magazine:write.header.publish");
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
        <b>{title.trim() || t("magazine:write.header.untitled")}</b>
        <span className={styles.titleSub}>
          {t("magazine:write.header.subtitle", {
            section: section || t("magazine:write.header.unsectioned"),
            issue: issueLabel,
            saved: savedLabel,
          })}
        </span>
      </div>
      {canRetrySave && (
        <Button variant="ghost" size="sm" onClick={onRetrySave}>
          <FiRefreshCw aria-hidden />
          {t("magazine:write.header.retrySave")}
        </Button>
      )}
      <Tag>
        {liveStatus === "published"
          ? t("magazine:write.header.statusPublished")
          : liveStatus === "scheduled"
            ? t("magazine:write.header.statusScheduled")
            : t("magazine:write.header.statusDraft")}
      </Tag>
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
        <Button
          variant="plum"
          size="sm"
          disabled={publishDisabled || publishPending}
          aria-busy={publishPending}
          onClick={onPublish}
        >
          {publishLabel}
        </Button>
      </div>
    </div>
  );
}
