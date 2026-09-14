import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./BoardSection.module.css";

/**
 * The card's closing strip: the expiry rule in plain words, and, for the
 * owner, a way to write a new post.
 *
 * `visibleCount` is what THIS viewer can see, which is why it is passed in
 * rather than read off the profile: expired posts show to the owner alone, so
 * owner and visitor legitimately see different totals. It isn't rendered yet
 * (see the doc comment below), but stays in the signature because both the
 * header's count pill and this strip will need it once a board page exists.
 *
 * A "See all N" link through to the full board is deliberately omitted: the
 * public board at `/work/offer` is flagged coming-soon and renders an empty
 * state in live mode, so a link there would only ever lead somewhere inert.
 */
export function BoardFooterStrip({
  isSelf,
  onEditBoard,
}: {
  visibleCount: number;
  isSelf: boolean;
  onEditBoard?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.footerStrip}>
      <span className={styles.footerRule}>
        {t("members:content.board.footerRule")}
      </span>
      <div className={styles.footerActions}>
        {isSelf && onEditBoard && (
          <Button variant="ghost" size="sm" onClick={onEditBoard}>
            {t("members:content.board.postToBoard")}{" "}
            <FiArrowRight size={14} aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
