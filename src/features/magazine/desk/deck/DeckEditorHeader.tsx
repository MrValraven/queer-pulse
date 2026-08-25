import { FiArrowLeft } from "react-icons/fi";
import { Button, Tag } from "../../../../shared/components/ui";
import { routes } from "../../../../app/routeMap";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { SlideDeck } from "../../data/decks";
import { DeckPresentButton } from "../../DeckPresentButton";
import { DeckViewer } from "../../DeckViewer";
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
  onPublish: () => void;
}

/**
 * The deck editor's sticky `.ebar` header: back to the desk, the deck title +
 * "Deck · {n} slides" sub-line + a status tag + saved indicator, Save draft,
 * "Make it prose" (opens the convert modal), Present (the real `DeckViewer`
 * in a full-screen takeover), and Publish/Unpublish (gated by the same
 * `deckPublishChecklist` the rail renders). Extracted from `DeckEditorPage`
 * purely to keep that file under the 200-line cap — mirrors the article
 * editor's `ArticleEditorHeader`.
 *
 * Decks have no manual-save-only mode in the design brief's chrome list, but
 * unlike the article editor there's no autosave debounce here — dropping
 * Save would silently break persistence, so it stays, styled into the same
 * `.right` action group as Present/Publish.
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
  onPublish,
}: DeckEditorHeaderProps) {
  const { t } = useTranslation();
  const clampedIndex = Math.min(index, Math.max(deck.slides.length - 1, 0));

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
        {published
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
            : t("magazine:deck.editor.publish")}
        </Button>
      </div>
    </div>
  );
}
