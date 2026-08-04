import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DeckViewer } from "./DeckViewer";
import { draftToDeck, type DeckDraft } from "./deckDraft";
import styles from "./DeckEditorPage.module.css";

interface DeckEditorPreviewProps {
  draft: DeckDraft;
}

/**
 * Live "what readers will see" preview: builds a `SlideDeck` from the
 * in-progress draft on every render and hands it to the real `DeckViewer` —
 * the exact component the published reader page uses — so nothing about the
 * preview can drift from the live experience.
 */
export function DeckEditorPreview({ draft }: DeckEditorPreviewProps) {
  const { t } = useTranslation();
  const deck = draftToDeck(draft);
  const [index, setIndex] = useState(0);

  return (
    <div className={styles.previewFrame}>
      {deck.slides.length === 0 ? (
        <p className={styles.previewEmpty}>
          {t("magazine:deck.editor.previewEmpty")}
        </p>
      ) : (
        <DeckViewer
          deck={deck}
          index={Math.min(index, deck.slides.length - 1)}
          onIndex={setIndex}
        />
      )}
    </div>
  );
}
