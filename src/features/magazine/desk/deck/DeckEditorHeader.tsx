import { FiArrowLeft } from "react-icons/fi";
import { Button, Tag } from "../../../../shared/components/ui";
import { routes } from "../../../../app/routeMap";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { SlideDeck } from "../../data/decks";
import { DeckPresentButton } from "../../DeckPresentButton";
import { DeckViewer } from "../../DeckViewer";
import { isFutureInstant } from "../editor/scheduleValidity";
import styles from "../../DeckEditorPage.module.css";

export interface DeckEditorHeaderProps {
  title: string;
  published: boolean;
  savedLabel: string;
  /** The current draft assembled into a `SlideDeck`, for the Present overlay
   *  — the exact same reader component the published page uses. */
  deck: SlideDeck;
  index: number;
  onIndex: (index: number) => void;
  onSave: () => void;
  savePending: boolean;
  onConvert: () => void;
  publishPending: boolean;
  publishDisabled: boolean;
  /** The stored publish instant. A FUTURE one means the deck is SCHEDULED,
   *  which the status tag says rather than claiming it is already out. */
  publishedAt: string | null;
  /** Whether the rail's timing segment currently reads "Schedule", so this
   *  button and the rail's own button never carry different words for the
   *  same click (PRD-131). */
  isScheduling: boolean;
  onPublish: () => void;
}

/**
 * The deck editor's sticky `.ebar` header: back to the desk, the deck title +
 * "Deck · {n} slides" sub-line + a status tag + saved indicator, Save draft,
 * "Make it prose" (opens the convert modal), Present (the real `DeckViewer`
 * in a full-screen takeover), and Publish/Schedule/Unpublish (gated by the
 * same `isDeckPublishBlocked` the rail uses). Extracted from `DeckEditorPage`
 * purely to keep that file under the 200-line cap — mirrors the article
 * editor's `ArticleEditorHeader`.
 *
 * Save stays alongside autosave (`useDeckAutosave`, PRD-131) rather than
 * being dropped: the FIRST write of a brand-new deck is a create that needs
 * the slug the writer picks, and autosave deliberately does not fire that.
 * It is styled into the same `.right` action group as Present/Publish.
 */
export function DeckEditorHeader({
  title,
  published,
  savedLabel,
  deck,
  index,
  onIndex,
  onSave,
  savePending,
  onConvert,
  publishPending,
  publishDisabled,
  publishedAt,
  isScheduling,
  onPublish,
}: DeckEditorHeaderProps) {
  const { t } = useTranslation();
  const clampedIndex = Math.min(index, Math.max(deck.slides.length - 1, 0));
  // `isFutureInstant` is documented against the `DatePicker` wall-clock
  // shape, but it is a plain `new Date(...)` comparison, so a stored ISO
  // instant answers the same question.
  const isScheduled = isFutureInstant(publishedAt);

  return (
    <div className={styles.ebar}>
      <Button
        variant="ghost"
        size="sm"
        to={routes.magazineEditor}
        aria-label={t("magazine:deck.editor.backToDashboard")}
      >
        <FiArrowLeft aria-hidden />
      </Button>
      <div className={styles.title}>
        <b>{title.trim() || t("magazine:deck.editor.untitled")}</b>
        <span className={styles.titleSub}>
          {t("magazine:deck.editor.header.subtitle", {
            count: deck.slides.length,
          })}
        </span>
      </div>
      <Tag>
        {isScheduled
          ? t("magazine:write.header.statusScheduled")
          : published
            ? t("magazine:editor.decks.statusPublished")
            : t("magazine:editor.decks.statusDraft")}
      </Tag>
      <span className={styles.titleSub}>{savedLabel}</span>
      <div className={styles.right}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          disabled={savePending}
          aria-busy={savePending}
        >
          {t("magazine:deck.editor.saveDraft")}
        </Button>
        <Button variant="ghost" size="sm" onClick={onConvert}>
          {t("magazine:deck.editor.convert")}
        </Button>
        {deck.slides.length > 0 && (
          <DeckPresentButton title={title}>
            <DeckViewer deck={deck} index={clampedIndex} onIndex={onIndex} />
          </DeckPresentButton>
        )}
        <Button
          variant="plum"
          size="sm"
          disabled={publishDisabled || publishPending}
          aria-busy={publishPending}
          onClick={onPublish}
        >
          {published
            ? t("magazine:deck.editor.unpublish")
            : isScheduling
              ? t("magazine:write.publish.scheduleCta")
              : t("magazine:deck.editor.publish")}
        </Button>
      </div>
    </div>
  );
}
