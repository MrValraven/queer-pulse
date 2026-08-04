import { Link } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useEditorDecks, type EditorDeckRow } from "./api/useEditorDecks";
import { cx } from "../../shared/lib/cx";
import styles from "./EditorDashboardPage.module.css";

/** The "Decks" section: interactive slide-deck pieces, separate from the prose pipeline. */
export function EditorDecksSection() {
  const { t } = useTranslation();
  const { decks, isLoading } = useEditorDecks();

  return (
    <section className={styles.sec}>
      <h2 className={styles.secH2}>
        <span>{t("magazine:editor.decks.title")}</span>
        <span className={styles.ct}>
          {t("magazine:editor.decks.countLabel", { count: decks.length })}
        </span>
      </h2>
      <div className={styles.pieces}>
        {decks.length > 0 && (
          <div className={styles.pieceHead}>
            <span>{t("magazine:editor.decks.columnTitle")}</span>
            <span>{t("magazine:editor.decks.columnSection")}</span>
            <span>{t("magazine:editor.decks.columnStatus")}</span>
            <span />
          </div>
        )}
        {!isLoading && decks.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyMark} />
            <b>{t("magazine:editor.decks.emptyTitle")}</b>
            <span>{t("magazine:editor.decks.emptyBody")}</span>
          </div>
        ) : (
          decks.map((deck) => <DeckRow key={deck.id} deck={deck} />)
        )}
      </div>
      <Button
        variant="primary"
        to={routes.deckEditor}
        className={styles.newDeckBtn}
      >
        {t("magazine:editor.decks.new")}
      </Button>
    </section>
  );
}

function DeckRow({ deck }: { deck: EditorDeckRow }) {
  const { t } = useTranslation();
  const isPublished = deck.status === "published";

  return (
    <div className={styles.pieceRow}>
      <div>
        <div className={styles.pieceTitle}>{deck.title}</div>
      </div>
      <div className={styles.pieceBy}>{deck.section}</div>
      <div>
        <span
          className={cx(
            styles.deckStatus,
            isPublished ? styles.deckStatusPublished : styles.deckStatusDraft,
          )}
        >
          {isPublished
            ? t("magazine:editor.decks.statusPublished")
            : t("magazine:editor.decks.statusDraft")}
        </span>
      </div>
      <div className={styles.pcAct}>
        <Link
          to={`${routes.deckEditor}?id=${deck.id}`}
          className={styles.pieceAction}
        >
          {t("magazine:editor.decks.edit")} <FiEdit2 size={12} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
