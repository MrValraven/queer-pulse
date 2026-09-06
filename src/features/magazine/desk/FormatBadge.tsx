import type { PieceFormat } from "../data/desk.data";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./FormatBadge.module.css";

const VARIANT_CLASS: Record<PieceFormat, string | undefined> = {
  article: styles.article,
  deck: styles.deck,
};

/** The piece-record header already names both formats, so the badge borrows
 *  its copy rather than carrying a second pair of keys saying the same two
 *  words. `FORMAT_LABEL` in `desk.copy.ts` was hardcoded English. */
const FORMAT_LABEL_KEY: Record<PieceFormat, string> = {
  article: "magazine:piece.header.formatArticle",
  deck: "magazine:piece.header.formatDeck",
};

/** Small uppercase badge marking a piece as an article or a slide deck. */
export function FormatBadge({ format }: { format: PieceFormat }) {
  const { t } = useTranslation();
  return (
    <span className={cx(styles.badge, VARIANT_CLASS[format])}>
      {t(FORMAT_LABEL_KEY[format])}
    </span>
  );
}
