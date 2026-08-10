import { FiTrash2 } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "../pieceTabs.module.css";

export interface DeckDangerCardProps {
  onDelete: () => void;
  /** `true` for a brand-new, never-saved draft — nothing to delete yet. */
  disabled: boolean;
}

/** The editor's `.erail` danger card: opens the delete-confirm modal. */
export function DeckDangerCard({ onDelete, disabled }: DeckDangerCardProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.card}>
      <h3>{t("magazine:deck.editor.danger.title")}</h3>
      <p className={styles.tiny}>{t("magazine:deck.editor.danger.body")}</p>
      <Button variant="danger" onClick={onDelete} disabled={disabled}>
        <FiTrash2 aria-hidden /> {t("magazine:deck.editor.danger.cta")}
      </Button>
    </div>
  );
}
