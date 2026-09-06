import { FiArrowLeft, FiRefreshCw } from "react-icons/fi";
import {
  Button,
  SegmentedControl,
  Tag,
} from "../../../../shared/components/ui";
import { routes } from "../../../../app/routeMap";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ArticleDraftConflictBanner } from "./ArticleDraftConflictBanner";
import { savedLabelKey } from "./articleSavedLabel";
import type { EditorMode } from "./editorMode";
import type { PublishStatus } from "./PublishRail";
import styles from "../../ArticleEditorPage.module.css";

export type ArticleLiveStatus = "draft" | "scheduled" | "published";

export interface ArticleEditorHeaderProps {
  pieceId: string;
  title: string;
  section: string;
  issueLabel: string;
  /** The save indicator's four inputs. The header renders the label itself
   *  (`savedLabelKey`) because it also owns what the writer does about each
   *  state: the retry button for a failed save, and the blocking banner for a
   *  draft that has moved on. */
  isSavePending: boolean;
  isSaveError: boolean;
  isDirty: boolean;
  hasSaveConflict: boolean;
  /** Retries the last failed autosave. A failed save leaves that content only
   *  in the browser until something else changes. */
  onRetrySave: () => void;
  /** ENG-111. Re-reads the draft out of a save conflict, discarding whatever
   *  this tab had unsaved. Only ever reachable through the banner. */
  isReloadingDraft: boolean;
  onReloadDraft: () => void;
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
 *
 * It renders a fragment, because it owns the whole save-state story: the bar
 * itself, and directly under it the blocking banner for a draft that has
 * moved on underneath this tab (ENG-111). The saved indicator, the retry
 * button and that banner are three faces of one state, so they are derived
 * together here from the four save booleans rather than assembled by the page.
 */
export function ArticleEditorHeader({
  pieceId,
  title,
  section,
  issueLabel,
  isSavePending,
  isSaveError,
  isDirty,
  hasSaveConflict,
  onRetrySave,
  isReloadingDraft,
  onReloadDraft,
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
  const savedLabel = t(
    savedLabelKey({ isSavePending, isSaveError, isDirty, hasSaveConflict }),
  );
  const publishLabel =
    liveStatus !== "draft"
      ? t("magazine:write.header.unpublish")
      : publishStatus === "schedule"
        ? t("magazine:write.publish.scheduleCta")
        : t("magazine:write.header.publish");
  return (
    <>
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
        {isSaveError && (
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
          <Button
            variant="ghost"
            size="sm"
            disabled={sendOnDisabled}
            onClick={onSendOn}
          >
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
      {/* ENG-111. Directly under the sticky bar rather than over the document:
          the writer's text stays visible and copyable, which a full-page
          takeover would hide right before a reload throws it away. */}
      {hasSaveConflict && (
        <ArticleDraftConflictBanner
          onReload={onReloadDraft}
          isReloading={isReloadingDraft}
        />
      )}
    </>
  );
}
