import { FiTrash2 } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "../pieceTabs.module.css";

/**
 * Why deletion is unavailable right now, or `null` when it is available.
 * ENG-112 — the server refuses both of these with a 409; the card names the
 * next step instead of letting the editor find out from a failed confirm.
 */
export type DeckDeleteBlock = "published" | "linked" | null;

export interface DeckDangerCardProps {
  onDelete: () => void;
  /** `true` for a brand-new, never-saved draft — nothing to delete yet. */
  disabled: boolean;
  blockedReason: DeckDeleteBlock;
}

/**
 * The editor's `.erail` danger card: opens the delete-confirm modal.
 *
 * ENG-112 — deleting a deck used to be one confirm away whatever state it
 * was in, including live and including one a desk piece still pointed at.
 * The server now refuses both, and this card refuses them a step earlier so
 * the editor reads the reason before pressing anything.
 */
export function DeckDangerCard({
  onDelete,
  disabled,
  blockedReason,
}: DeckDangerCardProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.card}>
      <h3>{t("magazine:deck.editor.danger.title")}</h3>
      <p className={styles.tiny}>
        {blockedReason === "published"
          ? t("magazine:deck.editor.danger.blockedPublished")
          : blockedReason === "linked"
            ? t("magazine:deck.editor.danger.blockedLinked")
            : t("magazine:deck.editor.danger.body")}
      </p>
      <Button
        variant="danger"
        onClick={onDelete}
        disabled={disabled || blockedReason !== null}
      >
        <FiTrash2 aria-hidden /> {t("magazine:deck.editor.danger.cta")}
      </Button>
    </div>
  );
}
